"""
HealthGuard AI - Authentication, Authorization, Privacy and IDOR Security Tests.
"""

import os
import sys
import uuid
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_client_cookies():
    """Clears client session cookies before each test."""
    client.cookies.clear()
    yield
    client.cookies.clear()


def test_health_check():
    """Verify backend root and health check are responsive."""
    response = client.get("/api/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "ok"


def test_user_registration_and_validation():
    """Verify user registration, input validation, and password strength requirements."""
    unique_email = f"test.user.{uuid.uuid4().hex[:8]}@example.com"

    # 1. Weak password (missing digit / <8 chars) -> 422
    weak_payload = {
        "name": "Weak Pass User",
        "email": unique_email,
        "password": "short",
        "confirm_password": "short",
    }
    weak_res = client.post("/api/auth/register", json=weak_payload)
    assert weak_res.status_code == 422
    assert weak_res.json()["success"] is False

    # 2. Password mismatch -> 422
    mismatch_payload = {
        "name": "Mismatch User",
        "email": unique_email,
        "password": "ValidPassword123!",
        "confirm_password": "DifferentPassword123!",
    }
    mismatch_res = client.post("/api/auth/register", json=mismatch_payload)
    assert mismatch_res.status_code == 422

    # 3. Valid Registration -> 201 Created
    valid_payload = {
        "name": "Dr. Clara Oswald",
        "email": unique_email,
        "password": "SecurePassword2026!",
        "confirm_password": "SecurePassword2026!",
    }
    reg_res = client.post("/api/auth/register", json=valid_payload)
    assert reg_res.status_code == 201
    reg_json = reg_res.json()
    assert reg_json["success"] is True
    assert "data" in reg_json
    assert "access_token" in reg_json["data"]
    assert reg_json["data"]["user"]["email"] == unique_email.lower()
    assert reg_json["data"]["user"]["name"] == "Dr. Clara Oswald"
    # Verify no hashed password is leaked
    assert "hashed_password" not in reg_json["data"]["user"]
    assert "password" not in reg_json["data"]["user"]

    # 4. Duplicate Registration -> 400 Bad Request
    dup_res = client.post("/api/auth/register", json=valid_payload)
    assert dup_res.status_code == 400
    assert "already registered" in dup_res.json()["message"].lower()


def test_user_login_and_sanitization():
    """Verify login authentication, incorrect password handling, and token issuance."""
    unique_email = f"login.test.{uuid.uuid4().hex[:8]}@example.com"
    password = "CorrectPassword2026!"

    # Create account
    client.post(
        "/api/auth/register",
        json={
            "name": "Login Test User",
            "email": unique_email,
            "password": password,
            "confirm_password": password,
        },
    )
    client.cookies.clear()

    # 1. Bad password -> 401 Unauthorized
    bad_login_res = client.post(
        "/api/auth/login",
        json={"email": unique_email, "password": "WrongPassword999!"},
    )
    assert bad_login_res.status_code == 401
    assert bad_login_res.json()["message"] == "Invalid email or password."

    # 2. Nonexistent user -> 401 Unauthorized (generic message prevents account enumeration)
    nonexistent_res = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@healthguard.ai", "password": "SomePassword123!"},
    )
    assert nonexistent_res.status_code == 401
    assert nonexistent_res.json()["message"] == "Invalid email or password."

    # 3. Successful login -> 200 OK
    login_res = client.post(
        "/api/auth/login",
        json={"email": unique_email, "password": password},
    )
    assert login_res.status_code == 200
    login_json = login_res.json()
    assert login_json["success"] is True
    assert "access_token" in login_json["data"]
    assert login_json["data"]["user"]["email"] == unique_email


def test_session_verification_and_unauthorized_access():
    """Verify GET /api/auth/me behavior with and without valid JWT tokens."""
    # 1. Unauthenticated request -> 401
    client.cookies.clear()
    unauth_res = client.get("/api/auth/me")
    assert unauth_res.status_code == 401

    # 2. Tampered / invalid token -> 401
    tampered_res = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid.fake.token"},
    )
    assert tampered_res.status_code == 401

    # 3. Authenticated session -> 200 OK
    unique_email = f"me.test.{uuid.uuid4().hex[:8]}@example.com"
    reg_res = client.post(
        "/api/auth/register",
        json={
            "name": "Session Tester",
            "email": unique_email,
            "password": "ValidPassword2026!",
            "confirm_password": "ValidPassword2026!",
        },
    )
    token = reg_res.json()["data"]["access_token"]
    client.cookies.clear()

    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    me_json = me_res.json()
    assert me_json["data"]["email"] == unique_email
    assert me_json["data"]["name"] == "Session Tester"


def test_idor_and_assessment_isolation():
    """
    CRITICAL SECURITY TEST:
    Verify that User A cannot access User B's clinical health records (IDOR protection).
    Verify that backend forces user_id from token, ignoring spoofed user_id in body.
    """
    client.cookies.clear()
    # Register User A
    user_a_email = f"usera.{uuid.uuid4().hex[:8]}@example.com"
    res_a = client.post(
        "/api/auth/register",
        json={"name": "User Alpha", "email": user_a_email, "password": "UserPass123!", "confirm_password": "UserPass123!"},
    )
    token_a = res_a.json()["data"]["access_token"]
    user_a_id = res_a.json()["data"]["user"]["user_id"]

    client.cookies.clear()
    # Register User B
    user_b_email = f"userb.{uuid.uuid4().hex[:8]}@example.com"
    res_b = client.post(
        "/api/auth/register",
        json={"name": "User Beta", "email": user_b_email, "password": "UserPass123!", "confirm_password": "UserPass123!"},
    )
    token_b = res_b.json()["data"]["access_token"]
    user_b_id = res_b.json()["data"]["user"]["user_id"]

    client.cookies.clear()

    # User A creates health assessment with spoofed user_id in payload
    assessment_payload = {
        "user_id": "spoofed_target_victim_id",
        "age": 45,
        "gender": "male",
        "height_cm": 175.0,
        "weight_kg": 80.0,
        "systolic_bp": 130,
        "diastolic_bp": 85,
        "blood_sugar": 102.0,
        "heart_rate": 72,
        "symptoms": ["fatigue"],
        "lifestyle": {
            "physical_activity": "moderate",
            "smoking": "never",
            "alcohol": "occasional",
            "sleep_hours": 7.0,
            "diet": "balanced",
        },
        "family_history": {
            "diabetes": True,
            "hypertension": False,
            "heart_disease": False,
            "early_heart_attack": False,
        },
    }

    create_res = client.post(
        "/api/assessments",
        json=assessment_payload,
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert create_res.status_code == 201
    assessment_doc = create_res.json()["data"]
    assessment_id = assessment_doc["assessment_id"]

    # Verify backend bound it to User A, rejecting the spoofed ID
    assert assessment_doc["user_id"] == user_a_id

    # User A can retrieve their own assessment
    get_a_res = client.get(
        f"/api/assessments/{assessment_id}",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert get_a_res.status_code == 200
    assert get_a_res.json()["data"]["assessment_id"] == assessment_id

    # User B attempts to access User A's assessment -> MUST BE REJECTED WITH 404
    get_b_res = client.get(
        f"/api/assessments/{assessment_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert get_b_res.status_code == 404, "User B was able to access User A's clinical record (IDOR Vulnerability)!"

    # User B checks history -> should NOT contain User A's record
    history_b_res = client.get(
        "/api/assessments",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert history_b_res.status_code == 200
    b_records = history_b_res.json()["data"]
    for rec in b_records:
        assert rec["assessment_id"] != assessment_id


def test_password_change_flow():
    """Verify password update with current password validation."""
    client.cookies.clear()
    email = f"pwd.test.{uuid.uuid4().hex[:8]}@example.com"
    old_pwd = "OldPassword2026!"
    new_pwd = "NewSecurePassword2026!"

    # Register
    reg_res = client.post(
        "/api/auth/register",
        json={"name": "Password Tester", "email": email, "password": old_pwd, "confirm_password": old_pwd},
    )
    token = reg_res.json()["data"]["access_token"]
    client.cookies.clear()

    # 1. Wrong current password -> 400
    fail_change = client.post(
        "/api/auth/change-password",
        json={"current_password": "WrongCurrentPassword123!", "new_password": new_pwd, "confirm_new_password": new_pwd},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert fail_change.status_code == 400

    # 2. Correct current password -> 200
    success_change = client.post(
        "/api/auth/change-password",
        json={"current_password": old_pwd, "new_password": new_pwd, "confirm_new_password": new_pwd},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert success_change.status_code == 200
    assert success_change.json()["success"] is True

    client.cookies.clear()
    # 3. Old password login now fails -> 401
    old_login = client.post("/api/auth/login", json={"email": email, "password": old_pwd})
    assert old_login.status_code == 401

    client.cookies.clear()
    # 4. New password login succeeds -> 200
    new_login = client.post("/api/auth/login", json={"email": email, "password": new_pwd})
    assert new_login.status_code == 200


def test_cascading_account_deletion():
    """Verify permanent deletion of user profile and all associated clinical telemetry."""
    client.cookies.clear()
    email = f"del.test.{uuid.uuid4().hex[:8]}@example.com"
    password = "DeletePassword2026!"

    # 1. Register user
    reg_res = client.post(
        "/api/auth/register",
        json={"name": "Delete Target", "email": email, "password": password, "confirm_password": password},
    )
    token = reg_res.json()["data"]["access_token"]
    user_id = reg_res.json()["data"]["user"]["user_id"]
    client.cookies.clear()

    # 2. Create assessment under account
    client.post(
        "/api/assessments",
        json={
            "age": 30,
            "gender": "female",
            "height_cm": 165.0,
            "weight_kg": 60.0,
            "systolic_bp": 120,
            "diastolic_bp": 80,
            "blood_sugar": 95.0,
            "heart_rate": 70,
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    # 3. Delete account with wrong password -> 400
    wrong_del = client.request(
        "DELETE",
        "/api/auth/account",
        json={"password": "WrongPassword123!", "confirmation": "DELETE"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert wrong_del.status_code == 400

    # 4. Delete account with correct password -> 200
    valid_del = client.request(
        "DELETE",
        "/api/auth/account",
        json={"password": password, "confirmation": "DELETE"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert valid_del.status_code == 200
    assert valid_del.json()["success"] is True

    client.cookies.clear()
    # 5. Subsequent access to /api/auth/me with old token -> 401
    subsequent_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert subsequent_me.status_code == 401

    # 6. Subsequent login -> 401
    subsequent_login = client.post("/api/auth/login", json={"email": email, "password": password})
    assert subsequent_login.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
