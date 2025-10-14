import { useDispatch } from 'react-redux'
import { addToCart } from '../store/cartSlice'

// Product data
const products = [
  {
    id: 1,
    name: 'Premium Product 1',
    description: 'High-quality item with excellent features',
    price: 99.99,
    gradient: 'from-blue-100 to-blue-200',
    iconColor: 'text-blue-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    )
  },
  {
    id: 2,
    name: 'Premium Product 2',
    description: 'Latest technology at your fingertips',
    price: 149.99,
    gradient: 'from-green-100 to-green-200',
    iconColor: 'text-green-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    )
  },
  {
    id: 3,
    name: 'Premium Product 3',
    description: 'Professional grade equipment',
    price: 199.99,
    gradient: 'from-purple-100 to-purple-200',
    iconColor: 'text-purple-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    )
  },
  {
    id: 4,
    name: 'Premium Product 4',
    description: 'Entertainment at its finest',
    price: 79.99,
    gradient: 'from-yellow-100 to-yellow-200',
    iconColor: 'text-yellow-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    )
  },
  {
    id: 5,
    name: 'Premium Product 5',
    description: 'Capture every moment beautifully',
    price: 299.99,
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
    id: 6,
    name: 'Premium Product 6',
    description: 'Crystal clear audio quality',
    price: 129.99,
    gradient: 'from-indigo-100 to-indigo-200',
    iconColor: 'text-indigo-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    )
  }
]

function Products() {
  const dispatch = useDispatch()

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
    }))
  }

  return (
    <section id="products" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Products</h2>
          <p className="text-gray-600 text-lg">Powered by our Inventory Microservice</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
              <div className={`bg-gradient-to-br ${product.gradient} h-64 flex items-center justify-center`}>
                <svg className={`w-24 h-24 ${product.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {product.icon}
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Products

