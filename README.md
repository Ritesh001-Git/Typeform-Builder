# Formly — a Typeform clone

A small, from-scratch clone of Typeform: a form builder with a live preview
and a one-question-at-a-time respondent experience, built with Next.js +
TypeScript on the frontend and FastAPI + SQLite on the backend.

## 1. Overview

Formly lets you create a form, add questions of several types, publish it to
a public link, and review responses with simple summary stats — the core
loop of a product like Typeform, kept intentionally small.

## 2. Features

- **Dashboard** — list forms, see draft/published status and response
  counts, create/rename/duplicate/delete, publish/unpublish.
- **Builder** — three-pane editor (question list → question settings → live
  preview), drag-and-drop reordering, 8 question types, autosave.
- **Live preview** — the exact same `QuestionRenderer` component used by the
  public form, so what you see in the builder is what respondents get.
- **Public respondent experience** (`/form/[slug]`) — full-screen,
  one-question-at-a-time, keyboard navigation (Enter/↑), progress bar, smooth
  transitions, a thank-you screen.
- **Validation** — required fields, email format, numeric input, valid
  option selection, rating range — enforced on both the client (instant
  feedback) and the server (source of truth).
- **Responses page** — per-question stats (option counts, rating averages,
  text response counts) plus a list of individual responses you can open in
  detail.
- **Settings page** — publishing controls, the shareable link, and
  "coming soon" placeholders for logic jumps, integrations, collaboration,
  payments, file uploads, and advanced auth.
- **Seed data** — 3 forms (2 published, 1 draft) and 16 sample responses so
  the app is immediately explorable.

## 3. Tech stack

| Layer     | Choice                                              |
|-----------|------------------------------------------------------|
| Frontend  | Next.js (App Router) + TypeScript + Tailwind CSS      |
| Drag & drop | `@dnd-kit` (question reordering only)               |
| Backend   | Python + FastAPI + SQLAlchemy                        |
| Database  | SQLite                                                |
| Testing   | pytest + FastAPI's `TestClient`                       |

No Redux, no ORM-generated admin, no auth system — kept deliberately small.

## 4. Architecture

```
Browser
  │  fetch (JSON)
  ▼
Next.js frontend (client components)
  │  lib/api.ts — one thin fetch wrapper per endpoint
  ▼
FastAPI backend
  │  routes/forms.py, responses.py, public.py — route handlers
  │  validation.py — shared answer-validation rules
  │  models.py — SQLAlchemy ORM models
  ▼
SQLite (typeform_clone.db)
```

Two design choices worth calling out for an interview:

1. **The builder autosaves by replacing the whole question list.** `PUT
   /api/forms/{id}` accepts the form's title and its *entire* question
   array, deletes the form's existing questions, and re-inserts the new
   ones in the order sent. This avoids writing per-question diffing logic
   (add/edit/delete/reorder all become "send the current array") at the
   cost of re-writing rows on every save — an easy trade-off given forms
   have a handful of questions, not thousands.
2. **One shared `QuestionRenderer`.** Both the builder's live preview and
   the public respondent page render questions through the same component,
   so there's no second implementation to keep in sync, and no drift
   between "what you designed" and "what respondents see."

## 5. Folder structure

```
typeform-clone/
├── backend/
│   ├── main.py            # FastAPI app, CORS, router registration
│   ├── database.py        # SQLAlchemy engine/session
│   ├── models.py          # Form, Question, Response, Answer
│   ├── schemas.py         # Pydantic request/response models
│   ├── validation.py      # Shared server-side answer validation
│   ├── seed.py             # Sample data
│   ├── routes/
│   │   ├── forms.py       # CRUD + duplicate/publish/unpublish
│   │   ├── responses.py   # List/detail responses + stats
│   │   └── public.py      # Public form fetch + response submission
│   └── tests/
│       └── test_api.py
└── frontend/
    ├── app/
    │   ├── page.tsx                        # Dashboard
    │   ├── forms/new/page.tsx              # Create + redirect to builder
    │   ├── forms/[id]/page.tsx             # Builder
    │   ├── forms/[id]/responses/page.tsx   # Responses + stats
    │   ├── forms/[id]/settings/page.tsx    # Publish, link, danger zone
    │   └── form/[slug]/page.tsx            # Public respondent experience
    ├── components/         # FormCard, QuestionEditor, QuestionList,
    │                        # QuestionRenderer, PublicFormRunner, Toast, ...
    ├── lib/                 # api.ts, validate.ts, format.ts
    ├── types/                # Shared TypeScript types
    └── hooks/                # useDebouncedCallback
```

## 6. Database schema

