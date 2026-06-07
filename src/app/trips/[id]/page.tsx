"use client";

import { useState, useEffect, use, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Pencil, TrendingUp, CalendarDays, Zap, Camera, ArrowDownLeft, CalendarRange } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddTripExpenseDialog } from "@/components/trips/AddTripExpenseDialog";
import { formatCurrency } from "@/lib/utils";
import type { TripDTO, TripExpenseDTO } from "@/types";

interface TripDetail extends TripDTO {
  expenses: TripExpenseDTO[];
}

function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function recalc(expenses: TripExpenseDTO[]) {
  const totalSpent = expenses.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const totalReceived = expenses.filter((e) => e.type === "received").reduce((s, e) => s + e.amount, 0);
  return { totalSpent, totalReceived, netCost: totalSpent - totalReceived };
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<TripExpenseDTO | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd] = useState("");
  const [savingDates, setSavingDates] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  function openDatesDialog() {
    setDraftStart(trip?.startDate?.slice(0, 10) ?? "");
    setDraftEnd(trip?.endDate?.slice(0, 10) ?? "");
    setDatesOpen(true);
  }

  async function saveDates(e: React.FormEvent) {
    e.preventDefault();
    setSavingDates(true);
    await fetch(`/api/trips/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: draftStart || null, endDate: draftEnd || null }),
    });
    setTrip((prev) => prev ? { ...prev, startDate: draftStart || null, endDate: draftEnd || null } : prev);
    setSavingDates(false);
    setDatesOpen(false);
    toast.success("Dates updated");
  }

  useEffect(() => {
    fetch(`/api/trips/${id}`)
      .then((r) => r.json())
      .then((d) => { setTrip(d); setLoading(false); });
  }, [id]);

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const coverImage = ev.target?.result as string;
      await fetch(`/api/trips/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ coverImage }) });
      setTrip((prev) => prev ? { ...prev, coverImage } : prev);
      setUploadingCover(false);
      toast.success("Cover photo updated");
    };
    reader.readAsDataURL(file);
  }

  function handleExpenseSaved(expense: TripExpenseDTO) {
    setTrip((prev) => {
      if (!prev) return prev;
      const newExpenses = editingExpense
        ? prev.expenses.map((e) => e.id === expense.id ? expense : e)
        : [expense, ...prev.expenses];
      return {
        ...prev,
        expenses: newExpenses,
        ...recalc(newExpenses),
        expenseCount: editingExpense ? prev.expenseCount : prev.expenseCount + 1,
      };
    });
    setEditingExpense(null);
  }

  async function handleDeleteExpense(expenseId: string) {
    await fetch(`/api/trips/${id}/expenses/${expenseId}`, { method: "DELETE" });
    setTrip((prev) => {
      if (!prev) return prev;
      const newExpenses = prev.expenses.filter((e) => e.id !== expenseId);
      return { ...prev, expenses: newExpenses, ...recalc(newExpenses), expenseCount: prev.expenseCount - 1 };
    });
    toast.success("Entry removed");
  }

  async function handleDeleteTrip() {
    if (!confirm("Delete this trip and all its expenses?")) return;
    await fetch(`/api/trips/${id}`, { method: "DELETE" });
    toast.success("Trip deleted");
    router.push("/trips");
  }

  const stats = useMemo(() => {
    if (!trip || !trip.expenses.length) return null;
    const onlyExpenses = trip.expenses.filter((e) => e.type === "expense");

    // Use trip period if set, otherwise fall back to distinct expense days
    let days: number;
    if (trip.startDate && trip.endDate) {
      const ms = new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime();
      days = Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
    } else {
      days = new Set(trip.expenses.map((e) => e.date.slice(0, 10))).size;
    }

    const biggest = onlyExpenses.length ? onlyExpenses.reduce((max, e) => e.amount > max.amount ? e : max, onlyExpenses[0]) : null;

    // Daily chart: expenses only
    const dailyMap = new Map<string, number>();
    for (const e of onlyExpenses) {
      const day = e.date.slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + e.amount);
    }
    const dailyData = [...dailyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date: fmtDateShort(date + "T00:00:00Z"), total }));

    // Group all entries by date for the list
    const grouped = new Map<string, TripExpenseDTO[]>();
    for (const e of trip.expenses) {
      const day = e.date.slice(0, 10);
      if (!grouped.has(day)) grouped.set(day, []);
      grouped.get(day)!.push(e);
    }
    const groupedByDate = [...grouped.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([day, expenses]) => ({
        day,
        label: fmtDateShort(day + "T00:00:00Z"),
        expenses,
        dayNet: expenses.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0)
                - expenses.filter(e => e.type === "received").reduce((s, e) => s + e.amount, 0),
      }));

    return { days, biggest, dailyData, groupedByDate, avgPerDay: trip.totalSpent / days };
  }, [trip]);

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
            <button onClick={openDatesDialog} className="flex items-center gap-1.5 mb-1.5 group/dates">
              <CalendarRange className="w-3 h-3 text-white/50 group-hover/dates:text-white/80 transition-colors" />
              <span className="text-white/60 text-xs group-hover/dates:text-white/80 transition-colors">
                {trip.startDate && trip.endDate
                  ? `${new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })} – ${new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`
                  : "Set trip dates"}
              </span>
            </button>
            <p className="text-white text-3xl font-bold tracking-tight">{formatCurrency(trip.netCost)}</p>
            {trip.totalReceived > 0 && (
              <p className="text-white/60 text-xs mt-0.5">
                {formatCurrency(trip.totalSpent)} spent · <span className="text-emerald-300">{formatCurrency(trip.totalReceived)} received</span>
              </p>
            )}
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)} className="bg-white text-slate-800 hover:bg-slate-100 gap-1.5 shadow-md">
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>
      </div>

      {trip.expenses.length === 0 ? (
        <div className="text-center py-24 text-slate-400 text-sm">No entries yet. Add your first expense or income!</div>
      ) : (
        <>
          {/* Stat cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
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
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
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
                  <p className="text-sm font-bold text-slate-800 truncate">{stats.biggest ? formatCurrency(stats.biggest.amount) : "—"}</p>
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Received</p>
                  <p className="text-sm font-bold text-emerald-600 truncate">{formatCurrency(trip.totalReceived)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Charts row */}
          {stats && stats.dailyData.length > 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
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

              <div className="bg-white border border-slate-100 rounded-2xl p-5">
                <p className="text-sm font-medium text-slate-700 mb-4">Top Expenses</p>
                <div className="flex flex-col gap-3">
                  {[...trip.expenses]
                    .filter((e) => e.type === "expense")
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
            {stats?.groupedByDate.map(({ day, label, expenses, dayNet }) => (
              <div key={day}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
                  <span className="text-xs text-slate-300">·</span>
                  <span className="text-xs text-slate-400">{formatCurrency(dayNet)}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {expenses.map((expense) => {
                    const isReceived = expense.type === "received";
                    const pct = trip.totalSpent > 0 ? (expense.amount / trip.totalSpent) * 100 : 0;
                    return (
                      <div
                        key={expense.id}
                        className={`group bg-white border rounded-xl px-4 py-3 hover:border-slate-200 transition-colors ${isReceived ? "border-emerald-100 bg-emerald-50/30" : "border-slate-100"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {isReceived && <ArrowDownLeft className="w-3 h-3 text-emerald-500 shrink-0" />}
                              <p className={`text-sm font-medium truncate ${isReceived ? "text-emerald-700" : "text-slate-800"}`}>{expense.label}</p>
                            </div>
                            {expense.note && <p className="text-xs text-slate-400 truncate">{expense.note}</p>}
                          </div>
                          <span className={`text-sm font-semibold shrink-0 ${isReceived ? "text-emerald-600" : "text-slate-700"}`}>
                            {isReceived ? "+" : ""}{formatCurrency(expense.amount)}
                          </span>
                          {!isReceived && <span className="text-xs text-slate-300 shrink-0 w-9 text-right">{pct.toFixed(0)}%</span>}
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                            <button onClick={() => { setEditingExpense(expense); setAddOpen(true); }} className="p-1 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-slate-500">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteExpense(expense.id)} className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {!isReceived && (
                          <div className="mt-2 h-1 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-200 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        )}
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

      <Dialog open={datesOpen} onOpenChange={setDatesOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Trip Dates</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveDates} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>From</Label>
              <Input type="date" value={draftStart} onChange={(e) => setDraftStart(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>To</Label>
              <Input type="date" value={draftEnd} min={draftStart} onChange={(e) => setDraftEnd(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDatesOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={savingDates}>
                {savingDates ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
