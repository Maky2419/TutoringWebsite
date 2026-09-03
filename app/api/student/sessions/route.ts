// Legacy URL uses the same validation and approval flow as the current URL.
import { PATCH } from "./[id]/route";
export async function DELETE(req: Request) {
  const body = await req.clone().json().catch(() => ({}));
  const id = new URL(req.url).searchParams.get("id") || body?.sessionId || body?.id || "";
  return PATCH(req, { params: { id: String(id) } });
}
