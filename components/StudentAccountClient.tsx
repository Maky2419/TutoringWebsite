"use client";

import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

function CardForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadCards() {
    const res = await fetch("/api/stripe/payment-methods");
    const data = await res.json();
    setCards(data.paymentMethods || []);
  }

  useEffect(() => {
    loadCards();
  }, []);

  async function handleSaveCard(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!stripe || !elements) return;

    setSaving(true);

    try {
      const setupRes = await fetch("/api/stripe/create-setup-intent", { method: "POST" });
      const setupData = await setupRes.json();

      if (!setupRes.ok) throw new Error(setupData.error || "Could not start card setup.");

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card form is not ready.");

      const result = await stripe.confirmCardSetup(setupData.clientSecret, {
        payment_method: { card: cardElement },
      });

      if (result.error) throw new Error(result.error.message || "Card setup failed.");

      cardElement.clear();
      setMessage("Card saved successfully.");
      await loadCards();
    } catch (error: any) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07111f] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold">Student account</h1>
        <p className="mt-2 text-white/60">Save a card for tuition payments.</p>

        <form onSubmit={handleSaveCard} className="mt-8 space-y-5">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <CardElement options={{ hidePostalCode: true }} />
          </div>

          <button
            disabled={!stripe || saving}
            className="rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-black disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save card"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-emerald-200">{message}</p>}

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Saved cards</h2>
          <div className="mt-4 space-y-3">
            {cards.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/15 p-4 text-white/55">No saved cards yet.</p>
            ) : (
              cards.map((card) => (
                <div key={card.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  {card.brand.toUpperCase()} ending in {card.last4} · expires {card.expMonth}/{card.expYear}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentAccountClient() {
  return (
    <Elements stripe={stripePromise}>
      <CardForm />
    </Elements>
  );
}
