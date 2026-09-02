import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/adminSecurity";

// Disable the previous reset feature even if this package overlays an installed copy.
export async function POST() {
  if (!(await getCurrentAdmin())) {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }
  return NextResponse.json({ error: "The admin password-reset feature has been removed." }, { status: 410 });
}
