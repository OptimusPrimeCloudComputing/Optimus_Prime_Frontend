import { useState, useEffect } from 'react'
import { getPayment, initiateRefund, centsToDollars } from '../services/paymentService'
import { 
  createCustomer, 
  getCustomer, 
  updateCustomer, 
  deleteCustomer,
  createAddress,
  listAddresses,
  updateAddress,
  deleteAddress
} from '../services/customerService'

function Account() {
  const [activeTab, setActiveTab] = useState('orders') // 'orders' or 'profile'
  
  // Payment state
  const [paymentHistory, setPaymentHistory] = useState([])
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isRefunding, setIsRefunding] = useState(false)
  const [refundForm, setRefundForm] = useState({ amount: '', reason: '' })
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Customer state
  const [currentUniversityId, setCurrentUniversityId] = useState(
    localStorage.getItem('universityId') || ''
  )
  const [customerProfile, setCustomerProfile] = useState(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })
  
  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    university_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: '',
    status: 'active'
  })
  
  // Initial address for new registration
  const [initialAddress, setInitialAddress] = useState({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA'
  })
  
  // Address state
  const [addresses, setAddresses] = useState([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA'
  })

  useEffect(() => {
    // Load payment history from localStorage
    loadPaymentHistory()
    
    // Load customer profile if university ID exists
    if (currentUniversityId) {
      loadCustomerProfile(currentUniversityId)
      loadCustomerAddresses(currentUniversityId)
    }
  }, [])

  // Reload payment history when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && activeTab === 'orders') {
        loadPaymentHistory()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [activeTab])

  // Reload payment history when orders tab is selected
  useEffect(() => {
    if (activeTab === 'orders') {
      loadPaymentHistory()
    }
  }, [activeTab])

  const loadPaymentHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('paymentHistory') || '[]')
      setPaymentHistory(history)
    } catch (error) {
      console.error('Failed to load payment history:', error)
    }
  }

  const handleViewDetails = async (paymentId) => {
    setIsLoadingDetails(true)
    setMessage({ type: '', text: '' })
    
    try {
      const details = await getPayment(paymentId)
      setSelectedPayment(details)
      
      // Update the payment in history with latest details
      const updatedHistory = paymentHistory.map(p => 
        p.paymentId === paymentId ? { ...p, status: details.status } : p
      )
      setPaymentHistory(updatedHistory)
      localStorage.setItem('paymentHistory', JSON.stringify(updatedHistory))
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to fetch payment details' })
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleRefundSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedPayment) return
    
    if (!refundForm.amount || !refundForm.reason) {
      setMessage({ type: 'error', text: 'Please fill in all refund fields' })
      return
    }

    if (parseFloat(refundForm.amount) > centsToDollars(selectedPayment.amount)) {
      setMessage({ type: 'error', text: 'Refund amount cannot exceed payment amount' })
      return
    }

    setIsRefunding(true)
    setMessage({ type: '', text: '' })
    
    try {
      const refundData = {
        amount: parseFloat(refundForm.amount) * 100, // Convert to cents
        reason: refundForm.reason
      }
      
      const response = await initiateRefund(selectedPayment.paymentId, refundData)
      console.log('Refund initiated:', response)
      
      setMessage({ type: 'success', text: 'Refund request submitted successfully!' })
      setRefundForm({ amount: '', reason: '' })
      
      // Refresh payment details
      setTimeout(() => {
        handleViewDetails(selectedPayment.paymentId)
      }, 1000)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to initiate refund' })
    } finally {
      setIsRefunding(false)
    }
  }

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all payment history?')) {
      localStorage.removeItem('paymentHistory')
      setPaymentHistory([])
      setSelectedPayment(null)
    }
  }

  // Customer Management Functions
  const loadCustomerProfile = async (universityId) => {
    setIsLoadingProfile(true)
    setProfileMessage({ type: '', text: '' })
    
    try {
      const profile = await getCustomer(universityId)
      setCustomerProfile(profile)
      setCustomerForm({
        university_id: profile.university_id || '',
        first_name: profile.first_name || '',
        middle_name: profile.middle_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        birth_date: profile.birth_date || '',
        status: profile.status || 'active'
      })
    } catch (error) {
      console.log('Customer not found, showing registration form')
      setCustomerProfile(null)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleCustomerFormChange = (e) => {
    const { name, value } = e.target
    setCustomerForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreateOrUpdateCustomer = async (e) => {
    e.preventDefault()
    setIsSavingProfile(true)
    setProfileMessage({ type: '', text: '' })
    
    try {
      let result
      if (customerProfile) {
        // Update existing customer
        const updateData = {
          email: customerForm.email,
          first_name: customerForm.first_name,
          middle_name: customerForm.middle_name,
          last_name: customerForm.last_name,
          phone: customerForm.phone,
          status: customerForm.status
        }
        result = await updateCustomer(currentUniversityId, updateData)
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' })
      } else {
        // Create new customer
        const addressArray = []
        // Add initial address if any field is filled
        if (initialAddress.street || initialAddress.city) {
          addressArray.push({
            street: initialAddress.street,
            city: initialAddress.city,
            state: initialAddress.state,
            postal_code: initialAddress.postal_code,
            country: initialAddress.country
          })
        }
        
        const createData = {
          ...customerForm,
          address: addressArray
        }
        result = await createCustomer(createData)
        setCurrentUniversityId(customerForm.university_id)
        localStorage.setItem('universityId', customerForm.university_id)
        setProfileMessage({ type: 'success', text: 'Account created successfully!' })
      }
      
      setCustomerProfile(result)
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message || 'Operation failed' })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleDeleteCustomer = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    
    setIsSavingProfile(true)
    setProfileMessage({ type: '', text: '' })
    
    try {
      await deleteCustomer(currentUniversityId)
      setCustomerProfile(null)
      setCurrentUniversityId('')
      setAddresses([])
      localStorage.removeItem('universityId')
      setProfileMessage({ type: 'success', text: 'Account deleted successfully' })
      
      // Reset form
      setCustomerForm({
        university_id: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        phone: '',
        birth_date: '',
        status: 'active'
      })
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message || 'Failed to delete account' })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleLoadProfile = () => {
    if (!currentUniversityId) {
      setProfileMessage({ type: 'error', text: 'Please enter a University ID' })
      return
    }
    
    localStorage.setItem('universityId', currentUniversityId)
    loadCustomerProfile(currentUniversityId)
    loadCustomerAddresses(currentUniversityId)
  }

  // Address Management Functions
  const loadCustomerAddresses = async (universityId) => {
    setIsLoadingAddresses(true)
    
    try {
      const addressList = await listAddresses(universityId)
      setAddresses(addressList)
    } catch (error) {
      console.log('No addresses found or error loading addresses')
      setAddresses([])
    } finally {
      setIsLoadingAddresses(false)
    }
  }

  const handleAddressFormChange = (e) => {
    const { name, value } = e.target
    setAddressForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreateOrUpdateAddress = async (e) => {
    e.preventDefault()
    setProfileMessage({ type: '', text: '' })
    
    if (!currentUniversityId) {
      setProfileMessage({ type: 'error', text: 'Please save your profile first' })
      return
    }
    
    try {
      if (editingAddressId) {
        // Update existing address
        await updateAddress(currentUniversityId, editingAddressId, addressForm)
        setProfileMessage({ type: 'success', text: 'Address updated successfully!' })
      } else {
        // Create new address
        await createAddress(currentUniversityId, addressForm)
        setProfileMessage({ type: 'success', text: 'Address added successfully!' })
      }
      
      // Reload addresses
      await loadCustomerAddresses(currentUniversityId)
      
      // Reset form
      setAddressForm({
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'USA'
      })
      setEditingAddressId(null)
      setShowAddressForm(false)
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message || 'Address operation failed' })
    }
  }

  const handleEditAddress = (address) => {
    setAddressForm({
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      postal_code: address.postal_code || '',
      country: address.country || 'USA'
    })
    setEditingAddressId(address.address_id)
    setShowAddressForm(true)
  }

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return
    }
    
    setProfileMessage({ type: '', text: '' })
    
    try {
      await deleteAddress(currentUniversityId, addressId)
      setProfileMessage({ type: 'success', text: 'Address deleted successfully!' })
      await loadCustomerAddresses(currentUniversityId)
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message || 'Failed to delete address' })
    }
  }

  const handleCancelAddressForm = () => {
    setAddressForm({
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'USA'
    })
    setEditingAddressId(null)
    setShowAddressForm(false)
  }

  return (
    <section id="account" className="py-20 bg-gray-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">My Account</h2>
          <p className="text-gray-600 text-lg">Manage your orders and account</p>
        </div>
        
        {/* Tabs */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex border-b border-gray-300">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'orders'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Order History
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Profile
            </button>
          </div>
        </div>

        {/* Order History Tab */}
        {activeTab === 'orders' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Payment History List */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Payment History</h3>
                  {paymentHistory.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-red-600 hover:text-red-700 text-sm font-semibold"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                {paymentHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">No payment history yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {paymentHistory.map((payment) => (
                      <div
                        key={payment.paymentId}
                        onClick={() => handleViewDetails(payment.paymentId)}
                        className={`p-4 border rounded-lg cursor-pointer transition ${
                          selectedPayment?.paymentId === payment.paymentId
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-800">{payment.orderId}</p>
                            <p className="text-sm text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            payment.status === 'INITIATED' ? 'bg-yellow-100 text-yellow-800' :
                            payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            payment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.status}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-blue-600">${payment.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">{payment.items?.length || 0} items</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Details & Refund */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Payment Details</h3>

                {/* Message Display */}
                {message.text && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                    'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {message.text}
                  </div>
                )}

                {isLoadingDetails ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading details...</p>
                  </div>
                ) : !selectedPayment ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">Select a payment to view details</p>
                  </div>
                ) : (
                  <div>
                    {/* Payment Info */}
                    <div className="space-y-3 mb-6 pb-6 border-b">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment ID:</span>
                        <span className="font-semibold text-sm">{selectedPayment.paymentId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-semibold">{selectedPayment.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          selectedPayment.status === 'INITIATED' ? 'bg-yellow-100 text-yellow-800' :
                          selectedPayment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          selectedPayment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedPayment.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-lg">${centsToDollars(selectedPayment.amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-semibold">{selectedPayment.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-semibold text-sm">{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Refund Form - Only for COMPLETED payments */}
                    {selectedPayment.status === 'COMPLETED' && (
                      <div>
                        <h4 className="font-bold text-gray-800 mb-4">Request Refund</h4>
                        <form onSubmit={handleRefundSubmit} className="space-y-4">
                          <div>
                            <label htmlFor="refundAmount" className="block text-gray-700 font-semibold mb-2">
                              Refund Amount
                            </label>
                            <input
                              type="number"
                              id="refundAmount"
                              step="0.01"
                              max={centsToDollars(selectedPayment.amount)}
                              value={refundForm.amount}
                              onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0.00"
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Max: ${centsToDollars(selectedPayment.amount).toFixed(2)}
                            </p>
                          </div>

                          <div>
                            <label htmlFor="refundReason" className="block text-gray-700 font-semibold mb-2">
                              Reason for Refund
                            </label>
                            <textarea
                              id="refundReason"
                              value={refundForm.reason}
                              onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="3"
                              placeholder="Please explain why you need a refund..."
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isRefunding}
                            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition"
                          >
                            {isRefunding ? 'Processing...' : 'Submit Refund Request'}
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Action Button for non-completed payments */}
                    {selectedPayment.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleViewDetails(selectedPayment.paymentId)}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        Refresh Status
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-6xl mx-auto">
            {/* Profile Message */}
            {profileMessage.text && (
              <div className={`mb-6 p-4 rounded-lg ${
                profileMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {profileMessage.text}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Customer Profile Form */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  {customerProfile ? 'My Profile' : 'Create Account'}
                </h3>

                {/* University ID Lookup */}
                {!customerProfile && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Have an account? Enter your University ID
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentUniversityId}
                        onChange={(e) => setCurrentUniversityId(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="UNI1234"
                      />
                      <button
                        onClick={handleLoadProfile}
                        disabled={isLoadingProfile}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
                      >
                        {isLoadingProfile ? 'Loading...' : 'Load'}
                      </button>
                    </div>
                  </div>
                )}

                {isLoadingProfile ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading profile...</p>
                  </div>
                ) : (
                  <form onSubmit={handleCreateOrUpdateCustomer} className="space-y-4">
                    {/* University ID */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        University ID {!customerProfile && <span className="text-red-600">*</span>}
                      </label>
                      <input
                        type="text"
                        name="university_id"
                        value={customerForm.university_id}
                        onChange={handleCustomerFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="UNI1234"
                        required={!customerProfile}
                        disabled={customerProfile !== null}
                      />
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          First Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={customerForm.first_name}
                          onChange={handleCustomerFormChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="John"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          Last Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={customerForm.last_name}
                          onChange={handleCustomerFormChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>

                    {/* Middle Name */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Middle Name</label>
                      <input
                        type="text"
                        name="middle_name"
                        value={customerForm.middle_name}
                        onChange={handleCustomerFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Michael"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Email <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={customerForm.email}
                        onChange={handleCustomerFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="john@columbia.edu"
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={customerForm.phone}
                        onChange={handleCustomerFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1-234-567-8910"
                      />
                    </div>

                    {/* Birth Date */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Birth Date</label>
                      <input
                        type="date"
                        name="birth_date"
                        value={customerForm.birth_date}
                        onChange={handleCustomerFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Status</label>
                      <select
                        name="status"
                        value={customerForm.status}
                        onChange={handleCustomerFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    {/* Initial Address - Only for new registration */}
                    {!customerProfile && (
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-bold text-gray-800 mb-3">Initial Address (Optional)</h4>
                        
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Street Address"
                            value={initialAddress.street}
                            onChange={(e) => setInitialAddress({...initialAddress, street: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="City"
                              value={initialAddress.city}
                              onChange={(e) => setInitialAddress({...initialAddress, city: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="State"
                              value={initialAddress.state}
                              onChange={(e) => setInitialAddress({...initialAddress, state: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Postal Code"
                              value={initialAddress.postal_code}
                              onChange={(e) => setInitialAddress({...initialAddress, postal_code: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Country"
                              value={initialAddress.country}
                              onChange={(e) => setInitialAddress({...initialAddress, country: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2 pt-4">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
                      >
                        {isSavingProfile ? 'Saving...' : (customerProfile ? 'Update Profile' : 'Create Account')}
                      </button>
                      {customerProfile && (
                        <button
                          type="button"
                          onClick={handleDeleteCustomer}
                          disabled={isSavingProfile}
                          className="px-6 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* Address Management */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">My Addresses</h3>
                  {customerProfile && !showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-sm"
                    >
                      + Add Address
                    </button>
                  )}
                </div>

                {!customerProfile ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-500">Create or load your profile first</p>
                  </div>
                ) : showAddressForm ? (
                  <form onSubmit={handleCreateOrUpdateAddress} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Street Address <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={addressForm.street}
                        onChange={handleAddressFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123 Broadway Ave"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          City <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="New York"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          State <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={addressForm.state}
                          onChange={handleAddressFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="NY"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          Postal Code <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="postal_code"
                          value={addressForm.postal_code}
                          onChange={handleAddressFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="10027"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          Country <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={addressForm.country}
                          onChange={handleAddressFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="USA"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        {editingAddressId ? 'Update Address' : 'Add Address'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelAddressForm}
                        className="px-6 bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : isLoadingAddresses ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading addresses...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-500 mb-4">No addresses saved</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {addresses.map((address) => (
                      <div
                        key={address.address_id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{address.street}</p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} {address.postal_code}
                            </p>
                            <p className="text-sm text-gray-600">{address.country}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.address_id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Account

