# Production Deployment Guide

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│      Frontend (React + Vercel)      │
│  Deployed at: vercel.com            │
└──────────────┬──────────────────────┘
               │ HTTPS API calls
               │ CORS enabled
               ▼
┌─────────────────────────────────────┐
│   Backend (FastAPI + MongoDB)       │
│  Deployed at: Render.com            │
└─────────────────────────────────────┘
```

---

## 📋 Prerequisites

### Backend Requirements
- FastAPI ✅ (server.py)
- Python 3.10+ ✅
- requirements.txt ✅
- MongoDB database ✅
- Environment variables (.env)

### Frontend Requirements
- React 18.2.0 ✅
- package.json ✅
- Environment variables

---

## ⚙️ Step 1: Prepare Backend for Deployment

### 1.1 Verify server.py listens on 0.0.0.0

Current configuration in `backend/server.py`:
```python
app = FastAPI()

# CORS already configured
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000", "http://localhost:8000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

✅ **Status:** Correctly configured for deployment

### 1.2 Create `.env` file (backend)

```bash
cd backend
cat > .env << EOF
MONGO_URL=your_mongodb_connection_string
DB_NAME=imperio
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
ADMIN_EMAIL=admin@bwimperio.com
ADMIN_PASSWORD=bwimperio
FRONTEND_URL=https://your-frontend-domain.vercel.app
EOF
```

**Key Variables:**
- `MONGO_URL`: MongoDB Atlas connection string
- `DB_NAME`: Database name (imperio)
- `JWT_SECRET`: Generate a strong secret: `openssl rand -hex 32`
- `FRONTEND_URL`: Your Vercel deployment URL

### 1.3 Verify requirements.txt

✅ Your requirements.txt already has:
- fastapi==0.135.2
- uvicorn==0.42.0
- motor==3.7.1
- python-dotenv==1.2.2
- PyJWT==2.12.1
- And all other dependencies

---

## 🚀 Step 2: Deploy Backend to Render.com

### 2.1 Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended)
3. Connect your repository

### 2.2 Create New Web Service

1. **Dashboard** → **New +** → **Web Service**
2. **Connect Repository:** Select your GitHub repo
3. **Configuration:**
   - **Name:** `imperio-backend`
   - **Environment:** `Python 3`
   - **Region:** `Ohio` (or closest to you)
   - **Branch:** `main`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && uvicorn server:app --host 0.0.0.0 --port 10000`

### 2.3 Add Environment Variables

In Render dashboard:

```
MONGO_URL = (your MongoDB Atlas connection string)
DB_NAME = imperio
JWT_SECRET = (generate with: openssl rand -hex 32)
ADMIN_EMAIL = admin@bwimperio.com
ADMIN_PASSWORD = bwimperio
FRONTEND_URL = https://imperio-frontend-xxxx.vercel.app
```

### 2.4 Deploy

- Click **Deploy**
- Wait for green checkmark ✅
- Your backend will be available at: `https://imperio-backend-xxxx.onrender.com`

---

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Vercel Configuration

Your `frontend/vercel.json` is already set up:

```json
{
  "buildCommand": "npm run build",
  "env": {
    "REACT_APP_BACKEND_URL": "@react_app_backend_url"
  },
  "regions": ["iad1"],
  "nodeVersion": "18.x"
}
```

### 3.2 Deploy Options

#### Option A: GitHub Integration (Automatic)

