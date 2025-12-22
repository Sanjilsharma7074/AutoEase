const nodemailer = require("nodemailer");
const useSendGrid = !!process.env.SENDGRID_API_KEY;
let transporter = null;

// If SendGrid is configured, prefer its REST API (faster, fewer network issues)
let sgMail = null;
if (useSendGrid) {
  try {
    sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log("SendGrid REST API configured");
  } catch (e) {
    console.warn("@sendgrid/mail not installed or failed to load; falling back to SMTP", e.message);
  }
}

// Fallback to Gmail SMTP if SendGrid REST is not available
if (!sgMail) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // 16-char Gmail App Password
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 30000,
    socketTimeout: 30000,
    greetingTimeout: 30000,
  });
}

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const subject = "Email Verification OTP - Car Rental Service";
  const html = `
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
  `;

  // Prefer SendGrid REST API if available
  if (sgMail) {
    const from = process.env.EMAIL_USER || "noreply@autoease.app"; // must be a verified sender in SendGrid
    const msg = { to: email, from, subject, html };
    try {
      const [response] = await sgMail.send(msg);
      console.log("SendGrid email sent:", response?.statusCode);
      return true;
    } catch (error) {
      console.error("SendGrid send error:", error?.response?.body || error.message);
      throw new Error(`Failed to send OTP email via SendGrid: ${error.message}`);
    }
  }

  // Fallback to Gmail SMTP
  if (transporter) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("SMTP email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("SMTP send error:", {
        message: error.message,
        code: error.code,
        response: error.response,
        stack: error.stack,
      });
      throw new Error(`Failed to send OTP email via SMTP: ${error.message}`);
    }
  }

  throw new Error("Email transport not configured");
};

module.exports = {
  generateOTP,
  sendOTPEmail,
};
