// Legacy cancellation URL. Preserve the lesson and payment history on cancellation.
import { PATCH } from "./[id]/route";
export async function DELETE(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = new URL(req.url).searchParams.get("id") || body.sessionId || body.id || "";
  return PATCH(req, { params: { id: String(id) } });
}
