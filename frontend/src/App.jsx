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

// Root cause of the guest browsing bug: /menu (and the whole shell) used to
// sit inside <ProtectedRoute roles={['student','faculty']}>, so guests were
// bounced to /login before the page (and its images) ever rendered, even
// though MenuContext itself fetches publicly. The fix is routing: Home and
// Menu now render inside AppLayout for everyone, and only actions/pages that
// truly require an account (Cart, Checkout, Orders, Profile, Notifications)
// stay behind ProtectedRoute.
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <MenuProvider>
            <CartProvider>
              <NotificationProvider>
                <Routes>
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/verify-email/:token" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />

                  {/* Shared shell: same top nav, sidebar, notification bell,
                      and theme toggle for guests and logged-in users alike.
                      OrderProvider is guest-safe (no-ops without a user), so
                      it's mounted here to let Home show recent orders when
                      logged in without duplicating fetch logic. */}
                  <Route element={<OrderProvider><AppLayout /></OrderProvider>}>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />
                    <Route path="/menu" element={<Menu />} />

                    {/* Everything below genuinely needs an account. */}
                    <Route element={<ProtectedRoute roles={['student', 'faculty']} />}>
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
                    <Route element={<AdminProvider><AdminLayout /></AdminProvider>}>
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
              </NotificationProvider>
            </CartProvider>
          </MenuProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App

