# HealthGuard AI - FastAPI & MongoDB Backend

Production backend service for HealthGuard AI clinical assessment ingestion, structured validation, MongoDB persistence, and upcoming ML risk stratification pipelines.

## Features
- **FastAPI Framework**: High performance async API with automatic OpenAPI Swagger documentation.
- **MongoDB Async Layer**: Async Motor connection pool with index configuration and seamless resilience fallback.
- **Strict Clinical Validation**: Pydantic v2 schemas validating patient ranges, biological sex, BMI computation, and structured symptoms.
- **Unified Response Format**: Consistent JSON envelope `{ "success": bool, "data": Any, "message": str }`.
- **CORS Configured**: Dynamic origin configuration from `.env`.

---

## Directory Layout
```text
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── assessments.py  # Ingest, retrieve, and query assessments
│   │   │   ├── health.py       # Vitality and DB connectivity checks
│   │   │   └── users.py        # User profile endpoints
│   │   └── router.py           # Main aggregated API router
│   ├── core/
│   │   └── config.py           # Pydantic Settings & environment loader
│   ├── database/
│   │   └── mongodb.py          # Motor async connection & collections
│   ├── models/
│   │   ├── assessment.py       # MongoDB document helpers & ID generation
│   │   └── user.py
│   ├── schemas/
│   │   ├── assessment.py       # Clinical input validation & BMI logic
│   │   ├── response.py         # Standard APIResponse generic
│   │   └── user.py
│   ├── services/
│   │   └── assessment_service.py # Persistence & query business logic
│   └── main.py                 # FastAPI application & lifespan
├── tests/
│   └── test_api.py             # Integration test suite
├── requirements.txt
├── .env.example
├── run.py
└── README.md
```

---

## Quickstart

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `MONGODB_URI` points to your running MongoDB instance (e.g., `mongodb://localhost:27017`). If MongoDB is not running locally, the backend gracefully utilizes in-memory fallback storage.

### 3. Run the Server
```bash
python run.py
```
Or directly with Uvicorn:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 4. Interactive Documentation
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service vitality & MongoDB connection check |
| `POST` | `/api/assessments` | Submit and store a validated health assessment |
| `GET` | `/api/assessments/{id}` | Retrieve health assessment by ID |
| `GET` | `/api/assessments` | List assessment history (paginated) |
| `GET` | `/api/users/profile` | Retrieve user profile & calibrations |
| `PUT` | `/api/users/profile` | Update user profile |

---

## Running Automated Tests
```bash
python tests/test_api.py
```
