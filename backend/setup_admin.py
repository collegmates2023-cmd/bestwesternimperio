#!/usr/bin/env python3
"""
Admin Credentials Setup Script
This script ensures the admin user is properly created with the correct credentials.
"""

import asyncio
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import os
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
DB_NAME = os.environ.get('DB_NAME', 'bestwestern')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@bwimperio.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'bwimperio')

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

async def setup_admin():
    """Setup or reset admin credentials"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        print("🔌 Connecting to MongoDB...")
        print(f"   Database: {DB_NAME}")
        print(f"   URL: {MONGO_URL}")
        
        # Check connection
        await client.admin.command('ping')
        print("✅ MongoDB connection successful!\n")
        
        # Check if admin user exists
        print(f"🔍 Checking for admin user: {ADMIN_EMAIL}")
        admin_user = await db.users.find_one({"email": ADMIN_EMAIL})
        
        if admin_user:
            print("   ✅ Admin user found in database")
            
            # Verify password
            password_correct = verify_password(ADMIN_PASSWORD, admin_user["password_hash"])
            if password_correct:
                print("   ✅ Password matches!")
                print(f"\n✨ Admin credentials are correct and working!\n")
                print(f"   Email: {ADMIN_EMAIL}")
                print(f"   Password: {ADMIN_PASSWORD}")
            else:
                print("   ❌ Password does NOT match stored hash")
                print("   🔄 Updating password...")
                
                new_hash = hash_password(ADMIN_PASSWORD)
                await db.users.update_one(
                    {"email": ADMIN_EMAIL},
                    {"$set": {"password_hash": new_hash}}
                )
                print("   ✅ Password updated successfully!\n")
                print(f"✨ New admin credentials set!\n")
                print(f"   Email: {ADMIN_EMAIL}")
                print(f"   Password: {ADMIN_PASSWORD}")
        else:
            print("   ❌ Admin user NOT found in database")
            print("   🔄 Creating new admin user...")
            
            # Create admin user
            from datetime import datetime, timezone
            admin_doc = {
                "email": ADMIN_EMAIL,
                "password_hash": hash_password(ADMIN_PASSWORD),
                "name": "Admin",
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            result = await db.users.insert_one(admin_doc)
            print(f"   ✅ Admin user created (ID: {result.inserted_id})\n")
            print(f"✨ Admin account created successfully!\n")
            print(f"   Email: {ADMIN_EMAIL}")
            print(f"   Password: {ADMIN_PASSWORD}")
        
        # Show all users
        print("\n📋 All users in database:")
        async for user in db.users.find({}, {"password_hash": 0}):
            print(f"   - {user['email']} (Role: {user.get('role', 'user')})")
        
        # Close connection
        client.close()
        print("\n✅ Setup complete!")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\n🔧 Troubleshooting:")
        print("   1. Make sure MongoDB is running: mongod")
        print("   2. Check that backend/.env has correct MONGO_URL")
        print("   3. Ensure MongoDB is accessible at the configured URL")
        raise

if __name__ == "__main__":
    print("\n" + "="*60)
    print("ADMIN CREDENTIALS SETUP")
    print("="*60 + "\n")
    
    asyncio.run(setup_admin())
