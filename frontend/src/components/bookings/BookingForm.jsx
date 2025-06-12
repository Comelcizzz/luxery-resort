import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { toast } from 'react-hot-toast'
import axios from 'axios'
import AuthContext from '../../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const BookingForm = ({ room }) => {
  const { isAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()
  
  const [checkInDate, setCheckInDate] = useState(new Date())
  const [checkOutDate, setCheckOutDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)))
  const [guests, setGuests] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const handleCheckInChange = (date) => {
    setCheckInDate(date)
    
    // Ensure checkout date is after checkin date
    if (date >= checkOutDate) {
      const newCheckoutDate = new Date(date)
      newCheckoutDate.setDate(date.getDate() + 1)
      setCheckOutDate(newCheckoutDate)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      toast.error('Please login to book a room')
      navigate('/login')
      return
    }
    
    try {
      setLoading(true)
      
      const response = await axios.post(`${API_URL}/bookings`, {
        roomId: room._id,
        checkInDate,
        checkOutDate,
        guests
      })
      
      toast.success('Booking created successfully!')
      navigate('/bookings')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Something went wrong')
      setLoading(false)
    }
  }
  
  // Calculate nights and total price
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
  const totalPrice = nights * room.pricePerNight
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Book This Room</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label">Check-in Date</label>
            <DatePicker
              selected={checkInDate}
              onChange={handleCheckInChange}
              minDate={new Date()}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <label className="form-label">Check-out Date</label>
            <DatePicker
              selected={checkOutDate}
              onChange={setCheckOutDate}
              minDate={new Date(checkInDate.getTime() + 86400000)} // +1 day
              className="form-input"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="form-label">Guests</label>
          <select 
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="form-input"
            required
          >
            {[...Array(room.maxOccupancy)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i === 0 ? 'Guest' : 'Guests'}
              </option>
            ))}
          </select>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">${room.pricePerNight} x {nights} nights</span>
            <span className="text-gray-800">${room.pricePerNight * nights}</span>
          </div>
          
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total</span>
            <span>${totalPrice}</span>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn-primary w-full mt-4"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Book Now'}
        </button>
      </form>
    </div>
  )
}

export default BookingForm 