"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ProductPicker, type PickedItem } from "@/components/site/product-picker";
import { readCartFromStorage } from "@/components/site/cart";

export function OrderForm() {
  const [items, setItems] = useState<PickedItem[]>(() =>
    readCartFromStorage().map((item) => ({ productId: item.id, quantity: item.quantity }))
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryAddr: f.get("deliveryAddr"), items }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.paymentUrl) {
      window.location.href = d.paymentUrl;
      return;
    }
    setError(
      d.reference
        ? `Your order ${d.reference} is saved but payment could not start: ${d.error} You can pay later from your account.`
        : d.error ?? "Could not place the order. Try again."
    );
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <p className="mb-1.5 text-sm font-medium">Products and quantities</p>
        <ProductPicker value={items} onChange={setItems} pricedOnly />
      </div>
      <div><Label htmlFor="deliveryAddr">Delivery address</Label><Input id="deliveryAddr" name="deliveryAddr" required minLength={5} placeholder="Site name, sector, district" /></div>
      {error && <p role="alert" className="text-sm font-medium text-laterite">{error}</p>}
      <Button type="submit" size="lg" disabled={busy || items.length === 0}>{busy ? "Starting payment…" : "Continue to payment"}</Button>
    </form>
  );
}
