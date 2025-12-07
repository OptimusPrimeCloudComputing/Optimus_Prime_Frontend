import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { store } from './store/store'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

// Google OAuth Client ID - get this from Google Cloud Console
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select existing
// 3. Go to APIs & Services > Credentials
// 4. Create OAuth 2.0 Client ID (Web application)
// 5. Add authorized JavaScript origins (your frontend URL)
// 6. Add authorized redirect URIs
// 7. Copy the Client ID and set it in .env file
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

if (!GOOGLE_CLIENT_ID) {
  console.warn('VITE_GOOGLE_CLIENT_ID is not set. Google OAuth will not work.');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
