import uuid
from sqlalchemy.orm import Session

from .models import BreathingExercise, ExerciseSource

# name, description, defaultRepetitions, defaultInhale, defaultHold1, defaultExhale, defaultHold2
DEFAULT_EXERCISES = [
    ("Box Breathing", "Equal inhale, hold, exhale, and hold durations.", 8, 4, 4, 4, 4),
    ("4-7-8 Breathing", "Inhale 4, hold 7, exhale 8 for relaxation.", 4, 4, 7, 8, 0),
    ("Balanced Breathing", "Equal inhale and exhale without holds.", 10, 5, 0, 5, 0),
    ("Lengthen Exhale", "Longer exhale to encourage calm breathing.", 10, 4, 0, 8, 0),
]


def seed_defaults(db: Session) -> None:
    for name, description, reps, inhale, hold1, exhale, hold2 in DEFAULT_EXERCISES:
        exists = (
            db.query(BreathingExercise)
            .filter(
                BreathingExercise.name == name,
                BreathingExercise.source == ExerciseSource.DEFAULT,
            )
            .first()
        )
        if exists:
            continue

        db.add(
            BreathingExercise(
                exerciseID=str(uuid.uuid4()),
                name=name,
                description=description,
                source=ExerciseSource.DEFAULT,
                defaultRepetitions=reps,
                defaultInhale=inhale,
                defaultHold1=hold1,
                defaultExhale=exhale,
                defaultHold2=hold2,
            )
        )
    db.commit()