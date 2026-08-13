"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { PublicForm } from "@/types";
import { api } from "@/lib/api";
import { PublicFormRunner } from "@/components/PublicFormRunner";

export default function PublicFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const [form, setForm] = useState<PublicForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPublicForm(slug)
      .then(setForm)
      .catch(() => setError("This form isn't available. It may be unpublished or the link is incorrect."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
        <h1 className="font-display text-2xl font-medium">Form not found</h1>
        <p className="mt-2 max-w-sm text-muted">{error}</p>
      </div>
    );
  }

  if (form.questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
        <h1 className="font-display text-2xl font-medium">This form has no questions yet</h1>
      </div>
    );
  }

  return <PublicFormRunner form={form} />;
}
