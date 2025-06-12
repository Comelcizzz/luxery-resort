import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaSearch } from 'react-icons/fa'
import ServiceCard from '../components/services/ServiceCard'
import Spinner from '../components/ui/Spinner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Services = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchServices()
  }, [currentPage])

  const fetchServices = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      let queryParams = `?page=${currentPage}`
      
      if (searchQuery) {
        queryParams += `&search=${searchQuery}`
      }
      
      const response = await axios.get(`${API_URL}/services${queryParams}`)
      
      setServices(response.data.data)
      
      // Calculate total pages based on pagination data
      const total = response.data.pagination?.total || 0
      const limit = response.data.pagination?.limit || 10
      setTotalPages(Math.ceil(total / limit))
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching services:', error)
      setLoading(false)
    }
  }
  
  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
    fetchServices()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Services</h1>
      
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <form onSubmit={handleSearch} className="flex">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input pl-10 w-full"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button type="submit" className="btn-primary ml-2">
            Search
          </button>
        </form>
      </div>
      
      {loading ? (
        <Spinner />
      ) : services.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-xl text-gray-600">No services found.</h3>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                fetchServices()
              }}
              className="btn-primary mt-4"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {services.map(service => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-l-md border ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1
                  // Show max 5 page buttons
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-4 py-2 border-t border-b ${
                          pageNumber === currentPage
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  } else if (
                    (pageNumber === currentPage - 2 && currentPage > 3) ||
                    (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        className="px-4 py-2 border-t border-b bg-white text-gray-700"
                      >
                        ...
                      </button>
                    )
                  }
                  return null
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-r-md border ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Service Categories Section */}
      <section className="mt-12 py-8 bg-gray-50 rounded-lg">
        <div className="px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Our Service Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Spa & Wellness</h3>
              <p className="text-gray-600">
                Rejuvenate your body and mind with our world-class spa treatments
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Dining</h3>
              <p className="text-gray-600">
                Experience exquisite cuisine prepared by our world-class chefs
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Activities</h3>
              <p className="text-gray-600">
                Enjoy a wide range of recreational activities for all ages
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Concierge</h3>
              <p className="text-gray-600">
                Let our dedicated concierge team assist with all your needs
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Services 