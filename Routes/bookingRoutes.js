const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Car = require("../models/Car");
const auth = require("../middleware/auth");

function isOverlapping(start1, end1, start2, end2) {
  return start1 <= end2 && end1 >= start2;
}

// Book a car
router.post("/", auth(), async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;
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
        return res.status(400).json({ message: "Car is already booked for these dates" });
      }
    }

    const booking = new Booking({
      userId: req.user.id,
      carId,
      startDate: start,
      endDate: end,
    });

    await booking.save();
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
    if (booking.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    booking.status = "cancelled";
    await booking.save();

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
