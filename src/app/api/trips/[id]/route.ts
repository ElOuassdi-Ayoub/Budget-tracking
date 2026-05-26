import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { expenses: { orderBy: { date: "desc" } } },
  });
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: trip.id,
    name: trip.name,
    coverImage: trip.coverImage,
    totalSpent: trip.expenses.reduce((s, e) => s + e.amount, 0),
    expenseCount: trip.expenses.length,
    createdAt: trip.createdAt.toISOString(),
    expenses: trip.expenses.map((e) => ({
      id: e.id,
      tripId: e.tripId,
      label: e.label,
      amount: e.amount,
      date: e.date.toISOString(),
      note: e.note,
      createdAt: e.createdAt.toISOString(),
    })),
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, coverImage } = await request.json();

  const trip = await prisma.trip.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(coverImage !== undefined && { coverImage }),
    },
  });

  return NextResponse.json({ id: trip.id, name: trip.name, coverImage: trip.coverImage });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.trip.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
