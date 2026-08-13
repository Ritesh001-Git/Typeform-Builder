"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { FormDetail } from "@/types";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/Modal";
import { ComingSoon } from "@/components/ComingSoon";
import { ArrowLeftIcon, LinkIcon } from "@/components/icons";

export default function SettingsPage() {
  const { id } = useParams<{ id: string }>();
  const formId = Number(id);
  const router = useRouter();
  const { show } = useToast();
  const [form, setForm] = useState<FormDetail | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.getForm(formId).then(setForm);
  }, [formId]);

  async function handleTogglePublish() {
    if (!form) return;
    try {
      const updated = form.status === "published" ? await api.unpublishForm(formId) : await api.publishForm(formId);
      setForm(updated);
      show(updated.status === "published" ? "Form published" : "Form unpublished");
    } catch (err) {
      show(err instanceof Error ? err.message : "Couldn't update form", "error");
    }
  }

  function handleCopyLink() {
    if (!form) return;
    navigator.clipboard.writeText(`${window.location.origin}/form/${form.public_id}`);
    show("Link copied to clipboard");
  }

  async function handleDelete() {
    try {
      await api.deleteForm(formId);
      show("Form deleted");
      router.push("/");
    } catch {
      show("Couldn't delete form", "error");
    }
  }

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-2xl items-center gap-3 px-6 py-8 md:px-10">
        <Link href={`/forms/${formId}`} className="focus-ring rounded-lg p-1.5 text-muted hover:bg-white hover:text-ink">
          <ArrowLeftIcon />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-medium">Settings</h1>
          <p className="mt-1 text-sm text-muted">{form.title}</p>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 pb-16 md:px-10">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-medium">Publishing</h2>
          <p className="mt-1 text-sm text-muted">
            {form.status === "published"
              ? "Your form is live and accepting responses."
              : "Your form is a draft and isn't accepting responses yet."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={handleTogglePublish}
              className={`focus-ring rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                form.status === "published"
                  ? "bg-line text-ink hover:bg-line/70"
                  : "bg-accent text-white hover:bg-accent-hover"
              }`}
            >
              {form.status === "published" ? "Unpublish" : "Publish"}
            </button>
            {form.status === "published" && (
              <button
                onClick={handleCopyLink}
                className="focus-ring flex items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-paper"
              >
                <LinkIcon className="h-4 w-4" /> Copy public link
              </button>
            )}
          </div>
          {form.status === "published" && (
            <p className="mt-3 truncate rounded-lg bg-paper px-3 py-2 font-mono text-xs text-muted">
              /form/{form.public_id}
            </p>
          )}
        </div>

        <div>
          <h2 className="mb-3 font-medium">More features</h2>
          <div className="flex flex-col gap-3">
            <ComingSoon title="Logic jumps" description="Branch to different questions based on earlier answers." />
            <ComingSoon title="Integrations & webhooks" description="Send responses to Slack, Sheets, or your own endpoint." />
            <ComingSoon title="Team collaboration" description="Invite teammates to edit forms and review responses together." />
            <ComingSoon title="Payments" description="Collect payments as part of a form submission." />
            <ComingSoon title="File uploads" description="Let respondents attach files to their answers." />
            <ComingSoon title="Advanced authentication" description="Require sign-in or restrict a form to specific respondents." />
          </div>
        </div>

        <div className="rounded-2xl border border-danger/30 bg-white p-5">
          <h2 className="font-medium text-danger">Danger zone</h2>
          <p className="mt-1 text-sm text-muted">Deleting a form also deletes all of its responses. This can't be undone.</p>
          <button
            onClick={() => setDeleting(true)}
            className="focus-ring mt-4 rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/5"
          >
            Delete this form
          </button>
        </div>
      </main>

      {deleting && (
        <ConfirmDialog
          title="Delete form"
          message={`Delete "${form.title}"? This will also remove all of its responses.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleting(false)}
        />
      )}
    </div>
  );
}
