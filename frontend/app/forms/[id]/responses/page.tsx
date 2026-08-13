"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ResponsesPayload } from "@/types";
import { api } from "@/lib/api";
import { StatsPanel } from "@/components/StatsPanel";
import { ResponseDetailModal } from "@/components/ResponseDetailModal";
import { ArrowLeftIcon } from "@/components/icons";
import { formatDateTime } from "@/lib/format";

export default function ResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const formId = Number(id);
  const [data, setData] = useState<ResponsesPayload | null>(null);
  const [openResponseId, setOpenResponseId] = useState<number | null>(null);

  useEffect(() => {
    api.getResponses(formId).then(setData);
  }, [formId]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-8 md:px-10">
        <Link href={`/forms/${formId}`} className="focus-ring rounded-lg p-1.5 text-muted hover:bg-white hover:text-ink">
          <ArrowLeftIcon />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-medium">Responses</h1>
          <p className="mt-1 text-sm text-muted">
            {data.total} response{data.total !== 1 ? "s" : ""} collected
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-16 md:px-10">
        {data.total === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line py-24 text-center">
            <h2 className="font-display text-xl font-medium">No responses yet</h2>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Share your form's public link to start collecting responses.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.questions.map((q) => (
                <StatsPanel key={q.id} question={q} stats={data.stats[q.id]} />
              ))}
            </div>

            <h2 className="mb-3 mt-10 font-display text-lg font-medium">All responses</h2>
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              {data.responses.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => setOpenResponseId(r.id)}
                  className={`focus-ring flex w-full items-center justify-between px-5 py-3 text-left text-sm transition-colors hover:bg-paper ${
                    i !== data.responses.length - 1 ? "border-b border-line" : ""
                  }`}
                >
                  <span className="font-medium">Response #{r.id}</span>
                  <span className="text-muted">{formatDateTime(r.submitted_at)}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </main>

      {openResponseId !== null && (
        <ResponseDetailModal
          responseId={openResponseId}
          questions={data.questions}
          onClose={() => setOpenResponseId(null)}
        />
      )}
    </div>
  );
}
