import { useState, useEffect, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Spinner from '../components/ui/Spinner'
import { toast } from 'react-hot-toast'
import AuthContext from '../context/AuthContext'
import { FaClock, FaMoneyBillWave, FaArrowLeft } from 'react-icons/fa'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ServiceDetails = () => {
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingDate, setBookingDate] = useState('')
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, currentUser } = useContext(AuthContext)

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`${API_URL}/services/${id}`)
        setService(response.data.data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching service:', error)
        toast.error('Failed to load service details')
        setLoading(false)
      }
    }

    fetchService()
  }, [id])

  const handleBookService = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated()) {
      toast.error('Please log in to book this service')
      navigate('/login')
      return
    }
    
    if (!bookingDate) {
      toast.error('Please select a date')
      return
    }
    
    try {
      await axios.post(`${API_URL}/service-orders`, {
        serviceId: service._id,
        date: bookingDate,
        guestId: currentUser._id
      })
      
      toast.success('Service booked successfully')
      navigate('/service-orders')
    } catch (error) {
      console.error('Error booking service:', error)
      toast.error(error.response?.data?.error || 'Failed to book service')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Service not found</h2>
        <p className="mb-4">The service you are looking for does not exist or has been removed.</p>
        <Link to="/services" className="btn-primary inline-block">
          Back to Services
        </Link>
      </div>
    )
  }

  // Calculate the minimum date (today)
  const today = new Date()
  const minDate = today.toISOString().split('T')[0]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/services" className="flex items-center text-primary-600 hover:text-primary-800">
          <FaArrowLeft className="mr-2" />
          Back to Services
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service Image */}
        <div className="bg-gray-100 rounded-lg overflow-hidden h-[400px]">
          {service.images && service.images.length > 0 ? (
            <img 
              src={service.images[0]} 
              alt={service.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
        </div>
        
        {/* Service Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{service.name}</h1>
          
          <div className="flex items-center mb-4 text-gray-600">
            <div className="flex items-center mr-6">
              <FaClock className="mr-2" />
              <span>{service.duration} minutes</span>
            </div>
            <div className="flex items-center">
              <FaMoneyBillWave className="mr-2" />
              <span>${service.price}</span>
            </div>
          </div>
          
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-xl font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{service.description}</p>
          </div>
          
          {service.isAvailable ? (
            <div>
              <h3 className="text-xl font-semibold mb-4">Book this Service</h3>
              <form onSubmit={handleBookService}>
                <div className="mb-4">
                  <label htmlFor="date" className="block mb-2 text-gray-700">
                    Select Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={bookingDate}
                    min={minDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <button type="submit" className="btn-primary w-full">
                  Book Now
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-red-100 text-red-800 p-4 rounded-md">
              This service is currently unavailable for booking.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceDetails 