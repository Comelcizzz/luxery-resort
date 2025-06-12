import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Rooms from './pages/Rooms'
import RoomDetails from './pages/RoomDetails'
import Services from './pages/Services'
import ServiceDetails from './pages/ServiceDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Bookings from './pages/Bookings'
import ServiceOrders from './pages/ServiceOrders'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/AdminDashboard'
import AddRoom from './pages/AddRoom'
import AddService from './pages/AddService'
import EditRoom from './pages/EditRoom'
import EditService from './pages/EditService'
import UserProfile from './pages/UserProfile'
import BookingDetails from './pages/BookingDetails'
import ServiceOrderDetails from './pages/ServiceOrderDetails'
import PrivateRoute from './components/routing/PrivateRoute'
import AdminRoute from './components/routing/AdminRoute'
import { AuthProvider } from './context/AuthContext'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Toaster position="top-center" />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/rooms/:id" element={<RoomDetails />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <PrivateRoute>
                    <Bookings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/service-orders"
                element={
                  <PrivateRoute>
                    <ServiceOrders />
                  </PrivateRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/rooms/add"
                element={
                  <AdminRoute adminOnly={true}>
                    <AddRoom />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/services/add"
                element={
                  <AdminRoute adminOnly={true}>
                    <AddService />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/rooms/edit/:id"
                element={
                  <AdminRoute>
                    <EditRoom />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/services/edit/:id"
                element={
                  <AdminRoute>
                    <EditService />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users/:id"
                element={
                  <AdminRoute>
                    <UserProfile />
                  </AdminRoute>
                }
              />
              
              <Route
                path="/admin/bookings/:id"
                element={
                  <AdminRoute>
                    <BookingDetails />
                  </AdminRoute>
                }
              />
              
              <Route
                path="/admin/service-orders/:id"
                element={
                  <AdminRoute>
                    <ServiceOrderDetails />
                  </AdminRoute>
                }
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
