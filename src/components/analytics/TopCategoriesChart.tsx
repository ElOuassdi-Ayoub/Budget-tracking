"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { TopCategory } from "@/types";

interface Props {
  data: TopCategory[];
}

export function TopCategoriesChart({ data }: Props) {
  if (!data.length) return <EmptyState />;
  const top8 = data.slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        layout="vertical"
        data={top8}
        margin={{ top: 5, right: 30, bottom: 5, left: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} width={75} />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
        <Bar dataKey="total" radius={[0, 4, 4, 0]} name="Total Spent">
          {top8.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyState() {
  return <div className="h-48 flex items-center justify-center text-sm text-slate-400">No data yet</div>;
}
