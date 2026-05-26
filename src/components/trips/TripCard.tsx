"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { TripDTO } from "@/types";

interface Props {
  trip: TripDTO;
}

export function TripCard({ trip }: Props) {
  return (
    <Link href={`/trips/${trip.id}`} className="group block rounded-2xl overflow-hidden border border-slate-100 bg-white hover:shadow-md transition-shadow">
      <div className="relative h-40 bg-slate-100">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl select-none">✈️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-white/90 shrink-0" />
            <span className="text-white font-semibold text-sm drop-shadow truncate">{trip.name}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-slate-400">{trip.expenseCount} expense{trip.expenseCount !== 1 ? "s" : ""}</span>
        <span className="text-sm font-semibold text-slate-800">{formatCurrency(trip.totalSpent)}</span>
      </div>
    </Link>
  );
}

export function AddTripCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border-2 border-dashed border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors h-[calc(160px+52px)] flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-500 w-full"
    >
      <span className="text-3xl">+</span>
      <span className="text-sm font-medium">Add a trip</span>
    </button>
  );
}
