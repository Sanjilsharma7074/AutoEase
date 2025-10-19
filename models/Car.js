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
    default: "",
  },
});

module.exports = mongoose.model("Car", carSchema);
