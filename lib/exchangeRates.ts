import { BASE_CURRENCY, CURRENCY_CODES, FALLBACK_USD_RATES } from "./currency";

export const EXCHANGE_RATE_REVALIDATE_SECONDS = 60 * 60 * 6;

export async function getUsdExchangeRates() {
  try {
    const symbols = CURRENCY_CODES.filter(code => code !== BASE_CURRENCY).join(",");
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${BASE_CURRENCY}&to=${symbols}`,
      { next: { revalidate: EXCHANGE_RATE_REVALIDATE_SECONDS } }
    );

    if (!response.ok) throw new Error("Exchange-rate API failed");
    const data = await response.json();
    return { ...FALLBACK_USD_RATES, ...data.rates, USD: 1 };
  } catch {
    return FALLBACK_USD_RATES;
  }
}
