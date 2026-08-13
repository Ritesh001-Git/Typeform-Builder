# SQLAlchemy ORM models.

import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, Text, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from database import Base


def now():
    return datetime.datetime.utcnow()

# Form - a survey/typeform. Has many Questions and Responses.
class Form(Base):
    __tablename__ = "forms"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, default="Untitled Form")
    public_id = Column(String, unique=True, index=True, nullable=False)  # used in /form/[slug]
    status = Column(String, nullable=False, default="draft")  # "draft" | "published"
    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, default=now, onupdate=now)

    questions = relationship(
        "Question", back_populates="form", cascade="all, delete-orphan",
        order_by="Question.position"
    )
    responses = relationship(
        "Response", back_populates="form", cascade="all, delete-orphan"
    )

# Question  -- a single question belonging to a Form, ordered by `position`.
class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)
    type = Column(String, nullable=False) 
    title = Column(String, nullable=False, default="")
    description = Column(String, nullable=True, default="")
    required = Column(Boolean, default=False)
    position = Column(Integer, nullable=False, default=0)
    config = Column(Text, nullable=True, default="{}")

    form = relationship("Form", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

# Response  -- one respondent's submission for a Form.
class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)
    submitted_at = Column(DateTime, default=now)

    form = relationship("Form", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")

# Answer - one answer within a Response, tied to the Question it answers.
class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("responses.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    value = Column(Text, nullable=True)

    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")
