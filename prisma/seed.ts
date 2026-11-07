import "dotenv/config";
import bcrypt from "bcryptjs";
import mariadb from "mariadb";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required. Add it to your .env file or deployment environment before running the seed script.");
}

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

const db = new PrismaClient({ adapter: new PrismaMariaDb(pool) });

const productImages = [
  "/hero/stone-1.webp",
  "/hero/stone-2.jpg",
  "/hero/stone-3.jpg",
  "/hero/stone-4.jpg",
  "/hero/stone-5.jpg",
];

const products = [
  ["undressed-building-stone", "Undressed building stone", "BUILDING_STONE", "Walls and general building", "Mixed sizes"],
  ["dressed-building-stone", "Dressed building stone", "BUILDING_STONE", "Walls and facades", "Hand or machine dressed"],
  ["decorative-stone", "Decorative stone", "BUILDING_STONE", "Decorating houses and buildings", null],
  ["machine-cut-standard", "Machine-cut standard stone", "MACHINE_CUT", "Standard building sizes", "Standard sizes"],
  ["facing-stone", "Facing stone", "MACHINE_CUT", "Decorative house facing", null],
  ["stone-dust", "Stone dust", "AGGREGATE", "Concrete, paving and building works", "0–6 mm"],
  ["fine-aggregate", "Fine aggregate", "AGGREGATE", "Concrete and general works", null],
  ["gravel-5-10", "Gravel 5–10 mm", "AGGREGATE", "Concrete and specialist works", "5–10 mm"],
  ["gravel-10-20", "Gravel 10–20 mm", "AGGREGATE", "Concrete and construction", "10–20 mm"],
  ["gravel-20-40", "Gravel 20–40 mm", "AGGREGATE", "Roads and foundation works", "20–40 mm"],
  ["gabion-stones", "Gabion stones", "AGGREGATE", "Slope protection and retaining walls", null],
  ["road-base", "Road base material", "AGGREGATE", "Road construction and maintenance", null],
  ["manufactured-sand", "Manufactured sand (M-sand)", "MANUFACTURED_SAND", "Concrete, masonry, paving blocks, finishing", null],
] as const;

async function main() {
  for (const [index, [slug, name, category, uses, sizeSpec]] of products.entries()) {
    const imageUrl = productImages[index % productImages.length];
    await db.product.upsert({
      where: { slug },
      update: { imageUrl },
      create: { slug, name, category, summary: uses, uses, sizeSpec, imageUrl },
    });
  }
  const email = (process.env.ADMIN_EMAIL ?? "admin@bugeserastoneworks.rw").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8) throw new Error("Set ADMIN_PASSWORD (8+ characters) before seeding.");
  await db.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Administrator", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`Seeded ${products.length} products and admin ${email}`);
}

main().finally(async () => {
  await db.$disconnect();
  await pool.end();
});
