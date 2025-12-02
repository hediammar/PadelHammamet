import { Routes, Route, useLocation } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import Layout from './components/layout/Layout'
import PageTransition from './components/layout/PageTransition'
import Loader from './components/layout/Loader'
import Home from './pages/Home'
import BookingFlow from './pages/BookingFlow'
import BookingFlowAlternative from './pages/BookingFlowAlternative'
import UserProfile from './pages/UserProfile'
import Login from './pages/Login'
import AdminPanel from './pages/AdminPanel'

// Google OAuth Client ID - should be set in environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Warn if Google Client ID is not configured
if (!GOOGLE_CLIENT_ID && import.meta.env.DEV) {
  console.warn(
    '⚠️ Google OAuth Client ID not found!\n' +
    'Please create a .env file in the client directory with:\n' +
    'VITE_GOOGLE_CLIENT_ID=your-client-id-here\n\n' +
    'See GOOGLE_OAUTH_SETUP.md for detailed instructions.'
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <PageTransition>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<BookingFlow />} />
        <Route path="/booking-alternative" element={<BookingFlowAlternative />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </PageTransition>
  );
}

function App() {
  // Only wrap with GoogleOAuthProvider if we have a valid client ID
  const appContent = (
    <AuthProvider>
      <BookingProvider>
        <Loader />
        <Layout>
          <AppRoutes />
        </Layout>
      </BookingProvider>
    </AuthProvider>
  );

  // If no client ID, render without GoogleOAuthProvider (app will still work, just no Google sign-in)
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.trim() === '') {
    if (typeof window !== 'undefined') {
      console.warn(
        '⚠️ Google OAuth Client ID not configured. Google sign-in will not be available.\n' +
        'Please set VITE_GOOGLE_CLIENT_ID in your Vercel environment variables.'
      );
    }
    return appContent;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {appContent}
    </GoogleOAuthProvider>
  )
}

export default App
