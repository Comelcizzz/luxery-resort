import { useState, useContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import AuthContext from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const EditService = () => {
  const { isAdmin, isStaff } = useContext(AuthContext)
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'spa',
    duration: '',
    isAvailable: true,
    url: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Check if user is admin or staff
  useEffect(() => {
    if (!isAdmin() && !isStaff()) {
      navigate('/admin')
    }
  }, [isAdmin, isStaff, navigate])
  
  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`${API_URL}/services/${id}`)
        
        // Convert the response data to match our form structure
        const serviceData = response.data.data
        
        setFormData({
          name: serviceData.name || '',
          description: serviceData.description || '',
          price: serviceData.price || '',
          category: serviceData.category || 'spa',
          duration: serviceData.duration || '',
          isAvailable: serviceData.isAvailable !== undefined ? serviceData.isAvailable : true,
          url: serviceData.url || ''
        })
        
        setLoading(false)
      } catch (err) {
        console.error('Error fetching service:', err)
        toast.error('Failed to load service data')
        navigate('/admin')
      }
    }
    
    fetchService()
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
      setSubmitting(true)
      
      // Send update request to backend
      await axios.put(`${API_URL}/services/${id}`, formData)
      
      toast.success('Service updated successfully')
      navigate('/admin')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update service')
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
        <h1 className="text-3xl font-bold mb-6">Edit Service</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="form-label">Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="form-label">Category*</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="spa">Spa</option>
                <option value="wellness">Wellness</option>
                <option value="recreation">Recreation</option>
                <option value="dining">Dining</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>
            
            <div className="mb-6">
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
            
            <div className="mb-6">
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
            
            <div className="mb-6">
              <label className="form-label">Description*</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input"
                rows="4"
                required
              ></textarea>
            </div>
            
            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <label htmlFor="isAvailable" className="form-label">
                Available for Booking
              </label>
            </div>
            
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
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditService 