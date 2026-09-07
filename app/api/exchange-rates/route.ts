import { NextResponse } from "next/server";
import { BASE_CURRENCY } from "@/lib/currency";
import { EXCHANGE_RATE_REVALIDATE_SECONDS, getUsdExchangeRates } from "@/lib/exchangeRates";

export const revalidate = EXCHANGE_RATE_REVALIDATE_SECONDS;

export async function GET() {
  return NextResponse.json({
    base: BASE_CURRENCY,
    rates: await getUsdExchangeRates(),
  });
}
