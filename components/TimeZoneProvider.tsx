"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DUBAI_TIME_ZONE, isTimeZone } from "@/lib/sessionTime";

const KEY = "kcubed-calendar-time-zone";
const Context = createContext({ timeZone: DUBAI_TIME_ZONE, ready: false, automatic: true,
  setTimeZone: (_zone: string) => {}, useDeviceTimeZone: () => {} });

function deviceZone() {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isTimeZone(zone) ? zone : DUBAI_TIME_ZONE;
  } catch { return DUBAI_TIME_ZONE; }
}

export function TimeZoneProvider({ children }: { children: ReactNode }) {
  const [timeZone, setZone] = useState(DUBAI_TIME_ZONE);
  const [ready, setReady] = useState(false);
  const [automatic, setAutomatic] = useState(true);
  useEffect(() => {
    function detect() {
      let saved: string | null = null;
      try { saved = localStorage.getItem(KEY); } catch {}
      const manual = !!saved && isTimeZone(saved);
      setZone(manual ? saved! : deviceZone());
      setAutomatic(!manual);
      setReady(true);
    }
    detect();
    window.addEventListener("focus", detect);
    window.addEventListener("storage", detect);
    return () => { window.removeEventListener("focus", detect); window.removeEventListener("storage", detect); };
  }, []);
  function setTimeZone(zone: string) {
    if (!isTimeZone(zone)) return;
    setZone(zone); setAutomatic(false);
    try { localStorage.setItem(KEY, zone); } catch {}
  }
  function useDeviceTimeZone() {
    try { localStorage.removeItem(KEY); } catch {}
    setZone(deviceZone()); setAutomatic(true);
  }
  return <Context.Provider value={{ timeZone, ready, automatic, setTimeZone, useDeviceTimeZone }}>{children}</Context.Provider>;
}
export const useTimeZone = () => useContext(Context);

export function TimeZoneSelector({ disabled = false }: { disabled?: boolean }) {
  const { timeZone, ready, automatic, setTimeZone, useDeviceTimeZone } = useTimeZone();
  const [zones, setZones] = useState([DUBAI_TIME_ZONE]);
  useEffect(() => {
    const supported = (Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.("timeZone") ||
      ["America/Toronto", "America/Vancouver", "America/Edmonton", "America/Winnipeg", "America/Halifax", "America/St_Johns", "Europe/London", "Asia/Kolkata", "Asia/Dhaka"];
    setZones([...new Set([DUBAI_TIME_ZONE, timeZone, "UTC", ...supported])].sort());
  }, [timeZone]);
  return <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700">
    <p className="font-bold">Platform time: Dubai (UAE, UTC+4)</p>
    <label className="mt-2 block">Your calendar time zone {automatic ? "(device detected)" : "(selected)"}
      <select disabled={!ready || disabled} value={timeZone} onChange={e => setTimeZone(e.target.value)} className="mt-1 block w-full rounded-lg border border-blue-200 bg-white p-2">
        {zones.map(zone => <option key={zone} value={zone}>{zone.replace(/_/g, " ")}</option>)}
      </select>
    </label>
    <p className="mt-2 text-xs">Check your city’s time zone. Calendar dates use this zone; Dubai time is shown with every lesson.</p>
    {!automatic && <button type="button" disabled={disabled} className="mt-2 font-semibold text-blue-700 underline" onClick={useDeviceTimeZone}>Use my device time zone</button>}
  </div>;
}
