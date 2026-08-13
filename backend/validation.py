# Server-side answer validation.

import json
import re

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validate_answer(question, value):
    config = json.loads(question.config or "{}")
    is_empty = value is None or (isinstance(value, str) and value.strip() == "")

    if question.required and is_empty:
        return False, "This question is required"

    if is_empty:
        return True, None

    if question.type == "email":
        if not EMAIL_RE.match(str(value)):
            return False, "Enter a valid email address"

    elif question.type == "number":
        try:
            float(value)
        except (TypeError, ValueError):
            return False, "Enter a valid number"

    elif question.type in ("multiple_choice", "dropdown"):
        options = config.get("options", [])
        if value not in options:
            return False, "Select a valid option"

    elif question.type == "yes_no":
        if value not in ("yes", "no"):
            return False, "Select yes or no"

    elif question.type == "rating":
        max_rating = config.get("max", 5)
        try:
            rating = int(value)
        except (TypeError, ValueError):
            return False, "Enter a valid rating"
        if not (1 <= rating <= max_rating):
            return False, f"Rating must be between 1 and {max_rating}"

    return True, None
