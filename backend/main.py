"""FastAPI application entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routes import forms, responses, public

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Typeform Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forms.router)
app.include_router(responses.router)
app.include_router(public.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
