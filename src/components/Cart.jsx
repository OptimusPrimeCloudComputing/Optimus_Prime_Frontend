import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { addToCart, removeFromCart, clearCart } from '../store/cartSlice'
import { initiatePayment, getPayment, cancelPayment, dollarsToCents, centsToDollars } from '../services/paymentService'
import { checkInventoryAvailability, reduceInventoryForPurchase } from '../services/inventoryService'

function Cart() {
  const dispatch = useDispatch()
  const cartItems = useSelector(state => state.cart.items)
  const totalAmount = useSelector(state => state.cart.totalAmount)
  const totalQuantity = useSelector(state => state.cart.totalQuantity)
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  })
  
  // Payment process state
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const [paymentId, setPaymentId] = useState(null)
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  
  // Calculate shipping (free for orders over $200, otherwise $10)
  const shipping = totalAmount > 200 ? 0 : totalAmount > 0 ? 10 : 0
  
  // Calculate tax (8% of subtotal)
  const tax = totalAmount * 0.08
  
  // Calculate final total
  const finalTotal = totalAmount + shipping + tax

  const handleRemoveFromCart = (id) => {
    dispatch(removeFromCart(id))
  }

  const handleAddToCart = async (item) => {
    try {
      // Check inventory availability before adding
      const currentQuantity = cartItems.find(cartItem => cartItem.id === item.id)?.quantity || 0
      const requestedQuantity = currentQuantity + 1
      
      const availability = await checkInventoryAvailability(item.id, requestedQuantity)
      
      if (!availability.available) {
        alert(`Cannot add more items. Only ${availability.currentStock} available in stock.`)
        return
      }
      
      dispatch(addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
      }))
    } catch (error) {
      console.error('Error checking inventory:', error)
      // If inventory check fails, still allow adding to cart (degraded mode)
      dispatch(addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
      }))
    }
  }

  const handleClearCart = () => {
    dispatch(clearCart())
    // Reset payment states when cart is cleared
    setPaymentSuccess(false)
    setPaymentError(null)
    setPaymentId(null)
    setPaymentDetails(null)
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setPaymentForm(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleCheckPaymentStatus = async () => {
    if (!paymentId) return
    
    setIsCheckingStatus(true)
    setPaymentError(null)
    
    try {
      const details = await getPayment(paymentId)
      setPaymentDetails(details)
      console.log('Payment details:', details)
      
      // Update payment history if status changed
      if (details.status) {
        updatePaymentInHistory(paymentId, { 
          status: details.status,
          lastChecked: new Date().toISOString()
        })
      }
    } catch (error) {
      setPaymentError(error.message || 'Failed to fetch payment status')
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const handleCancelPayment = async () => {
    if (!paymentId) return
    
    if (!window.confirm('Are you sure you want to cancel this payment?')) {
      return
    }
    
    setIsCancelling(true)
    setPaymentError(null)
    
    try {
      const response = await cancelPayment(paymentId)
      console.log('Payment cancelled:', response)
      
      // Update payment details to show cancelled status
      setPaymentDetails(prev => prev ? { ...prev, status: 'CANCELLED' } : null)
      setPaymentSuccess(false)
      
      // Update payment history in localStorage
      updatePaymentInHistory(paymentId, { 
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString()
      })
      
      // Show success message
      alert('Payment cancelled successfully')
    } catch (error) {
      setPaymentError(error.message || 'Failed to cancel payment')
    } finally {
      setIsCancelling(false)
    }
  }

  const savePaymentToHistory = (paymentData) => {
    try {
      const history = JSON.parse(localStorage.getItem('paymentHistory') || '[]')
      history.unshift({
        ...paymentData,
        savedAt: new Date().toISOString()
      })
      // Keep only last 20 payments
      localStorage.setItem('paymentHistory', JSON.stringify(history.slice(0, 20)))
    } catch (error) {
      console.error('Failed to save payment to history:', error)
    }
  }

  const updatePaymentInHistory = (paymentId, updates) => {
    try {
      const history = JSON.parse(localStorage.getItem('paymentHistory') || '[]')
      const updatedHistory = history.map(payment => {
        if (payment.paymentId === paymentId) {
          return {
            ...payment,
            ...updates,
            updatedAt: new Date().toISOString()
          }
        }
        return payment
      })
      localStorage.setItem('paymentHistory', JSON.stringify(updatedHistory))
      console.log(`Updated payment ${paymentId} in history with:`, updates)
    } catch (error) {
      console.error('Failed to update payment in history:', error)
    }
  }

  const generateOrderId = () => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    return `ord_${timestamp}_${random}`
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    
    // Reset previous states
    setPaymentError(null)
    setPaymentSuccess(false)
    
    // Validate form
    if (!paymentForm.cardNumber || !paymentForm.expiryDate || !paymentForm.cvv || !paymentForm.cardholderName) {
      setPaymentError('Please fill in all payment fields')
      return
    }
    
    if (cartItems.length === 0) {
      setPaymentError('Your cart is empty')
      return
    }
    
    setIsProcessing(true)
    
    try {
      // STEP 1: Check inventory availability for all items
      console.log('Checking inventory availability...')
      const inventoryChecks = await Promise.all(
        cartItems.map(async (item) => {
          const check = await checkInventoryAvailability(item.id, item.quantity)
          return {
            productId: item.id,
            productName: item.name,
            ...check
          }
        })
      )
      
      // Check if any items are out of stock or insufficient
      const unavailableItems = inventoryChecks.filter(check => !check.available)
      
      if (unavailableItems.length > 0) {
        const errorMessages = unavailableItems.map(item => 
          `${item.productName}: Only ${item.currentStock} available (requested ${item.requestedQuantity})`
        ).join('\n')
        
        setPaymentError(`Insufficient inventory:\n${errorMessages}`)
        setIsProcessing(false)
        return
      }
      
      console.log('Inventory check passed. All items available.')
      
      // STEP 2: Generate unique order ID
      const orderId = generateOrderId()
      
      // Convert amount to cents (API expects amount in cents)
      const amountInCents = dollarsToCents(finalTotal)
      
      // Get current URL for return redirect
      const returnUrl = window.location.origin + window.location.pathname
      
      // Prepare payment data according to API specification
      const paymentData = {
        orderId: orderId,
        amount: amountInCents,
        currency: 'USD',
        method: 'CARD',
        returnUrl: returnUrl,
        metadata: {
          // Cart information
          items: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          // Payment breakdown
          subtotal: totalAmount,
          shipping: shipping,
          tax: tax,
          total_items: totalQuantity,
          // Customer details
          customer: {
            name: paymentForm.cardholderName,
            card_last4: paymentForm.cardNumber.slice(-4),
            expiry: paymentForm.expiryDate,
          }
        }
      }
      
      // STEP 3: Initiate payment
      console.log('Initiating payment...')
      const response = await initiatePayment(paymentData)
      
      // Handle successful payment initiation
      const responsePaymentId = response.paymentId || response.payment_id
      console.log('Payment initiated successfully:', responsePaymentId)
      
      setPaymentId(responsePaymentId)
      setPaymentDetails(response)
      
      // STEP 4: Reduce inventory after successful payment
      try {
        console.log('Adjusting inventory...')
        const inventoryResults = await reduceInventoryForPurchase(cartItems)
        
        const failedAdjustments = inventoryResults.filter(r => !r.success)
        if (failedAdjustments.length > 0) {
          console.warn('Some inventory adjustments failed:', failedAdjustments)
          // Note: Payment was successful but inventory adjustment had issues
          // In production, this would need proper error handling and rollback mechanisms
        } else {
          console.log('Inventory adjusted successfully')
        }
      } catch (inventoryError) {
        console.error('Inventory adjustment error:', inventoryError)
        // Payment was successful, but inventory adjustment failed
        // In production, this should trigger an alert or compensating transaction
      }
      
      setPaymentSuccess(true)
      
      // Save to payment history
      savePaymentToHistory({
        paymentId: responsePaymentId,
        orderId: orderId,
        amount: centsToDollars(amountInCents),
        amountCents: amountInCents,
        currency: 'USD',
        status: response.status || 'INITIATED',
        method: 'CARD',
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        createdAt: response.createdAt || new Date().toISOString(),
      })
      
      // Clear cart after successful payment
      dispatch(clearCart())
      
    } catch (error) {
      setPaymentError(error.message || 'Payment failed. Please try again.')
      console.error('Payment error:', error)
    } finally {
      setIsProcessing(false)
    }
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
              
              {/* Success Message */}
              {paymentSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="text-green-800 font-semibold">Payment Initiated!</p>
                      {paymentId && (
                        <p className="text-green-600 text-sm mt-1">Payment ID: {paymentId}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Payment Details */}
                  {paymentDetails && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <div className="text-sm space-y-1">
                        <p><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded text-xs ${
                          paymentDetails.status === 'INITIATED' ? 'bg-yellow-100 text-yellow-800' :
                          paymentDetails.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          paymentDetails.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>{paymentDetails.status}</span></p>
                        <p><span className="font-semibold">Order ID:</span> {paymentDetails.orderId}</p>
                        <p><span className="font-semibold">Amount:</span> ${centsToDollars(paymentDetails.amount).toFixed(2)}</p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={handleCheckPaymentStatus}
                          disabled={isCheckingStatus}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
                        >
                          {isCheckingStatus ? 'Checking...' : 'Check Status'}
                        </button>
                        
                        {paymentDetails.status === 'INITIATED' && (
                          <button
                            onClick={handleCancelPayment}
                            disabled={isCancelling}
                            className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-400 transition"
                          >
                            {isCancelling ? 'Cancelling...' : 'Cancel Payment'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Error Message */}
              {paymentError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p className="text-red-800">{paymentError}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handlePayment}>
                <div className="mb-6">
                  <label htmlFor="cardNumber" className="block text-gray-700 font-semibold mb-2">Card Number</label>
                  <input 
                    type="text" 
                    id="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="1234 5678 9012 3456"
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="expiryDate" className="block text-gray-700 font-semibold mb-2">Expiry Date</label>
                    <input 
                      type="text" 
                      id="expiryDate"
                      value={paymentForm.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="MM/YY"
                      disabled={isProcessing}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cvv" className="block text-gray-700 font-semibold mb-2">CVV</label>
                    <input 
                      type="text" 
                      id="cvv"
                      value={paymentForm.cvv}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="123"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="cardholderName" className="block text-gray-700 font-semibold mb-2">Cardholder Name</label>
                  <input 
                    type="text" 
                    id="cardholderName"
                    value={paymentForm.cardholderName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="John Doe"
                    disabled={isProcessing}
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={cartItems.length === 0 || isProcessing}
                  className={`w-full py-3 rounded-lg font-semibold transition duration-300 shadow-lg ${
                    cartItems.length === 0 || isProcessing
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Complete Purchase $${finalTotal.toFixed(2)}`
                  )}
                </button>
              </form>
              
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
