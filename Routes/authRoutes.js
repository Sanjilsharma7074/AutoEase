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

    // Block super admin email from signup
    const SUPER_ADMIN_EMAIL = "sanjilsharma456@gmail.com";
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({
        message:
          "This email is reserved for the Super Administrator account. Please login if you have credentials.",
      });
    }

    // Check if user already exists (including unverified users)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists but is not verified and OTP is expired, delete and allow re-signup
      if (!existingUser.emailVerified && existingUser.otpExpiry && new Date() > existingUser.otpExpiry) {
        console.log(`Deleting expired unverified user: ${email}`);
        await User.findByIdAndDelete(existingUser._id);
      } else if (existingUser.emailVerified) {
        return res.status(400).json({ message: "Email already registered and verified. Please login." });
      } else {
        return res.status(400).json({ message: "Email already registered. Please verify your email with the OTP sent earlier, or wait for it to expire." });
      }
    }

    // Force role to be 'user' for all signups
    const userRole = "user";

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    // IMPORTANT: Send OTP email FIRST before creating user in database
    try {
      await sendOTPEmail(email, otp);
      console.log(`OTP sent successfully to ${email}`);
    } catch (emailErr) {
      console.error(
        "OTP email send failed:",
        emailErr.message,
        "| EMAIL_USER env var:",
        process.env.EMAIL_USER ? "SET" : "MISSING",
        "| SENDGRID_API_KEY:",
        process.env.SENDGRID_API_KEY ? "SET" : "MISSING"
      );
      return res.status(500).json({
        message:
          "Failed to send OTP email. Please check your email configuration and try again.",
        error: process.env.NODE_ENV === "development" ? emailErr.message : "Email service unavailable",
      });
    }

    // Only create user in database AFTER email is successfully sent
    const user = new User({
      name,
      email,
      password,
      role: userRole,
      otp,
      otpExpiry,
      emailVerified: false,
    });

    await user.save();
    console.log(`User created successfully: ${email}`);

    res.status(201).json({
      message: "OTP sent to your email. Please verify to complete signup.",
      email: email,
    });
  } catch (err) {
    console.error("Signup error:", err);
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

    // Send OTP email FIRST before updating database
    try {
      await sendOTPEmail(email, otp);
      console.log(`OTP resent successfully to ${email}`);
    } catch (emailErr) {
      console.error("Resend OTP email failed:", emailErr.message);
      return res.status(500).json({
        message: "Failed to resend OTP email. Please try again.",
        error: process.env.NODE_ENV === "development" ? emailErr.message : "Email service unavailable",
      });
    }

    // Only update database after email is successfully sent
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

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
    // Capture intent (signup vs login) via query param in session
    const flow = (req.query.flow || "login").toLowerCase();
    if (req.session) {
      req.session.oauthFlow = flow;
    }
    return passport.authenticate("google", { scope: ["profile", "email"] })(
      req,
      res,
      next
    );
  }
  return res.status(503).json({
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
    return passport.authenticate("google", {
      failureRedirect: "/login",
      session: false,
    })(req, res, async () => {
      try {
        const user = req.user;
        const flow = (req.session?.oauthFlow || "login").toLowerCase();
        const existed = !!req.session?.oauthExistingUser;
        const email = req.session?.oauthEmail;

        // Clear flags to avoid reuse
        if (req.session) {
          req.session.oauthFlow = null;
          req.session.oauthExistingUser = null;
          req.session.oauthEmail = null;
        }

        // If user clicked signup with an already registered Google/email, redirect to login with message
        if (flow === "signup" && existed) {
          const query = `?error=already_registered${
            email ? `&email=${encodeURIComponent(email)}` : ""
          }`;
          return res.redirect(`/login${query}`);
        }
        // Proceed to establish a login session only for allowed flows
        await new Promise((resolve, reject) => {
          req.login(user, (err) => (err ? reject(err) : resolve()));
        });
        // If Google account has no local password, force set-password flow
        if (!user.password) {
          return res.redirect("/auth/set-password");
        }
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
    });
  }
  return res.status(503).send("Google OAuth not configured");
});

// Require authentication helper
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/login");
}

// Render set-password page for passwordless (Google-only) accounts
router.get("/set-password", ensureAuthenticated, (req, res) => {
  if (req.user && !req.user.password) {
    return res.render("set-password", {
      title: "Set Password",
      user: {
        name: req.user.name,
        email: req.user.email,
      },
      error: null,
    });
  }
  return res.redirect("/");
});

// Handle setting a new local password
router.post("/set-password", ensureAuthenticated, async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).render("set-password", {
        title: "Set Password",
        user: { name: req.user.name, email: req.user.email },
        error: "Please enter and confirm your new password",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).render("set-password", {
        title: "Set Password",
        user: { name: req.user.name, email: req.user.email },
        error: "Passwords do not match",
      });
    }

    // Basic strength check (optional, can be enhanced)
    if (newPassword.length < 8) {
      return res.status(400).render("set-password", {
        title: "Set Password",
        user: { name: req.user.name, email: req.user.email },
        error: "Password must be at least 8 characters",
      });
    }

    // Only allow setting password if currently null or empty
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.redirect("/login");
    }
    if (user.password) {
      return res.redirect("/");
    }

    user.password = newPassword;
    await user.save();

    // Issue JWT for immediate login experience after setting password
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.redirect(
      `/?token=${token}&user=${JSON.stringify({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      })}&passwordSet=1`
    );
  } catch (err) {
    console.error("Error setting password:", err);
    return res.status(500).render("set-password", {
      title: "Set Password",
      user: { name: req.user?.name, email: req.user?.email },
      error: "An error occurred. Please try again.",
    });
  }
});

// Super Admin: Create Admin Account (Only accessible by superadmin)
const auth = require("../middleware/auth");

router.post("/create-admin", auth(["superadmin"]), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }

    // Create admin account (no OTP verification needed)
    const adminUser = new User({
      name,
      email,
      password,
      role: "admin",
      emailVerified: true, // Auto-verified for admin accounts
    });

    await adminUser.save();

    res.status(201).json({
      message: "Admin account created successfully",
      admin: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (err) {
    console.error("Error creating admin account:", err);
    res.status(500).json({
      message: "Failed to create admin account. Please try again.",
    });
  }
});

// Super Admin: Get All Admin Accounts
router.get("/admins", auth(["superadmin"]), async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select(
      "-password -otp -otpExpiry"
    );
    res.json(admins);
  } catch (err) {
    console.error("Error fetching admins:", err);
    res.status(500).json({ message: "Failed to fetch admin accounts" });
  }
});

// Super Admin: Delete Admin Account
router.delete("/admin/:id", auth(["superadmin"]), async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin account not found" });
    }

    if (admin.role !== "admin") {
      return res
        .status(400)
        .json({ message: "Can only delete admin accounts" });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: "Admin account deleted successfully" });
  } catch (err) {
    console.error("Error deleting admin:", err);
    res.status(500).json({ message: "Failed to delete admin account" });
  }
});

// Cleanup expired unverified users (can be called via cron job or manually)
router.post("/cleanup-expired-users", async (req, res) => {
  try {
    const now = new Date();
    const result = await User.deleteMany({
      emailVerified: false,
      otpExpiry: { $lt: now },
    });

    console.log(`Cleaned up ${result.deletedCount} expired unverified users`);
    res.json({
      message: `Successfully cleaned up ${result.deletedCount} expired unverified users`,
      count: result.deletedCount,
    });
  } catch (err) {
    console.error("Error cleaning up expired users:", err);
    res.status(500).json({ message: "Failed to cleanup expired users" });
  }
});

module.exports = router;
