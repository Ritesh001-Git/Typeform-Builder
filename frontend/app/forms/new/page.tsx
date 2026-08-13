"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

// Convenience route: creates a blank form and drops the user straight into
// the builder, so /forms/new can be linked to directly.
export default function NewFormPage() {
  const router = useRouter();

  useEffect(() => {
    api.createForm("Untitled form").then((form) => router.replace(`/forms/${form.id}`));
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
    </div>
  );
}
