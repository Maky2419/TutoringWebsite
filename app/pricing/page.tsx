"use client";

import { useMemo, useState } from "react";
import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";
import Link from "next/link";

type Currency = "AED" | "USD" | "CAD" | "EUR" | "GBP";

type CurrencyMeta = {
  symbol: string;
  label: string;
  // rate = 1 AED -> rate in that currency
  rateFromAED: number;
};

const CURRENCIES: Record<Currency, CurrencyMeta> = {
  AED: { symbol: " Dirham", label: "AED (Dirham)", rateFromAED: 1 },
  USD: { symbol: "$", label: "USD (US Dollar)", rateFromAED: 0.272 }, // approx
  CAD: { symbol: "$", label: "CAD (Canadian Dollar)", rateFromAED: 0.37 }, // approx
  EUR: { symbol: "€", label: "EUR (Euro)", rateFromAED: 0.25 }, // approx
  GBP: { symbol: "£", label: "GBP (British Pound)", rateFromAED: 0.215 } // approx
};

const BASE_PRICES_AED = [
  { title: "1 hour session", aed: 200, highlight: true },
  { title: "1.5 hour session", aed: 250, highlight: false }
];

export default function PricingPage() {
  const [currency, setCurrency] = useState<Currency>("AED");

  const meta = CURRENCIES[currency];

  const prices = useMemo(() => {
    return BASE_PRICES_AED.map((p) => ({
      ...p,
      value: p.aed * meta.rateFromAED
    }));
  }, [meta.rateFromAED]);

  function formatMoney(amount: number) {
    // AED shows no decimals; others show 0–2 nicely
    const decimals = currency === "AED" ? 0 : amount < 10 ? 2 : 0;
    const rounded = amount.toFixed(decimals);
    return `${meta.symbol}${rounded}`;
  }

  return (
    <div className="relative overflow-hidden">
      {/* glow background */}
      <div className="pointer-events-none absolute -top-40 left-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-3xl" />

      <PageHeader
        title="Pricing"
        subtitle="Simple, consistent rates — same price no matter which tutor you choose."
      />

      <Container>
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 space-y-10">
          {/* Currency picker */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-7 shadow-xl shadow-black/20 backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Choose your currency</h2>
                <p className="mt-1 text-white/70">
                  Prices are based on AED and converted for convenience.
                </p>
              </div>

              <div className="w-full sm:w-auto">
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full sm:w-[260px] rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/25"
                >
                  {(Object.keys(CURRENCIES) as Currency[]).map((c) => (
                    <option key={c} value={c}>
                      {CURRENCIES[c].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/75">
                <span className="text-white font-semibold">Base currency:</span> AED (Dirham).{" "}
                <span className="text-white font-semibold">Same price</span> for every session,
                regardless of who is teaching it.
              </p>
            </div>
          </section>

          {/* Pricing cards */}
          <section className="grid gap-6 md:grid-cols-2">
            {prices.map((p) => (
              <div
                key={p.title}
                className={[
                  "rounded-2xl border bg-white/5 p-8 shadow-xl shadow-black/20 backdrop-blur",
                  p.highlight ? "border-white/20" : "border-white/10"
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white/80 text-sm">Session</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">{p.title}</h3>
                  </div>

                  {p.highlight && (
                    <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs font-semibold text-white/80">
                      Most chosen
                    </span>
                  )}
                </div>

                <div className="mt-6">
                  <p className="text-4xl font-semibold text-white">{formatMoney(p.value)}</p>
                  <p className="mt-2 text-sm text-white/60">
                    ({p.aed} AED base)
                  </p>
                </div>

                <ul className="mt-6 space-y-2 text-sm text-white/75">
                  <li className="flex gap-2">
                    <span className="mt-[2px] inline-block h-2 w-2 rounded-full bg-white/70" />
                    <span>Structured lesson plan</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[2px] inline-block h-2 w-2 rounded-full bg-white/70" />
                    <span>Practice + feedback during the session</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[2px] inline-block h-2 w-2 rounded-full bg-white/70" />
                    <span>Clear next steps for improvement</span>
                  </li>
                </ul>

                <div className="mt-7">
                  <Link
                    href="/book"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3 font-semibold text-black shadow-lg shadow-black/20 transition hover:bg-white/90"
                  >
                    Request a session
                  </Link>
                </div>
              </div>
            ))}
          </section>

          {/* Small note */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-7 shadow-xl shadow-black/20 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">Notes</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li className="flex gap-2">
                <span className="mt-[2px] inline-block h-2 w-2 rounded-full bg-white/70" />
                <span>Pricing is consistent across tutors — no surprises.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[2px] inline-block h-2 w-2 rounded-full bg-white/70" />
                <span>Currency conversions are approximate and shown for convenience.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[2px] inline-block h-2 w-2 rounded-full bg-white/70" />
                <span>Exact amount may vary slightly depending on payment method and bank rates.</span>
              </li>
            </ul>
          </section>
        </div>
      </Container>
    </div>
  );
}
