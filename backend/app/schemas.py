from datetime import datetime
from pydantic import BaseModel, Field
from .models import ExerciseSource


class BreathingExerciseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    source: ExerciseSource = ExerciseSource.USER_PRESET

    defaultRepetitions: int = Field(ge=1, le=500)
    defaultInhale: int = Field(ge=1, le=600)
    defaultHold1: int = Field(ge=0, le=600)
    defaultExhale: int = Field(ge=1, le=600)
    defaultHold2: int = Field(ge=0, le=600)


class BreathingExerciseOut(BreathingExerciseCreate):
    exerciseID: str
    defaultCycleDuration: int
    defaultTotalDuration: int

    class Config:
        from_attributes = True


class ExerciseSessionStart(BaseModel):
    exerciseID: str

    repetitionsPlanned: int = Field(ge=1, le=500)
    inhaleSec: int = Field(ge=1, le=600)
    hold1Sec: int = Field(ge=0, le=600)
    exhaleSec: int = Field(ge=1, le=600)
    hold2Sec: int = Field(ge=0, le=600)


class ExerciseSessionFinish(BaseModel):
    wasAborted: bool = False
    repetitionsCompleted: int = Field(ge=0, le=500)


class ExerciseSessionOut(BaseModel):
    sessionID: str
    exerciseID: str
    startedAt: datetime
    endedAt: datetime | None
    wasAborted: bool

    repetitionsPlanned: int
    repetitionsCompleted: int
    inhaleSec: int
    hold1Sec: int
    exhaleSec: int
    hold2Sec: int
    cycleDuration: int
    totalDuration: int

    class Config:
        from_attributes = True
