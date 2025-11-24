// Customer Microservice Integration
// Use proxy in development to avoid CORS issues, direct URL in production
const CUSTOMER_API_BASE = "https://customermicroservice-453095374298.europe-west1.run.app";

// API Endpoints
const ENDPOINTS = {
health: `${CUSTOMER_API_BASE}/health`,
  
  // Customer operations
  createCustomer: `${CUSTOMER_API_BASE}/customers`,
  getCustomer: (universityId) => `${CUSTOMER_API_BASE}/customers/${universityId}`,
  updateCustomer: (universityId) => `${CUSTOMER_API_BASE}/customers/${universityId}`,
  deleteCustomer: (universityId) => `${CUSTOMER_API_BASE}/customers/${universityId}`,
  
  // Address operations
  createAddress: (universityId) => `${CUSTOMER_API_BASE}/customers/${universityId}/addresses`,
  listAddresses: (universityId) => `${CUSTOMER_API_BASE}/customers/${universityId}/addresses`,
  updateAddress: (universityId, addressId) => `${CUSTOMER_API_BASE}/customers/${universityId}/addresses/${addressId}`,
  deleteAddress: (universityId, addressId) => `${CUSTOMER_API_BASE}/customers/${universityId}/addresses/${addressId}`,
};

/**
 * Check API health
 * @returns {Promise<Object>} Health status with IP, status, message, timestamp
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(ENDPOINTS.health);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

/**
 * Create a new customer
 * @param {Object} customerData - Customer information
 * @param {string} customerData.university_id - University ID (required)
 * @param {string} customerData.email - Email address (required)
 * @param {string} customerData.first_name - First name (required)
 * @param {string} customerData.last_name - Last name (required)
 * @param {string} customerData.middle_name - Middle name (optional)
 * @param {string} customerData.birth_date - Birth date (YYYY-MM-DD)
 * @param {string} customerData.phone - Phone number
 * @param {string} customerData.status - Status (active/inactive)
 * @param {Array} customerData.address - Array of address objects
 * @returns {Promise<Object>} Created customer with customer_id
 */
export const createCustomer = async (customerData) => {
  try {
    const response = await fetch(ENDPOINTS.createCustomer, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Customer creation failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Customer creation error:', error);
    throw error;
  }
};

/**
 * Get customer by university ID
 * @param {string} universityId - University ID
 * @returns {Promise<Object>} Customer details
 */
export const getCustomer = async (universityId) => {
  try {
    const response = await fetch(ENDPOINTS.getCustomer(universityId), {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Failed to fetch customer: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get customer error:', error);
    throw error;
  }
};

/**
 * Update customer information
 * @param {string} universityId - University ID
 * @param {Object} updateData - Fields to update
 * @param {string} updateData.email - Email address (optional)
 * @param {string} updateData.first_name - First name (optional)
 * @param {string} updateData.last_name - Last name (optional)
 * @param {string} updateData.middle_name - Middle name (optional)
 * @param {string} updateData.phone - Phone number (optional)
 * @param {string} updateData.status - Status (optional)
 * @returns {Promise<Object>} Updated customer details
 */
export const updateCustomer = async (universityId, updateData) => {
  try {
    const response = await fetch(ENDPOINTS.updateCustomer(universityId), {
      method: 'PATCH',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Customer update failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Customer update error:', error);
    throw error;
  }
};

/**
 * Delete customer
 * @param {string} universityId - University ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteCustomer = async (universityId) => {
  try {
    const response = await fetch(ENDPOINTS.deleteCustomer(universityId), {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Customer deletion failed: ${response.status}`);
    }

    // DELETE might return empty response
    const text = await response.text();
    return text ? JSON.parse(text) : { message: 'Customer deleted successfully' };
  } catch (error) {
    console.error('Customer deletion error:', error);
    throw error;
  }
};

/**
 * Create a new address for customer
 * @param {string} universityId - University ID
 * @param {Object} addressData - Address information
 * @param {string} addressData.street - Street address (required)
 * @param {string} addressData.city - City (required)
 * @param {string} addressData.state - State (required)
 * @param {string} addressData.postal_code - Postal code (required)
 * @param {string} addressData.country - Country (required)
 * @returns {Promise<Object>} Created address with address_id
 */
export const createAddress = async (universityId, addressData) => {
  try {
    const response = await fetch(ENDPOINTS.createAddress(universityId), {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        ...addressData,
        university_id: universityId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Address creation failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Address creation error:', error);
    throw error;
  }
};

/**
 * Get all addresses for customer
 * @param {string} universityId - University ID
 * @returns {Promise<Array>} Array of address objects
 */
export const listAddresses = async (universityId) => {
  try {
    const response = await fetch(ENDPOINTS.listAddresses(universityId), {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Failed to fetch addresses: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('List addresses error:', error);
    throw error;
  }
};

/**
 * Update an address
 * @param {string} universityId - University ID
 * @param {string} addressId - Address ID
 * @param {Object} updateData - Fields to update
 * @param {string} updateData.street - Street address (optional)
 * @param {string} updateData.city - City (optional)
 * @param {string} updateData.state - State (optional)
 * @param {string} updateData.postal_code - Postal code (optional)
 * @param {string} updateData.country - Country (optional)
 * @returns {Promise<Object>} Updated address details
 */
export const updateAddress = async (universityId, addressId, updateData) => {
  try {
    const response = await fetch(ENDPOINTS.updateAddress(universityId, addressId), {
      method: 'PATCH',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Address update failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Address update error:', error);
    throw error;
  }
};

/**
 * Delete an address
 * @param {string} universityId - University ID
 * @param {string} addressId - Address ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteAddress = async (universityId, addressId) => {
  try {
    const response = await fetch(ENDPOINTS.deleteAddress(universityId, addressId), {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Address deletion failed: ${response.status}`);
    }

    // DELETE might return empty response
    const text = await response.text();
    return text ? JSON.parse(text) : { message: 'Address deleted successfully' };
  } catch (error) {
    console.error('Address deletion error:', error);
    throw error;
  }
};

export default {
  checkHealth,
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  createAddress,
  listAddresses,
  updateAddress,
  deleteAddress,
  ENDPOINTS,
};

