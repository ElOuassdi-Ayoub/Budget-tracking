"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddTripExpenseDialog } from "@/components/trips/AddTripExpenseDialog";
import { formatCurrency } from "@/lib/utils";
import type { TripDTO, TripExpenseDTO } from "@/types";

interface TripDetail extends TripDTO {
  expenses: TripExpenseDTO[];
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<TripExpenseDTO | null>(null);

  useEffect(() => {
    fetch(`/api/trips/${id}`)
      .then((r) => r.json())
      .then((d) => { setTrip(d); setLoading(false); });
  }, [id]);

  function handleExpenseSaved(expense: TripExpenseDTO) {
    setTrip((prev) => {
      if (!prev) return prev;
      if (editingExpense) {
        const diff = expense.amount - editingExpense.amount;
        return {
          ...prev,
          totalSpent: prev.totalSpent + diff,
          expenses: prev.expenses.map((e) => (e.id === expense.id ? expense : e)),
        };
      }
      return { ...prev, expenses: [expense, ...prev.expenses], totalSpent: prev.totalSpent + expense.amount, expenseCount: prev.expenseCount + 1 };
    });
    setEditingExpense(null);
  }

  async function handleDeleteExpense(expenseId: string, amount: number) {
    await fetch(`/api/trips/${id}/expenses/${expenseId}`, { method: "DELETE" });
    setTrip((prev) =>
      prev
        ? { ...prev, expenses: prev.expenses.filter((e) => e.id !== expenseId), totalSpent: prev.totalSpent - amount, expenseCount: prev.expenseCount - 1 }
        : prev
    );
    toast.success("Expense removed");
  }

  async function handleDeleteTrip() {
    if (!confirm("Delete this trip and all its expenses?")) return;
    await fetch(`/api/trips/${id}`, { method: "DELETE" });
    toast.success("Trip deleted");
    router.push("/trips");
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto w-full">
        <div className="h-48 rounded-2xl bg-slate-100 animate-pulse mb-6" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!trip) return <div className="p-6 text-slate-500">Trip not found.</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.push("/trips")} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-semibold text-slate-800 flex-1 truncate">{trip.name}</h1>
        <button onClick={handleDeleteTrip} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Cover + summary */}
      <div className="relative rounded-2xl overflow-hidden h-48 bg-slate-100 mb-6">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">✈️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <p className="text-white/70 text-xs mb-0.5">{trip.expenseCount} expense{trip.expenseCount !== 1 ? "s" : ""}</p>
            <p className="text-white text-2xl font-bold">{formatCurrency(trip.totalSpent)}</p>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)} className="bg-white text-slate-800 hover:bg-slate-100 gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add expense
          </Button>
        </div>
      </div>

      {/* Expense list */}
      {trip.expenses.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          No expenses yet. Add your first one!
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {trip.expenses.map((expense) => (
            <div key={expense.id} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{expense.label}</p>
                <p className="text-xs text-slate-400">{new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}{expense.note ? ` · ${expense.note}` : ""}</p>
              </div>
              <span className="text-sm font-semibold text-slate-700 shrink-0">{formatCurrency(expense.amount)}</span>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                <button
                  onClick={() => { setEditingExpense(expense); setAddOpen(true); }}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-slate-500"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteExpense(expense.id, expense.amount)}
                  className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTripExpenseDialog
        open={addOpen}
        onOpenChange={(o) => { setAddOpen(o); if (!o) setEditingExpense(null); }}
        tripId={id}
        onSaved={handleExpenseSaved}
        editing={editingExpense}
      />
    </div>
  );
}
