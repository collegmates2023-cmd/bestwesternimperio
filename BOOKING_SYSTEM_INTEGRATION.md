# Hotel Booking System - Complete Integration Guide

## Project Overview
Full-stack hotel booking system with real-time room availability, 2D floor visualization, and admin panel.

**Tech Stack:**
- **Backend**: Python + FastAPI + Motor (async MongoDB)
- **Frontend**: React + Tailwind CSS
- **Database**: MongoDB
- **Real-time**: REST API (WebSocket optional for future upgrades)

---

## Architecture

### Backend Structure
```
backend/
├── server.py          # Main FastAPI application
├── requirements.txt   # Python dependencies
└── app/
    └── memory/        # Booking data storage
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── DatePickerComponent.jsx      # Date selection UI
│   │   ├── FloorComponent.jsx           # 2D floor layout
│   │   ├── BookingForm.jsx              # Booking modal form
│   │   └── FloorBooking.jsx             # Main booking page
│   ├── admin/
│   │   ├── AdminBookingsPanel.jsx       # Booking management
│   │   ├── AdminRoomsPanel.jsx          # Room management
│   │   └── AdminPanel.css               # Admin styles
│   └── pages/
│       └── admin/                       # Admin dashboard pages
```

---

## Database Schema

### Collections

#### 1. `rooms` Collection
```javascript
{
  _id: ObjectId,
  room_number: 101,
  floor: 1,
  category: "Deluxe" | "Executive",
  price: 4500,
  status: "available" | "booked" | "maintenance",
  description: "Room description",
  amenities: ["WiFi", "AC", "TV"],
  images: ["url1", "url2"],
  side: "left" | "right",
  created_at: ISO8601
}
```

#### 2. `bookings` Collection
```javascript
{
  _id: ObjectId,
  booking_id: "BK12345ABC",
  room_number: 101,
  room_id: ObjectId,
  customer_name: "John Doe",
  customer_phone: "+91999999999",
  customer_email: "john@example.com",
  check_in: "2024-04-15",
  check_out: "2024-04-18",
  total_price: 13500,
  special_requests: "High floor please",
  payment_method: "credit_card",
  payment_status: "pending" | "paid",
  status: "pending" | "confirmed" | "cancelled",
  created_at: ISO8601,
  updated_at: ISO8601
}
```

#### 3. `customers` Collection
```javascript
{
  _id: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  phone: "+91999999999",
  booking_count: 3,
  last_booking: ISO8601,
  created_at: ISO8601
}
```

---

## API Endpoints

### Public Booking Endpoints

#### Get Room Availability
```bash
GET /api/rooms/availability?check_in=2024-04-15&check_out=2024-04-18&floor=1
```

**Response:**
```json
{
  "check_in": "2024-04-15",
  "check_out": "2024-04-18",
  "rooms": [
    {
      "id": "507f1f77bcf86cd799439011",
      "room_number": 101,
      "floor": 1,
      "category": "Deluxe",
      "price": 4500,
      "status": "available",
      "is_available": true,
      "amenities": ["WiFi", "AC", "TV"],
      "booked_dates": []
    }
  ]
}
```

#### Create Booking
```bash
POST /api/bookings
Content-Type: application/json

{
  "room_number": 101,
  "room_id": "507f1f77bcf86cd799439011",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+91999999999",
  "check_in": "2024-04-15",
  "check_out": "2024-04-18",
  "total_price": 13500,
  "special_requests": "High floor"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "id": "507f1f77bcf86cd799439012",
    "booking_id": "BK12345ABC",
    "room_number": 101,
    "customer_name": "John Doe",
    "check_in": "2024-04-15",
    "check_out": "2024-04-18",
    "total_price": 13500,
    "status": "pending",
    "created_at": "2024-04-10T10:30:00Z"
  }
}
```

#### Get Booking Details
```bash
GET /api/bookings/{booking_id}
GET /api/bookings/email/{email}
```

#### Cancel Booking
```bash
PUT /api/bookings/{booking_id}/cancel
```

### Admin Endpoints

#### List Bookings
```bash
GET /api/admin/bookings?status=pending&search=john
```

#### Update Booking Status
```bash
PUT /api/admin/bookings/{booking_id}

{
  "status": "confirmed"
}
```

#### List Rooms
```bash
GET /api/admin/rooms?floor=1&status=available&category=Deluxe
```

