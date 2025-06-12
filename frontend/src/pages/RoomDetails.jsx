import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { FaStar, FaUser, FaBed, FaBath, FaWifi, FaTv, FaUtensils } from 'react-icons/fa'
import BookingForm from '../components/bookings/BookingForm'
import ReviewForm from '../components/reviews/ReviewForm'
import Spinner from '../components/ui/Spinner'
import { toast } from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const RoomDetails = () => {
  const { id } = useParams()
  
  const [room, setRoom] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  
  // Function to update room rating and review count
  const updateRoomReviewStats = async () => {
    if (!id) {
      console.error('Missing room ID')
      return
    }
    
    try {
      // Fetch reviews for this room
      const reviewsRes = await axios.get(`${API_URL}/reviews?roomId=${id}`)
      
      if (!reviewsRes.data || !Array.isArray(reviewsRes.data.data)) {
        throw new Error('Invalid response format for reviews')
      }
      
      const fetchedReviews = reviewsRes.data.data
      setReviews(fetchedReviews)
      
      // Only update the room if we already have room data
      if (room) {
        // Calculate average rating
        let avgRating = 0
        if (fetchedReviews.length > 0) {
          const totalRating = fetchedReviews.reduce((sum, review) => {
            // Ensure rating is a number
            const rating = Number(review.rating) || 0
            return sum + rating
          }, 0)
          
          avgRating = (totalRating / fetchedReviews.length).toFixed(1)
        }
        
        // Update room with new rating and review count
        setRoom({
          ...room,
          rating: avgRating,
          numReviews: fetchedReviews.length
        })
      }
    } catch (err) {
      console.error('Error updating review stats:', err)
      toast.error('Failed to load reviews')
    }
  }
  
  // Fetch room data
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!id) {
        setError('Missing room ID')
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        
        // Fetch room details
        const roomRes = await axios.get(`${API_URL}/rooms/${id}`)
        
        if (!roomRes.data || !roomRes.data.data) {
          throw new Error('Invalid response format')
        }
        
        setRoom(roomRes.data.data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching room details:', err)
        setError(err.response?.data?.error || 'Error fetching room details')
        setLoading(false)
      }
    }
    
    fetchRoomData()
  }, [id])
  
  // Fetch reviews and update stats whenever component mounts or room changes
  useEffect(() => {
    if (id) {
      updateRoomReviewStats()
    }
  }, [id, room?.rating])
  
  const handleReviewAdded = (newReview) => {
    // Add the new review to the reviews list
    setReviews([newReview, ...reviews])
    
    // Update room stats after adding a review
    updateRoomReviewStats()
  }
  
  if (loading) {
    return <Spinner />
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl text-red-600 mb-4">Error</h1>
        <p className="mb-6">{error}</p>
        <Link to="/rooms" className="btn-primary">
          Back to Rooms
        </Link>
      </div>
    )
  }
  
  if (!room) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl mb-4">Room not found</h1>
        <Link to="/rooms" className="btn-primary">
          Back to Rooms
        </Link>
      </div>
    )
  }
  
  const { 
    name, 
    description, 
    type, 
    maxOccupancy, 
    size, 
    amenities = [], 
    images = [],
    url,
    rating,
    numReviews
  } = room
  
  // Use url as default if available, then fall back to images array, or use a default image
  const roomImages = url ? [url, ...(images || [])] : 
                    (images.length > 0 ? images : 
                    ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1974'])
  
  // Function to get amenity icon
  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <FaWifi size={18} className="text-gray-600" />
      case 'tv':
        return <FaTv size={18} className="text-gray-600" />
      case 'food service':
      case 'room service':
        return <FaUtensils size={18} className="text-gray-600" />
      case 'bathroom':
        return <FaBath size={18} className="text-gray-600" />
      case 'bed':
        return <FaBed size={18} className="text-gray-600" />
      default:
        return null
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/rooms" className="text-primary-600 hover:underline mb-4 inline-block">
          &larr; Back to Rooms
        </Link>
        <h1 className="text-3xl font-bold">{name}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-8">
            <div className="relative h-96 rounded-lg overflow-hidden mb-2">
              <img 
                src={roomImages[activeImageIndex]} 
                alt={`${name} - Image ${activeImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            {roomImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {roomImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={`h-20 w-32 object-cover rounded cursor-pointer ${
                      index === activeImageIndex ? 'ring-2 ring-primary-600' : ''
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Room Details */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-sm text-gray-500 capitalize">{type} Room</span>
                  <h2 className="text-2xl font-bold">{name}</h2>
                </div>
                <div className="flex items-center">
                  <FaStar className="text-yellow-500 mr-1" />
                  <span>{rating || '0'}</span>
                  <span className="text-gray-500 ml-1">({numReviews || 0} reviews)</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <FaUser className="mr-2" />
                  <span>{maxOccupancy} {maxOccupancy === 1 ? 'Guest' : 'Guests'}</span>
                </div>
                
                {size && (
                  <div className="flex items-center text-gray-600">
                    <span>{size} m²</span>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{description}</p>
              </div>
              
              {amenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center text-gray-600 p-2">
                        <span className="mr-3">{getAmenityIcon(amenity)}</span>
                        <span className="capitalize">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">
                Reviews {reviews.length > 0 && `(${reviews.length})`}
              </h3>
              
              <ReviewForm roomId={id} onReviewAdded={handleReviewAdded} />
              
              {reviews.length === 0 ? (
                <p className="text-gray-500 italic">No reviews yet. Be the first to leave a review!</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-semibold">
                            {review.client ? `${review.client.firstName} ${review.client.lastName}` : 'Anonymous Guest'}
                          </span>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar 
                                key={i} 
                                className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <BookingForm room={room} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomDetails 