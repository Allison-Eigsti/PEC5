# Reworn

A minimal fullstack secondhand clothing marketplace built with React, Tailwind CSS, Express, MongoDB/Mongoose, JWT authentication, and Cloudinary.

## Project structure

```text
PEC5/
├── backend/   Express API and Mongoose models
├── frontend/  Vite React application
└── README.md
```

## Features

- Public browsing with search and filters
- User registration and login
- HTTP-only JWT session cookie
- Users can create, edit, mark sold, and hide only their own listings
- Listings can contain 1–5 Cloudinary-hosted images
- Hidden listings are soft-deleted and remain available in My listings
- Hidden listings retain their images so they can be restored; replaced images are cleaned up
- Responsive Tailwind interface with React Router navigation

## Local setup

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The API defaults to `http://localhost:4000`.

Set `MONGODB_URI` to the complete MongoDB Atlas connection string. Set the three Cloudinary values in `backend/.env` before testing image uploads.

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The Vite app defaults to `http://localhost:5173`.

## Environment files

Real environment files are ignored by Git. The committed templates are:

- `backend/.env.example`
- `frontend/.env.example`

Never put MongoDB, JWT, or Cloudinary secrets in a `VITE_*` variable. Vite exposes `VITE_*` values to the browser.

## API routes

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Listings

- `GET /api/listings`
- `GET /api/listings/mine` (authenticated)
- `GET /api/listings/:id`
- `POST /api/listings` (authenticated, multipart)
- `PATCH /api/listings/:id` (owner only)
- `DELETE /api/listings/:id` (owner only; sets status to `hidden`)

Listing create and update requests use `multipart/form-data` with the field name `images`. Each request is limited to five images and approximately 4 MB total to remain within Vercel's function request limit.

## Vercel deployment

Create two Vercel projects from this repository:

| Project | Root directory | Custom domain |
|---|---|---|
| Backend | `backend` | `api.example.com` |
| Frontend | `frontend` | `shop.example.com` |

### Backend Vercel variables

Set these in the backend Vercel project:

```env
NODE_ENV=production
MONGODB_URI=...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
# Cloudinary credentials
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
CLOUDINARY_TIMEOUT_MS=20000
CLIENT_ORIGIN=https://shop.example.com
COOKIE_SAME_SITE=lax
MAX_IMAGE_BYTES=786432
MAX_REQUEST_BYTES=4000000
```

The Cloudinary folder is fixed to `secondhand-listings` in the backend and no longer requires an environment variable.

Vercel's Express support recognizes the backend `index.js` entry. The API is stateless; Multer uses memory storage and MongoDB connections are cached between warm invocations.

### Frontend Vercel variables

Set this in the frontend Vercel project:

```env
VITE_API_URL=https://api.example.com
```

Use the API origin only; the frontend adds `/api` itself. The variable name is case-sensitive and must begin with `VITE_`. After changing a Vite variable in Vercel, redeploy the frontend so the new build receives it.

`frontend/vercel.json` rewrites client-side routes to `index.html` so direct visits to routes such as `/my-listings` work.

Before testing the deployed frontend, open the backend health endpoint directly:

```text
https://api.example.com/api/health
```

It should return JSON containing `{"status":"ok"}`. Then open `/api/listings`; it should return an object with an `items` array. If either URL returns HTML, check the Vercel project root directory (`backend`) and `VITE_API_URL`.

### Custom domains and cookies

Point the two subdomains to the Vercel projects using the DNS records Vercel displays in each project's **Settings → Domains** section. Using subdomains of one parent domain keeps the frontend and API same-site, allowing the API to use:

```text
HttpOnly
Secure
SameSite=Lax
```

The frontend sends `credentials: include` on API requests. The API allows the exact `CLIENT_ORIGIN` and does not use wildcard CORS with credentials.

## Useful commands

```bash
# Backend
cd backend
npm run dev
npm test
node --check index.js

# Frontend
cd frontend
npm run dev
npm run lint
npm run build
```
