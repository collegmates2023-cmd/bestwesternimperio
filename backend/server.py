from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os, logging, uuid, bcrypt, jwt, secrets
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ["JWT_SECRET"]

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── Auth Helpers ───
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    return jwt.encode({"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    return jwt.encode({"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ─── Models ───
class LoginInput(BaseModel):
    email: str
    password: str

class ContactFormCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    message: str

class RoomInput(BaseModel):
    room_number: int
    floor: int
    category: str = "Deluxe"
    price: float = 4500
    status: str = "available"
    description: str = ""
    amenities: List[str] = []
    images: List[str] = []
    side: str = "left"

class BookingInput(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: str
    room_number: int
    check_in: str
    check_out: str
    amount: float = 0
    payment_status: str = "pending"
    status: str = "confirmed"

class SettingsInput(BaseModel):
    hotel_name: str = "Best Western Imperio"
    address: str = "Bye Pass, Raipur Road, Hisar, Haryana"
    phone: str = "+91 123 456 7890"
    email: str = "info@bwimperio.com"
    logo_url: str = ""

def serialize_doc(doc):
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc

# ─── Auth Routes ───
@api_router.post("/auth/login")
async def login(input_data: LoginInput, request: Request, response: Response):
    email = input_data.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    
    # Debug logging
    logger.info(f"Login attempt - Email: {email}, IP: {ip}")
    
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("locked_until") and attempt["locked_until"] > datetime.now(timezone.utc):
        logger.warning(f"Login locked for {identifier} - Too many attempts")
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
    
    user = await db.users.find_one({"email": email})
    if not user:
        logger.warning(f"Login failed - User not found: {email}")
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"attempts": 1}, "$set": {"locked_until": datetime.now(timezone.utc) + timedelta(minutes=15) if attempt and attempt.get("attempts", 0) >= 4 else None}},
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(input_data.password, user["password_hash"]):
        logger.warning(f"Login failed - Invalid password for: {email}")
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"attempts": 1}, "$set": {"locked_until": datetime.now(timezone.utc) + timedelta(minutes=15) if attempt and attempt.get("attempts", 0) >= 4 else None}},
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Clear login attempts on success
    await db.login_attempts.delete_one({"identifier": identifier})
    
    uid = str(user["_id"])
    access = create_access_token(uid, email)
    refresh = create_refresh_token(uid)
    response.set_cookie(key="access_token", value=access, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    logger.info(f"Login successful - User: {email}")
    return {"id": uid, "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "admin"), "token": access}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def auth_me(user: dict = Depends(get_current_user)):
    return user

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(str(user["_id"]), user["email"])
        response.set_cookie(key="access_token", value=access, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
        return {"message": "Token refreshed"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# ─── Admin Dashboard ───
@api_router.get("/admin/dashboard")
async def admin_dashboard(user: dict = Depends(get_current_user)):
    total_rooms = await db.rooms.count_documents({})
    available = await db.rooms.count_documents({"status": "available"})
    booked = await db.rooms.count_documents({"status": "booked"})
    maintenance = await db.rooms.count_documents({"status": "maintenance"})
    total_bookings = await db.bookings.count_documents({})
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
    rev = await db.bookings.aggregate(pipeline).to_list(1)
    total_revenue = rev[0]["total"] if rev else 0
    recent_bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(5)
    # Booking trends (last 7 days)
    trends = []
    for i in range(6, -1, -1):
        day = datetime.now(timezone.utc) - timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        count = await db.bookings.count_documents({"created_at": {"$gte": day_str, "$lt": (day + timedelta(days=1)).strftime("%Y-%m-%d")}})
        trends.append({"date": day.strftime("%b %d"), "bookings": count})
    return {
        "total_rooms": total_rooms, "available": available, "booked": booked, "maintenance": maintenance,
        "total_bookings": total_bookings, "total_revenue": total_revenue,
        "recent_bookings": recent_bookings, "trends": trends
    }

# ─── Admin Rooms CRUD ───
@api_router.get("/admin/rooms")
async def admin_list_rooms(user: dict = Depends(get_current_user), floor: Optional[int] = None, category: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if floor:
        query["floor"] = floor
    if category:
        query["category"] = category
    if status:
        query["status"] = status
    if search:
        query["room_number"] = int(search) if search.isdigit() else {"$exists": True}
    rooms = await db.rooms.find(query).sort("room_number", 1).to_list(100)
    return [serialize_doc(r) for r in rooms]

@api_router.post("/admin/rooms")
async def admin_create_room(data: RoomInput, user: dict = Depends(get_current_user)):
    existing = await db.rooms.find_one({"room_number": data.room_number})
    if existing:
        raise HTTPException(status_code=400, detail="Room number already exists")
    doc = data.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.rooms.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/rooms/{room_id}")
async def admin_update_room(room_id: str, data: RoomInput, user: dict = Depends(get_current_user)):
    update = data.model_dump()
    result = await db.rooms.update_one({"_id": ObjectId(room_id)}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room updated", "id": room_id}

@api_router.delete("/admin/rooms/{room_id}")
async def admin_delete_room(room_id: str, user: dict = Depends(get_current_user)):
    result = await db.rooms.delete_one({"_id": ObjectId(room_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room deleted"}

@api_router.put("/admin/rooms/{room_id}/status")
async def admin_update_room_status(room_id: str, request: Request, user: dict = Depends(get_current_user)):
    body = await request.json()
    status = body.get("status", "available")
    await db.rooms.update_one({"_id": ObjectId(room_id)}, {"$set": {"status": status}})
    return {"message": "Status updated"}

# ─── Admin Bookings ───
@api_router.get("/admin/bookings")
async def admin_list_bookings(user: dict = Depends(get_current_user), status: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    if search:
        query["$or"] = [{"customer_name": {"$regex": search, "$options": "i"}}, {"customer_email": {"$regex": search, "$options": "i"}}]
    bookings = await db.bookings.find(query).sort("created_at", -1).to_list(200)
    return [serialize_doc(b) for b in bookings]

@api_router.post("/admin/bookings")
async def admin_create_booking(data: BookingInput, user: dict = Depends(get_current_user)):
    doc = data.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["booking_id"] = f"BK{str(uuid.uuid4())[:8].upper()}"
    result = await db.bookings.insert_one(doc)
    if data.status == "confirmed":
        await db.rooms.update_one({"room_number": data.room_number}, {"$set": {"status": "booked"}})
    # Update/create customer
    existing_customer = await db.customers.find_one({"email": data.customer_email})
    if existing_customer:
        await db.customers.update_one({"email": data.customer_email}, {"$inc": {"booking_count": 1}, "$set": {"last_booking": doc["created_at"], "name": data.customer_name, "phone": data.customer_phone}})
    else:
        await db.customers.insert_one({"name": data.customer_name, "phone": data.customer_phone, "email": data.customer_email, "booking_count": 1, "last_booking": doc["created_at"], "created_at": doc["created_at"]})
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/bookings/{booking_id}")
async def admin_update_booking(booking_id: str, data: BookingInput, user: dict = Depends(get_current_user)):
    old = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    update = data.model_dump()
    await db.bookings.update_one({"_id": ObjectId(booking_id)}, {"$set": update})
    if old and data.status == "cancelled" and old.get("status") != "cancelled":
        await db.rooms.update_one({"room_number": old["room_number"]}, {"$set": {"status": "available"}})
    if data.status == "confirmed":
        await db.rooms.update_one({"room_number": data.room_number}, {"$set": {"status": "booked"}})
    return {"message": "Booking updated", "id": booking_id}

@api_router.delete("/admin/bookings/{booking_id}")
async def admin_delete_booking(booking_id: str, user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if booking:
        await db.rooms.update_one({"room_number": booking["room_number"]}, {"$set": {"status": "available"}})
    await db.bookings.delete_one({"_id": ObjectId(booking_id)})
    return {"message": "Booking deleted"}

# ─── Admin Customers ───
@api_router.get("/admin/customers")
async def admin_list_customers(user: dict = Depends(get_current_user), search: Optional[str] = None):
    query = {}
    if search:
        query["$or"] = [{"name": {"$regex": search, "$options": "i"}}, {"email": {"$regex": search, "$options": "i"}}, {"phone": {"$regex": search, "$options": "i"}}]
    customers = await db.customers.find(query).sort("created_at", -1).to_list(200)
    return [serialize_doc(c) for c in customers]

# ─── Admin Settings ───
@api_router.get("/admin/settings")
async def admin_get_settings(user: dict = Depends(get_current_user)):
    settings = await db.settings.find_one({}, {"_id": 0})
    if not settings:
        settings = {"hotel_name": "Best Western Imperio", "address": "Bye Pass, Raipur Road, Hisar, Haryana", "phone": "+91 123 456 7890", "email": "info@bwimperio.com", "logo_url": ""}
    return settings

@api_router.put("/admin/settings")
async def admin_update_settings(data: SettingsInput, user: dict = Depends(get_current_user)):
    await db.settings.update_one({}, {"$set": data.model_dump()}, upsert=True)
    return {"message": "Settings updated"}

# ─── Public Routes ───
@api_router.get("/")
async def root():
    return {"message": "Best Western Imperio API"}

@api_router.post("/contact")
async def create_contact(input_data: ContactFormCreate):
    doc = input_data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/contacts")
async def get_contacts():
    return await db.contacts.find({}, {"_id": 0}).to_list(100)

@api_router.get("/rooms")
async def public_rooms():
    rooms = await db.rooms.find({}, {"_id": 0}).to_list(100)
    deluxe_rooms = [r for r in rooms if r.get("category") == "Deluxe"]
    executive_rooms = [r for r in rooms if r.get("category") == "Executive"]
    deluxe_img = "https://customer-assets.emergentagent.com/job_imperio-luxury/artifacts/980zdopb_c0ce331a7c5311e894780266fbcf4d94.jpg"
    return {"rooms": [
        {"id": "deluxe", "name": "Deluxe Room", "price": deluxe_rooms[0]["price"] if deluxe_rooms else 4500,
         "description": "Spacious deluxe room with modern amenities, plush bedding, and a stunning city view.",
         "amenities": ["King Bed", "City View", "WiFi", "AC", "Mini Bar", "Room Service", "Smart TV", "Rain Shower"],
         "images": [deluxe_img], "size": "350 sq ft"},
        {"id": "executive", "name": "Executive Room", "price": executive_rooms[0]["price"] if executive_rooms else 6500,
         "description": "Premium executive suite with separate living area, luxury furnishings, and panoramic views.",
         "amenities": ["King Bed", "Panoramic View", "WiFi", "AC", "Mini Bar", "Room Service", "Smart TV", "Bathtub", "Lounge Area", "Work Desk"],
         "images": [deluxe_img], "size": "500 sq ft"}
    ]}

@api_router.get("/floors")
async def public_floors():
    floors_data = []
    for floor_num in range(1, 4):
        rooms = await db.rooms.find({"floor": floor_num}, {"_id": 0}).sort("room_number", 1).to_list(20)
        floor_rooms = []
        for r in rooms:
            floor_rooms.append({"number": r["room_number"], "status": r["status"], "type": r["category"], "price": r["price"], "side": r["side"]})
        floors_data.append({"floor": floor_num, "label": f"Floor {floor_num}", "rooms": floor_rooms})
    return {"floors": floors_data}

# ─── Booking System Routes ───
@api_router.get("/rooms/availability")
async def get_rooms_availability(check_in: str, check_out: str, floor: Optional[int] = None):
    """
    Get rooms available for a date range.
    Query params: check_in (YYYY-MM-DD), check_out (YYYY-MM-DD), floor (optional)
    Returns rooms with availability status based on bookings overlap
    """
    from datetime import datetime as dt
    try:
        check_in_date = dt.strptime(check_in, "%Y-%m-%d").date()
        check_out_date = dt.strptime(check_out, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    if check_out_date <= check_in_date:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")
    
    # Find all bookings that overlap with requested dates
    overlapping_bookings = await db.bookings.find({
        "check_in": {"$lt": check_out},
        "check_out": {"$gt": check_in},
        "status": {"$in": ["confirmed", "pending"]}
    }).to_list(None)
    
    booked_room_numbers = [b["room_number"] for b in overlapping_bookings]
    
    # Get all rooms, filter by floor if provided
    query = {}
    if floor:
        query["floor"] = floor
    
    rooms = await db.rooms.find(query).sort("floor", 1).sort("room_number", 1).to_list(None)
    
    # Build response with availability info
    available_rooms = []
    for room in rooms:
        room_copy = dict(room)
        room_copy["id"] = str(room_copy.pop("_id"))
        room_copy["is_available"] = room_copy["status"] == "available" and room_copy["room_number"] not in booked_room_numbers
        # Add occupancy info
        room_copy["booked_dates"] = [b["check_in"] + " to " + b["check_out"] for b in overlapping_bookings if b["room_number"] == room["room_number"]]
        available_rooms.append(room_copy)
    
    return {"check_in": check_in, "check_out": check_out, "rooms": available_rooms}

class BookingCreateInput(BaseModel):
    room_number: int
    room_id: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_email: str
    check_in: str  # YYYY-MM-DD
    check_out: str  # YYYY-MM-DD
    total_price: Optional[float] = 0
    special_requests: Optional[str] = ""
    payment_method: Optional[str] = "pending"

@api_router.post("/bookings")
async def create_public_booking(data: BookingCreateInput):
    """
    Create a new booking (public endpoint)
    Validates room availability and creates booking
    """
    from datetime import datetime as dt
    
    # Validate dates
    try:
        check_in_date = dt.strptime(data.check_in, "%Y-%m-%d").date()
        check_out_date = dt.strptime(data.check_out, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    if check_out_date <= check_in_date:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")
    
    # Check if room exists
    room = await db.rooms.find_one({"room_number": data.room_number})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if room["status"] == "maintenance":
        raise HTTPException(status_code=400, detail="Room is under maintenance")
    
    # Check for overlapping bookings
    overlapping = await db.bookings.find_one({
        "room_number": data.room_number,
        "check_in": {"$lt": data.check_out},
        "check_out": {"$gt": data.check_in},
        "status": {"$in": ["confirmed", "pending"]}
    })
    
    if overlapping:
        raise HTTPException(status_code=409, detail="Room is already booked for these dates")
    
    # Create booking
    booking_doc = {
        "booking_id": f"BK{str(uuid.uuid4())[:8].upper()}",
        "room_number": data.room_number,
        "room_id": str(room["_id"]),
        "customer_name": data.customer_name,
        "customer_phone": data.customer_phone,
        "customer_email": data.customer_email,
        "check_in": data.check_in,
        "check_out": data.check_out,
        "total_price": data.total_price or room["price"],
        "special_requests": data.special_requests,
        "payment_method": data.payment_method,
        "payment_status": "pending",
        "status": "pending",  # pending, confirmed, cancelled
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.bookings.insert_one(booking_doc)
    booking_doc["id"] = str(result.inserted_id)
    booking_doc.pop("_id", None)
    
    # Update or create customer
    existing_customer = await db.customers.find_one({"email": data.customer_email})
    if existing_customer:
        await db.customers.update_one(
            {"email": data.customer_email},
            {
                "$inc": {"booking_count": 1},
                "$set": {
                    "last_booking": booking_doc["created_at"],
                    "name": data.customer_name,
                    "phone": data.customer_phone
                }
            }
        )
    else:
        await db.customers.insert_one({
            "name": data.customer_name,
            "phone": data.customer_phone,
            "email": data.customer_email,
            "booking_count": 1,
            "last_booking": booking_doc["created_at"],
            "created_at": booking_doc["created_at"]
        })
    
    return {"success": True, "message": "Booking created successfully", "booking": booking_doc}

@api_router.get("/bookings/{booking_id}")
async def get_booking_details(booking_id: str):
    """Get booking details by ID"""
    try:
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            # Try by booking_id field
            booking = await db.bookings.find_one({"booking_id": booking_id})
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        booking["id"] = str(booking.pop("_id", ""))
        return booking
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/bookings/email/{email}")
async def get_bookings_by_email(email: str):
    """Get all bookings for a customer by email"""
    bookings = await db.bookings.find({"customer_email": email}).sort("created_at", -1).to_list(None)
    return {"email": email, "bookings": [serialize_doc(b) for b in bookings]}

@api_router.put("/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str):
    """Cancel a booking (make room available)"""
    try:
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        if booking["status"] == "cancelled":
            raise HTTPException(status_code=400, detail="Booking is already cancelled")
        
        # Update booking status
        await db.bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {
                "$set": {
                    "status": "cancelled",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {"success": True, "message": "Booking cancelled successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Startup ───
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.rooms.create_index("room_number", unique=True)
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@bwimperio.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "bwimperio")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({"email": admin_email, "password_hash": hash_password(admin_password), "name": "Admin", "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()})
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")
    # Seed rooms if empty
    room_count = await db.rooms.count_documents({})
    if room_count == 0:
        import random
        rooms = []
        for floor in range(1, 4):
            for i in range(1, 11):
                num = floor * 100 + i
                random.seed(num)
                statuses = ["available", "available", "available", "booked", "maintenance"]
                rooms.append({
                    "room_number": num, "floor": floor,
                    "category": "Executive" if i <= 3 else "Deluxe",
                    "price": 6500 if i <= 3 else 4500,
                    "status": random.choice(statuses),
                    "description": f"{'Executive' if i <= 3 else 'Deluxe'} room on floor {floor}",
                    "amenities": ["WiFi", "AC", "Smart TV", "Mini Bar", "Room Service"],
                    "images": ["https://customer-assets.emergentagent.com/job_imperio-luxury/artifacts/980zdopb_c0ce331a7c5311e894780266fbcf4d94.jpg"],
                    "side": "left" if i <= 5 else "right",
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
        await db.rooms.insert_many(rooms)
        logger.info(f"Seeded {len(rooms)} rooms")
    # Seed settings
    if not await db.settings.find_one({}):
        await db.settings.insert_one({"hotel_name": "Best Western Imperio", "address": "Bye Pass, Raipur Road, Hisar, Haryana", "phone": "+91 123 456 7890", "email": "info@bwimperio.com", "logo_url": ""})
    # Write test credentials
    creds_path = ROOT_DIR / "app" / "memory" / "test_credentials.md"
    creds_path.parent.mkdir(parents=True, exist_ok=True)
    creds_path.write_text(f"# Test Credentials\n\n## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n## Endpoints\n- Login: POST /api/auth/login\n- Me: GET /api/auth/me\n- Logout: POST /api/auth/logout\n")

app.include_router(api_router)

frontend_url = os.environ.get("FRONTEND_URL", "https://imperio-luxury.preview.emergentagent.com")
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        frontend_url, 
        "https://bestwesternimperio.vercel.app",  # Vercel production
        "http://localhost:3000",  # Local development
        "http://localhost:8000",  # Local API
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
