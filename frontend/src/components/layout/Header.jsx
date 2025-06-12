import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa'
import AuthContext from '../../context/AuthContext'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { currentUser, isAuthenticated, logoutUser, hasAdminAccess } = useContext(AuthContext)
  const navigate = useNavigate()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600">
            LuxuryResort
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600">
              Home
            </Link>
            <Link to="/rooms" className="text-gray-700 hover:text-primary-600">
              Rooms
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-primary-600">
              Services
            </Link>
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={toggleProfile}
                  className="flex items-center text-gray-700 hover:text-primary-600"
                >
                  <FaUserCircle className="mr-2 text-xl" />
                  <span>{currentUser?.firstName || 'User'}</span>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/bookings" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      My Bookings
                    </Link>
                    <Link 
                      to="/service-orders" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      My Services
                    </Link>
                    {hasAdminAccess() && (
                      <Link 
                        to="/admin" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        handleLogout()
                        setIsProfileOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4 mb-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/rooms" 
                className="text-gray-700 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Rooms
              </Link>
              <Link 
                to="/services" 
                className="text-gray-700 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
            </nav>
            
            {isAuthenticated ? (
              <div className="flex flex-col space-y-4">
                <Link 
                  to="/profile" 
                  className="text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/bookings" 
                  className="text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Bookings
                </Link>
                <Link 
                  to="/service-orders" 
                  className="text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Services
                </Link>
                {hasAdminAccess() && (
                  <Link 
                    to="/admin" 
                    className="text-gray-700 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="text-left text-gray-700 hover:text-primary-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary inline-block text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header 