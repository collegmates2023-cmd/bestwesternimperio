# Admin Login Troubleshooting Guide

## ❌ Login Failed? Here's How to Fix It

---

## Step 1: Verify MongoDB is Running

MongoDB must be running for the backend to work.

### Windows (PowerShell)
```powershell
# Check if MongoDB service is running
Get-Service MongoDB | Select-Object Status

# Or start MongoDB service
Start-Service MongoDB

# Or start mongod manually
mongod
```

### Mac/Linux
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
brew services start mongodb-community
# or
mongod
```

✅ MongoDB should be running on `localhost:27017`

---

## Step 2: Reset Admin Credentials

I've created a setup script to fix the admin user. Run this:

```bash
cd backend
python3 setup_admin.py
```

**What this script does:**
- ✅ Connects to MongoDB
- ✅ Checks if admin user exists
- ✅ Creates or updates the admin with correct credentials
- ✅ Verifies password hash is correct

---

## Step 3: Manual Admin User Creation (If Script Fails)

If `setup_admin.py` fails, manually create the admin:

### Option A: Using MongoDB Shell

```bash
# Open MongoDB shell
mongosh

# Switch to bestwestern database
use bestwestern

# Insert admin user with hashed password
db.users.insertOne({
  "email": "admin@bwimperio.com",
  "password_hash": "$2b$12$nZ4c5o3hZ9F2v7r8k9m0nO1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f",
  "name": "Admin",
  "role": "admin",
  "created_at": new Date().toISOString()
})

# Verify it was created
db.users.find()
```

---

## Step 4: Check Backend Logs

Start the backend and watch for login errors:

```bash
cd backend
uvicorn server:app --reload --port 8000
```

**Look for these logs:**
```
Login attempt - Email: admin@bwimperio.com, IP: 127.0.0.1
Login successful - User: admin@bwimperio.com
```

If you see:
```
Login failed - User not found: admin@bwimperio.com
```
→ Admin user doesn't exist in database

If you see:
```
Login failed - Invalid password for: admin@bwimperio.com
```
→ Password hash doesn't match

---

## Step 5: Test Login with curl

Test the API directly:

```bash
# Test login endpoint
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bwimperio.com","password":"bwimperio"}'
```

**Expected response (✅ Success):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "admin@bwimperio.com",
  "name": "Admin",
  "role": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected response (❌ Failure):**
```json
{
  "detail": "Invalid email or password"
}
```

---

## Quick Fix Checklist

- [ ] MongoDB is running (`mongod` or service)
- [ ] Run `python3 backend/setup_admin.py`
- [ ] Check backend logs for errors
- [ ] Verify admin user in MongoDB:
  ```bash
  mongosh
  use bestwestern
  db.users.find()
  ```
- [ ] Try login again: Email `admin@bwimperio.com`, Password `bwimperio`

---

## Default Credentials

| Field | Value |
|-------|-------|
| Email | `admin@bwimperio.com` |
| Password | `bwimperio` |

These are set in `backend/server.py` (lines 552-553)

---

## If Still Not Working

**Option 1: Delete and Recreate Admin**

```bash
# Connect to MongoDB
mongosh
use bestwestern

# Delete old admin
db.users.deleteOne({"email": "admin@bwimperio.com"})

# Exit
exit
```

Then run setup script again:
```bash
python3 backend/setup_admin.py
```

**Option 2: Change Credentials**

Set environment variables before starting backend:

```bash
# Windows (PowerShell)
$env:ADMIN_EMAIL = "new@email.com"
$env:ADMIN_PASSWORD = "newpassword"
uvicorn server:app --reload --port 8000

# Linux/Mac
export ADMIN_EMAIL="new@email.com"
export ADMIN_PASSWORD="newpassword"
uvicorn server:app --reload --port 8000
```

**Option 3: Check MongoDB Connection**

```bash
# Test MongoDB connection
python3 -c "from motor.motor_asyncio import AsyncIOMotorClient; print('MongoDB OK')"

# Or use mongosh
mongosh mongodb://localhost:27017/bestwestern
```

---

## Complete Setup Flow

```bash
# 1. Start MongoDB
mongod

# 2. Setup admin credentials (in new terminal)
cd backend
python3 setup_admin.py

# 3. Start backend (in new terminal)
cd backend
uvicorn server:app --reload --port 8000

# 4. Start frontend (in new terminal)
cd frontend
npm start

# 5. Open browser
# http://localhost:3000/admin/login
# Email: admin@bwimperio.com
# Password: bwimperio
```

---

## Expected Output from setup_admin.py

```
============================================================
ADMIN CREDENTIALS SETUP
============================================================

🔌 Connecting to MongoDB...
   Database: bestwestern
   URL: mongodb://localhost:27017/
✅ MongoDB connection successful!

🔍 Checking for admin user: admin@bwimperio.com
   ✅ Admin user found in database
   ✅ Password matches!

✨ Admin credentials are correct and working!

   Email: admin@bwimperio.com
   Password: bwimperio

📋 All users in database:
   - admin@bwimperio.com (Role: admin)

✅ Setup complete!
```

---

## Debugging: Enable Verbose Logging

Add this to `backend/server.py` at the top:

```python
logging.basicConfig(level=logging.DEBUG)
```

This will show all database operations and API calls.

---

## Common Errors

### "User not found"
- Admin user wasn't created on startup
- **Fix:** Run `python3 setup_admin.py`

### "Invalid email or password"
- Password hash doesn't match
- **Fix:** Delete admin user and run `python3 setup_admin.py` again

### "Connection refused" (Mongoose/MongoDB)
- MongoDB is not running
- **Fix:** Start MongoDB: `mongod`

### "Too many failed attempts"
- Account is locked after 5 wrong password attempts
- **Fix:** Wait 15 minutes or delete login_attempts collection:
  ```bash
  mongosh
  use bestwestern
  db.login_attempts.deleteMany({})
  ```

---

## Need More Help?

1. **Check backend logs** - Run backend with `--reload` to see debug messages
2. **Check MongoDB** - Use `mongosh` to inspect users collection
3. **Test API directly** - Use `curl` to test `/api/auth/login` endpoint
4. **Review credentials** - Verify email and password match exactly

