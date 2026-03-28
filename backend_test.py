#!/usr/bin/env python3
"""
Backend API Testing for Best Western Imperio Admin Panel
Tests all authentication, admin dashboard, CRUD operations, and public endpoints
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class ImperioAPITester:
    def __init__(self, base_url: str = "https://imperio-luxury.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.admin_token = None
        
    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            self.failed_tests.append({"test": name, "error": details})
    
    def test_endpoint(self, method: str, endpoint: str, expected_status: int, 
                     data: Optional[Dict] = None, headers: Optional[Dict] = None,
                     use_session: bool = True) -> tuple[bool, Dict]:
        """Test a single endpoint"""
        url = f"{self.base_url}/api{endpoint}"
        req_headers = {"Content-Type": "application/json"}
        if headers:
            req_headers.update(headers)
            
        client = self.session if use_session else requests
        
        try:
            if method == "GET":
                response = client.get(url, headers=req_headers)
            elif method == "POST":
                response = client.post(url, json=data, headers=req_headers)
            elif method == "PUT":
                response = client.put(url, json=data, headers=req_headers)
            elif method == "DELETE":
                response = client.delete(url, headers=req_headers)
            else:
                return False, {"error": f"Unsupported method: {method}"}
                
            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text, "status": response.status_code}
                
            return success, response_data
            
        except Exception as e:
            return False, {"error": str(e)}

    def test_public_endpoints(self):
        """Test public API endpoints"""
        print("\n🌐 Testing Public Endpoints...")
        
        # Test root endpoint
        success, data = self.test_endpoint("GET", "/", 200, use_session=False)
        self.log_test("GET /api/", success, 
                     f"Expected API info, got: {data}" if not success else "")
        
        # Test public rooms endpoint
        success, data = self.test_endpoint("GET", "/rooms", 200, use_session=False)
        self.log_test("GET /api/rooms", success, 
                     f"Expected room data, got: {data}" if not success else "")
        if success and "rooms" in data:
            print(f"   Found {len(data['rooms'])} room types")
            
        # Test public floors endpoint  
        success, data = self.test_endpoint("GET", "/floors", 200, use_session=False)
        self.log_test("GET /api/floors", success,
                     f"Expected floor data, got: {data}" if not success else "")
        if success and "floors" in data:
            print(f"   Found {len(data['floors'])} floors")
            
        # Test contact form
        contact_data = {
            "name": "Test User",
            "email": "test@example.com", 
            "phone": "+91 9876543210",
            "message": "Test message from API test"
        }
        success, data = self.test_endpoint("POST", "/contact", 200, contact_data, use_session=False)
        self.log_test("POST /api/contact", success,
                     f"Contact form failed: {data}" if not success else "")

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication...")
        
        # Test login with correct credentials
        login_data = {"email": "admin@bwimperio.com", "password": "bwimperio"}
        success, data = self.test_endpoint("POST", "/auth/login", 200, login_data)
        self.log_test("POST /api/auth/login (valid)", success,
                     f"Login failed: {data}" if not success else "")
        
        if success and "token" in data:
            self.admin_token = data["token"]
            print(f"   Logged in as: {data.get('email')} ({data.get('role')})")
            
        # Test /auth/me with session
        success, data = self.test_endpoint("GET", "/auth/me", 200)
        self.log_test("GET /api/auth/me", success,
                     f"Auth check failed: {data}" if not success else "")
        
        # Test login with wrong credentials
        wrong_login = {"email": "admin@bwimperio.com", "password": "wrongpass"}
        success, data = self.test_endpoint("POST", "/auth/login", 401, wrong_login, use_session=False)
        self.log_test("POST /api/auth/login (invalid)", success,
                     f"Should reject wrong password: {data}" if not success else "")
        
        # Test brute force protection (5 failed attempts)
        print("   Testing brute force protection...")
        for i in range(5):
            requests.post(f"{self.base_url}/api/auth/login", 
                         json={"email": "admin@bwimperio.com", "password": "wrong"})
        
        success, data = self.test_endpoint("POST", "/auth/login", 429, wrong_login, use_session=False)
        self.log_test("Brute force lockout", success,
                     f"Should be locked after 5 attempts: {data}" if not success else "")

    def test_admin_dashboard(self):
        """Test admin dashboard endpoint"""
        print("\n📊 Testing Admin Dashboard...")
        
        success, data = self.test_endpoint("GET", "/admin/dashboard", 200)
        self.log_test("GET /api/admin/dashboard", success,
                     f"Dashboard failed: {data}" if not success else "")
        
        if success:
            required_fields = ["total_rooms", "available", "booked", "maintenance", 
                             "total_bookings", "total_revenue", "trends"]
            for field in required_fields:
                if field in data:
                    print(f"   {field}: {data[field]}")
                else:
                    self.log_test(f"Dashboard field '{field}'", False, "Missing field")

    def test_admin_rooms(self):
        """Test admin room management endpoints"""
        print("\n🏨 Testing Room Management...")
        
        # List all rooms
        success, data = self.test_endpoint("GET", "/admin/rooms", 200)
        self.log_test("GET /api/admin/rooms", success,
                     f"Room list failed: {data}" if not success else "")
        
        if success and isinstance(data, list):
            print(f"   Found {len(data)} rooms")
            if len(data) > 0:
                room_id = data[0].get("id")
                room_number = data[0].get("room_number")
                
                # Test room status update
                status_data = {"status": "maintenance"}
                success, resp = self.test_endpoint("PUT", f"/admin/rooms/{room_id}/status", 
                                                 200, status_data)
                self.log_test("PUT /api/admin/rooms/{id}/status", success,
                             f"Status update failed: {resp}" if not success else "")
                
                # Test room creation
                new_room = {
                    "room_number": 9999,
                    "floor": 1,
                    "category": "Deluxe",
                    "price": 4500,
                    "status": "available",
                    "description": "Test room",
                    "amenities": ["WiFi", "AC"],
                    "images": [],
                    "side": "left"
                }
                success, resp = self.test_endpoint("POST", "/admin/rooms", 201, new_room)
                self.log_test("POST /api/admin/rooms", success,
                             f"Room creation failed: {resp}" if not success else "")
                
                if success and "id" in resp:
                    created_room_id = resp["id"]
                    
                    # Test room update
                    update_data = new_room.copy()
                    update_data["price"] = 5000
                    success, resp = self.test_endpoint("PUT", f"/admin/rooms/{created_room_id}", 
                                                     200, update_data)
                    self.log_test("PUT /api/admin/rooms/{id}", success,
                                 f"Room update failed: {resp}" if not success else "")
                    
                    # Test room deletion
                    success, resp = self.test_endpoint("DELETE", f"/admin/rooms/{created_room_id}", 200)
                    self.log_test("DELETE /api/admin/rooms/{id}", success,
                                 f"Room deletion failed: {resp}" if not success else "")

    def test_admin_bookings(self):
        """Test admin booking management endpoints"""
        print("\n📅 Testing Booking Management...")
        
        # List bookings
        success, data = self.test_endpoint("GET", "/admin/bookings", 200)
        self.log_test("GET /api/admin/bookings", success,
                     f"Booking list failed: {data}" if not success else "")
        
        if success:
            print(f"   Found {len(data) if isinstance(data, list) else 0} bookings")
            
            # Create test booking
            booking_data = {
                "customer_name": "Test Customer",
                "customer_phone": "+91 9876543210",
                "customer_email": "test@customer.com",
                "room_number": 101,
                "check_in": "2024-12-01",
                "check_out": "2024-12-03",
                "amount": 9000,
                "payment_status": "paid",
                "status": "confirmed"
            }
            success, resp = self.test_endpoint("POST", "/admin/bookings", 200, booking_data)
            self.log_test("POST /api/admin/bookings", success,
                         f"Booking creation failed: {resp}" if not success else "")
            
            if success and "id" in resp:
                booking_id = resp["id"]
                
                # Update booking
                update_data = booking_data.copy()
                update_data["status"] = "cancelled"
                success, resp = self.test_endpoint("PUT", f"/admin/bookings/{booking_id}", 
                                                 200, update_data)
                self.log_test("PUT /api/admin/bookings/{id}", success,
                             f"Booking update failed: {resp}" if not success else "")
                
                # Delete booking
                success, resp = self.test_endpoint("DELETE", f"/admin/bookings/{booking_id}", 200)
                self.log_test("DELETE /api/admin/bookings/{id}", success,
                             f"Booking deletion failed: {resp}" if not success else "")

    def test_admin_settings(self):
        """Test admin settings endpoints"""
        print("\n⚙️ Testing Settings...")
        
        # Get settings
        success, data = self.test_endpoint("GET", "/admin/settings", 200)
        self.log_test("GET /api/admin/settings", success,
                     f"Settings get failed: {data}" if not success else "")
        
        if success:
            # Update settings
            settings_data = {
                "hotel_name": "Best Western Imperio Test",
                "address": "Test Address",
                "phone": "+91 123 456 7890",
                "email": "test@bwimperio.com",
                "logo_url": ""
            }
            success, resp = self.test_endpoint("PUT", "/admin/settings", 200, settings_data)
            self.log_test("PUT /api/admin/settings", success,
                         f"Settings update failed: {resp}" if not success else "")

    def test_logout(self):
        """Test logout endpoint"""
        print("\n🚪 Testing Logout...")
        
        success, data = self.test_endpoint("POST", "/auth/logout", 200)
        self.log_test("POST /api/auth/logout", success,
                     f"Logout failed: {data}" if not success else "")
        
        # Verify session is cleared
        success, data = self.test_endpoint("GET", "/auth/me", 401)
        self.log_test("Session cleared after logout", success,
                     f"Should be unauthorized: {data}" if not success else "")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Backend API Tests for Best Western Imperio")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        try:
            self.test_public_endpoints()
            self.test_auth_endpoints()
            self.test_admin_dashboard()
            self.test_admin_rooms()
            self.test_admin_bookings()
            self.test_admin_settings()
            self.test_logout()
            
        except Exception as e:
            print(f"\n💥 Test suite crashed: {e}")
            return False
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"   • {test['test']}: {test['error']}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        return len(self.failed_tests) == 0

def main():
    tester = ImperioAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())