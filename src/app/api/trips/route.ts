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
      startDate: t.startDate?.toISOString() ?? null,
      endDate: t.endDate?.toISOString() ?? null,
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
  const { name, coverImage, startDate, endDate } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const trip = await prisma.trip.create({
    data: {
      name: name.trim(),
      coverImage: coverImage ?? null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return NextResponse.json({
    id: trip.id,
    name: trip.name,
    coverImage: trip.coverImage,
    startDate: trip.startDate?.toISOString() ?? null,
    endDate: trip.endDate?.toISOString() ?? null,
    totalSpent: 0,
    totalReceived: 0,
    netCost: 0,
    expenseCount: 0,
    createdAt: trip.createdAt.toISOString(),
  }, { status: 201 });
}
