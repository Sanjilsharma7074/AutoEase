require('dotenv').config();
const fetch = global.fetch || require('node-fetch');

async function run() {
  const payload = {
    name: 'USER11',
    email: 'user11@gmail.com',
    phone: '+916239634705',
    password: 'Passw0rd!'
  };

  try {
    const res = await fetch('http://localhost:5000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log(text);
  } catch (err) {
    console.error('ERROR', err && err.message);
  }
}

run();
