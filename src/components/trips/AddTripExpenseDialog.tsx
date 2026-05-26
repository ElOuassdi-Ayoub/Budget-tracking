"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TripExpenseDTO } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  onSaved: (expense: TripExpenseDTO) => void;
  editing?: TripExpenseDTO | null;
}

export function AddTripExpenseDialog({ open, onOpenChange, tripId, onSaved, editing }: Props) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = !!editing;

  useEffect(() => {
    if (open) {
      if (editing) {
        setLabel(editing.label);
        setAmount(editing.amount.toString());
        setDate(editing.date.slice(0, 10));
        setNote(editing.note ?? "");
      } else {
        setLabel(""); setAmount(""); setNote("");
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
            body: JSON.stringify({ label, amount, date, note }),
          })
        : await fetch(`/api/trips/${tripId}/expenses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label, amount, date, note }),
          });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Something went wrong");
        return;
      }
      const expense = await res.json();
      onSaved(expense);
      onOpenChange(false);
      toast.success(isEdit ? "Expense updated" : "Expense added");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Expense" : "Add Expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>Description</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Hotel, Flight, Dinner…" autoFocus />
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
            <Button type="submit" disabled={loading || !label.trim() || !amount || !date}>
              {loading ? "Saving…" : isEdit ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
