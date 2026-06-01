import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const trips = await prisma.trip.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { expenses: true } }, expenses: { select: { amount: true, type: true } } },
  });

  const result = trips.map((t) => {
    const totalSpent = t.expenses.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
    const totalReceived = t.expenses.filter((e) => e.type === "received").reduce((s, e) => s + e.amount, 0);
    return {
      id: t.id,
      name: t.name,
      coverImage: t.coverImage,
      totalSpent,
      totalReceived,
      netCost: totalSpent - totalReceived,
      expenseCount: t._count.expenses,
      createdAt: t.createdAt.toISOString(),
    };
  });

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
    totalReceived: 0,
    netCost: 0,
    expenseCount: 0,
    createdAt: trip.createdAt.toISOString(),
  }, { status: 201 });
}
