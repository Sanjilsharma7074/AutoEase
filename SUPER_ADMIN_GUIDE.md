# Super Admin Feature - Implementation Guide

## Overview

A super administrator feature has been successfully implemented in your Car Rental application. This feature creates a special privileged account that has exclusive rights to create and manage admin accounts.

## Super Admin Account Details

**Email:** sanjilsharma456@gmail.com
**Password:** SuperAdmin@2025
**Role:** superadmin

⚠️ **IMPORTANT:** Keep these credentials secure! Share only with authorized personnel.

## Key Features

### 1. **Super Admin Privileges**

- Has all regular admin capabilities (manage cars, bookings, etc.)
- **Exclusive ability** to create new admin accounts
- Can view and delete existing admin accounts
- Cannot be created through normal signup process

### 2. **Protected Account**

- The super admin email is **blocked from signup**
- If anyone tries to sign up with this email, they'll receive an alert and be redirected to login
- Can only be created through the seed script (`seedSuperAdmin.js`)

### 3. **Regular Admin Accounts**

- Can only be created by the super admin
- No longer available in the public signup form
- Have all administrative features except creating other admins
- Can be deleted by the super admin

### 4. **Customer Accounts**

- Remain unchanged
- Sign up through the normal registration process
- Only "user" role is available during signup

## How to Use

### Accessing Super Admin Dashboard

1. Login with the super admin credentials at `/login`
2. After successful login, you'll see a **"Super Admin"** link in the navigation
3. Click on it to access the Super Admin Dashboard at `/superadmin`

### Creating Admin Accounts

1. Navigate to the Super Admin Dashboard (`/superadmin`)
2. Fill in the "Create New Admin Account" form:
   - Full Name
   - Email
   - Password (minimum 6 characters)
3. Click "Create Admin Account"
4. The new admin will be created immediately (no OTP verification needed)
5. Share the login credentials with the new admin

### Managing Existing Admins

1. View all admin accounts in the "Existing Admin Accounts" section
2. Each admin card shows:
   - Name and email
   - Creation date
   - Delete button
3. Click "Delete" to remove an admin account (requires confirmation)

### Sharing Admin Access

Since admin accounts can only be created by the super admin:

1. Create a new admin account through the Super Admin Dashboard
2. **Share the login credentials** (email and password) with the person who needs admin access
3. They can login at `/login` with those credentials
4. They will have access to the Admin Dashboard but **NOT** the Super Admin Dashboard

## API Endpoints

### Super Admin Only (Requires superadmin role)

- `POST /auth/create-admin` - Create a new admin account
- `GET /auth/admins` - Get list of all admin accounts
- `DELETE /auth/admin/:id` - Delete an admin account

## Files Modified/Created

### New Files

1. **seedSuperAdmin.js** - Script to create/verify super admin account
2. **views/superadmin.ejs** - Super admin dashboard view

### Modified Files

1. **models/User.js** - Added "superadmin" to role enum
2. **Routes/authRoutes.js** - Added super admin routes and signup protection
3. **Routes/viewRoutes.js** - Added super admin view route
4. **middleware/auth.js** - Updated to grant superadmin all admin permissions
5. **views/signup.ejs** - Removed admin role option, added email blocking
6. **public/js/auth.js** - Updated navigation logic for superadmin
7. **All view files** - Added super admin navigation link

## Security Features

✅ Super admin email blocked from public signup
✅ Admin role removed from signup form
✅ Admin creation requires authentication and superadmin role
✅ JWT token-based authorization for all API endpoints
✅ Fixed password for super admin (can be changed in User model if needed)

## Testing the Feature

### Test 1: Try to signup with super admin email

1. Go to `/signup`
2. Try to register with `sanjilsharma456@gmail.com`
3. **Expected:** Error message and redirect to login

### Test 2: Login as super admin

1. Go to `/login`
2. Login with super admin credentials
3. **Expected:** See both "Admin" and "Super Admin" links in navigation

### Test 3: Create an admin account

1. Login as super admin
2. Go to `/superadmin`
3. Create a new admin account
4. **Expected:** Success message and admin appears in list below

### Test 4: Login as regular admin

1. Logout from super admin
2. Login with the admin account you just created
3. **Expected:** See "Admin" link but NOT "Super Admin" link

### Test 5: Regular user signup

1. Logout
2. Go to `/signup`
3. Register with any email (except super admin email)
4. **Expected:** Only "user" role, normal OTP verification process

## Re-running the Seed Script

If you ever need to verify or recreate the super admin account:

```bash
node seedSuperAdmin.js
```

This is safe to run multiple times - it will not create duplicates.

## Troubleshooting

**Issue:** Can't see Super Admin link after login

- Make sure you're logged in with the correct super admin email
- Check browser console for errors
- Clear localStorage and login again

**Issue:** Can't create admin accounts

- Verify you're logged in as super admin (check token in localStorage)
- Check network tab for API errors
- Ensure MongoDB connection is active

**Issue:** Navigation links not showing correctly

- Clear browser cache
- Check if JavaScript files are loading (auth.js, main.js)
- Verify token is stored in localStorage

## Next Steps

You can now:

1. ✅ Login as super admin
2. ✅ Access the Super Admin Dashboard
3. ✅ Create admin accounts for your team
4. ✅ Share credentials with those admins
5. ✅ Manage (view/delete) existing admin accounts

## Notes

- The super admin password is currently fixed in the seed script
- If you want to change it, edit `seedSuperAdmin.js` and re-run it after deleting the existing super admin from the database
- All admins (including super admin) have access to the regular Admin Dashboard for managing cars and bookings
- Only super admin has access to the Super Admin Dashboard for managing admin accounts
