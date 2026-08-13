"use client";

import type { Question, QuestionStats } from "@/types";

function CountBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="truncate pr-2">{label}</span>
        <span className="shrink-0 text-muted">{count} · {pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function StatsPanel({ question, stats }: { question: Question; stats?: QuestionStats }) {
  if (!stats) return null;

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <h3 className="font-display text-base font-medium">{question.title || "Untitled question"}</h3>

      {stats.type === "counts" && (
        <div className="mt-4 flex flex-col gap-3">
          {Object.keys(stats.counts).length === 0 && <p className="text-sm text-muted">No answers yet.</p>}
          {Object.entries(stats.counts)
            .sort((a, b) => b[1] - a[1])
            .map(([label, count]) => {
              const total = Object.values(stats.counts).reduce((a, b) => a + b, 0);
              return <CountBar key={label} label={label} count={count} total={total} />;
            })}
        </div>
      )}

      {stats.type === "average" && (
        <div className="mt-4">
          {stats.average === null ? (
            <p className="text-sm text-muted">No ratings yet.</p>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-medium text-accent">{stats.average}</span>
              <span className="text-sm text-muted">average · {stats.count} rating{stats.count !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      )}

      {stats.type === "text" && (
        <p className="mt-4 text-sm text-muted">{stats.count} written response{stats.count !== 1 ? "s" : ""}</p>
      )}
    </div>
  );
}
