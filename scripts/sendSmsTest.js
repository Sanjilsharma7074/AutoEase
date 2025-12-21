require('dotenv').config();
const { sendOtpSms, initTwilio } = require('../services/twilioService');

(async () => {
  try {
    console.log('Initializing Twilio...');
    initTwilio();
    const phone = process.argv[2] || '+916239634705';
    const otp = '123456';
    console.log('Sending OTP to', phone);
    const res = await sendOtpSms(phone, otp);
    console.log('Sent:', res && res.sid);
  } catch (err) {
    console.error('SEND_ERROR', err && err.message);
    if (err && err.code) console.error('TWILIO_CODE', err.code);
    if (err && err.moreInfo) console.error('TWILIO_INFO', err.moreInfo);
  }
})();
