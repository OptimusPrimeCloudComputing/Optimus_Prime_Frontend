import { useSelector, useDispatch } from 'react-redux'
import { addToCart, removeFromCart, clearCart } from '../store/cartSlice'

function Cart() {
  const dispatch = useDispatch()
  const cartItems = useSelector(state => state.cart.items)
  const totalAmount = useSelector(state => state.cart.totalAmount)
  const totalQuantity = useSelector(state => state.cart.totalQuantity)
  
  // Calculate shipping (free for orders over $200, otherwise $10)
  const shipping = totalAmount > 200 ? 0 : totalAmount > 0 ? 10 : 0
  
  // Calculate tax (8% of subtotal)
  const tax = totalAmount * 0.08
  
  // Calculate final total
  const finalTotal = totalAmount + shipping + tax

  const handleRemoveFromCart = (id) => {
    dispatch(removeFromCart(id))
  }

  const handleAddToCart = (item) => {
    dispatch(addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
    }))
  }

  const handleClearCart = () => {
    dispatch(clearCart())
  }

  return (
    <section id="cart" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Cart & Payments</h2>
          <p className="text-gray-600 text-lg">Powered by our Payments Microservice</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Cart Summary */}
            <div className="bg-gray-50 rounded-lg shadow-md p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Cart Summary</h3>
                {cartItems.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-semibold"
                  >
                    Clear Cart
                  </button>
                )}
              </div>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-gray-500 text-lg">Your Cart is Empty</p>
                </div>
              ) : (
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-gray-500 hover:text-red-600 transition cursor-pointer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="font-semibold text-gray-700 w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="text-gray-500 hover:text-blue-600 transition cursor-pointer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        <span className="font-bold text-blue-600 ml-4 w-20 text-right">
                          ${item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal ({totalQuantity} items)</span>
                  <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 && totalAmount > 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-xl font-bold text-gray-800">Total</span>
                    <span className="text-xl font-bold text-blue-600">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Form */}
            <div className="bg-gray-50 rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Payment Information</h3>
              
              <div className="mb-6">
                <label htmlFor="cardNumber" className="block text-gray-700 font-semibold mb-2">Card Number</label>
                <input 
                  type="text" 
                  id="cardNumber" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="expiryDate" className="block text-gray-700 font-semibold mb-2">Expiry Date</label>
                  <input 
                    type="text" 
                    id="expiryDate" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="MM/YY"
                  />
                </div>
                
                <div>
                  <label htmlFor="cvv" className="block text-gray-700 font-semibold mb-2">CVV</label>
                  <input 
                    type="text" 
                    id="cvv" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="123"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="cardName" className="block text-gray-700 font-semibold mb-2">Cardholder Name</label>
                <input 
                  type="text" 
                  id="cardName" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="John Doe"
                />
              </div>
              
              <button 
                disabled={cartItems.length === 0}
                className={`w-full py-3 rounded-lg font-semibold transition duration-300 shadow-lg ${
                  cartItems.length === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'
                }`}
              >
                Complete Purchase ${finalTotal.toFixed(2)}
              </button>
              
              <div className="mt-6 flex items-center justify-center space-x-4">
                <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.265 0l-6.53 24h2.742l6.53-24h-2.742zm-7.61 4.586l-5.069 5.414 5.069 5.414 1.914-2.043-3.026-3.371 3.026-3.371-1.914-2.043zm8.69 0l-1.914 2.043 3.026 3.371-3.026 3.371 1.914 2.043 5.069-5.414-5.069-5.414z" />
                </svg>
                <span className="text-gray-500 text-sm">Secure Payment Processing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Cart
