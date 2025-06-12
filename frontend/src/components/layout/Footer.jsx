import { Link } from 'react-router-dom'
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold mb-4">LuxuryResort</h3>
            <p className="text-gray-300 mb-4">
              Experience luxury and comfort at our resort. We provide exceptional 
              accommodations and services for a memorable stay.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <FaFacebookF />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/rooms" className="text-gray-300 hover:text-white">Rooms</Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-white">Services</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white">Register</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-4">Our Services</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/services?category=spa" className="text-gray-300 hover:text-white">Spa & Wellness</Link>
              </li>
              <li>
                <Link to="/services?category=dining" className="text-gray-300 hover:text-white">Restaurant</Link>
              </li>
              <li>
                <Link to="/services?category=fitness" className="text-gray-300 hover:text-white">Gym & Fitness</Link>
              </li>
              <li>
                <Link to="/services?category=recreation" className="text-gray-300 hover:text-white">Swimming Pool</Link>
              </li>
              <li>
                <Link to="/services?category=entertainment" className="text-gray-300 hover:text-white">Excursions</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://maps.google.com/?q=123+Resort+Street" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">123 Resort Street</a>
              </li>
              <li>
                <a href="https://maps.google.com/?q=Luxury+City" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">Luxury City, LC 12345</a>
              </li>
              <li>
                <a href="tel:+11234567890" className="text-gray-300 hover:text-white">Phone: +1 (123) 456-7890</a>
              </li>
              <li>
                <a href="mailto:info@luxuryresort.com" className="text-gray-300 hover:text-white">Email: info@luxuryresort.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} LuxuryResort. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 