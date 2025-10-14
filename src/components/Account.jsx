function Account() {
  return (
    <section id="account" className="py-20 bg-gray-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">My Account</h2>
          <p className="text-gray-600 text-lg">Powered by our User Microservice</p>
        </div>
        
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="your.email@example.com"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Password</label>
            <input 
              type="password" 
              id="password" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500" />
              <span className="ml-2 text-gray-700 text-sm">Remember me</span>
            </label>
            <a href="#" className="text-blue-600 hover:text-blue-700 text-sm">Forgot password?</a>
          </div>
          
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 mb-4">
            Login
          </button>
          
          <div className="text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">Sign Up</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Account

