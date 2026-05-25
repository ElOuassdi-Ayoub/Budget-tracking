"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { COLOR_PALETTE } from "@/lib/constants";

interface Props {
  data: Record<string, number | string>[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; name: string; value: number; fill: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const nonZero = payload.filter((p) => p.value > 0);
  if (!nonZero.length) return null;
  const total = nonZero.reduce((s, p) => s + p.value, 0);
  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {nonZero.map((p) => (
        <div key={p.dataKey} style={{ color: p.fill, marginBottom: 2 }}>
          {p.name} : {formatCurrency(p.value)}
        </div>
      ))}
      <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 6, paddingTop: 6, fontWeight: 600, color: "#1e293b" }}>
        Total : {formatCurrency(total)}
      </div>
    </div>
  );
}

export function IncomeTrendChart({ data }: Props) {
  if (!data.length) return <EmptyState />;

  const sources = Array.from(
    new Set(data.flatMap((d) => Object.keys(d).filter((k) => k !== "month")))
  );

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        {sources.map((src, i) => (
          <Bar key={src} dataKey={src} stackId="a" fill={COLOR_PALETTE[i % COLOR_PALETTE.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyState() {
  return <div className="h-48 flex items-center justify-center text-sm text-slate-400">No data yet</div>;
}
