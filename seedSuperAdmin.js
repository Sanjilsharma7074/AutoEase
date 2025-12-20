const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const SUPER_ADMIN_EMAIL = "heenaghai53@gmail.com";
const SUPER_ADMIN_PASSWORD = "SuperAdmin@2025"; // Fixed password
const SUPER_ADMIN_NAME = "Super Administrator";

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({
      email: SUPER_ADMIN_EMAIL,
    });

    if (existingSuperAdmin) {
      console.log("Super Admin account already exists!");
      console.log(`Email: ${SUPER_ADMIN_EMAIL}`);
      console.log("Role: superadmin");
      await mongoose.disconnect();
      return;
    }

    // Create super admin account
    const superAdmin = new User({
      name: SUPER_ADMIN_NAME,
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      role: "superadmin",
      emailVerified: true,
    });

    await superAdmin.save();

    console.log("✅ Super Admin account created successfully!");
    console.log("==========================================");
    console.log(`Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`Password: ${SUPER_ADMIN_PASSWORD}`);
    console.log("Role: superadmin");
    console.log("==========================================");
    console.log(
      "⚠️  Keep these credentials secure and share only with authorized administrators."
    );

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error creating super admin:", error);
    process.exit(1);
  }
}

createSuperAdmin();
