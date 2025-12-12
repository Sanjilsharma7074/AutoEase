# Testing Guide - Email OTP & Google OAuth

## Prerequisites Setup

### Step 1: Install Dependencies

```bash
cd c:\Users\sanji\OneDrive\Desktop\carRental
npm install
```

### Step 2: Configure Environment Variables

Create `.env` file in your project root with:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/carrental

# JWT
JWT_SECRET=test_secret_key_12345

# Session
SESSION_SECRET=test_session_secret_67890

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password

# Google OAuth (if testing)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Server
PORT=5000
```

---

## Quick Start Testing (Without Google OAuth)

If you only want to test OTP without Google OAuth setup:

```env
# Minimal .env for OTP testing
MONGO_URI=mongodb+srv://youruser:yourpass@cluster.mongodb.net/carrental
JWT_SECRET=test_secret_key
SESSION_SECRET=test_session_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
PORT=5000
```

---

## Start the Application

```bash
# Development mode with auto-reload
npm run dev

# Or regular start
npm start
```

Server will run at: **http://localhost:5000**

---

## Test 1: Email OTP Signup (Most Important)

### Steps:

1. **Open Browser**: Go to `http://localhost:5000/signup`
2. **Fill Form**:
   - Full Name: `John Doe`
   - Email: `your_email@gmail.com` (use YOUR real email)
   - Password: `Test@123`
   - Account Type: `Customer`
3. **Click "Sign Up"**
4. **Check Success Message**: Should say "OTP sent to your email!"
5. **Check Your Email** for OTP (check SPAM folder too)
6. **You'll be redirected** to `/verify-otp?email=your_email@gmail.com`
7. **Enter 6-Digit OTP**:
   - Click each digit box
   - Enter the 6 digits from email
   - Auto-focus moves to next box
8. **Click "Verify OTP"**
9. **Success!** You should be logged in and redirected to home page

---

## Test 2: Resend OTP

### Steps:

1. On the OTP verification page
2. If you didn't receive email, click **"Resend OTP"**
3. New OTP sent to your email
4. Enter the new OTP and verify

---

## Test 3: OTP Expiration

### Steps:

1. Get OTP from email
2. **Wait 10 minutes** (or immediately for testing)
3. Try to enter the OTP
4. You should see: **"OTP expired. Please request a new one."**
5. Click "Resend OTP" to get new one

**For faster testing**, modify `Routes/authRoutes.js` to use 1 minute:

```javascript
const otpExpiry = new Date(Date.now() + 1 * 60 * 1000); // 1 minute instead of 10
```

---

## Test 4: Login After Signup

### Steps:

1. Go to `http://localhost:5000/login`
2. Enter the email and password you signed up with
3. Click "Login"
4. Should succeed and redirect home

---

## Test 5: Login Without Email Verification

### Steps:

1. Create a test user in MongoDB without going through OTP
2. Try to login with that email
3. Should fail with: **"Please verify your email first"**

---

## Test 6: Google OAuth Setup (Optional - Free)

### Only if you want to test Google login:

1. **Go to**: https://console.cloud.google.com
2. **Create Project**:

   - Click "Select Project" → "New Project"
   - Name: "Car Rental"
   - Create

3. **Enable Google+ API**:

   - Search "Google+ API"
   - Click and enable it

4. **Create OAuth Credentials**:

   - Go to Credentials
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add Authorized redirect URIs:
     - `http://localhost:5000/auth/google/callback`
   - Create
   - Copy Client ID and Client Secret

5. **Add to .env**:

   ```env
   GOOGLE_CLIENT_ID=paste_your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=paste_your_client_secret
   ```

6. **Restart server**: `npm run dev`

7. **Test**:
   - Go to `/signup`
   - Click "Sign up with Google"
   - Login with your Google account
   - Should auto-login

---

## Test 7: Linking Google Account to Existing Email

### Steps:

1. Signup with email `test@example.com` via OTP
2. Go to `/signup` again
3. Click "Sign up with Google"
4. Use Google account with same email (`test@example.com`)
5. Accounts should be linked automatically
6. Next time, can use either method

---

## Using Postman for API Testing

### Test Signup Endpoint:

**POST** `http://localhost:5000/auth/signup`

**Headers**:

```
Content-Type: application/json
```

**Body** (JSON):

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Test@123",
  "role": "user"
}
```

**Expected Response**:

```json
{
  "message": "OTP sent to your email. Please verify to complete signup.",
  "email": "john@example.com"
}
```

---

### Test OTP Verification:

**POST** `http://localhost:5000/auth/verify-otp`

**Headers**:

```
Content-Type: application/json
```

**Body**:

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Expected Response** (on success):

```json
{
  "message": "Email verified successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### Test Resend OTP:

**POST** `http://localhost:5000/auth/resend-otp`

**Body**:

```json
{
  "email": "john@example.com"
}
```

---

### Test Login:

**POST** `http://localhost:5000/auth/login`

**Body**:

```json
{
  "email": "john@example.com",
  "password": "Test@123"
}
```

---

## Check MongoDB Data

### Using MongoDB Compass:

1. Open **MongoDB Compass**
2. Connect with your MONGO_URI
3. Navigate to your database → **users** collection
4. View created users:
   ```json
   {
     "_id": ObjectId("..."),
     "name": "John Doe",
     "email": "john@example.com",
     "emailVerified": true,
     "googleId": null,
     "profilePhoto": null,
     "createdAt": ISODate("2024-12-12T..."),
     "otp": null,
     "otpExpiry": null
   }
   ```

### Using MongoDB Shell:

```bash
# Connect to your MongoDB
mongosh "your_mongo_uri"

# Switch to database
use carrental

# View all users
db.users.find()

# View users with verified emails
db.users.find({ emailVerified: true })

# View Google OAuth users
db.users.find({ googleId: { $exists: true } })

# Check specific user
db.users.findOne({ email: "john@example.com" })
```

---

## Check Email Sending

### Test Email Service Directly:

Create `test-email.js`:

```javascript
const { sendOTPEmail } = require("./services/emailService");

sendOTPEmail("your_email@gmail.com", "123456")
  .then(() => console.log("✅ Email sent successfully!"))
  .catch((err) => console.log("❌ Error:", err.message));
```

Run it:

```bash
node test-email.js
```

---

## Browser Console Testing

### After logging in, test token storage:

**Open DevTools** (F12) → **Console**

```javascript
// Check if token is stored
console.log(localStorage.getItem("token"));

// Check user data
console.log(localStorage.getItem("user"));

// Clear if needed
localStorage.clear();
```

---

## Testing Checklist

| Feature                        | Steps                                        | Expected Result             | Status |
| ------------------------------ | -------------------------------------------- | --------------------------- | ------ |
| **OTP Signup**                 | Fill form → Check email → Enter OTP          | Account verified, logged in | [ ]    |
| **OTP Resend**                 | Click resend → New email received            | New OTP works               | [ ]    |
| **OTP Expiration**             | Wait 10 mins → Try old OTP                   | Expired message             | [ ]    |
| **Email/Password Login**       | Enter credentials → Login                    | Logged in successfully      | [ ]    |
| **Login Without Verification** | Try unverified email → Login                 | Error message               | [ ]    |
| **Google OAuth**               | Click Google button → Authenticate           | Auto logged in              | [ ]    |
| **Account Linking**            | Signup OTP with email X → OAuth with email X | Accounts linked             | [ ]    |
| **Multiple Users**             | Create 3+ test accounts                      | All work independently      | [ ]    |
| **Token Storage**              | Logout → Check storage                       | Token cleared               | [ ]    |
| **Invalid OTP**                | Enter wrong OTP                              | Error message               | [ ]    |

---

## Debugging Tips

### Enable Debug Logs:

Add this to `server.js`:

```javascript
// For development
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}
```

### Check Network Requests:

**In Browser DevTools**:

1. Go to **Network** tab
2. Perform signup/login
3. Click on requests to see:
   - Request body
   - Response body
   - Status codes

### Check Terminal Logs:

Watch for errors in terminal where you ran `npm run dev`

---

## Common Test Scenarios

### Scenario 1: Normal Signup Flow

```
1. Visit /signup
2. Enter: john@example.com, password: Test@123
3. Check email for OTP (e.g., 654321)
4. Enter OTP on /verify-otp
5. Get redirected to home with login status
```

### Scenario 2: Duplicate Email

```
1. Already signed up with john@example.com
2. Try to signup again with same email
3. Should get error: "Email already registered"
```

### Scenario 3: Wrong OTP

```
1. Get OTP 654321
2. Enter wrong OTP 000000
3. Should get error: "Invalid OTP"
4. Can try again with correct OTP
```

### Scenario 4: Session Persistence

```
1. Login successfully
2. Refresh page
3. Should still be logged in (token in localStorage)
4. Logout
5. Refresh page
6. Should be logged out
```

---

## Reset Database for Fresh Testing

If you want to clear all data and start fresh:

```javascript
// Create reset.js
const mongoose = require("mongoose");
const User = require("./models/User");

require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected...");
  User.deleteMany({}).then(() => {
    console.log("✅ All users deleted");
    process.exit(0);
  });
});
```

Run:

```bash
node reset.js
```

---

## Performance Testing

### Load Test OTP Endpoint:

```bash
npm install -g autocannon
```

```bash
autocannon -c 10 -d 30 -p 10 http://localhost:5000
```

---

## Final Verification

After all tests pass, your application should:

✅ Send OTP emails successfully
✅ Verify OTP correctly
✅ Create verified users in database
✅ Allow login after verification
✅ Prevent login before verification
✅ Support Google OAuth
✅ Preserve login state with tokens
✅ Handle all error cases gracefully

---

**Ready to test?** Start with Test 1: Email OTP Signup! 🚀
