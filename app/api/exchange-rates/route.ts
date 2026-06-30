import { NextResponse } from "next/server";
import { BASE_CURRENCY, CURRENCY_CODES, FALLBACK_USD_RATES } from "@/lib/currency";

export const revalidate = 60 * 60 * 6;

export async function GET() {
  try {
    const symbols = CURRENCY_CODES.filter((c) => c !== BASE_CURRENCY).join(",");

    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${BASE_CURRENCY}&to=${symbols}`,
      { next: { revalidate } }
    );

    if (!res.ok) throw new Error("Exchange-rate API failed");

    const data = await res.json();

    return NextResponse.json({
      base: BASE_CURRENCY,
      rates: { ...FALLBACK_USD_RATES, ...data.rates, USD: 1 },
    });
  } catch {
    return NextResponse.json({
      base: BASE_CURRENCY,
      rates: FALLBACK_USD_RATES,
    });
  }
}