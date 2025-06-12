import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { toast } from 'react-hot-toast'
import axios from 'axios'
import AuthContext from '../../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ServiceOrderForm = ({ service, onClose }) => {
  const { isAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()
  
  const [appointmentDate, setAppointmentDate] = useState(new Date())
  const [quantity, setQuantity] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      toast.error('Please login to book a service')
      navigate('/login')
      return
    }
    
    try {
      setLoading(true)
      
      // Calculate total price
      const totalPrice = service.price * quantity
      
      const orderData = {
        serviceId: service._id,
        service: {
          _id: service._id,
          name: service.name,
          price: service.price
        },
        date: appointmentDate.toISOString(),
        appointmentDate: appointmentDate.toISOString(),
        quantity,
        totalPrice,
        specialRequests,
        status: 'pending'
      }
      
      console.log('Creating service order with data:', orderData)
      const response = await axios.post(`${API_URL}/service-orders`, orderData)
      
      toast.success('Service booked successfully!')
      if (onClose) onClose()
      navigate('/service-orders')
    } catch (error) {
      console.error('Service booking error:', error)
      toast.error(error.response?.data?.error || 'Something went wrong')
      setLoading(false)
    }
  }
  
  // Calculate total price
  const totalPrice = service.price * quantity
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Book {service.name}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="form-label">Appointment Date</label>
          <DatePicker
            selected={appointmentDate}
            onChange={setAppointmentDate}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={30}
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={new Date()}
            className="form-input"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="form-label">Quantity</label>
          <select 
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="form-input"
            required
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="form-label">Special Requests (Optional)</label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            className="form-input min-h-[100px]"
            placeholder="Any special requests or requirements..."
          />
        </div>
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">${service.price} x {quantity}</span>
            <span className="text-gray-800">${service.price * quantity}</span>
          </div>
          
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total</span>
            <span>${totalPrice}</span>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn-secondary w-full mt-4"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Book Now'}
        </button>
      </form>
    </div>
  )
}

export default ServiceOrderForm 