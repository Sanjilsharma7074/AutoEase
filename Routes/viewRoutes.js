const express = require("express");
const router = express.Router();

// Home page
router.get("/", (req, res) => {
  res.render("index");
});

// Login page
router.get("/login", (req, res) => {
  res.render("login");
});

// Signup page
router.get("/signup", (req, res) => {
  res.render("signup");
});

// OTP Verification page
router.get("/verify-otp", (req, res) => {
  res.render("verify-otp");
});

// Cars page
router.get("/cars", (req, res) => {
  res.render("cars");
});

// Bookings page
router.get("/bookings", (req, res) => {
  res.render("bookings");
});

// Admin dashboard
router.get("/admin", (req, res) => {
  res.render("admin");
});

// Super Admin dashboard
router.get("/superadmin", (req, res) => {
  res.render("superadmin");
});

// Edit car page
router.get("/edit-car", (req, res) => {
  res.render("editCar");
});

module.exports = router;
