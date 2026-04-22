import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, color, icon } = body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name.trim();
  if (color !== undefined) updates.color = color;
  if (icon !== undefined) updates.icon = icon;

  try {
    const category = await prisma.category.update({
      where: { id },
      data: updates,
      include: { _count: { select: { expenses: true } } },
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Not found or name conflict" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const count = await prisma.expense.count({ where: { categoryId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${count} expense(s) use this category. Reassign them first.` },
      { status: 409 }
    );
  }

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (category.isPreset) {
    return NextResponse.json({ error: "Cannot delete preset categories" }, { status: 403 });
  }

  await prisma.category.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
