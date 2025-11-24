// Inventory Microservice Integration
// Use proxy in development to avoid CORS issues, direct URL in production
const INVENTORY_API_BASE = "http://34.170.237.251:8000";  // ⚠️ UPDATE THIS with your deployed inventory service URL

// API Endpoints
const ENDPOINTS = {
  // Product endpoints
  products: `${INVENTORY_API_BASE}/products`,
  getProduct: (productId) => `${INVENTORY_API_BASE}/products/${productId}`,
  updateProduct: (productId) => `${INVENTORY_API_BASE}/products/${productId}`,
  deleteProduct: (productId) => `${INVENTORY_API_BASE}/products/${productId}`,
  
  // Inventory endpoints
  inventory: `${INVENTORY_API_BASE}/inventory`,
  getInventory: (inventoryId) => `${INVENTORY_API_BASE}/inventory/${inventoryId}`,
  getInventoryByProduct: (productId) => `${INVENTORY_API_BASE}/inventory/product/${productId}`,
  updateInventory: (inventoryId) => `${INVENTORY_API_BASE}/inventory/${inventoryId}`,
  adjustInventory: (inventoryId) => `${INVENTORY_API_BASE}/inventory/${inventoryId}/adjust`,
  deleteInventory: (inventoryId) => `${INVENTORY_API_BASE}/inventory/${inventoryId}`,
  inventoryStats: `${INVENTORY_API_BASE}/inventory/stats/summary`,
};

/**
 * ==========================================
 * PRODUCT OPERATIONS
 * ==========================================
 */

/**
 * Create a new product
 * @param {Object} productData - Product information
 * @param {string} productData.name - Product name
 * @param {string} productData.description - Product description
 * @param {number} productData.price - Product price
 * @param {string} productData.category - Product category
 * @param {Object} productData.metadata - Additional metadata (optional)
 * @returns {Promise<Object>} Created product
 */
export const createProduct = async (productData) => {
  try {
    const response = await fetch(ENDPOINTS.products, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Product creation failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      console.error('CORS Error: The inventory service may not allow requests from this origin');
      throw new Error('Unable to connect to inventory service. Please check CORS configuration.');
    }
    console.error('Create product error:', error);
    throw error;
  }
};

/**
 * Get all products with optional filters
 * @param {Object} filters - Optional filter parameters
 * @param {string} filters.category - Filter by category
 * @param {number} filters.min_price - Minimum price
 * @param {number} filters.max_price - Maximum price
 * @param {number} filters.skip - Number of records to skip
 * @param {number} filters.limit - Maximum number of records to return
 * @returns {Promise<Array>} List of products
 */
export const getAllProducts = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        queryParams.append(key, filters[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `${ENDPOINTS.products}?${queryString}` : ENDPOINTS.products;

    console.log('Fetching products from:', url);

    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Products API error response:', errorData);
      throw new Error(errorData.detail || `Failed to fetch products: ${response.status}`);
    }

    const data = await response.json();
    console.log('Products API response:', data);
    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      console.error('CORS Error: The inventory service may not allow requests from this origin');
      throw new Error('Unable to connect to inventory service. Please check CORS configuration.');
    }
    console.error('Get all products error:', error);
    throw error;
  }
};

/**
 * Get a specific product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Product details
 */
