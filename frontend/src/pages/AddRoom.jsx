import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import AuthContext from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const AddRoom = () => {
  const { isAdmin } = useContext(AuthContext)
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    roomNumber: '',
    pricePerNight: '',
    type: 'single',
    capacity: 1,
    status: 'available',
    size: '',
    amenities: [],
    images: [],
    url: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [availableAmenities, setAvailableAmenities] = useState([
    'wifi', 'tv', 'air conditioning', 'minibar', 'safe', 'balcony', 'sea view', 'bathroom'
  ])
  
  // Check if user is admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin')
    }
  }, [isAdmin, navigate])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value === '' ? '' : Number(value)
    })
  }
  
  const handleAmenityChange = (amenity) => {
    if (formData.amenities.includes(amenity)) {
      // Remove amenity
      setFormData({
        ...formData,
        amenities: formData.amenities.filter(a => a !== amenity)
      })
    } else {
      // Add amenity
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity]
      })
    }
  }
  
  const handleImageChange = (e) => {
    const { value } = e.target
    
    // Split by new lines and filter empty lines
    const imageUrls = value.split('\n').filter(url => url.trim() !== '')
    
    setFormData({
      ...formData,
      images: imageUrls
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.description || !formData.pricePerNight || !formData.type || !formData.roomNumber || !formData.capacity) {
      toast.error('Please fill all required fields')
      return
    }
    
    try {
      setLoading(true)
      
      // Send request to backend
      await axios.post(`${API_URL}/rooms`, formData)
      
      toast.success('Room added successfully')
      navigate('/admin')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add room')
      setLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add New Room</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {/* Basic Details */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Basic Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Room Number*</label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Room Type*</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Price Per Night ($)*</label>
                  <input
                    type="number"
                    name="pricePerNight"
                    value={formData.pricePerNight}
                    onChange={handleNumberChange}
                    className="form-input"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Capacity (Guests)*</label>
                  <select
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleNumberChange}
                    className="form-input"
                    required
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5 Guests</option>
                    <option value="6">6 Guests</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Room Size (m²)</label>
                  <input
                    type="number"
                    name="size"
                    value={formData.size}
                    onChange={handleNumberChange}
                    className="form-input"
                    min="1"
                  />
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <label className="form-label">Description*</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input min-h-[120px]"
                required
              ></textarea>
            </div>
            
            {/* Amenities */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableAmenities.map(amenity => (
                  <div key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="mr-2"
                    />
                    <label htmlFor={`amenity-${amenity}`} className="capitalize">
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Images */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Зображення</h2>
              
              <div className="mb-4">
                <label className="form-label">Головне зображення URL</label>
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="https://example.com/main-image.jpg"
                />
                <small className="text-gray-500">Додайте URL головного зображення кімнати</small>
              </div>
              
              <div>
                <label className="form-label">Додаткові зображення (по одному URL на рядок)</label>
                <textarea
                  value={formData.images.join('\n')}
                  onChange={handleImageChange}
                  className="form-input min-h-[100px]"
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                ></textarea>
                <small className="text-gray-500">Введіть по одному URL зображення на рядок</small>
              </div>
            </div>
            
            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="btn-outline mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Room'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddRoom 