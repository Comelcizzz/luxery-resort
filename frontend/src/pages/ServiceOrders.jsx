import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { FaCalendarAlt, FaClock, FaMoneyBillWave, FaSpinner, FaTimes } from 'react-icons/fa'
import Spinner from '../components/ui/Spinner'
import ServiceOrderForm from '../components/services/ServiceOrderForm'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ServiceOrders = () => {
  const [serviceOrders, setServiceOrders] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  
  const location = useLocation()
  const modalRef = useRef(null)
  
  useEffect(() => {
    fetchServiceOrders()
    fetchServices()
    
    // Check if navigated with a serviceId
    const serviceId = location.state?.serviceId
    if (serviceId) {
      handleNewOrder(serviceId)
    }
  }, [location])
  
  const fetchServiceOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/service-orders?populate=service`)
      console.log('User service orders:', response.data)
      
      const formattedServiceOrders = (response.data.data || []).map(order => {
        return {
          ...order,
          service: order.service || { name: 'Service', price: 0 },
          totalPrice: order.totalPrice || (order.service ? order.service.price * (order.quantity || 1) : 0),
          date: order.appointmentDate || order.date || new Date().toISOString(),
          quantity: order.quantity || 1,
          status: order.status || 'pending'
        }
      })
      
      setServiceOrders(formattedServiceOrders)
      setLoading(false)
    } catch (error) {
      console.error('Service orders fetch error:', error)
      toast.error('Error fetching service orders')
      setLoading(false)
    }
  }
  
  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/services?limit=100`)
      setServices(response.data.data)
    } catch (error) {
      toast.error('Error fetching services')
    }
  }
  
  const handleCancelOrder = async (orderId) => {
    try {
      setActionLoading(orderId)
      
      await axios.put(`${API_URL}/service-orders/${orderId}`, {
        status: 'cancelled'
      })
      
      // Update local state
      setServiceOrders(serviceOrders.map(order => 
        order._id === orderId 
          ? { ...order, status: 'cancelled' } 
          : order
      ))
      
      toast.success('Service order cancelled successfully')
      setActionLoading(null)
    } catch (error) {
      toast.error('Error cancelling service order')
      setActionLoading(null)
    }
  }
  
  const handleNewOrder = async (serviceId) => {
    // Find the service by ID
    const service = services.find(s => s._id === serviceId)
    
    if (service) {
      setSelectedService(service)
      setShowOrderForm(true)
    } else {
      // If service not found in current list, fetch it
      try {
        const response = await axios.get(`${API_URL}/services/${serviceId}`)
        setSelectedService(response.data.data)
        setShowOrderForm(true)
      } catch (error) {
        toast.error('Error fetching service details')
      }
    }
  }
  
  const handleOrderSuccess = () => {
    setShowOrderForm(false)
    fetchServiceOrders()
  }
  
  // Helper to format dates
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Service Orders</h1>
        
        <button
          onClick={() => setShowOrderForm(true)}
          className="btn-secondary"
        >
          Book New Service
        </button>
      </div>
      
      {serviceOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-bold mb-2">No Service Orders Found</h2>
          <p className="text-gray-600 mb-4">You haven't booked any services yet.</p>
          <button
            onClick={() => setShowOrderForm(true)}
            className="btn-primary"
          >
            Book a Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {serviceOrders.map(order => (
            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">
                      {order.service.name || 'Service'}
                    </h2>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <span className="text-2xl font-bold text-gray-900">${order.totalPrice}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Appointment</p>
                      <p className="font-medium">{formatDate(order.appointmentDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FaClock className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="font-medium">{order.quantity}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FaMoneyBillWave className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="font-medium">${order.totalPrice}</p>
                    </div>
                  </div>
                </div>
                
                {order.specialRequests && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Special Requests:</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{order.specialRequests}</p>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4 flex justify-end">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={actionLoading === order._id}
                      className="flex items-center text-red-600 hover:text-red-700"
                    >
                      {actionLoading === order._id ? (
                        <FaSpinner className="animate-spin mr-1" />
                      ) : (
                        <FaTimes className="mr-1" />
                      )}
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Service Booking Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Book a Service</h2>
              <button 
                onClick={() => setShowOrderForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4">
              {selectedService ? (
                <ServiceOrderForm 
                  service={selectedService} 
                  onClose={handleOrderSuccess}
                />
              ) : (
                <div>
                  <h3 className="font-bold mb-4">Select a Service</h3>
                  {services.length === 0 ? (
                    <p>No services available</p>
                  ) : (
                    <div className="space-y-2">
                      {services.map(service => (
                        <button
                          key={service._id}
                          onClick={() => setSelectedService(service)}
                          className="w-full text-left p-3 border rounded hover:bg-gray-50 flex justify-between items-center"
                        >
                          <span>{service.name}</span>
                          <span className="font-bold">${service.price}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceOrders 