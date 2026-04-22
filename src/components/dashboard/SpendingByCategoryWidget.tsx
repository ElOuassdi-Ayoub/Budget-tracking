"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { ExpenseDTO } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  expenses: ExpenseDTO[];
}

export function SpendingByCategoryWidget({ expenses }: Props) {
  const totals = new Map<string, { total: number; color: string }>();
  for (const e of expenses) {
    const prev = totals.get(e.category.name) ?? { total: 0, color: e.category.color };
    totals.set(e.category.name, { total: prev.total + e.amount, color: e.category.color });
  }
  const data = [...totals.entries()]
    .map(([name, v]) => ({ name, value: v.total, color: v.color }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        No expenses yet this month
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => formatCurrency(Number(v))}
          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11 }}
          formatter={(value) => <span style={{ color: "#475569" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
