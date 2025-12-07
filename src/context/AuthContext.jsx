import { createContext, useContext, useState, useEffect } from 'react';
import { 
  exchangeGoogleToken, 
  getStoredUser, 
  isAuthenticated as checkAuth, 
  logout as authLogout,
  getToken 
} from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = () => {
      if (checkAuth()) {
        const storedUser = getStoredUser();
        setUser(storedUser);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  /**
   * Handle Google login success
   * This is called after user successfully signs in with Google
   */
  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Send Google credential to backend for JWT exchange
      const data = await exchangeGoogleToken(credentialResponse.credential);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle logout
   */
  const logout = () => {
    authLogout();
    setUser(null);
    setError(null);
  };

  /**
   * Get the current JWT token
   */
  const token = getToken();

  const value = {
    user,
    token,
    isAuthenticated: !!user && checkAuth(),
    isLoading,
    error,
    handleGoogleLogin,
    logout,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

