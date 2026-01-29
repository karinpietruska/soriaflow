from datetime import datetime
from pydantic import BaseModel, Field
from .models import ExerciseSource


class BreathingExerciseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    source: ExerciseSource = ExerciseSource.USER_PRESET

    defaultRepetitions: int = Field(ge=1, le=500)
    defaultInhale: int = Field(ge=1, le=600)
    defaultHold1: int = Field(ge=0, le=600)
    defaultExhale: int = Field(ge=1, le=600)
    defaultHold2: int = Field(ge=0, le=600)


class BreathingExerciseOut(BreathingExerciseCreate):
    exerciseID: str

    class Config:
        from_attributes = True


class ExerciseSessionStart(BaseModel):
    exerciseID: str

    repetitionsUsed: int = Field(ge=1, le=500)
    inhaleUsed: int = Field(ge=1, le=600)
    hold1Used: int = Field(ge=0, le=600)
    exhaleUsed: int = Field(ge=1, le=600)
    hold2Used: int = Field(ge=0, le=600)


class ExerciseSessionFinish(BaseModel):
    wasAborted: bool = False


class ExerciseSessionOut(BaseModel):
    sessionID: str
    exerciseID: str
    startedAt: datetime
    endedAt: datetime | None
    wasAborted: bool

    repetitionsUsed: int
    inhaleUsed: int
    hold1Used: int
    exhaleUsed: int
    hold2Used: int

    class Config:
        from_attributes = True
