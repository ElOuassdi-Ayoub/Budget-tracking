"use client";

import { useState, useEffect, use, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Pencil, TrendingUp, CalendarDays, Zap, Camera } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { AddTripExpenseDialog } from "@/components/trips/AddTripExpenseDialog";
import { formatCurrency } from "@/lib/utils";
import type { TripDTO, TripExpenseDTO } from "@/types";

interface TripDetail extends TripDTO {
  expenses: TripExpenseDTO[];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<TripExpenseDTO | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const coverImage = ev.target?.result as string;
      await fetch(`/api/trips/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImage }),
      });
      setTrip((prev) => prev ? { ...prev, coverImage } : prev);
      setUploadingCover(false);
      toast.success("Cover photo updated");
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    fetch(`/api/trips/${id}`)
      .then((r) => r.json())
      .then((d) => { setTrip(d); setLoading(false); });
  }, [id]);

  const stats = useMemo(() => {
    if (!trip || !trip.expenses.length) return null;
    const days = new Set(trip.expenses.map((e) => e.date.slice(0, 10))).size;
    const biggest = trip.expenses.reduce((max, e) => e.amount > max.amount ? e : max, trip.expenses[0]);
    const dailyMap = new Map<string, number>();
    for (const e of trip.expenses) {
      const day = e.date.slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + e.amount);
    }
    const dailyData = [...dailyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date: fmtDateShort(date + "T00:00:00Z"), total }));

    const grouped = new Map<string, TripExpenseDTO[]>();
    for (const e of trip.expenses) {
      const day = e.date.slice(0, 10);
      if (!grouped.has(day)) grouped.set(day, []);
      grouped.get(day)!.push(e);
    }
    const groupedByDate = [...grouped.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([day, expenses]) => ({ day, label: fmtDateShort(day + "T00:00:00Z"), expenses }));

    return { days, biggest, dailyData, groupedByDate, avgPerDay: trip.totalSpent / days };
  }, [trip]);

  function handleExpenseSaved(expense: TripExpenseDTO) {
    setTrip((prev) => {
      if (!prev) return prev;
      if (editingExpense) {
        const diff = expense.amount - editingExpense.amount;
        return { ...prev, totalSpent: prev.totalSpent + diff, expenses: prev.expenses.map((e) => e.id === expense.id ? expense : e) };
      }
      return { ...prev, expenses: [expense, ...prev.expenses], totalSpent: prev.totalSpent + expense.amount, expenseCount: prev.expenseCount + 1 };
    });
    setEditingExpense(null);
  }

  async function handleDeleteExpense(expenseId: string, amount: number) {
    await fetch(`/api/trips/${id}/expenses/${expenseId}`, { method: "DELETE" });
    setTrip((prev) =>
      prev ? { ...prev, expenses: prev.expenses.filter((e) => e.id !== expenseId), totalSpent: prev.totalSpent - amount, expenseCount: prev.expenseCount - 1 } : prev
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
      <div className="p-6 max-w-4xl mx-auto w-full space-y-4">
        <div className="h-56 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
        <div className="h-48 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (!trip) return <div className="p-6 text-slate-500">Trip not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
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

      {/* Cover banner */}
      <div className="relative rounded-2xl overflow-hidden h-56 bg-slate-100 mb-5 group/cover">
        {trip.coverImage
          ? <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-6xl">✈️</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <button
          onClick={() => coverInputRef.current?.click()}
          disabled={uploadingCover}
          className="absolute top-3 right-3 opacity-0 group-hover/cover:opacity-100 transition-opacity bg-black/40 hover:bg-black/60 text-white rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium backdrop-blur-sm"
        >
          <Camera className="w-3.5 h-3.5" />
          {uploadingCover ? "Saving…" : "Change photo"}
        </button>
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
          <div>
            <p className="text-white/60 text-xs mb-0.5">{trip.expenseCount} expense{trip.expenseCount !== 1 ? "s" : ""}</p>
            <p className="text-white text-3xl font-bold tracking-tight">{formatCurrency(trip.totalSpent)}</p>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)} className="bg-white text-slate-800 hover:bg-slate-100 gap-1.5 shadow-md">
            <Plus className="w-3.5 h-3.5" />
            Add expense
          </Button>
        </div>
      </div>

      {trip.expenses.length === 0 ? (
        <div className="text-center py-24 text-slate-400 text-sm">No expenses yet. Add your first one!</div>
      ) : (
        <>
          {/* Stat cards */}
          {stats && (
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Avg / day</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{formatCurrency(stats.avgPerDay)}</p>
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Days</p>
                  <p className="text-sm font-bold text-slate-800">{stats.days}</p>
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-rose-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Biggest</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{formatCurrency(stats.biggest.amount)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Charts row */}
          {stats && stats.dailyData.length > 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
              {/* Daily spending bar chart */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5">
                <p className="text-sm font-medium text-slate-700 mb-4">Daily Spending</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.dailyData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={36} />
                    <Tooltip
                      formatter={(v: number) => [formatCurrency(v), "Spent"]}
                      contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                      wrapperStyle={{ zIndex: 50 }}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {stats.dailyData.map((_, i) => (
                        <Cell key={i} fill={i === stats.dailyData.reduce((mi, d, idx) => d.total > stats.dailyData[mi].total ? idx : mi, 0) ? "#818cf8" : "#c7d2fe"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top expenses breakdown */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5">
                <p className="text-sm font-medium text-slate-700 mb-4">Top Expenses</p>
                <div className="flex flex-col gap-3">
                  {[...trip.expenses]
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 5)
                    .map((e) => {
                      const pct = trip.totalSpent > 0 ? (e.amount / trip.totalSpent) * 100 : 0;
                      return (
                        <div key={e.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600 truncate max-w-[60%]">{e.label}</span>
                            <span className="text-xs font-semibold text-slate-700">{formatCurrency(e.amount)}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Expense list grouped by date */}
          <div className="flex flex-col gap-5">
            {stats?.groupedByDate.map(({ day, label, expenses }) => (
              <div key={day}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
                  <span className="text-xs text-slate-300">·</span>
                  <span className="text-xs text-slate-400">{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {expenses.map((expense) => {
                    const pct = trip.totalSpent > 0 ? (expense.amount / trip.totalSpent) * 100 : 0;
                    return (
                      <div key={expense.id} className="group bg-white border border-slate-100 rounded-xl px-4 py-3 hover:border-slate-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{expense.label}</p>
                            {expense.note && <p className="text-xs text-slate-400 truncate">{expense.note}</p>}
                          </div>
                          <span className="text-sm font-semibold text-slate-700 shrink-0">{formatCurrency(expense.amount)}</span>
                          <span className="text-xs text-slate-300 shrink-0 w-10 text-right">{pct.toFixed(0)}%</span>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                            <button onClick={() => { setEditingExpense(expense); setAddOpen(true); }} className="p-1 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-slate-500">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteExpense(expense.id, expense.amount)} className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 h-1 bg-slate-50 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-200 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
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
