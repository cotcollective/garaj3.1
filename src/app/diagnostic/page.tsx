import { Suspense } from "react";
import DiagnosticForm from "./DiagnosticForm";

export default function DiagnosticPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] bg-offwhite flex items-center justify-center">
          <p className="text-navy/40">Chargement…</p>
        </div>
      }
    >
      <DiagnosticForm />
    </Suspense>
  );
}
