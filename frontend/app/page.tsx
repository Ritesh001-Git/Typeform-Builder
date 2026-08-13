"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormSummary } from "@/types";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { FormCard } from "@/components/FormCard";
import { Modal, ConfirmDialog } from "@/components/Modal";
import { PlusIcon } from "@/components/icons";

export default function DashboardPage() {
  const [forms, setForms] = useState<FormSummary[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<FormSummary | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleting, setDeleting] = useState<FormSummary | null>(null);
  const router = useRouter();
  const { show } = useToast();

  const load = () => api.listForms().then(setForms).catch(() => show("Couldn't load forms", "error"));

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    setCreating(true);
    try {
      const form = await api.createForm("Untitled form");
      router.push(`/forms/${form.id}`);
    } catch {
      show("Couldn't create form", "error");
      setCreating(false);
    }
  }

  async function handleRenameSubmit() {
    if (!renaming) return;
    try {
      await api.updateForm(renaming.id, { title: renameValue.trim() || "Untitled form" });
      show("Form renamed");
      setRenaming(null);
      load();
    } catch {
      show("Couldn't rename form", "error");
    }
  }

  async function handleDuplicate(form: FormSummary) {
    try {
      await api.duplicateForm(form.id);
      show("Form duplicated");
      load();
    } catch {
      show("Couldn't duplicate form", "error");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await api.deleteForm(deleting.id);
      show("Form deleted");
      setDeleting(null);
      load();
    } catch {
      show("Couldn't delete form", "error");
    }
  }

  async function handleTogglePublish(form: FormSummary) {
    try {
      if (form.status === "published") {
        await api.unpublishForm(form.id);
        show("Form unpublished");
      } else {
        await api.publishForm(form.id);
        show("Form published");
      }
      load();
    } catch (err) {
      show(err instanceof Error ? err.message : "Couldn't update form", "error");
    }
  }

  function handleCopyLink(form: FormSummary) {
    const url = `${window.location.origin}/form/${form.public_id}`;
    navigator.clipboard.writeText(url);
    show("Link copied to clipboard");
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 md:px-10">
        <div>
          <h1 className="font-display text-2xl font-medium">Formly</h1>
          <p className="mt-1 text-sm text-muted">Build forms people actually enjoy filling out.</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="focus-ring flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          <PlusIcon /> {creating ? "Creating..." : "Create form"}
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16 md:px-10">
        {forms === null && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-line/50" />
            ))}
          </div>
        )}

        {forms && forms.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line py-24 text-center">
            <h2 className="font-display text-xl font-medium">No forms yet</h2>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Create your first form to start collecting responses in minutes.
            </p>
            <button
              onClick={handleCreate}
              className="focus-ring mt-6 flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
            >
              <PlusIcon /> Create your first form
            </button>
          </div>
        )}

        {forms && forms.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onRename={() => {
                  setRenaming(form);
                  setRenameValue(form.title);
                }}
                onDuplicate={() => handleDuplicate(form)}
                onDelete={() => setDeleting(form)}
                onTogglePublish={() => handleTogglePublish(form)}
                onCopyLink={() => handleCopyLink(form)}
              />
            ))}
          </div>
        )}
      </main>

      {renaming && (
        <Modal
          title="Rename form"
          onClose={() => setRenaming(null)}
          footer={
            <>
              <button
                onClick={() => setRenaming(null)}
                className="focus-ring rounded-lg px-4 py-2 text-sm font-medium text-muted hover:bg-paper"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameSubmit}
                className="focus-ring rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Save
              </button>
            </>
          }
        >
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
            className="focus-ring w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete form"
          message={`Delete "${deleting.title}"? This will also remove all of its responses. This can't be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
