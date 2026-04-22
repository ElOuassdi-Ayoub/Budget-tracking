"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { MonthSelector } from "@/components/dashboard/MonthSelector";
import { IncomeTable } from "@/components/transactions/IncomeTable";
import { ExpenseTable } from "@/components/transactions/ExpenseTable";
import { AddIncomeDialog } from "@/components/transactions/AddIncomeDialog";
import { AddExpenseDialog } from "@/components/transactions/AddExpenseDialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { IncomeDTO, ExpenseDTO, CategoryDTO } from "@/types";

export default function TransactionsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [income, setIncome] = useState<IncomeDTO[]>([]);
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);

  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeDTO | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseDTO | null>(null);

  const fetchData = useCallback(async () => {
    const [incomeRes, expenseRes] = await Promise.all([
      fetch(`/api/income?month=${month}&year=${year}`),
      fetch(`/api/expenses?month=${month}&year=${year}`),
    ]);
    setIncome(await incomeRes.json());
    setExpenses(await expenseRes.json());
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  async function deleteIncome(entry: IncomeDTO) {
    if (!confirm("Delete this income entry?")) return;
    const res = await fetch(`/api/income/${entry.id}`, { method: "DELETE" });
    if (res.status === 204) {
      setIncome((prev) => prev.filter((e) => e.id !== entry.id));
      toast.success("Income deleted");
    } else {
      toast.error("Could not delete");
    }
  }

  async function deleteExpense(entry: ExpenseDTO) {
    if (!confirm("Delete this expense?")) return;
    const res = await fetch(`/api/expenses/${entry.id}`, { method: "DELETE" });
    if (res.status === 204) {
      setExpenses((prev) => prev.filter((e) => e.id !== entry.id));
      toast.success("Expense deleted");
    } else {
      toast.error("Could not delete");
    }
  }

  const totalIncome = income.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const net = totalIncome - totalExpenses;

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Transactions</h1>
          <div className="flex gap-4 mt-1 text-sm text-slate-500">
            <span>Income: <span className="text-emerald-600 font-medium">{formatCurrency(totalIncome)}</span></span>
            <span>Expenses: <span className="text-rose-500 font-medium">{formatCurrency(totalExpenses)}</span></span>
            <span>Net: <span className={net >= 0 ? "text-emerald-600 font-medium" : "text-rose-500 font-medium"}>{formatCurrency(net)}</span></span>
          </div>
        </div>
        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
            <h2 className="font-medium text-slate-700 text-sm">Income</h2>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => { setEditingIncome(null); setIncomeDialogOpen(true); }}
            >
              + Add
            </Button>
          </div>
          <IncomeTable
            entries={income}
            onEdit={(e) => { setEditingIncome(e); setIncomeDialogOpen(true); }}
            onDelete={deleteIncome}
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
            <h2 className="font-medium text-slate-700 text-sm">Expenses</h2>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => { setEditingExpense(null); setExpenseDialogOpen(true); }}
            >
              + Add
            </Button>
          </div>
          <ExpenseTable
            entries={expenses}
            onEdit={(e) => { setEditingExpense(e); setExpenseDialogOpen(true); }}
            onDelete={deleteExpense}
          />
        </div>
      </div>

      <AddIncomeDialog
        open={incomeDialogOpen}
        onOpenChange={(v) => { setIncomeDialogOpen(v); if (!v) setEditingIncome(null); }}
        onSaved={(e) => {
          setIncome((prev) => {
            const idx = prev.findIndex((x) => x.id === e.id);
            if (idx >= 0) { const n = [...prev]; n[idx] = e; return n; }
            return [e, ...prev];
          });
        }}
        month={month}
        year={year}
        editing={editingIncome}
      />
      <AddExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={(v) => { setExpenseDialogOpen(v); if (!v) setEditingExpense(null); }}
        onSaved={(e) => {
          setExpenses((prev) => {
            const idx = prev.findIndex((x) => x.id === e.id);
            if (idx >= 0) { const n = [...prev]; n[idx] = e; return n; }
            return [e, ...prev];
          });
        }}
        month={month}
        year={year}
        categories={categories}
        editing={editingExpense}
      />
    </div>
  );
}
