import { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight, FaQuoteRight } from 'react-icons/fa'

// Celebrity data with details
const celebrities = [
  {
    id: 1,
    name: 'Leonardo DiCaprio',
    occupation: 'Actor, Film Producer',
    visitDate: 'May 2023',
    image: 'https://m.media-amazon.com/images/M/MV5BMjI0MTg3MzI0M15BMl5BanBnXkFtZTcwMzQyODU2Mw@@._V1_UY317_CR10,0,214,317_AL_.jpg',
    text: 'This resort offered the perfect blend of luxury and privacy. The staff was incredibly professional and discreet, allowing me to truly relax between filming projects.'
  },
  {
    id: 2,
    name: 'Taylor Swift',
    occupation: 'Singer-Songwriter',
    visitDate: 'August 2023',
    image: 'https://m.media-amazon.com/images/M/MV5BMTM3NjcxMDg3MV5BMl5BanBnXkFtZTcwMjAxMTM0NA@@._V1_UY317_CR10,0,214,317_AL_.jpg',
    text: 'I found such inspiration during my stay here! The peaceful surroundings and exceptional service created the perfect environment for songwriting. I can\'t wait to return.'
  },
  {
    id: 3,
    name: 'Cristiano Ronaldo',
    occupation: 'Professional Footballer',
    visitDate: 'December 2023',
    image: 'https://m.media-amazon.com/images/M/MV5BNzA5ODEzMTMzMl5BMl5BanBnXkFtZTgwNDkwNDQwNjM@._V1_UX214_CR0,0,214,317_AL_.jpg',
    text: 'The fitness facilities at this resort are world-class. Combined with the incredible food and comfortable accommodations, it was the ideal place to relax and recharge.'
  },
  {
    id: 4,
    name: 'Beyoncé',
    occupation: 'Singer, Actress, Businesswoman',
    visitDate: 'February 2024',
    image: 'https://m.media-amazon.com/images/M/MV5BNzUwNjgxMjM2OF5BMl5BanBnXkFtZTcwOTQ4MzM0NA@@._V1_UY317_CR6,0,214,317_AL_.jpg',
    text: 'My family and I were treated to an unforgettable experience. The privacy, luxury amenities, and attentive service made our stay truly exceptional. We felt completely at home.'
  },
  {
    id: 5,
    name: 'Elon Musk',
    occupation: 'Entrepreneur, Investor',
    visitDate: 'March 2024',
    image: 'https://m.media-amazon.com/images/M/MV5BMTI5ODY5NTQzNV5BMl5BanBnXkFtZTcwOTAzNTIzMw@@._V1_UY317_CR7,0,214,317_AL_.jpg',
    text: 'The blend of technology and comfort was impressive. I appreciated the sustainable practices implemented throughout the resort while maintaining a high standard of luxury.'
  }
]

const TestimonialSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Auto-rotate testimonials every 6 seconds
    const interval = setInterval(() => {
      nextTestimonial()
    }, 6000)

    return () => clearInterval(interval)
  }, [currentIndex])

  const nextTestimonial = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % celebrities.length)
    
    setTimeout(() => {
      setIsAnimating(false)
    }, 500)
  }

  const prevTestimonial = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? celebrities.length - 1 : prevIndex - 1
    )
    
    setTimeout(() => {
      setIsAnimating(false)
    }, 500)
  }

  return (
    <div className="relative max-w-4xl mx-auto px-4">
      <div className="bg-white/10 p-8 rounded-lg min-h-[350px] relative">
        <FaQuoteRight className="absolute top-6 right-6 text-white/20 text-4xl" />
        
        <div 
          className={`transition-opacity duration-500 flex flex-col items-center ${
            isAnimating ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Celebrity Image */}
          <div className="mb-6">
            <img 
              src={celebrities[currentIndex].image} 
              alt={celebrities[currentIndex].name}
              className="w-20 h-20 rounded-full object-cover border-2 border-white" 
            />
          </div>
          
          {/* Celebrity Name and Occupation */}
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold">{celebrities[currentIndex].name}</h3>
            <p className="text-sm opacity-75">{celebrities[currentIndex].occupation}</p>
            <p className="text-xs opacity-75">Visited: {celebrities[currentIndex].visitDate}</p>
          </div>
          
          {/* Celebrity Quote - positioned lower as requested */}
          <div className="mt-4">
            <p className="text-xl italic text-center">
              "{celebrities[currentIndex].text}"
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation controls */}
      <div className="flex justify-between mt-4">
        <button 
          onClick={prevTestimonial}
          className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all"
          aria-label="Previous celebrity"
        >
          <FaChevronLeft className="text-lg" />
        </button>
        
        {/* Indicators */}
        <div className="flex gap-2 items-center">
          {celebrities.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (isAnimating) return
                setIsAnimating(true)
                setCurrentIndex(index)
                setTimeout(() => setIsAnimating(false), 500)
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
              }`}
              aria-label={`Go to celebrity ${index + 1}`}
            />
          ))}
        </div>
        
        <button 
          onClick={nextTestimonial}
          className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all"
          aria-label="Next celebrity"
        >
          <FaChevronRight className="text-lg" />
        </button>
      </div>
    </div>
  )
}

export default TestimonialSlider 