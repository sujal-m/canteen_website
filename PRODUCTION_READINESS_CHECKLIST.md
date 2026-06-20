# Production Readiness Checklist

- Backend health endpoint works in production.
- Frontend uses the production backend API URL.
- MongoDB Atlas connection string is set.
- JWT secret is strong and unique.
- Cloudinary credentials are set if uploads are enabled.
- SMTP credentials are set if email notifications are enabled.
- Rate limiting is active.
- Helmet is active.
- Logs are enabled through Morgan.
- 404 and global error handlers are active.
- Graceful shutdown handles termination signals.
- Database indexes are present for the main query paths.