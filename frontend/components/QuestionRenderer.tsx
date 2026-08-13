"use client";

import { useEffect, useRef } from "react";
import type { Question } from "@/types";
import { StarIcon, CheckIcon } from "@/components/icons";

/**
 * Renders the *input* for a single question. Shared by the builder's live
 * preview and the public respondent experience so the two never drift apart.
 */
export function QuestionRenderer({
  question,
  value,
  onChange,
  error,
  size = "large",
  autoFocus = false,
}: {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string | null;
  size?: "large" | "compact";
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus, question.id]);

  const textSize = size === "large" ? "text-xl md:text-2xl" : "text-base";
  const inputBase = `w-full border-b-2 bg-transparent ${textSize} font-sans font-normal outline-none transition-colors pb-2 ${
    error ? "border-danger" : "border-line focus:border-accent"
  }`;

  switch (question.type) {
    case "short_text":
    case "email":
    case "number":
      return (
        <input
          ref={ref as React.RefObject<HTMLInputElement>}
          type={question.type === "number" ? "number" : question.type === "email" ? "email" : "text"}
          inputMode={question.type === "number" ? "decimal" : undefined}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here..."
          className={inputBase}
        />
      );

    case "long_text":
      return (
        <textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here..."
          rows={size === "large" ? 4 : 3}
          className={`${inputBase} resize-none`}
        />
      );

    case "multiple_choice": {
      const options = question.config.options ?? [];
      return (
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => {
            const selected = value === opt;
            return (
              <button
                type="button"
                key={opt + i}
                onClick={() => onChange(opt)}
                className={`focus-ring flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                  selected
                    ? "border-accent bg-accent-soft"
                    : "border-line hover:border-accent/50 hover:bg-paper"
                } ${size === "large" ? "text-lg" : "text-sm"}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-medium ${
                    selected ? "border-accent bg-accent text-white" : "border-line text-muted"
                  }`}
                >
                  {selected ? <CheckIcon className="h-3.5 w-3.5" /> : String.fromCharCode(65 + i)}
                </span>
                <span>{opt || `Option ${i + 1}`}</span>
              </button>
            );
          })}
        </div>
      );
    }

    case "dropdown": {
      const options = question.config.options ?? [];
      return (
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputBase} cursor-pointer appearance-none`}
        >
          <option value="" disabled>Select an option...</option>
          {options.map((opt, i) => (
            <option key={opt + i} value={opt}>{opt || `Option ${i + 1}`}</option>
          ))}
        </select>
      );
    }

    case "yes_no":
      return (
        <div className="flex gap-3">
          {(["yes", "no"] as const).map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => onChange(opt)}
              className={`focus-ring flex-1 rounded-xl border px-6 py-4 font-medium capitalize transition-all ${
                value === opt
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line hover:border-accent/50 hover:bg-paper"
              } ${size === "large" ? "text-lg" : "text-sm"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      );

    case "rating": {
      const max = question.config.max ?? 5;
      const current = Number(value) || 0;
      return (
        <div className="flex gap-2">
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => onChange(n)}
              aria-label={`Rate ${n} out of ${max}`}
              className="focus-ring rounded-md p-1 text-accent transition-transform hover:scale-110"
            >
              <StarIcon
                filled={n <= current}
                className={size === "large" ? "h-9 w-9" : "h-6 w-6"}
              />
            </button>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}
