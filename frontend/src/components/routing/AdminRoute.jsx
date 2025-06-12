import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import AuthContext from '../../context/AuthContext'
import Spinner from '../ui/Spinner'

const AdminRoute = ({ children, adminOnly = false }) => {
  const { loading, hasAdminAccess, isAdmin } = useContext(AuthContext)

  if (loading) {
    return <Spinner />
  }

  // Check if admin only route
  if (adminOnly) {
    return isAdmin() ? children : <Navigate to="/admin" />
  }
  
  // Check for admin/staff access
  return hasAdminAccess() ? children : <Navigate to="/" />
}

export default AdminRoute 