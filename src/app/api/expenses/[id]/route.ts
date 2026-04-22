import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.label !== undefined) updates.label = body.label.trim();
  if (body.amount !== undefined) updates.amount = parseFloat(body.amount);
  if (body.categoryId !== undefined) updates.categoryId = body.categoryId;
  if (body.note !== undefined) updates.note = body.note?.trim() || null;
  if (body.date !== undefined) updates.date = new Date(body.date);

  try {
    const expense = await prisma.expense.update({
      where: { id },
      data: updates,
      include: { category: true },
    });
    return NextResponse.json(expense);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.expense.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
