import { Link } from 'react-router-dom'
import { FaStar, FaUser, FaBath, FaWifi, FaTv, FaWineGlassAlt } from 'react-icons/fa'

const RoomCard = ({ room }) => {
  const { _id, name, description, pricePerNight, type, maxOccupancy, amenities, images, url, rating } = room

  // Use url if available, otherwise fall back to images array or default
  const roomImage = url || (images && images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1974')

  // Truncate description
  const truncatedDescription = description.length > 100 ? `${description.substring(0, 100)}...` : description

  // Get amenity icons
  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <FaWifi className="text-gray-600" />
      case 'tv':
        return <FaTv className="text-gray-600" />
      case 'minibar':
        return <FaWineGlassAlt className="text-gray-600" />
      case 'bathroom':
        return <FaBath className="text-gray-600" />
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.01]">
      <img 
        src={roomImage} 
        alt={name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800">{name}</h3>
          <div className="flex items-center">
            <FaStar className="text-yellow-500 mr-1" />
            <span className="text-gray-700">{rating || '0'}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3">{truncatedDescription}</p>
        
        <div className="flex items-center mb-3">
          <FaUser className="text-gray-500 mr-1" />
          <span className="text-gray-600 text-sm">
            {maxOccupancy} {maxOccupancy === 1 ? 'Guest' : 'Guests'}
          </span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-gray-600 text-sm capitalize">{type}</span>
        </div>
        
        {amenities && amenities.length > 0 && (
          <div className="flex mb-4 space-x-3">
            {amenities.slice(0, 4).map((amenity, index) => (
              <div key={index} className="flex items-center" title={amenity}>
                {getAmenityIcon(amenity)}
              </div>
            ))}
            {amenities.length > 4 && (
              <span className="text-xs text-gray-500">+{amenities.length - 4} more</span>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4">
          <div>
            <span className="text-lg font-bold text-gray-900">${pricePerNight}</span>
            <span className="text-gray-600 text-sm"> / night</span>
          </div>
          <Link to={`/rooms/${_id}`} className="btn-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RoomCard 