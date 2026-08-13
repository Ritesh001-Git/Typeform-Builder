import type { Question } from "@/types";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Mirrors the backend's validation.py so respondents get instant feedback.
 * The backend re-validates independently and is the source of truth. */
export function validateAnswer(question: Question, value: unknown): string | null {
  const isEmpty = value === null || value === undefined || (typeof value === "string" && value.trim() === "");

  if (question.required && isEmpty) return "This question is required";
  if (isEmpty) return null;

  switch (question.type) {
    case "email":
      return EMAIL_RE.test(String(value)) ? null : "Enter a valid email address";
    case "number":
      return isNaN(Number(value)) ? "Enter a valid number" : null;
    case "multiple_choice":
    case "dropdown":
      return (question.config.options ?? []).includes(String(value)) ? null : "Select a valid option";
    case "yes_no":
      return value === "yes" || value === "no" ? null : "Select yes or no";
    case "rating": {
      const max = question.config.max ?? 5;
      const n = Number(value);
      return n >= 1 && n <= max ? null : `Rating must be between 1 and ${max}`;
    }
    default:
      return null;
  }
}
