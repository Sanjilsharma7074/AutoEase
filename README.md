# AutoEase - Car Rental Service

A full-stack car rental web application built with Node.js, Express, MongoDB (Mongoose), and EJS. It supports user authentication, car management, bookings, and an admin dashboard.

## 🚀 Features

- User signup/login with JWT authentication
- Role-based access control (admin, user)
- Browse cars with images and pricing
- Book cars with date conflict validation
- View/cancel bookings (users)
- Admin dashboard: manage cars (add/edit/delete) and view all bookings
- Admin user management page to view and update roles
- Responsive, modern UI with EJS templates and CSS

## 🧰 Tech Stack

- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Auth: JWT, bcryptjs
- Views: EJS templates
- Frontend: HTML, CSS, Vanilla JS

## 📁 Folder Structure

```
carRental/
├── server.js                 # App entry: Express, routes, DB
├── package.json              # Scripts and dependencies
├── .env                      # Environment variables (not committed)
├── Routes/
│   ├── authRoutes.js         # /auth/signup, /auth/login
│   ├── userRoutes.js         # /api/users (register, list, role update)
│   ├── carRoutes.js          # /api/cars (CRUD)
│   ├── bookingRoutes.js      # /api/bookings (book, cancel, list)
│   └── viewRoutes.js         # Renders EJS pages
├── models/
│   ├── User.js               # name, email, password (hashed), role
│   ├── Car.js                # model, type, pricePerDay, imageUrl, availability
│   └── Booking.js            # userId, carId, dates, status
├── middleware/
│   └── auth.js               # JWT verify + role guard
├── views/                    # EJS templates (UI)
│   ├── index.ejs, cars.ejs, admin.ejs, bookings.ejs
│   ├── login.ejs, signup.ejs, layout.ejs, editCar.ejs, users.ejs
├── public/
│   ├── css/style.css         # Styles
│   └── js/
│       ├── auth.js           # Client-side auth helpers
│       └── main.js           # Page interactions
```

## ⚙️ Setup

1. Install dependencies

```bash
npm install
```

# AutoEase - Car Rental Service

AutoEase is a full-stack car rental web application built with Node.js, Express, MongoDB (Mongoose), EJS, and Socket.IO. It provides user authentication, car listing and management, booking functionality, and an admin dashboard.

**Status:** README updated to reflect current routes, scripts, and license.

## 🚀 Features

- User signup/login with JWT authentication
- Role-based access control (admin, user)
- Browse cars with images and pricing
- Create bookings with server-side date-overlap validation
- Users can view and cancel their bookings
- Admin dashboard: manage cars and view all bookings
- Real-time events support via Socket.IO (server exposes `app.locals.io`)

## 🧰 Tech Stack

- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Auth: JSON Web Tokens (`jsonwebtoken`), password hashing (`bcryptjs`)
- Views: EJS templates
- Real-time: Socket.IO
- Dev: `nodemon` for development

## Prerequisites

- Node.js (v14+ recommended)
- npm
- A running MongoDB instance or Atlas cluster

## Installation

Clone the repo and install dependencies:

```powershell
git clone <repo-url>
cd carRental
npm install
```

Create a `.env` file in the project root with the following variables:

```env
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Scripts

- `npm start` — Run with Node (`node server.js`)
- `npm run dev` — Run with `nodemon` (auto-restart during development)

Example (PowerShell):

```powershell
npm run dev
# or
npm start
```

By default the server listens on `PORT` from `.env` or `5000`.

## Project Structure

```
carRental/
├─ server.js                # App entry (Express + Socket.IO)
├─ package.json
├─ .env                    # Environment variables (not committed)
├─ Routes/
│  ├─ authRoutes.js        # Mounted at /auth
│  ├─ userRoutes.js        # Mounted at /users
│  ├─ carRoutes.js         # Mounted at /api/cars
│  ├─ bookingRoutes.js     # Mounted at /api/bookings
│  └─ viewRoutes.js        # Root view routes (pages)
├─ models/                 # Mongoose models: User, Car, Booking
├─ middleware/             # auth middleware (JWT + role guard)
├─ views/                  # EJS templates (index, cars, admin, bookings, login, signup, editCar, etc.)
├─ public/                 # Static assets (css, js, images)
└─ services/               # (optional) helper services
```

## Routes & Views (summary)

Base URL: `http://localhost:<PORT>`

- Views (rendered pages)

  - `/` — Home (cars list)
  - `/login` — Login page
  - `/signup` — Signup page
  - `/cars` — Browse cars and book
  - `/bookings` — User bookings (requires login)
  - `/admin` — Admin dashboard (requires admin)
  - `/edit-car?id=<carId>` — Edit car (admin)

- API endpoints (server-side)
  - Auth: `POST /auth/signup`, `POST /auth/login`
  - Users: routes are mounted at `/users` (check `Routes/userRoutes.js` for endpoints)
  - Cars: mounted at `/api/cars` (GET, POST, PUT, DELETE as implemented)
  - Bookings: mounted at `/api/bookings` (create, cancel, list)

Note: `userRoutes` is mounted at `/users` (not `/api/users`) in the current code.

## Authentication

- Login returns a JWT token and user info.
- Client stores the token (e.g., `localStorage`) and sends it in the `Authorization: Bearer <token>` header for protected API calls.
- Server-side middleware (`middleware/auth.js`) verifies tokens and enforces role-based access.

## Socket.IO

The app initializes Socket.IO in `server.js` and attaches the instance to `app.locals.io`, which routes/controllers can use to emit real-time events (e.g., booking notifications).

## Environment & Common Issues

- Ensure `MONGO_URI` is valid and allows connections from your machine.
- Verify `JWT_SECRET` is set and consistent between environment and any running processes.
- If static files do not load, confirm `public/` is served and asset paths in EJS are correct.

## Contributing

If you'd like to contribute, open an issue or submit a PR with clear description and tests where possible.

## License

This project uses the `ISC` license (see `package.json`).

---

If you want, I can also:

- add sample curl requests for the main endpoints
- add a short developer checklist for creating admin users or seeding data
- run a quick search in the repo to list all exported endpoints and include them verbatim in the README