1. Go to [vercel.com](https://vercel.com)
2. **Import Project** → Select your GitHub repo
3. **Framework:** React
4. **Root Directory:** `frontend`
5. **Build Command:** `npm run build`
6. **Output Directory:** `build`
7. Click **Deploy**

#### Option B: Vercel CLI (Manual)

```bash
cd frontend
npm install -g vercel
vercel --prod
```

### 3.3 Add Environment Variables (Vercel)

After deployment:

1. **Vercel Dashboard** → Your project
2. **Settings** → **Environment Variables**
3. Add:
   - **Name:** `REACT_APP_BACKEND_URL`
   - **Value:** `https://imperio-backend-xxxx.onrender.com`
   - **Environments:** Production, Preview, Development (check all)

4. **Redeploy** to apply changes:
   - Settings → Deployments → **Redeploy**

### 3.4 Update FRONTEND_URL in Backend

Once you know your Vercel URL:

1. Go to Render dashboard
2. Find your backend service
3. **Environment** → Edit `FRONTEND_URL`
4. Change to: `https://your-frontend-domain.vercel.app`
5. **Save**

---

## 🔌 Step 4: Verify CORS & API Connectivity

### Frontend API Configuration

Your `frontend/src/config/api.js` is already correctly set up:

```javascript
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
});
```

✅ **Fallback:** If env variable fails, uses localhost (good for development)
✅ **withCredentials:** Enables JWT cookies across domains
✅ **Logging:** All requests logged for debugging

### Backend CORS Configuration

In `backend/server.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[frontend_url, "http://localhost:3000", "http://localhost:8000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

✅ **Allow Credentials:** Enables JWT cookies
✅ **Allow Origins:** Frontend URL + localhost for development
✅ **Allow Methods/Headers:** All methods and headers permitted

---

## 🧪 Step 5: Test Your Deployment

### 5.1 Test Backend Health

```bash
curl https://imperio-backend-xxxx.onrender.com/api/

# Expected response:
# {"message":"Best Western Imperio API"}
```

### 5.2 Test Frontend

1. Visit: `https://your-frontend-domain.vercel.app`
2. Open **Developer Console** (F12)
3. Check for API log messages:
   ```
   🔌 API Configuration:
   API Base URL: https://imperio-backend-xxxx.onrender.com
   ```

### 5.3 Test Booking Flow

#### Create a Room
```bash
curl -X POST https://imperio-backend-xxxx.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bwimperio.com","password":"bwimperio"}'
```

#### Get Rooms
```bash
curl https://imperio-backend-xxxx.onrender.com/api/rooms
```

#### Check Availability
```bash
curl "https://imperio-backend-xxxx.onrender.com/api/rooms/availability?check_in=2024-04-01&check_out=2024-04-05"
```

#### Create Booking
```bash
curl -X POST https://imperio-backend-xxxx.onrender.com/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "room_number": 101,
    "customer_name": "John Doe",
    "customer_phone": "+91 9876543210",
    "customer_email": "john@example.com",
    "check_in": "2024-04-01",
    "check_out": "2024-04-05",
    "total_price": 4500,
    "special_requests": "High floor preferred"
  }'
```

### 5.4 Test Admin Login (Frontend)

1. Navigate to: `https://your-frontend-domain.vercel.app/admin/login`
2. Enter credentials:
   - **Email:** `admin@bwimperio.com`
   - **Password:** `bwimperio`
3. Should redirect to: `/admin/dashboard`
4. Check console for: `✅ Login successful`

---

## 🔐 Security Configuration

### 1. Update JWT Secret

Generate a strong secret:
```bash
openssl rand -hex 32
```

Set in both Render and `.env`:
```
JWT_SECRET=your_64_character_hex_string
```

### 2. Configure Secure Cookies

In `backend/server.py` (for production):

```python
response.set_cookie(
    key="access_token",
    value=access,
    httponly=True,
    secure=True,  # ✅ Only HTTPS
    samesite="strict",  # ✅ CSRF protection
    max_age=3600,
    path="/"
)
```

### 3. Update CORS Allow-Origins

In `backend/server.py`:

```python
frontend_url = os.environ.get("FRONTEND_URL")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],  # ✅ Only frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🐛 Troubleshooting

### Issue: CORS Error

**Symptoms:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Verify `FRONTEND_URL` is set correctly in Render
2. Check backend logs for the Origin header
3. Ensure `allow_origins` includes your Vercel domain

---

### Issue: API Timeout

**Symptoms:** `Error: timeout of 10000ms exceeded`

**Solution:**
1. Check backend health: `https://imperio-backend-xxxx.onrender.com/api/`
2. Verify MongoDB connection in Render env variables
3. Increase timeout in `frontend/src/config/api.js`:
   ```javascript
   timeout: 30000  // 30 seconds
   ```

---

### Issue: Undefined API URL

**Symptoms:** Console shows `API Base URL: undefined`

**Solution:**
1. Add `REACT_APP_BACKEND_URL` to Vercel Environment Variables
2. Redeploy after adding the variable
3. Check that variable name is exactly: `REACT_APP_BACKEND_URL`

---

### Issue: MongoDB Connection Failed

**Symptoms:** Backend fails to start

**Solution:**
1. Verify `MONGO_URL` in Render env variables
2. Add Render IP to MongoDB Atlas IP Whitelist:
   - Go to MongoDB Atlas
   - **Network Access** → **IP Whitelist**
   - Add: `0.0.0.0/0` (for testing) or specific IP

---

## 📦 Deployment Checklist

### Backend (Render)
- [ ] requirements.txt has all dependencies
- [ ] server.py configured for 0.0.0.0:10000
- [ ] .env has all required variables
- [ ] MONGO_URL is valid
- [ ] JWT_SECRET is strong
- [ ] FRONTEND_URL matches Vercel domain
- [ ] CORS properly configured
- [ ] Health check: GET /api/ returns 200

### Frontend (Vercel)
- [ ] package.json has React 18.2.0
- [ ] vercel.json configured correctly
- [ ] REACT_APP_BACKEND_URL environment variable set
- [ ] Build completes without errors
- [ ] Console shows correct API URL

### Integration
- [ ] Frontend can reach backend
- [ ] Login works with admin credentials
- [ ] Rooms load on homepage
- [ ] Booking form submits successfully
- [ ] Admin dashboard shows data
- [ ] No CORS errors in console

---

## 🚀 Quick Deployment Commands

### Backend Deploy Script
```bash
# Clone repository
git clone <repo-url>
cd bestwesternimperio-main

# Push to GitHub (Render will auto-deploy)
git add .
git commit -m "Deploy: Production backend configuration"
git push origin main
```

### Frontend Deploy Script
```bash
cd frontend

# Deploy to Vercel
vercel --prod

# Or use GitHub integration (Vercel auto-deploys on push)
git push origin main
```

---

## 📞 Support

If you encounter issues:

1. **Check Render Logs:**
   - Render Dashboard → Logs

2. **Check Vercel Logs:**
   - Vercel Dashboard → Deployments → Logs

3. **Check Browser Console:**
   - F12 → Console tab

4. **Test API directly:**
   ```bash
   curl https://empire-backend-xxxx.onrender.com/api/
   ```

---

## 🎉 Success!

Once deployed:
- ✅ Frontend: `https://your-domain.vercel.app`
- ✅ Backend API: `https://imperio-backend-xxxx.onrender.com`
- ✅ Admin Panel: `https://your-domain.vercel.app/admin/login`
- ✅ Booking System: End-to-end functional

**Congratulations! Your hotel booking system is live! 🏨**
