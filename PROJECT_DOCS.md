# Project Overview

Campus canteen ordering platform for students, faculty, and administrators.

# Features

Student Features
Faculty Features
Admin Features
Notification System
Email System
Invoice System
Analytics Dashboard
Security Features

# Folder Tree

campus-canteen-system/
backend/
config/
controllers/
middleware/
models/
routes/
seeds/
utils/
server.js
package.json
.env.example
frontend/
public/
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

# Backend API

GET /
POST /api/auth/register/student
POST /api/auth/register/faculty
GET /api/auth/verify-email/:token
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password/:token
GET /api/auth/profile
PUT /api/auth/profile
GET /api/menu
GET /api/menu/:id
GET /api/cart
POST /api/cart/add
PUT /api/cart/update
DELETE /api/cart/remove/:itemId
DELETE /api/cart/clear
POST /api/orders
GET /api/orders
GET /api/orders/:id
GET /api/orders/:id/invoice
GET /api/admin/dashboard
GET /api/admin/analytics
GET /api/admin/orders
PUT /api/admin/orders/:id/status
GET /api/admin/users
PUT /api/admin/users/:id/toggle
GET /api/admin/menu
POST /api/admin/menu
PUT /api/admin/menu/:id
DELETE /api/admin/menu/:id
GET /api/notifications
PUT /api/notifications/:id/read
PUT /api/notifications/read-all

# Frontend Routes

/
/register
/login
/verify-email/:token
/forgot-password
/reset-password/:token
/dashboard
/menu
/cart
/checkout
/orders
/orders/:id
/profile
/profile/edit
/notifications
/admin
/admin/dashboard
/admin/orders
/admin/orders/:id
/admin/menu
/admin/users
/admin/notifications

# Database Models

User
Fields: role, fullName, ucid, email, password, gender, branch, className, division, designation, profilePic, profilePicPublicId, isVerified, isActive, emailVerificationToken, emailVerificationExpires, passwordResetToken, passwordResetExpires

MenuItem
Fields: name, description, category, price, imageUrl, available

Cart
Fields: user, items.menuItem, items.quantity

Order
Fields: user, userRole, orderNumber, items.menuItem, items.name, items.price, items.quantity, items.subtotal, totalAmount, paymentMethod, status

Notification
Fields: user, title, message, type, read

# Context Providers

AuthContext
CartContext
MenuContext
OrderContext
AdminContext
NotificationContext

# Dependencies

Backend
bcryptjs
cloudinary
cors
dotenv
express
express-rate-limit
helmet
jsonwebtoken
mongoose
morgan
multer
nodemailer
pdfkit
nodemon

Frontend
axios
react
react-dom
react-router-dom
recharts
@eslint/js
@types/react
@types/react-dom
@vitejs/plugin-react
eslint
eslint-plugin-react-hooks
eslint-plugin-react-refresh
globals
vite

# Environment Variables

Use ONLY .env.example

Backend .env.example
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/campus-canteen
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Campus Canteen <no-reply@campus-canteen.local>"

Frontend .env.example
VITE_API_URL=http://localhost:5000/api

# Deployment

MongoDB Atlas
Cloudinary
SMTP
Render
Vercel

# End of Documentation