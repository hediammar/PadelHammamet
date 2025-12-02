import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  username: string;
  phone_prefix: string;
  phone_number: string;
  name?: string;
  email?: string;
  picture?: string;
  role?: 'player' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signup: (username: string, phonePrefix: string, phoneNumber: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  handleGoogleSuccess: (credentialResponse: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean; // Only for form operations (login/signup), not initial session check
  checkUsernameAvailability: (username: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'Padel Hammamet_user';

// Load user from localStorage
const loadUserFromStorage = (): User | null => {
  // Check if we're in the browser (not SSR)
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading user from storage:', error);
  }
  return null;
};

// Save user to localStorage
const saveUserToStorage = (user: User | null) => {
  // Check if we're in the browser (not SSR)
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error saving user to storage:', error);
  }
};

// Convert Supabase user to app User format
const mapSupabaseUserToAppUser = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
  if (!supabaseUser) return null;
  
  // Fetch user profile from users table
  // Use maybeSingle() to handle cases where profile doesn't exist yet
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('username, phone_prefix, phone_number, name, role')
    .eq('id', supabaseUser.id)
    .maybeSingle();
  
  // If there's an error fetching profile, log it but continue with metadata
  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Error fetching user profile:', profileError);
  }

  // Get username from profile or metadata
  let username = userProfile?.username;
  if (!username) {
    // Try to get from metadata
    username = supabaseUser.user_metadata?.username;
    // If still no username, generate from name or email
    if (!username) {
      const fullName = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '';
      if (fullName) {
        // Use first + last name as username
        const nameParts = fullName.trim().split(/\s+/);
        if (nameParts.length >= 2) {
          username = `${nameParts[0]}${nameParts[nameParts.length - 1]}`.toLowerCase().replace(/[^a-z0-9]/g, '');
        } else {
          username = nameParts[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        }
      } else {
        username = supabaseUser.email?.split('@')[0] || '';
      }
    }
  }

  return {
    id: supabaseUser.id,
    username: username || '',
    phone_prefix: userProfile?.phone_prefix || '+216',
    phone_number: userProfile?.phone_number || '',
    name: userProfile?.name || supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
    email: supabaseUser.email,
    picture: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
    role: userProfile?.role || 'player',
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize user state from localStorage first (for immediate UI update)
  // Then verify with Supabase session
  const [user, setUser] = useState<User | null>(() => {
    // Try to load from localStorage on initial render
    const storedUser = loadUserFromStorage();
    return storedUser;
  });
  // isLoading is ONLY for form operations (login/signup), NOT for initial session check
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing Supabase session on mount and verify it matches localStorage
  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // If session check fails, clear localStorage user
          if (isMounted) {
            setUser(null);
            saveUserToStorage(null);
          }
          return;
        }
        
        if (session?.user) {
          console.log('Session found, restoring user:', session.user.id);
          try {
            const appUser = await mapSupabaseUserToAppUser(session.user);
            if (appUser && isMounted) {
              setUser(appUser);
              saveUserToStorage(appUser);
            }
          } catch (error) {
            console.error('Error mapping user:', error);
            // Fallback: use session metadata directly
            if (isMounted) {
              const fallbackUser: User = {
                id: session.user.id,
                username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '',
                phone_prefix: session.user.user_metadata?.phone_prefix || '+216',
                phone_number: session.user.user_metadata?.phone_number || '',
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
                email: session.user.email,
                picture: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
                role: 'player',
              };
              setUser(fallbackUser);
              saveUserToStorage(fallbackUser);
            }
          }
        } else {
          // No session found - clear user state
          console.log('No session found, clearing user');
          if (isMounted) {
            setUser(null);
            saveUserToStorage(null);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (isMounted) {
          setUser(null);
          saveUserToStorage(null);
        }
      }
    };

    checkSession();
    
    return () => {
      isMounted = false;
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event, 'Session exists:', !!session, 'User ID:', session?.user?.id);
      
      // Handle initial session check and sign-in events
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        console.log('Processing sign-in/initial session for user:', session.user.id);
        try {
          // Handle new Google user - ensure profile exists with username from name
          if (session.user.app_metadata?.provider === 'google') {
            await ensureGoogleUserProfile(session.user);
          }
          
          const appUser = await mapSupabaseUserToAppUser(session.user);
          if (appUser) {
            console.log('User restored successfully:', appUser.username);
            setUser(appUser);
            saveUserToStorage(appUser);
          } else {
            console.warn('Failed to map user, using fallback');
            // Fallback: use session metadata directly
            const fallbackUser: User = {
              id: session.user.id,
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '',
              phone_prefix: session.user.user_metadata?.phone_prefix || '+216',
              phone_number: session.user.user_metadata?.phone_number || '',
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
              email: session.user.email,
              picture: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            };
            setUser(fallbackUser);
            saveUserToStorage(fallbackUser);
          }
        } catch (error) {
          console.error('Error processing auth state change:', error);
          // Even if there's an error, try to set user from session metadata
          if (session.user) {
            const fallbackUser: User = {
              id: session.user.id,
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '',
              phone_prefix: session.user.user_metadata?.phone_prefix || '+216',
              phone_number: session.user.user_metadata?.phone_number || '',
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
              email: session.user.email,
              picture: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            };
            setUser(fallbackUser);
            saveUserToStorage(fallbackUser);
          }
        }
        // Reset loading state after processing
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
        console.log('User signed out or no session');
        setUser(null);
        saveUserToStorage(null);
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Token refreshed - update user if needed
        console.log('Token refreshed for user:', session.user.id);
        try {
          const appUser = await mapSupabaseUserToAppUser(session.user);
          if (appUser) {
            setUser(appUser);
            saveUserToStorage(appUser);
          }
        } catch (error) {
          console.error('Error updating user on token refresh:', error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check username availability
  const checkUsernameAvailability = useCallback(async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle(); // Use maybeSingle instead of single to avoid 406 error

      // If error or no data found, username is available
      if (error) {
        // PGRST116 means no rows found, which means username is available
        if (error.code === 'PGRST116') {
          return true;
        }
        console.error('Error checking username:', error);
        return false;
      }

      // If data exists, username is taken
      return !data;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }, []);

  // Ensure Google user profile exists with proper username from first + last name
  const ensureGoogleUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      // Check if profile already exists with username
      const { data: existingProfile } = await supabase
        .from('users')
        .select('username')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (existingProfile?.username) {
        // Profile already exists with username
        return;
      }

      // Generate username from first + last name
      const fullName = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '';
      let username = '';
      
      if (fullName) {
        const nameParts = fullName.trim().split(/\s+/).filter((part: string) => part.length > 0);
        if (nameParts.length >= 2) {
          // Concatenate first + last name
          const firstName = nameParts[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          const lastName = nameParts[nameParts.length - 1].toLowerCase().replace(/[^a-z0-9]/g, '');
          username = `${firstName}${lastName}`;
        } else if (nameParts.length === 1) {
          username = nameParts[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        }
      }

      // If no username from name, use email prefix
      if (!username) {
        username = supabaseUser.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
      }

      // Ensure username is unique - add numbers if needed
      let finalUsername = username;
      let counter = 1;
      while (true) {
        const { data: existing } = await supabase
          .from('users')
          .select('username')
          .eq('username', finalUsername)
          .maybeSingle();

        if (!existing) {
          break; // Username is available
        }
        finalUsername = `${username}${counter}`;
        counter++;
        if (counter > 1000) break; // Safety limit
      }

      // Upsert user profile
      await supabase
        .from('users')
        .upsert({
          id: supabaseUser.id,
          username: finalUsername,
          email: supabaseUser.email,
          name: fullName || supabaseUser.email?.split('@')[0] || '',
          picture: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
          phone_prefix: '+216',
          phone_number: '',
          provider: 'google',
        }, {
          onConflict: 'id',
        });
    } catch (error) {
      console.error('Error ensuring Google user profile:', error);
    }
  }, []);

  // Google OAuth login handler - use Supabase OAuth directly
  // This replaces the Google cache approach - Supabase handles everything
  // Automatically creates account if new, signs in if existing
  // Note: This redirects to Google, so we don't set isLoading here
  // The auth state change listener will handle setting the user when they return
  const handleGoogleLogin = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${window.location.pathname}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        alert('Failed to sign in with Google. Please try again.');
      }
      // If successful, user will be redirected to Google, then back
      // The auth state change listener will handle setting the user
      // We don't set isLoading here because the page will redirect
    } catch (error) {
      console.error('Google login error:', error);
      alert('Failed to sign in with Google. Please try again.');
    }
  }, []);

  // Legacy handler for GoogleLogin component (deprecated - use handleGoogleLogin instead)
  const handleGoogleSuccess = useCallback(async () => {
    await handleGoogleLogin();
  }, [handleGoogleLogin]);

  // Sign up with username, phone, and password
  const signup = useCallback(async (
    username: string,
    phonePrefix: string,
    phoneNumber: string,
    password: string
  ) => {
    setIsLoading(true);
    try {
      // Check username availability
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }

      // Create auth user with email (Supabase requires email)
      // Use username + phone hash as email to ensure uniqueness and valid format
      // Format: username_phonehash@test.example.com (RFC compliant format)
      // Ensure local part starts with letter and contains only valid characters
      const phonePrefixClean = phonePrefix.replace(/[^0-9]/g, '');
      const phoneHash = `${phonePrefixClean}${phoneNumber}`;
      // Use test.example.com which is a reserved domain for testing (RFC 2606)
      const phoneEmail = `${username.toLowerCase()}_${phoneHash}@test.example.com`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: phoneEmail,
        password: password,
        options: {
          data: {
            username: username.toLowerCase(),
            phone_prefix: phonePrefix,
            phone_number: phoneNumber,
          },
          emailRedirectTo: undefined, // No email confirmation needed
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Create user profile in users table
      // Use upsert in case trigger already created it
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          username: username.toLowerCase(),
          phone_prefix: phonePrefix,
          phone_number: phoneNumber,
          email: phoneEmail,
        }, {
          onConflict: 'id',
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't throw if it's a duplicate - trigger might have created it
        if (!profileError.message.includes('duplicate') && !profileError.code?.includes('23505')) {
          throw profileError;
        }
      }

      // Sign in the user immediately
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: phoneEmail,
        password: password,
      });

      if (signInError) throw signInError;
      if (!signInData.user) throw new Error('Failed to sign in');

      // Immediately update user state after successful signup/login
      // Don't wait for auth state change listener to ensure UI updates right away
      try {
        const appUser = await mapSupabaseUserToAppUser(signInData.user);
        if (appUser) {
          console.log('User signed up and logged in successfully:', appUser.username);
          setUser(appUser);
          saveUserToStorage(appUser);
        } else {
          // Fallback: create user from signup data
          const fallbackUser: User = {
            id: signInData.user.id,
            username: username.toLowerCase(),
            phone_prefix: phonePrefix,
            phone_number: phoneNumber,
            name: username,
            email: phoneEmail,
            picture: signInData.user.user_metadata?.avatar_url || signInData.user.user_metadata?.picture,
            role: 'player',
          };
          setUser(fallbackUser);
          saveUserToStorage(fallbackUser);
        }
      } catch (error) {
        console.error('Error mapping user after signup:', error);
        // Fallback: create user from signup data
        const fallbackUser: User = {
          id: signInData.user.id,
          username: username.toLowerCase(),
          phone_prefix: phonePrefix,
          phone_number: phoneNumber,
          name: username,
          email: phoneEmail,
          picture: signInData.user.user_metadata?.avatar_url || signInData.user.user_metadata?.picture,
        };
        setUser(fallbackUser);
        saveUserToStorage(fallbackUser);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [checkUsernameAvailability]);

  // Login with username and password
  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Find user by username to get their email
      const { data: userData, error: findError } = await supabase
        .from('users')
        .select('email, phone_prefix, phone_number, name, username, role')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (findError || !userData) {
        throw new Error('Invalid username or password');
      }

      // Use the stored email from database
      const email = userData.email;

      // Sign in with the email
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) throw signInError;
      if (!signInData.user) throw new Error('Failed to sign in');

      // Immediately update user state after successful login
      // Don't wait for auth state change listener to ensure UI updates right away
      try {
        const appUser = await mapSupabaseUserToAppUser(signInData.user);
        if (appUser) {
          console.log('User logged in successfully:', appUser.username);
          setUser(appUser);
          saveUserToStorage(appUser);
        } else {
          // Fallback: create user from database data
          const fallbackUser: User = {
            id: signInData.user.id,
            username: userData.username || username.toLowerCase(),
            phone_prefix: userData.phone_prefix || '+216',
            phone_number: userData.phone_number || '',
            name: userData.name || username,
            email: email,
            picture: signInData.user.user_metadata?.avatar_url || signInData.user.user_metadata?.picture,
            role: 'player',
          };
          setUser(fallbackUser);
          saveUserToStorage(fallbackUser);
        }
      } catch (error) {
        console.error('Error mapping user after login:', error);
        // Fallback: create user from database data
        const fallbackUser: User = {
          id: signInData.user.id,
          username: userData.username || username.toLowerCase(),
          phone_prefix: userData.phone_prefix || '+216',
          phone_number: userData.phone_number || '',
          name: userData.name || username,
          email: email,
          picture: signInData.user.user_metadata?.avatar_url || signInData.user.user_metadata?.picture,
        };
        setUser(fallbackUser);
        saveUserToStorage(fallbackUser);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      saveUserToStorage(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signup,
        login,
        loginWithGoogle: handleGoogleLogin,
        handleGoogleSuccess,
        logout,
        isLoading,
        checkUsernameAvailability,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