export const getProduct = async (productId) => {
  try {
    const response = await fetch(ENDPOINTS.getProduct(productId), {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to fetch product: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get product error:', error);
    throw error;
  }
};

/**
 * Update a product
 * @param {string} productId - Product ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated product
 */
export const updateProduct = async (productId, updateData) => {
  try {
    const response = await fetch(ENDPOINTS.updateProduct(productId), {
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
      throw new Error(errorData.detail || `Product update failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Update product error:', error);
    throw error;
  }
};

/**
 * Delete a product
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await fetch(ENDPOINTS.deleteProduct(productId), {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Product deletion failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Delete product error:', error);
    throw error;
  }
};

/**
 * ==========================================
 * INVENTORY OPERATIONS
 * ==========================================
 */

/**
 * Create inventory record for a product
 * @param {Object} inventoryData - Inventory information
 * @param {string} inventoryData.product_id - Product ID
 * @param {number} inventoryData.quantity - Available quantity
 * @param {string} inventoryData.warehouse_location - Warehouse location (optional)
 * @param {number} inventoryData.reorder_level - Reorder level (optional)
 * @param {Object} inventoryData.metadata - Additional metadata (optional)
 * @returns {Promise<Object>} Created inventory record
 */
export const createInventory = async (inventoryData) => {
  try {
    const response = await fetch(ENDPOINTS.inventory, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(inventoryData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Inventory creation failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      console.error('CORS Error: The inventory service may not allow requests from this origin');
      throw new Error('Unable to connect to inventory service. Please check CORS configuration.');
    }
    console.error('Create inventory error:', error);
    throw error;
  }
};

/**
 * Get all inventory records with optional filters
 * @param {Object} filters - Optional filter parameters
 * @param {string} filters.product_id - Filter by product ID
 * @param {number} filters.min_quantity - Minimum quantity
 * @param {number} filters.max_quantity - Maximum quantity
 * @param {string} filters.warehouse_location - Filter by warehouse location
 * @param {number} filters.skip - Number of records to skip
 * @param {number} filters.limit - Maximum number of records to return
 * @returns {Promise<Array>} List of inventory records
 */
export const getAllInventory = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        queryParams.append(key, filters[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `${ENDPOINTS.inventory}?${queryString}` : ENDPOINTS.inventory;

    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to fetch inventory: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      console.error('CORS Error: The inventory service may not allow requests from this origin');
      throw new Error('Unable to connect to inventory service. Please check CORS configuration.');
    }
    console.error('Get all inventory error:', error);
    throw error;
  }
};

/**
 * Get specific inventory record by ID
 * @param {string} inventoryId - Inventory ID
 * @returns {Promise<Object>} Inventory record details
 */
export const getInventory = async (inventoryId) => {
  try {
    const response = await fetch(ENDPOINTS.getInventory(inventoryId), {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to fetch inventory: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get inventory error:', error);
    throw error;
  }
};

/**
 * Get inventory by product ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Inventory record for the product
 */
export const getInventoryByProduct = async (productId) => {
  try {
    const url = ENDPOINTS.getInventoryByProduct(productId);
    console.log(`Fetching inventory for product ${productId} from:`, url);

    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Inventory API error for product ${productId}:`, errorData);
      throw new Error(errorData.detail || `Failed to fetch inventory for product: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Inventory for product ${productId}:`, data);
    return data;
  } catch (error) {
    console.error('Get inventory by product error:', error);
    throw error;
  }
};

/**
 * Update inventory record
 * @param {string} inventoryId - Inventory ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated inventory record
 */
export const updateInventory = async (inventoryId, updateData) => {
  try {
    const response = await fetch(ENDPOINTS.updateInventory(inventoryId), {
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
      throw new Error(errorData.detail || `Inventory update failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Update inventory error:', error);
    throw error;
  }
};

/**
 * Adjust inventory quantity (increase or decrease)
 * @param {string} inventoryId - Inventory ID
 * @param {Object} adjustData - Adjustment data
 * @param {number} adjustData.quantity_change - Quantity to add (positive) or remove (negative)
 * @param {string} adjustData.reason - Reason for adjustment (optional)
 * @returns {Promise<Object>} Updated inventory record
 */
export const adjustInventory = async (inventoryId, adjustData) => {
  try {
    const response = await fetch(ENDPOINTS.adjustInventory(inventoryId), {
      method: 'PATCH',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(adjustData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Inventory adjustment failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Adjust inventory error:', error);
    throw error;
  }
};

/**
 * Delete inventory record
 * @param {string} inventoryId - Inventory ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteInventory = async (inventoryId) => {
  try {
    const response = await fetch(ENDPOINTS.deleteInventory(inventoryId), {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Inventory deletion failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Delete inventory error:', error);
    throw error;
  }
};

/**
 * Get inventory summary statistics
 * @returns {Promise<Object>} Inventory statistics
 */
export const getInventoryStats = async () => {
  try {
    const response = await fetch(ENDPOINTS.inventoryStats, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to fetch inventory stats: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get inventory stats error:', error);
    throw error;
  }
};

/**
 * ==========================================
 * HELPER FUNCTIONS
 * ==========================================
 */

/**
 * Check if a product has sufficient inventory
 * @param {string} productId - Product ID
 * @param {number} requestedQuantity - Requested quantity
 * @returns {Promise<Object>} { available: boolean, currentStock: number }
 */
export const checkInventoryAvailability = async (productId, requestedQuantity) => {
  try {
    const inventory = await getInventoryByProduct(productId);
    // Use available_quantity (actual available stock) or fall back to quantity
    const currentStock = inventory.available_quantity ?? inventory.quantity ?? 0;
    
    return {
      available: currentStock >= requestedQuantity,
      currentStock: currentStock,
      requestedQuantity: requestedQuantity,
      shortage: Math.max(0, requestedQuantity - currentStock)
    };
  } catch (error) {
    console.error('Check inventory availability error:', error);
    // If we can't check inventory, assume not available for safety
    return {
      available: false,
      currentStock: 0,
      requestedQuantity: requestedQuantity,
      shortage: requestedQuantity,
      error: error.message
    };
  }
};

/**
 * Reduce inventory after a successful purchase
 * @param {Array} cartItems - Array of cart items with {id, quantity}
 * @returns {Promise<Array>} Array of adjustment results
 */
export const reduceInventoryForPurchase = async (cartItems) => {
  try {
    const adjustmentPromises = cartItems.map(async (item) => {
      try {
        // Get inventory record for the product
        const inventory = await getInventoryByProduct(item.id);
        
        // Get the inventory ID (could be 'id', 'inventory_id', or other field)
        const inventoryId = inventory.id || inventory.inventory_id || inventory._id;
        
        if (!inventoryId) {
          throw new Error('Inventory ID not found in response');
        }
        
        console.log(`Adjusting inventory ${inventoryId} for product ${item.id}: reducing by ${item.quantity}`);
        
        // Adjust inventory (negative quantity to reduce)
        const result = await adjustInventory(inventoryId, {
          adjustment: -item.quantity,
          reason: 'Purchase completed'
        });
        
        return {
          productId: item.id,
          success: true,
          result: result
        };
      } catch (error) {
        console.error(`Failed to adjust inventory for product ${item.id}:`, error);
        return {
          productId: item.id,
          success: false,
          error: error.message
        };
      }
    });
    
    const results = await Promise.all(adjustmentPromises);
    
    // Check if any adjustments failed
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      console.warn('Some inventory adjustments failed:', failures);
    } else {
      console.log('All inventory adjustments successful');
    }
    
    return results;
  } catch (error) {
    console.error('Reduce inventory for purchase error:', error);
    throw error;
  }
};

// Export all functions
export default {
  // Product operations
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  
  // Inventory operations
  createInventory,
  getAllInventory,
  getInventory,
  getInventoryByProduct,
  updateInventory,
  adjustInventory,
  deleteInventory,
  getInventoryStats,
  
  // Helper functions
  checkInventoryAvailability,
  reduceInventoryForPurchase,
  
  // Endpoints for reference
  ENDPOINTS,
};

