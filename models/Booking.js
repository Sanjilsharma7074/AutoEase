const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
    },
    pickupLocation: {
      type: String,
    },
    dropoffLocation: {
      type: String,
    },
    pickupLat: Number,
    pickupLng: Number,
    dropoffLat: Number,
    dropoffLng: Number,
    distanceKm: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
