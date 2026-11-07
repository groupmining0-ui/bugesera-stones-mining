import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHero } from "@/components/site/page-hero";
import { OrderTracker } from "@/components/site/order-tracker";
import { formatRwf } from "@/lib/utils";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/server-i18n";

export const metadata: Metadata = { title: "My account" };
export const dynamic = "force-dynamic";

export default async function Account({ searchParams }: { searchParams: Promise<{ paid?: string }> }) {
  const [session, locale] = await Promise.all([auth(), getLocale()]);
  const t = dictionary[locale];
  if (!session?.user) redirect("/login?next=/account");
  if (session.user.role === "ADMIN") redirect("/admin");
  const { paid } = await searchParams;

  const [orders, quotes] = await Promise.all([
    db.order.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, include: { items: { include: { product: true } } } }),
    db.quote.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <>
      <PageHero title={`${t.account.hello}, ${session.user.name?.split(" ")[0] ?? "there"}`} />
      <div className="mx-auto max-w-5xl space-y-14 px-5 py-14">
        {paid && (
          <p role="status" className="border-l-4 border-hivis bg-white p-4">
            {t.account.thanks} {paid}. {t.account.statusUpdate}
          </p>
        )}
        <section>
          <h2 className="font-display text-2xl font-bold">{t.account.orders}</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-granite">{t.account.noOrders} <a className="underline" href="/order">{t.account.placeOrder}</a>.</p>
          ) : (
            <ul className="mt-4 space-y-5">
              {orders.map((o) => (
                <li key={o.id} className="rounded-2xl border border-granite/15 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <p className="font-medium">{o.reference}</p>
                      <p className="text-sm text-granite">{o.items.map((i) => `${i.quantity} × ${i.product.name}`).join(", ")}</p>
                    </div>
                    <p className="font-display font-bold">{formatRwf(o.totalRwf)}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full border border-hivis/25 bg-hivis/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-basalt">
                      {o.status.replaceAll("_", " ").toLowerCase()}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/account/orders/${o.reference}`} className="text-sm font-medium underline underline-offset-2">
                        {t.account.trackOrder}
                      </Link>
                      {o.status === "PENDING_PAYMENT" && (
                        <Link href="/order" className="text-sm font-medium underline underline-offset-2">
                          {t.account.payNow}
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="mt-5">
                    <OrderTracker status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className="font-display text-2xl font-bold">{t.account.quoteRequests}</h2>
          {quotes.length === 0 ? (
            <p className="mt-3 text-granite">{t.account.noQuotes}</p>
          ) : (
            <ul className="mt-4 divide-y divide-granite/20 border-y border-granite/20">
              {quotes.map((q) => (
                <li key={q.id} className="flex justify-between gap-4 py-3">
                  <span>{q.location}</span>
                  <span className="text-granite">{q.status.toLowerCase()} · {q.createdAt.toLocaleDateString("en-GB")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
