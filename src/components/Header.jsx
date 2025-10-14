import { useState } from 'react'
import { useSelector } from 'react-redux'

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const totalQuantity = useSelector(state => state.cart.totalQuantity)

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">
            Optimus Prime Shop
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#home" className="text-gray-700 hover:text-blue-600 transition duration-300">Home</a>
            <a href="#products" className="text-gray-700 hover:text-blue-600 transition duration-300">Products</a>
            <a href="#account" className="text-gray-700 hover:text-blue-600 transition duration-300">My Account</a>
            <a href="#cart" className="text-gray-700 hover:text-blue-600 transition duration-300 relative">
              Cart
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </a>
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
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
            <a href="#home" className="block py-2 text-gray-700 hover:text-blue-600">Home</a>
            <a href="#products" className="block py-2 text-gray-700 hover:text-blue-600">Products</a>
            <a href="#account" className="block py-2 text-gray-700 hover:text-blue-600">My Account</a>
            <a href="#cart" className="block py-2 text-gray-700 hover:text-blue-600">
              Cart {totalQuantity > 0 && `(${totalQuantity})`}
            </a>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header

