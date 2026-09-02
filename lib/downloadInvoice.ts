"use client";
const pending = new Set<number>();
export async function downloadInvoice(assignmentId: number) {
  if (pending.has(assignmentId)) return;
  pending.add(assignmentId);
  try {
    const response = await fetch("/api/invoices", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignmentId }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Unable to generate invoice.");
    }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url; link.download = `invoice-${assignmentId}.pdf`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  } catch (error) { window.alert(error instanceof Error ? error.message : "Unable to generate invoice."); }
  finally { pending.delete(assignmentId); }
}
