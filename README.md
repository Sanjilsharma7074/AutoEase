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

2. Create a `.env` file in the project root with:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=your-very-secret-key
PORT=5000
```

3. Run the app

```bash
npm run dev   # with nodemon
# or
npm start     # plain node
```

Server runs on `http://localhost:5000` by default.

## 🌐 Pages (EJS Views)

- `/` — Home
- `/login` — Login
- `/signup` — Signup
- `/cars` — Browse cars and book
- `/bookings` — My bookings (requires login)
- `/admin` — Admin dashboard (requires admin)
- `/edit-car?id=<carId>` — Edit car (admin)
- `/users` — User management (admin)

## 🔒 Authentication

- Login returns a JWT and basic user info `{ id, name, role }`.
- Client stores token in `localStorage` and sends `Authorization: Bearer <token>`.
- Middleware `auth(roles)` verifies token and optionally enforces roles.

## 🛣️ API Reference

Base: `http://localhost:5000`

### Auth (`/auth`)

- `POST /auth/signup` — Register user `{ name, email, password, role? }`
- `POST /auth/login` — Login `{ email, password }` → `{ token, user }`

### Users (`/api/users`)

- `POST /api/users/register` — Create user (server-side path)
- `GET /api/users/all` — List users (admin)
- `PUT /api/users/:userId/role` — Update role to `admin|user` (admin)

### Cars (`/api/cars`)

- `GET /api/cars` — List cars
- `POST /api/cars` — Add car (admin)
- `PUT /api/cars/:carId` — Update car (admin)
- `DELETE /api/cars/:id` — Delete car (admin)

### Bookings (`/api/bookings`)

- `POST /api/bookings` — Create booking (auth) — checks date overlap
- `PUT /api/bookings/cancel/:bookingId` — Cancel booking (owner/admin)
- `GET /api/bookings/my-bookings` — Current user's bookings (auth)
- `GET /api/bookings/all` — All bookings (admin)

## 📌 Notes

- Booking overlap is validated on the server (`bookingRoutes.js`).
- Car availability on the list view is optimistic; the booking endpoint is authoritative.
- Passwords are hashed via a Mongoose pre-save hook; tokens expire in 1 hour.

## 🧪 Sample Admin Flow

1. Sign up a user via `/auth/signup` with role `admin` (or update via DB).
2. Login at `/login` to get a JWT stored in the browser.
3. Access `/admin` to manage cars and view bookings.

## 🛠️ Troubleshooting

- Ensure MongoDB connection string is valid and IP is whitelisted.
- If JWT errors occur, confirm `JWT_SECRET` matches between login and middleware.
- If static assets don’t load, verify `public/` is served and paths are correct.

## 📄 License

MIT
