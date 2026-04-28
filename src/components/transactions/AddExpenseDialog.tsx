"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CategoryDTO, ExpenseDTO } from "@/types";

interface Suggestion {
  label: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon?: string | null;
}

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

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const [allPastExpenses, setAllPastExpenses] = useState<ExpenseDTO[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const isEdit = !!editing;

  // Load all past expenses once when dialog opens
  useEffect(() => {
    if (!open || isEdit) return;
    fetch("/api/expenses")
      .then((r) => r.json())
      .then(setAllPastExpenses);
  }, [open, isEdit]);

  useEffect(() => {
    if (editing) {
      setLabel(editing.label);
      setAmount(editing.amount.toString());
      setCategoryId(editing.categoryId);
      setNote(editing.note ?? "");
    } else {
      setLabel(""); setAmount(""); setCategoryId(""); setNote("");
    }
    setSuggestions([]);
    setShowSuggestions(false);
  }, [editing, open]);

  const computeSuggestions = useCallback((input: string) => {
    if (input.length < 2 || !allPastExpenses.length) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const lower = input.toLowerCase();
    // Deduplicate: keep the most recent occurrence of each unique label
    const seen = new Map<string, Suggestion>();
    for (const e of allPastExpenses) {
      if (!e.label.toLowerCase().includes(lower)) continue;
      const key = e.label.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, {
          label: e.label,
          amount: e.amount,
          categoryId: e.categoryId,
          categoryName: e.category.name,
          categoryColor: e.category.color,
          categoryIcon: e.category.icon,
        });
      }
    }

    const results = [...seen.values()].slice(0, 6);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
    setHighlightedIdx(0);
  }, [allPastExpenses]);

  function applySuggestion(s: Suggestion) {
    setLabel(s.label);
    setAmount(s.amount.toString());
    setCategoryId(s.categoryId);
    setShowSuggestions(false);
  }

  function handleLabelChange(val: string) {
    setLabel(val);
    computeSuggestions(val);
  }

  function handleLabelKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || !suggestions.length) return;

    if (e.key === "Tab") {
      e.preventDefault();
      applySuggestion(suggestions[highlightedIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      applySuggestion(suggestions[highlightedIdx]);
    }
  }

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

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Expense" : "Add Expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">

          {/* Description with autocomplete */}
          <div className="flex flex-col gap-1.5 relative">
            <Label>Description</Label>
            <Input
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              onKeyDown={handleLabelKeyDown}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => label.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="e.g. Netflix, Phone bill…"
              autoFocus
              autoComplete="off"
            />
            {!isEdit && suggestions.length > 0 && (
              <p className="text-[10px] text-slate-400 -mt-1">
                Tab to fill · ↑↓ to navigate
              </p>
            )}

            {showSuggestions && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 z-[300] mt-1 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={s.label}
                    type="button"
                    onMouseDown={() => applySuggestion(s)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                      i === highlightedIdx ? "bg-slate-50" : "hover:bg-slate-50"
                    )}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                      style={{ backgroundColor: s.categoryColor }}
                    >
                      {s.categoryIcon ?? "📌"}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-slate-800 truncate">{s.label}</span>
                      <span className="block text-xs text-slate-400">{s.categoryName}</span>
                    </span>
                    <span className="text-sm font-semibold text-slate-600 shrink-0">
                      ${s.amount.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Amount ($)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category">
                  {selectedCategory && (
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: selectedCategory.color }} />
                      {selectedCategory.icon} {selectedCategory.name}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: cat.color }} />
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
