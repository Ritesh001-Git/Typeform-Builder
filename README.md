# Formly — A Typeform Builder

A small, from-scratch clone of Typeform: a form builder with a live preview and a one-question-at-a-time respondent experience, built with Next.js + TypeScript on the frontend and FastAPI + SQLite on the backend.

## Overview

Formly lets you create a form, add questions of several types, publish it to a public link, and review responses with simple summary stats — the core loop of a product like Typeform, kept intentionally small.

## Features

* **Dashboard** — list forms, see draft/published status and response counts, create/rename/duplicate/delete, publish/unpublish.
* **Builder** — three-pane editor (question list → question settings → live preview), drag-and-drop reordering, 8 question types, autosave.
* **Live preview** — the exact same `QuestionRenderer` component used by the public form, so what you see in the builder is what respondents get.
* **Public respondent experience** (`/form/[slug]`) — full-screen, one-question-at-a-time, keyboard navigation (Enter/↑), progress bar, smooth transitions, a thank-you screen.
* **Validation** — required fields, email format, numeric input, valid option selection, rating range — enforced on both the client (instant feedback) and the server (source of truth).
* **Responses page** — per-question stats (option counts, rating averages, text response counts) plus a list of individual responses you can open in detail.
* **Settings page** — publishing controls, the shareable link, and "coming soon" placeholders for logic jumps, integrations, collaboration, payments, file uploads, and advanced auth.
* **Seed data** — 2 forms (1 published, 1 draft) and some sample responses so the app is immediately explorable.

## Tech Stack

| Layer       | Choice                                           |
| ----------- | ------------------------------------------------ |
| Frontend    | Next.js (App Router) + TypeScript + Tailwind CSS |
| Drag & drop | `@dnd-kit` (question reordering only)            |
| Backend     | Python + FastAPI + SQLAlchemy                    |
| Database    | SQLite                                           |
| Infrastructure     | Terraform + AWS                           |
| Deployment  | AWS EC2 + Elastic IP + Security Group + Nginx    |


## Architecture

```text
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

## Project Structure

```text
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

## Database Schema

```text
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

### Relationships

One `Form` has many `Question`s and many `Response`s; one `Response` has many `Answer`s, each tied to the `Question` it answers.

Deleting a `Form` cascades to its questions and responses (and their answers), so there's nothing orphaned to clean up manually.

### Configuration Storage

`config` is stored as a JSON string rather than as separate `Option` rows.

This keeps the schema to four tables instead of five, and question configuration is small and always read/written as a whole, so a normalized `Option` table would add a join without adding real flexibility.

## API

| Method   | Endpoint                             | Purpose                         |
| -------- | ------------------------------------ | ------------------------------- |
| `GET`    | `/api/forms`                         | List forms (+ response_count)   |
| `POST`   | `/api/forms`                         | Create a form                   |
| `GET`    | `/api/forms/{id}`                    | Get a form with its questions   |
| `PUT`    | `/api/forms/{id}`                    | Update title and/or questions   |
| `DELETE` | `/api/forms/{id}`                    | Delete a form                   |
| `POST`   | `/api/forms/{id}/duplicate`          | Duplicate a form                |
| `POST`   | `/api/forms/{id}/publish`            | Publish (needs ≥1 question)     |
| `POST`   | `/api/forms/{id}/unpublish`          | Unpublish                       |
| `GET`    | `/api/forms/{id}/responses`          | Responses + per-question stats  |
| `GET`    | `/api/responses/{id}`                | A single response's answers     |
| `GET`    | `/api/public/forms/{slug}`           | Published form, for respondents |
| `POST`   | `/api/public/forms/{slug}/responses` | Submit a response               |

## Setup

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 seed.py
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` for the dashboard.

## Environment Variables

| Variable              | Where    | Default                 | Purpose                     |
| --------------------- | -------- | ----------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | frontend | `http://localhost:8000` | Base URL the frontend calls |

The backend has no required environment variables; it always writes to `./typeform_clone.db` next to `main.py`.

## Running the Backend

