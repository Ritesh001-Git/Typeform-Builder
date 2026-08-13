"use client";

import type { DraftQuestion, QuestionType } from "@/types";
import { QUESTION_TYPE_LABELS } from "@/types";
import { PlusIcon, TrashIcon } from "@/components/icons";

const TYPE_ORDER: QuestionType[] = [
  "short_text", "long_text", "multiple_choice", "dropdown", "email", "number", "yes_no", "rating",
];

function defaultConfigFor(type: QuestionType) {
  if (type === "multiple_choice" || type === "dropdown") return { options: ["Option 1", "Option 2"] };
  if (type === "rating") return { max: 5 };
  return {};
}

export function QuestionEditor({
  question, onChange,
}: {
  question: DraftQuestion;
  onChange: (patch: Partial<DraftQuestion>) => void;
}) {
  const hasOptions = question.type === "multiple_choice" || question.type === "dropdown";

  function updateOption(i: number, value: string) {
    const options = [...(question.config.options ?? [])];
    options[i] = value;
    onChange({ config: { ...question.config, options } });
  }

  function addOption() {
    const options = [...(question.config.options ?? []), `Option ${(question.config.options?.length ?? 0) + 1}`];
    onChange({ config: { ...question.config, options } });
  }

  function removeOption(i: number) {
    const options = (question.config.options ?? []).filter((_, idx) => idx !== i);
    onChange({ config: { ...question.config, options } });
  }

  function moveOption(i: number, dir: -1 | 1) {
    const options = [...(question.config.options ?? [])];
    const j = i + dir;
    if (j < 0 || j >= options.length) return;
    [options[i], options[j]] = [options[j], options[i]];
    onChange({ config: { ...question.config, options } });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Type selector */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
          Question type
        </label>
        <select
          value={question.type}
          onChange={(e) => {
            const type = e.target.value as QuestionType;
            onChange({ type, config: defaultConfigFor(type) });
          }}
          className="focus-ring w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
        >
          {TYPE_ORDER.map((t) => (
            <option key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
          Question
        </label>
        <textarea
          value={question.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Type your question..."
          rows={2}
          className="focus-ring w-full resize-none rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
          Description <span className="normal-case text-muted/70">(optional)</span>
        </label>
        <input
          value={question.description ?? ""}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Add helper text..."
          className="focus-ring w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      {/* Options */}
      {hasOptions && (
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">Options</label>
          <div className="flex flex-col gap-2">
            {(question.config.options ?? []).map((opt, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="flex flex-col">
                  <button
                    onClick={() => moveOption(i, -1)}
                    disabled={i === 0}
                    className="text-muted/50 hover:text-muted disabled:opacity-20"
                    aria-label="Move up"
                  >▲</button>
                  <button
                    onClick={() => moveOption(i, 1)}
                    disabled={i === (question.config.options?.length ?? 0) - 1}
                    className="text-muted/50 hover:text-muted disabled:opacity-20"
                    aria-label="Move down"
                  >▼</button>
                </div>
                <input
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="focus-ring flex-1 rounded-lg border border-line px-3 py-1.5 text-sm outline-none focus:border-accent"
                />
                <button
                  onClick={() => removeOption(i)}
                  disabled={(question.config.options?.length ?? 0) <= 2}
                  className="focus-ring rounded-md p-1.5 text-muted hover:text-danger disabled:opacity-20"
                  aria-label="Remove option"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="focus-ring mt-1 flex items-center gap-1 self-start rounded-lg px-2 py-1 text-sm text-accent hover:bg-accent-soft"
            >
              <PlusIcon className="h-3.5 w-3.5" /> Add option
            </button>
          </div>
        </div>
      )}

      {/* Rating scale */}
      {question.type === "rating" && (
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">Scale</label>
          <div className="flex gap-2">
            {[3, 5, 7, 10].map((n) => (
              <button
                key={n}
                onClick={() => onChange({ config: { ...question.config, max: n } })}
                className={`focus-ring rounded-lg border px-3 py-1.5 text-sm ${
                  (question.config.max ?? 5) === n
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line hover:bg-paper"
                }`}
              >
                1–{n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Required toggle */}
      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-line px-3 py-2.5">
        <span className="text-sm font-medium">Required</span>
        <button
          type="button"
          onClick={() => onChange({ required: !question.required })}
          className={`relative h-6 w-11 rounded-full transition-colors ${question.required ? "bg-accent" : "bg-line"}`}
          aria-pressed={question.required}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              question.required ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </label>
    </div>
  );
}
