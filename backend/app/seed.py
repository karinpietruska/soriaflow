import uuid
from sqlalchemy.orm import Session

from .models import BreathingExercise, ExerciseSource

# name, defaultRepetitions, defaultInhale, defaultHold1, defaultExhale, defaultHold2
DEFAULT_EXERCISES = [
    ("Box Breathing", 8, 4, 4, 4, 4),
    ("4-7-8 Breathing", 4, 4, 7, 8, 0),
    ("Balanced Breathing", 10, 5, 0, 5, 0),
    ("Lengthen Exhale", 10, 4, 0, 8, 0),
]


def seed_defaults(db: Session) -> None:
    existing = (
        db.query(BreathingExercise)
        .filter(BreathingExercise.source == ExerciseSource.DEFAULT)
        .count()
    )
    if existing > 0:
        return

    for name, reps, inhale, hold1, exhale, hold2 in DEFAULT_EXERCISES:
        db.add(
            BreathingExercise(
                exerciseID=str(uuid.uuid4()),
                name=name,
                source=ExerciseSource.DEFAULT,
                defaultRepetitions=reps,
                defaultInhale=inhale,
                defaultHold1=hold1,
                defaultExhale=exhale,
                defaultHold2=hold2,
            )
        )
    db.commit()