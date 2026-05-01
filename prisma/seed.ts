import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

const presets = [
  { name: "Food & Groceries", color: "#A8D5BA", icon: "🛒" },
  { name: "Rent & Housing", color: "#B8C9E1", icon: "🏠" },
  { name: "Transport", color: "#FAD7A0", icon: "🚗" },
  { name: "Health & Fitness", color: "#F4B8C1", icon: "💊" },
  { name: "Entertainment", color: "#D7BDE2", icon: "🎬" },
  { name: "Utilities", color: "#AED6F1", icon: "⚡" },
  { name: "Dining Out", color: "#FDEBD0", icon: "🍽️" },
  { name: "Shopping", color: "#F9E4B7", icon: "🛍️" },
  { name: "Education", color: "#A9CCE3", icon: "📚" },
  { name: "Travel", color: "#A2D9CE", icon: "✈️" },
  { name: "Personal Care", color: "#FADBD8", icon: "🧴" },
  { name: "Subscriptions", color: "#D5DBDB", icon: "📱" },
  { name: "Delivery", color: "#FDEBD0", icon: "🛵" },
  { name: "Gifts", color: "#D7BDE2", icon: "🎁" },
  { name: "Other", color: "#E8DAEF", icon: "📌" },
];

async function main() {
  for (const preset of presets) {
    await prisma.category.upsert({
      where: { name: preset.name },
      update: {},
      create: { ...preset, isPreset: true },
    });
  }
  console.log(`Seeded ${presets.length} preset categories.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
