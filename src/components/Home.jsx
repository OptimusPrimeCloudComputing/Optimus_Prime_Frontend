import { Link } from 'react-router-dom'

function Home() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
          Welcome to the Future of Shopping
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Experience seamless cloud-powered e-commerce with cutting-edge microservices architecture
        </p>
        <Link 
          to="/products" 
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Shop Now
        </Link>
      </div>
    </section>
  )
}

export default Home

