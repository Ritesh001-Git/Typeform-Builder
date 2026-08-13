"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { DraftQuestion, FormStatus, QuestionType } from "@/types";
import { QUESTION_TYPE_LABELS } from "@/types";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { QuestionList } from "@/components/QuestionList";
import { QuestionEditor } from "@/components/QuestionEditor";
import { QuestionRenderer } from "@/components/QuestionRenderer";
import { Menu } from "@/components/Menu";
import { ArrowLeftIcon, PlusIcon, BarChartIcon, SettingsIcon, LinkIcon } from "@/components/icons";

const TYPE_ORDER: QuestionType[] = [
  "short_text", "long_text", "multiple_choice", "dropdown", "email", "number", "yes_no", "rating",
];

function defaultConfigFor(type: QuestionType) {
  if (type === "multiple_choice" || type === "dropdown") return { options: ["Option 1", "Option 2"] };
  if (type === "rating") return { max: 5 };
  return {};
}

export default function BuilderPage() {
  const { id } = useParams<{ id: string }>();
  const formId = Number(id);
  const { show } = useToast();

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<FormStatus>("draft");
  const [publicId, setPublicId] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadedRef = useRef(false);
  const nextTempId = useRef(-1);

  useEffect(() => {
    api
      .getForm(formId)
      .then((form) => {
        setTitle(form.title);
        setStatus(form.status);
        setPublicId(form.public_id);
        setQuestions(form.questions);
        setSelectedIndex(form.questions.length > 0 ? 0 : null);
        setLoading(false);
        setTimeout(() => (loadedRef.current = true), 0);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [formId]);

  const doSave = useCallback(
    async (nextTitle: string, nextQuestions: DraftQuestion[]) => {
      setSaveStatus("saving");
      try {
        await api.updateForm(formId, { title: nextTitle, questions: nextQuestions });
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    },
    [formId]
  );
  const debouncedSave = useDebouncedCallback(doSave, 700);

  useEffect(() => {
    if (!loadedRef.current) return;
    debouncedSave(title, questions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, questions]);

  function addQuestion(type: QuestionType) {
    const q: DraftQuestion = {
      id: nextTempId.current--,
      type,
      title: "",
      description: "",
      required: false,
      position: questions.length,
      config: defaultConfigFor(type),
    };
    setQuestions((qs) => [...qs, q]);
    setSelectedIndex(questions.length);
  }

  function updateQuestion(index: number, patch: Partial<DraftQuestion>) {
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function deleteQuestion(index: number) {
    setQuestions((qs) => qs.filter((_, i) => i !== index));
    setSelectedIndex((sel) => {
      if (sel === null) return null;
      if (index === sel) return null;
      return index < sel ? sel - 1 : sel;
    });
  }

  async function handleTogglePublish() {
    try {
      if (status === "published") {
        await api.unpublishForm(formId);
        setStatus("draft");
        show("Form unpublished");
      } else {
        await api.publishForm(formId);
        setStatus("published");
        show("Form published — it's now live");
      }
    } catch (err) {
      show(err instanceof Error ? err.message : "Couldn't update form", "error");
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/form/${publicId}`);
    show("Link copied to clipboard");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper text-center">
        <h1 className="font-display text-2xl font-medium">Form not found</h1>
        <Link href="/" className="text-accent hover:underline">Back to dashboard</Link>
      </div>
    );
  }

  const selected = selectedIndex !== null ? questions[selectedIndex] : null;

  return (
    <div className="flex h-screen flex-col bg-paper">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="focus-ring shrink-0 rounded-lg p-1.5 text-muted hover:bg-paper hover:text-ink">
            <ArrowLeftIcon />
          </Link>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled form"
            className="focus-ring min-w-0 max-w-xs rounded-lg px-2 py-1 font-display text-lg font-medium outline-none hover:bg-paper focus:bg-paper"
          />
          <span className="hidden text-xs text-muted sm:inline">
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "error" && <span className="text-danger">Couldn't save</span>}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/forms/${formId}/responses`}
            className="focus-ring flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-paper hover:text-ink"
          >
            <BarChartIcon className="h-4 w-4" /> <span className="hidden sm:inline">Responses</span>
          </Link>
          <Link
            href={`/forms/${formId}/settings`}
            className="focus-ring flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-paper hover:text-ink"
          >
            <SettingsIcon className="h-4 w-4" /> <span className="hidden sm:inline">Settings</span>
          </Link>
          {status === "published" && (
            <button
              onClick={handleCopyLink}
              className="focus-ring flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-paper hover:text-ink"
            >
              <LinkIcon className="h-4 w-4" /> <span className="hidden sm:inline">Copy link</span>
            </button>
          )}
          <button
            onClick={handleTogglePublish}
            className={`focus-ring rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              status === "published"
                ? "bg-line text-ink hover:bg-line/70"
                : "bg-accent text-white hover:bg-accent-hover"
            }`}
          >
            {status === "published" ? "Unpublish" : "Publish"}
          </button>
        </div>
      </header>

      {/* Three-pane builder */}
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[260px_1fr_1fr] lg:grid-cols-[280px_1fr_1fr]">
        {/* Questions list */}
        <aside className="flex min-h-0 flex-col border-b border-line bg-white p-3 md:border-b-0 md:border-r">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              {questions.length} question{questions.length !== 1 ? "s" : ""}
            </span>
            <Menu
              trigger={<span className="flex items-center gap-1 text-accent"><PlusIcon className="h-4 w-4" /></span>}
              items={TYPE_ORDER.map((t) => ({ label: QUESTION_TYPE_LABELS[t], onClick: () => addQuestion(t) }))}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <QuestionList
              questions={questions}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
              onDelete={deleteQuestion}
              onReorder={setQuestions}
            />
          </div>
          <button
            onClick={() => addQuestion("short_text")}
            className="focus-ring mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-line py-2.5 text-sm font-medium text-muted hover:border-accent hover:text-accent"
          >
            <PlusIcon className="h-4 w-4" /> Add question
          </button>
        </aside>

        {/* Editor */}
        <section className="min-h-0 overflow-y-auto border-b border-line bg-white p-6 md:border-b-0 md:border-r">
          {selected ? (
            <QuestionEditor question={selected} onChange={(patch) => updateQuestion(selectedIndex!, patch)} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted">
              <p className="text-sm">Select or add a question to start editing.</p>
            </div>
          )}
        </section>

        {/* Live preview */}
        <section className="min-h-0 overflow-y-auto bg-paper p-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Live preview</p>
          <div className="rounded-2xl border border-line bg-white p-8 shadow-sm">
            {selected ? (
              <div key={selected.id} className="animate-fade-in">
                <h2 className="font-display text-xl font-medium leading-snug">
                  {selected.title || "Untitled question"}
                  {selected.required && <span className="ml-1 text-accent">*</span>}
                </h2>
                {selected.description && <p className="mt-1.5 text-sm text-muted">{selected.description}</p>}
                <div className="mt-6">
                  <QuestionRenderer
                    question={{ ...selected, form_id: formId }}
                    value={undefined}
                    onChange={() => {}}
                    size="large"
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">Nothing to preview yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
