import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: [{ isPreset: "desc" }, { name: "asc" }],
    include: { _count: { select: { expenses: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, color, icon } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!color) {
    return NextResponse.json({ error: "Color is required" }, { status: 400 });
  }

  try {
    const category = await prisma.category.create({
      data: { name: name.trim(), color, icon: icon || null, isPreset: false },
      include: { _count: { select: { expenses: true } } },
    });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Category name already exists" }, { status: 409 });
  }
}
