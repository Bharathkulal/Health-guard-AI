"""
Tests for Health Assessment API endpoint.
"""

from fastapi.testclient import TestClient
import pytest
from app.main import app

client = TestClient(app)

def test_health_assess_endpoint_unauthorized():
    """Test that endpoint requires authentication."""
    response = client.post("/api/health/assess", json={"age": 45, "gender": "male"})
    assert response.status_code == 401

def test_admin_stats_unauthorized():
    """Test that admin endpoint requires admin role."""
    response = client.get("/api/admin/stats")
    assert response.status_code == 401
