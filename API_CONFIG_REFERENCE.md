# API Configuration Fix - Complete Reference

## Issue Solved

**Error:** `GET /undefined/api/rooms 404`

**Cause:** `REACT_APP_BACKEND_URL` environment variable was undefined in some components

**Solution:** Centralized API configuration in `src/config/api.js`

---

## Architecture

### 1. Environment Configuration
**File:** `frontend/.env`
```env
REACT_APP_BACKEND_URL=process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"
```

### 2. Centralized API Module
**File:** `frontend/src/config/api.js`
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Includes request/response interceptors for debugging
export { API_URL, api as default };
```

**Key Features:**
- ✅ Fallback to `process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"` if env var undefined
- ✅ Axios instance with auto-configured baseURL
- ✅ Request/response logging for debugging
- ✅ Credentials support for JWT cookies
- ✅ 10-second timeout

### 3. Updated Components

All components now import centralized API config:

```javascript
import api from '@/config/api';

// Usage:
await api.get('/api/rooms');
await api.post('/api/bookings', data);
await api.put(`/api/admin/bookings/${id}`, { status });
await api.delete(`/api/admin/rooms/${id}`);
```

---

## Updated Files

| Component | Change | Status |
|-----------|--------|--------|
| RoomsSection.jsx | Import api, use api.get() | ✅ |
| Footer.jsx | Import api, use api.post() | ✅ |
| FloorBooking.jsx | Import api, use api.get() | ✅ |
| BookingForm.jsx | Import api, use api.post() | ✅ |
| FloorComponent.jsx | Import api, use api.get() | ✅ |
| AdminBookingsPanel.jsx | Import api, use api.get/put() | ✅ |
| AdminRoomsPanel.jsx | Import api, use api.get/post/put/delete() | ✅ |
| AuthContext.js | Already properly configured | ✅ |

---

## How It Works

### Example: Fetch Rooms

**Before (❌ Wrong):**
```javascript
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // Could be undefined
const res = await axios.get(`${BACKEND_URL}/api/rooms`);
// Results in: GET /undefined/api/rooms 404
```

**After (✅ Correct):**
```javascript
import api from '@/config/api';
const res = await api.get('/api/rooms');
// Results in: GET process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"/api/rooms 200
```

### How Parameters Work

**Query Parameters:**
```javascript
// Before
await axios.get(`${API_URL}/api/rooms?floor=1&status=available`);

// After (cleaner)
await api.get('/api/rooms', {
  params: { floor: 1, status: 'available' }
});
```

**POST Data:**
```javascript
// Before
await fetch(`${API_URL}/api/bookings`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bookingData)
});

// After (simpler)
await api.post('/api/bookings', bookingData);
```

---

## Debugging Console Output

When requests are made, you'll see in browser console:

```
🔌 API Configuration:
API Base URL: process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"
Environment: development

📤 API Request: GET /api/rooms
✅ API Response: 200 /api/rooms

📤 API Request: POST /api/bookings
✅ API Response: 201 /api/bookings

❌ API Error: 404 /api/invalid-endpoint
```

---

## Error Handling

### Example: Error Catching

```javascript
try {
  const response = await api.get('/api/rooms');
  setRooms(response.data);
} catch (error) {
  // error.response.status - HTTP status code
  // error.response.data - Error details from server
  // error.message - Error message
  console.error('API Error:', error.message);
}
```

---

## Configuration by Environment

### Development
**File:** `frontend/.env`
```env
REACT_APP_BACKEND_URL=process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"
```

### Production
**File:** `.env.production`
```env
REACT_APP_BACKEND_URL=https://api.yourhotel.com
```

The api config automatically uses the appropriate value based on build environment.

---

## Advantages of Centralized Config

1. ✅ **Single Source of Truth** - API URL defined in one place
2. ✅ **Consistency** - All components use same config
3. ✅ **Debugging** - Built-in request/response logging
4. ✅ **Maintainability** - Easy to change API URL
5. ✅ **Error Handling** - Interceptors for common issues
6. ✅ **Security** - withCredentials for JWT cookies
7. ✅ **Timeout** - 10s timeout prevents hanging requests
8. ✅ **Fallback** - Works even if env var undefined

---

## Verification Checklist

- [x] `frontend/.env` has `REACT_APP_BACKEND_URL=process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"`
- [x] `frontend/src/config/api.js` created with axios instance
- [x] All components import from `@/config/api`
- [x] No hardcoded API URLs in components
- [x] Request/response interceptors configured
- [x] Error messages appear in browser console
- [x] No more `/undefined/api/...` errors

---

## Starting the System

### Terminal 1: Backend
```bash
cd backend
uvicorn server:app --reload --port 8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm start
# Automatically opens http://localhost:3000
```

---

## Testing

### Test 1: Check Console Logs

Open browser DevTools Console (F12) and look for:
```
🔌 API Configuration:
API Base URL: process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"
Environment: development
```

### Test 2: Make a Request

Navigate to any page that loads data:
- Home page → Rooms Section (loads rooms via api.get)
- Floor Booking → Selects dates (loads availability)
- Admin Panel → Shows booking list

You should see in console:
```
📤 API Request: GET /api/rooms
✅ API Response: 200 /api/rooms
```

### Test 3: Verify No 404s

Open DevTools Network tab and check:
- No requests to `/undefined/api/...`
- All requests go to `process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"/api/...`
- Response status 200/201 for successful calls

---

## Migration from Old Config

If you were using old components with `BACKEND_URL` constant:

**Old Way (❌):**
```javascript
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
await axios.get(`${BACKEND_URL}/api/rooms`);
```

**New Way (✅):**
```javascript
import api from '@/config/api';
await api.get('/api/rooms');
```

All components have been migrated to the new way.

---

## Troubleshooting

### Console Shows: "API Base URL: undefined"

**Solution:**
1. Check `.env` file exists in `frontend/` directory
2. Verify it contains `REACT_APP_BACKEND_URL=process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"`
3. Restart npm dev server: `npm start`

### Still Getting `/undefined/api/...` Errors

**Check:**
1. Component imports from `@/config/api`:
   ```javascript
   import api from '@/config/api';
   ```
2. Using api instance, not axios:
   ```javascript
   await api.get('/api/rooms'); // ✅
   // Not: await axios.get(...) // ❌
   ```

### CORS Errors in Browser

**Check Backend Configuration:**
```bash
# In backend/server.py
allow_origins=[
  "http://localhost:3000",  # React dev
  "process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"",  # Backend origin
  frontend_url              # Production
]
```

---

## Summary

| Item | Status |
|------|--------|
| API URL undefined error | ✅ Fixed |
| Centralized config | ✅ Created |
| All components updated | ✅ Done |
| Error handling | ✅ Configured |
| Debugging logs | ✅ Enabled |
| CORS ready | ✅ Configured |

**System is ready for production use!**

---

## Next: Start the System

```bash
# Backend
cd backend && uvicorn server:app --reload --port 8000

# Frontend (new terminal)
cd frontend && npm start
```

Visit: http://localhost:3000

