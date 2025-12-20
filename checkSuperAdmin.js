const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function checkSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: "heenaghai53@gmail.com" });

    if (!user) {
      console.log("❌ Super admin user NOT found in database");
    } else {
      console.log("✅ Super admin user found!");
      console.log("Name:", user.name);
      console.log("Email:", user.email);
      console.log("Role:", user.role);
      console.log("Email Verified:", user.emailVerified);
      console.log("ID:", user._id);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkSuperAdmin();
