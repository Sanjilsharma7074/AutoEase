require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

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
if (!argv.email && !argv.phone && !argv.id) {
  console.error('Usage: node deleteUser.js --email user@example.com OR --phone +123.. OR --id <mongoId>');
  process.exit(1);
}

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI not set in .env');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(uri);
    const query = {};
    if (argv.email) query.email = argv.email;
    if (argv.phone) query.phone = argv.phone;
    if (argv.id) query._id = argv.id;

    const user = await User.findOne(query);
    if (!user) {
      console.log('NOT_FOUND');
    } else {
      await User.deleteOne({ _id: user._id });
      console.log('DELETED', user._id.toString());
    }
  } catch (err) {
    console.error('ERROR', err && err.message);
  } finally {
    await mongoose.disconnect();
  }
}

run();
