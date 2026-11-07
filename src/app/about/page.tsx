import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/page-hero";
import { company, staffing } from "@/lib/content";
import { ensureDefaultStaffMembers, getActiveTeamMembers } from "@/lib/db";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/server-i18n";

export const metadata: Metadata = { title: "About" };

export default async function About() {
  const locale = await getLocale();
  const t = dictionary[locale];
  await ensureDefaultStaffMembers();
  const staticTotal = staffing.reduce((s, [, n]) => s + n, 0);
  const staff = await getActiveTeamMembers();
  const total = staff.length > 0 ? staff.length : staticTotal;

  return (
    <>
      <PageHero title={t.about.heroTitle} intro={t.about.heroText} />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold">{t.about.vision}</h2>
          <p className="mt-3 text-granite">{company.vision}</p>
          <h2 className="font-display mt-10 text-2xl font-bold">{t.about.mission}</h2>
          <p className="mt-3 text-granite">{company.mission}</p>
          <h2 className="font-display mt-10 text-2xl font-bold">{t.about.locationTitle}</h2>
          <p className="mt-3 text-granite">{company.location}. Sector: mining, quarrying, stone processing and construction materials manufacturing.</p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">{t.about.commitmentTitle}</h2>
          <ul className="mt-3 space-y-3 text-granite">
            <li>Quarrying lawfully and protecting the environment.</li>
            <li>Producing dressed and undressed building stone.</li>
            <li>Processing stone with modern machines.</li>
            <li>Making gravel, aggregates and sand.</li>
            <li>Building a plant that makes products from stone.</li>
            <li>Serving contractors, builders, dealers and road companies.</li>
          </ul>
        </div>
      </section>
      <section className="bg-slate">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <h2 className="font-display text-2xl font-bold">{t.about.openingTeam}: {total} people</h2>
          <p className="mt-2 text-granite">{t.about.startingPlan}</p>

          {staff.length > 0 ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {staff.map((member) => (
                <div key={member.id} className="overflow-hidden rounded-3xl border border-granite/20 bg-white shadow-sm">
                  <div className="relative h-72 w-full bg-[#f5f3f0]">
                    <Image
                      src={member.imageUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80"}
                      alt={member.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2 p-5">
                    <p className="font-display text-xl font-bold">{member.name}</p>
                    <p className="text-sm font-medium uppercase tracking-[0.16em] text-granite">{member.role}</p>
                    {member.department && <p className="text-sm text-granite">{member.department}</p>}
                    {member.email && <p className="text-sm text-granite">{member.email}</p>}
                    {member.bio && <p className="text-sm text-granite">{member.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <dl className="mt-8 grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {staffing.map(([role, n]) => (
                <div key={role} className="flex items-baseline justify-between border-b border-granite/20 py-2">
                  <dt>{role}</dt>
                  <dd className="font-display text-lg font-bold">{n}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>
    </>
  );
}
