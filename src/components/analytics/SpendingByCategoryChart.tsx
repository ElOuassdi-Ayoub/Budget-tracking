"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { COLOR_PALETTE } from "@/lib/constants";

interface Props {
  data: Record<string, number | string>[];
}

export function SpendingByCategoryChart({ data }: Props) {
  if (!data.length) return <EmptyState />;

  const categories = Array.from(
    new Set(data.flatMap((d) => Object.keys(d).filter((k) => k !== "month")))
  );

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        {categories.map((cat, i) => (
          <Bar key={cat} dataKey={cat} stackId="a" fill={COLOR_PALETTE[i % COLOR_PALETTE.length]} radius={i === categories.length - 1 ? [4, 4, 0, 0] : undefined} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyState() {
  return <div className="h-48 flex items-center justify-center text-sm text-slate-400">No data yet</div>;
}
