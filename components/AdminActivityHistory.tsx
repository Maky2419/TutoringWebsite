"use client";
import { useEffect, useState } from "react";
import { ACTIVITY_LABELS, type ActivityAction } from "@/lib/activityEvents";
import { DUBAI_TIME_ZONE } from "@/lib/sessionTime";

type Entry = {
  id: number; createdAt: string; actorId: string | null; actorName: string;
  actorEmail: string | null; actorRole: string; action: ActivityAction;
  entityType: string; entityId: string | null; details: Record<string, unknown>;
};
type Cursor = { id: number; time: string } | null;
// Proxies, deployment errors and failed route initialization can return empty or
// HTML responses. Never expose a JSON parser exception to the administrator.
export async function readActivityResponse(response: Response): Promise<{ events: Entry[]; nextCursor: Cursor }> {
  if (response.status === 401 || response.status === 403 || response.redirected) {
    throw new Error("Your admin session may have expired. Sign in as an administrator and try again.");
  }
  const text = await response.text();
  let data: any;
  try {
    data = text.trim() ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  const fallback = `Activity History received an invalid server response (HTTP ${response.status}). Try Refresh latest. If it continues, check the server logs.`;
  if (!response.ok) {
    throw new Error(typeof data?.error === "string" && data.error.trim() ? data.error : fallback);
  }
  if (!data || !Array.isArray(data.events) || !data.events.every((event: any) =>
    event && Number.isSafeInteger(event.id) && typeof event.createdAt === "string" && Number.isFinite(Date.parse(event.createdAt)) &&
    typeof event.actorName === "string" && typeof event.actorRole === "string" && typeof event.action === "string" &&
    typeof event.entityType === "string" && event.details && typeof event.details === "object" && !Array.isArray(event.details)
  )) throw new Error(fallback);
  const next = data.nextCursor;
  if (next !== null && (!next || !Number.isSafeInteger(next.id) || next.id <= 0 || typeof next.time !== "string" || !Number.isFinite(Date.parse(next.time)))) {
    throw new Error(fallback);
  }
  return { events: data.events, nextCursor: next };
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { timeZone: DUBAI_TIME_ZONE, dateStyle: "medium", timeStyle: "medium" });
const detailNames: Record<string, string> = { studentId: "Student ID", tutorId: "Tutor ID", assignmentId: "Assignment ID",
  sessionId: "Session ID", sessionIds: "Session IDs", sessionCount: "Sessions", amount: "Amount", amountPaid: "Amount paid",
  balanceDue: "Balance due", currency: "Currency", status: "Status", provider: "Sign-in method", startsAt: "Starts (Dubai)",
  endsAt: "Ends (Dubai)", fields: "Fields submitted", source: "Source" };
function detailValue(key: string, value: unknown) {
  if ((key === "startsAt" || key === "endsAt") && typeof value === "string") return dateFormat.format(new Date(value));
  return Array.isArray(value) ? value.join(", ") : String(value);
}
export default function AdminActivityHistory() {
  const [events, setEvents] = useState<Entry[]>([]);
  const [action, setAction] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState<Cursor>(null);
  const [nextCursor, setNextCursor] = useState<Cursor>(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    const params = new URLSearchParams({ action, q: query });
    if (cursor) { params.set("beforeId", String(cursor.id)); params.set("beforeTime", cursor.time); }
    async function load() {
      try {
        const res = await fetch(`/api/admin/activity?${params}`, { cache: "no-store", signal: controller.signal });
        const data = await readActivityResponse(res);
        if (!controller.signal.aborted) { setEvents(data.events); setNextCursor(data.nextCursor); }
      } catch (e) {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Unable to load activity history.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    load(); return () => controller.abort();
  }, [action, query, cursor, refresh]);
  return <div className="rounded-2xl border bg-white p-5 shadow-sm">
    <p className="mb-4 text-sm text-slate-600">Latest 100 events across all users, newest first. All times are Dubai (UAE, UTC+4). Use Older events to view earlier records.</p>
    <form className="mb-5 flex flex-wrap items-end gap-3" onSubmit={e => { e.preventDefault(); setQuery(searchInput.trim()); setCursor(null); setRefresh(n => n + 1); }}>
      <label className="text-sm font-semibold">Event type
        <select className="mt-1 block rounded-lg border p-2" value={action} onChange={e => { setAction(e.target.value); setCursor(null); }}>
          <option value="">All events</option>
          {Object.entries(ACTIVITY_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold">User or record
        <input className="mt-1 block rounded-lg border p-2" placeholder="Name, email or exact ID" value={searchInput} maxLength={191} onChange={e => setSearchInput(e.target.value)} />
      </label>
      <button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white" type="submit">Search</button>
      <button className="rounded-lg border px-4 py-2 font-semibold disabled:opacity-50" type="button" disabled={loading}
        onClick={() => { setCursor(null); setRefresh(n => n + 1); }}>Refresh latest</button>
    </form>
    {loading ? <p role="status">Loading activity…</p> : error ? <p role="alert" className="text-red-700">{error}</p> : events.length === 0 ?
      <p className="rounded-lg bg-slate-50 p-4 text-sm">No matching activity. Recording starts after this update is installed.</p> :
      <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead className="bg-slate-100"><tr>{["Time — Dubai (UTC+4)", "User", "Role", "Event", "Record", "Details"].map(x => <th key={x} className="p-3">{x}</th>)}</tr></thead>
        <tbody>{events.map(event => <tr key={event.id} className="border-t align-top">
          <td className="whitespace-nowrap p-3">{dateFormat.format(new Date(event.createdAt))}</td>
          <td className="p-3"><div className="font-semibold">{event.actorName}</div><div className="text-slate-600">{event.actorEmail || event.actorId || "No signed-in account"}</div></td>
          <td className="p-3">{event.actorRole}</td>
          <td className="p-3 font-semibold">{ACTIVITY_LABELS[event.action] || event.action}</td>
          <td className="p-3">{event.entityType}{event.entityId ? ` #${event.entityId}` : ""}</td>
          <td className="min-w-52 p-3">{Object.entries(event.details || {}).length ? <details><summary className="cursor-pointer text-blue-700">View details</summary>
            <dl className="mt-2 space-y-1">{Object.entries(event.details || {}).map(([key, value]) => <div key={key}><dt className="inline font-semibold">{detailNames[key] || key}: </dt><dd className="inline break-all">{detailValue(key, value)}</dd></div>)}</dl>
          </details> : "—"}</td>
        </tr>)}</tbody>
      </table></div>}
    <div className="mt-4 flex items-center gap-3">
      {cursor && <button type="button" disabled={loading} className="rounded-lg border px-4 py-2" onClick={() => setCursor(null)}>Back to latest</button>}
      {nextCursor && !error && <button type="button" disabled={loading} className="rounded-lg border px-4 py-2 disabled:opacity-50" onClick={() => setCursor(nextCursor)}>Older events</button>}
    </div>
  </div>;
}
