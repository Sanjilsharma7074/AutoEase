require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Simple arg parsing: --email value --phone value
const args = process.argv.slice(2);
const argv = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
    argv[key] = val;
    if (val !== true) i++;
  }
}
if (!argv.email && !argv.phone) {
  console.error('Please provide --email or --phone');
  process.exit(1);
}
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI not set in .env');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const query = {};
    if (argv.email) query.email = argv.email;
    if (argv.phone) query.phone = argv.phone;

    const user = await User.findOne(query).lean();
    if (!user) {
      console.log('NOT_FOUND');
    } else {
      // hide sensitive fields
      delete user.password;
      delete user.otp;
      delete user.otpExpiry;
      console.log(JSON.stringify(user, null, 2));
    }
  } catch (err) {
    console.error('ERROR', err && err.message);
  } finally {
    await mongoose.disconnect();
  }
}

run();
