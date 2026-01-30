import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Enum as SAEnum,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class ExerciseSource(str, enum.Enum):
    DEFAULT = "DEFAULT"
    USER_PRESET = "USER_PRESET"


class BreathingExercise(Base):
    __tablename__ = "breathing_exercises"

    # UML: exerciseID: UUID (store as string in SQLite)
    exerciseID: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    source: Mapped[ExerciseSource] = mapped_column(SAEnum(ExerciseSource), nullable=False)

    defaultRepetitions: Mapped[int] = mapped_column(Integer, nullable=False)
    defaultInhale: Mapped[int] = mapped_column(Integer, nullable=False)
    defaultHold1: Mapped[int] = mapped_column(Integer, nullable=False)
    defaultExhale: Mapped[int] = mapped_column(Integer, nullable=False)
    defaultHold2: Mapped[int] = mapped_column(Integer, nullable=False)

    @property
    def defaultCycleDuration(self) -> int:
        """Derived duration of one breathing cycle in seconds."""
        return (
            self.defaultInhale
            + self.defaultHold1
            + self.defaultExhale
            + self.defaultHold2
        )

    @property
    def defaultTotalDuration(self) -> int:
        """Derived total duration of the exercise in seconds."""
        return self.defaultCycleDuration * self.defaultRepetitions


class ExerciseSession(Base):
    __tablename__ = "exercise_sessions"

    sessionID: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        index=True,
        default=lambda: str(uuid.uuid4()),
    )

    exerciseID: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("breathing_exercises.exerciseID"),
        nullable=False,
        index=True,
    )

    startedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    endedAt: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    wasAborted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    repetitionsPlanned: Mapped[int] = mapped_column(Integer, nullable=False)
    repetitionsCompleted: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    inhaleSec: Mapped[int] = mapped_column(Integer, nullable=False)
    hold1Sec: Mapped[int] = mapped_column(Integer, nullable=False)
    exhaleSec: Mapped[int] = mapped_column(Integer, nullable=False)
    hold2Sec: Mapped[int] = mapped_column(Integer, nullable=False)

    @property
    def cycleDuration(self) -> int:
        """Derived duration of one breathing cycle used in this session."""
        return self.inhaleSec + self.hold1Sec + self.exhaleSec + self.hold2Sec

    @property
    def totalDuration(self) -> int:
        """Derived total duration of the session in seconds."""
        return self.cycleDuration * self.repetitionsCompleted
    