```
Form
 ├─ id            PK
 ├─ title
 ├─ public_id     unique slug used in /form/[slug], e.g. "feedback-a1b2c3"
 ├─ status        "draft" | "published"
 ├─ created_at
 └─ updated_at

Question
 ├─ id            PK
 ├─ form_id       FK -> Form.id
 ├─ type          short_text | long_text | multiple_choice | dropdown |
 │                email | number | yes_no | rating
 ├─ title
 ├─ description
 ├─ required
 ├─ position      int, defines display order
 └─ config        JSON text: {"options": [...]} or {"max": 5}

Response
 ├─ id            PK
 ├─ form_id       FK -> Form.id
 └─ submitted_at

Answer
 ├─ id            PK
 ├─ response_id   FK -> Response.id
 ├─ question_id   FK -> Question.id
 └─ value         text (JSON-encoded when the raw value isn't a string)
```

Relationships: one `Form` has many `Question`s and many `Response`s; one
`Response` has many `Answer`s, each tied to the `Question` it answers.
Deleting a `Form` cascades to its questions and responses (and their
answers), so there's nothing orphaned to clean up manually.

`config` is stored as a JSON string rather than as separate `Option` rows.
This keeps the schema to four tables instead of five, and question
configuration is small and always read/written as a whole, so a normalized
`Option` table would add a join without adding real flexibility.

## 7. API overview

```
GET    /api/forms                              list forms (+ response_count)
POST   /api/forms                               create a form
GET    /api/forms/{id}                          get a form with its questions
PUT    /api/forms/{id}                          update title and/or questions
DELETE /api/forms/{id}                          delete a form
POST   /api/forms/{id}/duplicate                duplicate a form
POST   /api/forms/{id}/publish                  publish (needs ≥1 question)
POST   /api/forms/{id}/unpublish                unpublish

GET    /api/forms/{id}/responses                responses + per-question stats
GET    /api/responses/{id}                      a single response's answers

GET    /api/public/forms/{slug}                 published form, for respondents
POST   /api/public/forms/{slug}/responses       submit a response
```

## 8. Setup instructions

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
python seed.py            # populates typeform_clone.db with sample data
uvicorn main:app --reload # runs on http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                         # runs on http://localhost:3000
```

Open `http://localhost:3000` for the dashboard.

## 9. Environment variables

| Variable               | Where     | Default                  | Purpose                       |
|-------------------------|-----------|---------------------------|--------------------------------|
| `NEXT_PUBLIC_API_URL`  | frontend  | `http://localhost:8000`  | Base URL the frontend calls    |

The backend has no required environment variables; it always writes to
`./typeform_clone.db` next to `main.py`.

## 10. Seeding the database

`python seed.py` (run from `backend/`) clears and repopulates the database
with 3 forms (Customer Feedback and Event Registration, both published;
Product Survey as a draft) and 16 sample responses across the two published
forms. Safe to re-run any time.

## 11. Running the backend

See "Setup instructions" above. API docs are auto-generated by FastAPI at
`http://localhost:8000/docs`.

## 12. Running the frontend

See "Setup instructions" above. The frontend expects the backend to already
be running at `NEXT_PUBLIC_API_URL`.

## 13. Design decisions

- **Autosave over explicit save buttons.** The builder debounces changes
  (700ms) and saves in the background, matching how Typeform's own builder
  feels. A small "Saving… / Saved" indicator in the header gives feedback.
- **Client-assigned temporary IDs for new questions.** New questions get a
  negative, client-only `id` (so drag-and-drop and React keys work
  immediately); real IDs are only fetched again on page reload. Because
  saves replace the whole question list, there's no need to reconcile
  server-assigned IDs back into the editing session.
- **One validation ruleset, mirrored not shared.** `lib/validate.ts` and
  `validation.py` implement the same rules independently (the frontend
  can't literally import Python). The backend is authoritative; the
  frontend copy exists purely for instant feedback.
- **No global state library.** All state lives in the page components that
  need it (builder state doesn't need to be visible to the dashboard).
  Given the app's size, Redux/Zustand would be pure overhead.
- **Hand-rolled SVG icon set** instead of an icon library dependency —
  there are only a dozen icons used, so a small `components/icons.tsx` file
  is simpler than adding a package.

## 14. Assumptions

- No authentication: anyone with the dashboard URL can manage all forms
  (matches the assignment's "no unnecessary authentication" guidance).
  A real product would scope forms to a logged-in workspace.
- A submitted response is final — there's no edit-after-submit flow, which
  matches Typeform's own respondent experience.
- "Duplicate" copies the form's questions but resets status to draft and
  starts with zero responses.
- Deleting a form permanently deletes its responses (no soft-delete/undo).

## 15. Future improvements

- Real logic jumps (branching based on earlier answers).
- CSV export of responses.
- Per-question drag-and-drop for options beyond up/down buttons.
- Optimistic UI for publish/unpublish and delete (currently a normal
  request/await).
- Pagination for forms with a very large number of responses.
