const nodemailer = require("nodemailer");

// Prefer SendGrid in cloud (Render) if available; else use Gmail STARTTLS
const useSendGrid = !!process.env.SENDGRID_API_KEY;

const transporter = useSendGrid
  ? nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
      connectionTimeout: 30000, // 30 seconds for cloud environments
      socketTimeout: 30000,
      greetingTimeout: 30000,
    })
  : nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // STARTTLS
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // 16-char Gmail App Password
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 30000, // 30 seconds for cloud environments
      socketTimeout: 30000,
      greetingTimeout: 30000,
    });

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  // Verify transporter configuration before attempting to send
  try {
    await transporter.verify();
    console.log("SMTP connection verified successfully");
  } catch (verifyError) {
    console.error("SMTP verification failed:", verifyError.message);
    throw new Error(`Email service not configured properly: ${verifyError.message}`);
  }

  const mailOptions = {
    from: useSendGrid ? process.env.EMAIL_USER || 'noreply@carrental.com' : process.env.EMAIL_USER,
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
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email sending error:", {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack
    });
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
};
