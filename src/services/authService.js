// Auth Service - Handles Google OAuth and JWT management
// 
// FRONTEND RESPONSIBILITY: 
// - Initiate Google OAuth flow
// - Receive Google credential (ID token)
// - Send to backend for JWT exchange
// - Store and manage JWT token
//
// TEAMMATE 1 (User Service) NEEDS TO IMPLEMENT:
// - POST /auth/google endpoint that:
//   1. Receives { credential: "google_id_token" }
//   2. Verifies token with Google
//   3. Creates/finds user in database
//   4. Generates YOUR app's JWT
//   5. Returns { token: "your_jwt", user: { id, email, name, picture } }

// TODO: Replace with your User microservice URL
const AUTH_API_BASE = import.meta.env.VITE_USER_SERVICE_URL || 'https://your-user-service.run.app';

// Endpoints
const AUTH_ENDPOINTS = {
  googleLogin: `${AUTH_API_BASE}/auth/google`,
  verifyToken: `${AUTH_API_BASE}/auth/verify`,
  logout: `${AUTH_API_BASE}/auth/logout`,
  me: `${AUTH_API_BASE}/auth/me`,
};

// Token storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Exchange Google credential for your app's JWT
 * 
 * TEAMMATE 1: This is what I'll send you after Google login:
 * POST /auth/google
 * Body: { credential: "eyJhbGciOiJSUzI1NiIsInR5cCI6..." } // Google's ID token
 * 
 * Expected Response:
 * {
 *   token: "your_jwt_token_here",
 *   user: {
 *     id: "user_123",
 *     email: "user@columbia.edu",
 *     name: "John Doe",
 *     picture: "https://..."
 *   }
 * }
 */
export const exchangeGoogleToken = async (googleCredential) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.googleLogin, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credential: googleCredential,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to authenticate with Google');
    }

    const data = await response.json();
    
    // Store the JWT and user info
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Google auth error:', error);
    throw error;
  }
};

/**
 * Get stored JWT token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get stored user info
 */
export const getStoredUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  // Basic JWT expiry check (decode without verification)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

/**
 * Logout - clear stored tokens
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Get auth headers for API requests
 * Use this when calling protected endpoints on any microservice
 */
export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Verify token with backend (optional - for checking if token is still valid)
 */
export const verifyToken = async () => {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetch(AUTH_ENDPOINTS.verifyToken, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Get current user from backend
 */
export const getCurrentUser = async () => {
  const response = await fetch(AUTH_ENDPOINTS.me, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user');
  }

  return response.json();
};

export default {
  exchangeGoogleToken,
  getToken,
  getStoredUser,
  isAuthenticated,
  logout,
  getAuthHeaders,
  verifyToken,
  getCurrentUser,
};

