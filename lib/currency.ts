export type CurrencyCode =
  | "USD" | "CAD" | "AED" | "GBP" | "EUR"
  | "AUD" | "NZD" | "INR" | "PKR" | "BDT" | "SAR" | "QAR";

export const BASE_CURRENCY: CurrencyCode = "USD";

export const CURRENCIES = {
  USD: { label: "USD - US Dollar", symbol: "$", flag: "🇺🇸" },
  CAD: { label: "CAD - Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  AED: { label: "AED - UAE Dirham", symbol: "AED", flag: "🇦🇪" },
  GBP: { label: "GBP - British Pound", symbol: "£", flag: "🇬🇧" },
  EUR: { label: "EUR - Euro", symbol: "€", flag: "🇪🇺" },
  AUD: { label: "AUD - Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  NZD: { label: "NZD - New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿" },
  INR: { label: "INR - Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  PKR: { label: "PKR - Pakistani Rupee", symbol: "₨", flag: "🇵🇰" },
  BDT: { label: "BDT - Bangladeshi Taka", symbol: "৳", flag: "🇧🇩" },
  SAR: { label: "SAR - Saudi Riyal", symbol: "SAR", flag: "🇸🇦" },
  QAR: { label: "QAR - Qatari Riyal", symbol: "QAR", flag: "🇶🇦" },
} as const;

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

export const FALLBACK_USD_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  CAD: 1.37,
  AED: 3.67,
  GBP: 0.79,
  EUR: 0.93,
  AUD: 1.52,
  NZD: 1.64,
  INR: 83.5,
  PKR: 278,
  BDT: 117,
  SAR: 3.75,
  QAR: 3.64,
};