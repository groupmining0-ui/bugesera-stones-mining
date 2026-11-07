import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db, hasEquipmentModel, hasTeamMemberModel } from "@/lib/db";
import { PageHero } from "@/components/site/page-hero";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ImageUploadInput } from "@/components/admin/image-upload-input";
import { formatRwf } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "new-product"
  );
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login?next=/admin");
}

// ─── Staff actions ───────────────────────────────────────────────────────────

async function addStaffMember(formData: FormData) {
  "use server";
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const active = formData.get("active") === "on";

  if (!name || !role) return;
  if (!hasTeamMemberModel()) return;

  const count = await db.teamMember.count();
  await db.teamMember.create({
    data: {
      name,
      role,
      department: department || null,
      email: email || null,
      phone: phone || null,
      imageUrl: imageUrl || null,
      bio: bio || null,
      active,
      order: count,
    },
  });

  revalidatePath("/about");
  revalidatePath("/admin");
}

async function updateStaffMember(formData: FormData) {
  "use server";
  await requireAdmin();
  if (!hasTeamMemberModel()) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.teamMember.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? "").trim() || undefined,
      role: String(formData.get("role") ?? "").trim() || undefined,
      department: String(formData.get("department") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
      bio: String(formData.get("bio") ?? "").trim() || null,
      active: formData.get("active") === "on",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/about");
}

async function permanentlyDeleteStaffMember(formData: FormData) {
  "use server";
  await requireAdmin();
  if (!hasTeamMemberModel()) return;
  await db.teamMember.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin");
  revalidatePath("/about");
}

// ─── Equipment actions ────────────────────────────────────────────────────────

