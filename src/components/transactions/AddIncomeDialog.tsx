"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { IncomeDTO } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (entry: IncomeDTO) => void;
  month: number;
  year: number;
  editing?: IncomeDTO | null;
}

export function AddIncomeDialog({ open, onOpenChange, onSaved, month, year, editing }: Props) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = !!editing;

  useEffect(() => {
    if (editing) {
      setLabel(editing.label);
      setAmount(editing.amount.toString());
      setNote(editing.note ?? "");
    } else {
      setLabel(""); setAmount(""); setNote("");
    }
  }, [editing, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !amount) return;
    setLoading(true);
    try {
      const res = isEdit
        ? await fetch(`/api/income/${editing!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label, amount, note }),
          })
        : await fetch("/api/income", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label, amount, month, year, note }),
          });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Something went wrong");
        return;
      }
      const saved = await res.json();
      onSaved(saved);
      onOpenChange(false);
      toast.success(isEdit ? "Income updated" : "Income added");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Income" : "Add Income"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>Source</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Salary, Freelance" autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Amount ($)</Label>
            <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Note (optional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any notes…" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || !label.trim() || !amount}>
              {loading ? "Saving…" : isEdit ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
