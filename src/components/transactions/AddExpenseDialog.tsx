"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CategoryDTO, ExpenseDTO } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (entry: ExpenseDTO) => void;
  month: number;
  year: number;
  categories: CategoryDTO[];
  editing?: ExpenseDTO | null;
}

export function AddExpenseDialog({ open, onOpenChange, onSaved, month, year, categories, editing }: Props) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = !!editing;

  useEffect(() => {
    if (editing) {
      setLabel(editing.label);
      setAmount(editing.amount.toString());
      setCategoryId(editing.categoryId);
      setNote(editing.note ?? "");
    } else {
      setLabel(""); setAmount(""); setCategoryId(""); setNote("");
    }
  }, [editing, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !amount || !categoryId) return;
    setLoading(true);
    try {
      const res = isEdit
        ? await fetch(`/api/expenses/${editing!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label, amount, categoryId, note }),
          })
        : await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label, amount, categoryId, month, year, note }),
          });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Something went wrong");
        return;
      }
      const saved = await res.json();
      onSaved(saved);
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
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Monthly groceries" autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Amount ($)</Label>
            <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full inline-block"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.icon} {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Note (optional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any notes…" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || !label.trim() || !amount || !categoryId}>
              {loading ? "Saving…" : isEdit ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
