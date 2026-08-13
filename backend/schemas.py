# Pydantic schemas for request/response validation.
import json
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, field_validator

QUESTION_TYPES = {
    "short_text", "long_text", "multiple_choice", "dropdown",
    "email", "number", "yes_no", "rating",
}

# Question 

class QuestionIn(BaseModel):
    type: str
    title: str = ""
    description: Optional[str] = ""
    required: bool = False
    position: int = 0
    config: dict = {}

    @field_validator("type")
    @classmethod
    def valid_type(cls, v):
        if v not in QUESTION_TYPES:
            raise ValueError(f"Invalid question type: {v}")
        return v


class QuestionOut(BaseModel):
    id: int
    form_id: int
    type: str
    title: str
    description: Optional[str] = ""
    required: bool
    position: int
    config: dict

    @field_validator("config", mode="before")
    @classmethod
    def parse_config(cls, v):
        if isinstance(v, str):
            return json.loads(v) if v else {}
        return v

    class Config:
        from_attributes = True


# Form

class FormCreate(BaseModel):
    title: str = "Untitled Form"


class FormUpdate(BaseModel):
    title: Optional[str] = None
    questions: Optional[list[QuestionIn]] = None


class FormOut(BaseModel):
    id: int
    title: str
    public_id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FormDetailOut(FormOut):
    questions: list[QuestionOut] = []


class FormListItemOut(FormOut):
    response_count: int = 0


# Response / Answer

class AnswerIn(BaseModel):
    question_id: int
    value: Any = None


class ResponseCreate(BaseModel):
    answers: list[AnswerIn]


class AnswerOut(BaseModel):
    id: int
    question_id: int
    value: Optional[str] = None

    class Config:
        from_attributes = True


class ResponseOut(BaseModel):
    id: int
    form_id: int
    submitted_at: datetime
    answers: list[AnswerOut] = []

    class Config:
        from_attributes = True


class ResponseListItemOut(BaseModel):
    id: int
    submitted_at: datetime

    class Config:
        from_attributes = True


# Public

class PublicQuestionOut(BaseModel):
    id: int
    type: str
    title: str
    description: Optional[str] = ""
    required: bool
    position: int
    config: dict

    @field_validator("config", mode="before")
    @classmethod
    def parse_config(cls, v):
        if isinstance(v, str):
            return json.loads(v) if v else {}
        return v

    class Config:
        from_attributes = True


class PublicFormOut(BaseModel):
    title: str
    public_id: str
    questions: list[PublicQuestionOut] = []

    class Config:
        from_attributes = True
