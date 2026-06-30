"use client";

import { CURRENCIES, CURRENCY_CODES, type CurrencyCode } from "@/lib/currency";
import { useCurrency } from "./CurrencyProvider";

export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
      className="h-[42px] rounded-full border border-blue-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm"
    >
      {CURRENCY_CODES.map((code) => (
        <option key={code} value={code}>
          {CURRENCIES[code].flag} {code}
        </option>
      ))}
    </select>
  );
}