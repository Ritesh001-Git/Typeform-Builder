"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PublicForm } from "@/types";
import { QuestionRenderer } from "@/components/QuestionRenderer";
import { validateAnswer } from "@/lib/validate";
import { api, ApiError } from "@/lib/api";
import { ArrowLeftIcon, CheckIcon } from "@/components/icons";

export function PublicFormRunner({ form }: { form: PublicForm }) {
  const questions = form.questions;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const progress = Math.round(((index + 1) / questions.length) * 100);

  const setAnswer = (value: unknown) => {
    setAnswers((a) => ({ ...a, [question.id]: value }));
    setErrors((e) => ({ ...e, [question.id]: "" }));
  };

  const goNext = useCallback(async () => {
    const error = validateAnswer(question, answers[question.id]);
    if (error) {
      setErrors((e) => ({ ...e, [question.id]: error }));
      return;
    }
    if (!isLast) {
      setDirection("forward");
      setIndex((i) => i + 1);
      return;
    }
    // Last question: submit.
    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({ question_id: q.id, value: answers[q.id] ?? null }));
      await api.submitResponse(form.public_id, payload);
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setErrors((e) => ({ ...e, [question.id]: "Please check your answers and try again" }));
      } else {
        setErrors((e) => ({ ...e, [question.id]: "Something went wrong. Please try again." }));
      }
    } finally {
      setSubmitting(false);
    }
  }, [question, answers, isLast, questions, form.public_id]);

  const goBack = useCallback(() => {
    if (index === 0) return;
    setDirection("back");
    setIndex((i) => i - 1);
  }, [index]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "Enter" && tag !== "TEXTAREA") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowUp" && tag !== "TEXTAREA") {
        e.preventDefault();
        goBack();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goBack]);

  const error = errors[question?.id];

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center animate-fade-in">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
          <CheckIcon className="h-8 w-8" />
        </div>
        <h1 className="font-display text-3xl font-medium md:text-4xl">Thanks for your time!</h1>
        <p className="mt-3 max-w-sm text-muted">Your response has been submitted.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* progress */}
      <div className="fixed inset-x-0 top-0 z-10 h-1 bg-line">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-6 py-5 md:px-10">
        <button
          onClick={goBack}
          disabled={index === 0}
          className="focus-ring flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted transition-opacity hover:text-ink disabled:opacity-0"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back
        </button>
        <span className="font-mono text-xs tracking-wide text-muted">
          {String(index + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pb-16 md:px-10">
        <div key={question.id} className="w-full max-w-xl animate-slide-up">
          <div className="mb-1 font-mono text-sm text-accent">{index + 1} →</div>
          <h1 className="font-display text-2xl font-medium leading-snug md:text-3xl">
            {question.title}
            {question.required && <span className="ml-1 text-accent">*</span>}
          </h1>
          {question.description && (
            <p className="mt-2 text-sm text-muted md:text-base">{question.description}</p>
          )}

          <div className="mt-8">
            <QuestionRenderer
              question={question}
              value={answers[question.id]}
              onChange={setAnswer}
              error={error}
              autoFocus
              size="large"
            />
          </div>

          {error && <p className="mt-3 text-sm text-danger animate-fade-in">{error}</p>}

          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={goNext}
              disabled={submitting}
              className="focus-ring rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {submitting ? "Submitting..." : isLast ? "Submit" : "OK"}
            </button>
            <span className="hidden text-xs text-muted md:inline">
              press <kbd className="rounded border border-line bg-white px-1.5 py-0.5 font-mono">Enter ↵</kbd>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
