import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import AuthContext from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const AddService = () => {
  const { isAdmin } = useContext(AuthContext)
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'spa',
    duration: '',
    isAvailable: true,
    url: ''
  })
  
  const [loading, setLoading] = useState(false)
  
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
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target
    setFormData({
      ...formData,
      [name]: checked
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.duration) {
      toast.error('Please fill all required fields')
      return
    }
    
    try {
      setLoading(true)
      
      // Send request to backend
      await axios.post(`${API_URL}/services`, formData)
      
      toast.success('Service added successfully')
      navigate('/admin')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add service')
      setLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add New Service</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {/* Basic Details */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Service Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="form-label">Service Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Category*</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="spa">Spa</option>
                    <option value="dining">Dining</option>
                    <option value="activities">Activities</option>
                    <option value="transportation">Transportation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Price ($)*</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleNumberChange}
                    className="form-input"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Duration (minutes)*</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleNumberChange}
                    className="form-input"
                    min="1"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                    />
                    <span>Service is currently available</span>
                  </label>
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
            
            {/* Image */}
            <div className="mb-6">
              <label className="form-label">URL зображення*</label>
              <input
                type="text"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className="form-input"
                placeholder="https://example.com/image.jpg"
              />
              <small className="text-gray-500">Введіть URL для зображення сервісу</small>
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
                {loading ? 'Adding...' : 'Add Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddService 