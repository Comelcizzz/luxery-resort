import { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import AuthContext from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'
import { toast } from 'react-hot-toast'
import { FaHome, FaBed, FaHotel, FaCalendarCheck, FaClipboardList, FaUsers, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const ITEMS_PER_PAGE = 10

const AdminDashboard = () => {
  const { currentUser, hasAdminAccess, isAdmin, isStaff } = useContext(AuthContext)
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('overview')
  const [stats, setStats] = useState({
    roomCount: null,
    activeBookings: null,
    serviceOrders: null
  })
  const [loading, setLoading] = useState(true)
  
  // Rooms state
  const [rooms, setRooms] = useState([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [roomsPage, setRoomsPage] = useState(1)
  const [roomsTotalPages, setRoomsTotalPages] = useState(1)
  
  // Services state
  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [servicesPage, setServicesPage] = useState(1)
  const [servicesTotalPages, setServicesTotalPages] = useState(1)
  
  // Bookings state
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsPage, setBookingsPage] = useState(1)
  const [bookingsTotalPages, setBookingsTotalPages] = useState(1)
  
  // Service Orders state
  const [serviceOrders, setServiceOrders] = useState([])
  const [serviceOrdersLoading, setServiceOrdersLoading] = useState(false)
  const [serviceOrdersPage, setServiceOrdersPage] = useState(1)
  const [serviceOrdersTotalPages, setServiceOrdersTotalPages] = useState(1)
  
  // Clients state
  const [clients, setClients] = useState([])
  const [clientsLoading, setClientsLoading] = useState(false)
  const [clientsPage, setClientsPage] = useState(1)
  const [clientsTotalPages, setClientsTotalPages] = useState(1)
  
  useEffect(() => {
    // Check access to admin panel
    if (!hasAdminAccess()) {
      navigate('/')
    }
  }, [hasAdminAccess, navigate])
  
  // Define fetchStats outside of useEffect
  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch room count
      const roomsResponse = await axios.get(`${API_URL}/rooms?limit=1`)
      const roomCount = roomsResponse.data.count || 0
      
      // Fetch active bookings
      const bookingsResponse = await axios.get(`${API_URL}/bookings?limit=1`)
      const activeBookings = bookingsResponse.data.count || 0
      
      // Fetch service orders
      const serviceOrdersResponse = await axios.get(`${API_URL}/service-orders?limit=1`)
      const serviceOrders = serviceOrdersResponse.data.count || 0
      
      setStats({
        roomCount,
        activeBookings,
        serviceOrders
      })
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      setLoading(false)
    }
  }
  
  // Define fetchRooms outside of useEffect
  const fetchRooms = async () => {
    if (activeSection !== 'rooms' && !roomsLoading) return
    
    try {
      setRoomsLoading(true)
      const response = await axios.get(`${API_URL}/rooms?page=${roomsPage}&limit=${ITEMS_PER_PAGE}`)
      
      // Make sure isAvailable is properly parsed as a boolean
      const formattedRooms = (response.data.data || []).map(room => {
        // Convert isAvailable to boolean if it's not already
        // Some API responses might send "true"/"false" as strings or 1/0
        let isAvailable = room.isAvailable
        
        if (isAvailable === "true" || isAvailable === 1) {
          isAvailable = true
        } else if (isAvailable === "false" || isAvailable === 0) {
          isAvailable = false
        } else if (isAvailable === undefined || isAvailable === null) {
          // Default to available if not specified
          isAvailable = true
        }
        
        return {
          ...room,
          isAvailable: Boolean(isAvailable)
        }
      })
      
      setRooms(formattedRooms)
      setRoomsTotalPages(Math.ceil(response.data.count / ITEMS_PER_PAGE))
      setRoomsLoading(false)
    } catch (error) {
      console.error('Error fetching rooms:', error)
      setRoomsLoading(false)
    }
  }
  
  // Define fetchServices outside of useEffect
  const fetchServices = async () => {
    if (activeSection !== 'services' && !servicesLoading) return
    
    try {
      setServicesLoading(true)
      const response = await axios.get(`${API_URL}/services?page=${servicesPage}&limit=${ITEMS_PER_PAGE}`)
      
      // Make sure isAvailable is properly parsed as a boolean
      const formattedServices = (response.data.data || []).map(service => {
        // Convert isAvailable to boolean if it's not already
        // Some API responses might send "true"/"false" as strings or 1/0
        let isAvailable = service.isAvailable
        
        if (isAvailable === "true" || isAvailable === 1) {
          isAvailable = true
        } else if (isAvailable === "false" || isAvailable === 0) {
          isAvailable = false
        } else if (isAvailable === undefined || isAvailable === null) {
          // Default to available if not specified
          isAvailable = true
        }
        
        return {
          ...service,
          isAvailable: Boolean(isAvailable)
        }
      })
      
      setServices(formattedServices)
      setServicesTotalPages(Math.ceil(response.data.count / ITEMS_PER_PAGE))
      setServicesLoading(false)
    } catch (error) {
      console.error('Error fetching services:', error)
      setServicesLoading(false)
    }
  }
  
  // Define fetchBookings outside of useEffect
  const fetchBookings = async () => {
    if (activeSection !== 'bookings' && !bookingsLoading) return
    
    try {
      setBookingsLoading(true)
      // Add populate parameter to get full guest and room data
      const response = await axios.get(`${API_URL}/bookings?populate=guest,room&page=${bookingsPage}&limit=${ITEMS_PER_PAGE}`)
      
      // Ensure each booking has the necessary data
      const formattedBookings = (response.data.data || []).map(booking => {
        let guestInfo = { firstName: 'Guest', lastName: '' }
        
        // Handle different guest data formats
        if (booking.guest) {
          if (typeof booking.guest === 'string') {
            // If guest is just an ID string
            guestInfo = { _id: booking.guest, firstName: 'Guest', lastName: '' }
          } else if (booking.guest._id) {
            // If guest is a populated object
            guestInfo = booking.guest
          }
        } else if (booking.guestId) {
          // If we only have guestId
          guestInfo = { _id: booking.guestId, firstName: 'Guest', lastName: '' }
        }
        
        // Handle room data
        let roomInfo = booking.room || null
        if (booking.roomId && !roomInfo) {
          roomInfo = { _id: booking.roomId, name: 'Room', type: 'standard' }
        }
        
        return {
          ...booking,
          guest: guestInfo,
          room: roomInfo
        }
      })
      
      setBookings(formattedBookings)
      setBookingsTotalPages(Math.ceil(response.data.count / ITEMS_PER_PAGE))
      setBookingsLoading(false)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookingsLoading(false)
    }
  }
  
  // Define fetchServiceOrders outside of useEffect
  const fetchServiceOrders = async () => {
    if (activeSection !== 'service-orders' && !serviceOrdersLoading) return
    
    try {
      setServiceOrdersLoading(true)
      // Add populate parameter to get full guest and service data
      const response = await axios.get(`${API_URL}/service-orders?populate=guest,service&page=${serviceOrdersPage}&limit=${ITEMS_PER_PAGE}`)
      
      // Format each service order to ensure required fields
      const formattedOrders = (response.data.data || []).map(order => {
        let guestInfo = { firstName: 'Guest', lastName: '' }
        
        // Handle different guest data formats
        if (order.guest) {
          if (typeof order.guest === 'string') {
            // If guest is just an ID string
            guestInfo = { _id: order.guest, firstName: 'Guest', lastName: '' }
          } else if (order.guest._id) {
            // If guest is a populated object
            guestInfo = order.guest
          }
        } else if (order.guestId) {
          // If we only have guestId
          guestInfo = { _id: order.guestId, firstName: 'Guest', lastName: '' }
        }
        
        // Handle service data
        let serviceInfo = order.service || null
        if (order.serviceId && !serviceInfo) {
          serviceInfo = { _id: order.serviceId, name: 'Service' }
        }
        
        return {
          ...order,
          guest: guestInfo,
          service: serviceInfo
        }
      })
      
      setServiceOrders(formattedOrders)
      setServiceOrdersTotalPages(Math.ceil(response.data.count / ITEMS_PER_PAGE))
      setServiceOrdersLoading(false)
    } catch (error) {
      console.error('Error fetching service orders:', error)
      setServiceOrdersLoading(false)
    }
  }
  
  // Define fetchClients outside of useEffect
  const fetchClients = async () => {
    if (activeSection !== 'users' && !clientsLoading) return
    
    try {
      setClientsLoading(true)
      const response = await axios.get(`${API_URL}/clients?page=${clientsPage}&limit=${ITEMS_PER_PAGE}`)
      setClients(response.data.data || [])
      setClientsTotalPages(Math.ceil(response.data.count / ITEMS_PER_PAGE))
      setClientsLoading(false)
    } catch (error) {
      console.error('Error fetching clients:', error)
      setClientsLoading(false)
    }
  }
  
  // Update useEffect hooks to include pagination
  useEffect(() => {
    if (currentUser && activeSection === 'overview') {
      fetchStats()
    }
  }, [currentUser, activeSection])
  
  useEffect(() => {
    if (currentUser && activeSection === 'rooms') {
      fetchRooms()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, activeSection, roomsPage])
  
  useEffect(() => {
    if (currentUser && activeSection === 'services') {
      fetchServices()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, activeSection, servicesPage])
  
  useEffect(() => {
    if (currentUser && activeSection === 'bookings') {
      fetchBookings()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, activeSection, bookingsPage])
  
  useEffect(() => {
    if (currentUser && activeSection === 'service-orders') {
      fetchServiceOrders()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, activeSection, serviceOrdersPage])
  
  useEffect(() => {
    if (currentUser && activeSection === 'users') {
      fetchClients()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, activeSection, clientsPage])
  
  // Reset pagination when changing sections
  useEffect(() => {
    setRoomsPage(1)
    setServicesPage(1)
    setBookingsPage(1)
    setServiceOrdersPage(1)
    setClientsPage(1)
  }, [activeSection])
  
  // Handle room deletion
  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/rooms/${roomId}`)
        toast.success('Room deleted successfully')
        fetchRooms() // Refresh the rooms list
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete room')
      }
    }
  }

  // Handle service deletion
  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/services/${serviceId}`)
        toast.success('Service deleted successfully')
        fetchServices() // Refresh the services list
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete service')
      }
    }
  }

  // Handle booking deletion
  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/bookings/${bookingId}`)
        toast.success('Booking deleted successfully')
        fetchBookings() // Refresh the bookings list
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete booking')
      }
    }
  }

  // Handle service order deletion
  const handleDeleteServiceOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this service order? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/service-orders/${orderId}`)
        toast.success('Service order deleted successfully')
        fetchServiceOrders() // Refresh the service orders list
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete service order')
      }
    }
  }

  // Handle client deletion
  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/users/${clientId}`)
        toast.success('User deleted successfully')
        fetchClients() // Refresh the clients list
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete user')
      }
    }
  }

  // Add Pagination component
  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-md ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          }`}
        >
          <FaChevronLeft />
        </button>
        <span className="text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          }`}
        >
          <FaChevronRight />
        </button>
      </div>
    )
  }

  if (!currentUser) {
    return <Spinner />
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="mb-4 p-4 border-b">
            <h2 className="font-bold text-lg">{currentUser.firstName} {currentUser.lastName}</h2>
            <p className="text-sm text-gray-600">
              Role: {currentUser.role === 'admin' ? 'Administrator' : 'Staff'}
            </p>
          </div>
          
          <nav className="flex flex-col space-y-2">
            <button 
              onClick={() => setActiveSection('overview')}
              className={`p-2 rounded-md text-left flex items-center ${
                activeSection === 'overview' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <FaHome className="mr-2 h-5 w-5" size={18} />
              Overview
            </button>
            
            <button 
              onClick={() => setActiveSection('rooms')}
              className={`p-2 rounded-md text-left flex items-center ${
                activeSection === 'rooms' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <FaBed className="mr-2 h-5 w-5" size={18} />
              Room Management
            </button>
            
            <button 
              onClick={() => setActiveSection('services')}
              className={`p-2 rounded-md text-left flex items-center ${
                activeSection === 'services' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <FaHotel className="mr-2 h-5 w-5" size={18} />
              Service Management
            </button>
            
            <button 
              onClick={() => setActiveSection('bookings')}
              className={`p-2 rounded-md text-left flex items-center ${
                activeSection === 'bookings' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <FaCalendarCheck className="mr-2 h-5 w-5" size={18} />
              Bookings
            </button>
            
            <button 
              onClick={() => setActiveSection('service-orders')}
              className={`p-2 rounded-md text-left flex items-center ${
                activeSection === 'service-orders' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <FaClipboardList className="mr-2 h-5 w-5" size={18} />
              Service Orders
            </button>
            
            {isAdmin() && (
              <button 
                onClick={() => setActiveSection('users')}
                className={`p-2 rounded-md text-left flex items-center ${
                  activeSection === 'users' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <FaUsers className="mr-2 h-5 w-5" size={18} />
                User Management
              </button>
            )}
          </nav>
        </div>
        
        {/* Content Area */}
        <div className="md:col-span-3 bg-white rounded-lg shadow-md p-6">
          {activeSection === 'overview' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>
              <p className="mb-4">Welcome to the Resort Management admin dashboard.</p>
              
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Spinner />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                    <h3 className="font-semibold">Room Statistics</h3>
                    <p className="text-3xl font-bold mt-2">{stats.roomCount}</p>
                  </div>
                  
                  <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                    <h3 className="font-semibold">Active Bookings</h3>
                    <p className="text-3xl font-bold mt-2">{stats.activeBookings}</p>
                  </div>
                  
                  <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                    <h3 className="font-semibold">Service Orders</h3>
                    <p className="text-3xl font-bold mt-2">{stats.serviceOrders}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeSection === 'rooms' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Room Management</h2>
                {isAdmin() && (
                  <Link to="/admin/rooms/add" className="btn-primary">
                    Add New Room
                  </Link>
                )}
              </div>
              
              {roomsLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Spinner />
                </div>
              ) : rooms.length === 0 ? (
                <p className="text-center py-8">No rooms found. Add some rooms to get started.</p>
              ) : (
                <>
                  <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                          <th className="py-3 px-6 text-left">Name</th>
                          <th className="py-3 px-6 text-left">Type</th>
                          <th className="py-3 px-6 text-left">Price</th>
                          <th className="py-3 px-6 text-left">Status</th>
                          <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm">
                        {rooms.map(room => (
                          <tr key={room._id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-6 text-left">{room.name}</td>
                            <td className="py-3 px-6 text-left">{room.type}</td>
                            <td className="py-3 px-6 text-left">${room.pricePerNight}</td>
                            <td className="py-3 px-6 text-left">
                              <span className={`py-1 px-3 rounded-full text-xs ${
                                room.isAvailable ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                              }`}>
                                {room.isAvailable ? 'Available' : 'Unavailable'}
                              </span>
                            </td>
                            <td className="py-3 px-6">
                              <div className="flex items-center justify-center space-x-3">
                                <Link 
                                  to={`/rooms/${room._id}`} 
                                  className="text-blue-500 hover:text-blue-700 font-medium"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View
                                </Link>
                                {(isAdmin() || isStaff()) && (
                                  <Link to={`/admin/rooms/edit/${room._id}`} className="text-yellow-500 hover:text-yellow-700 font-medium">
                                    Edit
                                  </Link>
                                )}
                                {isAdmin() && (
                                  <button
                                    onClick={() => handleDeleteRoom(room._id)}
                                    className="text-red-500 hover:text-red-700 font-medium"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    currentPage={roomsPage}
                    totalPages={roomsTotalPages}
                    onPageChange={setRoomsPage}
                  />
                </>
              )}
            </div>
          )}
          
          {activeSection === 'services' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Service Management</h2>
                {isAdmin() && (
                  <Link to="/admin/services/add" className="btn-primary">
                    Add New Service
                  </Link>
                )}
              </div>
              
              {servicesLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Spinner />
                </div>
              ) : services.length === 0 ? (
                <p className="text-center py-8">No services found. Add some services to get started.</p>
              ) : (
                <>
                  <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                          <th className="py-3 px-6 text-left">Name</th>
                          <th className="py-3 px-6 text-left">Price</th>
                          <th className="py-3 px-6 text-left">Duration</th>
                          <th className="py-3 px-6 text-left">Status</th>
                          <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm">
                        {services.map(service => (
                          <tr key={service._id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-6 text-left">{service.name}</td>
                            <td className="py-3 px-6 text-left">${service.price}</td>
                            <td className="py-3 px-6 text-left">{service.duration} min</td>
                            <td className="py-3 px-6 text-left">
                              <span className={`py-1 px-3 rounded-full text-xs ${
                                service.isAvailable ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                              }`}>
                                {service.isAvailable ? 'Available' : 'Unavailable'}
                              </span>
                            </td>
                            <td className="py-3 px-6">
                              <div className="flex items-center justify-center space-x-3">
                                <Link 
                                  to={`/services/${service._id}`} 
                                  className="text-blue-500 hover:text-blue-700 font-medium"
                                >
                                  View
                                </Link>
                                {(isAdmin() || isStaff()) && (
                                  <Link to={`/admin/services/edit/${service._id}`} className="text-yellow-500 hover:text-yellow-700 font-medium">
                                    Edit
                                  </Link>
                                )}
                                {isAdmin() && (
                                  <button
                                    onClick={() => handleDeleteService(service._id)}
                                    className="text-red-500 hover:text-red-700 font-medium"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    currentPage={servicesPage}
                    totalPages={servicesTotalPages}
                    onPageChange={setServicesPage}
                  />
                </>
              )}
            </div>
          )}
          
          {activeSection === 'bookings' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Booking Management</h2>
              
              {bookingsLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Spinner />
                </div>
              ) : bookings.length === 0 ? (
                <p className="text-center py-8">No bookings found.</p>
              ) : (
                <>
                  <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                          <th className="py-3 px-6 text-left">ID</th>
                          <th className="py-3 px-6 text-left">Guest</th>
                          <th className="py-3 px-6 text-left">Room</th>
                          <th className="py-3 px-6 text-left">Check In</th>
                          <th className="py-3 px-6 text-left">Check Out</th>
                          <th className="py-3 px-6 text-left">Status</th>
                          <th className="py-3 px-6 text-center w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm">
                        {bookings.map(booking => (
                          <tr key={booking._id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-6 text-left">{booking._id.substring(0, 8)}...</td>
                            <td className="py-3 px-6 text-left">
                              {booking.guest.firstName} {booking.guest.lastName}
                            </td>
                            <td className="py-3 px-6 text-left">{booking.room?.name || 'Unknown Room'}</td>
                            <td className="py-3 px-6 text-left">
                              {new Date(booking.checkInDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-6 text-left">
                              {new Date(booking.checkOutDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-6 text-left">
                              <span className={`py-1 px-3 rounded-full text-xs ${
                                booking.status === 'confirmed' ? 'bg-green-200 text-green-800' : 
                                booking.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                                'bg-red-200 text-red-800'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-6">
                              <div className="flex items-center justify-center space-x-3">
                                <Link 
                                  to={`/admin/bookings/${booking._id}`}
                                  className="text-blue-500 hover:text-blue-700 font-medium"
                                >
                                  Details
                                </Link>
                                {isAdmin() && (
                                  <button
                                    onClick={() => handleDeleteBooking(booking._id)}
                                    className="text-red-500 hover:text-red-700 font-medium"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    currentPage={bookingsPage}
                    totalPages={bookingsTotalPages}
                    onPageChange={setBookingsPage}
                  />
                </>
              )}
            </div>
          )}
          
          {activeSection === 'service-orders' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Service Order Management</h2>
              
              {serviceOrdersLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Spinner />
                </div>
              ) : serviceOrders.length === 0 ? (
                <p className="text-center py-8">No service orders found.</p>
              ) : (
                <>
                  <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                          <th className="py-3 px-6 text-left">ID</th>
                          <th className="py-3 px-6 text-left">Guest</th>
                          <th className="py-3 px-6 text-left">Service</th>
                          <th className="py-3 px-6 text-left">Date</th>
                          <th className="py-3 px-6 text-left">Status</th>
                          <th className="py-3 px-6 text-center w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm">
                        {serviceOrders.map(order => (
                          <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-6 text-left">{order._id.substring(0, 8)}...</td>
                            <td className="py-3 px-6 text-left">
                              {order.guest.firstName} {order.guest.lastName}
                            </td>
                            <td className="py-3 px-6 text-left">{order.service?.name || 'Unknown Service'}</td>
                            <td className="py-3 px-6 text-left">
                              {new Date(order.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-6 text-left">
                              <span className={`py-1 px-3 rounded-full text-xs ${
                                order.status === 'confirmed' ? 'bg-green-200 text-green-800' : 
                                order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                                'bg-red-200 text-red-800'
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-6">
                              <div className="flex items-center justify-center space-x-3">
                                <Link 
                                  to={`/admin/service-orders/${order._id}`}
                                  className="text-blue-500 hover:text-blue-700 font-medium"
                                >
                                  Details
                                </Link>
                                {isAdmin() && (
                                  <button
                                    onClick={() => handleDeleteServiceOrder(order._id)}
                                    className="text-red-500 hover:text-red-700 font-medium"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    currentPage={serviceOrdersPage}
                    totalPages={serviceOrdersTotalPages}
                    onPageChange={setServiceOrdersPage}
                  />
                </>
              )}
            </div>
          )}
          
          {activeSection === 'users' && isAdmin() && (
            <div>
              <h2 className="text-xl font-bold mb-4">User Management</h2>
              
              {clientsLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Spinner />
                </div>
              ) : clients.length === 0 ? (
                <p className="text-center py-8">No users found.</p>
              ) : (
                <>
                  <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                          <th className="py-3 px-6 text-left">ID</th>
                          <th className="py-3 px-6 text-left">Name</th>
                          <th className="py-3 px-6 text-left">Email</th>
                          <th className="py-3 px-6 text-left">Phone</th>
                          <th className="py-3 px-6 text-left">Role</th>
                          <th className="py-3 px-6 text-center w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm">
                        {clients.map(client => (
                          <tr key={client._id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-6 text-left">{client._id.substring(0, 8)}...</td>
                            <td className="py-3 px-6 text-left">
                              {client.firstName} {client.lastName}
                            </td>
                            <td className="py-3 px-6 text-left">{client.email}</td>
                            <td className="py-3 px-6 text-left">{client.phone}</td>
                            <td className="py-3 px-6 text-left">
                              <span className={`py-1 px-3 rounded-full text-xs ${
                                client.role === 'admin' ? 'bg-red-200 text-red-800' : 
                                client.role === 'staff' ? 'bg-yellow-200 text-yellow-800' : 
                                'bg-green-200 text-green-800'
                              }`}>
                                {client.role === 'admin' ? 'Admin' : 
                                client.role === 'staff' ? 'Staff' : 
                                'User'}
                              </span>
                            </td>
                            <td className="py-3 px-6">
                              <div className="flex items-center justify-center space-x-3">
                                <Link
                                  to={`/admin/users/${client._id}`}
                                  className="text-blue-500 hover:text-blue-700 font-medium"
                                >
                                  View
                                </Link>
                                {client.role !== 'admin' && (
                                  <button
                                    onClick={() => handleDeleteClient(client._id)}
                                    className="text-red-500 hover:text-red-700 font-medium"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    currentPage={clientsPage}
                    totalPages={clientsTotalPages}
                    onPageChange={setClientsPage}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 