#### Create Room
```bash
POST /api/admin/rooms

{
  "room_number": 101,
  "floor": 1,
  "category": "Deluxe",
  "price": 4500,
  "status": "available",
  "amenities": ["WiFi", "AC", "TV"],
  "images": []
}
```

#### Update Room Status
```bash
PUT /api/admin/rooms/{room_id}/status

{
  "status": "maintenance"
}
```

---

## Frontend Components

### DatePickerComponent
**File:** `src/components/DatePickerComponent.jsx`

**Props:**
- `onDatesSelected(dates)` - Callback when dates are selected

**Features:**
- Validates date range (checkout > checkin)
- Shows night count
- Prevents past dates
- Error handling

**Usage:**
```jsx
<DatePickerComponent onDatesSelected={(dates) => {
  console.log(dates); // { checkIn: "2024-04-15", checkOut: "2024-04-18", nights: 3 }
}} />
```

### FloorComponent
**File:** `src/components/FloorComponent.jsx`

**Props:**
- `checkIn` - Check-in date (YYYY-MM-DD)
- `checkOut` - Check-out date (YYYY-MM-DD)
- `onRoomSelected(room)` - Callback when room is selected
- `loading` - Loading state

**Features:**
- Fetches room availability from API
- Displays rooms grouped by floor
- Color-coded status (green=available, red=booked, grey=maintenance)
- Shows availability count per floor
- Handles date range validation

**Usage:**
```jsx
<FloorComponent 
  checkIn="2024-04-15"
  checkOut="2024-04-18"
  onRoomSelected={(room) => console.log(room)}
  loading={false}
/>
```

### BookingForm
**File:** `src/components/BookingForm.jsx`

**Props:**
- `room` - Selected room object
- `checkIn` - Check-in date
- `checkOut` - Check-out date
- `onBookingSubmit(booking)` - Callback on success
- `onClose()` - Callback to close modal

**Features:**
- Form validation (name, email, phone)
- Price calculation
- Booking summary
- Success confirmation
- Error handling

**Usage:**
```jsx
<BookingForm
  room={selectedRoom}
  checkIn="2024-04-15"
  checkOut="2024-04-18"
  onBookingSubmit={(booking) => console.log(booking)}
  onClose={() => setShowForm(false)}
/>
```

### FloorBooking (Main Component)
**File:** `src/components/FloorBooking.jsx`

**Features:**
- Integrates all components
- Manages booking state
- Handles floor display
- Shows selected room summary
- Launches booking form modal

---

## Admin Panel Components

### AdminBookingsPanel
**File:** `src/admin/AdminBookingsPanel.jsx`

**Features:**
- List all bookings with filters
- Search by name/email
- Update booking status
- Cancel bookings
- Pagination (optional)

### AdminRoomsPanel
**File:** `src/admin/AdminRoomsPanel.jsx`

**Features:**
- List rooms with filters (floor, status, category)
- Add new rooms
- Update room status
- Delete rooms
- Price management

---

## Integration Steps

### 1. Backend Setup

**Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**Required packages:**
```txt
fastapi==0.104.1
uvicorn==0.24.0
motor==3.3.2
pymongo==4.6.0
pydantic==2.5.0
python-dotenv==1.0.0
bcrypt==4.1.1
pyjwt==2.8.1
```

**Configure environment variables (.env):**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=best_western
JWT_SECRET=your-secret-key-here
ADMIN_EMAIL=admin@bwimperio.com
ADMIN_PASSWORD=bwimperio
FRONTEND_URL=http://localhost:3000
```

**Run backend:**
```bash
cd backend
uvicorn server:app --reload
```

### 2. Frontend Setup

**Install dependencies:**
```bash
cd frontend
npm install
```

**Configure API endpoint (optional):**
```bash
# Create .env file
REACT_APP_BACKEND_URL=process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"
```

**Run frontend:**
```bash
npm start
```

### 3. Import Components

**In your main booking page:**
```jsx
import DatePickerComponent from './components/DatePickerComponent';
import FloorComponent from './components/FloorComponent';
import BookingForm from './components/BookingForm';

