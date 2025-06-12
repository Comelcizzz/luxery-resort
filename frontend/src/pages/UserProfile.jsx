import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import AuthContext from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const UserProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin, isStaff } = useContext(AuthContext)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [serviceOrders, setServiceOrders] = useState([])
  
  useEffect(() => {
    // Only admin or staff can access
    if (!isAdmin() && !isStaff()) {
      navigate('/admin')
      return
    }
    
    const fetchUserData = async () => {
      try {
        setLoading(true)
        
        // Fetch user data
        const userResponse = await axios.get(`${API_URL}/users/${id}`)
        setUser(userResponse.data.data)
        
        // Fetch user's bookings
        const bookingsResponse = await axios.get(`${API_URL}/bookings?guest=${id}&populate=room`)
        setBookings(bookingsResponse.data.data || [])
        
        // Fetch user's service orders
        const serviceOrdersResponse = await axios.get(`${API_URL}/service-orders?guest=${id}&populate=service`)
        setServiceOrders(serviceOrdersResponse.data.data || [])
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast.error('Failed to load user data')
        navigate('/admin')
      }
    }
    
    fetchUserData()
  }, [id, navigate, isAdmin, isStaff])
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-xl font-bold mb-4">User not found</h1>
          <p>The user with the specified ID does not exist or has been deleted.</p>
          <Link to="/admin" className="text-blue-500 mt-4 inline-block">Return to Admin Dashboard</Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <Link to="/admin" className="text-blue-500 hover:underline">← Return to Admin Dashboard</Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">User Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <div className="space-y-3">
              <p><span className="font-medium">Name:</span> {user.firstName} {user.lastName}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Role:</span> {user.role === 'admin' ? 'Administrator' : user.role === 'staff' ? 'Staff' : 'Client'}</p>
              <p><span className="font-medium">Phone Number:</span> {user.phone || 'Not specified'}</p>
              <p><span className="font-medium">Registration Date:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <div className="space-y-3">
              <p><span className="font-medium">Total Bookings:</span> {bookings.length}</p>
              <p><span className="font-medium">Total Service Orders:</span> {serviceOrders.length}</p>
            </div>
          </div>
        </div>
        
        {/* Bookings section */}
        {bookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Bookings</h2>
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">ID</th>
                    <th className="py-3 px-6 text-left">Room</th>
                    <th className="py-3 px-6 text-left">Check-in Date</th>
                    <th className="py-3 px-6 text-left">Check-out Date</th>
                    <th className="py-3 px-6 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {bookings.map(booking => (
                    <tr key={booking._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left">{booking._id.substring(0, 8)}...</td>
                      <td className="py-3 px-6 text-left">
                        {booking.room ? (
                          <Link 
                            to={`/rooms/${booking.room._id}`} 
                            className="text-blue-500 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {booking.room.roomNumber} ({booking.room.type})
                          </Link>
                        ) : 'Room not specified'}
                      </td>
                      <td className="py-3 px-6 text-left">{new Date(booking.checkInDate).toLocaleDateString()}</td>
                      <td className="py-3 px-6 text-left">{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                      <td className="py-3 px-6 text-left">
                        <span className={`py-1 px-3 rounded-full text-xs ${
                          booking.status === 'confirmed' ? 'bg-green-200 text-green-800' : 
                          booking.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                          'bg-red-200 text-red-800'
                        }`}>
                          {booking.status === 'confirmed' ? 'Confirmed' : 
                           booking.status === 'pending' ? 'Pending' : 
                           booking.status === 'cancelled' ? 'Cancelled' : 
                           booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Service Orders section */}
        {serviceOrders.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Service Orders</h2>
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">ID</th>
                    <th className="py-3 px-6 text-left">Service</th>
                    <th className="py-3 px-6 text-left">Date</th>
                    <th className="py-3 px-6 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {serviceOrders.map(order => (
                    <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left">{order._id.substring(0, 8)}...</td>
                      <td className="py-3 px-6 text-left">
                        {order.service ? (
                          <Link 
                            to={`/services/${order.service._id}`} 
                            className="text-blue-500 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {order.service.name}
                          </Link>
                        ) : 'Service not specified'}
                      </td>
                      <td className="py-3 px-6 text-left">{new Date(order.date).toLocaleDateString()}</td>
                      <td className="py-3 px-6 text-left">
                        <span className={`py-1 px-3 rounded-full text-xs ${
                          order.status === 'confirmed' ? 'bg-green-200 text-green-800' : 
                          order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                          'bg-red-200 text-red-800'
                        }`}>
                          {order.status === 'confirmed' ? 'Confirmed' : 
                           order.status === 'pending' ? 'Pending' : 
                           order.status === 'cancelled' ? 'Cancelled' : 
                           order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile 