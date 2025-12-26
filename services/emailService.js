const nodemailer = require("nodemailer");

// Multi-provider email support: Brevo (free), Gmail (local dev only), or SendGrid
const useBrevo = !!process.env.BREVO_SMTP_KEY;
const useSendGrid = !!process.env.SENDGRID_API_KEY;

let transporter;

if (useBrevo) {
  // Brevo (formerly Sendinblue) - 300 emails/day FREE forever
  transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.BREVO_SMTP_KEY,
    },
    connectionTimeout: 15000,
  });
} else if (useSendGrid) {
  // SendGrid
  transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY,
    },
    connectionTimeout: 15000,
  });
} else {
  // Gmail (works locally, may fail on cloud platforms due to SMTP blocking)
  transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
  });
}

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification OTP - Car Rental Service",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) for email verification is:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
          <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p><strong>This OTP is valid for 10 minutes.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">© Car Rental Service. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending error:", error.message);
    console.error("Config:", {
      useBrevo: !!process.env.BREVO_SMTP_KEY,
      useSendGrid: !!process.env.SENDGRID_API_KEY,
      useGmail: !process.env.BREVO_SMTP_KEY && !process.env.SENDGRID_API_KEY,
    });
    throw new Error("Failed to send OTP email: " + error.message);
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
};
