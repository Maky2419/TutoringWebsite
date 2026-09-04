"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CancellationInfo } from "@/lib/cancellationShared";
import SessionTimeDisplay from "./SessionTimeDisplay";
import { CANCELLATION_DELETE_DELAY_MS } from "@/lib/cancellationShared";

type RequestSession = CancellationInfo & {
  id: number; lessonDate: string | Date; startTime: string; endTime: string;
  startsAt?: string | Date | null; endsAt?: string | Date | null;
  studentName?: string | null; studentEmail?: string | null; tutorName?: string;
};

export default function CancellationRequests({ sessions, tutor = false, onReviewed }: {
  sessions: RequestSession[]; tutor?: boolean; onReviewed?: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reviewed, setReviewed] = useState<Record<string, string>>({});
  const [removed, setRemoved] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const keyFor = (s: RequestSession) => `${s.id}:${s.cancellationVersion}`;
  const requests = sessions.filter(s => s.cancellationStatus && !removed[keyFor(s)]).sort((a, b) =>
    Number(b.cancellationStatus === "pending") - Number(a.cancellationStatus === "pending") ||
    new Date(b.cancellationRequestedAt || 0).getTime() - new Date(a.cancellationRequestedAt || 0).getTime());
  const pending = requests.filter(s => s.cancellationStatus === "pending" && !reviewed[keyFor(s)]).length;

  async function review(session: RequestSession, decision: "accepted" | "declined") {
    if (busy !== null) return;
    setBusy(session.id); setError(""); setMessage("");
    try {
      const res = await fetch(`/api/tutor/sessions/${session.id}/cancellation`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, version: session.cancellationVersion }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Unable to save your decision. Please try again.");
      setReviewed(previous => ({ ...previous, [keyFor(session)]: decision }));
      setMessage(decision === "accepted" ? "Cancellation accepted. The session is cancelled." : "Cancellation declined. The session remains scheduled.");
      onReviewed?.(); router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save your decision.");
    } finally { setBusy(null); }
  }

  async function deleteRequest(session: RequestSession) {
    if (busy !== null) return;
    setBusy(session.id); setError(""); setMessage("");
    try {
      const res = await fetch(`/api/tutor/sessions/${session.id}/cancellation`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: session.cancellationVersion }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Unable to delete the cancellation request. Please try again.");
      setRemoved(previous => ({ ...previous, [keyFor(session)]: true }));
      setMessage("Cancellation request deleted. The tutor’s decision about the session remains unchanged.");
      onReviewed?.();
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to delete the cancellation request.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950">Cancellation Requests{pending > 0 ? ` (${pending} pending)` : ""}</h2>
          <p className="mt-1 text-sm text-slate-600">{tutor ? "Review students’ reasons and accept or decline their requests." : "Track your tutor’s decision on each cancellation request."}</p>
        </div>
        <button type="button" onClick={() => router.refresh()} className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-bold text-blue-700">Refresh</button>
      </div>
      {error && <p role="alert" className="mb-4 text-sm font-semibold text-red-700">{error}</p>}
      {message && <p role="status" className="mb-4 text-sm font-semibold text-blue-700">{message}</p>}
      {requests.length === 0 ? <p className="text-sm text-slate-500">No cancellation requests.</p> : (
        <div className="max-h-[600px] space-y-4 overflow-y-auto">
          {requests.map(session => {
            const status = reviewed[keyFor(session)] || session.cancellationStatus;
            const deleteAvailableAt = session.cancellationReviewedAt
              ? new Date(session.cancellationReviewedAt).getTime() + CANCELLATION_DELETE_DELAY_MS
              : Number.POSITIVE_INFINITY;
            const reviewedRequest = session.cancellationStatus === "accepted" || session.cancellationStatus === "declined";
            const canDelete = tutor && reviewedRequest && now >= deleteAvailableAt;
            const deleteWaitSeconds = Math.max(0, Math.ceil((deleteAvailableAt - now) / 1000));
            return (
              <div key={session.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950">{tutor ? session.studentName || session.studentEmail || "Student" : session.tutorName}</p>
                    {tutor && session.studentEmail && <p className="text-sm text-slate-500">{session.studentEmail}</p>}
                    <p className="mt-1 text-sm text-slate-600"><SessionTimeDisplay session={session} /></p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${status === "pending" ? "bg-amber-100 text-amber-800" : status === "accepted" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {status === "pending" ? "Pending approval" : status === "accepted" ? "Accepted — session cancelled" : "Declined — session scheduled"}
                  </span>
                </div>
                <p className="mt-3 text-xs font-bold uppercase text-slate-500">Reason for cancellation</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">{session.cancellationReason}</p>
                {status === "pending" && <p className="mt-3 text-xs text-slate-500">The session remains scheduled until the cancellation is accepted.</p>}
                {tutor && status === "pending" && <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" disabled={busy !== null} onClick={() => review(session, "accepted")} className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50">{busy === session.id ? "Saving…" : "Accept Cancellation"}</button>
                  <button type="button" disabled={busy !== null} onClick={() => review(session, "declined")} className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">Decline Cancellation</button>
                </div>}
                {tutor && reviewedRequest && (
                  <div className="mt-4">
                    {canDelete ? (
                      <button type="button" disabled={busy !== null} onClick={() => deleteRequest(session)} className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50">
                        {busy === session.id ? "Deleting…" : "Delete Request"}
                      </button>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Delete available in {Math.floor(deleteWaitSeconds / 60)}:{String(deleteWaitSeconds % 60).padStart(2, "0")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
