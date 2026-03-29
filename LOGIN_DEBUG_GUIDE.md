# Admin Login - Debugging & Fix Guide

## ✅ What Was Fixed

1. **Added API URL fallback** in AuthContext.js
   - Now: `const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';`
   - This ensures login works even if environment variable is undefined

2. **Added comprehensive logging** to help debug issues
   - API configuration logs
   - Login attempt logs
   - Error details logging

3. **Improved error handling** to show actual error messages

---

## 🚀 How to Test Login

### Step 1: Ensure MongoDB is Running
```bash
mongod
# Or if service: Start-Service MongoDB
```

### Step 2: Verify Admin User Exists
```bash
python3 backend/setup_admin.py
```

### Step 3: Start Backend
```bash
cd backend
uvicorn server:app --reload --port 8000
```

### Step 4: Start Frontend
```bash
cd frontend
npm start
```

**IMPORTANT:** After updating `.env`, you MUST restart `npm start` for changes to take effect!

### Step 5: Open Browser & Check Console
1. Visit: http://localhost:3000/admin/login
2. Open DevTools: **F12** → **Console** tab
3. You should see:
   ```
   🔌 API Configuration:
   API Base URL: http://localhost:8000
   Environment: development
   
   🔐 AuthContext: API URL = http://localhost:8000
   ```

### Step 6: Try Login
- Email: `admin@bwimperio.com`
- Password: `bwimperio`

### Step 7: Check Console Logs

**If ✅ Success:**
```
🔑 Logging in as: admin@bwimperio.com
📡 Calling: http://localhost:8000/api/auth/login
✅ Login successful! { id: '...', email: 'admin@bwimperio.com', ... }
✅ Login successful, redirecting to dashboard
```

**If ❌ Fails:**
```
❌ Login failed:
   Error: Invalid email or password
   Status: 401
   URL attempted: http://localhost:8000/api/auth/login
```

---

## 🔍 Troubleshooting Steps

### Issue 1: "API Base URL: undefined"

**Problem:** Environment variable not loaded

**Solution:**
```bash
# Make sure frontend/.env exists
cat frontend/.env

# Output should be:
# REACT_APP_BACKEND_URL=http://localhost:8000

# Then RESTART npm:
npm start
```

### Issue 2: API Base URL is localhost:3000

**Problem:** Wrong port being used

**Solution:**
```bash
# Check .env file
cat frontend/.env

# Should show:
# REACT_APP_BACKEND_URL=http://localhost:8000

# If wrong, it will call localhost:3000 instead!
# Fix it and RESTART npm start
```

### Issue 3: "Invalid email or password"

**Problem:** Admin user doesn't exist or password is wrong

**Solution:**
```bash
python3 backend/setup_admin.py

# Should output:
# ✨ Admin credentials are correct and working!
# Email: admin@bwimperio.com
# Password: bwimperio
```

### Issue 4: "404 Not Found"

**Problem:** Backend is not running or wrong port

**Solution:**
```bash
# Check if backend is running
curl http://localhost:8000/api/rooms

# If connected, you'll get JSON response
# If not: Start backend with:
cd backend
uvicorn server:app --reload --port 8000
```

### Issue 5: CORS Errors

**Problem:** Backend doesn't allow requests from localhost:3000

**Verify CORS is configured:**
```bash
# In backend/server.py, you should see:
allow_origins=[
  frontend_url,           # Production
  "http://localhost:3000",  # React dev  ✅
  "http://localhost:8000"   # Backend
]
```

---

## 📋 Complete Diagnostic Checklist

- [ ] MongoDB is running: `mongod`
- [ ] `frontend/.env` has `REACT_APP_BACKEND_URL=http://localhost:8000`
- [ ] Backend is running on port 8000
- [ ] Frontend console shows: "API Base URL: http://localhost:8000"
- [ ] Admin user exists: Run `python3 backend/setup_admin.py`
- [ ] No network error in DevTools (Check Network tab)
- [ ] Browser shows admin login page with demo credentials
- [ ] Entered email: `admin@bwimperio.com`
- [ ] Entered password: `bwimperio`

