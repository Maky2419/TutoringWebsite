"use client";

import { useState } from "react";

type FeedDetails = { feedUrl: string; webcalUrl: string; downloadUrl: string };

export default function CalendarSyncButtons() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getFeed(): Promise<FeedDetails | null> {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/calendar/feed", { method: "POST" });
      if (!response.ok) throw new Error("Could not prepare your calendar.");
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not prepare your calendar.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function openApple() {
    const feed = await getFeed();
    if (feed) window.location.href = feed.webcalUrl;
  }

  async function openGoogle() {
    const feed = await getFeed();
    if (feed) window.open(`https://calendar.google.com/calendar/render?cid=${encodeURIComponent(feed.webcalUrl)}`, "_blank", "noopener,noreferrer");
  }

  async function downloadCalendar() {
    const feed = await getFeed();
    if (feed) window.location.href = feed.downloadUrl;
  }

  return (
    <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button type="button" onClick={openGoogle} disabled={loading} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
          Add to Google Calendar
        </button>
        <button type="button" onClick={openApple} disabled={loading} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60">
          Add to Apple Calendar
        </button>
        <button type="button" onClick={downloadCalendar} disabled={loading} className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-60">
          Download .ics
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-600">
        Google and Apple subscriptions update automatically when sessions change. Refresh timing is controlled by your calendar app.
      </p>
      {error && <p className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
    </div>
  );
}