async function addEquipment(formData: FormData) {
  "use server";
  await requireAdmin();

  const name = String(formData.get("equipmentName") ?? "").trim();
  const job = String(formData.get("equipmentJob") ?? "").trim();
  const imageUrl = String(formData.get("equipmentImageUrl") ?? "").trim();
  const active = formData.get("equipmentActive") === "on";

  if (!name || !job) return;
  if (!hasEquipmentModel()) return;

  const count = await db.equipment.count();
  await db.equipment.create({
    data: {
      name,
      job,
      imageUrl: imageUrl || null,
      active,
      order: count,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/equipment");
}

async function updateEquipment(formData: FormData) {
  "use server";
  await requireAdmin();
  if (!hasEquipmentModel()) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.equipment.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? "").trim() || undefined,
      job: String(formData.get("job") ?? "").trim() || undefined,
      imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
      active: formData.get("active") === "on",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/equipment");
}

async function permanentlyDeleteEquipment(formData: FormData) {
  "use server";
  await requireAdmin();
  if (!hasEquipmentModel()) return;
  await db.equipment.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin");
  revalidatePath("/equipment");
}

// ─── Product actions ──────────────────────────────────────────────────────────

async function createProduct(formData: FormData) {
  "use server";
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const uses = String(formData.get("uses") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || uses;
  const category = String(formData.get("category") ?? "BUILDING_STONE");
  const unit = String(formData.get("unit") ?? "tonne").trim() || "tonne";
  const rawPrice = String(formData.get("priceRwf") ?? "").trim();

  if (!name || !uses) return;

  const priceRwf = rawPrice === "" ? null : Math.max(0, Number(rawPrice));
  if (priceRwf !== null && Number.isNaN(priceRwf)) return;

  const slug = slugify(String(formData.get("slug") ?? name));
  const existing = await db.product.findUnique({ where: { slug } });

  await db.product.create({
    data: {
      slug: existing ? `${slug}-${Date.now()}` : slug,
      name,
      category: category as
        | "BUILDING_STONE"
        | "MACHINE_CUT"
        | "AGGREGATE"
        | "MANUFACTURED_SAND"
        | "SPECIALTY"
        | "CONCRETE_PRODUCT",
      summary,
      uses,
      unit,
      priceRwf,
      sizeSpec: String(formData.get("sizeSpec") ?? "").trim() || null,
      imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
      active: formData.get("active") === "on",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/products");
}

async function updateProduct(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const rawPrice = String(formData.get("priceRwf") ?? "").trim();
  const priceRwf = rawPrice === "" ? null : Math.max(0, Number(rawPrice));
  if (priceRwf !== null && Number.isNaN(priceRwf)) return;

  await db.product.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? "").trim() || undefined,
      category:
        (String(formData.get("category") ?? "BUILDING_STONE") as
          | "BUILDING_STONE"
          | "MACHINE_CUT"
          | "AGGREGATE"
          | "MANUFACTURED_SAND"
          | "SPECIALTY"
          | "CONCRETE_PRODUCT") || undefined,
      summary: String(formData.get("summary") ?? "").trim() || undefined,
      uses: String(formData.get("uses") ?? "").trim() || undefined,
      unit: String(formData.get("unit") ?? "tonne").trim() || undefined,
      priceRwf,
      sizeSpec: String(formData.get("sizeSpec") ?? "").trim() || null,
      imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
      active: formData.get("active") === "on",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/products");
}

async function permanentlyDeleteProduct(formData: FormData) {
  "use server";
  await requireAdmin();
  await db.product.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin");
  revalidatePath("/products");
}

async function updatePrice(formData: FormData) {
  "use server";
  await requireAdmin();
  const raw = String(formData.get("price") ?? "").trim();
  const price = raw === "" ? null : Math.max(0, Math.floor(Number(raw)));
  if (price !== null && Number.isNaN(price)) return;
  await db.product.update({ where: { id: String(formData.get("id")) }, data: { priceRwf: price } });
  revalidatePath("/admin");
  revalidatePath("/products");
}

// ─── Quote / Order actions ────────────────────────────────────────────────────

async function setQuoteStatus(formData: FormData) {
  "use server";
  await requireAdmin();
  const status = String(formData.get("status"));
  if (!["NEW", "CONTACTED", "QUOTED", "WON", "LOST"].includes(status)) return;
  await db.quote.update({
    where: { id: String(formData.get("id")) },
    data: { status: status as "NEW" | "CONTACTED" | "QUOTED" | "WON" | "LOST" },
  });
  revalidatePath("/admin");
}

async function setOrderStatus(formData: FormData) {
  "use server";
  await requireAdmin();
  const status = String(formData.get("status"));
  if (!["PENDING_PAYMENT", "PAID", "PROCESSING", "DELIVERED", "CANCELLED"].includes(status)) return;
  await db.order.update({
    where: { id: String(formData.get("id")) },
    data: {
      status: status as "PENDING_PAYMENT" | "PAID" | "PROCESSING" | "DELIVERED" | "CANCELLED",
    },
  });
  revalidatePath("/admin");
  revalidatePath("/account");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Admin() {
  await requireAdmin();

  const teamMembers = hasTeamMemberModel()
    ? await db.teamMember.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      })
    : [];

  const equipment = hasEquipmentModel()
    ? await db.equipment.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      })
    : [];

  const [quotes, orders, products, users] = await Promise.all([
    db.quote.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { items: { include: { product: true } }, attachments: true },
    }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: true, items: { include: { product: true } } },
    }),
    db.product.findMany({ orderBy: { name: "asc" } }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  const paidTotal = orders
    .filter((o) => o.status === "PAID" || o.status === "PROCESSING" || o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.totalRwf, 0);

  const activeProducts = products.filter((p) => p.active).length;
  const activeTeam = teamMembers.filter((m) => m.active).length;
  const activeEquipment = equipment.filter((e) => e.active).length;

  const categoryOptions = [
    "BUILDING_STONE",
    "MACHINE_CUT",
    "AGGREGATE",
    "MANUFACTURED_SAND",
    "SPECIALTY",
    "CONCRETE_PRODUCT",
  ] as const;

  return (
    <>
      <PageHero
        title="Admin Dashboard"
        intro="Full control over your website content, products, team and orders."
      />
      <div className="mx-auto max-w-7xl space-y-16 px-5 py-14">

        {/* ── Dashboard Stats ── */}
        <section className="rounded-3xl border border-granite/20 bg-white p-6 shadow-sm space-y-6">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">📊 Dashboard Stats</h2>
          <dl className="grid gap-6 sm:grid-cols-3 lg:grid-cols-6">
            <div className="border-l-4 border-hivis pl-4">
              <dd className="font-display text-3xl font-extrabold">
                {quotes.filter((q) => q.status === "NEW").length}
              </dd>
              <dt className="text-sm text-granite">New quote requests</dt>
            </div>
            <div className="border-l-4 border-hivis pl-4">
              <dd className="font-display text-3xl font-extrabold">{orders.length}</dd>
              <dt className="text-sm text-granite">Total orders</dt>
            </div>
            <div className="border-l-4 border-hivis pl-4">
              <dd className="font-display text-3xl font-extrabold">{formatRwf(paidTotal)}</dd>
              <dt className="text-sm text-granite">Paid orders value</dt>
            </div>
            <div className="border-l-4 border-hivis pl-4">
              <dd className="font-display text-3xl font-extrabold">{activeProducts}</dd>
              <dt className="text-sm text-granite">Active products</dt>
            </div>
            <div className="border-l-4 border-hivis pl-4">
              <dd className="font-display text-3xl font-extrabold">{activeTeam}</dd>
              <dt className="text-sm text-granite">Active team members</dt>
            </div>
            <div className="border-l-4 border-hivis pl-4">
              <dd className="font-display text-3xl font-extrabold">{activeEquipment}</dd>
              <dt className="text-sm text-granite">Active equipment</dt>
            </div>
          </dl>
        </section>

        {/* ── Staff Management ── */}
        <section className="rounded-3xl border border-granite/20 bg-white p-6 shadow-sm space-y-6">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">👥 Staff Management</h2>

          <div>
            <h3 className="font-semibold text-lg mb-4">Add New Staff Member</h3>
            <form action={addStaffMember} className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="staff-add-name">Full name *</Label>
                <Input id="staff-add-name" name="name" required placeholder="Patrick Tuyisenge Sebarera" />
              </div>
              <div>
                <Label htmlFor="staff-add-role">Role *</Label>
                <Input id="staff-add-role" name="role" required placeholder="IT Officer" />
              </div>
              <div>
                <Label htmlFor="staff-add-department">Department</Label>
                <Input id="staff-add-department" name="department" placeholder="Information Technology" />
              </div>
              <div>
                <Label htmlFor="staff-add-email">Email</Label>
                <Input id="staff-add-email" name="email" type="email" placeholder="patrick@example.com" />
              </div>
              <div>
                <Label htmlFor="staff-add-phone">Phone</Label>
                <Input id="staff-add-phone" name="phone" placeholder="+250 ..." />
              </div>
              <div className="md:col-span-2">
                <ImageUploadInput
                  id="staff-add-imageUrl"
                  name="imageUrl"
                  label="Staff Photo"
                  placeholder="Upload photo from your computer or enter image URL"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="staff-add-bio">Bio</Label>
                <Textarea id="staff-add-bio" name="bio" placeholder="Technical lead and systems support" />
              </div>
              <div className="flex items-center gap-3 self-end">
                <input id="staff-add-active" name="active" type="checkbox" defaultChecked className="h-4 w-4" />
                <Label htmlFor="staff-add-active" className="mb-0">Show this staff member</Label>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" variant="dark">Save staff member</Button>
              </div>
            </form>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Current Team Members</h3>
            <ul className="space-y-4">
              {teamMembers.map((member) => (
                <li key={member.id} className="rounded-2xl border border-granite/20 bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium">
                      {member.name}
                      {!member.active && (
                        <span className="ml-2 text-xs text-granite border border-granite/30 rounded px-1">inactive</span>
                      )}
                    </p>
                    <p className="text-sm text-granite">{member.role}{member.department ? ` · ${member.department}` : ""}</p>
                  </div>
                  <form action={updateStaffMember} className="grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="id" value={member.id} />
                    <div>
                      <Label htmlFor={`staff-name-${member.id}`}>Full name</Label>
                      <Input id={`staff-name-${member.id}`} name="name" defaultValue={member.name} />
                    </div>
                    <div>
                      <Label htmlFor={`staff-role-${member.id}`}>Role</Label>
                      <Input id={`staff-role-${member.id}`} name="role" defaultValue={member.role} />
                    </div>
                    <div>
                      <Label htmlFor={`staff-dept-${member.id}`}>Department</Label>
                      <Input id={`staff-dept-${member.id}`} name="department" defaultValue={member.department ?? ""} />
                    </div>
                    <div>
                      <Label htmlFor={`staff-email-${member.id}`}>Email</Label>
                      <Input id={`staff-email-${member.id}`} name="email" type="email" defaultValue={member.email ?? ""} />
                    </div>
                    <div>
                      <Label htmlFor={`staff-phone-${member.id}`}>Phone</Label>
                      <Input id={`staff-phone-${member.id}`} name="phone" defaultValue={member.phone ?? ""} />
                    </div>
                    <div className="md:col-span-2">
                      <ImageUploadInput
                        id={`staff-image-${member.id}`}
                        name="imageUrl"
                        label="Staff Photo"
                        defaultValue={member.imageUrl}
                        placeholder="Upload photo from your computer or enter image URL"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor={`staff-bio-${member.id}`}>Bio</Label>
                      <Textarea id={`staff-bio-${member.id}`} name="bio" defaultValue={member.bio ?? ""} />
                    </div>
                    <div className="flex items-center gap-3 self-end">
                      <input
                        id={`staff-active-${member.id}`}
                        name="active"
                        type="checkbox"
                        defaultChecked={member.active ?? true}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`staff-active-${member.id}`} className="mb-0">Visible on website</Label>
                    </div>
                    <div className="flex items-center justify-end gap-2 md:col-span-2">
                      <Button type="submit" size="sm" variant="dark">Update</Button>
                    </div>
                  </form>
                  <form action={permanentlyDeleteStaffMember} className="mt-2 flex justify-end">
                    <input type="hidden" name="id" value={member.id} />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      🗑 Delete permanently
                    </Button>
                  </form>
                </li>
              ))}
              {teamMembers.length === 0 && (
                <p className="text-sm text-granite">No team members yet.</p>
              )}
            </ul>
          </div>
        </section>

        {/* ── Equipment Management ── */}
        <section className="rounded-3xl border border-granite/20 bg-white p-6 shadow-sm space-y-6">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">🏗️ Equipment Management</h2>

          <div>
            <h3 className="font-semibold text-lg mb-4">Add New Machine</h3>
            <form action={addEquipment} className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="equipmentName">Machine name *</Label>
                <Input id="equipmentName" name="equipmentName" required placeholder="Jaw crusher" />
              </div>
              <div>
                <Label htmlFor="equipmentJob">Role / Job *</Label>
                <Input id="equipmentJob" name="equipmentJob" required placeholder="Breaks big stone into smaller sizes" />
              </div>
              <div className="md:col-span-2">
                <ImageUploadInput
                  id="equipmentImageUrl"
                  name="equipmentImageUrl"
                  label="Machine Photo"
                  placeholder="Upload machine photo from your computer or enter image URL"
                />
              </div>
              <div className="flex items-center gap-3 self-end">
                <input id="equipmentActive" name="equipmentActive" type="checkbox" defaultChecked className="h-4 w-4" />
                <Label htmlFor="equipmentActive" className="mb-0">Show this machine</Label>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" variant="dark">Save machine</Button>
              </div>
            </form>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Current Machines</h3>
            <ul className="space-y-4">
              {equipment.map((machine) => (
                <li key={machine.id} className="rounded-2xl border border-granite/20 bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium">
                      {machine.name}
                      {!machine.active && (
                        <span className="ml-2 text-xs text-granite border border-granite/30 rounded px-1">inactive</span>
                      )}
                    </p>
                    <p className="text-sm text-granite">{machine.job}</p>
                  </div>
                  <form action={updateEquipment} className="grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="id" value={machine.id} />
                    <div>
                      <Label htmlFor={`machine-name-${machine.id}`}>Machine name</Label>
                      <Input id={`machine-name-${machine.id}`} name="name" defaultValue={machine.name} />
                    </div>
                    <div>
                      <Label htmlFor={`machine-job-${machine.id}`}>Machine role</Label>
                      <Input id={`machine-job-${machine.id}`} name="job" defaultValue={machine.job} />
                    </div>
                    <div className="md:col-span-2">
                      <ImageUploadInput
                        id={`machine-image-${machine.id}`}
                        name="imageUrl"
                        label="Machine Photo"
                        defaultValue={machine.imageUrl}
                        placeholder="Upload machine photo from your computer or enter image URL"
                      />
                    </div>
                    <div className="flex items-center gap-3 self-end">
                      <input
                        id={`machine-active-${machine.id}`}
                        name="active"
                        type="checkbox"
                        defaultChecked={machine.active ?? true}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`machine-active-${machine.id}`} className="mb-0">Visible on website</Label>
                    </div>
                    <div className="flex items-center justify-end gap-2 md:col-span-2">
                      <Button type="submit" size="sm" variant="dark">Update</Button>
                    </div>
                  </form>
                  <form action={permanentlyDeleteEquipment} className="mt-2 flex justify-end">
                    <input type="hidden" name="id" value={machine.id} />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      🗑 Delete permanently
                    </Button>
                  </form>
                </li>
              ))}
              {equipment.length === 0 && (
                <p className="text-sm text-granite">No machines yet.</p>
              )}
            </ul>
          </div>
        </section>

        {/* ── Product Management ── */}
        <section className="rounded-3xl border border-granite/20 bg-white p-6 shadow-sm space-y-6">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">📦 Product Management</h2>

          <div>
            <h3 className="font-semibold text-lg mb-4">Add New Product</h3>
            <form action={createProduct} className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="prod-add-name">Name *</Label>
                <Input id="prod-add-name" name="name" required />
              </div>
              <div>
                <Label htmlFor="prod-add-slug">Slug</Label>
                <Input id="prod-add-slug" name="slug" placeholder="auto-generated" />
              </div>
              <div>
                <Label htmlFor="prod-add-category">Category</Label>
                <select
                  id="prod-add-category"
                  name="category"
                  defaultValue="BUILDING_STONE"
                  className="h-11 w-full border border-granite/30 bg-white px-3 text-sm text-basalt"
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="prod-add-unit">Unit</Label>
                <Input id="prod-add-unit" name="unit" defaultValue="tonne" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="prod-add-summary">Summary</Label>
                <Textarea id="prod-add-summary" name="summary" placeholder="Short description shown on the storefront" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="prod-add-uses">Uses *</Label>
                <Textarea id="prod-add-uses" name="uses" required placeholder="How the product is used" />
              </div>
              <div>
                <Label htmlFor="prod-add-sizeSpec">Size / Spec</Label>
                <Input id="prod-add-sizeSpec" name="sizeSpec" placeholder="Optional" />
              </div>
              <div>
                <Label htmlFor="prod-add-priceRwf">Price (RWF)</Label>
                <Input id="prod-add-priceRwf" name="priceRwf" type="number" min={0} placeholder="Optional" />
              </div>
              <div className="md:col-span-2">
                <ImageUploadInput
                  id="prod-add-imageUrl"
                  name="imageUrl"
                  label="Product Photo"
                  placeholder="Upload product photo from your computer or enter image URL"
                />
              </div>
              <div className="flex items-center gap-3 self-end">
                <input id="prod-add-active" name="active" type="checkbox" defaultChecked className="h-4 w-4" />
                <Label htmlFor="prod-add-active" className="mb-0">Active product</Label>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" variant="dark">Save product</Button>
              </div>
            </form>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Current Products</h3>
            <ul className="space-y-4">
              {products.map((p) => (
                <li key={p.id} className="rounded-2xl border border-granite/20 bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium">
                      {p.name}
                      {!p.active && (
                        <span className="ml-2 text-xs text-granite border border-granite/30 rounded px-1">inactive</span>
                      )}
                    </p>
                    <p className="text-sm text-granite">{p.category} · {p.unit}</p>
                  </div>
                  <form action={updateProduct} className="grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="id" value={p.id} />
                    <div>
                      <Label htmlFor={`product-name-${p.id}`}>Product name</Label>
                      <Input id={`product-name-${p.id}`} name="name" defaultValue={p.name} />
                    </div>
                    <div>
                      <Label htmlFor={`product-category-${p.id}`}>Category</Label>
                      <select
                        id={`product-category-${p.id}`}
                        name="category"
                        defaultValue={p.category}
                        className="h-11 w-full border border-granite/30 bg-white px-3 text-sm text-basalt"
                      >
                        {categoryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor={`product-unit-${p.id}`}>Unit</Label>
                      <Input id={`product-unit-${p.id}`} name="unit" defaultValue={p.unit} />
                    </div>
                    <div>
                      <Label htmlFor={`product-price-${p.id}`}>Price (RWF)</Label>
                      <Input
                        id={`product-price-${p.id}`}
                        name="priceRwf"
                        type="number"
                        min={0}
                        defaultValue={p.priceRwf ?? ""}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor={`product-summary-${p.id}`}>Summary</Label>
                      <Textarea id={`product-summary-${p.id}`} name="summary" defaultValue={p.summary} />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor={`product-uses-${p.id}`}>Uses</Label>
                      <Textarea id={`product-uses-${p.id}`} name="uses" defaultValue={p.uses} />
                    </div>
                    <div>
                      <Label htmlFor={`product-size-${p.id}`}>Size / Spec</Label>
                      <Input id={`product-size-${p.id}`} name="sizeSpec" defaultValue={p.sizeSpec ?? ""} />
                    </div>
                    <div className="md:col-span-2">
                      <ImageUploadInput
                        id={`product-image-${p.id}`}
                        name="imageUrl"
                        label="Product Photo"
                        defaultValue={p.imageUrl}
                        placeholder="Upload product photo from your computer or enter image URL"
                      />
                    </div>
                    <div className="flex items-center gap-3 self-end">
                      <input
                        id={`product-active-${p.id}`}
                        name="active"
                        type="checkbox"
                        defaultChecked={p.active}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`product-active-${p.id}`} className="mb-0">Visible</Label>
                    </div>
                    <div className="flex items-center justify-end gap-2 md:col-span-2">
                      <Button size="sm" variant="dark" type="submit">Save Changes</Button>
                    </div>
                  </form>
                  <form action={permanentlyDeleteProduct} className="mt-2 flex justify-end">
                    <input type="hidden" name="id" value={p.id} />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      🗑 Delete permanently
                    </Button>
                  </form>
                </li>
              ))}
              {products.length === 0 && (
                <p className="text-sm text-granite">No products yet.</p>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Quick Price Updates</h3>
            <p className="mb-4 text-sm text-granite">Leave empty to show "Price on request". Only priced products can be ordered online.</p>
            <ul className="space-y-3">
              {products.map((p) => (
                <li key={`${p.id}-quick`} className="flex flex-wrap items-center gap-3">
                  <form action={updatePrice} className="flex flex-wrap items-center gap-3">
                    <input type="hidden" name="id" value={p.id} />
                    <span>
                      {p.name} <span className="text-sm text-granite">per {p.unit}</span>
                    </span>
                    <Input
                      name="price"
                      type="number"
                      min={0}
                      defaultValue={p.priceRwf ?? ""}
                      aria-label={`Price of ${p.name} in RWF`}
                      className="h-10 w-36"
                    />
                    <Button size="sm" variant="dark" type="submit">Save price</Button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Quote Requests ── */}
        <section className="rounded-3xl border border-granite/20 bg-white p-6 shadow-sm space-y-6">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">📋 Quote Requests</h2>
          <ul className="divide-y divide-granite/20 border-y border-granite/20">
            {quotes.map((q) => (
              <li key={q.id} className="grid gap-3 py-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-medium">
                    {q.name}
                    {q.company ? `, ${q.company}` : ""}
                  </p>
                  <p className="text-sm text-granite">
                    {q.phone} · {q.email} · {q.location}
                  </p>
                  <p className="mt-1 text-sm">
                    {q.items.map((i) => `${i.quantity} × ${i.product.name}`).join(", ")}
                  </p>
                  {q.message && <p className="mt-1 text-sm text-granite">{q.message}</p>}
                  {q.attachments.length > 0 && (
                    <p className="mt-1 text-sm">
                      {q.attachments.map((a) => (
                        <a key={a.id} className="mr-3 underline" href={a.url}>
                          {a.filename}
                        </a>
                      ))}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-granite">
                    {q.createdAt.toLocaleDateString("en-GB")} · Status:{" "}
                    <span className="font-medium">{q.status}</span>
                  </p>
                </div>
                <form action={setQuoteStatus} className="flex items-start gap-2">
                  <input type="hidden" name="id" value={q.id} />
                  <select
                    name="status"
                    defaultValue={q.status}
                    aria-label="Quote status"
                    className="h-10 border border-granite/30 bg-white px-2 text-sm"
                  >
                    {["NEW", "CONTACTED", "QUOTED", "WON", "LOST"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <Button size="sm" variant="dark" type="submit">Save</Button>
                </form>
              </li>
            ))}
            {quotes.length === 0 && (
              <li className="py-4 text-sm text-granite">No quote requests yet.</li>
            )}
          </ul>
        </section>

        {/* ── Orders ── */}
        <section className="rounded-3xl border border-granite/20 bg-white p-6 shadow-sm space-y-6">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">🚚 Orders</h2>
          <ul className="divide-y divide-granite/20 border-y border-granite/20">
            {orders.map((o) => (
              <li key={o.id} className="grid gap-3 py-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-medium">{o.reference}</p>
                  <p className="text-sm text-granite">
                    {o.user.name} · {o.user.email}
                  </p>
                  <p className="mt-1 text-sm">
                    {o.items.map((i) => `${i.quantity} × ${i.product.name}`).join(", ")}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{formatRwf(o.totalRwf)}</p>
                  <p className="mt-1 text-xs text-granite">
                    {o.createdAt.toLocaleDateString("en-GB")} · Status:{" "}
                    <span className="font-medium">{o.status.replaceAll("_", " ").toLowerCase()}</span>
                  </p>
                </div>
                <form action={setOrderStatus} className="flex items-start gap-2">
                  <input type="hidden" name="id" value={o.id} />
                  <select
                    name="status"
                    defaultValue={o.status}
                    aria-label="Order status"
                    className="h-10 border border-granite/30 bg-white px-2 text-sm"
                  >
                    {(
                      [
                        "PENDING_PAYMENT",
                        "PAID",
                        "PROCESSING",
                        "DELIVERED",
                        "CANCELLED",
                      ] as const
                    ).map((s) => (
                      <option key={s} value={s}>
                        {s.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" variant="dark" type="submit">Save</Button>
                </form>
              </li>
            ))}
            {orders.length === 0 && (
              <li className="py-4 text-sm text-granite">No orders yet.</li>
            )}
          </ul>
        </section>

        {/* ── Registered Users ── */}
        <section className="rounded-3xl border border-granite/20 bg-white p-6 shadow-sm space-y-6">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">👤 Registered Users</h2>
          <ul className="divide-y divide-granite/20 border-y border-granite/20">
            {users.map((u) => (
              <li key={u.id} className="flex flex-wrap justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-granite">{u.email}</p>
                </div>
                <div className="text-right text-sm text-granite">
                  <p>{u.role}</p>
                  <p>{u.createdAt.toLocaleDateString("en-GB")}</p>
                </div>
              </li>
            ))}
            {users.length === 0 && (
              <li className="py-4 text-sm text-granite">No registered users yet.</li>
            )}
          </ul>
        </section>

      </div>
    </>
  );
}
