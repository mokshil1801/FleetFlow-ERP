import requests
import sys

BASE_URL = "http://localhost:8000"

def test_health():
    print("Testing Health Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_auth_and_audit():
    print("\nTesting Registration and Audit Logging...")
    email = "test_verify@fleetflow.com"
    password = "verify_password_123"
    name = "Verification Bot"
    
    # 1. Register
    reg_payload = {
        "email": email,
        "password": password,
        "name": name,
        "role": "Manager"
    }
    try:
        reg_response = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
        print(f"Registration Status: {reg_response.status_code}")
        if reg_response.status_code != 201:
            # Check if user already exists
            if "already registered" in reg_response.text:
                print("User already exists, proceeding to login test.")
            else:
                print(f"Registration Failed: {reg_response.text}")
                return False
        
        # 2. Login
        login_payload = {"email": email, "password": password}
        login_response = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
        print(f"Login Status: {login_response.status_code}")
        if login_response.status_code != 200:
            print(f"Login Failed: {login_response.text}")
            return False
        
        token = login_response.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 3. Check Audit Logs
        audit_response = requests.get(f"{BASE_URL}/audit/logs", headers=headers)
        print(f"Audit Log Retrieval Status: {audit_response.status_code}")
        if audit_response.status_code == 200:
            logs = audit_response.json()["data"]
            print(f"Total Audit Logs found: {len(logs)}")
            # Look for recent registration or login
            recent_events = [log["event"] for log in logs[:5]]
            print(f"Recent events: {recent_events}")
            if "Login" in recent_events or "Registration" in recent_events:
                print("Success: New events found in Audit Trail!")
                return True
            else:
                print("Failure: Expected events not found in Audit Trail.")
                return False
        else:
            print(f"Audit Log Retrieval Failed: {audit_response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    if test_health() and test_auth_and_audit():
        print("\nVerification PASSED.")
        sys.exit(0)
    else:
        print("\nVerification FAILED.")
        sys.exit(1)
