"use client";

import { useEffect, useState } from "react";
import type { Question, ResponseDetail } from "@/types";
import { api } from "@/lib/api";
import { Modal } from "@/components/Modal";
import { formatDateTime } from "@/lib/format";

export function ResponseDetailModal({
  responseId, questions, onClose,
}: {
  responseId: number;
  questions: Question[];
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<ResponseDetail | null>(null);

  useEffect(() => {
    api.getResponse(responseId).then(setDetail);
  }, [responseId]);

  return (
    <Modal title="Response detail" onClose={onClose}>
      {!detail && <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />}
      {detail && (
        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
          <p className="text-xs text-muted">Submitted {formatDateTime(detail.submitted_at)}</p>
          {questions.map((q) => {
            const answer = detail.answers.find((a) => a.question_id === q.id);
            return (
              <div key={q.id} className="border-b border-line pb-3 last:border-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">{q.title}</p>
                <p className="mt-1 text-sm">{answer?.value || <span className="text-muted">No answer</span>}</p>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
