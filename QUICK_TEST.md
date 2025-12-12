# Quick Testing Reference

## 🚀 Start Here (2 minutes)

```bash
# 1. Install packages
npm install

# 2. Create .env file (use Gmail credentials)
# Copy template from .env.example

# 3. Start server
npm run dev

# 4. Open browser
http://localhost:5000/signup
```

---

## ✅ Test OTP Signup (Most Important)

1. Go to **http://localhost:5000/signup**
2. Enter:
   - Name: `Test User`
   - Email: `your_real_email@gmail.com`
   - Password: `Test@123`
   - Role: `Customer`
3. Click "Sign Up"
4. **Check your email** for 6-digit OTP
5. Go to `/verify-otp` page (auto-redirects)
6. **Enter the 6 digits** from email
7. **Success!** You're logged in

---

## 🔑 Required .env Variables

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=any_secret_string
SESSION_SECRET=any_secret_string
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=16_char_app_password
PORT=5000
```

**Gmail Setup** (3 mins):

- Enable 2-Factor Auth in Google Account
- Create "App Password" (generates 16 chars)
- Copy it to EMAIL_PASSWORD in .env

---

## 📧 Testing OTP Email

```bash
# Create test-email.js
const { sendOTPEmail } = require('./services/emailService');
sendOTPEmail('your_email@gmail.com', '123456')
  .then(() => console.log('✅ Email sent!'))
  .catch(err => console.log('❌ Error:', err));

# Run it
node test-email.js
```

---

## 🌐 Testing with Postman

### Signup

```
POST http://localhost:5000/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Test@123",
  "role": "user"
}
```

### Verify OTP

```
POST http://localhost:5000/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Login

```
POST http://localhost:5000/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Test@123"
}
```

---

## 🗂️ Check Database

```bash
# MongoDB Compass: Connect and view 'users' collection
# Or use MongoDB Shell:

mongosh "your_mongo_uri"
use carrental
db.users.find()
db.users.find({ emailVerified: true })
```

---

## 🐛 Troubleshooting

| Problem                    | Fix                               |
| -------------------------- | --------------------------------- |
| Email not received         | Check SPAM, resend OTP            |
| "Failed to send email"     | Check EMAIL_USER/PASSWORD in .env |
| "OTP invalid"              | Copy entire OTP from email        |
| "Email already registered" | Use different email for testing   |
| Server won't start         | Check PORT 5000 not in use        |
| MONGO connection error     | Check MONGO_URI is correct        |

---

## 📱 Browser DevTools Check

```javascript
// Open Console (F12) and check:
localStorage.getItem("token"); // Should show JWT token when logged in
localStorage.getItem("user"); // Should show user object
localStorage.clear(); // Clear if needed
```

---

## ✨ All Features Included

✅ Email OTP verification (6-digit, 10-min expiry)
✅ Resend OTP functionality
✅ Email/password signup & login
✅ Google OAuth (when configured)
✅ JWT token authentication (24h expiry)
✅ User role management (admin/user)
✅ Password hashing
✅ Session management

---

## 📚 Full Documentation

- **SETUP_GUIDE.md** - Detailed setup instructions
- **IMPLEMENTATION_GUIDE.md** - What was implemented
- **FAQ_TROUBLESHOOTING.md** - Common issues & fixes
- **TESTING_GUIDE.md** - Complete testing guide

---

**Most Important**: Test OTP signup first (it's the main feature!)
