import { useState, useContext, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { FaUser, FaPhone, FaEnvelope, FaKey, FaShieldAlt } from 'react-icons/fa'
import AuthContext from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

const Profile = () => {
  const { currentUser, updateUserProfile, logoutUser } = useContext(AuthContext)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      })
    }
  }, [currentUser])
  
  const { firstName, lastName, email, phone } = formData
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      toast.error('Phone number must be 10 digits')
      return
    }
    
    try {
      setLoading(true)
      await updateUserProfile(formData)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }
  
  if (!currentUser) {
    return <Spinner />
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 text-center border-b border-gray-200">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary-100 text-primary-600 text-2xl font-bold mb-3">
                {firstName.charAt(0)}{lastName.charAt(0)}
              </div>
              <h3 className="font-bold text-lg">{firstName} {lastName}</h3>
              <p className="text-gray-500 text-sm">{email}</p>
            </div>
            
            <nav className="p-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center w-full px-4 py-2 rounded-md text-left ${
                  activeTab === 'profile'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaUser className="mr-3" />
                <span>Personal Information</span>
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center w-full px-4 py-2 rounded-md text-left ${
                  activeTab === 'security'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaShieldAlt className="mr-3" />
                <span>Security</span>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'profile' ? (
              <div>
                <h2 className="text-xl font-bold mb-6">Personal Information</h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="firstName" className="form-label">
                        First Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400" />
                        </div>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          value={firstName}
                          onChange={handleChange}
                          className="form-input pl-10"
                          placeholder="First Name"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="form-label">
                        Last Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400" />
                        </div>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          value={lastName}
                          onChange={handleChange}
                          className="form-input pl-10"
                          placeholder="Last Name"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="form-label">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={email}
                          onChange={handleChange}
                          className="form-input pl-10"
                          placeholder="Email Address"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="form-label">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaPhone className="text-gray-400" />
                        </div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={phone}
                          onChange={handleChange}
                          className="form-input pl-10"
                          placeholder="10-digit phone number"
                          maxLength="10"
                          required
                        />
                      </div>
                      <small className="text-gray-500">Format: 1234567890 (10 digits)</small>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-6">Security Settings</h2>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Change Password</h3>
                  <p className="text-gray-600 mb-4">
                    You can change your password here. Make sure to use a strong password.
                  </p>
                  
                  <button className="btn-outline flex items-center">
                    <FaKey className="mr-2" />
                    Change Password
                  </button>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold mb-2">Delete Account</h3>
                  <p className="text-gray-600 mb-4">
                    Warning: This action cannot be undone. All your data will be permanently deleted.
                  </p>
                  
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile 