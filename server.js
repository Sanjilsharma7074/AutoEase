const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Set up EJS
app.set("view engine", "ejs");
app.set("views", "./views");

// Serve static files
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
const http = require("http");
const { Server } = require("socket.io");

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
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

server.listen(PORT, () => {
  console.log(`Server running on PORT : ${PORT}`);
});
