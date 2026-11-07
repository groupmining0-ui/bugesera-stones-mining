import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/page-hero";
import { equipment as fallbackEquipment } from "@/lib/content";
import { ensureDefaultEquipment, getActiveEquipment } from "@/lib/db";

export const metadata: Metadata = { title: "Equipment" };

export default async function Equipment() {
  await ensureDefaultEquipment();
  const equipmentData = await getActiveEquipment();
  const equipment = equipmentData.length > 0
    ? equipmentData.map((item) => ({
        name: item.name,
        job: item.job,
        imageUrl: item.imageUrl ?? undefined,
      }))
    : fallbackEquipment.map((item) => ({
        name: item.name,
        job: item.job,
        imageUrl: item.image,
      }));

  return (
    <>
      <PageHero title="The machines behind the stone" intro="We start with the machines that produce the most: crusher, screen, loader and cutting machine. The rest are added as the market grows." />
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {equipment.map((e) => (
            <div key={e.name} className="overflow-hidden rounded-3xl border border-granite/15 bg-quartz shadow-sm">
              <div className="relative h-56 w-full overflow-hidden">
                <Image src={e.imageUrl || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80"} alt={e.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
              </div>
              <div className="p-6">
                <dt className="font-display text-lg font-bold">{e.name}</dt>
                <dd className="mt-1 text-granite">{e.job}</dd>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
