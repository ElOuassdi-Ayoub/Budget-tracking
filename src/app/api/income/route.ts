import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const where: Record<string, number> = {};
  if (month) where.month = parseInt(month);
  if (year) where.year = parseInt(year);

  const income = await prisma.income.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(income);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { label, amount, month, year, note } = body;

  if (!label?.trim()) return NextResponse.json({ error: "Label is required" }, { status: 400 });
  if (!amount || isNaN(parseFloat(amount))) return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
  if (!month || !year) return NextResponse.json({ error: "Month and year are required" }, { status: 400 });

  const entry = await prisma.income.create({
    data: {
      label: label.trim(),
      amount: parseFloat(amount),
      month: parseInt(month),
      year: parseInt(year),
      note: note?.trim() || null,
    },
  });
  return NextResponse.json(entry, { status: 201 });
}
