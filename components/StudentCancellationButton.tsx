"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_CANCELLATION_REASON, type CancellationInfo } from "@/lib/cancellationShared";
import SessionTimeDisplay from "./SessionTimeDisplay";

type Session = CancellationInfo & {
  id: number;
  tutorName: string;
  status?: string;
  lessonDate: string | Date;
  startTime: string;
  endTime: string;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
};

export default function StudentCancellationButton({ session }: { session: Session }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submittedVersion, setSubmittedVersion] = useState<number | null>(null);
  const pending = session.cancellationStatus === "pending" || submittedVersion === (session.cancellationVersion ?? 0);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    if (!reason.trim()) { setError("Please enter a reason for cancelling."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/student/sessions/${session.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Unable to submit your request. Please try again.");
      setSubmittedVersion(session.cancellationVersion ?? 0);
      dialog.current?.close();
      setReason("");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to submit your request. Please try again.");
    } finally { setSaving(false); }
  }

  if (session.status === "cancelled") return <p className="text-sm font-semibold text-red-700">Session cancelled</p>;
  return (
    <div className="mt-3 space-y-2">
      {pending ? (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Cancellation pending tutor approval. Your session is still scheduled.
        </p>
      ) : (
        <>
          {session.cancellationStatus === "declined" && <p className="text-sm font-semibold text-red-700">Your tutor declined the cancellation. This session is still scheduled.</p>}
          <button type="button" onClick={() => { setError(""); dialog.current?.showModal(); }}
            className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100">
            Cancel Session
          </button>
        </>
      )}
      <dialog ref={dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}
        onCancel={event => { if (saving) event.preventDefault(); }}
        className="w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto rounded-3xl border border-blue-100 bg-white p-6 text-slate-950 shadow-2xl backdrop:bg-slate-950/50">
        <form onSubmit={submit} className="space-y-4">
          <h2 id={`${id}-title`} className="text-xl font-extrabold">Request session cancellation</h2>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="font-bold">{session.tutorName}</p>
            <SessionTimeDisplay session={session} />
          </div>
          <p id={`${id}-description`} className="text-sm text-slate-600">Please tell your tutor why you need to cancel. Your session stays scheduled until your tutor accepts this request.</p>
          <div>
            <label htmlFor={`${id}-reason`} className="mb-2 block text-sm font-bold">Reason for cancellation <span className="font-normal">(required)</span></label>
            <textarea id={`${id}-reason`} autoFocus required maxLength={MAX_CANCELLATION_REASON} rows={4}
              disabled={saving} value={reason} onChange={event => setReason(event.target.value)}
              placeholder="Explain why you need to cancel this session…"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            <p className="text-right text-xs text-slate-500">{reason.length}/{MAX_CANCELLATION_REASON}</p>
          </div>
          {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" disabled={saving} onClick={() => dialog.current?.close()} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold disabled:opacity-50">Keep Session</button>
            <button type="submit" disabled={saving || !reason.trim()} className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">{saving ? "Submitting…" : "Submit Cancellation Request"}</button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