---

## 🧪 Test with curl

Test the login endpoint directly:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bwimperio.com","password":"bwimperio"}'
```

**Expected Response (✅ Success):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "admin@bwimperio.com",
  "name": "Admin",
  "role": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response (❌ Failure):**
```json
{
  "detail": "Invalid email or password"
}
```

---

## 📊 Console Output Guide

### Configuration (Startup)
```
🔌 API Configuration:
API Base URL: http://localhost:8000
Environment: development

🔐 AuthContext: API URL = http://localhost:8000
```

### Login Attempt
```
📝 Login attempt: { email: 'admin@bwimperio.com', password: '***' }
🔑 Logging in as: admin@bwimperio.com
📡 Calling: http://localhost:8000/api/auth/login
```

### Backend Response
```
✅ Login successful! { id: '...', email: 'admin@bwimperio.com', name: 'Admin', role: 'admin', ... }
✅ Login successful, redirecting to dashboard
```

### Error Cases
```
❌ Login failed:
   Error: Invalid email or password
   Status: 401
   Data: { detail: 'Invalid email or password' }
   URL attempted: http://localhost:8000/api/auth/login
```

---

## 🎯 Quick Fix Summary

**All 3 terminals should be running:**

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Backend
cd backend
uvicorn server:app --reload --port 8000

# Terminal 3: Frontend
cd frontend
npm start
```

**Then test:**
1. http://localhost:3000/admin/login
2. Open DevTools Console (F12)
3. Look for logs showing API URL = http://localhost:8000
4. Login with: admin@bwimperio.com / bwimperio
5. Check console for success or error logs
6. If success, redirects to /admin/dashboard

---

## 🔧 Advanced Debugging

### Check Axios Instance
In browser console:
```javascript
// This will show if API is configured correctly
fetch('http://localhost:8000/api/rooms')
  .then(r => r.json())
  .then(d => console.log('Backend OK:', d))
  .catch(e => console.log('Backend ERROR:', e))
```

### Check Environment Variables
In browser console:
```javascript
console.log(process.env.REACT_APP_BACKEND_URL)
// Should output: http://localhost:8000
```

### Check MongoDB
```bash
mongosh
use bestwestern
db.users.find()
# Should show admin user
```

### Check Backend Logs
When you start backend, you should see:
```
INFO:     Application startup complete
INFO:     Uvicorn running on http://0.0.0.0:8000
```

And when login attempt is made:
```
INFO:     POST /api/auth/login HTTP/1.1" 200
INFO:     Login successful - User: admin@bwimperio.com
```

---

## ✨ Login Flow

```
1. User enters credentials in AdminLogin.jsx
   ↓
2. handleSubmit() calls login(email, password)
   ↓
3. AuthContext.login() makes API call:
   POST http://localhost:8000/api/auth/login
   ↓
4. Backend receives request and checks credentials:
   - Looks up user in MongoDB
   - Verifies password hash
   - Generates JWT token
   ↓
5. Backend returns token and user data
   ↓
6. AuthContext stores user in state
   ↓
7. navigate("/admin/dashboard")
   ↓
8. ProtectedRoute allows access to dashboard
   ↓
9. Dashboard loads and shows admin content
```

---

## 📚 Related Files

- Frontend config: `frontend/src/config/api.js`
- Auth context: `frontend/src/contexts/AuthContext.js`
- Login page: `frontend/src/pages/admin/AdminLogin.jsx`
- Environment: `frontend/.env`
- Backend auth: `backend/server.py` (lines 112-156)
- Setup script: `backend/setup_admin.py`

---

**If you're still seeing the 404 error, follow the checklist above and check the browser console logs. The new logging will tell you exactly what's wrong!**

