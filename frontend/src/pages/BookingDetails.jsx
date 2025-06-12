import { useState, useEffect, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { FaCalendarAlt, FaUser, FaBed, FaMoneyBillWave, FaArrowLeft, FaEnvelope, FaPhone, FaCheck, FaTimes } from 'react-icons/fa'
import Spinner from '../components/ui/Spinner'
import AuthContext from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const BookingDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const { hasAdminAccess, isAdmin } = useContext(AuthContext)
  
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}/bookings/${id}?populate=room,guest`)
        if (!response.data || !response.data.data) {
          throw new Error('Invalid response format')
        }
        setBooking(response.data.data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching booking details:', error)
        toast.error(error.response?.data?.error || 'Failed to load booking details')
        setLoading(false)
        navigate('/admin')
      }
    }
    
    fetchBookingDetails()
  }, [id, navigate])
  
  const handleUpdateStatus = async (newStatus) => {
    if (!id || !newStatus) {
      toast.error('Missing booking ID or status')
      return
    }
    
    try {
      setActionLoading(true)
      
      // Make sure we're sending the exact required fields
      const updateData = { 
        status: newStatus 
      }
      
      const response = await axios.put(`${API_URL}/bookings/${id}`, updateData)
      
      if (response.data && response.data.success) {
        // Update local state
        setBooking(prev => ({
          ...prev,
          status: newStatus
        }))
        
        toast.success(`Booking ${newStatus} successfully`)
      } else {
        throw new Error('Server responded without success flag')
      }
    } catch (error) {
      console.error(`Error updating booking status:`, error)
      toast.error(error.response?.data?.error || `Failed to update booking status`)
    } finally {
      setActionLoading(false)
    }
  }
  
  const handleDeleteBooking = async () => {
    if (!id) {
      toast.error('Missing booking ID')
      return
    }
    
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        setActionLoading(true)
        const response = await axios.delete(`${API_URL}/bookings/${id}`)
        
        if (response.data && response.data.success) {
          toast.success('Booking deleted successfully')
          navigate('/admin')
        } else {
          throw new Error('Server responded without success flag')
        }
      } catch (error) {
        console.error('Error deleting booking:', error)
        toast.error(error.response?.data?.error || 'Failed to delete booking')
      } finally {
        setActionLoading(false)
      }
    }
  }
  
  // Helper to format dates
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
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
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner />
      </div>
    )
  }
  
  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Booking not found</h2>
        <p className="mb-4">The booking you are looking for does not exist or has been removed.</p>
        <Link to="/admin" className="btn-primary inline-block">
          Back to Admin Dashboard
        </Link>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/admin" className="flex items-center text-primary-600 hover:text-primary-800">
          <FaArrowLeft className="mr-2" />
          Back to Admin Dashboard
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-bold mb-2">Booking Details</h1>
              <div className="text-gray-500">
                ID: <span className="font-medium">{booking._id}</span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Guest Information */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <FaUser className="mr-2 text-gray-500" />
                  Guest Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">
                      {booking.guest?.firstName} {booking.guest?.lastName}
                    </p>
                  </div>
                  
                  {booking.guest?.email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium flex items-center">
                        <FaEnvelope className="mr-2 text-gray-400" size={14} />
                        {booking.guest.email}
                      </p>
                    </div>
                  )}
                  
                  {booking.guest?.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium flex items-center">
                        <FaPhone className="mr-2 text-gray-400" size={14} />
                        {booking.guest.phone}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500">Number of Guests</p>
                    <p className="font-medium">{booking.guests}</p>
                  </div>
                </div>
              </div>
              
              {/* Room Information */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <FaBed className="mr-2 text-gray-500" />
                  Room Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Room</p>
                    <p className="font-medium">
                      {booking.room?.name || 'Unknown Room'}
                      {booking.room?.roomNumber && ` (${booking.room.roomNumber})`}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Room Type</p>
                    <p className="font-medium capitalize">
                      {booking.room?.type || 'Unknown'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Check In</p>
                    <p className="font-medium">{formatDate(booking.checkInDate)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Check Out</p>
                    <p className="font-medium">{formatDate(booking.checkOutDate)}</p>
                  </div>
                </div>
                
                {booking.room?._id && (
                  <div className="mt-4">
                    <Link 
                      to={`/rooms/${booking.room._id}`}
                      className="text-primary-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Room Details
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Payment Information */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <FaMoneyBillWave className="mr-2 text-gray-500" />
                  Payment Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Price per Night</p>
                    <p className="font-medium">${booking.pricePerNight}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Number of Nights</p>
                    <p className="font-medium">{booking.nights}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Total Price</p>
                    <p className="font-medium text-xl">${booking.totalPrice}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className="font-medium">
                      {booking.isPaid ? (
                        <span className="text-green-600 flex items-center">
                          <FaCheck className="mr-1" /> Paid
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center">
                          <FaTimes className="mr-1" /> Not Paid
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Admin Actions */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-bold mb-4">Actions</h2>
                
                <div className="space-y-3">
                  {booking.status !== 'confirmed' && hasAdminAccess() && (
                    <button
                      onClick={() => handleUpdateStatus('confirmed')}
                      disabled={actionLoading}
                      className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Confirm Booking
                    </button>
                  )}
                  
                  {booking.status !== 'cancelled' && hasAdminAccess() && (
                    <button
                      onClick={() => handleUpdateStatus('cancelled')}
                      disabled={actionLoading}
                      className="w-full py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50"
                    >
                      Cancel Booking
                    </button>
                  )}
                  
                  {booking.status !== 'completed' && hasAdminAccess() && (
                    <button
                      onClick={() => handleUpdateStatus('completed')}
                      disabled={actionLoading}
                      className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Mark as Completed
                    </button>
                  )}
                  
                  {isAdmin() && (
                    <button
                      onClick={handleDeleteBooking}
                      disabled={actionLoading}
                      className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Delete Booking
                    </button>
                  )}
                </div>
              </div>
              
              {booking.specialRequests && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-bold mb-2">Special Requests</h2>
                  <p className="text-gray-700">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetails 