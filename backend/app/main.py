import uuid
from fastapi import FastAPI, Depends, Query
from sqlalchemy.orm import Session

from .db import Base, engine, get_db, SessionLocal
from .models import BreathingExercise, ExerciseSource, ExerciseSession
from .schemas import (
    BreathingExerciseCreate,
    BreathingExerciseOut,
    ExerciseSessionStart,
    ExerciseSessionFinish,
    ExerciseSessionOut,
)
from .seed import seed_defaults

app = FastAPI(title="SoriaFlow API")

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
        exerciseID=payload.exerciseID,
        repetitionsUsed=payload.repetitionsUsed,
        inhaleUsed=payload.inhaleUsed,
        hold1Used=payload.hold1Used,
        exhaleUsed=payload.exhaleUsed,
        hold2Used=payload.hold2Used,
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

    session.wasAborted = payload.wasAborted
    # set endedAt to "now"
    from sqlalchemy import func
    session.endedAt = func.now()

    db.commit()
    db.refresh(session)
    return session


@app.get("/sessions", response_model=list[ExerciseSessionOut])
def list_sessions(db: Session = Depends(get_db)):
    return db.query(ExerciseSession).order_by(ExerciseSession.startedAt.desc()).all()
