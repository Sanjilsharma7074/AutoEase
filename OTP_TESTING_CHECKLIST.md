# OTP Testing Checklist

## Pre-Deployment Testing (Local)

### 1. Test Signup Flow (Email Fails)
**Scenario:** Email service not configured

**Steps:**
1. Remove/comment out `EMAIL_USER` in `.env`
2. Go to `http://localhost:5000/signup`
3. Fill form and submit
4. **Expected:** Error message "Failed to send OTP email"
5. Check MongoDB → User should NOT exist
6. Try signing up again with same email
7. **Expected:** Should work (no "email already registered" error)

### 2. Test Signup Flow (Email Succeeds)
**Scenario:** Email service properly configured

**Steps:**
1. Configure email in `.env`:
   ```
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```
2. Restart server
3. Go to signup page
4. Fill form and submit
5. **Expected:** 
   - "OTP sent to your email"
   - Check email for OTP
   - Check MongoDB → User exists with `emailVerified: false`
6. Enter OTP on verification page
7. **Expected:** Login successful, redirect to home
8. Check MongoDB → `emailVerified: true`

### 3. Test Duplicate Email (Already Verified)
**Steps:**
1. Sign up with new email and verify OTP
2. Logout
3. Try to sign up again with same email
4. **Expected:** "Email already registered and verified. Please login."

### 4. Test OTP Expiry
**Steps:**
1. Sign up with new email
2. Wait 10+ minutes (or manually set `otpExpiry` to past date in DB)
3. Try to enter OTP
4. **Expected:** "OTP expired. Please signup again."
5. Sign up again with same email
6. **Expected:** Old user deleted, new user created with new OTP

### 5. Test Resend OTP
**Steps:**
1. Sign up with new email
2. On verify page, click "Resend OTP"
3. **Expected:** New OTP sent
4. Check email for new OTP
5. Enter new OTP
6. **Expected:** Verification successful

## Post-Deployment Testing (Render)

### Environment Check
```bash
# Check Render logs after deployment
# Look for:
✅ "MongoDB connected"
✅ "Server running on PORT : 10000"
✅ "SMTP connection verified successfully" (on first signup)
```

### 1. Test Live Signup
**URL:** `https://your-app.onrender.com/signup`

**Steps:**
1. Open signup page
2. Enter details with REAL email you can check
3. Click "Sign Up"
4. **Expected:** 
   - Loading message: "Sending OTP, please wait... This may take up to 30 seconds"
   - Wait patiently (15-30 seconds)
   - Success message or error

**If Success:**
- Check email (inbox + spam folder)
- Enter OTP on verification page
- Should redirect to home page as logged-in user

**If "Failed to send OTP":**
- Check Render logs
- Verify environment variables in Render dashboard
- For Gmail: Check 2FA and App Password
- For SendGrid: Check API key and verified sender

### 2. Test Timeout Handling
**Steps:**
1. Deliberately misconfigure email (wrong password)
2. Try to sign up
3. **Expected:** 
   - Loading for ~30 seconds
   - Error message: "Failed to send OTP email"
   - User NOT created in database
   - Can retry without "email already registered" error

### 3. Test Cleanup Endpoint
**Via Browser/Postman:**
```bash
POST https://your-app.onrender.com/auth/cleanup-expired-users
```

**Expected Response:**
```json
{
  "message": "Successfully cleaned up X expired unverified users",
  "count": X
}
```

### 4. Test Multiple Providers (If Configured)
**Gmail Signup:**
- Should work if `EMAIL_USER` and `EMAIL_PASSWORD` set

**SendGrid Signup:**
- Should work if `SENDGRID_API_KEY` and `EMAIL_USER` set
- Takes priority over Gmail if both configured

## Monitoring Checklist

### Watch Render Logs For:

**Good Signs:**
```
✅ SMTP connection verified successfully
✅ OTP sent successfully to user@example.com
✅ User created successfully: user@example.com
```

**Bad Signs:**
```
❌ OTP email send failed: Invalid login
❌ SMTP verification failed: Connection timeout
❌ Error creating user: email already registered
```

### MongoDB Checks

**Query unverified users:**
```javascript
db.users.find({ 
  emailVerified: false,
  otpExpiry: { $lt: new Date() }
})
```

**Should be:** Empty or very few (auto-cleaned after 10 min)

**Query verified users:**
```javascript
db.users.find({ emailVerified: true })
```

**Should have:** All successfully verified users

## Success Criteria

- [ ] Signup with valid email works on live site
- [ ] OTP received in email within 30 seconds
- [ ] OTP verification works
- [ ] Failed OTP send doesn't create user in DB
- [ ] Can retry signup after failed OTP send
- [ ] Expired unverified users auto-deleted
- [ ] No "email already registered" errors for failed signups
- [ ] Timeout messages are clear and helpful
- [ ] Logs show successful SMTP connections

## Performance Benchmarks

**Expected Timings:**
- Local signup: 2-5 seconds
- Render signup (Gmail): 10-20 seconds
- Render signup (SendGrid): 5-15 seconds
- OTP verification: <1 second
- Cleanup endpoint: <1 second

**If Slower:**
- Check email service status
- Check Render logs for errors
- Verify network connectivity
- Consider switching to SendGrid (faster)

## Troubleshooting Commands

**Check Render environment variables:**
```bash
# In Render Dashboard → Your Service → Environment
Look for: SENDGRID_API_KEY or EMAIL_USER + EMAIL_PASSWORD
```

**Test email locally:**
```bash
node -e "
const { sendOTPEmail } = require('./services/emailService');
sendOTPEmail('your.email@example.com', '123456')
  .then(() => console.log('✅ Email sent!'))
  .catch(err => console.error('❌ Failed:', err.message));
"
```

**Check MongoDB for orphaned users:**
```javascript
// In MongoDB Compass or Mongo Shell
db.users.find({
  emailVerified: false,
  createdAt: { $lt: new Date(Date.now() - 20*60*1000) } // older than 20 min
}).count()
```

**Manual cleanup (if needed):**
```javascript
db.users.deleteMany({
  emailVerified: false,
  otpExpiry: { $lt: new Date() }
})
```

## Emergency Rollback

If something goes wrong:

```bash
git revert HEAD
git push origin main
```

Or deploy previous working commit:
```bash
git log --oneline  # Find previous commit
git checkout <commit-hash>
git push origin main --force
```

## Support Contacts

**Gmail Issues:**
- https://support.google.com/accounts/answer/185833
- Check App Passwords: https://myaccount.google.com/apppasswords

**SendGrid Issues:**
- https://sendgrid.com/docs/
- Check Activity Feed in SendGrid Dashboard

**Render Issues:**
- https://render.com/docs
- Check Render Status: https://status.render.com/

---

## Final Verification

After deployment, run through this 5-minute test:

1. ✅ Visit live site `/signup`
2. ✅ Enter details and submit
3. ✅ Wait for "OTP sent" message (max 30s)
4. ✅ Check email for OTP
5. ✅ Enter OTP and verify
6. ✅ Redirected to home as logged-in user
7. ✅ Try to signup again with same email → "Email already registered"
8. ✅ Check Render logs for success messages

**If all ✅ → You're good to go! 🎉**

**If any ❌ → Check [OTP_FIX_GUIDE.md](OTP_FIX_GUIDE.md) troubleshooting section**