export default function BookingPage() {
  const [bookingDates, setBookingDates] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <DatePickerComponent onDatesSelected={setBookingDates} />
      
      {bookingDates && (
        <FloorComponent 
          checkIn={bookingDates.checkIn}
          checkOut={bookingDates.checkOut}
          onRoomSelected={(room) => {
            setSelectedRoom(room);
            setShowForm(true);
          }}
        />
      )}

      {showForm && (
        <BookingForm
          room={selectedRoom}
          checkIn={bookingDates.checkIn}
          checkOut={bookingDates.checkOut}
          onBookingSubmit={(booking) => {
            console.log('Booking created:', booking);
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
```

**In Admin Dashboard:**
```jsx
import AdminBookingsPanel from '../admin/AdminBookingsPanel';
import AdminRoomsPanel from '../admin/AdminRoomsPanel';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('bookings');

  return (
    <div>
      <button onClick={() => setActiveTab('bookings')}>Bookings</button>
      <button onClick={() => setActiveTab('rooms')}>Rooms</button>
      
      {activeTab === 'bookings' && <AdminBookingsPanel />}
      {activeTab === 'rooms' && <AdminRoomsPanel />}
    </div>
  );
}
```

---

## Real-Time Sync Implementation

### Option 1: Polling (Simple)
```jsx
useEffect(() => {
  const interval = setInterval(() => {
    fetchRooms();
  }, 30000); // Refresh every 30 seconds

  return () => clearInterval(interval);
}, []);
```

### Option 2: WebSockets (Advanced)
```jsx
useEffect(() => {
  const socket = io('process.env.REACT_APP_BACKEND_URL ||
  "https://bestwesternimperio-1.onrender.com"');
  
  socket.on('room_status_changed', (roomData) => {
    updateRoomInState(roomData);
  });

  return () => socket.disconnect();
}, []);
```

---

## Validation Rules

### Frontend Validation
- ✅ Check-out date > Check-in date
- ✅ Valid email format
- ✅ Phone number at least 10 digits
- ✅ Room availability check
- ✅ Required fields validation

### Backend Validation
- ✅ Date overlap detection
- ✅ Room status verification
- ✅ Duplicate booking prevention
- ✅ Customer data validation
- ✅ Authentication/Authorization

---

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (booking overlap)
- `429` - Too Many Requests
- `500` - Server Error

### Common Errors

**Room Already Booked**
```json
{
  "detail": "Room is already booked for these dates"
}
```

**Date Validation Error**
```json
{
  "detail": "Check-out date must be after check-in date"
}
```

**Room Under Maintenance**
```json
{
  "detail": "Room is under maintenance"
}
```

---

## Testing Checklist

- [ ] Date picker validation works
- [ ] Room availability filters by date range
- [ ] Room colors display correctly (green/red/grey)
- [ ] Booking form validation (name, email, phone)
- [ ] Booking submission creates record in DB
- [ ] Confirmation email sent
- [ ] Admin can cancel bookings
- [ ] Admin can update room status
- [ ] Admin can add new rooms
- [ ] No double bookings allowed
- [ ] Past dates blocked in calendar
- [ ] Mobile responsive design works
- [ ] Error messages display properly

---

## Performance Tips

1. **Memoize Components**: Use `React.memo()` for floor rooms
2. **Lazy Loading**: Load admin panels on-demand
3. **API Caching**: Cache room availability for 5 minutes
4. **Database Indexes**: Add indexes on `room_number`, `booking dates`
5. **Pagination**: Limit bookings/rooms per request to 50

---

## Future Enhancements

1. **Payment Integration** (Razorpay/Stripe)
2. **Email Notifications** (booking confirmation, reminder)
3. **SMS Alerts** (checkin/checkout reminders)
4. **Discount/Coupon System**
5. **Review & Ratings**
6. **Multi-language Support**
7. **Loyalty Program**
8. **Dynamic Pricing**
9. **Availability Calendar Widget**
10. **Analytics Dashboard**

---

## Troubleshooting

### Issue: Rooms not loading
**Solution**: Check MongoDB connection in .env file

### Issue: Booking not created
**Solution**: Check browser console for validation errors, verify date format (YYYY-MM-DD)

### Issue: CORS errors
**Solution**: Ensure FRONTEND_URL is correct in backend .env

### Issue: Dates not filtering
**Solution**: Ensure check-in and check-out are properly formatted

---

## Support & Documentation

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Motor (Async MongoDB)](https://motor.readthedocs.io/)

---

**Last Updated**: March 28, 2026
**Version**: 1.0.0
