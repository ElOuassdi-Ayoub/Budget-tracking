"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { TripExpenseDTO } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  onSaved: (expense: TripExpenseDTO) => void;
  editing?: TripExpenseDTO | null;
}

export function AddTripExpenseDialog({ open, onOpenChange, tripId, onSaved, editing }: Props) {
  const [type, setType] = useState<"expense" | "received">("expense");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = !!editing;

  useEffect(() => {
    if (open) {
      if (editing) {
        setType(editing.type);
        setLabel(editing.label);
        setAmount(editing.amount.toString());
        setDate(editing.date.slice(0, 10));
        setNote(editing.note ?? "");
      } else {
        setType("expense"); setLabel(""); setAmount(""); setNote("");
        setDate(new Date().toISOString().slice(0, 10));
      }
    }
  }, [open, editing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !amount || !date) return;
    setLoading(true);
    try {
      const res = isEdit
        ? await fetch(`/api/trips/${tripId}/expenses/${editing!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label, amount, type, date, note }),
          })
        : await fetch(`/api/trips/${tripId}/expenses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label, amount, type, date, note }),
          });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Something went wrong");
        return;
      }
      const expense = await res.json();
      onSaved(expense);
      onOpenChange(false);
      toast.success(isEdit ? "Entry updated" : type === "received" ? "Income added" : "Expense added");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Entry" : "Add Entry"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">

          {/* Type toggle */}
          <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors",
                type === "expense" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("received")}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors",
                type === "received" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Received
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Description</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={type === "received" ? "e.g. Gift, Refund, Cash back…" : "e.g. Hotel, Flight, Dinner…"}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Amount ($)</Label>
            <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Note (optional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any notes…" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              type="submit"
              disabled={loading || !label.trim() || !amount || !date}
              className={type === "received" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
            >
              {loading ? "Saving…" : isEdit ? "Save" : type === "received" ? "Add Income" : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
