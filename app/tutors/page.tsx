import { Suspense } from "react";
import TutorsClient from "./TutorsClient";

export const dynamic = "force-dynamic";

export default function TutorsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading tutors…</div>}>
      <TutorsClient />
    </Suspense>
  );
}