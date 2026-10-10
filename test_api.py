"""
====================================================================
QuickBite Food Delivery Platform — Automated API & Integration Test Suite
Python 3 Test Runner for REST API Endpoints & MongoDB Persistence
====================================================================
"""

import urllib.request
import urllib.error
import json
import time
import sys

# Ensure UTF-8 output encoding on Windows terminals
if sys.platform == 'win32' and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:5000/api"

def make_request(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            status_code = response.getcode()
            response_body = response.read().decode("utf-8")
            return status_code, json.loads(response_body) if response_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, {"error": err_body}
    except Exception as e:
        return 0, {"error": str(e)}

def run_tests():
    print("=" * 65)
    print("  [+] QuickBite Full-Stack Automated Test Suite (Python 3)")
    print("=" * 65)
    
    tests_passed = 0
    total_tests = 0

    def test(name, condition, details=""):
        nonlocal tests_passed, total_tests
        total_tests += 1
        if condition:
            tests_passed += 1
            print(f"  [PASS] {name}")
            if details:
                print(f"         └─ {details}")
        else:
            print(f"  [FAIL] {name}")
            if details:
                print(f"         └─ Error: {details}")

    # 1. Health Check
    code, res = make_request("/health")
    test(
        "API Health & DB Connectivity",
        code == 200 and res.get("status") == "OK",
        f"Status: {res.get('status')}, MongoDB: {res.get('mongodb')}"
    )

    # 2. Get Categories
    code, res = make_request("/categories")
    test(
        "Fetch Categories (/api/categories)",
        code == 200 and isinstance(res, list) and len(res) > 0,
        f"Retrieved {len(res) if isinstance(res, list) else 0} categories"
    )

    # 3. Get Restaurants
    code, res = make_request("/restaurants")
    test(
        "Fetch All Restaurants (/api/restaurants)",
        code == 200 and isinstance(res, list) and len(res) > 0,
        f"Retrieved {len(res) if isinstance(res, list) else 0} restaurants"
    )

    # 4. Search & Filter Restaurants
    code, res = make_request("/restaurants?category=pizza")
    test(
        "Filter Restaurants by Category (/api/restaurants?category=pizza)",
        code == 200 and isinstance(res, list) and all(r.get("category") == "pizza" for r in res),
        f"Retrieved {len(res) if isinstance(res, list) else 0} pizza restaurants"
    )

    # 5. Get Single Restaurant by ID
    code, res = make_request("/restaurants/r1")
    test(
        "Fetch Single Restaurant (/api/restaurants/r1)",
        code == 200 and res.get("id") == "r1",
        f"Restaurant: {res.get('name', 'N/A')} with {len(res.get('menu', []))} menu categories"
    )

    # 6. User Registration & Auth
    test_email = f"tester_{int(time.time())}@quickbite.demo"
    code, res = make_request("/auth/register", method="POST", data={
        "name": "Alex Morgan",
        "email": test_email,
        "password": "Password123!",
        "phone": "+91 9876543210"
    })
    test(
        "User Registration (/api/auth/register)",
        code in [200, 201] and res.get("success") is True,
        f"Registered user: {res.get('user', {}).get('email', test_email)}"
    )

    # 7. User Login
    code, res = make_request("/auth/login", method="POST", data={
        "email": test_email,
        "password": "Password123!"
    })
    test(
        "User Authentication (/api/auth/login)",
        code == 200 and res.get("success") is True,
        f"Authenticated: {res.get('user', {}).get('name', 'N/A')}"
    )

    # 8. Create Order
    test_order_id = f"QB{int(time.time() * 1000) % 1000000}"
    order_payload = {
        "orderId": test_order_id,
        "customerName": "Alex Morgan",
        "phone": "+91 9876543210",
        "address": "42 Cyber City, Sector 62",
        "city": "Chennai",
        "pincode": "600017",
        "notes": "Please deliver with hot packaging",
        "paymentMethod": "card",
        "items": [
            {
                "id": "r1-m1",
                "name": "Margherita Classica",
                "price": 299,
                "qty": 2,
                "restaurantId": "r1"
            }
        ],
        "subtotal": 598,
        "deliveryFee": 29,
        "taxes": 30,
        "discount": 0,
        "total": 657,
        "status": "Placed"
    }
    code, res = make_request("/orders", method="POST", data=order_payload)
    test(
        "Create Order (/api/orders)",
        code in [200, 201] and res.get("success") is True,
        f"Order ID: {test_order_id}, Total: ₹{order_payload['total']}"
    )

    # 9. Fetch Orders (Order History)
    code, res = make_request("/orders")
    test(
        "Fetch Order History (/api/orders)",
        code == 200 and isinstance(res, list) and any(o.get("orderId") == test_order_id for o in res),
        f"Verified order {test_order_id} in persisted database history"
    )

    # 10. Update Order Status (PATCH)
    code, res = make_request(f"/orders/{test_order_id}/status", method="PATCH", data={
        "status": "Confirmed"
    })
    test(
        "Update Order Status (/api/orders/:id/status)",
        code == 200 and res.get("success") is True and res.get("order", {}).get("status") == "Confirmed",
        f"Order {test_order_id} transitioned to 'Confirmed'"
    )

    print("=" * 65)
    print(f"  Summary: {tests_passed}/{total_tests} Tests Passed ({(tests_passed/total_tests)*100:.1f}%)")
    print("=" * 65)

    return 0 if tests_passed == total_tests else 1

if __name__ == "__main__":
    sys.exit(run_tests())
