from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class ContactForm(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ContactFormCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    message: str


@api_router.get("/")
async def root():
    return {"message": "Best Western Imperio API"}


@api_router.post("/contact", response_model=ContactForm)
async def create_contact(input_data: ContactFormCreate):
    contact = ContactForm(**input_data.model_dump())
    doc = contact.model_dump()
    await db.contacts.insert_one(doc)
    return contact


@api_router.get("/contacts", response_model=List[ContactForm])
async def get_contacts():
    contacts = await db.contacts.find({}, {"_id": 0}).to_list(100)
    return contacts


@api_router.get("/rooms")
async def get_rooms():
    return {
        "rooms": [
            {
                "id": "deluxe",
                "name": "Deluxe Room",
                "price": 4500,
                "description": "Spacious deluxe room with modern amenities, plush bedding, and a stunning city view. Perfect for business and leisure travelers seeking comfort.",
                "amenities": ["King Bed", "City View", "WiFi", "AC", "Mini Bar", "Room Service", "Smart TV", "Rain Shower"],
                "images": [
                    "https://customer-assets.emergentagent.com/job_imperio-luxury/artifacts/980zdopb_c0ce331a7c5311e894780266fbcf4d94.jpg"
                ],
                "size": "350 sq ft"
            },
            {
                "id": "executive",
                "name": "Executive Room",
                "price": 6500,
                "description": "Premium executive suite with separate living area, luxury furnishings, and panoramic views. Designed for discerning guests who expect the finest.",
                "amenities": ["King Bed", "Panoramic View", "WiFi", "AC", "Mini Bar", "Room Service", "Smart TV", "Bathtub", "Lounge Area", "Work Desk"],
                "images": [
                    "https://customer-assets.emergentagent.com/job_imperio-luxury/artifacts/980zdopb_c0ce331a7c5311e894780266fbcf4d94.jpg"
                ],
                "size": "500 sq ft"
            }
        ]
    }


@api_router.get("/floors")
async def get_floors():
    floors = []
    for floor_num in range(1, 4):
        rooms = []
        for i in range(1, 11):
            room_num = floor_num * 100 + i
            import random
            random.seed(room_num)
            statuses = ["available", "available", "available", "booked", "maintenance"]
            status = random.choice(statuses)
            room_type = "Executive" if i <= 3 else "Deluxe"
            price = 6500 if room_type == "Executive" else 4500
            rooms.append({
                "number": room_num,
                "status": status,
                "type": room_type,
                "price": price,
                "side": "left" if i <= 5 else "right"
            })
        floors.append({
            "floor": floor_num,
            "label": f"Floor {floor_num}",
            "rooms": rooms
        })
    return {"floors": floors}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
