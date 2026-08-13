# Endpoints for viewing responses and simple aggregate stats
import json
from collections import Counter
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api", tags=["responses"])


def build_stats(form: models.Form, responses: list[models.Response]) -> dict:
    stats = {}
    for q in form.questions:
        values = [
            a.value for r in responses for a in r.answers if a.question_id == q.id and a.value
        ]
        if q.type in ("multiple_choice", "dropdown", "yes_no"):
            stats[q.id] = {"type": "counts", "counts": dict(Counter(values))}
        elif q.type == "rating":
            nums = [float(v) for v in values if v]
            avg = round(sum(nums) / len(nums), 2) if nums else None
            stats[q.id] = {"type": "average", "average": avg, "count": len(nums)}
        else:
            stats[q.id] = {"type": "text", "count": len(values)}
    return stats


@router.get("/forms/{form_id}/responses")
def list_responses(form_id: int, db: Session = Depends(get_db)):
    form = db.get(models.Form, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    responses = (
        db.query(models.Response)
        .filter(models.Response.form_id == form_id)
        .order_by(models.Response.submitted_at.desc())
        .all()
    )
    return {
        "total": len(responses),
        "questions": [schemas.QuestionOut.model_validate(q) for q in form.questions],
        "responses": [schemas.ResponseListItemOut.model_validate(r) for r in responses],
        "stats": build_stats(form, responses),
    }


@router.get("/responses/{response_id}", response_model=schemas.ResponseOut)
def get_response(response_id: int, db: Session = Depends(get_db)):
    response = db.get(models.Response, response_id)
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    return response
