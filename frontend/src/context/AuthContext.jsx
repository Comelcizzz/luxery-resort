import { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { jwtDecode } from 'jwt-decode'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if token exists and is valid
    if (token) {
      try {
        // Check token expiration
        const decodedToken = jwtDecode(token)
        const currentTime = Date.now() / 1000

        if (decodedToken.exp < currentTime) {
          // Token is expired
          logoutUser()
        } else {
          // Set token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          // Load user data
          loadUser()
        }
      } catch (error) {
        logoutUser()
      }
    } else {
      setLoading(false)
    }
  }, [token])

  // Load user data from token
  const loadUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`)
      setCurrentUser(res.data.data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading user', error)
      logoutUser()
    }
  }

  // Register user
  const registerUser = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData)
      
      // Set token in localStorage
      localStorage.setItem('token', res.data.token)
      setToken(res.data.token)
      
      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      
      toast.success('Registration successful!')
      return res.data
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed'
      toast.error(message)
      throw error
    }
  }

  // Login user
  const loginUser = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, userData)
      
      // Set token in localStorage
      localStorage.setItem('token', res.data.token)
      setToken(res.data.token)
      
      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      
      toast.success('Login successful!')
      return res.data
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  // Logout user
  const logoutUser = () => {
    // Remove token from localStorage
    localStorage.removeItem('token')
    setToken(null)
    
    // Remove token from axios headers
    delete axios.defaults.headers.common['Authorization']
    
    // Clear user data
    setCurrentUser(null)
    setLoading(false)
  }

  // Update user profile
  const updateUserProfile = async (userData) => {
    try {
      const res = await axios.put(`${API_URL}/auth/updatedetails`, userData)
      
      setCurrentUser(res.data.data)
      toast.success('Profile updated successfully!')
      return res.data
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update profile'
      toast.error(message)
      throw error
    }
  }
  
  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.role === 'admin'
  }
  
  // Check if user is staff
  const isStaff = () => {
    return currentUser?.role === 'staff'
  }
  
  // Check if user has administrative access (admin or staff)
  const hasAdminAccess = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'staff'
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        registerUser,
        loginUser,
        logoutUser,
        updateUserProfile,
        isAuthenticated: !!token,
        isAdmin,
        isStaff,
        hasAdminAccess
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext 