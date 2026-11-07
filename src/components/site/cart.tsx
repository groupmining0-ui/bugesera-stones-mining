"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRwf } from "@/lib/utils";

export type CartProduct = {
  id: string;
  name: string;
  slug?: string;
  unit: string;
  priceRwf: number | null;
  category?: string;
  summary?: string | null;
  imageUrl?: string | null;
};

export type CartEntry = CartProduct & {
  quantity: number;
};

const STORAGE_KEY = "bugesera-stoneworks-cart";

export function readCartFromStorage(): CartEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => !!item && (typeof item.productId === "string" || typeof item.id === "string"))
      .map((item) => ({
        id: item.id ?? item.productId,
        productId: item.productId ?? item.id,
        slug: item.slug,
        name: item.name,
        unit: item.unit ?? "tonne",
        priceRwf: item.priceRwf ?? null,
        category: item.category,
        summary: item.summary,
        imageUrl: item.imageUrl,
        quantity: Math.max(1, Number(item.quantity) || 1),
      }))
      .filter((item) => item.id);
  } catch {
    return [];
  }
}

function saveCartToStorage(cart: CartEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function useCart() {
  const [cart, setCart] = useState<CartEntry[]>(() => readCartFromStorage());

  const commitCart = (nextCart: CartEntry[]) => {
    setCart(nextCart);
    saveCartToStorage(nextCart);
  };

  const addToCart = (product: CartProduct, quantity = 1) => {
    if (quantity <= 0) return;

    const next = readCartFromStorage();
    const existing = next.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += quantity;
      commitCart(next);
      return;
    }

    commitCart([
      ...next,
      {
        ...product,
        quantity,
        id: product.id,
      },
    ]);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const next = readCartFromStorage().map((item) =>
      item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
    );
    commitCart(next.filter((item) => item.quantity > 0));
  };

  const removeItem = (productId: string) => {
    const next = readCartFromStorage().filter((item) => item.id !== productId);
    commitCart(next);
  };

  const clearCart = () => commitCart([]);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cart.reduce((total, item) => total + (item.priceRwf ?? 0) * item.quantity, 0);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalAmount,
  };
}

export function ProductQuickViewButton({ product }: { product: CartProduct }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="ghost" size="sm" className="px-0 text-basalt underline underline-offset-2" onClick={() => setOpen(true)}>
        Quick view
      </Button>

      {open && <ProductQuickView product={product} onClose={() => setOpen(false)} />}
    </>
  );
}

function ProductQuickView({ product, onClose }: { product: CartProduct; onClose: () => void }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const imageUrl = product.imageUrl || "/hero/stone-1.webp";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-basalt/70 p-4">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-granite/20 bg-white shadow-2xl">
        <button
          type="button"
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-basalt shadow-sm"
          onClick={onClose}
        >
          Close
        </button>

        <div className="grid gap-0 md:grid-cols-2">
          <div className="relative min-h-[300px] bg-slate">
            <Image src={imageUrl} alt={product.name} fill className="object-cover" />
          </div>

          <div className="space-y-5 p-6 md:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-granite">{product.category || "Stone product"}</p>
              <h3 className="mt-2 font-display text-3xl font-bold">{product.name}</h3>
            </div>

            <p className="text-2xl font-display font-bold text-basalt">
              {product.priceRwf != null ? `${formatRwf(product.priceRwf)} / ${product.unit}` : "Price on request"}
            </p>

            <p className="text-sm leading-6 text-granite">
              {product.summary || "Premium construction material selected for quality, consistency and reliable delivery."}
            </p>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-granite" htmlFor={`qty-${product.id}`}>
                Quantity
              </label>
              <Input
                id={`qty-${product.id}`}
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="h-10 w-24"
              />
              <span className="text-sm text-granite">{product.unit}</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                size="lg"
                disabled={product.priceRwf == null}
                onClick={() => {
                  addToCart(product, quantity);
                  onClose();
                }}
              >
                Add to cart
              </Button>
              <Button type="button" size="lg" variant="dark" onClick={onClose}>
                Continue shopping
              </Button>
            </div>

            {product.priceRwf == null && (
              <p className="text-sm text-granite">This product is priced on request. Please contact us for a custom price.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailsCart({ product }: { product: CartProduct }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (product.priceRwf == null) {
    return (
      <Button asChild size="lg" variant="outline" className="w-full justify-center">
        <Link href="/contact">Contact us</Link>
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3 rounded-xl border border-granite/20 bg-white px-3 py-2">
        <label htmlFor={`detail-qty-${product.id}`} className="text-sm font-medium text-granite">
          Tonnes
        </label>
        <Input
          id={`detail-qty-${product.id}`}
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="h-10 w-24"
        />
      </div>
      <Button type="button" size="lg" onClick={() => addToCart(product, quantity)} className="flex-1 sm:flex-none">
        Add to cart
      </Button>
    </div>
  );
}

export function ProductCartControl({ product }: { product: CartProduct }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (product.priceRwf == null) {
    return (
      <Button asChild size="sm" variant="outline" className="w-full justify-center">
        <Link href="/contact">Contact us</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
        className="h-10 w-20"
      />
      <Button type="button" size="sm" onClick={() => addToCart(product, quantity)}>
        Add to cart
      </Button>
    </div>
  );
}

export function CartSummary() {
  const { cart, totalItems, totalAmount, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="rounded-2xl border border-granite/15 bg-white p-4 shadow-sm">
        <p className="font-display text-xl font-bold">Cart</p>
        <p className="mt-2 text-sm text-granite">Your cart is empty. Add stone products to start an order.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-granite/15 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-xl font-bold">Cart</p>
        <Button type="button" variant="ghost" size="sm" className="px-0 text-granite underline" onClick={clearCart}>
          Clear
        </Button>
      </div>

      <ul className="mt-4 space-y-3">
        {cart.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 border-b border-granite/10 pb-2 last:border-0 last:pb-0">
            <div>
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-granite">
                {item.quantity} {item.unit} · {item.priceRwf != null ? formatRwf(item.priceRwf * item.quantity) : "Quote"}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-granite/10 pt-3">
        <div className="flex items-center justify-between text-sm text-granite">
          <span>Total tonnes</span>
          <span className="font-semibold text-basalt">{totalItems}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-granite">
          <span>Estimated total</span>
          <span className="font-display text-lg font-bold text-basalt">{formatRwf(totalAmount)}</span>
        </div>
      </div>

      <Button asChild size="sm" className="mt-4 w-full">
        <Link href="/order">Proceed to checkout</Link>
      </Button>
    </div>
  );
}
