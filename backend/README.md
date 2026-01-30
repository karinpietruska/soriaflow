# SoriaFlow Backend

This folder contains the backend implementation of the **SoriaFlow** breathing application.
The backend is implemented using **FastAPI**, **SQLAlchemy**, and **SQLite** and provides a REST API
for managing breathing exercises, user-defined presets, and exercise sessions.



## Tech Stack

- Python 3.11
- FastAPI
- SQLAlchemy
- SQLite (local file-based database)
- Uvicorn (ASGI server)



## Setup Instructions

### 1. Create and activate a virtual environment

From the `backend/` directory:

```bash
python -m venv .venv
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the backend server

```bash
uvicorn app.main:app --reload
```

The backend will be available at:

- [http://127.0.0.1:8000](http://127.0.0.1:8000)



## API Documentation (Swagger)

FastAPI provides an interactive OpenAPI UI (Swagger) at:

- [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

This interface can be used to:

- list default and user-defined breathing exercises
- create custom preset exercises
- start and finish exercise sessions
- view session history and computed duration fields



## Database Notes

- A local SQLite database is used for persistence.
- Default breathing exercises are seeded automatically on application startup.
- Seeding is idempotent, meaning restarting the server does not create duplicate default entries.
- User-defined presets are stored as separate exercises with unique IDs.




## Development Notes

- Computed fields (e.g. cycle duration and total duration) are derived dynamically in the backend and are not stored in the database.
- Manual integration testing is performed via the Swagger UI using the OpenAPI specification.



## Project Context

This backend is part of a university software engineering project and is designed
to be lightweight, easy to understand, and suitable for a single-developer workflow.



