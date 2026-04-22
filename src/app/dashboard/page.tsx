"use client";

import { useState, useEffect, useCallback } from "react";
import { MonthSelector } from "@/components/dashboard/MonthSelector";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { SpendingByCategoryWidget } from "@/components/dashboard/SpendingByCategoryWidget";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { formatCurrency } from "@/lib/utils";
import type { IncomeDTO, ExpenseDTO } from "@/types";

export default function DashboardPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [income, setIncome] = useState<IncomeDTO[]>([]);
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);

  const fetchData = useCallback(async () => {
    const [ir, er] = await Promise.all([
      fetch(`/api/income?month=${month}&year=${year}`),
      fetch(`/api/expenses?month=${month}&year=${year}`),
    ]);
    setIncome(await ir.json());
    setExpenses(await er.json());
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalIncome = income.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const net = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((net / totalIncome) * 100).toFixed(1) : "—";

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Monthly overview</p>
        </div>
        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <SummaryCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          accentColor="#A8D5BA"
          icon="💰"
        />
        <SummaryCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          accentColor="#F4B8C1"
          icon="💸"
        />
        <SummaryCard
          title="Net Savings"
          value={formatCurrency(net)}
          subtitle={net >= 0 ? "Looking good!" : "Over budget"}
          accentColor="#B8C9E1"
          icon="🏦"
        />
        <SummaryCard
          title="Savings Rate"
          value={savingsRate === "—" ? "—" : `${savingsRate}%`}
          subtitle="of total income saved"
          accentColor="#D7BDE2"
          icon="📈"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-sm font-medium text-slate-700 mb-4">Spending by Category</h2>
          <SpendingByCategoryWidget expenses={expenses} />
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-sm font-medium text-slate-700 mb-4">Recent Expenses</h2>
          <RecentTransactions expenses={expenses} />
        </div>
      </div>
    </div>
  );
}
