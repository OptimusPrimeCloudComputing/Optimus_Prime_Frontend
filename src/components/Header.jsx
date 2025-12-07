import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const totalQuantity = useSelector(state => state.cart.totalQuantity)
  const { user, isAuthenticated, isLoading, handleGoogleLogin, logout, error } = useAuth()

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      await handleGoogleLogin(credentialResponse)
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  const onGoogleError = () => {
    console.error('Google Login Failed')
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Optimus Prime Shop
          </Link>
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition duration-300">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-blue-600 transition duration-300">Products</Link>
            <Link to="/cart" className="text-gray-700 hover:text-blue-600 transition duration-300 relative">
              Cart
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </Link>
            <Link to="/account" className="text-gray-700 hover:text-blue-600 transition duration-300">My Account</Link>
            
            {/* Auth Section */}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  {user.picture && (
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full border-2 border-blue-600"
                    />
                  )}
                  <span className="text-gray-700 text-sm font-medium max-w-[120px] truncate">
                    {user.name || user.email}
                  </span>
                  <button
                    onClick={logout}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={onGoogleError}
                  useOneTap
                  theme="outline"
                  size="medium"
                  text="signin_with"
                  shape="rectangular"
                />
              )}
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile Auth */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2">
                {user.picture && (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-7 h-7 rounded-full border border-blue-600"
                  />
                )}
              </div>
            ) : null}
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <Link to="/" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/products" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Products</Link>
            <Link to="/account" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>My Account</Link>
            <Link to="/cart" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
              Cart {totalQuantity > 0 && `(${totalQuantity})`}
            </Link>
            
            {/* Mobile Auth Section */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {user.picture && (
                      <img 
                        src={user.picture} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-full border border-blue-600"
                      />
                    )}
                    <span className="text-gray-700 text-sm">{user.name || user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={(response) => {
                      onGoogleSuccess(response)
                      setMobileMenuOpen(false)
                    }}
                    onError={onGoogleError}
                    theme="outline"
                    size="medium"
                    text="signin_with"
                  />
                </div>
              )}
            </div>
            
            {/* Error display */}
            {error && (
              <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded">
                {error}
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header
