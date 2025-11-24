import { useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { addToCart } from '../store/cartSlice'
import { getAllProducts, getInventoryByProduct } from '../services/inventoryService'

// Gradient and icon mappings for visual variety
const visualStyles = [
  {
    gradient: 'from-blue-100 to-blue-200',
    iconColor: 'text-blue-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    )
  },
  {
    gradient: 'from-green-100 to-green-200',
    iconColor: 'text-green-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    )
  },
  {
    gradient: 'from-purple-100 to-purple-200',
    iconColor: 'text-purple-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    )
  },
  {
    gradient: 'from-yellow-100 to-yellow-200',
    iconColor: 'text-yellow-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    )
  },
  {
    gradient: 'from-red-100 to-red-200',
    iconColor: 'text-red-400',
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    )
  },
  {
    gradient: 'from-indigo-100 to-indigo-200',
    iconColor: 'text-indigo-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    )
  }
]

function Products() {
  const dispatch = useDispatch()
  const [products, setProducts] = useState([])
  const [productsWithInventory, setProductsWithInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch products and their inventory on component mount
  useEffect(() => {
    const fetchProductsAndInventory = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch all products
        const response = await getAllProducts()
        console.log('Raw API response:', response)
        
        // Handle different response formats
        let productsData = response
        
        // Check if response is wrapped in an object
        if (response && !Array.isArray(response)) {
          if (Array.isArray(response.products)) {
            productsData = response.products
          } else if (Array.isArray(response.data)) {
            productsData = response.data
          } else if (Array.isArray(response.items)) {
            productsData = response.items
          } else {
            console.error('Unexpected response format:', response)
            throw new Error('API returned unexpected format. Expected an array of products.')
          }
        }
        
        // Ensure we have an array
        if (!Array.isArray(productsData)) {
          console.error('Products data is not an array:', productsData)
          throw new Error('Invalid products data format')
        }
        
        console.log('Products data:', productsData)
        setProducts(productsData)
        
        // Check if there are no products
        if (productsData.length === 0) {
          console.warn('No products returned from API')
          setProductsWithInventory([])
          return
        }
        
        // Fetch inventory for each product
        const productsWithInventoryData = await Promise.all(
          productsData.map(async (product, index) => {
            try {
              const inventory = await getInventoryByProduct(product.id || product.product_id)
              const style = visualStyles[index % visualStyles.length]
              
              // Use available_quantity (actual available stock) or fall back to quantity
              const availableStock = inventory?.available_quantity ?? inventory?.quantity ?? 0
              
              return {
                ...product,
                // Parse price to number if it's a string
                price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                inventory: inventory,
                stock: availableStock,
                inStock: availableStock > 0,
                gradient: style.gradient,
                iconColor: style.iconColor,
                icon: style.icon,
              }
            } catch (invError) {
              console.warn(`Failed to fetch inventory for product ${product.id}:`, invError)
              const style = visualStyles[index % visualStyles.length]
              // If inventory fetch fails, show product as unavailable
              return {
                ...product,
                // Parse price to number if it's a string
                price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                inventory: null,
                stock: 0,
                inStock: false,
                gradient: style.gradient,
                iconColor: style.iconColor,
                icon: style.icon,
              }
            }
          })
        )
        
        setProductsWithInventory(productsWithInventoryData)
      } catch (err) {
        console.error('Failed to fetch products:', err)
        setError(err.message || 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProductsAndInventory()
  }, [])

  const handleAddToCart = (product) => {
    // Check if product is in stock
    if (!product.inStock || product.stock <= 0) {
      alert('This product is currently out of stock')
      return
    }

    dispatch(addToCart({
      id: product.id || product.product_id,
      name: product.name,
      price: product.price,
    }))
  }

  // Loading state
  if (loading) {
    return (
      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Products</h2>
            <p className="text-gray-600 text-lg">Powered by our Inventory Microservice</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-200 h-64 flex items-center justify-center animate-pulse">
                  <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Products</h2>
            <p className="text-gray-600 text-lg">Powered by our Inventory Microservice</p>
          </div>
          
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Failed to Load Products</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-300"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Empty state
  if (productsWithInventory.length === 0) {
    return (
      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Products</h2>
            <p className="text-gray-600 text-lg">Powered by our Inventory Microservice</p>
          </div>
          
          <div className="text-center py-12">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-500 text-lg">No products available at the moment</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="products" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Products</h2>
          <p className="text-gray-600 text-lg">Powered by our Inventory Microservice</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {productsWithInventory.map((product) => {
            const isLowStock = product.stock > 0 && product.stock <= 5
            const isOutOfStock = !product.inStock || product.stock <= 0
            
            return (
              <div key={product.id || product.product_id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
                <div className={`bg-gradient-to-br ${product.gradient} h-64 flex items-center justify-center relative`}>
                  <svg className={`w-24 h-24 ${product.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {product.icon}
                  </svg>
                  
                  {/* Stock badge */}
                  {isOutOfStock && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Out of Stock
                    </div>
                  )}
                  {isLowStock && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Low Stock
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  
                  {/* Stock information */}
                  <div className="mb-4">
                    <p className={`text-sm font-semibold ${
                      isOutOfStock ? 'text-red-600' :
                      isLowStock ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {isOutOfStock ? 'Out of Stock' :
                       isLowStock ? `Only ${product.stock} left!` :
                       `${product.stock} in stock`}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={`px-4 py-2 rounded-lg transition duration-300 ${
                        isOutOfStock 
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                      }`}
                    >
                      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Products

