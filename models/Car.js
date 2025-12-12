const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  model: String,
  type: String,
  pricePerDay: Number,
  availability: {
    type: Boolean,
    default: true,
  },
  imageUrl: {
    type: String,
    default: "https://placehold.co/600x360?text=Car+Image", // Default car image (reliable placeholder)
  },
});

module.exports = mongoose.model("Car", carSchema);
