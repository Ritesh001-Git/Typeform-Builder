import type {
  FormDetail, FormSummary, PublicForm, ResponsesPayload, ResponseDetail, DraftQuestion,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = typeof body.detail === "string" ? body.detail : message;
    } catch {
      // no JSON body
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export { ApiError };

export const api = {
  listForms: () => request<FormSummary[]>("/api/forms"),
  createForm: (title: string) =>
    request<FormDetail>("/api/forms", { method: "POST", body: JSON.stringify({ title }) }),
  getForm: (id: number) => request<FormDetail>(`/api/forms/${id}`),
  updateForm: (id: number, data: { title?: string; questions?: DraftQuestion[] }) =>
    request<FormDetail>(`/api/forms/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteForm: (id: number) => request<void>(`/api/forms/${id}`, { method: "DELETE" }),
  duplicateForm: (id: number) => request<FormDetail>(`/api/forms/${id}/duplicate`, { method: "POST" }),
  publishForm: (id: number) => request<FormDetail>(`/api/forms/${id}/publish`, { method: "POST" }),
  unpublishForm: (id: number) => request<FormDetail>(`/api/forms/${id}/unpublish`, { method: "POST" }),

  getResponses: (formId: number) => request<ResponsesPayload>(`/api/forms/${formId}/responses`),
  getResponse: (id: number) => request<ResponseDetail>(`/api/responses/${id}`),

  getPublicForm: (slug: string) => request<PublicForm>(`/api/public/forms/${slug}`),
  submitResponse: (slug: string, answers: { question_id: number; value: unknown }[]) =>
    request<{ ok: boolean }>(`/api/public/forms/${slug}/responses`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
};
