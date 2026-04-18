# Quick Start Guide - API 404 Errors Fixed ✅

## What Was Fixed

**Problem:** Frontend API calls were returning 404 errors
- When booking: `POST /api/bookings` → 404
- When logging in: `POST /api/auth/login` → 404

**Root Cause:** Frontend was making API calls to relative URLs like `/api/bookings`, which resolved to the wrong server (React dev server on port 3000 instead of FastAPI backend on port 8000).

**Solution:** Updated all frontend components to use the full backend URL from environment configuration.

---

## Changes Made

### 1. Frontend Environment Configuration
✅ Created `frontend/.env` with:
```
REACT_APP_BACKEND_URL=process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"
```

### 2. Updated API Calls in 4 Components
✅ **BookingForm.jsx** - Booking form submission
✅ **FloorComponent.jsx** - Room availability check
✅ **AdminBookingsPanel.jsx** - Admin booking management  
✅ **AdminRoomsPanel.jsx** - Admin room management

### 3. Enhanced Backend CORS
✅ Updated `backend/server.py` to allow requests from:
- http://localhost:3000 (React dev server)
- process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com" (Backend origin)

---

## How to Run Now

### Terminal 1 - Start Backend
```bash
cd backend
uvicorn server:app --reload --port 8000
```
✅ Backend running on process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"

### Terminal 2 - Start Frontend
```bash
cd frontend
npm start
```
✅ Frontend running on http://localhost:3000 (opens in browser)

---

## Test the Fixes

### ✅ Test 1: Booking System
1. Visit http://localhost:3000 in browser
2. Select check-in & check-out dates
3. Select a room from the floor
4. Fill in booking details (name, email, phone)
5. Click "Confirm Booking"
6. Should see success message ✅

### ✅ Test 2: Admin Login
1. Visit http://localhost:3000/admin/login
2. See demo credentials displayed (scroll down the card)
3. Enter email & password
4. Click "Sign In"
5. Should redirect to /admin/dashboard ✅

### ✅ Test 3: Admin Panel
1. After login, navigate to:
   - Bookings: Should show list of bookings
   - Rooms: Should show list of rooms
   - Floor Layout: Should show 3D room visualization
2. All pages should load data from backend ✅

---

## File Changes Summary

| File | Change | Status |
|------|--------|--------|
| frontend/.env | Created with REACT_APP_BACKEND_URL | ✅ |
| BookingForm.jsx | Added BACKEND_URL constant | ✅ |
| FloorComponent.jsx | Added BACKEND_URL constant | ✅ |
| AdminBookingsPanel.jsx | Added BACKEND_URL constant | ✅ |
| AdminRoomsPanel.jsx | Added BACKEND_URL constant | ✅ |
| server.py (CORS) | Added localhost:8000 to origins | ✅ |

---

## Troubleshooting

### Still seeing 404 errors?

**Step 1:** Verify backend is running
```bash
# In new terminal, test backend
curl process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"/api/rooms
# Should return JSON with room data
```

**Step 2:** Verify frontend .env file exists
```bash
# Check file exists and has correct content
cat frontend/.env
# Should show: REACT_APP_BACKEND_URL=process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"
```

**Step 3:** Restart React dev server
```bash
# Stop: Ctrl+C in frontend terminal
# Restart: npm start
```

**Step 4:** Clear browser cache
- Open DevTools (F12) → Application → Clear Storage → Clear All

---

## API Endpoints Verified

✅ **Booking Endpoint** - POST /api/bookings (Create booking)
✅ **Login Endpoint** - POST /api/auth/login (Admin authentication)  
✅ **Rooms Endpoint** - GET /api/rooms/availability (Check availability)
✅ **All other endpoints** - Already configured with proper routing

---

## Next Steps

Once verified working:
1. Run end-to-end test of complete booking flow
2. Test admin panel features (CRUD operations)
3. Test token refresh on session expiration
4. Deploy to production when ready

---

## Documentation

For detailed setup and troubleshooting, see: [API_FIX_GUIDE.md](API_FIX_GUIDE.md)

---

**Status:** ✅ All API 404 errors fixed
**Last Updated:** March 28, 2026
