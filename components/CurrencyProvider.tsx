"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { BASE_CURRENCY, CURRENCY_CODES, FALLBACK_USD_RATES, CURRENCIES, type CurrencyCode } from "@/lib/currency";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  convertFromUSD: (amountUSD: number | string) => number;
  formatFromUSD: (amountUSD: number | string) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCY_CODES.includes(value as CurrencyCode);
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(BASE_CURRENCY);
  const [rates, setRates] = useState(FALLBACK_USD_RATES);

  useEffect(() => {
    const saved = localStorage.getItem("kcubed-currency");
    if (saved && isCurrencyCode(saved)) setCurrencyState(saved);
  }, []);

  useEffect(() => {
    async function loadRates() {
      try {
        const res = await fetch("/api/exchange-rates", { cache: "no-store" });
        const data = await res.json();
        if (data?.rates) setRates({ ...FALLBACK_USD_RATES, ...data.rates, USD: 1 });
      } catch {
        setRates(FALLBACK_USD_RATES);
      }
    }

    loadRates();
  }, []);

  function setCurrency(next: CurrencyCode) {
    setCurrencyState(next);
    localStorage.setItem("kcubed-currency", next);
  }

  const value = useMemo(() => {
  function convertFromUSD(amountUSD: number | string) {
  const converted = Number(amountUSD || 0) * (rates[currency] || 1);

  // Round to the nearest multiple of 5
  return Math.round(converted / 5) * 5;
}

    function formatFromUSD(amountUSD: number | string) {
      const amount = convertFromUSD(amountUSD);
      const meta = CURRENCIES[currency];

      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: amount >= 100 ? 0 : 2,
        maximumFractionDigits: amount >= 100 ? 0 : 2,
      }).format(amount);

      if (["AED", "SAR", "QAR"].includes(currency)) {
        return `${formatted} ${meta.symbol}`;
      }

      return `${meta.symbol}${formatted}`;
    }

    return { currency, setCurrency, convertFromUSD, formatFromUSD };
  }, [currency, rates]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}

export function Money({ amountUSD, suffix = "" }: { amountUSD: number | string; suffix?: string }) {
  const { formatFromUSD } = useCurrency();
  return <span>{formatFromUSD(amountUSD)}{suffix}</span>;
}