const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();
const Car = require("../models/Car");
const Booking = require("../models/Booking");

// add a car(only admin can do this)
router.post("/", auth(["admin"]), async (req, res) => {
  const car = new Car(req.body);
  try {
    await car.save();
    res.status(201).json(car);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const cars = await Car.find();

    // Show all cars as available - let bookingRoutes handle overlap validation
    const carsWithAvailability = cars.map((car) => ({
      ...car.toObject(),
      availability: true, // Always show as available
    }));

    res.json(carsWithAvailability);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a car (admin only)
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json({ message: "Car deleted successfully", car });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update car details (admin only)
router.put("/:carId", auth(["admin"]), async (req, res) => {
  try {
    const { carId } = req.params;
    const updates = req.body; // fields to update (price, availability, imageUrl, etc.)

    const car = await Car.findByIdAndUpdate(carId, updates, { new: true });

    if (!car) return res.status(404).json({ message: "Car not found" });

    res.json({ message: "Car updated successfully", car });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
