const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Car = require("../models/Car");
const User = require("../models/User");
const auth = require("../middleware/auth");

function isOverlapping(start1, end1, start2, end2) {
  return start1 <= end2 && end1 >= start2;
}

// Book a car
router.post("/", auth(), async (req, res) => {
  try {
    const {
      carId,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      distanceKm,
    } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Check for overlapping bookings
    const existingBookings = await Booking.find({
      carId,
      status: "booked",
    });

    for (let booking of existingBookings) {
      if (isOverlapping(start, end, booking.startDate, booking.endDate)) {
        return res
          .status(400)
          .json({ message: "Car is already booked for these dates" });
      }
    }

    // Snapshot user details to display even if the user is later removed
    const bookingUser = await User.findById(req.user.id);

    const booking = new Booking({
      userId: req.user.id,
      customerName: bookingUser?.name,
      customerEmail: bookingUser?.email || req.user.email,
      carId,
      startDate: start,
      endDate: end,
      pickupLocation: pickupLocation || undefined,
      dropoffLocation: dropoffLocation || undefined,
      pickupLat: pickupLat ? Number(pickupLat) : undefined,
      pickupLng: pickupLng ? Number(pickupLng) : undefined,
      dropoffLat: dropoffLat ? Number(dropoffLat) : undefined,
      dropoffLng: dropoffLng ? Number(dropoffLng) : undefined,
      distanceKm: distanceKm ? Number(distanceKm) : undefined,
    });

    await booking.save();
    // Emit websocket event for new booking
    const io = req.app && req.app.locals && req.app.locals.io;
    if (io) io.emit("booking:created", booking);

    res.status(201).json({ message: "Booking successful", booking });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cancel a booking
router.put("/cancel/:bookingId", auth(), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only booking owner or admin can cancel
    if (
      booking.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    booking.status = "cancelled";
    await booking.save();
    // Emit websocket event for cancelled booking
    const io = req.app && req.app.locals && req.app.locals.io;
    if (io) io.emit("booking:cancelled", booking);

    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get booking history
router.get("/my-bookings", auth(), async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate(
      "carId"
    );
    res.json(bookings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: view all bookings
router.get("/all", auth(["admin"]), async (req, res) => {
  try {
    const bookings = await Booking.find().populate("carId").populate("userId");
    res.json(bookings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
