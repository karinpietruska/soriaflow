import uuid
from datetime import datetime, timezone

from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .db import Base, engine, get_db, SessionLocal
from .models import BreathingExercise, ExerciseSource, ExerciseSession, MoodEntry
from .schemas import (
    BreathingExerciseCreate,
    BreathingExerciseOut,
    ExerciseSessionStart,
    ExerciseSessionFinish,
    ExerciseSessionOut,
    MoodEntryCreate,
    MoodEntryOut,
)
from .seed import seed_defaults

app = FastAPI(title="SoriaFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Seed default exercises (simple approach for this project)
with SessionLocal() as db:
    seed_defaults(db)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/exercises", response_model=list[BreathingExerciseOut])
def list_exercises(
    source: ExerciseSource | None = Query(default=None),
    db: Session = Depends(get_db),
):
    q = db.query(BreathingExercise)
    if source is not None:
        q = q.filter(BreathingExercise.source == source)
    return q.order_by(BreathingExercise.name.asc()).all()


@app.post("/exercises", response_model=BreathingExerciseOut)
def create_exercise(payload: BreathingExerciseCreate, db: Session = Depends(get_db)):
    exercise = BreathingExercise(
        exerciseID=str(uuid.uuid4()),
        **payload.model_dump(),
    )
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise


@app.post("/sessions/start", response_model=ExerciseSessionOut)
def start_session(payload: ExerciseSessionStart, db: Session = Depends(get_db)):
    # ensure exercise exists
    ex = db.query(BreathingExercise).filter(BreathingExercise.exerciseID == payload.exerciseID).first()
    if not ex:
        raise HTTPException(status_code=404, detail="BreathingExercise not found")

    session = ExerciseSession(
        sessionID=str(uuid.uuid4()),
        exerciseID=payload.exerciseID,
        repetitionsPlanned=payload.repetitionsPlanned,
        repetitionsCompleted=0,
        inhaleSec=payload.inhaleSec,
        hold1Sec=payload.hold1Sec,
        exhaleSec=payload.exhaleSec,
        hold2Sec=payload.hold2Sec,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@app.post("/sessions/{sessionID}/finish", response_model=ExerciseSessionOut)
def finish_session(sessionID: str, payload: ExerciseSessionFinish, db: Session = Depends(get_db)):
    session = db.query(ExerciseSession).filter(ExerciseSession.sessionID == sessionID).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.endedAt is not None:
        raise HTTPException(status_code=400, detail="Session already finished")

    if payload.repetitionsCompleted > session.repetitionsPlanned:
        raise HTTPException(
            status_code=400,
            detail="repetitionsCompleted cannot exceed repetitionsPlanned",
        )

    session.wasAborted = payload.wasAborted
    session.repetitionsCompleted = payload.repetitionsCompleted
    # set endedAt to "now"
    session.endedAt = datetime.now(timezone.utc)

    db.commit()
    db.refresh(session)
    return session


@app.get("/sessions", response_model=list[ExerciseSessionOut])
def list_sessions(
    exerciseID: str | None = Query(default=None, description="Filter by exerciseID"),
    start: datetime | None = Query(default=None, description="Start datetime (ISO 8601)"),
    end: datetime | None = Query(default=None, description="End datetime (ISO 8601)"),
    db: Session = Depends(get_db),
):
    q = db.query(ExerciseSession)

    if exerciseID is not None:
        q = q.filter(ExerciseSession.exerciseID == exerciseID)

    if start is not None:
        q = q.filter(ExerciseSession.startedAt >= start)

    if end is not None:
        q = q.filter(ExerciseSession.startedAt <= end)

    return q.order_by(ExerciseSession.startedAt.desc()).all()


@app.get("/moods", response_model=list[MoodEntryOut])
def list_moods(db: Session = Depends(get_db)):
    return db.query(MoodEntry).order_by(MoodEntry.timeStamp.desc()).all()


@app.post("/moods", response_model=MoodEntryOut)
def create_mood(payload: MoodEntryCreate, db: Session = Depends(get_db)):
    entry = MoodEntry(color=payload.color)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry