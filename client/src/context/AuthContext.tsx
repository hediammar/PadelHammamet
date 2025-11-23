import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  handleGoogleSuccess: (credentialResponse: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize user state (will be loaded from localStorage on mount)
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user from storage on mount (client-side only)
  useEffect(() => {
    const storedUser = loadUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Handle Google OAuth success (for GoogleLogin component)
  const handleGoogleSuccess = useCallback(async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      if (credentialResponse.credential) {
        // Handle ID token from One Tap
        // Decode JWT token (in production, verify on backend)
        const base64Url = credentialResponse.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const googleUser = JSON.parse(jsonPayload);

        const newUser: User = {
          id: googleUser.sub || `google-${Date.now()}`,
          name: googleUser.name || '',
          email: googleUser.email || '',
          picture: googleUser.picture,
        };

        setUser(newUser);
      } else if (credentialResponse.access_token) {
        // Handle access token from useGoogleLogin
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${credentialResponse.access_token}`,
          },
        });
        const googleUser = await userInfoResponse.json();

        const newUser: User = {
          id: googleUser.sub || `google-${Date.now()}`,
          name: googleUser.name || '',
          email: googleUser.email || '',
          picture: googleUser.picture,
        };

        setUser(newUser);
        // Save to localStorage for persistence
        saveUserToStorage(newUser);
      }
      
      // TODO: Store token and user in backend
      // await authApi.loginWithGoogle(credentialResponse);
    } catch (error) {
      console.error('Google login error:', error);
      alert('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Google OAuth login handler (for useGoogleLogin hook)
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      setIsLoading(false);
      console.error('Google login failed');
    },
  });

  const login = async (_email: string, _password: string) => {
    // TODO: Implement email/password login logic
    setIsLoading(true);
    try {
      // await authApi.login(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    // Clear from localStorage
    saveUserToStorage(null);
    // TODO: Clear tokens and call logout API
    // await authApi.logout();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle: handleGoogleLogin,
        handleGoogleSuccess,
        logout,
        isLoading,
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

