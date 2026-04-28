"use client";

import { PaymentElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Assignment = {
  id: number;
  purchasedHours: number | string;
  usedHours: number | string;
  tutor: {
    name: string;
    hourlyRate: number;
    paymentFrequency: string;
  };
};

function PaymentForm({ assignmentId, clientSecret }: { assignmentId: number; clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");
  const [paying, setPaying] = useState(false);

  async function handlePay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setMessage("");

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/student/dashboard?payment=success&assignment=${assignmentId}`,
      },
    });

    if (result.error) {
      setMessage(result.error.message || "Payment failed.");
      setPaying(false);
    }
  }

  return (
    <form onSubmit={handlePay} className="mt-4 space-y-4">
      <PaymentElement />
      <button
        disabled={!stripe || paying}
        className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"
      >
        {paying ? "Processing..." : "Pay tuition"}
      </button>
      {message && <p className="text-sm text-rose-200">{message}</p>}
    </form>
  );
}

export default function TuitionPaymentBox({ assignments }: { assignments: Assignment[] }) {
  const [assignmentId, setAssignmentId] = useState(assignments[0]?.id || 0);
  const [hours, setHours] = useState("1");
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const selected = assignments.find((a) => a.id === assignmentId);

  async function startPayment() {
    setError("");
    setClientSecret("");

    const res = await fetch("/api/stripe/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, hours: Number(hours) }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Could not start payment.");
      return;
    }

    setClientSecret(data.clientSecret);
  }

  if (assignments.length === 0) return null;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-semibold text-white">Pay tuition</h2>
      <p className="mt-1 text-sm text-white/55">
        Payments are split automatically between the platform and the tutor.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-white/70">Tutor</label>
          <select
            value={assignmentId}
            onChange={(e) => setAssignmentId(Number(e.target.value))}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
          >
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.tutor.name} - ${assignment.tutor.hourlyRate}/hr
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">Hours to pay for</label>
          <input
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            type="number"
            min="0.5"
            step="0.5"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
          />
        </div>
      </div>

      {selected && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
          Payment frequency: {selected.tutor.paymentFrequency.replace("_", " ")} · Paid hours: {Number(selected.purchasedHours).toFixed(1)} · Used hours: {Number(selected.usedHours).toFixed(1)} · Amount: ${(Number(hours || 0) * selected.tutor.hourlyRate).toFixed(2)} CAD
        </div>
      )}

      <button
        onClick={startPayment}
        className="mt-4 rounded-xl border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-black"
      >
        Continue to payment
      </button>

      {error && <p className="mt-3 text-sm text-rose-200">{error}</p>}

      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm assignmentId={assignmentId} clientSecret={clientSecret} />
        </Elements>
      )}
    </section>
  );
}
