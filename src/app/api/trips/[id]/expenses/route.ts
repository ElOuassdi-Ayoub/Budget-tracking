import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: tripId } = await params;
  const { label, amount, date, note } = await request.json();

  if (!label?.trim() || !amount || !date) {
    return NextResponse.json({ error: "label, amount, and date are required" }, { status: 400 });
  }

  const expense = await prisma.tripExpense.create({
    data: {
      tripId,
      label: label.trim(),
      amount: parseFloat(amount),
      date: new Date(date),
      note: note ?? null,
    },
  });

  return NextResponse.json({
    id: expense.id,
    tripId: expense.tripId,
    label: expense.label,
    amount: expense.amount,
    date: expense.date.toISOString(),
    note: expense.note,
    createdAt: expense.createdAt.toISOString(),
  }, { status: 201 });
}
