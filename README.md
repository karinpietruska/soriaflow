# SoriaFlow – Breathing & Emotional Awareness Application

SoriaFlow is a lightweight, browser-based web application that supports short breathing exercises and optional emotional self-reflection.  
The application focuses on simplicity, local execution, and a calm user experience without interpretation or evaluation of user input.

---

## Features

- Selection and configuration of breathing exercises
- Guided breathing animation running entirely in the browser
- Start and finish of breathing sessions with persistent history
- Optional logging of subjective states using color-based mood entries
- Local data persistence (no cloud services, no user accounts)



## Architecture Overview

SoriaFlow is implemented as a **local client–server web application**

- **Frontend**: Runs fully in the browser and handles UI, interaction, and breathing animations
- **Backend**: Local REST API implemented with FastAPI
- **Persistence**: SQLite database accessed via SQLAlchemy ORM

The application is designed as a **single-user system**.  
There is no technically persisted user management; all data is implicitly associated with the local installation context.



## Technology Stack

### Frontend
- HTML5 / CSS / JavaScript
- GSAP (GreenSock Animation Platform) for breathing animations
- Bootstrap for layout and responsive UI
- Vite as build tool

### Backend
- Python 3.11+
- FastAPI
- Pydantic for request and response validation

### Persistence
- SQLite
- SQLAlchemy ORM



## Installation & Setup

### Prerequisites

- Python 3.11 or newer
- Node.js (for frontend development and build)
- Modern web browser (Chrome, Firefox, Edge, Safari)



### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate (cmd) | .venv\Scripts\Activate.ps1 (PowerShell)
pip install -r requirements.txt
```


#### Start the backend (default database)

```bash
uvicorn app.main:app --reload
```
This starts the backend using the default database file `app.db`.
If `app.db` does not exist, it will be created automatically and initialized with the default breathing exercises.

#### Start the backend with prefilled demo data (optional)

```bash
cd backend
python run.py --demo
```

This starts the backend using `demo.db`, which contains pre-filled example data (e.g., sessions and mood entries) for demonstration and testing purposes.

Note: demo.db is writable. Any changes made while running in demo mode will modify this file locally.

When using demo mode, do not start `uvicorn` manually — `run.py` starts the server automatically.

The backend will be available at:
http://127.0.0.1:8000

Interactive API documentation (Swagger UI):
http://127.0.0.1:8000/docs

For more backend details, see `backend/README.md`.


### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:
http://localhost:5173


## Data Storage

All application data is stored locally in a SQLite database file (`app.db` by default or `demo.db` in demo mode).
No external services, cloud storage, or third-party APIs are used.

If you change database schemas or default exercise seed data, delete `backend/app.db`
and restart the backend to recreate tables and seed defaults.

Stored entities include:
- Breathing exercises (including user-defined presets)
- Breathing sessions
- Mood entries (color-based subjective states)


## Usage Notes

- Breathing animations and timers run entirely in the browser
- A breathing session is created when an exercise starts and finalized when it ends or is aborted
- Sessions without at least one completed repetition are not shown in the history view
- Mood logging after an exercise is optional and can be deactivated by the user


## Project Status

This project was developed as part of an academic context.
The current implementation focuses on a clear, minimal feature set and a locally executable architecture.

Potential future extensions include:
- Multi-user support
- Extended analytics or visualizations
- Cloud-based persistence


## License

This project is provided for educational purposes.
No warranty or guarantee of fitness for any particular use is given.