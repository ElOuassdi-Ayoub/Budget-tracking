"use client";

import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { NetPerMonthPoint } from "@/types";

interface Props {
  data: NetPerMonthPoint[];
}

export function NetPerMonthChart({ data }: Props) {
  if (!data.length) return <EmptyState />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey="income" fill="#A8D5BA" stroke="#7DC4A3" fillOpacity={0.5} name="Income" />
        <Area type="monotone" dataKey="expenses" fill="#F4B8C1" stroke="#E89AAA" fillOpacity={0.5} name="Expenses" />
        <Line type="monotone" dataKey="net" stroke="#B8C9E1" strokeWidth={2} dot={false} name="Net" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function EmptyState() {
  return <div className="h-48 flex items-center justify-center text-sm text-slate-400">No data yet</div>;
}
