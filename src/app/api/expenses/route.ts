import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const where: Record<string, number> = {};
  if (month) where.month = parseInt(month);
  if (year) where.year = parseInt(year);

  const expenses = await prisma.expense.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(expenses);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { label, amount, month, year, categoryId, note, date } = body;

  if (!label?.trim()) return NextResponse.json({ error: "Label is required" }, { status: 400 });
  if (!amount || isNaN(parseFloat(amount))) return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
  if (!month || !year) return NextResponse.json({ error: "Month and year are required" }, { status: 400 });
  if (!categoryId) return NextResponse.json({ error: "Category is required" }, { status: 400 });

  const expenseDate = date ? new Date(date) : new Date(parseInt(year), parseInt(month) - 1, 1);

  const expense = await prisma.expense.create({
    data: {
      label: label.trim(),
      amount: parseFloat(amount),
      month: parseInt(month),
      year: parseInt(year),
      date: expenseDate,
      categoryId,
      note: note?.trim() || null,
    },
    include: { category: true },
  });
  return NextResponse.json(expense, { status: 201 });
}
