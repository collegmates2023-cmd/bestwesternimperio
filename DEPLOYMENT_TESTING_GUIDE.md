# Hotel Booking System - Testing & Deployment Guide

## Testing Workflow

### 1. Backend API Testing

#### Test with cURL

**Get Room Availability**
```bash
curl "process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"/api/rooms/availability?check_in=2024-04-15&check_out=2024-04-18" \
  -H "Content-Type: application/json"
```

**Create a Booking**
```bash
curl -X POST process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "room_number": 101,
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+919876543210",
    "check_in": "2024-04-15",
    "check_out": "2024-04-18",
    "total_price": 13500
  }'
```

**Get Booking Details**
```bash
curl process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"/api/bookings/{booking_id}
```

**Admin: Get All Bookings**
```bash
curl process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"/api/admin/bookings \
  -H "Authorization: Bearer {token}"
```

### 2. Frontend Component Testing

**Test Date Picker**
```javascript
// Test 1: Valid date selection
const picker = await screen.findByText("Select Your Dates");
fireEvent.change(screen.getByLabelText("Check-in Date"), { target: { value: "2024-04-15" } });
fireEvent.change(screen.getByLabelText("Check-out Date"), { target: { value: "2024-04-18" } });
fireEvent.click(screen.getByText("Search Rooms"));

// Expected: onDatesSelected called with correct dates
```

**Test Floor Component**
```javascript
// Test 1: Rooms load with date selection
render(<FloorComponent checkIn="2024-04-15" checkOut="2024-04-18" />);
await waitFor(() => {
  expect(screen.getByText(/Floor 1/i)).toBeInTheDocument();
});

// Test 2: Room selection
const room = await screen.findByText("101");
fireEvent.click(room);
expect(onRoomSelected).toHaveBeenCalled();
```

**Test Booking Form**
```javascript
// Test 1: Form validation
render(<BookingForm room={mockRoom} ... />);
fireEvent.click(screen.getByText("Confirm Booking"));
expect(screen.getByText(/Please enter your name/i)).toBeInTheDocument();

// Test 2: Successful booking
fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "John Doe" } });
fireEvent.change(screen.getByLabelText("Email"), { target: { value: "john@example.com" } });
fireEvent.change(screen.getByLabelText("Phone"), { target: { value: "+919876543210" } });
fireEvent.click(screen.getByText("Confirm Booking"));

await waitFor(() => {
  expect(screen.getByText(/Booking Confirmed/i)).toBeInTheDocument();
});
```

### 3. Database Testing

**Check MongoDB Collections**
```bash
# Connect to MongoDB
mongosh

# Switch to database
use best_western

# List all collections
show collections

# Query rooms
db.rooms.find().pretty()

# Query bookings
db.bookings.find().pretty()

# Check indexes
db.rooms.getIndexes()
```

### 4. Integration Testing

**Complete Booking Flow Test**
```javascript
describe("Complete Booking Flow", () => {
  test("should complete booking from date selection to confirmation", async () => {
    // 1. Select dates
    const checkIn = "2024-04-15";
    const checkOut = "2024-04-18";
    
    // 2. Verify rooms load
    const rooms = await fetch(`/api/rooms/availability?check_in=${checkIn}&check_out=${checkOut}`);
    expect(rooms.status).toBe(200);
    
    // 3. Create booking
    const booking = await fetch("/api/bookings", {
      method: "POST",
      body: JSON.stringify({
        room_number: 101,
        customer_name: "Test User",
        customer_email: "test@example.com",
        customer_phone: "+919876543210",
        check_in: checkIn,
        check_out: checkOut,
        total_price: 13500
      })
    });
    
    expect(booking.status).toBe(200);
    const data = await booking.json();
    expect(data.booking.status).toBe("pending");
  });
});
```

---

## Performance Testing

### Load Testing with Apache Bench
```bash
# Test booking endpoint with 100 requests, 10 concurrent
ab -n 100 -c 10 process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"/api/rooms

# Test create booking endpoint
ab -n 50 -c 5 -p booking.json process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"/api/bookings
```

### Database Query Performance
```javascript
// Add indexes for optimization
db.rooms.createIndex({ "room_number": 1 });
db.rooms.createIndex({ "floor": 1, "status": 1 });
db.bookings.createIndex({ "check_in": 1, "check_out": 1, "status": 1 });
db.customers.createIndex({ "email": 1 });
```

---

## Debug Checklist

### Backend Debugging
- [ ] Check MongoDB connection logs
- [ ] Verify JWT tokens in headers
- [ ] Check CORS configuration
- [ ] Validate request/response payloads
- [ ] Monitor database query performance
- [ ] Check for memory leaks with `top` command

