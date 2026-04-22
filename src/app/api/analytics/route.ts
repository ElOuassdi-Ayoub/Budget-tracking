import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subMonths, startOfMonth } from "date-fns";
import type { AnalyticsPayload } from "@/types";

function getMonthRange(range: string): { startYear: number; startMonth: number } {
  if (range === "all") return { startYear: 2000, startMonth: 1 };
  const months = range === "3m" ? 3 : range === "6m" ? 6 : 12;
  const d = startOfMonth(subMonths(new Date(), months - 1));
  return { startYear: d.getFullYear(), startMonth: d.getMonth() + 1 };
}

function monthKey(year: number, month: number): string {
  const d = new Date(year, month - 1, 1);
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

function buildMonthList(startYear: number, startMonth: number): { year: number; month: number }[] {
  const now = new Date();
  const endYear = now.getFullYear();
  const endMonth = now.getMonth() + 1;
  const result: { year: number; month: number }[] = [];
  let y = startYear, m = startMonth;
  while (y < endYear || (y === endYear && m <= endMonth)) {
    result.push({ year: y, month: m });
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return result;
}

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get("range") ?? "6m";
  const { startYear, startMonth } = getMonthRange(range);

  const [incomes, expenses, categories] = await Promise.all([
    prisma.income.findMany({
      where: {
        OR: [
          { year: { gt: startYear } },
          { year: startYear, month: { gte: startMonth } },
        ],
      },
    }),
    prisma.expense.findMany({
      where: {
        OR: [
          { year: { gt: startYear } },
          { year: startYear, month: { gte: startMonth } },
        ],
      },
      include: { category: true },
    }),
    prisma.category.findMany(),
  ]);

  const months = buildMonthList(startYear, startMonth);

  // netPerMonth
  const netPerMonth = months.map(({ year, month }) => {
    const income = incomes
      .filter((i) => i.year === year && i.month === month)
      .reduce((s, i) => s + i.amount, 0);
    const exp = expenses
      .filter((e) => e.year === year && e.month === month)
      .reduce((s, e) => s + e.amount, 0);
    return { month: monthKey(year, month), income, expenses: exp, net: income - exp };
  });

  // spendingByCategory — one object per month with category names as keys
  const categoryNames = [...new Set(expenses.map((e) => e.category.name))];
  const spendingByCategory = months.map(({ year, month }) => {
    const row: Record<string, number | string> = { month: monthKey(year, month) };
    for (const cat of categoryNames) {
      row[cat] = expenses
        .filter((e) => e.year === year && e.month === month && e.category.name === cat)
        .reduce((s, e) => s + e.amount, 0);
    }
    return row;
  });

  // incomeTrends — one object per month with income labels as keys
  const incomeLabels = [...new Set(incomes.map((i) => i.label))];
  const incomeTrends = months.map(({ year, month }) => {
    const row: Record<string, number | string> = { month: monthKey(year, month) };
    for (const label of incomeLabels) {
      row[label] = incomes
        .filter((i) => i.year === year && i.month === month && i.label === label)
        .reduce((s, i) => s + i.amount, 0);
    }
    return row;
  });

  // topCategories — total per category, sorted descending
  const catTotals = new Map<string, { total: number; color: string; icon: string | null }>();
  for (const e of expenses) {
    const prev = catTotals.get(e.category.name) ?? { total: 0, color: e.category.color, icon: e.category.icon };
    catTotals.set(e.category.name, { ...prev, total: prev.total + e.amount });
  }
  const topCategories = [...catTotals.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.total - a.total);

  const payload: AnalyticsPayload = { netPerMonth, spendingByCategory, incomeTrends, topCategories };
  return NextResponse.json(payload);
}
