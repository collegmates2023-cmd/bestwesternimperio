# API 404 Error Fix - Complete Setup Guide

## Problem Analysis

The hotel booking system was experiencing **404 errors** on API endpoints:
- ❌ `POST /api/bookings` → 404
- ❌ `POST /api/auth/login` → 404

### Root Cause
Frontend components were making API calls to **relative URLs** like `/api/bookings`, which resolved to the **wrong server** (React dev server on port 3000 instead of FastAPI backend on port 8000).

---

## Solution Implemented

### 1. Created Frontend Environment Configuration
**File:** `frontend/.env`
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

This tells the React app where the backend API is located.

### 2. Fixed All API Calls in Frontend Components

#### 2.1 BookingForm.jsx
**Issue:** Using relative URL `fetch('/api/bookings')`
**Fix:** Now uses `fetch('${BACKEND_URL}/api/bookings')`

#### 2.2 FloorComponent.jsx  
**Issue:** Using relative URL `/api/rooms/availability`
**Fix:** Now uses `${BACKEND_URL}/api/rooms/availability`

#### 2.3 AdminBookingsPanel.jsx
**Issues:** Multiple relative URLs for admin booking operations
**Fixes:**
- `fetch('/api/admin/bookings')` → `fetch('${BACKEND_URL}/api/admin/bookings')`
- `fetch('/api/bookings/{id}/cancel')` → `fetch('${BACKEND_URL}/api/bookings/{id}/cancel')`
- `fetch('/api/admin/bookings/{id}')` → `fetch('${BACKEND_URL}/api/admin/bookings/{id}')`

#### 2.4 AdminRoomsPanel.jsx
**Issues:** Multiple relative URLs for admin room operations
**Fixes:**
- `fetch('/api/admin/rooms')` → `fetch('${BACKEND_URL}/api/admin/rooms')`
- `fetch('/api/admin/rooms/{id}/status')` → `fetch('${BACKEND_URL}/api/admin/rooms/{id}/status')`
- `fetch('/api/admin/rooms/{id}')` → `fetch('${BACKEND_URL}/api/admin/rooms/{id}')`

### 3. Enhanced Backend CORS Configuration
**File:** `backend/server.py` (CORS Middleware)

**Updated:** Added `http://localhost:8000` to allowed origins
```python
allow_origins=[frontend_url, "http://localhost:3000", "http://localhost:8000"]
```

This allows:
- ✅ Production domain (from `FRONTEND_URL` env var)
- ✅ React dev server (`http://localhost:3000`)
- ✅ Backend development server (`http://localhost:8000`)

### 4. Created .env.example Files
- **backend/.env.example** - Shows required backend configuration
- **frontend/.env** - Frontend environment variables

---

## How to Run the System

### Prerequisites
- Python 3.11+
- Node.js 16+
- MongoDB running on `localhost:27017`

### Step 1: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create/verify .env file
# Ensure MONGO_URL and JWT_SECRET are set
cat .env

# Start the FastAPI backend server
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend should be running on `http://localhost:8000`

### Step 2: Setup Frontend

```bash
# Navigate to frontend directory (in new terminal)
cd frontend

# Install Node dependencies
npm install

# Start React development server
npm start
```

✅ Frontend should be running on `http://localhost:3000`
✅ Auto-opens browser to http://localhost:3000

### Step 3: Test the Integration

1. **Test Booking:**
   - Visit http://localhost:3000
   - Select check-in/check-out dates
   - Select a room
   - Submit booking form
   - Should create booking ✅

2. **Test Admin Login:**
   - Visit http://localhost:3000/admin/login
   - Use demo credentials (shown in the form)
   - Login should work ✅
   - Should redirect to /admin/dashboard

3. **Test Admin Panel:**
   - Navigate to Bookings, Rooms, Floor Layout
   - Check that data loads from backend ✅
   - Try creating/updating/deleting items

---

## API Endpoint Verification

### Backend Routes in FastAPI

All endpoints are prefixed with `/api`:

#### Authentication
- ✅ `POST /api/auth/login` - User login
- ✅ `GET /api/auth/me` - Get current user
- ✅ `POST /api/auth/logout` - Logout
- ✅ `POST /api/auth/refresh` - Refresh token

#### Bookings (Public)
- ✅ `POST /api/bookings` - Create booking
- ✅ `GET /api/bookings/{id}` - Get booking
- ✅ `GET /api/bookings/email/{email}` - Get user's bookings
- ✅ `PUT /api/bookings/{id}/cancel` - Cancel booking

#### Bookings (Admin)
- ✅ `GET /api/admin/bookings` - List all bookings
- ✅ `PUT /api/admin/bookings/{id}` - Update booking
- ✅ `DELETE /api/admin/bookings/{id}` - Delete booking

#### Rooms (Public)
- ✅ `GET /api/rooms` - List all rooms
- ✅ `GET /api/rooms/availability` - Check availability for dates
- ✅ `GET /api/floors` - Get floor information

