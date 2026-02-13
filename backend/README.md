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

You can run the server in two ways.

#### Option A — Classic (default database)

Uses the default database file `app.db`. Either:

```bash
uvicorn app.main:app --reload
```

or, from the `backend/` directory:

```bash
python run.py
```

Both use `app.db`. Tables are created if missing, and default exercises are seeded on first run.

#### Option B — Demo mode (prefilled data)

Uses the prefilled database `demo.db` for demonstrations. **Do not** start uvicorn manually; use the run script:

```bash
python run.py --demo
```

- Database file: `demo.db` is **included in the repo** (shipped with the project). It is pre-filled with demo exercises, sessions, and mood entries—no setup needed.
- `app.db` is not used or modified in demo mode.

**Summary**

| How you start              | Database used |
|----------------------------|----------------|
| `uvicorn app.main:app --reload` | `app.db`       |
| `python run.py`            | `app.db`       |
| `python run.py --demo`     | `demo.db`      |

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
- **Default database** (`app.db`): Created automatically when you start the server (classic or `python run.py`). Default breathing exercises are seeded on first run. Seeding is idempotent, so restarts do not create duplicate default entries.
- **Demo database** (`demo.db`): Used only when you run `python run.py --demo`. It is **shipped in the repo** and already contains demo exercises, sessions, and mood entries. The application uses demo.db as a normal writable SQLite database. Any changes made while running in demo mode (e.g., new presets, sessions, or mood entries) will modify this file. If you want to restore the original demo state, reset demo.db from the repository (e.g., by discarding local changes or re-checking out the file).
- User-defined presets are stored as separate exercises with unique IDs.




## Development Notes

- Computed fields (e.g. cycle duration and total duration) are derived dynamically in the backend and are not stored in the database.
- Manual integration testing is performed via the Swagger UI using the OpenAPI specification.



## Project Context

This backend is part of a university software engineering project and is designed
to be lightweight, easy to understand, and suitable for a single-developer workflow.



