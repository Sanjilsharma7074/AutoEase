# Email OTP & Google OAuth Implementation - Quick Reference

## ✅ What Was Implemented

### 1. Email OTP Verification

- **Auto-generated 6-digit OTP** sent to user's email during signup
- **10-minute validity** with automatic expiration
- **Resend OTP functionality** if user doesn't receive it
- **Interactive OTP input** with auto-focusing between digits
- **Countdown timer** showing remaining validity

### 2. Google OAuth Login (FREE)

- **One-click Google sign-up/login** - completely free
- **Auto-account creation** with Google profile data
- **Auto-email verification** for Google OAuth users
- **Profile photo storage** from Google account
- **Auto-linking** if email already exists in system

### 3. Enhanced Authentication Flow

- **Email verification required** before login (except Google OAuth)
- **JWT tokens** with 24-hour validity
- **Session management** with Passport.js
- **Secure password hashing** using bcryptjs
- **Role-based access control** (admin/user)

## 📁 New/Modified Files

### New Files Created:

1. **`services/emailService.js`** - Email & OTP sending service
2. **`middleware/passport.js`** - Google OAuth strategy configuration
3. **`views/verify-otp.ejs`** - OTP verification UI
4. **`.env.example`** - Environment variables template
5. **`SETUP_GUIDE.md`** - Complete setup instructions

### Modified Files:

1. **`package.json`** - Added dependencies (nodemailer, passport, etc.)
2. **`models/User.js`** - Added OTP & OAuth fields
3. **`Routes/authRoutes.js`** - Added OTP & OAuth endpoints
4. **`server.js`** - Added Passport & session setup
5. **`Routes/viewRoutes.js`** - Added OTP verification route
6. **`views/signup.ejs`** - Added Google OAuth button & OTP flow
7. **`public/css/style.css`** - Added Google button styling

## 🔐 New Database Fields (User Model)

```javascript
{
  emailVerified: Boolean,      // Email verification status
  otp: String,                 // 6-digit OTP
  otpExpiry: Date,             // OTP expiration time
  googleId: String,            // Google OAuth ID
  profilePhoto: String,        // Google profile picture
  createdAt: Date              // Account creation time
}
```

## 📡 New API Endpoints

### Authentication Routes:

- `POST /auth/signup` - Create account with email OTP
- `POST /auth/verify-otp` - Verify OTP and complete signup
- `POST /auth/resend-otp` - Resend OTP to email
- `POST /auth/login` - Login with email/password
- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback

### View Routes:

- `GET /verify-otp` - OTP verification page

## 🔧 Required Environment Variables

Create `.env` file with:

```env
# Database
MONGO_URI=your_mongodb_uri

# JWT
JWT_SECRET=your_jwt_secret

# Session
SESSION_SECRET=your_session_secret

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Server
PORT=5000
```

## 🚀 Usage Flow

### Signup with Email OTP:

```
1. User goes to /signup
2. Fills form and submits
3. Server generates OTP and sends email
4. Redirects to /verify-otp?email=user@example.com
5. User enters 6-digit OTP
6. Account verified → JWT issued → Auto login
```

### Signup with Google:

```
1. User clicks "Sign up with Google"
2. Authenticates with Google
3. Account auto-created or linked
4. JWT issued → Auto login → Redirected home
```

### Login:

```
1. User goes to /login
2. Enters email and password
3. System checks email verification
4. If verified, validates password
5. JWT issued on success
```

## 📧 Email Configuration

### Using Gmail (Recommended):

1. Enable 2-Factor Authentication in Google Account
2. Create App Password (16-character)
3. Use Email User and App Password in .env

### Using Other Services:

- **SendGrid**: Update transport in `emailService.js`
- **Mailgun**: Change transport configuration
- **AWS SES**: Configure with AWS credentials

## 🎨 Frontend Updates

### Signup Page:

- Added Google OAuth button with icon
- Updated form submission to redirect to OTP verification
- Added success/error message display

### New OTP Verification Page:

- 6 interactive digit input boxes
- Auto-focus between digits
- Countdown timer (10 minutes)
- Resend OTP button
- Real-time feedback messages

## 🔒 Security Features

✅ OTP sent via email (not visible in signup form)
✅ 6-digit random OTP (1 in 1 million chances)
✅ 10-minute expiration (prevents brute force)
✅ Passwords hashed with bcryptjs
✅ JWT tokens with expiration
✅ Session management with Passport
✅ Google OAuth uses official API
✅ Environment variables for secrets

## 📝 Important Notes

- **OTP validity**: 10 minutes from generation
- **Resend limit**: Users can resend anytime
- **Google OAuth**: Auto-verifies email (no OTP needed)
- **Token expiry**: 24 hours (can be adjusted)
- **Email service**: Requires SMTP configuration
- **Production**: Use HTTPS, secure cookies, strong secrets

## 🛠️ Troubleshooting

| Issue                  | Solution                                 |
| ---------------------- | ---------------------------------------- |
| OTP not received       | Check SPAM folder, resend OTP            |
| Gmail auth fails       | Use App Password (not regular password)  |
| Google OAuth error     | Verify Client ID/Secret and redirect URI |
| Token expired          | User needs to login again                |
| Email validation fails | Check EMAIL_USER in .env                 |

## 📦 Dependencies Added

- `nodemailer@^6.9.7` - Email sending
- `passport@^0.7.0` - Authentication middleware
- `passport-google-oauth20@^2.0.0` - Google OAuth
- `express-session@^1.17.3` - Session management

## 🎯 Next Steps

1. **Install dependencies**: `npm install`
2. **Create `.env` file** with all variables
3. **Configure Gmail SMTP** (follow SETUP_GUIDE.md)
4. **Set up Google OAuth** (follow SETUP_GUIDE.md)
5. **Test signup with OTP**
6. **Test Google OAuth login**
7. **Deploy to production** with HTTPS

## 📚 Documentation Files

- **SETUP_GUIDE.md** - Step-by-step setup instructions
- **.env.example** - Environment variables template
- **This file** - Quick reference guide

---

**Feature Status**: ✅ Email OTP Validation + ✅ Google OAuth (Free)
**Ready to Deploy**: Yes, after configuration