#### Rooms (Admin)
- ✅ `GET /api/admin/rooms` - List all rooms
- ✅ `POST /api/admin/rooms` - Create room
- ✅ `PUT /api/admin/rooms/{id}` - Update room
- ✅ `PUT /api/admin/rooms/{id}/status` - Update room status
- ✅ `DELETE /api/admin/rooms/{id}` - Delete room

#### Dashboard/Settings
- ✅ `GET /api/admin/dashboard` - Dashboard stats
- ✅ `GET /api/admin/settings` - Get settings
- ✅ `PUT /api/admin/settings` - Update settings

#### Other
- ✅ `POST /api/contact` - Contact form submission
- ✅ `GET /api/rooms/{id}` - Get room details
- ✅ `PUT /api/customers/{id}` - Update customer info

---

## Components Using BACKEND_URL

The following frontend components now properly use the `BACKEND_URL` environment variable:

1. ✅ **FloorBooking.jsx** - Fetches floors data
2. ✅ **FloorComponent.jsx** - Checks room availability
3. ✅ **BookingForm.jsx** - Creates bookings
4. ✅ **AdminBookingsPanel.jsx** - Admin booking management
5. ✅ **AdminRoomsPanel.jsx** - Admin room management
6. ✅ **Footer.jsx** - Contact form submissions
7. ✅ **RoomsSection.jsx** - Display available rooms

Admin pages using `adminApi` (AuthContext) also use the BACKEND_URL:
8. ✅ **Dashboard.jsx** - Loads dashboard stats
9. ✅ **BookingManagement.jsx** - Manage bookings
10. ✅ **RoomManagement.jsx** - Manage rooms
11. ✅ **FloorLayout.jsx** - Visual room status
12. ✅ **Settings.jsx** - App settings

---

## Troubleshooting

### Issue: Still Getting 404 Errors

**Check:**
1. Is backend running on port 8000?
   ```bash
   # In new terminal
   curl http://localhost:8000/api/rooms
   ```
   Should return JSON response ✅

2. Is frontend using correct BACKEND_URL?
   ```bash
   # Check frontend/.env
   cat frontend/.env
   # Should show: REACT_APP_BACKEND_URL=http://localhost:8000
   ```

3. Restart React dev server after creating .env:
   ```bash
   npm start
   ```

### Issue: CORS Errors

**Solution:** Backend now allows these origins:
- ✅ http://localhost:3000 (React dev)
- ✅ http://localhost:8000 (Backend origin)
- ✅ Your production domain (from FRONTEND_URL env var)

If you still see CORS errors, verify backend/server.py has the updated CORS middleware.

### Issue: Bookings Not Saving

**Check:**
1. MongoDB is running: `mongosh` should connect
2. Database exists: Check `bestwestern` database
3. Backend logs show POST `/api/bookings` received ✅

### Issue: Admin Login Not Working

**Check:**
1. Backend auth endpoints working:
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@hotel.com", "password": "123456"}'
   ```

2. Demo credentials displayed in AdminLogin.jsx form

3. Check browser cookies in DevTools → Application → Cookies
   - Should have `access_token` and `refresh_token` after login ✅

---

## Production Deployment

When deploying to production:

1. **Update frontend/.env:**
   ```env
   # Instead of localhost
   REACT_APP_BACKEND_URL=https://api.yourdomain.com
   ```

2. **Update backend/.env:**
   ```env
   FRONTEND_URL=https://yourdomain.com
   JWT_SECRET=very-secure-secret-key-here
   MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
   ```

3. **Build React for production:**
   ```bash
   npm run build
   # Creates optimized build/ folder
   ```

4. **Run FastAPI with production server:**
   ```bash
   # Using gunicorn (install: pip install gunicorn)
   gunicorn backend.server:app -w 4 -b 0.0.0.0:8000
   ```

---

## Summary of Fixes

| Component | Before | After | Status |
|-----------|--------|-------|--------|
| BookingForm | `/api/bookings` ❌ | `${BACKEND_URL}/api/bookings` ✅ | Fixed |
| FloorComponent | `/api/rooms/availability` ❌ | `${BACKEND_URL}/api/rooms/availability` ✅ | Fixed |
| AdminBookingsPanel | `/api/admin/bookings` ❌ | `${BACKEND_URL}/api/admin/bookings` ✅ | Fixed |
| AdminRoomsPanel | `/api/admin/rooms` ❌ | `${BACKEND_URL}/api/admin/rooms` ✅ | Fixed |
| Backend CORS | Limited origins | Localhost + Production ✅ | Enhanced |
| Frontend Config | No .env file ❌ | .env with BACKEND_URL ✅ | Created |

---

## Testing Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000  
- [ ] frontend/.env has correct BACKEND_URL
- [ ] MongoDB is accessible
- [ ] Booking form submits successfully
- [ ] Admin login works with demo credentials
- [ ] Admin panel pages load data
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows API calls to http://localhost:8000

---

## Next Steps

Once API issues are resolved, consider:
1. Running end-to-end tests
2. Testing payment integration (Razorpay)
3. Email notification testing
4. Performance optimization
5. Deploy to production environment

---

**Last Updated:** March 28, 2026
**System:** Best Western Imperio Hotel Booking System
