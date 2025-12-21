const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: String,
  role: {
    type: String,
    enum: ["superadmin", "admin", "user"],
    default: "user",
  },
  emailVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  googleId: String,
  profilePhoto: String,
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  // Only hash when password exists and was modified
  if (!this.isModified("password")) return next();
  if (!this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
