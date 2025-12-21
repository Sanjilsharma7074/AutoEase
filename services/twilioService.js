const debug = require('debug')('autoease:twilio');

let client;

const initTwilio = () => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const Twilio = require('twilio');
    client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    debug('Twilio client initialized');
    return true;
  }
  debug('Twilio not configured (missing TWILIO_* env vars)');
  return false;
};

const sendSms = async (to, body) => {
  if (!client) {
    const ok = initTwilio();
    if (!ok) throw new Error('Twilio not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
  }

  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) throw new Error('TWILIO_PHONE_NUMBER not set in environment');

  try {
    const msg = await client.messages.create({
      body,
      from,
      to,
    });
    return msg;
  } catch (err) {
    debug('Twilio send error:', err && err.message);
    throw err;
  }
};

const sendOtpSms = async (to, otp) => {
  const body = `Your AutoEase verification code is: ${otp} (valid 10 minutes)`;
  return sendSms(to, body);
};

module.exports = { initTwilio, sendSms, sendOtpSms };
