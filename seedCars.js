require("dotenv").config();
const mongoose = require("mongoose");
const Car = require("./models/Car");
const ai = require("./services/aiCarGenerator");

// Minimal car database with reduced size
const defaultImage = "https://placehold.co/600x360?text=Car+Image"; // Default car image
const cars = [
  // Luxury Sedans
  {
    model: "Mercedes-Benz S-Class",
    type: "Luxury Sedan",
    pricePerDay: 250,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1727547082307-84ec9e300f9a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fE1lcmNlZGVzLUJlbnolMjBTLUNsYXNzfGVufDB8fDB8fHww,"
  },
  {
    model: "BMW 7 Series",
    type: "Luxury Sedan",
    pricePerDay: 230,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1627936354732-ffbe552799d8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Qk1XJTIwNyUyMFNlcmllc3xlbnwwfHwwfHx8MA%3D%3D,"
  },

  // Sports Cars
  {
    model: "Porsche 911",
    type: "Sports Car",
    pricePerDay: 350,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cG9yc2NoZXxlbnwwfHwwfHx8MA%3D%3D,"
  },
  {
    model: "Lamborghini Huracan",
    type: "Sports Car",
    pricePerDay: 800,
    availability: true,
    imageUrl:" https://images.unsplash.com/photo-1612825173281-9a193378527e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8TGFtYm9yZ2hpbmklMjBIdXJhY2FufGVufDB8fDB8fHww",
  },

  // SUVs
  {
    model: "Range Rover Sport",
    type: "SUV",
    pricePerDay: 200,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1638686302275-0e87df720aca?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmFuZ2UlMjByb3ZlciUyMHNwb3J0fGVufDB8fDB8fHww",
  },
  {
    model: "BMW X5",
    type: "SUV",
    pricePerDay: 180,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1635089917414-6da790da8479?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Qk1XJTIwWDV8ZW58MHx8MHx8fDA%3D,"
  },
  {
    model: "Tesla Model X",
    type: "Electric SUV",
    pricePerDay: 210,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1652508996648-c42c1108bdd6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dGVzbGElMjBtb2RlbCUyMHh8ZW58MHx8MHx8fDA%3D,"
  },

  // Compact/Economy
  {
    model: "Honda Civic",
    type: "Compact",
    pricePerDay: 45,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1594070319944-7c0cbebb6f58?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8SG9uZGElMjBDaXZpY3xlbnwwfHwwfHx8MA%3D%3D,"
  },
  {
    model: "Toyota Corolla",
    type: "Compact",
    pricePerDay: 40,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8VG95b3RhJTIwQ29yb2xsYXxlbnwwfHwwfHx8MA%3D%3D",
  },

  // Mid-size Sedans
  {
    model: "Honda Accord",
    type: "Mid-size Sedan",
    pricePerDay: 65,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1634737581963-5a22ba471961?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8SG9uZGElMjBBY2NvcmR8ZW58MHx8MHx8fDA%3D",
  },
  {
    model: "Toyota Camry",
    type: "Mid-size Sedan",
    pricePerDay: 60,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8VG95b3RhJTIwQ2Ftcnl8ZW58MHx8MHx8fDA%3D",
  },

  // Premium Sedans
  {
    model: "BMW 3 Series",
    type: "Premium Sedan",
    pricePerDay: 120,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1687184471624-a7128c42c0a2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Qk1XJTIwMyUyMFNlcmllc3xlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    model: "Mercedes-Benz C-Class",
    type: "Premium Sedan",
    pricePerDay: 125,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1686562483617-3cf08d81e117?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fE1lcmNlZGVzLUJlbnolMjBDLUNsYXNzfGVufDB8fDB8fHww",
  },

  // Electric Vehicles
  {
    model: "Tesla Model 3",
    type: "Electric Sedan",
    pricePerDay: 130,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8VGVzbGElMjBNb2RlbCUyMDN8ZW58MHx8MHx8fDA%3D",
  },
  {
    model: "Tesla Model S",
    type: "Electric Sedan",
    pricePerDay: 180,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8VGVzbGElMjBNb2RlbCUyMFN8ZW58MHx8MHx8fDA%3D",
  },

  // Convertibles
  {
    model: "BMW Z4",
    type: "Convertible",
    pricePerDay: 180,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1612610683796-3b7d3a65df3d?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Qk1XJTIwWjR8ZW58MHx8MHx8fDA%3D",
  },
  {
    model: "Porsche Boxster",
    type: "Convertible",
    pricePerDay: 250,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1753476105892-b84762b511d4?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8UG9yc2NoZSUyMEJveHN0ZXJ8ZW58MHx8MHx8fDA%3D",
  },

  // Trucks
  {
    model: "Ford F-150",
    type: "Pickup Truck",
    pricePerDay: 110,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1673734582682-45de496c7500?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Rm9yZCUyMEYtMTUwfGVufDB8fDB8fHww",
  },
  {
    model: "RAM 1500",
    type: "Pickup Truck",
    pricePerDay: 115,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1626669249177-9fe9dbe7e825?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8UkFNJTIwMTUwMHxlbnwwfHwwfHx8MA%3D%3D",
  },

  // Crossovers
  {
    model: "Honda CR-V",
    type: "Crossover",
    pricePerDay: 70,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1570303278489-041bd897a873?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fEhvbmRhJTIwQ1ItViUyMGNhcnxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    model: "Toyota RAV4",
    type: "Crossover",
    pricePerDay: 75,
    availability: true,
    imageUrl: "https://images.unsplash.com/photo-1622210642960-0f6a2cdbdc9f?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8VG95b3RhJTIwUkFWNHxlbnwwfHwwfHx8MA%3D%3D",
  },
];

// Connect to MongoDB and seed the database
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    await Car.deleteMany({});
    console.log("🗑️  Cleared existing cars");

    // Augment each car with AI-generated features, description, areas, and images
    const augmented = cars.map((c) => Object.assign({}, c, ai.generate(c)));

    const result = await Car.insertMany(augmented);
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
