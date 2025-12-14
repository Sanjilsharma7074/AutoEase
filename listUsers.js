const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function listAllUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find();

    console.log(`Total users in database: ${users.length}`);

    if (users.length > 0) {
      console.log("\nAll users:");
      users.forEach((user, index) => {
        console.log(
          `${index + 1}. Name: ${user.name}, Email: ${user.email}, Role: ${
            user.role
          }, Verified: ${user.emailVerified}`
        );
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listAllUsers();
