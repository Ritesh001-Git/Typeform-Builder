export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "dropdown"
  | "email"
  | "number"
  | "yes_no"
  | "rating";

export interface QuestionConfig {
  options?: string[];
  max?: number;
}

export interface Question {
  id: number;
  form_id: number;
  type: QuestionType;
  title: string;
  description?: string | null;
  required: boolean;
  position: number;
  config: QuestionConfig;
}

export interface DraftQuestion {
  id: number;
  type: QuestionType;
  title: string;
  description?: string | null;
  required: boolean;
  position: number;
  config: QuestionConfig;
}

export type FormStatus = "draft" | "published";

export interface FormSummary {
  id: number;
  title: string;
  public_id: string;
  status: FormStatus;
  created_at: string;
  updated_at: string;
  response_count: number;
}

export interface FormDetail {
  id: number;
  title: string;
  public_id: string;
  status: FormStatus;
  created_at: string;
  updated_at: string;
  questions: Question[];
}

export interface PublicForm {
  title: string;
  public_id: string;
  questions: Question[];
}

export interface ResponseListItem {
  id: number;
  submitted_at: string;
}

export interface AnswerDetail {
  id: number;
  question_id: number;
  value: string | null;
}

export interface ResponseDetail {
  id: number;
  form_id: number;
  submitted_at: string;
  answers: AnswerDetail[];
}

export type QuestionStats =
  | { type: "counts"; counts: Record<string, number> }
  | { type: "average"; average: number | null; count: number }
  | { type: "text"; count: number };

export interface ResponsesPayload {
  total: number;
  questions: Question[];
  responses: ResponseListItem[];
  stats: Record<number, QuestionStats>;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  multiple_choice: "Multiple choice",
  dropdown: "Dropdown",
  email: "Email",
  number: "Number",
  yes_no: "Yes / No",
  rating: "Rating",
};
