import bcrypt from "bcryptjs";
import mariadb from "mariadb";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getConnectionString() {
  const value = process.env.DATABASE_URL;
  if (!value) {
    throw new Error("DATABASE_URL is required. Add it to your .env file or deployment environment before starting the app.");
  }

  try {
    const parsed = new URL(value);
    if (!parsed.hostname || !parsed.pathname.replace(/^\//, "")) {
      throw new Error("Invalid DATABASE_URL");
    }
    return value;
  } catch {
    throw new Error("DATABASE_URL is not configured correctly. Set a valid MySQL/TiDB connection string before starting the app.");
  }
}

function createClient() {
  const connectionString = getConnectionString();
  const url = new URL(connectionString);
  const pool = mariadb.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: { rejectUnauthorized: true },
    connectionLimit: 10,
    connectTimeout: 20000,
  });

  return new PrismaClient({ adapter: new PrismaMariaDb(pool) });
}

export const db = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

type TeamMemberRecord = {
  id: string;
  name: string;
  role: string;
  department?: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  imageUrl?: string | null;
  active?: boolean;
  order?: number;
  createdAt?: Date;
};

type EquipmentRecord = {
  id: string;
  name: string;
  job: string;
  imageUrl?: string | null;
  active?: boolean;
  order?: number;
  createdAt?: Date;
};

type TeamMemberModel = {
  findMany: (args: {
    where?: { active?: boolean; name?: string };
    orderBy?: Array<{ order?: "asc" | "desc" } | { createdAt?: "asc" | "desc" }>;
  }) => Promise<TeamMemberRecord[]>;
  count: () => Promise<number>;
  create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
};

type EquipmentModel = {
  findMany: (args: {
    where?: { active?: boolean };
    orderBy?: Array<{ order?: "asc" | "desc" } | { createdAt?: "asc" | "desc" }>;
  }) => Promise<EquipmentRecord[]>;
  count: () => Promise<number>;
  create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
};

export function hasTeamMemberModel() {
  const teamMemberModel = (db as PrismaClient & { teamMember?: TeamMemberModel }).teamMember;
  return !!db && !!teamMemberModel && typeof teamMemberModel.findMany === "function";
}

export function hasEquipmentModel() {
  const equipmentModel = (db as PrismaClient & { equipment?: EquipmentModel }).equipment;
  return !!db && !!equipmentModel && typeof equipmentModel.findMany === "function";
}

export async function getActiveTeamMembers(): Promise<TeamMemberRecord[]> {
  const teamMemberModel = (db as PrismaClient & { teamMember?: TeamMemberModel }).teamMember;
  if (!teamMemberModel || typeof teamMemberModel.findMany !== "function") {
    return [];
  }

  return teamMemberModel.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
}

export async function getActiveEquipment(): Promise<EquipmentRecord[]> {
  const equipmentModel = (db as PrismaClient & { equipment?: EquipmentModel }).equipment;
  if (!equipmentModel || typeof equipmentModel.findMany !== "function") {
    return [];
  }

  return equipmentModel.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
}

const defaultStaffMembers = [
  { name: "NTWARI ANTOINE JOYEUX", role: "Founder", department: "Leadership", email: "new.antomix@gmail.com", phone: "+250 796 893 372", imageUrl: "/staff/intwali-founder.jpg", bio: "Founder of the business and strategic leader.", active: true },
  { name: "PANZATA EMELYNE", role: "Chief Executive Officer (CEO)", department: "Leadership", email: "emelynepanzata@gmail.com", phone: null, imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80", bio: "Leads corporate direction and business growth.", active: true },
  { name: "To be appointed", role: "Operations Manager", department: "Operations", email: null, phone: null, imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80", bio: "Oversees daily business operations.", active: true },
  { name: "SEBERA PATRICK", role: "IT Officer", department: "Information Technology", email: "patrick@bugeserastoneworks.rw", phone: null, imageUrl: "/staff/sebera-patrick.png", bio: "Technology, systems and technical support.", active: true },
  { name: "To be appointed", role: "Finance & Administration", department: "Finance & Administration", email: null, phone: null, imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80", bio: "Supports accounting, finance and administration functions.", active: true },
] as const;

const defaultEquipment = [
  { name: "Excavator", job: "Digs and loads stone", imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80", active: true },
  { name: "Wheel loader", job: "Loads stone into trucks", imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80", active: true },
  { name: "Jaw crusher", job: "Breaks large stone", imageUrl: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=80", active: true },
  { name: "Vibrating screen", job: "Separates stone by size", imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80", active: true },
  { name: "Stone cutting machine", job: "Cuts and dresses building stone", imageUrl: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80", active: true },
  { name: "Sand washing machine", job: "Cleans manufactured sand", imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80", active: true },
] as const;

export async function ensureDefaultStaffMembers() {
  if (!hasTeamMemberModel()) return;
  const teamMemberModel = (db as PrismaClient & { teamMember?: TeamMemberModel }).teamMember;
  if (!teamMemberModel) return;

  const count = await teamMemberModel.count();
  if (count > 0) {
    const existingMembers = await teamMemberModel.findMany({});
    for (const member of defaultStaffMembers) {
      const match = existingMembers.find((existing) => existing.name.trim().toLowerCase() === member.name.trim().toLowerCase());
      if (!match) continue;

      await teamMemberModel.update({
        where: { id: match.id },
        data: {
          role: member.role,
          department: member.department,
          email: member.email,
          phone: member.phone,
          imageUrl: member.imageUrl,
          bio: member.bio,
          active: member.active,
        },
      });
    }
    return;
  }

  await Promise.all(
    defaultStaffMembers.map((member, index) =>
      teamMemberModel.create({
        data: {
          name: member.name,
          role: member.role,
          department: member.department,
          email: member.email,
          phone: member.phone,
          imageUrl: member.imageUrl,
          bio: member.bio,
          active: member.active,
          order: index,
        },
      })
    )
  );
}

export async function ensureDefaultEquipment() {
  if (!hasEquipmentModel()) return;
  const equipmentModel = (db as PrismaClient & { equipment?: EquipmentModel }).equipment;
  if (!equipmentModel) return;

  const count = await equipmentModel.count();
  if (count > 0) return;

  await Promise.all(
    defaultEquipment.map((machine, index) =>
      equipmentModel.create({
        data: {
          name: machine.name,
          job: machine.job,
          imageUrl: machine.imageUrl,
          active: machine.active,
          order: index,
        },
      })
    )
  );
}

export function getDefaultAdminCredentials() {
  return {
    email: (process.env.ADMIN_EMAIL ?? "admin@bugeserastoneworks.rw").toLowerCase(),
    password: process.env.ADMIN_PASSWORD ?? "change-me-now",
  };
}

export async function ensureAdminUser() {
  const { email, password } = getDefaultAdminCredentials();
  if (!email || !password) return;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "ADMIN") {
      await db.user.update({
        where: { id: existing.id },
        data: { role: "ADMIN" },
      });
    }
    await ensureDefaultStaffMembers();
    await ensureDefaultEquipment();
    return;
  }

  await db.user.create({
    data: {
      name: "Administrator",
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "ADMIN",
    },
  });

  await ensureDefaultStaffMembers();
  await ensureDefaultEquipment();
}
