#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class HotelAPITester:
    def __init__(self, base_url="https://imperio-luxury.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, expected_keys=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            else:
                print(f"❌ Unsupported method: {method}")
                return False, {}

            print(f"   Status Code: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
                # Check response content if expected_keys provided
                if expected_keys:
                    try:
                        response_data = response.json()
                        for key in expected_keys:
                            if key not in response_data:
                                print(f"⚠️  Warning: Expected key '{key}' not found in response")
                            else:
                                print(f"   ✓ Found expected key: {key}")
                        return True, response_data
                    except json.JSONDecodeError:
                        print(f"⚠️  Warning: Response is not valid JSON")
                        return True, {}
                else:
                    try:
                        return True, response.json()
                    except:
                        return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error Response: {error_data}")
                except:
                    print(f"   Error Response: {response.text}")
                
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'endpoint': endpoint
                })
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            self.failed_tests.append({
                'test': name,
                'error': 'Request timeout',
                'endpoint': endpoint
            })
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            self.failed_tests.append({
                'test': name,
                'error': 'Connection error',
                'endpoint': endpoint
            })
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'error': str(e),
                'endpoint': endpoint
            })
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "api/",
            200,
            expected_keys=["message"]
        )
        return success

    def test_get_rooms(self):
        """Test GET /api/rooms endpoint"""
        success, response = self.run_test(
            "Get Rooms",
            "GET",
            "api/rooms",
            200,
            expected_keys=["rooms"]
        )
        
        if success and "rooms" in response:
            rooms = response["rooms"]
            print(f"   Found {len(rooms)} rooms")
            
            # Validate room structure
            expected_room_keys = ["id", "name", "price", "description", "amenities", "images", "size"]
            for i, room in enumerate(rooms):
                print(f"   Room {i+1}: {room.get('name', 'Unknown')}")
                for key in expected_room_keys:
                    if key not in room:
                        print(f"   ⚠️  Missing key '{key}' in room {i+1}")
                    
            # Check for expected rooms
            room_ids = [room.get('id') for room in rooms]
            expected_rooms = ['deluxe', 'executive']
            for expected_id in expected_rooms:
                if expected_id in room_ids:
                    print(f"   ✓ Found expected room: {expected_id}")
                else:
                    print(f"   ⚠️  Missing expected room: {expected_id}")
        
        return success

    def test_get_floors(self):
        """Test GET /api/floors endpoint"""
        success, response = self.run_test(
            "Get Floors",
            "GET",
            "api/floors",
            200,
            expected_keys=["floors"]
        )
        
        if success and "floors" in response:
            floors = response["floors"]
            print(f"   Found {len(floors)} floors")
            
            # Validate floor structure
            expected_floor_keys = ["floor", "label", "rooms"]
            for i, floor in enumerate(floors):
                print(f"   Floor {i+1}: {floor.get('label', 'Unknown')}")
                for key in expected_floor_keys:
                    if key not in floor:
                        print(f"   ⚠️  Missing key '{key}' in floor {i+1}")
                
                # Check rooms in floor
                if "rooms" in floor:
                    rooms = floor["rooms"]
                    print(f"     - {len(rooms)} rooms on this floor")
                    
                    # Validate room structure
                    expected_room_keys = ["number", "status", "type", "price", "side"]
                    for room in rooms[:2]:  # Check first 2 rooms
                        for key in expected_room_keys:
                            if key not in room:
                                print(f"     ⚠️  Missing key '{key}' in room {room.get('number', 'Unknown')}")
        
        return success

    def test_post_contact(self):
        """Test POST /api/contact endpoint"""
        test_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": "test@example.com",
            "phone": "+91 9876543210",
            "message": "This is a test message from automated testing."
        }
        
        success, response = self.run_test(
            "Create Contact",
            "POST",
            "api/contact",
            200,
            data=test_data,
            expected_keys=["id", "name", "email", "message", "created_at"]
        )
        
        if success:
            print(f"   Contact created with ID: {response.get('id', 'Unknown')}")
            
            # Validate response data matches input
            for key in ["name", "email", "message"]:
                if response.get(key) == test_data[key]:
                    print(f"   ✓ {key} matches input")
                else:
                    print(f"   ⚠️  {key} doesn't match input")
        
        return success

    def test_get_contacts(self):
        """Test GET /api/contacts endpoint"""
        success, response = self.run_test(
            "Get Contacts",
            "GET",
            "api/contacts",
            200
        )
        
        if success:
            if isinstance(response, list):
                print(f"   Found {len(response)} contacts")
                if len(response) > 0:
                    # Check structure of first contact
                    contact = response[0]
                    expected_keys = ["id", "name", "email", "message", "created_at"]
                    for key in expected_keys:
                        if key in contact:
                            print(f"   ✓ Contact has key: {key}")
                        else:
                            print(f"   ⚠️  Contact missing key: {key}")
            else:
                print(f"   ⚠️  Expected list response, got: {type(response)}")
        
        return success

def main():
    print("🏨 Best Western Imperio Hotel API Testing")
    print("=" * 50)
    
    # Setup
    tester = HotelAPITester()
    
    # Run all tests
    tests = [
        tester.test_api_root,
        tester.test_get_rooms,
        tester.test_get_floors,
        tester.test_post_contact,
        tester.test_get_contacts,
    ]
    
    for test in tests:
        test()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            error_msg = failure.get('error', f"Expected {failure.get('expected')}, got {failure.get('actual')}")
            print(f"   - {failure['test']}: {error_msg}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"\n🎯 Success Rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())