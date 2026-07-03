import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { MenuProvider } from './context/MenuContext'
import { OrderProvider } from './context/OrderContext'
import { AdminProvider } from './context/AdminContext'
import { NotificationProvider } from './context/NotificationContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import AdminLayout from './components/AdminLayout'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminOrders from './pages/AdminOrders'
import AdminMenu from './pages/AdminMenu'
import AdminUsers from './pages/AdminUsers'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderHistory from './pages/OrderHistory'
import OrderDetails from './pages/OrderDetails'
import NotificationCenter from './pages/NotificationCenter'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {/* MenuProvider and CartProvider sit above the router's protected
              boundary so unauthenticated visitors can browse the public Home
              and Menu pages. CartContext already no-ops until a user is
              logged in, so this is safe for guests. */}
          <MenuProvider>
            <CartProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                <Route element={<ProtectedRoute roles={['student', 'faculty']} />}>
                  <Route element={<OrderProvider><NotificationProvider><AppLayout /></NotificationProvider></OrderProvider>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route path="/orders/:id" element={<OrderDetails />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/notifications" element={<NotificationCenter />} />
                    <Route path="/profile/edit" element={<EditProfile />} />
                  </Route>
                </Route>

                <Route element={<ProtectedRoute roles={['admin']} />}>
                  <Route element={<AdminProvider><NotificationProvider><AdminLayout /></NotificationProvider></AdminProvider>}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
                    <Route path="/admin/orders" element={<AdminOrders />} />
                    <Route path="/admin/orders/:id" element={<OrderDetails />} />
                    <Route path="/admin/menu" element={<AdminMenu />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/notifications" element={<NotificationCenter />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CartProvider>
          </MenuProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App

