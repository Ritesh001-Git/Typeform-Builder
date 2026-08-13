# CRUD + lifecycle endpoints for forms
import json
import re
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/forms", tags=["forms"])


def slugify(text: str) -> str:
    text = re.sub(r"[^a-zA-Z0-9\s-]", "", text).strip().lower()
    return re.sub(r"[\s-]+", "-", text)


def make_public_id(title: str) -> str:
    base = slugify(title)[:40] or "form"
    return f"{base}-{uuid.uuid4().hex[:6]}"


@router.get("", response_model=list[schemas.FormListItemOut])
def list_forms(db: Session = Depends(get_db)):
    rows = (
        db.query(models.Form, func.count(models.Response.id).label("response_count"))
        .outerjoin(models.Response, models.Response.form_id == models.Form.id)
        .group_by(models.Form.id)
        .order_by(models.Form.updated_at.desc())
        .all()
    )
    result = []
    for form, count in rows:
        result.append(schemas.FormListItemOut(
            id=form.id, title=form.title, public_id=form.public_id, status=form.status,
            created_at=form.created_at, updated_at=form.updated_at, response_count=count,
        ))
    return result


@router.post("", response_model=schemas.FormDetailOut, status_code=201)
def create_form(payload: schemas.FormCreate, db: Session = Depends(get_db)):
    form = models.Form(title=payload.title, public_id=make_public_id(payload.title))
    db.add(form)
    db.commit()
    db.refresh(form)
    return form


def get_form_or_404(form_id: int, db: Session) -> models.Form:
    form = db.get(models.Form, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


@router.get("/{form_id}", response_model=schemas.FormDetailOut)
def get_form(form_id: int, db: Session = Depends(get_db)):
    return get_form_or_404(form_id, db)


@router.put("/{form_id}", response_model=schemas.FormDetailOut)
def update_form(form_id: int, payload: schemas.FormUpdate, db: Session = Depends(get_db)):
    form = get_form_or_404(form_id, db)

    if payload.title is not None:
        form.title = payload.title

    if payload.questions is not None:
        db.query(models.Question).filter(models.Question.form_id == form_id).delete()
        for i, q in enumerate(payload.questions):
            db.add(models.Question(
                form_id=form_id,
                type=q.type,
                title=q.title,
                description=q.description,
                required=q.required,
                position=i,
                config=json.dumps(q.config),
            ))

    db.commit()
    db.refresh(form)
    return form


@router.delete("/{form_id}", status_code=204)
def delete_form(form_id: int, db: Session = Depends(get_db)):
    form = get_form_or_404(form_id, db)
    db.delete(form)
    db.commit()


@router.post("/{form_id}/duplicate", response_model=schemas.FormDetailOut, status_code=201)
def duplicate_form(form_id: int, db: Session = Depends(get_db)):
    original = get_form_or_404(form_id, db)
    copy = models.Form(
        title=f"{original.title} (copy)",
        public_id=make_public_id(original.title),
        status="draft",
    )
    db.add(copy)
    db.flush()
    for q in original.questions:
        db.add(models.Question(
            form_id=copy.id, type=q.type, title=q.title, description=q.description,
            required=q.required, position=q.position, config=q.config,
        ))
    db.commit()
    db.refresh(copy)
    return copy


@router.post("/{form_id}/publish", response_model=schemas.FormDetailOut)
def publish_form(form_id: int, db: Session = Depends(get_db)):
    form = get_form_or_404(form_id, db)
    if not form.questions:
        raise HTTPException(status_code=400, detail="Add at least one question before publishing")
    form.status = "published"
    db.commit()
    db.refresh(form)
    return form


@router.post("/{form_id}/unpublish", response_model=schemas.FormDetailOut)
def unpublish_form(form_id: int, db: Session = Depends(get_db)):
    form = get_form_or_404(form_id, db)
    form.status = "draft"
    db.commit()
    db.refresh(form)
    return form
