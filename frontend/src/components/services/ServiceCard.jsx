import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaClock } from 'react-icons/fa'
import AuthContext from '../../context/AuthContext'

const ServiceCard = ({ service }) => {
  const { _id, name, description, price, duration, images, image, url } = service
  const { isAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()

  // Use url if available, otherwise fall back to image field, images array, or default
  const serviceImage = url || image || (images && images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80&w=2070')

  // Truncate description
  const truncatedDescription = description.length > 100 ? `${description.substring(0, 100)}...` : description

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login')
    } else {
      // Open service booking modal or navigate to booking page
      navigate('/service-orders', { state: { serviceId: _id } })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={serviceImage} 
        alt={name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{name}</h3>
        <p className="text-gray-600 text-sm mb-3">{truncatedDescription}</p>
        
        {duration && (
          <div className="flex items-center mb-3">
            <FaClock className="text-gray-500 mr-1" />
            <span className="text-gray-600 text-sm">{duration} minutes</span>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-lg font-bold text-gray-900">${price}</span>
          <button 
            onClick={handleBookNow}
            className="btn-secondary"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServiceCard 