# Frontend Overview

React + Vite frontend for students, faculty, and admins with authenticated flows, menus, carts, orders, profiles, notifications, and analytics.

# Folder Structure

frontend/
src/
components/
context/
pages/
services/
App.jsx
App.css
main.jsx
index.css
vite.config.js
package.json
.env.example

## Assets

Image:
frontend/src/assets/hero.png

Purpose:
Homepage hero image

Image:
frontend/src/assets/vite.svg

Purpose:
Starter Vite asset

Image:
frontend/src/assets/react.svg

Purpose:
Starter React asset

Image:
frontend/public/favicon.svg

Purpose:
Site favicon

Image:
frontend/public/icons.svg

Purpose:
Public icon sprite asset

## frontend/index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>frontend</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```

## frontend/eslint.config.js

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])

```

## frontend/vite.config.js

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

```

## frontend/package.json

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.18.0",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-router-dom": "^7.18.0",
    "recharts": "^3.8.1"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.3.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "vite": "^8.0.12"
  }
}

```

## frontend/.env.example

```txt
VITE_API_URL=http://localhost:5000/api
```

## frontend/src/main.jsx

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

## frontend/src/App.jsx

```jsx
﻿import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { MenuProvider } from './context/MenuContext'
import { OrderProvider } from './context/OrderContext'
import { AdminProvider } from './context/AdminContext'
import { NotificationProvider } from './context/NotificationContext'
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
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route element={<ProtectedRoute roles={['student', 'faculty']} />}>
            <Route element={<MenuProvider><CartProvider><OrderProvider><NotificationProvider><AppLayout /></NotificationProvider></OrderProvider></CartProvider></MenuProvider>}>
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
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App


```

## frontend/src/App.css

```css
﻿#root {
  min-height: 100vh;
}

.page {
  width: min(1120px, 100%);
  margin: 0 auto;
  padding: 32px 20px;
}

.narrow {
  width: min(760px, 100%);
}

.hero-panel {
  min-height: calc(100vh - 64px);
  display: grid;
  align-items: center;
  background: linear-gradient(rgba(15, 29, 43, 0.62), rgba(15, 29, 43, 0.62)), url('./assets/hero.png') center/cover no-repeat;
  border-radius: 8px;
  padding: 40px;
  color: white;
}

.hero-panel h1,
.page-heading h1,
.toolbar h1,
.surface h1,
.welcome-band h1,
.section-heading h1 {
  margin: 0;
  line-height: 1.08;
  letter-spacing: 0;
}

.hero-panel h1 {
  max-width: 680px;
  font-size: clamp(2.25rem, 6vw, 4.75rem);
}

.hero-copy {
  max-width: 520px;
  margin: 18px 0 0;
  font-size: 1.08rem;
}

.eyebrow {
  margin: 0 0 8px;
  color: #0f6b5f;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-panel .eyebrow {
  color: #9ff3d8;
}

.surface,
.welcome-band,
.cart-summary,
.orders-shell {
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  padding: 28px;
  box-shadow: 0 16px 45px rgba(30, 47, 66, 0.08);
}

.app-shell {
  min-height: 100vh;
  background: #f7f8fb;
}

.top-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  align-items: center;
  min-height: 68px;
  padding: 0 24px;
  background: white;
  border-bottom: 1px solid #e0e6ed;
}

.brand {
  color: #0f6b5f;
  font-size: 1.15rem;
  font-weight: 900;
}

.nav-links {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.nav-links a,
.sidebar a,
.sidebar button,
.category-grid a,
.quick-actions a {
  border-radius: 6px;
  padding: 10px 12px;
  color: #334756;
  font-weight: 800;
}

.nav-links a.active,
.nav-links a:hover,
.sidebar a:hover,
.sidebar button:hover,
.category-grid a:hover,
.quick-actions a:hover {
  background: #e8f3ef;
  color: #0f6b5f;
}

.nav-user {
  color: #5c6d7c;
  font-weight: 800;
}

.menu-toggle {
  display: none;
  justify-self: end;
  border: 1px solid #cbd6df;
  border-radius: 6px;
  padding: 8px 12px;
  background: white;
  color: #17202a;
  font-weight: 800;
}

.shell-body {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 0;
  min-height: calc(100vh - 68px);
}

.sidebar {
  padding: 24px 18px;
  background: white;
  border-right: 1px solid #e0e6ed;
}

.sidebar-avatar {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #d8efe9;
}

.sidebar h2 {
  margin: 14px 0 4px;
  font-size: 1.1rem;
}

.sidebar p {
  margin: 0 0 16px;
  color: #6a7a88;
  text-transform: capitalize;
}

.sidebar a,
.sidebar button {
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.content-area {
  min-width: 0;
}

.page-heading {
  margin-bottom: 22px;
}

.segmented {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 6px;
  margin-bottom: 22px;
  background: #edf2f7;
  border-radius: 8px;
}

.segmented button,
.text-button {
  border: 0;
  background: transparent;
  color: #36505f;
  cursor: pointer;
  font-weight: 800;
}

.segmented button {
  min-height: 42px;
  border-radius: 6px;
}

.segmented .active {
  background: white;
  color: #0f6b5f;
  box-shadow: 0 6px 18px rgba(23, 32, 42, 0.08);
}

.form-grid {
  display: grid;
  gap: 16px;
}

label {
  display: grid;
  gap: 7px;
  color: #334756;
  font-weight: 800;
  text-align: left;
}

input,
select {
  width: 100%;
  min-height: 44px;
  border: 1px solid #cbd6df;
  border-radius: 6px;
  padding: 10px 12px;
  color: #17202a;
  background: white;
}

input:focus,
select:focus {
  border-color: #0f6b5f;
  outline: 3px solid rgba(15, 107, 95, 0.16);
}

.hint,
.muted {
  color: #6a7a88;
  font-weight: 500;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 800;
}

.primary {
  background: #0f6b5f;
  color: white;
}

.secondary {
  background: white;
  border-color: #cbd6df;
  color: #17202a;
}

.full {
  width: 100%;
}

.button:disabled,
.quantity-control button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.actions,
.split-links,
.toolbar,
.section-heading {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.actions {
  margin-top: 20px;
}

.centered {
  justify-content: center;
}

.split-links,
.toolbar,
.section-heading {
  justify-content: space-between;
}

.switch-copy,
.split-links {
  margin-top: 18px;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.check-row input {
  width: 18px;
  min-height: 18px;
}

.meter {
  height: 8px;
  overflow: hidden;
  background: #e9eef3;
  border-radius: 999px;
}

.meter span {
  display: block;
  height: 100%;
  background: #0f6b5f;
  transition: width 0.2s ease;
}

.validation-list {
  margin: 0;
  padding-left: 18px;
  color: #9a3412;
  text-align: left;
}

.alert {
  margin: 12px 0;
  border-radius: 6px;
  padding: 12px;
  font-weight: 700;
}

.error {
  background: #fff1f2;
  color: #9f1239;
}

.success {
  background: #ecfdf5;
  color: #047857;
}

.status,
.center-copy {
  text-align: center;
}

.welcome-band {
  background: #17202a;
  color: white;
}

.welcome-band .eyebrow,
.welcome-band p {
  color: #cce8df;
}

.section-block {
  margin-top: 28px;
}

.mini-grid,
.category-grid,
.quick-actions,
.menu-grid {
  display: grid;
  gap: 16px;
}

.mini-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.food-tile,
.menu-card,
.cart-row {
  overflow: hidden;
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
}

.food-tile img {
  width: 100%;
  height: 130px;
  object-fit: cover;
}

.food-tile div {
  padding: 12px;
}

.food-tile h3,
.food-tile p,
.menu-card h2,
.cart-row h2 {
  margin: 0;
}

.category-grid,
.quick-actions {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.category-grid a,
.quick-actions a {
  min-height: 70px;
  display: grid;
  place-items: center;
  background: white;
  border: 1px solid #e0e6ed;
  text-align: center;
}

.menu-tools {
  display: grid;
  grid-template-columns: minmax(220px, 380px) 1fr;
  gap: 16px;
  align-items: start;
  margin: 20px 0;
}

.filter-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-row button {
  border: 1px solid #cbd6df;
  border-radius: 999px;
  padding: 10px 14px;
  background: white;
  color: #334756;
  cursor: pointer;
  font-weight: 800;
}

.filter-row .active {
  border-color: #0f6b5f;
  background: #e8f3ef;
  color: #0f6b5f;
}

.menu-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.menu-card img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

.menu-card-body {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.card-title-row,
.card-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.badge {
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 0.78rem;
  font-weight: 900;
  white-space: nowrap;
}

.ok {
  background: #ecfdf5;
  color: #047857;
}

.off {
  background: #f1f5f9;
  color: #64748b;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  margin-top: 20px;
}

.cart-list {
  display: grid;
  gap: 12px;
}

.cart-row {
  display: grid;
  grid-template-columns: 96px 1fr auto auto auto;
  gap: 16px;
  align-items: center;
  padding: 12px;
}

.cart-row img {
  width: 96px;
  height: 76px;
  border-radius: 6px;
  object-fit: cover;
}

.quantity-control {
  display: grid;
  grid-template-columns: 36px 42px 36px;
  align-items: center;
  text-align: center;
  border: 1px solid #cbd6df;
  border-radius: 6px;
  overflow: hidden;
}

.quantity-control button {
  min-height: 36px;
  border: 0;
  background: #f1f5f9;
  cursor: pointer;
  font-weight: 900;
}

.danger {
  color: #b91c1c;
}

.cart-summary {
  display: grid;
  align-content: start;
  gap: 14px;
}

.cart-summary div,
.checkout-items div,
.payment-box,
.checkout-total,
.orders-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.checkout-box {
  display: grid;
  gap: 18px;
}

.checkout-items {
  display: grid;
  gap: 12px;
}

.payment-box,
.checkout-total {
  border-top: 1px solid #e0e6ed;
  padding-top: 14px;
}

.checkout-total {
  font-size: 1.15rem;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.48);
  z-index: 30;
}

.modal-card {
  width: min(420px, 100%);
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.3);
}

.orders-shell {
  margin-top: 20px;
}

.orders-header {
  padding-bottom: 14px;
  color: #6a7a88;
  font-weight: 900;
}

.order-empty {
  box-shadow: none;
}

.profile-summary {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 18px;
  align-items: center;
}

.profile-summary.compact {
  grid-template-columns: auto 1fr;
  margin-bottom: 20px;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #d8efe9;
}

.detail-list {
  display: grid;
  gap: 10px;
  margin: 0;
}

.detail-list div {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e6edf3;
}

dt {
  color: #6a7a88;
  font-weight: 800;
}

dd {
  margin: 0;
}

@media (max-width: 980px) {
  .top-nav {
    grid-template-columns: 1fr auto;
  }

  .menu-toggle {
    display: inline-flex;
  }

  .nav-links,
  .nav-user {
    display: none;
  }

  .nav-links.open {
    grid-column: 1 / -1;
    display: grid;
    justify-content: stretch;
    padding-bottom: 14px;
  }

  .shell-body {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .menu-tools,
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .menu-grid,
  .mini-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .page {
    padding: 18px 12px;
  }

  .hero-panel,
  .surface,
  .welcome-band,
  .cart-summary,
  .orders-shell {
    padding: 22px;
  }

  .profile-summary,
  .toolbar,
  .detail-list div,
  .cart-row,
  .orders-header {
    grid-template-columns: 1fr;
  }

  .cart-row {
    align-items: start;
  }

  .cart-row img {
    width: 100%;
    height: 160px;
  }

  .category-grid,
  .quick-actions,
  .menu-grid,
  .mini-grid {
    grid-template-columns: 1fr;
  }

  .card-title-row,
  .card-meta {
    align-items: start;
  }
}

textarea {
  width: 100%;
  min-height: 96px;
  resize: vertical;
  border: 1px solid #cbd6df;
  border-radius: 6px;
  padding: 10px 12px;
  color: #17202a;
  background: white;
  font: inherit;
}

textarea:focus {
  border-color: #0f6b5f;
  outline: 3px solid rgba(15, 107, 95, 0.16);
}

.modal-actions,
.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.modal-actions {
  margin-top: 20px;
}

.order-list {
  display: grid;
  gap: 16px;
  margin-top: 20px;
}

.order-card,
.admin-order-card,
.admin-menu-card,
.stat-card,
.order-column,
.data-table {
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
}

.order-card {
  padding: 22px;
}

.order-card-head,
.order-card-foot,
.column-heading,
.admin-order-card > div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.order-card-head h2 {
  margin: 0;
  font-size: 1rem;
}

.order-item-list {
  display: grid;
  gap: 8px;
  margin: 18px 0;
  padding: 0;
  list-style: none;
}

.order-item-list li,
.order-detail-items > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #e6edf3;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.78rem;
  font-weight: 900;
  white-space: nowrap;
}

.status-badge.received { background: #e8f1fb; color: #1d4f91; }
.status-badge.preparing { background: #fff7dd; color: #8a5a00; }
.status-badge.ready { background: #e8f6ef; color: #0f6b45; }
.status-badge.disabled { background: #f1f3f5; color: #68737d; }

.order-detail {
  display: grid;
  gap: 22px;
}

.order-detail section h2 {
  margin-bottom: 8px;
  font-size: 1.05rem;
}

.order-detail-items {
  display: grid;
}

.order-detail-items span {
  display: grid;
  gap: 4px;
}

.order-detail-items small,
.table-row small,
.admin-order-card span {
  color: #6a7a88;
}

.admin-sidebar .active {
  background: #e8f3ef;
  color: #0f6b5f;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.stat-card {
  display: grid;
  gap: 18px;
  min-height: 130px;
  padding: 20px;
  color: #334756;
}

.stat-card strong {
  color: #17202a;
  font-size: 2rem;
}

.stat-card:hover {
  border-color: #8dbdb4;
  background: #f8fcfb;
}

.admin-order-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
  align-items: start;
}

.order-column {
  display: grid;
  gap: 12px;
  padding: 16px;
  background: #f3f6f8;
}

.column-heading h2 {
  margin: 0;
  font-size: 1rem;
}

.column-heading span {
  display: grid;
  place-items: center;
  min-width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #dce5eb;
  font-weight: 900;
}

.admin-order-card {
  display: grid;
  gap: 10px;
  padding: 14px;
}

.admin-order-card p {
  margin: 0;
}

.admin-order-card .actions {
  margin-top: 4px;
}

.admin-order-card .button {
  min-height: 38px;
  padding: 8px 10px;
  font-size: 0.85rem;
}

.admin-tools {
  display: grid;
  grid-template-columns: minmax(260px, 420px) 1fr;
  gap: 16px;
  margin: 20px 0;
}

.data-table {
  overflow: hidden;
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 0.7fr 0.8fr 0.7fr 1.4fr;
  gap: 12px;
  align-items: center;
  min-height: 68px;
  padding: 12px 16px;
  border-bottom: 1px solid #e6edf3;
}

.table-row:last-child {
  border-bottom: 0;
}

.table-row > span:first-child {
  display: grid;
  gap: 4px;
}

.table-head {
  min-height: 48px;
  background: #f3f6f8;
  color: #5c6d7c;
  font-size: 0.82rem;
  font-weight: 900;
}

.capitalize { text-transform: capitalize; }
.danger-button { background: #fff; border-color: #e4a6a6; color: #a12626; }

.user-modal,
.menu-form-modal {
  width: min(620px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.admin-menu-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.admin-menu-card {
  display: grid;
  grid-template-columns: 180px 1fr;
  overflow: hidden;
}

.admin-menu-card > img {
  width: 100%;
  height: 100%;
  min-height: 220px;
  object-fit: cover;
}

.admin-menu-body {
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 18px;
}

.admin-menu-body h2,
.admin-menu-body p {
  margin: 0;
}

.two-column-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .admin-order-board { grid-template-columns: 1fr; }
  .admin-menu-grid { grid-template-columns: 1fr; }
}

@media (max-width: 760px) {
  .admin-tools,
  .two-column-form,
  .table-row,
  .admin-menu-card {
    grid-template-columns: 1fr;
  }

  .table-head { display: none; }
  .table-row { gap: 8px; }
  .row-actions { justify-content: flex-start; }
  .admin-menu-card > img { height: 190px; min-height: 0; }
  .order-card-head,
  .order-card-foot { align-items: flex-start; flex-direction: column; }
}

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
}



.nav-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  min-width: 0;
}

.notification-wrap {
  position: relative;
}

.notification-trigger {
  position: relative;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid #cbd6df;
  border-radius: 50%;
  background: white;
  color: #0f6b5f;
  cursor: pointer;
  font-size: 0;
}

.notification-trigger::before {
  content: "";
  width: 14px;
  height: 16px;
  border: 2px solid currentColor;
  border-bottom: 0;
  border-radius: 10px 10px 4px 4px;
}

.notification-trigger::after {
  content: "";
  position: absolute;
  bottom: 9px;
  width: 8px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
}

.notification-trigger strong {
  position: absolute;
  top: -5px;
  right: -5px;
  display: grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  padding: 0 5px;
  background: #d94b3d;
  color: white;
  font-size: 0.7rem;
  line-height: 1;
}

.notification-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: 40;
  width: min(380px, calc(100vw - 32px));
  max-height: min(520px, calc(100vh - 96px));
  overflow: hidden;
  background: white;
  border: 1px solid #d9e2ea;
  border-radius: 8px;
  box-shadow: 0 20px 55px rgba(23, 32, 42, 0.16);
}

.notification-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #e6edf3;
}

.notification-head h2 {
  margin: 0;
  font-size: 1rem;
}

.notification-head button {
  border: 0;
  background: transparent;
  color: #0f6b5f;
  cursor: pointer;
  font-weight: 800;
}

.notification-head button:disabled {
  color: #9aa8b4;
  cursor: not-allowed;
}

.notification-list {
  display: grid;
  max-height: 430px;
  overflow-y: auto;
}

.notification-item {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-bottom: 1px solid #edf2f6;
  color: #334756;
}

.notification-item:hover,
.notification-item.unread {
  background: #f2faf7;
}

.notification-item span {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.notification-item small {
  color: #6a7a88;
  font-size: 0.72rem;
  white-space: nowrap;
}

.notification-item p,
.notification-status {
  margin: 0;
  color: #5c6d7c;
}

.notification-status {
  padding: 18px 16px;
}

.notification-status.error {
  color: #a12626;
}

.notification-center-list {
  display: grid;
  gap: 14px;
  margin-top: 20px;
}

.notification-center-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 18px;
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
}

.notification-center-item.unread {
  border-color: #8dbdb4;
  background: #f8fcfb;
}

.notification-center-item h2 {
  margin: 0 0 6px;
  font-size: 1.05rem;
}

.notification-center-item p:not(.eyebrow) {
  margin: 0;
  color: #5c6d7c;
}

@media (max-width: 760px) {
  .nav-actions {
    grid-column: 1 / -1;
    justify-content: space-between;
  }

  .notification-panel {
    right: auto;
    left: 0;
  }

  .notification-center-item {
    grid-template-columns: 1fr;
    align-items: start;
  }
}


.analytics-section {
  display: grid;
  gap: 18px;
  margin-top: 28px;
}

.analytics-cards {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}

.analytics-card {
  min-height: 112px;
}

.analytics-card strong {
  font-size: 1.45rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.analytics-panel {
  min-width: 0;
  padding: 18px;
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
}

.analytics-panel h2 {
  margin: 0 0 14px;
  font-size: 1rem;
}

.analytics-panel-wide {
  grid-column: 1 / -1;
}

.analytics-table .table-row {
  grid-template-columns: 1.7fr 0.7fr 0.6fr 0.8fr;
}

.top-customers-panel {
  margin-top: 0;
}

@media (max-width: 980px) {
  .analytics-cards,
  .analytics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .analytics-cards,
  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .analytics-table .table-row {
    grid-template-columns: 1fr;
  }
}

```

## frontend/src/index.css

```css
﻿:root {
  color: #17202a;
  background: #f7f8fb;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

a {
  color: #0f6b5f;
  font-weight: 700;
  text-decoration: none;
}

button,
input,
select {
  font: inherit;
}


```

## frontend/src/services/api.js

```js
﻿import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth') || sessionStorage.getItem('auth')

  if (stored) {
    const { token } = JSON.parse(stored)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api


```

## frontend/src/components/AppLayout.jsx

```jsx
﻿import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import NotificationBell from './NotificationBell'

const navLinks = [
  { to: '/dashboard', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/cart', label: 'Cart' },
  { to: '/orders', label: 'Order History' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/profile', label: 'Profile' },
]

function AppLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="top-nav">
        <Link className="brand" to="/dashboard">Campus Canteen</Link>
        <button className="menu-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">Menu</button>
        <nav className={open ? 'nav-links open' : 'nav-links'}>
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}>
              {link.label}{link.to === '/cart' && itemCount > 0 ? ` (${itemCount})` : ''}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions"><NotificationBell /><div className="nav-user">{user?.fullName}</div></div>
      </header>

      <div className="shell-body">
        <aside className="sidebar">
          <img className="sidebar-avatar" src={user?.profilePic || 'https://placehold.co/112x112?text=User'} alt="Profile" />
          <h2>{user?.fullName}</h2>
          <p>{user?.role}</p>
          <Link to="/profile">Profile</Link>
          <Link to="/orders">Order History</Link>
          <Link to="/notifications">Notifications</Link>
          <button type="button" onClick={handleLogout}>Logout</button>
        </aside>
        <section className="content-area">
          <Outlet />
        </section>
      </div>
    </div>
  )
}

export default AppLayout

```

## frontend/src/components/AdminLayout.jsx

```jsx
﻿import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

const links = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/notifications', label: 'Notifications' },
]

function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell admin-shell">
      <header className="top-nav">
        <Link className="brand" to="/admin">Canteen Admin</Link>
        <button className="menu-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">Menu</button>
        <nav className={open ? 'nav-links open' : 'nav-links'}>
          {links.map((link) => <NavLink key={link.to} to={link.to} end={link.to === '/admin'} onClick={() => setOpen(false)}>{link.label}</NavLink>)}
        </nav>
        <div className="nav-actions"><NotificationBell /><div className="nav-user">{user?.fullName}</div></div>
      </header>
      <div className="shell-body">
        <aside className="sidebar admin-sidebar">
          <p className="eyebrow">Administration</p>
          <h2>{user?.fullName}</h2>
          {links.map((link) => <NavLink key={link.to} to={link.to} end={link.to === '/admin'}>{link.label}</NavLink>)}
          <button type="button" onClick={handleLogout}>Logout</button>
        </aside>
        <section className="content-area"><Outlet /></section>
      </div>
    </div>
  )
}

export default AdminLayout


```

## frontend/src/components/AdminAnalyticsCharts.jsx

```jsx
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const colors = ['#0f6b5f', '#2f80ed', '#f2a93b', '#d94b3d', '#7a5af8', '#4f6f52']
const currency = (value) => `Rs. ${Number(value || 0).toFixed(0)}`

function EmptyChart({ title }) {
  return <section className="analytics-panel"><h2>{title}</h2><p className="muted">No data yet</p></section>
}

export function RevenueTrendChart({ data = [] }) {
  if (!data.length) return <EmptyChart title="Revenue Trend" />
  return (
    <section className="analytics-panel">
      <h2>Revenue Trend</h2>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6edf3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={currency} width={72} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => currency(value)} />
          <Area type="monotone" dataKey="revenue" stroke="#0f6b5f" fill="#d8efe9" name="Revenue" />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  )
}

export function OrdersTrendChart({ data = [] }) {
  if (!data.length) return <EmptyChart title="Orders Trend" />
  return (
    <section className="analytics-panel">
      <h2>Orders Trend</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6edf3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="orders" fill="#2f80ed" name="Orders" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}

export function CategoryDistributionChart({ data = [] }) {
  if (!data.length) return <EmptyChart title="Category Distribution" />
  return (
    <section className="analytics-panel">
      <h2>Category Distribution</h2>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="quantity" nameKey="category" outerRadius={86} label>
            {data.map((entry, index) => <Cell key={entry.category} fill={colors[index % colors.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </section>
  )
}

export function StatusDistributionChart({ data = [] }) {
  if (!data.length) return <EmptyChart title="Status Distribution" />
  return (
    <section className="analytics-panel">
      <h2>Status Distribution</h2>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" innerRadius={48} outerRadius={86} label>
            {data.map((entry, index) => <Cell key={entry.status} fill={colors[index % colors.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </section>
  )
}

export function PopularItemsChart({ data = [] }) {
  if (!data.length) return <EmptyChart title="Most Popular Items" />
  return (
    <section className="analytics-panel analytics-panel-wide">
      <h2>Most Popular Items</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 40, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6edf3" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="quantity" fill="#0f6b5f" name="Quantity" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}

```

## frontend/src/components/NotificationBell.jsx

```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'

const formatTime = (value) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

function NotificationBell() {
  const { user } = useAuth()
  const { notifications, unreadCount, loading, error, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)

  const orderPath = (notification) => user?.role === 'admin' && notification.type === 'admin_new_order' ? '/admin/orders' : '/orders'

  return (
    <div className="notification-wrap">
      <button className="notification-trigger" type="button" onClick={() => setOpen((value) => !value)} aria-label="Notifications">
        <span aria-hidden="true">Bell</span>
        {unreadCount > 0 && <strong>{unreadCount > 9 ? '9+' : unreadCount}</strong>}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-head">
            <h2>Notifications</h2>
            <button type="button" onClick={markAllRead} disabled={unreadCount === 0}>Mark all read</button>
          </div>
          {error && <p className="notification-status error">{error}</p>}
          {loading && notifications.length === 0 ? <p className="notification-status">Loading notifications...</p> : notifications.length === 0 ? (
            <p className="notification-status">No notifications yet.</p>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <Link
                  className={notification.read ? 'notification-item' : 'notification-item unread'}
                  key={notification._id}
                  to={orderPath(notification)}
                  onClick={() => {
                    setOpen(false)
                    if (!notification.read) markRead(notification._id)
                  }}
                >
                  <span>
                    <strong>{notification.title}</strong>
                    <small>{formatTime(notification.createdAt)}</small>
                  </span>
                  <p>{notification.message}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell

```

## frontend/src/components/ProtectedRoute.jsx

```jsx
﻿import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()

  if (loading) return <main className="page"><p className="status">Checking session...</p></main>
  if (!user) return <Navigate to="/login" replace />
  if (roles?.length && !roles.includes(user.role)) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />

  return <Outlet />
}

export default ProtectedRoute



```

## frontend/src/context/AuthContext.jsx

```jsx
﻿/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const readStoredAuth = () => {
  const raw = localStorage.getItem('auth') || sessionStorage.getItem('auth')
  return raw ? JSON.parse(raw) : { token: null, user: null }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth)
  const [loading, setLoading] = useState(Boolean(auth.token))

  const persistAuth = useCallback((nextAuth, remember) => {
    const storage = remember ? localStorage : sessionStorage
    localStorage.removeItem('auth')
    sessionStorage.removeItem('auth')
    storage.setItem('auth', JSON.stringify(nextAuth))
    setAuth(nextAuth)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth')
    sessionStorage.removeItem('auth')
    setAuth({ token: null, user: null })
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.token) {
        setLoading(false)
        return
      }

      try {
        const { data } = await api.get('/auth/profile')
        setAuth((current) => ({ ...current, user: data.user }))
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [auth.token, logout])

  const login = useCallback(async ({ email, password, remember }) => {
    const { data } = await api.post('/auth/login', { email, password })
    persistAuth({ token: data.token, user: data.user }, remember)
    return data.user
  }, [persistAuth])

  const updateUser = useCallback((user) => {
    const remember = Boolean(localStorage.getItem('auth'))
    setAuth((current) => {
      const nextAuth = { ...current, user }
      localStorage.removeItem('auth')
      sessionStorage.removeItem('auth')
      const storage = remember ? localStorage : sessionStorage
      storage.setItem('auth', JSON.stringify(nextAuth))
      return nextAuth
    })
  }, [])

  const value = useMemo(() => ({ ...auth, loading, login, logout, updateUser }), [auth, loading, login, logout, updateUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

```

## frontend/src/context/CartContext.jsx

```jsx
﻿/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)
const emptyCart = { items: [], total: 0 }

const readCachedCart = (userId) => {
  if (!userId) return emptyCart
  const raw = localStorage.getItem(`cart:${userId}`)
  return raw ? JSON.parse(raw) : emptyCart
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const userId = user?._id
  const [cart, setCart] = useState(() => readCachedCart(userId))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const persistCart = useCallback((nextCart) => {
    setCart(nextCart)
    if (userId) localStorage.setItem(`cart:${userId}`, JSON.stringify(nextCart))
  }, [userId])

  const fetchCart = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError('')

    try {
      const { data } = await api.get('/cart')
      persistCart(data.cart)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart.')
    } finally {
      setLoading(false)
    }
  }, [persistCart, userId])

  useEffect(() => {
    if (userId) {
      setCart(readCachedCart(userId))
      fetchCart()
    } else {
      setCart(emptyCart)
    }
  }, [fetchCart, userId])

  const addToCart = useCallback(async (menuItemId, quantity = 1) => {
    setError('')
    const { data } = await api.post('/cart/add', { menuItemId, quantity })
    persistCart(data.cart)
    return data
  }, [persistCart])

  const updateQuantity = useCallback(async (menuItemId, quantity) => {
    setError('')
    const { data } = await api.put('/cart/update', { menuItemId, quantity })
    persistCart(data.cart)
    return data
  }, [persistCart])

  const removeItem = useCallback(async (menuItemId) => {
    setError('')
    const { data } = await api.delete(`/cart/remove/${menuItemId}`)
    persistCart(data.cart)
    return data
  }, [persistCart])

  const clearCart = useCallback(async () => {
    setError('')
    const { data } = await api.delete('/cart/clear')
    persistCart(data.cart)
    return data
  }, [persistCart])

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  const value = useMemo(() => ({ cart, itemCount, loading, error, fetchCart, addToCart, updateQuantity, removeItem, clearCart }), [cart, itemCount, loading, error, fetchCart, addToCart, updateQuantity, removeItem, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)

```

## frontend/src/context/MenuContext.jsx

```jsx
﻿/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const MenuContext = createContext(null)
const categories = ['All', 'Veg', 'Non Veg', 'Snacks', 'Drinks']

export function MenuProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchMenu = useCallback(async ({ category = 'All', search = '' } = {}) => {
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const { data } = await api.get('/menu', { params: { category, search } })
      setItems(data.items)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load menu.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchMenu()
  }, [fetchMenu])

  const value = useMemo(() => ({ items, loading, error, categories, fetchMenu }), [items, loading, error, fetchMenu])

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export const useMenu = () => useContext(MenuContext)

```

## frontend/src/context/OrderContext.jsx

```jsx
﻿/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'
import { useCart } from './CartContext'

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const { user } = useAuth()
  const { fetchCart } = useCart()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchOrders = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/orders')
      setOrders(data.orders)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const createOrder = useCallback(async () => {
    setError('')
    const { data } = await api.post('/orders')
    setOrders((current) => [data.order, ...current])
    await fetchCart()
    return data.order
  }, [fetchCart])

  const downloadInvoice = useCallback(async (order) => {
    const { data } = await api.get(`/orders/${order._id}/invoice`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${order.orderNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }, [])

  const value = useMemo(() => ({ orders, loading, error, fetchOrders, createOrder, downloadInvoice }), [orders, loading, error, fetchOrders, createOrder, downloadInvoice])
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export const useOrders = () => useContext(OrderContext)


```

## frontend/src/context/AdminContext.jsx

```jsx
﻿/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import api from '../services/api'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = useCallback(async (request) => {
    setLoading(true)
    setError('')
    try {
      return await request()
    } catch (err) {
      const message = err.response?.data?.message || 'Admin request failed.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(() => run(async () => {
    const { data } = await api.get('/admin/dashboard')
    setStats(data.stats)
    return data.stats
  }), [run])

  const fetchAnalytics = useCallback(() => run(async () => {
    const { data } = await api.get('/admin/analytics')
    setAnalytics(data.analytics)
    return data.analytics
  }), [run])

  const fetchOrders = useCallback(() => run(async () => {
    const { data } = await api.get('/admin/orders')
    setOrders(data.orders)
    return data.orders
  }), [run])

  const updateOrderStatus = useCallback((id, status) => run(async () => {
    const { data } = await api.put(`/admin/orders/${id}/status`, { status })
    setOrders((current) => current.map((order) => order._id === id ? data.order : order))
    return data.order
  }), [run])

  const fetchUsers = useCallback((params = {}) => run(async () => {
    const { data } = await api.get('/admin/users', { params })
    setUsers(data.users)
    return data.users
  }), [run])

  const toggleUser = useCallback((id) => run(async () => {
    const { data } = await api.put(`/admin/users/${id}/toggle`)
    setUsers((current) => current.map((user) => user._id === id ? data.user : user))
    return data.user
  }), [run])

  const fetchMenu = useCallback(() => run(async () => {
    const { data } = await api.get('/admin/menu')
    setMenuItems(data.items)
    return data.items
  }), [run])

  const saveMenuItem = useCallback((id, formData) => run(async () => {
    const { data } = id
      ? await api.put(`/admin/menu/${id}`, formData)
      : await api.post('/admin/menu', formData)
    setMenuItems((current) => id ? current.map((item) => item._id === id ? data.item : item) : [...current, data.item])
    return data.item
  }), [run])

  const deleteMenuItem = useCallback((id) => run(async () => {
    await api.delete(`/admin/menu/${id}`)
    setMenuItems((current) => current.filter((item) => item._id !== id))
  }), [run])

  const value = useMemo(() => ({
    stats, analytics, orders, users, menuItems, loading, error,
    fetchStats, fetchAnalytics, fetchOrders, updateOrderStatus, fetchUsers, toggleUser, fetchMenu, saveMenuItem, deleteMenuItem
  }), [stats, analytics, orders, users, menuItems, loading, error, fetchStats, fetchAnalytics, fetchOrders, updateOrderStatus, fetchUsers, toggleUser, fetchMenu, saveMenuItem, deleteMenuItem])

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export const useAdmin = () => useContext(AdminContext)


```

## frontend/src/context/NotificationContext.jsx

```jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markRead = useCallback(async (id) => {
    const { data } = await api.put(`/notifications/${id}/read`)
    setNotifications((current) => current.map((item) => item._id === id ? data.notification : item))
    setUnreadCount(data.unreadCount)
  }, [])

  const markAllRead = useCallback(async () => {
    const { data } = await api.put('/notifications/read-all')
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
    setUnreadCount(data.unreadCount)
  }, [])

  const value = useMemo(() => ({
    notifications, unreadCount, loading, error, fetchNotifications, markRead, markAllRead
  }), [notifications, unreadCount, loading, error, fetchNotifications, markRead, markAllRead])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotifications = () => useContext(NotificationContext)

```

## frontend/src/pages/Home.jsx

```jsx
﻿import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user } = useAuth()

  return (
    <main className="page home-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Campus Canteen</p>
          <h1>Food ordering for students and faculty</h1>
          <p className="hero-copy">Register, verify your email, and manage your canteen profile from one account.</p>
          <div className="actions">
            {user ? <Link className="button primary" to="/dashboard">Go to dashboard</Link> : <Link className="button primary" to="/register">Create account</Link>}
            <Link className="button secondary" to="/login">Login</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home


```

## frontend/src/pages/Login.jsx

```jsx
﻿import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const dashboardPath = (role) => role === 'admin' ? '/admin' : '/dashboard'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await login(form)
      navigate(dashboardPath(user.role), { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page narrow">
      <div className="surface">
        <div className="page-heading">
          <p className="eyebrow">Login</p>
          <h1>Welcome back</h1>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label>Password<input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
          <button className="text-button" type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide Password' : 'Show Password'}</button>
          <label className="check-row"><input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} /> Remember Me</label>
          {error && <p className="alert error">{error}</p>}
          <button className="button primary full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <div className="split-links"><Link to="/forgot-password">Forgot password?</Link><Link to="/register">Create account</Link></div>
      </div>
    </main>
  )
}

export default Login




```

## frontend/src/pages/Register.jsx

```jsx
﻿import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const genders = ['Male', 'Female', 'Prefer not to say']
const branches = ['CSE', 'EXTC', 'COMS']
const divisions = ['A', 'B', 'C', 'D']
const classOptions = {
  CSE: ['1st Year BTech', '2nd Year BTech', '3rd Year BTech', '4th Year BTech', 'FYMCA', 'SYMCA', 'FYMTech', 'SYMTech'],
  EXTC: ['1st Year BTech', '2nd Year BTech', '3rd Year BTech', '4th Year BTech', 'FYMTech', 'SYMTech'],
  COMS: ['1st Year BTech', '2nd Year BTech', '3rd Year BTech', '4th Year BTech', 'FYMTech', 'SYMTech'],
}

const initialStudent = { fullName: '', ucid: '', email: '', gender: '', branch: '', className: '', division: '', password: '', confirmPassword: '' }
const initialFaculty = { fullName: '', email: '', gender: '', branch: '', designation: '', password: '', confirmPassword: '' }

const passwordChecks = (password) => [
  { label: 'At least 8 characters', valid: password.length >= 8 },
  { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
  { label: 'Lowercase letter', valid: /[a-z]/.test(password) },
  { label: 'Number', valid: /\d/.test(password) },
  { label: 'Special character', valid: /[^A-Za-z\d]/.test(password) },
]

function Register() {
  const [role, setRole] = useState('student')
  const [student, setStudent] = useState(initialStudent)
  const [faculty, setFaculty] = useState(initialFaculty)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const form = role === 'student' ? student : faculty
  const checks = useMemo(() => passwordChecks(form.password), [form.password])
  const strength = checks.filter((check) => check.valid).length

  const updateField = (field, value) => {
    const setter = role === 'student' ? setStudent : setFaculty
    setter((current) => ({ ...current, [field]: value, ...(field === 'branch' && role === 'student' ? { className: '' } : {}) }))
  }

  const clientErrors = useMemo(() => {
    const errors = []
    if (role === 'student' && form.ucid && !/^\d{10}$/.test(form.ucid)) errors.push('UCID must be exactly 10 digits.')
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.push('Enter a valid email address.')
    checks.forEach((check) => {
      if (form.password && !check.valid) errors.push(check.label)
    })
    if (form.confirmPassword && form.password !== form.confirmPassword) errors.push('Passwords do not match.')
    return errors
  }, [role, form, checks])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const endpoint = role === 'student' ? '/auth/register/student' : '/auth/register/faculty'
      const { data } = await api.post(endpoint, form)
      setMessage(data.message)
      role === 'student' ? setStudent(initialStudent) : setFaculty(initialFaculty)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page narrow">
      <div className="surface">
        <div className="page-heading">
          <p className="eyebrow">Registration</p>
          <h1>Create your account</h1>
        </div>

        <div className="segmented">
          <button className={role === 'student' ? 'active' : ''} type="button" onClick={() => setRole('student')}>Student</button>
          <button className={role === 'faculty' ? 'active' : ''} type="button" onClick={() => setRole('faculty')}>Faculty</button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Full Name<input value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} required /></label>
          {role === 'student' && <label>UCID<input value={form.ucid} maxLength="10" onChange={(e) => updateField('ucid', e.target.value.replace(/\D/g, ''))} required /></label>}
          <label>Email<input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required /></label>
          <label>Gender<select value={form.gender} onChange={(e) => updateField('gender', e.target.value)} required><option value="">Select gender</option>{genders.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Branch<select value={form.branch} onChange={(e) => updateField('branch', e.target.value)} required><option value="">Select branch</option>{branches.map((item) => <option key={item}>{item}</option>)}</select></label>
          {role === 'student' && <label>Class<select value={form.className} onChange={(e) => updateField('className', e.target.value)} required><option value="">Select class</option>{(classOptions[form.branch] || []).map((item) => <option key={item}>{item}</option>)}</select></label>}
          {role === 'student' && <label>Division<select value={form.division} onChange={(e) => updateField('division', e.target.value)} required><option value="">Select division</option>{divisions.map((item) => <option key={item}>{item}</option>)}</select><span className="hint">If your class has only one division, select A.</span></label>}
          {role === 'faculty' && <label>Designation<input value={form.designation} onChange={(e) => updateField('designation', e.target.value)} required /></label>}
          <label>Password<input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => updateField('password', e.target.value)} required /></label>
          <label>Confirm Password<input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} required /></label>
          <button className="text-button" type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide Password' : 'Show Password'}</button>

          <div className="meter" aria-label="Password strength"><span style={{ width: `${strength * 20}%` }} /></div>
          <ul className="validation-list">{clientErrors.map((item) => <li key={item}>{item}</li>)}</ul>
          {error && <p className="alert error">{error}</p>}
          {message && <p className="alert success">{message}</p>}
          <button className="button primary full" disabled={loading || clientErrors.length > 0}>{loading ? 'Creating account...' : 'Register'}</button>
        </form>
        <p className="switch-copy">Already registered? <Link to="/login">Login</Link></p>
      </div>
    </main>
  )
}

export default Register


```

## frontend/src/pages/VerifyEmail.jsx

```jsx
﻿import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'

function VerifyEmail() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await api.get(`/auth/verify-email/${token}`)
        setStatus('success')
        setMessage(data.message)
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Verification failed.')
      }
    }

    verify()
  }, [token])

  return (
    <main className="page narrow">
      <div className="surface center-copy">
        <p className="eyebrow">Email Verification</p>
        <h1>{status === 'success' ? 'Verified' : status === 'error' ? 'Link failed' : 'Please wait'}</h1>
        <p className={status === 'error' ? 'alert error' : 'alert success'}>{message}</p>
        <Link className="button primary" to="/login">Go to login</Link>
      </div>
    </main>
  )
}

export default VerifyEmail


```

## frontend/src/pages/ForgotPassword.jsx

```jsx
﻿import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      setMessage(data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page narrow">
      <div className="surface">
        <div className="page-heading"><p className="eyebrow">Password</p><h1>Reset link</h1></div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          {error && <p className="alert error">{error}</p>}
          {message && <p className="alert success">{message}</p>}
          <button className="button primary full" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
        </form>
        <p className="switch-copy"><Link to="/login">Back to login</Link></p>
      </div>
    </main>
  )
}

export default ForgotPassword


```

## frontend/src/pages/ResetPassword.jsx

```jsx
﻿import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'

const passwordChecks = (password) => [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z\d]/.test(password)]

function ResetPassword() {
  const { token } = useParams()
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const strength = useMemo(() => passwordChecks(form.password).filter(Boolean).length, [form.password])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, form)
      setMessage(data.message)
      setForm({ password: '', confirmPassword: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page narrow">
      <div className="surface">
        <div className="page-heading"><p className="eyebrow">Password</p><h1>Create new password</h1></div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Password<input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
          <label>Confirm Password<input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required /></label>
          <button className="text-button" type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide Password' : 'Show Password'}</button>
          <div className="meter"><span style={{ width: `${strength * 20}%` }} /></div>
          {error && <p className="alert error">{error}</p>}
          {message && <p className="alert success">{message}</p>}
          <button className="button primary full" disabled={loading}>{loading ? 'Saving...' : 'Reset password'}</button>
        </form>
        <p className="switch-copy"><Link to="/login">Back to login</Link></p>
      </div>
    </main>
  )
}

export default ResetPassword


```

## frontend/src/pages/Dashboard.jsx

```jsx
﻿import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMenu } from '../context/MenuContext'

const categories = ['Veg', 'Non Veg', 'Snacks', 'Drinks']

function Dashboard() {
  const { user } = useAuth()
  const { items, loading } = useMenu()
  const featured = items.slice(0, 4)
  const popular = items.slice(4, 8)

  return (
    <main className="page dashboard-page">
      <section className="welcome-band">
        <p className="eyebrow">Welcome</p>
        <h1>Welcome, {user.fullName}</h1>
        <p>Browse the campus menu, manage your cart, and keep your profile ready for pickup.</p>
        <div className="actions"><Link className="button primary" to="/menu">Explore menu</Link><Link className="button secondary" to="/cart">View cart</Link></div>
      </section>

      <section className="section-block">
        <div className="section-heading"><h2>Featured Items</h2><Link to="/menu">View all</Link></div>
        {loading ? <p className="status">Loading featured items...</p> : <div className="mini-grid">{featured.map((item) => <FoodTile key={item._id} item={item} />)}</div>}
      </section>

      <section className="section-block">
        <div className="section-heading"><h2>Popular Dishes</h2><Link to="/menu">Open menu</Link></div>
        {loading ? <p className="status">Loading popular dishes...</p> : <div className="mini-grid">{popular.map((item) => <FoodTile key={item._id} item={item} />)}</div>}
      </section>

      <section className="section-block">
        <div className="section-heading"><h2>Categories</h2></div>
        <div className="category-grid">{categories.map((category) => <Link key={category} to={`/menu?category=${encodeURIComponent(category)}`}>{category}</Link>)}</div>
      </section>

      <section className="quick-actions">
        <Link to="/menu">Menu</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/orders">Order History</Link>
        <Link to="/profile">Profile</Link>
      </section>
    </main>
  )
}

function FoodTile({ item }) {
  return (
    <article className="food-tile">
      <img src={item.imageUrl} alt={item.name} />
      <div><h3>{item.name}</h3><p>Rs. {item.price}</p></div>
    </article>
  )
}

export default Dashboard

```

## frontend/src/pages/Menu.jsx

```jsx
﻿import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useMenu } from '../context/MenuContext'

function Menu() {
  const [params, setParams] = useSearchParams()
  const initialCategory = params.get('category') || 'All'
  const [category, setCategory] = useState(initialCategory)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [cartError, setCartError] = useState('')
  const { items, loading, error, categories, fetchMenu } = useMenu()
  const { addToCart } = useCart()

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenu({ category, search })
      const nextParams = {}
      if (category !== 'All') nextParams.category = category
      if (search) nextParams.search = search
      setParams(nextParams, { replace: true })
    }, 250)

    return () => clearTimeout(timer)
  }, [category, search, fetchMenu, setParams])

  const handleAdd = async (item) => {
    setNotice('')
    setCartError('')

    try {
      await addToCart(item._id, 1)
      setNotice(`${item.name} added to cart.`)
    } catch (err) {
      setCartError(err.response?.data?.message || 'Could not add item to cart.')
    }
  }

  return (
    <main className="page">
      <div className="section-heading"><div><p className="eyebrow">Menu</p><h1>Campus Canteen Menu</h1></div></div>
      <div className="menu-tools">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by item name" aria-label="Search menu" />
        <div className="filter-row">{categories.map((item) => <button key={item} className={category === item ? 'active' : ''} type="button" onClick={() => setCategory(item)}>{item}</button>)}</div>
      </div>
      {notice && <p className="alert success">{notice}</p>}
      {cartError && <p className="alert error">{cartError}</p>}
      {error && <p className="alert error">{error}</p>}
      {loading ? <p className="status">Loading menu...</p> : items.length === 0 ? <EmptyState title="No menu items found" text="Try another search or category." /> : (
        <div className="menu-grid">{items.map((item) => <MenuCard key={item._id} item={item} onAdd={handleAdd} />)}</div>
      )}
    </main>
  )
}

function MenuCard({ item, onAdd }) {
  return (
    <article className="menu-card">
      <img src={item.imageUrl} alt={item.name} />
      <div className="menu-card-body">
        <div className="card-title-row"><h2>{item.name}</h2><span className={item.available ? 'badge ok' : 'badge off'}>{item.available ? 'Available' : 'Unavailable'}</span></div>
        <p>{item.description}</p>
        <div className="card-meta"><span>{item.category}</span><strong>Rs. {item.price}</strong></div>
        <button className="button primary full" type="button" disabled={!item.available} onClick={() => onAdd(item)}>Add To Cart</button>
      </div>
    </article>
  )
}

function EmptyState({ title, text }) {
  return <div className="surface center-copy"><h2>{title}</h2><p className="muted">{text}</p></div>
}

export default Menu

```

## frontend/src/pages/Cart.jsx

```jsx
﻿import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Cart() {
  const { cart, loading, error, updateQuantity, removeItem, clearCart } = useCart()
  const items = cart.items || []

  const changeQuantity = async (menuItemId, quantity) => {
    if (quantity < 1) return
    await updateQuantity(menuItemId, quantity)
  }

  return (
    <main className="page">
      <div className="toolbar"><div><p className="eyebrow">Cart</p><h1>Your Cart</h1></div>{items.length > 0 && <button className="button secondary" type="button" onClick={clearCart}>Clear cart</button>}</div>
      {error && <p className="alert error">{error}</p>}
      {loading ? <p className="status">Loading cart...</p> : items.length === 0 ? <EmptyCart /> : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((item) => <CartRow key={item.menuItem._id} item={item} onQuantity={changeQuantity} onRemove={removeItem} />)}
          </div>
          <aside className="cart-summary">
            <h2>Cart Total</h2>
            <div><span>Items</span><strong>{items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
            <div><span>Total</span><strong>Rs. {cart.total}</strong></div>
            <Link className="button primary full" to="/checkout">Proceed to checkout</Link>
          </aside>
        </div>
      )}
    </main>
  )
}

function CartRow({ item, onQuantity, onRemove }) {
  const menuItem = item.menuItem

  return (
    <article className="cart-row">
      <img src={menuItem.imageUrl} alt={menuItem.name} />
      <div>
        <h2>{menuItem.name}</h2>
        <p className="muted">Rs. {menuItem.price} each</p>
      </div>
      <div className="quantity-control">
        <button type="button" onClick={() => onQuantity(menuItem._id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
        <span>{item.quantity}</span>
        <button type="button" onClick={() => onQuantity(menuItem._id, item.quantity + 1)} disabled={item.quantity >= 6}>+</button>
      </div>
      <strong>Rs. {item.itemTotal}</strong>
      <button className="text-button danger" type="button" onClick={() => onRemove(menuItem._id)}>Remove</button>
    </article>
  )
}

function EmptyCart() {
  return (
    <div className="surface center-copy">
      <h2>Your cart is empty</h2>
      <p className="muted">Add dishes from the menu before checkout.</p>
      <div className="actions centered"><Link className="button primary" to="/menu">Browse menu</Link></div>
    </div>
  )
}

export default Cart

```

## frontend/src/pages/Checkout.jsx

```jsx
﻿import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useOrders } from '../context/OrderContext'

function Checkout() {
  const navigate = useNavigate()
  const { cart } = useCart()
  const { createOrder } = useOrders()
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const items = cart.items || []

  const handleConfirm = async () => {
    setSubmitting(true)
    setError('')
    try {
      const order = await createOrder()
      navigate(`/orders/${order._id}`, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place your order.')
      setConfirmed(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return <main className="page narrow"><div className="surface center-copy"><h1>Checkout</h1><p className="muted">Your cart is empty.</p><div className="actions centered"><Link className="button primary" to="/menu">Browse menu</Link></div></div></main>
  }

  return (
    <main className="page narrow">
      <div className="surface checkout-box">
        <div className="page-heading"><p className="eyebrow">Checkout</p><h1>Review your order</h1></div>
        <div className="checkout-items">
          {items.map((item) => <div key={item.menuItem._id}><span>{item.menuItem.name} x {item.quantity}</span><strong>Rs. {item.itemTotal}</strong></div>)}
        </div>
        <div className="payment-box"><span>Payment Method</span><strong>Pay At Pickup</strong></div>
        <div className="checkout-total"><span>Total Amount</span><strong>Rs. {cart.total}</strong></div>
        {error && <p className="alert error">{error}</p>}
        <button className="button primary full" type="button" onClick={() => setConfirmed(true)}>Confirm</button>
      </div>
      {confirmed && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>Place this order?</h2>
            <p className="muted">Your order will be sent to the canteen and paid for when you pick it up.</p>
            <div className="modal-actions">
              <button className="button secondary" type="button" disabled={submitting} onClick={() => setConfirmed(false)}>Cancel</button>
              <button className="button primary" type="button" disabled={submitting} onClick={handleConfirm}>{submitting ? 'Placing order...' : 'Place order'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Checkout


```

## frontend/src/pages/OrderHistory.jsx

```jsx
﻿import { Link } from 'react-router-dom'
import { useOrders } from '../context/OrderContext'

const formatDate = (value) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const statusClass = (status) => status === 'Ready To Pick Up' ? 'ready' : status === 'Preparing' ? 'preparing' : 'received'

function OrderHistory() {
  const { orders, loading, error, downloadInvoice } = useOrders()

  return (
    <main className="page">
      <div className="section-heading"><div><p className="eyebrow">Orders</p><h1>Order History</h1></div></div>
      {error && <p className="alert error">{error}</p>}
      {loading ? <p className="status">Loading orders...</p> : orders.length === 0 ? (
        <div className="surface center-copy order-empty"><h2>No orders yet</h2><p className="muted">Place an order from the menu and it will appear here.</p><div className="actions centered"><Link className="button primary" to="/menu">Browse menu</Link></div></div>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <article className="order-card" key={order._id}>
              <div className="order-card-head">
                <div><p className="eyebrow">{order.orderNumber}</p><h2>{formatDate(order.createdAt)}</h2></div>
                <span className={`status-badge ${statusClass(order.status)}`}>{order.status}</span>
              </div>
              <ul className="order-item-list">{order.items.map((item) => <li key={item.menuItem}><span>{item.name} x {item.quantity}</span><strong>Rs. {item.subtotal}</strong></li>)}</ul>
              <div className="order-card-foot"><strong>Total: Rs. {order.totalAmount}</strong><div className="actions"><button className="button secondary" type="button" onClick={() => downloadInvoice(order)}>Download Invoice</button><Link className="button secondary" to={`/orders/${order._id}`}>View order</Link></div></div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default OrderHistory


```

## frontend/src/pages/OrderDetails.jsx

```jsx
﻿import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const formatDate = (value) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value))
const statusClass = (status) => status === 'Ready To Pick Up' ? 'ready' : status === 'Preparing' ? 'preparing' : 'received'

function OrderDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).catch((err) => setError(err.response?.data?.message || 'Failed to load order.'))
  }, [id])

  const downloadInvoice = async () => {
    const { data } = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${order.orderNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  const backPath = user.role === 'admin' ? '/admin/orders' : '/orders'
  if (error) return <main className="page narrow"><p className="alert error">{error}</p><Link className="button secondary" to={backPath}>Back to orders</Link></main>
  if (!order) return <main className="page"><p className="status">Loading order...</p></main>

  const detailRows = [
    ['Name', order.user.fullName], ['Email', order.user.email], ['Role', order.user.role],
    ['UCID', order.user.ucid], ['Branch', order.user.branch], ['Class', order.user.className],
    ['Division', order.user.division], ['Designation', order.user.designation]
  ].filter(([, value]) => value)

  return (
    <main className="page narrow">
      <div className="surface order-detail">
        <div className="section-heading"><div><p className="eyebrow">{order.orderNumber}</p><h1>Order Details</h1></div><span className={`status-badge ${statusClass(order.status)}`}>{order.status}</span></div>
        <p className="muted">Placed {formatDate(order.createdAt)}</p>
        <section><h2>User Details</h2><dl className="detail-list">{detailRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
        <section><h2>Items</h2><div className="order-detail-items">{order.items.map((item) => <div key={item.menuItem}><span>{item.name}<small>Rs. {item.price} x {item.quantity}</small></span><strong>Rs. {item.subtotal}</strong></div>)}</div></section>
        <div className="checkout-total"><span>Total</span><strong>Rs. {order.totalAmount}</strong></div>
        <div className="payment-box"><span>Payment</span><strong>{order.paymentMethod}</strong></div>
        <div className="actions"><Link className="button secondary" to={backPath}>Back to orders</Link><button className="button primary" type="button" onClick={downloadInvoice}>Download Invoice</button></div>
      </div>
    </main>
  )
}

export default OrderDetails



```

## frontend/src/pages/Profile.jsx

```jsx
﻿import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user } = useAuth()
  const rows = [
    ['Full Name', user.fullName],
    ['Email', user.email],
    ['Role', user.role],
    ['Gender', user.gender],
    ['Branch', user.branch],
    ['Class', user.className],
    ['Division', user.division],
    ['Designation', user.designation],
  ].filter(([, value]) => value)

  return (
    <main className="page narrow">
      <div className="surface">
        <div className="profile-summary compact">
          <img className="avatar" src={user.profilePic || 'https://placehold.co/96x96?text=User'} alt="Profile" />
          <div><p className="eyebrow">Profile</p><h1>{user.fullName}</h1></div>
        </div>
        <dl className="detail-list">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <div className="actions"><Link className="button primary" to="/profile/edit">Edit profile</Link><Link className="button secondary" to="/dashboard">Dashboard</Link></div>
      </div>
    </main>
  )
}

export default Profile


```

## frontend/src/pages/EditProfile.jsx

```jsx
﻿import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const genders = ['Male', 'Female', 'Prefer not to say']
const branches = ['CSE', 'EXTC', 'COMS']
const divisions = ['A', 'B', 'C', 'D']
const classOptions = {
  CSE: ['1st Year BTech', '2nd Year BTech', '3rd Year BTech', '4th Year BTech', 'FYMCA', 'SYMCA', 'FYMTech', 'SYMTech'],
  EXTC: ['1st Year BTech', '2nd Year BTech', '3rd Year BTech', '4th Year BTech', 'FYMTech', 'SYMTech'],
  COMS: ['1st Year BTech', '2nd Year BTech', '3rd Year BTech', '4th Year BTech', 'FYMTech', 'SYMTech'],
}

function EditProfile() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ fullName: user.fullName || '', gender: user.gender || '', branch: user.branch || '', className: user.className || '', division: user.division || '', designation: user.designation || '' })
  const [profilePic, setProfilePic] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = new FormData()
      Object.entries(form).forEach(([key, value]) => payload.append(key, value))
      if (profilePic) payload.append('profilePic', profilePic)
      const { data } = await api.put('/auth/profile', payload)
      updateUser(data.user)
      navigate('/profile')
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page narrow">
      <div className="surface">
        <div className="page-heading"><p className="eyebrow">Profile</p><h1>Edit profile</h1></div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Full Name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></label>
          <label>Gender<select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value="">Select gender</option>{genders.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Branch<select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value, className: '' })}><option value="">Select branch</option>{branches.map((item) => <option key={item}>{item}</option>)}</select></label>
          {user.role === 'student' && <label>Class<select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })}><option value="">Select class</option>{(classOptions[form.branch] || []).map((item) => <option key={item}>{item}</option>)}</select></label>}
          {user.role === 'student' && <label>Division<select value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })}><option value="">Select division</option>{divisions.map((item) => <option key={item}>{item}</option>)}</select></label>}
          {user.role === 'faculty' && <label>Designation<input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></label>}
          <label>Profile Picture<input type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files?.[0] || null)} /></label>
          {error && <p className="alert error">{error}</p>}
          <button className="button primary full" disabled={loading}>{loading ? 'Saving...' : 'Save profile'}</button>
        </form>
      </div>
    </main>
  )
}

export default EditProfile


```

## frontend/src/pages/NotificationCenter.jsx

```jsx
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'

const formatTime = (value) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

function NotificationCenter() {
  const { user } = useAuth()
  const { notifications, unreadCount, loading, error, markRead, markAllRead, fetchNotifications } = useNotifications()
  const orderPath = (notification) => user?.role === 'admin' && notification.type === 'admin_new_order' ? '/admin/orders' : user?.role === 'admin' ? '/admin/orders' : '/orders'

  return (
    <main className="page narrow">
      <div className="section-heading">
        <div><p className="eyebrow">Updates</p><h1>Notification Center</h1></div>
        <div className="actions">
          <button className="button secondary" type="button" onClick={fetchNotifications}>Refresh</button>
          <button className="button primary" type="button" onClick={markAllRead} disabled={unreadCount === 0}>Mark all read</button>
        </div>
      </div>
      {error && <p className="alert error">{error}</p>}
      {loading && notifications.length === 0 ? <p className="status">Loading notifications...</p> : notifications.length === 0 ? (
        <div className="surface center-copy"><h2>No notifications yet</h2><p className="muted">Order updates will appear here.</p></div>
      ) : (
        <div className="notification-center-list">
          {notifications.map((notification) => (
            <article className={notification.read ? 'notification-center-item' : 'notification-center-item unread'} key={notification._id}>
              <div>
                <p className="eyebrow">{formatTime(notification.createdAt)}</p>
                <h2>{notification.title}</h2>
                <p>{notification.message}</p>
              </div>
              <div className="actions">
                {!notification.read && <button className="button secondary" type="button" onClick={() => markRead(notification._id)}>Mark read</button>}
                <Link className="button primary" to={orderPath(notification)}>View orders</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default NotificationCenter

```

## frontend/src/pages/AdminDashboard.jsx

```jsx
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import {
  CategoryDistributionChart,
  OrdersTrendChart,
  PopularItemsChart,
  RevenueTrendChart,
  StatusDistributionChart,
} from '../components/AdminAnalyticsCharts'

const cards = [
  ['Total Users', 'totalUsers', '/admin/users'], ['Students', 'totalStudents', '/admin/users?role=student'],
  ['Faculty', 'totalFaculty', '/admin/users?role=faculty'], ['Total Orders', 'totalOrders', '/admin/orders'],
  ['Received', 'receivedOrders', '/admin/orders'], ['Preparing', 'preparingOrders', '/admin/orders'],
  ['Ready', 'readyOrders', '/admin/orders'], ['Menu Items', 'menuItems', '/admin/menu'],
]

const analyticsCards = [
  ['Total Revenue', 'revenue', 'total'], ['Orders Today', 'orders', 'today'],
  ['Orders This Week', 'orders', 'week'], ['Orders This Month', 'orders', 'month'],
  ['Total Orders', 'orders', 'total'],
]

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(0)}`

function AdminDashboard() {
  const { stats, analytics, loading, error, fetchStats, fetchAnalytics } = useAdmin()
  useEffect(() => {
    fetchStats()
    fetchAnalytics()
  }, [fetchStats, fetchAnalytics])

  return (
    <main className="page">
      <div className="section-heading"><div><p className="eyebrow">Admin</p><h1>Dashboard</h1></div></div>
      {error && <p className="alert error">{error}</p>}
      {loading && !stats && !analytics ? <p className="status">Loading dashboard...</p> : (
        <>
          <div className="stats-grid">{cards.map(([label, key, to]) => <Link className="stat-card" to={to} key={key}><span>{label}</span><strong>{stats?.[key] ?? 0}</strong></Link>)}</div>

          <section className="analytics-section">
            <div className="section-heading"><div><p className="eyebrow">Analytics</p><h1>Performance</h1></div><button className="button secondary" type="button" onClick={fetchAnalytics}>Refresh</button></div>
            <div className="analytics-cards">
              {analyticsCards.map(([label, group, key]) => {
                const value = analytics?.[group]?.[key] ?? 0
                return <div className="stat-card analytics-card" key={`${group}-${key}`}><span>{label}</span><strong>{group === 'revenue' ? formatCurrency(value) : value}</strong></div>
              })}
            </div>
            <div className="analytics-grid">
              <RevenueTrendChart data={analytics?.revenueTrend} />
              <OrdersTrendChart data={analytics?.ordersTrend} />
              <CategoryDistributionChart data={analytics?.categoryDistribution} />
              <StatusDistributionChart data={analytics?.statusDistribution} />
              <PopularItemsChart data={analytics?.topItems} />
            </div>
            <section className="analytics-panel analytics-panel-wide top-customers-panel">
              <h2>Top Customers</h2>
              {!analytics?.topCustomers?.length ? <p className="muted">No customer data yet</p> : (
                <div className="data-table analytics-table">
                  <div className="table-row table-head"><span>User</span><span>Role</span><span>Orders</span><span>Total Spend</span></div>
                  {analytics.topCustomers.map((customer) => (
                    <div className="table-row" key={customer.userId}>
                      <span><strong>{customer.fullName}</strong><small>{customer.email}</small></span>
                      <span className="capitalize">{customer.role}</span>
                      <span>{customer.orders}</span>
                      <span>{formatCurrency(customer.totalSpend)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </section>
        </>
      )}
    </main>
  )
}

export default AdminDashboard

```

## frontend/src/pages/AdminOrders.jsx

```jsx
﻿import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import api from '../services/api'

const statuses = ['Received', 'Preparing', 'Ready To Pick Up']
const nextStatus = { Received: 'Preparing', Preparing: 'Ready To Pick Up' }
const formatDate = (value) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

const downloadInvoice = async (order) => {
  const { data } = await api.get(`/orders/${order._id}/invoice`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `invoice-${order.orderNumber}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

function AdminOrders() {
  const { orders, loading, error, fetchOrders, updateOrderStatus } = useAdmin()
  const [notice, setNotice] = useState('')
  useEffect(() => { fetchOrders() }, [fetchOrders])

  const advance = async (order) => {
    setNotice('')
    await updateOrderStatus(order._id, nextStatus[order.status])
    setNotice(`${order.orderNumber} moved to ${nextStatus[order.status]}.`)
  }

  return (
    <main className="page">
      <div className="section-heading"><div><p className="eyebrow">Operations</p><h1>Orders</h1></div><button className="button secondary" type="button" onClick={fetchOrders}>Refresh</button></div>
      {notice && <p className="alert success">{notice}</p>}{error && <p className="alert error">{error}</p>}
      {loading && orders.length === 0 ? <p className="status">Loading orders...</p> : (
        <div className="admin-order-board">
          {statuses.map((status) => {
            const group = orders.filter((order) => order.status === status)
            return <section className="order-column" key={status}><div className="column-heading"><h2>{status}</h2><span>{group.length}</span></div>{group.length === 0 ? <p className="muted">No orders</p> : group.map((order) => (
              <article className="admin-order-card" key={order._id}>
                <div><strong>{order.orderNumber}</strong><span>{formatDate(order.createdAt)}</span></div>
                <p>{order.user?.fullName} · {order.userRole}</p>
                <p>{order.items.length} item(s) · <strong>Rs. {order.totalAmount}</strong></p>
                <div className="actions"><Link className="button secondary" to={`/admin/orders/${order._id}`}>View</Link><button className="button secondary" type="button" onClick={() => downloadInvoice(order)}>Invoice</button>{nextStatus[status] && <button className="button primary" type="button" onClick={() => advance(order)}>Mark {nextStatus[status]}</button>}</div>
              </article>
            ))}</section>
          })}
        </div>
      )}
    </main>
  )
}

export default AdminOrders


```

## frontend/src/pages/AdminMenu.jsx

```jsx
﻿import { useEffect, useState } from 'react'
import { useAdmin } from '../context/AdminContext'

const emptyForm = { name: '', description: '', category: 'Veg', price: '', available: true, image: null }

function AdminMenu() {
  const { menuItems, loading, error, fetchMenu, saveMenuItem, deleteMenuItem } = useAdmin()
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => { fetchMenu() }, [fetchMenu])

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setFormError(''); setFormOpen(true) }
  const openEdit = (item) => {
    setEditingId(item._id)
    setForm({ name: item.name, description: item.description, category: item.category, price: item.price, available: item.available, image: null })
    setFormError('')
    setFormOpen(true)
  }

  const submit = async (event) => {
    event.preventDefault()
    setFormError('')
    setNotice('')
    if (!editingId && !form.image) return setFormError('Choose an image for the dish.')
    const body = new FormData()
    body.append('name', form.name)
    body.append('description', form.description)
    body.append('category', form.category)
    body.append('price', form.price)
    body.append('available', String(form.available))
    if (form.image) body.append('image', form.image)
    try {
      await saveMenuItem(editingId, body)
      setNotice(editingId ? 'Dish updated.' : 'Dish created.')
      setFormOpen(false)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not save dish.')
    }
  }

  const toggleAvailability = async (item) => {
    const body = new FormData()
    body.append('available', String(!item.available))
    await saveMenuItem(item._id, body)
  }

  const remove = async (item) => {
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return
    await deleteMenuItem(item._id)
    setNotice('Dish deleted.')
  }

  return (
    <main className="page">
      <div className="section-heading"><div><p className="eyebrow">Catalog</p><h1>Menu Management</h1></div><button className="button primary" type="button" onClick={openCreate}>Add dish</button></div>
      {notice && <p className="alert success">{notice}</p>}{error && <p className="alert error">{error}</p>}
      {loading && menuItems.length === 0 ? <p className="status">Loading menu...</p> : <div className="admin-menu-grid">{menuItems.map((item) => <article className="admin-menu-card" key={item._id}><img src={item.imageUrl} alt={item.name} /><div className="admin-menu-body"><div className="card-title-row"><h2>{item.name}</h2><span className={`status-badge ${item.available ? 'ready' : 'disabled'}`}>{item.available ? 'Available' : 'Unavailable'}</span></div><p className="muted">{item.description}</p><div className="card-meta"><span>{item.category}</span><strong>Rs. {item.price}</strong></div><div className="row-actions"><button className="button secondary" type="button" onClick={() => openEdit(item)}>Edit</button><button className="button secondary" type="button" onClick={() => toggleAvailability(item)}>{item.available ? 'Mark unavailable' : 'Mark available'}</button><button className="button danger-button" type="button" onClick={() => remove(item)}>Delete</button></div></div></article>)}</div>}
      {formOpen && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card menu-form-modal"><div className="section-heading"><div><p className="eyebrow">{editingId ? 'Edit dish' : 'New dish'}</p><h2>{editingId ? form.name : 'Add menu item'}</h2></div></div><form className="form-grid" onSubmit={submit}><label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label><label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label><div className="two-column-form"><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{['Veg', 'Non Veg', 'Snacks', 'Drinks'].map((category) => <option key={category}>{category}</option>)}</select></label><label>Price<input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></label></div><label>Dish image<input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] || null })} required={!editingId} /></label><label className="check-row"><input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} /> Available for ordering</label>{formError && <p className="alert error">{formError}</p>}<div className="modal-actions"><button className="button secondary" type="button" onClick={() => setFormOpen(false)}>Cancel</button><button className="button primary" disabled={loading}>{loading ? 'Saving...' : 'Save dish'}</button></div></form></div></div>}
    </main>
  )
}

export default AdminMenu


```

## frontend/src/pages/AdminUsers.jsx

```jsx
﻿import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'

function AdminUsers() {
  const [params] = useSearchParams()
  const [role, setRole] = useState(params.get('role') || '')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const { users, loading, error, fetchUsers, toggleUser } = useAdmin()

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers({ role: role || undefined, search: search || undefined }), 250)
    return () => clearTimeout(timer)
  }, [role, search, fetchUsers])

  const toggle = async (user) => {
    const updated = await toggleUser(user._id)
    if (selected?._id === updated._id) setSelected(updated)
  }

  return (
    <main className="page">
      <div className="section-heading"><div><p className="eyebrow">Accounts</p><h1>User Management</h1></div></div>
      <div className="admin-tools"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, or UCID" /><div className="filter-row">{[['', 'All'], ['student', 'Students'], ['faculty', 'Faculty']].map(([value, label]) => <button className={role === value ? 'active' : ''} key={label} onClick={() => setRole(value)} type="button">{label}</button>)}</div></div>
      {error && <p className="alert error">{error}</p>}
      {loading && users.length === 0 ? <p className="status">Loading users...</p> : <div className="data-table users-table"><div className="table-row table-head"><span>User</span><span>Role</span><span>Branch</span><span>Status</span><span>Actions</span></div>{users.map((user) => <div className="table-row" key={user._id}><span><strong>{user.fullName}</strong><small>{user.email}</small></span><span className="capitalize">{user.role}</span><span>{user.branch || '-'}</span><span className={`status-badge ${user.isActive !== false ? 'ready' : 'disabled'}`}>{user.isActive !== false ? 'Active' : 'Disabled'}</span><span className="row-actions"><button className="button secondary" onClick={() => setSelected(user)} type="button">View</button><button className={`button ${user.isActive !== false ? 'danger-button' : 'primary'}`} onClick={() => toggle(user)} type="button">{user.isActive !== false ? 'Disable' : 'Enable'}</button></span></div>)}</div>}
      {selected && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card user-modal"><div className="profile-summary compact"><img className="avatar" src={selected.profilePic || 'https://placehold.co/96x96?text=User'} alt="Profile" /><div><p className="eyebrow">{selected.role}</p><h2>{selected.fullName}</h2><p className="muted">{selected.email}</p></div></div><dl className="detail-list">{[['UCID', selected.ucid], ['Gender', selected.gender], ['Branch', selected.branch], ['Class', selected.className], ['Division', selected.division], ['Designation', selected.designation]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="modal-actions"><button className="button secondary" onClick={() => setSelected(null)} type="button">Close</button><button className={`button ${selected.isActive !== false ? 'danger-button' : 'primary'}`} onClick={() => toggle(selected)} type="button">{selected.isActive !== false ? 'Disable user' : 'Enable user'}</button></div></div></div>}
    </main>
  )
}

export default AdminUsers



```

## frontend/src/pages/PlaceholderPage.jsx

```jsx
﻿function PlaceholderPage({ title }) {
  return (
    <main className="page narrow">
      <div className="surface center-copy">
        <p className="eyebrow">Protected</p>
        <h1>{title}</h1>
        <p className="muted">This route is protected for Phase 2. Feature implementation is reserved for a later module.</p>
      </div>
    </main>
  )
}

export default PlaceholderPage


```
