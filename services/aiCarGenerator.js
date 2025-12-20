// Simple deterministic "AI" generator to augment car data for demo purposes
// Generates features, a few fixed fields, a description, candidate areas, and multiple images
const encode = encodeURIComponent;

function pickSeats(type) {
  const map = {
    SUV: 5,
    "Electric SUV": 5,
    "Luxury Sedan": 5,
    "Premium Sedan": 5,
    "Mid-size Sedan": 5,
    "Compact": 5,
    "Sports Car": 2,
    Convertible: 2,
    "Pickup Truck": 2,
    Crossover: 5,
    default: 5,
  };
  return map[type] || map.default;
}

function guessFuel(type) {
  if (/(Electric|Tesla)/i.test(type)) return "Electric";
  if (/(Truck|Pickup)/i.test(type)) return "Petrol";
  if (/(Hybrid)/i.test(type)) return "Hybrid";
  return "Petrol";
}

function mileageRange(type) {
  if (/(Luxury|Premium)/i.test(type)) return [5, 20];
  if (/(Sports|Convertible)/i.test(type)) return [8, 15];
  if (/(Compact|Crossover)/i.test(type)) return [15, 30];
  if (/(SUV|Truck|Pickup)/i.test(type)) return [10, 25];
  return [10, 25];
}

function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateImages(model) {
  const positions = ["front", "side", "interior", "rear"];
  const images = positions.map((pos) => {
    const urls = [];
    const count = 3; // 3 images per position for demo
    for (let i = 1; i <= count; i++) {
      // Use a reliable placeholder service and include model+pos to make URLs distinct
      const text = `${model} ${pos} ${i}`;
      urls.push(`https://placehold.co/800x500?text=${encode(text)}`);
    }
    return { position: pos, urls };
  });
  return images;
}

function generateAreas(type, model) {
  // Simple map to likely service areas based on type
  const all = ["Downtown", "Airport", "City Center", "Suburbs", "Harbor", "Tech Park"];
  // pick 3 areas deterministically from model hash
  let seed = 0;
  for (let i = 0; i < model.length; i++) seed += model.charCodeAt(i);
  const areas = [];
  for (let i = 0; i < 3; i++) {
    areas.push(all[(seed + i * 7) % all.length]);
  }
  return areas;
}

function generateFeatures(car) {
  const seats = pickSeats(car.type || car.model || "");
  const fuel = guessFuel(car.model + " " + (car.type || ""));
  const [low, high] = mileageRange(car.type || car.model || "");
  const mileage = `${randBetween(low, high)} km/l (typical)`;

  const fixedFields = {
    seats,
    mileage,
    fuelType: fuel,
  };

  const features = [
    `${seats} seats`,
    `${fuel} engine`,
    `Estimated fuel economy: ${mileage}`,
    `Automatic transmission`,
    `Air conditioning`,
  ];

  const description = `${car.model} - a ${car.type || "versatile"} vehicle. ${seats}-seater, ${fuel.toLowerCase()} powertrain, comfortable for city and longer drives.`;

  return { fixedFields, features, description };
}

module.exports = {
  generate(car) {
    const model = car.model || "Car";
    const { fixedFields, features, description } = generateFeatures(car);
    const areas = generateAreas(car.type || "", model);
    const images = generateImages(model);

    return { fixedFields, features, description, areas, images };
  },
};
