import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUpAlt } from 'react-icons/fa'
import RoomCard from '../components/rooms/RoomCard'
import Spinner from '../components/ui/Spinner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Rooms = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    maxOccupancy: ''
  })
  const [sortOption, setSortOption] = useState('-createdAt')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [searchQuery, filters, sortOption, currentPage])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      let queryParams = `?page=${currentPage}&sort=${sortOption}`
      
      if (searchQuery) {
        queryParams += `&search=${searchQuery}`
      }
      
      if (filters.type) {
        queryParams += `&type=${filters.type}`
      }
      
      if (filters.minPrice) {
        queryParams += `&pricePerNight[gte]=${filters.minPrice}`
      }
      
      if (filters.maxPrice) {
        queryParams += `&pricePerNight[lte]=${filters.maxPrice}`
      }
      
      if (filters.maxOccupancy) {
        queryParams += `&maxOccupancy[gte]=${filters.maxOccupancy}`
      }
      
      const response = await axios.get(`${API_URL}/rooms${queryParams}`)
      
      setRooms(response.data.data)
      
      // Calculate total pages based on pagination data
      const total = response.data.pagination?.total || 0
      const limit = response.data.pagination?.limit || 10
      setTotalPages(Math.ceil(total / limit))
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching rooms:', error)
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
    fetchRooms()
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      type: '',
      minPrice: '',
      maxPrice: '',
      maxOccupancy: ''
    })
    setCurrentPage(1)
  }

  const toggleSortOrder = () => {
    setSortOption(prev => 
      prev === 'pricePerNight' ? '-pricePerNight' : 
      prev === '-pricePerNight' ? 'pricePerNight' : 
      prev === 'rating' ? '-rating' : 'rating'
    )
  }

  const handleSortChange = (e) => {
    setSortOption(e.target.value)
    setCurrentPage(1)
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Rooms</h1>
      
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-input pl-10 w-full"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </form>
          
          {/* Sort Options */}
          <div className="md:w-64">
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="form-input"
            >
              <option value="-createdAt">Newest</option>
              <option value="pricePerNight">Price: Low to High</option>
              <option value="-pricePerNight">Price: High to Low</option>
              <option value="-rating">Highest Rated</option>
            </select>
          </div>
          
          {/* Filter Toggle Button */}
          <button 
            onClick={toggleFilters}
            className="btn-outline flex items-center justify-center"
          >
            <FaFilter className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Room Type</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="form-input"
                >
                  <option value="">All Types</option>
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                  <option value="executive">Executive</option>
                  <option value="family">Family</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Min Price</label>
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="form-input"
                  min="0"
                />
              </div>
              
              <div>
                <label className="form-label">Max Price</label>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="form-input"
                  min="0"
                />
              </div>
              
              <div>
                <label className="form-label">Guests</label>
                <select
                  name="maxOccupancy"
                  value={filters.maxOccupancy}
                  onChange={handleFilterChange}
                  className="form-input"
                >
                  <option value="">Any</option>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="btn-outline mr-2"
              >
                Clear Filters
              </button>
              <button
                onClick={() => {
                  setCurrentPage(1)
                  fetchRooms()
                }}
                className="btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {loading ? (
        <Spinner />
      ) : rooms.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-xl text-gray-600">No rooms found matching your criteria.</h3>
          <button
            onClick={clearFilters}
            className="btn-primary mt-4"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Room count */}
          <p className="text-gray-600 mb-4">Found {rooms.length} rooms</p>
          
          {/* Room Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {rooms.map(room => (
              <RoomCard key={room._id} room={room} />
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
                  // Show max 5 page buttons (current, 2 before, 2 after)
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
    </div>
  )
}

export default Rooms 