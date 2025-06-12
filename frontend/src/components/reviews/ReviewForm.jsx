import { useState, useContext } from 'react'
import { toast } from 'react-hot-toast'
import { FaStar } from 'react-icons/fa'
import axios from 'axios'
import AuthContext from '../../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ReviewForm = ({ roomId, onReviewAdded }) => {
  const { isAuthenticated } = useContext(AuthContext)
  
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [hover, setHover] = useState(0)
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      toast.error('Please login to submit a review')
      return
    }
    
    try {
      setLoading(true)
      
      const response = await axios.post(`${API_URL}/reviews`, {
        roomId,
        rating,
        comment
      })
      
      toast.success('Review submitted successfully!')
      setComment('')
      setRating(5)
      
      // Notify parent component to refresh reviews
      if (onReviewAdded) {
        onReviewAdded(response.data.data)
      }
      
      setLoading(false)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Something went wrong')
      setLoading(false)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="form-label">Rating</label>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1
              
              return (
                <label key={index} className="cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    value={ratingValue}
                    className="hidden"
                    onClick={() => setRating(ratingValue)}
                  />
                  <FaStar
                    size={24}
                    className="transition-colors"
                    color={ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                  />
                </label>
              )
            })}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="form-label">Your Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="form-input min-h-[100px]"
            placeholder="Share your experience..."
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}

export default ReviewForm 