See the [Backend](#backend) setup instructions above.

API docs are auto-generated by FastAPI at:

```text
http://localhost:8000/docs
```

## Running the Frontend

See the [Frontend](#frontend) setup instructions above.

The frontend expects the backend to already be running at `NEXT_PUBLIC_API_URL`.

## Deployment

The application is currently deployed on **AWS EC2** and is accessible through a public HTTP endpoint.

## AWS Deployment Architecture

```text
                         Internet
                            │
                            │ HTTP :80
                            ▼
                    ┌─────────────────┐
                    │    AWS EC2      │
                    │                 │
                    │     Nginx       │
                    │      :80        │
                    └────────┬────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
          Next.js Frontend        FastAPI Backend
             :3000                    :8000
                                         │
                                         ▼
                                  SQLite Database
```

### AWS Services Used

* **Amazon EC2** – Hosts the Next.js frontend and FastAPI backend.
* **Elastic IP** – Provides a persistent public IP address for accessing the application.
* **Security Group** – Controls inbound and outbound traffic to the EC2 instance.

  * Port `22` – SSH access.
  * Port `80` – HTTP application access.
  * Ports `3000` and `8000` are not exposed publicly; they are accessed internally through Nginx.
* **Nginx** – Acts as a reverse proxy and routes requests:

  * `/` → Next.js frontend running on port `3000`
  * `/api/*` → FastAPI backend running on port `8000`
* **SQLite** – Used as the database for the current deployment.

## Terraform Infrastructure

AWS infrastructure was provisioned using **Terraform** instead of creating the resources manually.

Terraform was used to create and configure:

* EC2 instance(s)
* Elastic IP
* Security Group
* Required networking configuration
* EC2 instance configuration required for application deployment

This makes the infrastructure reproducible and allows the AWS resources to be recreated using Infrastructure as Code.

## Application Deployment

The application is deployed on the EC2 instance as two services:

```text
Next.js Frontend
      │
      │ Port 3000
      ▼
   Nginx :80
      │
      │ /api/*
      ▼
FastAPI Backend
      │
      ▼
SQLite Database
```

Both the frontend and backend are managed using **systemd services**, allowing them to start automatically when the EC2 instance starts and restart automatically if a service fails.

The application can currently be accessed using:

```text
http://18.214.229.58/
```

## Current Deployment Limitation

The current deployment uses **HTTP instead of HTTPS** for simplicity and rapid deployment.

Therefore, communication between the client and the EC2 instance is currently **not encrypted**.

## Future Deployment Architecture

For a production-ready deployment, the architecture can be improved by introducing an **AWS Application Load Balancer (ALB)**.

```text
                         Internet
                            │
                            ▼
                  ┌───────────────────┐
                  │   Application     │
                  │   Load Balancer   │
                  │       (ALB)       │
                  └─────────┬─────────┘
                            │
                     HTTPS / HTTP
                            │
                            ▼
                  ┌───────────────────┐
                  │      EC2 /        │
                  │  Backend Server   │
                  └─────────┬─────────┘
                            │
                     FastAPI :8000
                            │
                            ▼
                         Database
```

In the future architecture:

* Users will communicate with the **Application Load Balancer** instead of directly accessing the backend EC2 instance.
* The ALB will act as the public entry point and route incoming requests to the appropriate backend target.
* HTTPS can be configured using an **AWS Certificate Manager (ACM)** certificate.
* EC2 instances can be placed behind the ALB and their backend ports can be restricted to traffic originating from the ALB Security Group.
* This architecture provides better **security, scalability, availability, and traffic management**.
* The application can later be extended with an **Auto Scaling Group** to run multiple backend instances behind the ALB.

The current EC2 deployment provides a simple working deployment, while the ALB-based architecture is the planned direction for a more secure and production-ready system.

## Assumptions

* No authentication: anyone with the dashboard URL can manage all forms (matches the assignment's "no unnecessary authentication" guidance). A real product would scope forms to a logged-in workspace.
* A submitted response is final — there's no edit-after-submit flow, which matches Typeform's own respondent experience.
* "Duplicate" copies the form's questions but resets status to draft and starts with zero responses.
* Deleting a form permanently deletes its responses (no soft-delete/undo).

## Future Improvements

* Real logic jumps (branching based on earlier answers).
* CSV export of responses.
* Per-question drag-and-drop for options beyond up/down buttons.
* Optimistic UI for publish/unpublish and delete (currently a normal request/await).
* Pagination for forms with a very large number of responses.
