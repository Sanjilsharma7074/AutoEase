const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const Car = require('../models/Car');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Admin: list cars
router.get('/cars', auth(['admin']), async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: list all bookings (normalized for frontend)
router.get('/bookings', auth(['admin']), async (req, res) => {
  try {
    const bookings = await Booking.find().populate('carId').populate('userId');
    const normalized = bookings.map(b => ({
      _id: b._id,
      carModel: b.carId ? b.carId.model : (b.carModel || 'Unknown'),
      userName: b.userId ? b.userId.name : (b.customerName || 'Unknown'),
      startDate: b.startDate,
      endDate: b.endDate,
      status: b.status,
      pickupLocation: b.pickupLocation,
      dropoffLocation: b.dropoffLocation
    }));
    res.json(normalized);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Superadmin: list admin accounts (for superadmin UI)
router.get('/admins', auth(['superadmin']), async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('-password -otp -otpExpiry');
    res.json(admins);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
