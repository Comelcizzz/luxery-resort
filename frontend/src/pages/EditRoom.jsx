import { useState, useContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import AuthContext from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const EditRoom = () => {
  const { isAdmin, isStaff } = useContext(AuthContext)
  const navigate = useNavigate()
  const { id } = useParams()
  
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
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const availableAmenities = [
    'wifi', 'tv', 'air conditioning', 'minibar', 'safe', 'balcony', 'sea view', 'bathroom'
  ]
  
  // Check if user is admin or staff
  useEffect(() => {
    if (!isAdmin() && !isStaff()) {
      navigate('/admin')
    }
  }, [isAdmin, isStaff, navigate])
  
  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(`${API_URL}/rooms/${id}`)
        
        // Convert the response data to match our form structure
        const roomData = response.data.data
        
        setFormData({
          name: roomData.name || '',
          description: roomData.description || '',
          roomNumber: roomData.roomNumber || '',
          pricePerNight: roomData.pricePerNight || '',
          type: roomData.type || 'single',
          capacity: roomData.maxOccupancy || 1,
          status: roomData.isAvailable ? 'available' : 'maintenance',
          size: roomData.size || '',
          amenities: roomData.amenities || [],
          images: roomData.images || [],
          url: roomData.url || ''
        })
        
        setLoading(false)
      } catch (err) {
        console.error('Error fetching room data:', err)
        toast.error('Failed to load room data')
        navigate('/admin')
      }
    }
    
    fetchRoom()
  }, [id, navigate])
  
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
      setSubmitting(true)
      
      // Send update request to backend
      await axios.put(`${API_URL}/rooms/${id}`, formData)
      
      toast.success('Room updated successfully')
      navigate('/admin')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update room')
      setSubmitting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Room</h1>
        
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
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              
              <div>
                <label className="form-label">Room Description*</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  rows="4"
                  required
                ></textarea>
              </div>
            </div>
            
            {/* Amenities */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              
              <div className="flex flex-wrap gap-3">
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
              <h2 className="text-xl font-semibold mb-4">Images</h2>
              
              <div className="mb-4">
                <label className="form-label">Main Image URL</label>
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="https://example.com/main-image.jpg"
                />
                <small className="text-gray-500">Add the URL of the main room image</small>
              </div>
              
              <div>
                <label className="form-label">Additional Images (one URL per line)</label>
                <textarea
                  name="images"
                  value={formData.images.join('\n')}
                  onChange={handleImageChange}
                  className="form-input"
                  rows="3"
                  placeholder="https://example.com/image1.jpg"
                ></textarea>
                <small className="text-gray-500">Enter one image URL per line</small>
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
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Room'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditRoom 