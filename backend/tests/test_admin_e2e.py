"""
Comprehensive End-to-End Test Suite for HealthGuard AI Admin & ML Management Pipeline.
Tests Admin Auth, Dataset Upload, Validation, Training, Model Activation, and Active Model Prediction Routing.
"""

import os
import sys
import asyncio
from httpx import AsyncClient, ASGITransport

# Ensure paths
BACKEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

ML_ROOT = os.path.abspath(os.path.join(BACKEND_ROOT, "..", "ml"))
if ML_ROOT not in sys.path:
    sys.path.insert(0, ML_ROOT)

from app.main import app
from app.core.config import settings


def test_admin_full_pipeline_e2e():
    async def _runner():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            # 1. Authenticate as Administrator
            login_res = await client.post(
                "/api/auth/login",
                json={"email": settings.ADMIN_USERNAME, "password": settings.ADMIN_PASSWORD},
            )
            assert login_res.status_code == 200, f"Login failed: {login_res.text}"
            login_data = login_res.json()
            assert login_data["success"] is True
            token = login_data["data"]["access_token"]
            headers = {"Authorization": f"Bearer {token}"}

            # 2. Get Admin Overview Stats
            stats_res = await client.get("/api/admin/stats", headers=headers)
            assert stats_res.status_code == 200
            stats_json = stats_res.json()
            assert stats_json["success"] is True
            assert "total_users" in stats_json["data"]
            assert "total_assessments" in stats_json["data"]
            assert "active_models_count" in stats_json["data"]

            # 3. List Datasets in Library
            ds_list_res = await client.get("/api/admin/datasets", headers=headers)
            assert ds_list_res.status_code == 200
            ds_list_json = ds_list_res.json()
            assert ds_list_json["success"] is True
            assert len(ds_list_json["data"]) > 0
            first_ds_id = ds_list_json["data"][0]["dataset_id"]

            # 4. Validate First Dataset
            val_res = await client.post(
                f"/api/admin/datasets/{first_ds_id}/validate",
                headers=headers,
                json={"target_column": ds_list_json["data"][0].get("target_column")},
            )
            assert val_res.status_code == 200
            val_json = val_res.json()
            assert val_json["success"] is True
            assert "checks" in val_json["data"]
            assert len(val_json["data"]["checks"]) > 0

            # 5. Upload a New Custom Dataset (CSV)
            sample_csv = (
                "age,sex,trestbps,chol,fbs,thalach,target\n"
                "55,1,140,240,0,150,0\n"
                "60,1,150,260,1,130,1\n"
                "45,0,120,200,0,165,0\n"
                "65,1,160,280,1,120,1\n"
                "50,0,130,220,0,155,0\n"
                "58,1,145,250,0,140,1\n"
                "42,0,115,190,0,170,0\n"
                "62,1,155,270,1,125,1\n"
                "52,1,135,230,0,160,0\n"
                "68,1,165,290,1,115,1\n"
                "48,0,125,210,0,160,0\n"
                "59,1,148,255,1,135,1\n"
                "44,0,118,195,0,168,0\n"
                "63,1,158,275,1,122,1\n"
                "51,1,132,225,0,158,0\n"
                "67,1,162,285,1,118,1\n"
                "46,0,122,205,0,162,0\n"
                "57,1,142,245,0,145,1\n"
                "43,0,116,192,0,169,0\n"
                "64,1,156,272,1,124,1\n"
                "53,1,136,235,0,156,0\n"
                "69,1,168,295,1,112,1\n"
            )
            files = {"file": ("test_cohort.csv", sample_csv.encode("utf-8"), "text/csv")}
            upload_res = await client.post(
                "/api/admin/datasets/upload",
                headers=headers,
                files=files,
                data={"name": "Test Clinical Cohort", "target_column": "target"},
            )
            assert upload_res.status_code == 200
            upload_json = upload_res.json()
            assert upload_json["success"] is True
            uploaded_ds_id = upload_json["data"]["dataset_id"]
            assert upload_json["data"]["records_count"] == 22

            # 6. Train a Custom Model on Uploaded Dataset
            train_res = await client.post(
                "/api/admin/models/train",
                headers=headers,
                json={
                    "dataset_id": uploaded_ds_id,
                    "target_column": "target",
                    "prediction_type": "heart",
                    "algorithm": "RandomForest",
                    "test_size": 0.2,
                    "model_name": "Test Heart RandomForest Model",
                    "auto_activate": True,
                },
            )
            assert train_res.status_code == 200
            train_json = train_res.json()
            assert train_json["success"] is True
            assert "accuracy" in train_json["data"]
            assert "confusion_matrix" in train_json["data"]
            trained_model_id = train_json["data"]["model_id"]
            assert train_json["data"]["is_active"] is True

            # 7. Verify Model Appears in Registry as Active
            models_res = await client.get("/api/admin/models", headers=headers)
            assert models_res.status_code == 200
            models_json = models_res.json()
            assert any(m["model_id"] == trained_model_id and m["is_active"] for m in models_json["data"])

            # 8. Run Patient Risk Assessment via User API to ensure it uses the Active Model
            assess_payload = {
                "age": 55,
                "gender": "male",
                "systolic_bp": 145,
                "diastolic_bp": 92,
                "blood_sugar": 115,
                "heart_rate": 78,
                "height_cm": 175,
                "weight_kg": 82,
                "lifestyle": {
                    "smoking": "never",
                    "alcohol": "occasional",
                    "physical_activity": "moderate",
                    "sleep_hours": 7.0,
                },
                "family_history": {
                    "heart_disease": True,
                    "diabetes": False,
                    "hypertension": True,
                },
                "symptoms": ["chest_pressure"],
            }
            assess_res = await client.post(
                "/api/health/assess",
                headers=headers,
                json=assess_payload,
            )
            assert assess_res.status_code == 200
            assess_json = assess_res.json()
            assert assess_json["success"] is True
            assert "overall_risk" in assess_json["data"]
            assert "heart" in assess_json["data"]
            assert "diabetes" in assess_json["data"]

            # 9. Verify Analytics Endpoints
            analytics_res = await client.get("/api/admin/analytics", headers=headers)
            assert analytics_res.status_code == 200
            assert "daily_trends" in analytics_res.json()["data"]

            risk_dist_res = await client.get("/api/admin/analytics/risk-distribution", headers=headers)
            assert risk_dist_res.status_code == 200
            assert "overall" in risk_dist_res.json()["data"]

            user_stats_res = await client.get("/api/admin/analytics/user-statistics", headers=headers)
            assert user_stats_res.status_code == 200
            assert "total_users" in user_stats_res.json()["data"]

            # 10. Check All Users & Assessment History
            users_res = await client.get("/api/admin/users", headers=headers)
            assert users_res.status_code == 200
            assert isinstance(users_res.json()["data"], list)

            history_res = await client.get("/api/admin/assessments", headers=headers)
            assert history_res.status_code == 200
            assert isinstance(history_res.json()["data"], list)

            # 11. Check System Health
            health_res = await client.get("/api/admin/system/health", headers=headers)
            assert health_res.status_code == 200
            health_json = health_res.json()
            assert health_json["data"]["api"]["status"] == "HEALTHY"
            assert health_json["data"]["ml_service"]["status"] == "ACTIVE"

            # 12. Cleanup uploaded test dataset
            del_res = await client.delete(f"/api/admin/datasets/{uploaded_ds_id}", headers=headers)
            assert del_res.status_code == 200

    asyncio.run(_runner())