### Frontend Debugging
- [ ] Open browser DevTools (F12)
- [ ] Check Network tab for API calls
- [ ] Check Console for JavaScript errors
- [ ] Use React DevTools extension
- [ ] Check localStorage/sessionStorage
- [ ] Verify API endpoint URLs

### Common Issues & Solutions

**Issue: Room availability not updating**
```
Solution: 
1. Check if booking status is "confirmed" or "pending"
2. Verify date format matches query (YYYY-MM-DD)
3. Clear browser cache and retry
4. Check MongoDB for overlapping bookings
```

**Issue: Booking creation fails with 409 Conflict**
```
Solution:
1. Room already booked for selected dates
2. Try different dates or room
3. Check existing bookings: db.bookings.find({room_number: 101})
```

**Issue: CORS error when calling API**
```
Solution:
1. Add FRONTEND_URL to backend .env
2. Ensure URLs match (http vs https)
3. Add credentials: true in fetch requests if using cookies
```

---

## Deployment Guide

### Development Environment Setup

**1. MongoDB Setup**
```bash
# On Windows (if using MongoDB locally)
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"

# On Linux/Mac
brew services start mongodb-community

# Verify connection
mongosh
```

**2. Backend Deployment**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=best_western
JWT_SECRET=your-super-secret-key-123
ADMIN_EMAIL=admin@bwimperio.com
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:3000
EOF

# Run development server
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**3. Frontend Deployment**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
REACT_APP_BACKEND_URL=process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"
EOF

# Run development server
npm start
```

### Production Deployment

**Backend Production Build**

```bash
# Using Gunicorn (production WSGI server)
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 server:app

# Or using Docker
docker build -t hotel-booking-backend .
docker run -p 8000:8000 hotel-booking-backend
```

**Frontend Production Build**

```bash
# Build optimized bundle
npm run build

# Serve with production server (Express example)
npm install -g serve
serve -s build -l 3000

# Or deploy to Vercel/Netlify (recommended)
# 1. Push code to GitHub
# 2. Connect repo to Vercel/Netlify
# 3. Set env vars in dashboard
# 4. Deploy with one click
```

### Docker Deployment

**Dockerfile (Backend)**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - mongodb
    environment:
      MONGO_URL: mongodb://admin:password@mongodb:27017
      DB_NAME: best_western
      JWT_SECRET: your-secret-key

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_BACKEND_URL: process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"
```

**Deploy with Docker Compose**
```bash
docker-compose up -d
```

### Environment Variables

**Backend (.env)**
```env
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=best_western

# Security
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256

# Admin
ADMIN_EMAIL=admin@bwimperio.com
ADMIN_PASSWORD=change-in-production

# CORS
FRONTEND_URL=http://localhost:3000

# Optional: Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Frontend (.env)**
```env
REACT_APP_BACKEND_URL=process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"
REACT_APP_API_TIMEOUT=30000
```

---

## Monitoring & Maintenance

### Monitoring Checklist
- [ ] Monitor server CPU/memory usage
- [ ] Check MongoDB disk space
- [ ] Monitor API response times
- [ ] Track error rates and logs
- [ ] Monitor database connection pool
- [ ] Set up alerts for failures

### Database Maintenance
```bash
# Backup MongoDB
mongodump --db best_western --out ./backup

# Restore MongoDB
mongorestore --db best_western ./backup/best_western

# Clean up old bookings (optional)
db.bookings.deleteMany({
  "check_out": { "$lt": new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  "status": "cancelled"
})
```

### Log Management
```bash
# View backend logs
tail -f backend/logs/app.log

# View frontend errors (browser console)
F12 → Console tab
```

---

## Success Criteria

✅ **Backend**
- [ ] All API endpoints tested and working
- [ ] Database properly seeded with rooms
- [ ] Authentication working
- [ ] Date validation working
- [ ] No double bookings possible

✅ **Frontend**
- [ ] DatePicker component displays correctly
- [ ] Room availability updates based on dates
- [ ] Booking form validates inputs
- [ ] Success confirmation shows
- [ ] Admin panel fully functional
- [ ] Mobile responsive

✅ **Integration**
- [ ] Complete booking flow works end-to-end
- [ ] Confirmation email sent (when implemented)
- [ ] Admin can manage bookings and rooms
- [ ] No CORS errors
- [ ] Performance acceptable

---

## Support Contact

For issues or questions:
- Check [BOOKING_SYSTEM_INTEGRATION.md](./BOOKING_SYSTEM_INTEGRATION.md)
- Review API documentation in FastAPI Swagger: process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"/docs
- Check browser console for frontend errors
- Review MongoDB logs for database issues
