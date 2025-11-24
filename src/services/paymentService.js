// Payment Microservice Integration
// Use proxy in development to avoid CORS issues, direct URL in production
const PAYMENT_API_BASE = "https://payment-microservice-rpvtfzgvpa-uc.a.run.app";  // Direct URL in production

/**
 * Helper function to convert dollars to cents
 * @param {number} dollars - Amount in dollars
 * @returns {number} Amount in cents
 */
export const dollarsToCents = (dollars) => {
  return Math.round(dollars * 100);
};

/**
 * Helper function to convert cents to dollars
 * @param {number} cents - Amount in cents
 * @returns {number} Amount in dollars
 */
export const centsToDollars = (cents) => {
  return cents / 100;
};

// API Endpoints
const ENDPOINTS = {
  health: `${PAYMENT_API_BASE}/health`,
  apiDocs: `${PAYMENT_API_BASE}/api-docs`,
  
  // Payment operations
  initiatePayment: `${PAYMENT_API_BASE}/payments/initiate`,
  getPayment: (paymentId) => `${PAYMENT_API_BASE}/payments/${paymentId}`,
  updatePayment: (paymentId) => `${PAYMENT_API_BASE}/payments/${paymentId}`,
  cancelPayment: (paymentId) => `${PAYMENT_API_BASE}/payments/${paymentId}`,
  
  // Webhook & Refund
  webhook: `${PAYMENT_API_BASE}/payments/webhook`,
  initiateRefund: (paymentId) => `${PAYMENT_API_BASE}/payments/refund/${paymentId}`
};

/**
 * Initiate a new payment
 * @param {Object} paymentData - Payment information
 * @param {string} paymentData.orderId - Unique order identifier
 * @param {number} paymentData.amount - Payment amount in cents (e.g., 4999 = $49.99)
 * @param {string} paymentData.currency - Currency code (e.g., "USD")
 * @param {string} paymentData.method - Payment method ("CARD", "PAYPAL", "BANK_TRANSFER")
 * @param {string} paymentData.returnUrl - URL to redirect after payment
 * @param {Object} paymentData.metadata - Additional metadata (optional)
 * @returns {Promise<Object>} Payment response with payment_id and status
 */
export const initiatePayment = async (paymentData) => {
  try {
    const response = await fetch(ENDPOINTS.initiatePayment, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Payment initiation failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Better CORS error detection
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      console.error('CORS Error: The payment service may not allow requests from this origin');
      throw new Error('Unable to connect to payment service. Please check CORS configuration.');
    }
    console.error('Payment initiation error:', error);
    throw error;
  }
};

/**
 * Get payment details by ID
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} Payment details
 */
export const getPayment = async (paymentId) => {
  try {
    const response = await fetch(ENDPOINTS.getPayment(paymentId), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to fetch payment: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get payment error:', error);
    throw error;
  }
};

/**
 * Update payment status
 * @param {string} paymentId - Payment ID
 * @param {Object} updateData - Update data
 * @param {string} updateData.status - New status (completed, failed, cancelled)
 * @returns {Promise<Object>} Update response
 */
export const updatePayment = async (paymentId, updateData) => {
  try {
    const response = await fetch(ENDPOINTS.updatePayment(paymentId), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Payment update failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Payment update error:', error);
    throw error;
  }
};

/**
 * Cancel a payment
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} Cancellation response
 */
export const cancelPayment = async (paymentId) => {
  try {
    const response = await fetch(ENDPOINTS.cancelPayment(paymentId), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Payment cancellation failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Payment cancellation error:', error);
    throw error;
  }
};

/**
 * Initiate a refund
 * @param {string} paymentId - Payment ID
 * @param {Object} refundData - Refund data
 * @param {number} refundData.amount - Refund amount
 * @param {string} refundData.reason - Refund reason
 * @returns {Promise<Object>} Refund response
 */
export const initiateRefund = async (paymentId, refundData) => {
  try {
    const response = await fetch(ENDPOINTS.initiateRefund(paymentId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refundData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Refund initiation failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Refund initiation error:', error);
    throw error;
  }
};

/**
 * Check API health
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(ENDPOINTS.health);
    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

export default {
  initiatePayment,
  getPayment,
  updatePayment,
  cancelPayment,
  initiateRefund,
  checkHealth,
  dollarsToCents,
  centsToDollars,
  ENDPOINTS,
};

