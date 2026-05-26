"use client";

import { useState, useEffect } from "react";
import { TripCard, AddTripCard } from "@/components/trips/TripCard";
import { AddTripDialog } from "@/components/trips/AddTripDialog";
import type { TripDTO } from "@/types";

export default function TripsPage() {
  const [trips, setTrips] = useState<TripDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch("/api/trips")
      .then((r) => r.json())
      .then((d) => { setTrips(d); setLoading(false); });
  }, []);

  function handleSaved(trip: TripDTO) {
    setTrips((prev) => [trip, ...prev]);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Trips</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track expenses per trip</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-slate-100 animate-pulse h-[212px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
          <AddTripCard onClick={() => setDialogOpen(true)} />
        </div>
      )}

      <AddTripDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={handleSaved} />
    </div>
  );
}
