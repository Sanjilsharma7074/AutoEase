# Setup Guide: Email OTP Verification & Google OAuth

This guide will help you set up email OTP validation and Google OAuth login for your Car Rental application.

## 1. Install Dependencies

Run the following command to install the required packages:

```bash
npm install
```

This will install:

- `nodemailer` - For sending OTP emails
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy
- `express-session` - Session management

## 2. Gmail SMTP Configuration

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com
2. Select **Security** from the left menu
3. Scroll to **How you sign in to Google**
4. Enable **2-Step Verification**

### Step 2: Create App Password

1. Go back to **Security** settings
2. Find **App passwords** (appears after enabling 2FA)
3. Select **Mail** and **Windows Computer** (or your device)
4. Google will generate a 16-character password
5. Copy this password

### Step 3: Update .env file

Create a `.env` file in your project root:

```
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
```

## 3. Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Select **Web Application**
6. Add these Authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback`
   - `http://your-production-domain.com/auth/google/callback`
7. Copy the **Client ID** and **Client Secret**

### Step 2: Update .env file

Add to your `.env`:

```
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

## 4. Update .env with All Required Variables

Complete `.env` file example:

```
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/carrental

# JWT
JWT_SECRET=your_random_secret_key_here

# Session
SESSION_SECRET=your_random_session_secret_here

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Server
PORT=5000
```

## 5. Database Migration

The User model now includes new fields:

- `emailVerified` (Boolean) - Tracks email verification status
- `otp` (String) - Stores OTP for verification
- `otpExpiry` (Date) - OTP expiration time
- `googleId` (String) - Google OAuth ID
- `profilePhoto` (String) - Profile photo from Google
- `createdAt` (Date) - Account creation timestamp

## 6. Authentication Flow

### Email OTP Signup Flow:

1. User fills signup form and submits
2. Server generates OTP and sends via email
3. User redirected to `/verify-otp` page
4. User enters 6-digit OTP within 10 minutes
5. OTP verified → User account activated → JWT token issued
6. User can now login

### Google OAuth Flow:

1. User clicks "Sign up with Google" button
2. Redirected to Google login
3. User authorizes app access
4. Account auto-created if new, or linked if email exists
5. User auto-logged in with JWT token

### Standard Email/Password Login:

1. User enters email and password
2. System checks if email is verified
3. If verified, validates password
4. Issues JWT token on success

## 7. Run the Application

```bash
npm install
npm start
```

The server will start on `http://localhost:5000`

## 8. Test the Features

### Test OTP Email Signup:

1. Go to `/signup`
2. Fill in details and submit
3. Check your email for OTP
4. Enter OTP on verification page
5. Successfully logged in

### Test Google OAuth:

1. Go to `/signup`
2. Click "Sign up with Google"
3. Complete Google login
4. Account created automatically

### Test Login:

1. Go to `/login`
2. Enter email and password
3. Login successful if email was verified

## 9. Important Notes

- OTP is valid for 10 minutes only
- Users can resend OTP if they don't receive it
- Google OAuth users automatically have verified emails
- Each email can only be registered once
- Passwords are hashed using bcryptjs
- JWT tokens expire after 24 hours

## 10. Troubleshooting

### "Failed to send OTP email"

- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Ensure 2-Factor Authentication is enabled on Gmail
- Verify App Password is correctly copied (remove spaces)

### "Google OAuth not working"

- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
- Check redirect URI matches exactly in Google Cloud Console
- Clear browser cookies/cache

### "OTP expired"

- OTP valid for 10 minutes - user can click "Resend OTP"
- Timer is reset when new OTP is generated

## 11. Production Deployment

For production:

1. Set `secure: true` in session cookie (requires HTTPS)
2. Use environment variables from your hosting provider
3. Update Google OAuth redirect URI to your domain
4. Use a robust email service (SendGrid, Mailgun, etc.)
5. Set strong JWT_SECRET and SESSION_SECRET
6. Enable HTTPS/SSL certificate

## Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Passport.js Documentation](https://www.passportjs.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
