# AutoEase - Car Rental Platform

AutoEase is a full-stack car rental app built with Node.js, Express, MongoDB (Mongoose), EJS, and Socket.IO. It supports email+OTP signup, JWT sessions, optional Google OAuth, car inventory management, bookings with date-overlap validation, and a simple admin dashboard.

## Features
- Email+OTP signup and JWT login; optional Google OAuth when credentials exist
- Role-based access (admin, user) enforced via middleware
- Car catalogue with pricing and image fallback placeholder
- Booking flow with server-side overlap checks; users can view/cancel their own bookings
- Admin tools to add, edit, and delete cars and view all bookings
- Socket.IO hooks for real-time booking events

## Tech Stack
- Backend: Express 5, MongoDB with Mongoose
- Auth: JWT, bcryptjs, express-session, Passport (Google)
- Views: EJS templates, static assets in public/
- Realtime: Socket.IO
- Dev: nodemon

## Quick Start
1) Prereqs: Node 18+ and access to a MongoDB instance (local or Atlas).
2) Install dependencies:
```powershell
npm install
```
3) Create .env in the repo root:
```env
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
PORT=5000
GOOGLE_CLIENT_ID=optional_google_client_id
GOOGLE_CLIENT_SECRET=optional_google_client_secret
```
4) Run the app:
```powershell
npm run dev   # nodemon
# or
npm start     # node server.js
```
Server listens on PORT (default 5000).

## Seeding Cars
Populate a small catalogue with a reliable placeholder image:
```powershell
node seedCars.js
```

## Scripts
- `npm run dev` – start with nodemon (auto-reload)
- `npm start` – start with node

## Folder Structure (what lives where)
```
server.js               Express app entry, Mongo connection, Socket.IO
package.json            Scripts and dependencies
Routes/
	authRoutes.js         Email+OTP signup/verify/resend, JWT login, Google OAuth
	userRoutes.js         Basic register endpoint (mounted at /users)
	carRoutes.js          CRUD for cars (admin-only writes)
	bookingRoutes.js      Create/cancel/list bookings with overlap checks
	viewRoutes.js         EJS page routes
models/
	User.js               Fields: name, email, password (hashed), role, emailVerified, otp, googleId
	Car.js                Fields: model, type, pricePerDay, availability, imageUrl (placeholder default)
	Booking.js            Fields: userId, carId, startDate, endDate, status, locations, distance
middleware/
	auth.js               JWT verification and role guard
	passport.js           Google strategy (enabled when env vars are present)
services/
	emailService.js       OTP generation and delivery helper
public/                 CSS and client JS (auth helpers, page interactions)
views/                  EJS templates (index, cars, bookings, admin, login, signup, editCar, verify-otp, layout)
seedCars.js             Seeds ~21 cars with placeholder images
```

## API and Pages
- Auth (mounted at /auth): signup (OTP), verify-otp, resend-otp, login, Google OAuth callback in [Routes/authRoutes.js](Routes/authRoutes.js)
- Users (mounted at /users): register in [Routes/userRoutes.js](Routes/userRoutes.js)
- Cars (mounted at /api/cars): list (public), create/update/delete (admin) in [Routes/carRoutes.js](Routes/carRoutes.js)
- Bookings (mounted at /api/bookings): create, cancel, my-bookings, admin all-bookings in [Routes/bookingRoutes.js](Routes/bookingRoutes.js)
- Views (mounted at /): index, cars, bookings, admin, login, signup, verify-otp, edit-car in [Routes/viewRoutes.js](Routes/viewRoutes.js)

## Auth Flow
- Email signup: `POST /auth/signup` stores user with OTP -> `POST /auth/verify-otp` finalizes and returns JWT.
- Resend OTP: `POST /auth/resend-otp` for unverified users.
- Login: `POST /auth/login` returns JWT; JWT goes in `Authorization: Bearer <token>` for protected calls.
- Google OAuth: works only when GOOGLE_CLIENT_ID/SECRET are set; otherwise endpoints return a friendly message.
- Role guard: pass roles to middleware/auth.js (admin-only for car writes and booking list-all).

## Realtime Hooks
Socket.IO is initialized in [server.js](server.js); routes emit `booking:created` and `booking:cancelled` events when io is available via `app.locals.io`.

## Images
When no image is provided or loading fails, cars fall back to https://placehold.co/600x360?text=Car+Image (used in models and seeder; frontend also guards with onerror).

## Troubleshooting
- Connection errors: confirm MONGO_URI and network access (Atlas IP allowlist, etc.).
- Invalid token: ensure JWT_SECRET in .env matches the running process.
- Google OAuth: set GOOGLE_CLIENT_ID/SECRET and restart; otherwise endpoints will respond with a 503 message.
- Static assets missing: public/ must remain mounted; check references in views.

## Additional Docs
- SETUP_GUIDE.md – environment and installation details
- IMPLEMENTATION_GUIDE.md – implementation notes
- TESTING_GUIDE.md / QUICK_TEST.md – lightweight test guidance

## Security & Secrets
- Use `.env.example` as a template and keep your real `.env` untracked (see `.gitignore`).
- If a secret is ever committed, GitHub Push Protection will block the push. Purge the secret from history using `git filter-repo` or BFG, then rotate the credential.
- Example to remove `.env` from history (requires git-filter-repo):
	- `git filter-repo --path .env --invert-paths`
	- `git push --force`

## License
ISC (see package.json).
