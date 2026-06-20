# Manual Testing Checklist

## Backend

- Confirm `GET /` returns the API health response.
- Confirm unknown routes return a 404 JSON response.
- Confirm invalid JWT tokens return a 401 JSON response.
- Confirm duplicate user registration returns a duplicate key error response.
- Confirm validation failures return a 400 response with field messages.

## Frontend

- Confirm the app loads on mobile and desktop.
- Confirm navigation works across protected routes.
- Confirm cart, checkout, and order history flows work end to end.
- Confirm admin pages load only for admin users.

## Data

- Confirm MongoDB collections are created.
- Confirm order and notification documents are indexed as expected.
- Confirm seeded menu data appears after running the seed script.