import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  const { expenseId } = await params;
  const { label, amount, type, date, note } = await request.json();

  const expense = await prisma.tripExpense.update({
    where: { id: expenseId },
    data: {
      ...(label !== undefined && { label: label.trim() }),
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(type !== undefined && { type: type === "received" ? "received" : "expense" }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(note !== undefined && { note }),
    },
  });

  return NextResponse.json({
    id: expense.id,
    tripId: expense.tripId,
    label: expense.label,
    amount: expense.amount,
    type: expense.type,
    date: expense.date.toISOString(),
    note: expense.note,
    createdAt: expense.createdAt.toISOString(),
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  const { expenseId } = await params;
  await prisma.tripExpense.delete({ where: { id: expenseId } });
  return new NextResponse(null, { status: 204 });
}
