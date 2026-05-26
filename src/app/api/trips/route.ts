import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const trips = await prisma.trip.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { expenses: true } }, expenses: { select: { amount: true } } },
  });

  const result = trips.map((t) => ({
    id: t.id,
    name: t.name,
    coverImage: t.coverImage,
    totalSpent: t.expenses.reduce((s, e) => s + e.amount, 0),
    expenseCount: t._count.expenses,
    createdAt: t.createdAt.toISOString(),
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const { name, coverImage } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const trip = await prisma.trip.create({ data: { name: name.trim(), coverImage: coverImage ?? null } });

  return NextResponse.json({
    id: trip.id,
    name: trip.name,
    coverImage: trip.coverImage,
    totalSpent: 0,
    expenseCount: 0,
    createdAt: trip.createdAt.toISOString(),
  }, { status: 201 });
}
