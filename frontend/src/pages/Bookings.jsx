import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { FaCalendarAlt, FaUsers, FaBed, FaMoneyBillWave, FaCheck, FaTimes, FaSpinner, FaUser } from 'react-icons/fa'
import Spinner from '../components/ui/Spinner'
import AuthContext from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const { currentUser } = useContext(AuthContext)
  
  useEffect(() => {
    fetchBookings()
  }, [])
  
  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/bookings?populate=room,guest`)
      setBookings(response.data.data)
      setLoading(false)
    } catch (error) {
      toast.error('Error fetching bookings')
      setLoading(false)
    }
  }
  
  const handleCancelBooking = async (bookingId) => {
    try {
      setActionLoading(bookingId)
      
      await axios.put(`${API_URL}/bookings/${bookingId}`, {
        status: 'cancelled'
      })
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: 'cancelled' } 
          : booking
      ))
      
      toast.success('Booking cancelled successfully')
      setActionLoading(null)
    } catch (error) {
      toast.error('Error cancelling booking')
      setActionLoading(null)
    }
  }
  
  // Helper to format dates
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  // Helper to get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  if (loading) {
    return <Spinner />
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-bold mb-2">No Bookings Found</h2>
          <p className="text-gray-600 mb-4">You haven't booked any rooms yet.</p>
          <Link to="/rooms" className="btn-primary">
            Browse Rooms
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map(booking => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">
                      {booking.room?.name || 'Room'}
                    </h2>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <span className="text-2xl font-bold text-gray-900">${booking.totalPrice}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Check In</p>
                      <p className="font-medium">{formatDate(booking.checkInDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Check Out</p>
                      <p className="font-medium">{formatDate(booking.checkOutDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FaUsers className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Guests</p>
                      <p className="font-medium">{booking.guests}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FaMoneyBillWave className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="font-medium">${booking.totalPrice}</p>
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <div className="flex items-start">
                    <FaUser className="text-gray-500 mr-2 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">Client</p>
                      <p className="font-medium">
                        {booking.guest?.firstName} {booking.guest?.lastName} 
                      </p>
                      {booking.guest?.email && (
                        <p className="text-sm text-gray-600">{booking.guest.email}</p>
                      )}
                      {booking.guest?.phone && (
                        <p className="text-sm text-gray-600">{booking.guest.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <Link 
                    to={`/rooms/${booking.room?._id}`} 
                    className="text-primary-600 hover:text-primary-700"
                  >
                    View Room Details
                  </Link>
                  
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={actionLoading === booking._id}
                      className="flex items-center text-red-600 hover:text-red-700"
                    >
                      {actionLoading === booking._id ? (
                        <FaSpinner className="animate-spin mr-1" />
                      ) : (
                        <FaTimes className="mr-1" />
                      )}
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Bookings 