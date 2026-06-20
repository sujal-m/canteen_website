# Campus Canteen System

Full-stack MERN campus canteen platform for students, faculty, and admins. The application covers authentication, menu browsing, cart and checkout, order tracking, notifications, email workflows, PDF invoices, and admin analytics.

## Features

- Student and faculty authentication
- Email verification, forgot password, and reset password
- Profile management
- Menu search, filters, and item availability
- Cart and checkout flow
- Order history and live order status
- Admin dashboard for menu CRUD, user management, and order management
- Notifications and email notifications
- Dynamic PDF invoices
- Analytics dashboard

## Architecture

- Backend: Express, MongoDB, Mongoose
- Frontend: React, Vite, Axios
- Storage: MongoDB Atlas, Cloudinary for images, SMTP for mail, PDFKit for invoices

## Screenshots Placeholder

Add screenshots to a folder such as `docs/screenshots/` and reference them here when available.

## Tech Stack

- Node.js
- Express
- MongoDB / Mongoose
- React
- Vite
- Cloudinary
- Nodemailer
- PDFKit

## Installation

1. Clone the repository.
2. Install backend dependencies:
   - `cd backend`
   - `npm install`
3. Install frontend dependencies:
   - `cd ../frontend`
   - `npm install`
4. Copy the example environment files:
   - `backend/.env.example` to `backend/.env`
   - `frontend/.env.example` to `frontend/.env`

## Environment Variables

Backend variables are documented in `backend/.env.example`.

Frontend variables are documented in `frontend/.env.example`.

## Running Locally

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Deployment

See `DEPLOYMENT.md` for the exact Render, Vercel, and MongoDB Atlas deployment steps.

## API Overview

- `/api/auth` - authentication, verification, password recovery, profile
- `/api/menu` - menu browsing and item management
- `/api/cart` - cart operations
- `/api/orders` - order creation, tracking, and history
- `/api/admin` - admin analytics, users, menu, and order management
- `/api/notifications` - notification feeds and read status

## Database Seeding

Seed menu items from the backend:

```bash
cd backend
npm run seed:menu
```

## Admin Setup

1. Create or register an admin user directly in MongoDB or through the existing admin setup flow.
2. Set the `role` field to `admin`.
3. Confirm the account is active and verified if your workflow requires it.
4. Log in from the frontend and open the admin dashboard.

## Testing Notes

Use the checklist documents in the repository root for manual verification and production readiness.