const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { generateOTP, sendOTPEmail } = require("../services/emailService");
const passport = require("passport");

// Step 1: Signup - Send OTP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    // Create temporary user document
    const user = new User({
      name,
      email,
      password,
      role,
      otp,
      otpExpiry,
      emailVerified: false,
    });

    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "OTP sent to your email. Please verify to complete signup.",
      email: email,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Step 2: Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpiry) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please signup again." });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark email as verified and clear OTP
    user.emailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Email verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ message: "New OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if email is verified
    if (!user.emailVerified && !user.googleId) {
      return res.status(400).json({
        message: "Please verify your email first",
        email: email,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Google OAuth routes with runtime safety
router.get("/google", (req, res, next) => {
  // Check at request time, not module load time
  const hasGoogleStrategy = !!(
    passport &&
    passport._strategies &&
    passport._strategies.google
  );
  if (hasGoogleStrategy) {
    return passport.authenticate("google", { scope: ["profile", "email"] })(
      req,
      res,
      next
    );
  }
  return res
    .status(503)
    .json({
      message:
        "Google OAuth not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env and restart.",
    });
});

router.get("/google/callback", (req, res, next) => {
  // Check at request time, not module load time
  const hasGoogleStrategy = !!(
    passport &&
    passport._strategies &&
    passport._strategies.google
  );
  if (hasGoogleStrategy) {
    return passport.authenticate("google", { failureRedirect: "/login" })(
      req,
      res,
      async () => {
        try {
          const user = req.user;
          const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
          );
          res.redirect(
            `/?token=${token}&user=${JSON.stringify({
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            })}`
          );
        } catch (err) {
          res.redirect("/login?error=authentication_failed");
        }
      }
    );
  }
  return res.status(503).send("Google OAuth not configured");
});

module.exports = router;
