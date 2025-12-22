require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("./middleware/passport");

const app = express();

// Set up EJS
app.set("view engine", "ejs");
app.set("views", "./views");

// Serve static files
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration for Passport
// Trust reverse proxy headers (required for secure cookies on Render/Heroku/etc.)
app.set("trust proxy", 1);
const isProd =
  process.env.NODE_ENV === "production" || !!process.env.RENDER_EXTERNAL_URL;

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // Use secure cookies when deployed behind HTTPS
      secure: !!isProd,
      httpOnly: true,
      // Lax is sufficient for top-level OAuth redirects
      sameSite: "lax",
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

//importing all routers
const userRoutes = require("./Routes/userRoutes");
const carRoutes = require("./Routes/carRoutes");
const bookingRoutes = require("./Routes/bookingRoutes");

const authRoutes = require("./Routes/authRoutes");
const viewRoutes = require("./Routes/viewRoutes");

app.use("/", viewRoutes);
app.use("/auth", authRoutes);

app.use("/users", userRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000, // Wait 30 seconds before timing out
    socketTimeoutMS: 45000, // 45 second timeout for socket operations
    connectTimeoutMS: 30000, // 30 seconds to connect
    retryWrites: true,
    maxPoolSize: 10,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
const http = require("http");
const { Server } = require("socket.io");

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);

// Set server timeout to 60 seconds for long-running operations (like email sending)
server.timeout = 60000; // 60 seconds
server.keepAliveTimeout = 65000; // 65 seconds (should be higher than timeout)
server.headersTimeout = 66000; // 66 seconds (should be higher than keepAliveTimeout)

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Make io available in routes via app.locals
app.locals.io = io;

io.on("connection", (socket) => {
  console.log("New WebSocket client connected: ", socket.id);

  socket.on("disconnect", () => {
    console.log("WebSocket client disconnected: ", socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on PORT : ${PORT}`);
});
