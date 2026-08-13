# Populate the database with sample forms, questions, and responses.
import json
import random
from database import SessionLocal, Base, engine
import models
from routes.forms import make_public_id

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Start clean so the script is safe to re-run.
db.query(models.Answer).delete()
db.query(models.Response).delete()
db.query(models.Question).delete()
db.query(models.Form).delete()
db.commit()

# ---------- Form 1: Customer Feedback (published) ----------
feedback = models.Form(
    title="Customer Feedback",
    public_id=make_public_id("Customer Feedback"),
    status="published",
)
db.add(feedback)
db.flush()

feedback_questions = [
    dict(type="short_text", title="What's your name?", required=True),
    dict(type="email", title="What's your email?", description="We'll only use this to follow up.", required=True),
    dict(type="rating", title="How would you rate your experience?", required=True, config={"max": 5}),
    dict(type="multiple_choice", title="Which feature do you use most?", required=True,
         config={"options": ["Dashboard", "Builder", "Analytics", "Integrations"]}),
    dict(type="yes_no", title="Would you recommend us to a friend?", required=True),
    dict(type="long_text", title="Anything else you'd like to share?", required=False),
]
for i, q in enumerate(feedback_questions):
    config = q.pop("config", {})
    db.add(models.Question(form_id=feedback.id, position=i, config=json.dumps(config), **q))

# ---------- Form 2: Event Registration (published) ----------
event = models.Form(
    title="Event Registration",
    public_id=make_public_id("Event Registration"),
    status="published",
)
db.add(event)
db.flush()

event_questions = [
    dict(type="short_text", title="Full name", required=True),
    dict(type="email", title="Email address", required=True),
    dict(type="number", title="How many guests are you bringing?", required=True),
    dict(type="dropdown", title="Which session will you attend?", required=True,
         config={"options": ["Morning workshop", "Afternoon panel", "Evening keynote"]}),
    dict(type="multiple_choice", title="Dietary preference", required=False,
         config={"options": ["No restrictions", "Vegetarian", "Vegan", "Gluten-free"]}),
]
for i, q in enumerate(event_questions):
    config = q.pop("config", {})
    db.add(models.Question(form_id=event.id, position=i, config=json.dumps(config), **q))


# ---------- Sample responses for the two published forms ----------

def add_response(form_id, question_map, answers):
    r = models.Response(form_id=form_id)
    db.add(r)
    db.flush()
    for key, value in answers.items():
        db.add(models.Answer(response_id=r.id, question_id=question_map[key].id, value=str(value)))


feedback_qs = {q.title: q for q in db.query(models.Question).filter(models.Question.form_id == feedback.id)}
names = ["Alex Kim", "Priya Nair", "Jordan Lee", "Sam Patel", "Riley Chen", "Morgan Diaz"]
features = ["Dashboard", "Builder", "Analytics", "Integrations"]
for i in range(10):
    add_response(feedback.id, feedback_qs, {
        "What's your name?": names[i % len(names)],
        "What's your email?": f"user{i}@example.com",
        "How would you rate your experience?": random.randint(3, 5),
        "Which feature do you use most?": random.choice(features),
        "Would you recommend us to a friend?": random.choice(["yes", "yes", "yes", "no"]),
        "Anything else you'd like to share?": "Great tool, easy to use!" if i % 3 == 0 else "",
    })

event_qs = {q.title: q for q in db.query(models.Question).filter(models.Question.form_id == event.id)}
sessions = ["Morning workshop", "Afternoon panel", "Evening keynote"]
diets = ["No restrictions", "Vegetarian", "Vegan", "Gluten-free"]
for i in range(6):
    add_response(event.id, event_qs, {
        "Full name": names[i % len(names)],
        "Email address": f"guest{i}@example.com",
        "How many guests are you bringing?": random.randint(0, 3),
        "Which session will you attend?": random.choice(sessions),
        "Dietary preference": random.choice(diets),
    })

db.commit()
db.close()
print("Seed complete: 2 forms (1 published, 1 draft), some responses.")
