"use client";

import Link from "next/link";
import type { FormSummary } from "@/types";
import { Menu } from "@/components/Menu";
import { KebabIcon, BarChartIcon, LinkIcon } from "@/components/icons";
import { formatRelativeDate } from "@/lib/format";

export function FormCard({
  form, onRename, onDuplicate, onDelete, onTogglePublish, onCopyLink,
}: {
  form: FormSummary;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  onCopyLink: () => void;
}) {
  const isPublished = form.status === "published";

  return (
    <div className="group relative flex flex-col rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/forms/${form.id}`} className="focus-ring min-w-0 flex-1 rounded-md">
          <h3 className="truncate font-display text-lg font-medium leading-snug">{form.title}</h3>
        </Link>
        <Menu
          trigger={<KebabIcon />}
          items={[
            { label: "Open builder", onClick: () => (window.location.href = `/forms/${form.id}`) },
            { label: "View responses", onClick: () => (window.location.href = `/forms/${form.id}/responses`) },
            { label: "Rename", onClick: onRename },
            { label: "Duplicate", onClick: onDuplicate },
            { label: isPublished ? "Unpublish" : "Publish", onClick: onTogglePublish },
            ...(isPublished ? [{ label: "Copy link", onClick: onCopyLink }] : []),
            { label: "Delete", onClick: onDelete, danger: true },
          ]}
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isPublished ? "bg-success/10 text-success" : "bg-line text-muted"
          }`}
        >
          {isPublished ? "Published" : "Draft"}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted">
          <BarChartIcon className="h-3.5 w-3.5" />
          {form.response_count} {form.response_count === 1 ? "response" : "responses"}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span>Updated {formatRelativeDate(form.updated_at)}</span>
        {isPublished && (
          <button onClick={onCopyLink} className="focus-ring flex items-center gap-1 rounded-md text-accent hover:underline">
            <LinkIcon className="h-3 w-3" /> Copy link
          </button>
        )}
      </div>
    </div>
  );
}
