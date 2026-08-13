# Public, unauthenticated endpoints used by the respondent-facing form
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from validation import validate_answer

router = APIRouter(prefix="/api/public/forms", tags=["public"])


@router.get("/{slug}", response_model=schemas.PublicFormOut)
def get_public_form(slug: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.public_id == slug).first()
    if not form or form.status != "published":
        raise HTTPException(status_code=404, detail="This form isn't available")
    return form


@router.post("/{slug}/responses", status_code=201)
def submit_response(slug: str, payload: schemas.ResponseCreate, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.public_id == slug).first()
    if not form or form.status != "published":
        raise HTTPException(status_code=404, detail="This form isn't available")

    questions_by_id = {q.id: q for q in form.questions}
    errors = {}
    for a in payload.answers:
        question = questions_by_id.get(a.question_id)
        if not question:
            continue
        ok, message = validate_answer(question, a.value)
        if not ok:
            errors[a.question_id] = message

    # Every required question must be present in the submission at all.
    answered_ids = {a.question_id for a in payload.answers}
    for q in form.questions:
        if q.required and q.id not in answered_ids:
            errors[q.id] = "This question is required"

    if errors:
        raise HTTPException(status_code=422, detail={"errors": errors})

    response = models.Response(form_id=form.id)
    db.add(response)
    db.flush()
    for a in payload.answers:
        if a.value is None or a.value == "":
            continue
        value_str = a.value if isinstance(a.value, str) else json.dumps(a.value)
        db.add(models.Answer(response_id=response.id, question_id=a.question_id, value=value_str))
    db.commit()
    return {"ok": True}
