const nodemailer = require("nodemailer");

let transporter;
let usingTestAccount = false;

const initTransporter = async () => {
  // Priority: explicit provider settings > generic SMTP host > Gmail fallback > Ethereal
  if (process.env.EMAIL_SERVICE && process.env.EMAIL_SERVICE.toLowerCase() === 'sendgrid' && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    // SendGrid via SMTP
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.sendgrid.net',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true' || false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    usingTestAccount = false;
    return;
  }

  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    // Generic SMTP transport
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true' || false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    usingTestAccount = false;
    return;
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    // Backwards-compatible Gmail transport
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    usingTestAccount = false;
    return;
  }

  // Fallback: create Ethereal test account for local development
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    usingTestAccount = true;
    console.warn("No SMTP credentials found. Using Ethereal test account for emails (development only).");
  } catch (err) {
    console.error("Failed to create test email account:", err);
    throw err;
  }
};

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  if (!transporter) {
    await initTransporter();
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@autoease.local',
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
    // include envelope and replyTo for better control of SMTP MAIL FROM and reply behavior
    mailOptions.replyTo = process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER;
    mailOptions.envelope = {
      from: process.env.EMAIL_ENVELOPE_FROM || process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
    };

    const info = await transporter.sendMail(mailOptions);
    // If using Ethereal, log preview URL to console for developer
    if (usingTestAccount) {
      const url = nodemailer.getTestMessageUrl(info);
      console.info("Preview URL for test email:", url);
    }
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
};
