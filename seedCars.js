require("dotenv").config();
const mongoose = require("mongoose");
const Car = require("./models/Car");

// Minimal car database with reduced size
const defaultImage = "https://placehold.co/600x360?text=Car+Image"; // Default car image
const cars = [
  // Luxury Sedans
  {
    model: "Mercedes-Benz S-Class",
    type: "Luxury Sedan",
    pricePerDay: 250,
    availability: true,
    imageUrl: defaultImage,
  },
  {
    model: "BMW 7 Series",
    type: "Luxury Sedan",
    pricePerDay: 230,
    availability: true,
    imageUrl: defaultImage,
  },

  // Sports Cars
  {
    model: "Porsche 911",
    type: "Sports Car",
    pricePerDay: 350,
    availability: true,
    imageUrl: defaultImage,
  },
  {
    model: "Lamborghini Huracan",
    type: "Sports Car",
    pricePerDay: 800,
    availability: true,
    imageUrl: defaultImage,
  },

  // SUVs
  {
    model: "Range Rover Sport",
    type: "SUV",
    pricePerDay: 200,
    availability: true,
    imageUrl: defaultImage,
  },
  {
    model: "BMW X5",
    type: "SUV",
    pricePerDay: 180,
    availability: true,
    imageUrl: defaultImage,
  },
  {
    model: "Tesla Model X",
    type: "Electric SUV",
    pricePerDay: 210,
    availability: true,
    imageUrl: defaultImage,
  },

  // Compact/Economy
  {
    model: "Honda Civic",
    type: "Compact",
    pricePerDay: 45,
    availability: true,
    imageUrl: defaultImage,
  },
  {
    model: "Toyota Corolla",
    type: "Compact",
    pricePerDay: 40,
    availability: true,
    imageUrl: defaultImage,
  },

  // Mid-size Sedans
  {
    model: "Honda Accord",
    type: "Mid-size Sedan",
    pricePerDay: 65,
    availability: true,
    imageUrl: defaultImage,
  },
  {
    model: "Toyota Camry",
    type: "Mid-size Sedan",
    pricePerDay: 60,
    availability: true,
    imageUrl: defaultImage,
  },

  // Premium Sedans
  {
    model: "BMW 3 Series",
    type: "Premium Sedan",
    pricePerDay: 120,
    availability: true,
    imageUrl: defaultImage,
  },
  {
    model: "Mercedes-Benz C-Class",
    type: "Premium Sedan",
    pricePerDay: 125,
    availability: true,
    imageUrl: defaultImage,
  },

  // Electric Vehicles
  {
    model: "Tesla Model 3",
    type: "Electric Sedan",
    pricePerDay: 130,
    availability: true,
    imageUrl: defaultImage,
  },
  {
    model: "Tesla Model S",
    type: "Electric Sedan",
    pricePerDay: 180,
    availability: true,
    imageUrl: defaultImage,
  },

  // Convertibles
  {
    model: "BMW Z4",
    type: "Convertible",
    pricePerDay: 180,
    availability: true,
    imageUrl: defaultImage,
  },
  {
    model: "Porsche Boxster",
    type: "Convertible",
    pricePerDay: 250,
    availability: true,
    imageUrl: defaultImage,
  },

  // Trucks
  {
    model: "Ford F-150",
    type: "Pickup Truck",
    pricePerDay: 110,
    availability: true,
    imageUrl: defaultImage,
  },
  {
    model: "RAM 1500",
    type: "Pickup Truck",
    pricePerDay: 115,
    availability: true,
    imageUrl: defaultImage,
  },

  // Crossovers
  {
    model: "Honda CR-V",
    type: "Crossover",
    pricePerDay: 70,
    availability: true,
    imageUrl: defaultImage,
  },
  {
    model: "Toyota RAV4",
    type: "Crossover",
    pricePerDay: 75,
    availability: true,
    imageUrl: defaultImage,
  },
];

// Connect to MongoDB and seed the database
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    await Car.deleteMany({});
    console.log("🗑️  Cleared existing cars");

    const result = await Car.insertMany(cars);
    console.log(`✅ Successfully added ${result.length} cars to the database!`);

    const types = [...new Set(cars.map((car) => car.type))];
    console.log("\n📊 Cars by Type:");
    types.forEach((type) => {
      const count = cars.filter((car) => car.type === type).length;
      console.log(`   ${type}: ${count} cars`);
    });

    console.log("\n🎉 Database seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
