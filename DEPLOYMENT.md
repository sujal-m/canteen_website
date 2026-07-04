# Deployment Guide

## Backend on Render

1. Push the repository to GitHub.
2. Create a new Render Web Service from the backend folder.
3. Set the build command to `npm install`.
4. Set the start command to `npm start`.
5. Add environment variables from `backend/.env.example`.
6. Set `NODE_ENV=production`.
7. Set `CLIENT_URL` to the deployed frontend URL.
8. Deploy and confirm `/` returns the API health response.

## Frontend on Vercel

1. Create a new Vercel project from the frontend folder.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist`.
4. Add `VITE_API_URL` pointing to the Render backend API, for example `https://your-backend.onrender.com/api`.
5. Deploy and verify the app loads correctly in production.

## MongoDB Atlas

1. Create an Atlas cluster.
2. Add a database user.
3. Allow network access for your deployment environment.
4. Copy the connection string into `MONGO_URI`.
5. Confirm the backend can connect and create collections.

## Production Checklist

- Confirm the backend starts cleanly with production environment variables.
- Confirm CORS allows the deployed frontend origin only.
- Confirm Cloudinary credentials are set if image uploads are used.
- Confirm `BREVO_API_KEY` and `EMAIL_FROM` are set if email notifications are used.
- Confirm the frontend points to the deployed backend URL.
- Confirm the admin dashboard can authenticate and load data.