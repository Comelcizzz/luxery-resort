import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import RoomCard from '../components/rooms/RoomCard'
import ServiceCard from '../components/services/ServiceCard'
import TestimonialSlider from '../components/testimonials/TestimonialSlider'
import Spinner from '../components/ui/Spinner'
import { FaHotel, FaSpa, FaUtensils, FaSwimmer } from 'react-icons/fa'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Home = () => {
  const [featuredRooms, setFeaturedRooms] = useState([])
  const [popularServices, setPopularServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured rooms (using sort and limit)
        const roomsRes = await axios.get(`${API_URL}/rooms?sort=-rating&limit=3`)
        setFeaturedRooms(roomsRes.data.data)
        
        // Fetch popular services
        const servicesRes = await axios.get(`${API_URL}/services?limit=4`)
        setPopularServices(servicesRes.data.data)
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  if (loading) {
    return <Spinner />
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2070)' }}
        >
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Welcome to Luxury Resort</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Experience the ultimate luxury and comfort with our premium rooms and exceptional services
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/rooms" className="btn-primary text-lg px-8 py-3">
              Explore Rooms
            </Link>
            <Link to="/services" className="btn-outline text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-gray-900">
              Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="inline-block p-4 bg-primary-100 rounded-full mb-4">
                <FaHotel className="text-4xl text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Luxury Rooms</h3>
              <p className="text-gray-600">
                Spacious and elegant rooms with premium amenities for a comfortable stay
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="inline-block p-4 bg-primary-100 rounded-full mb-4">
                <FaSpa className="text-4xl text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Spa & Wellness</h3>
              <p className="text-gray-600">
                Rejuvenate your body and mind with our relaxing spa treatments
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="inline-block p-4 bg-primary-100 rounded-full mb-4">
                <FaUtensils className="text-4xl text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fine Dining</h3>
              <p className="text-gray-600">
                Exquisite cuisine prepared by world-class chefs using fresh ingredients
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="inline-block p-4 bg-primary-100 rounded-full mb-4">
                <FaSwimmer className="text-4xl text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Swimming Pool</h3>
              <p className="text-gray-600">
                Immerse yourself in our infinity pool with breathtaking views
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Rooms</h2>
            <Link to="/rooms" className="text-primary-600 hover:underline">
              View All Rooms
            </Link>
          </div>
          
          {featuredRooms.length === 0 ? (
            <p className="text-center text-gray-600">No rooms available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRooms.map(room => (
                <RoomCard key={room._id} room={room} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Our Services</h2>
            <Link to="/services" className="text-primary-600 hover:underline">
              View All Services
            </Link>
          </div>
          
          {popularServices.length === 0 ? (
            <p className="text-center text-gray-600">No services available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularServices.map(service => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Celebrity Guests Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Our Celebrity Guests</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">Discover some of the world-renowned celebrities who have experienced our luxury resort</p>
          <TestimonialSlider />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for a Luxurious Experience?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Book your stay now and enjoy our premium rooms and exceptional services
          </p>
          <Link to="/rooms" className="btn-primary text-lg px-8 py-3">
            Book Your Stay
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home 