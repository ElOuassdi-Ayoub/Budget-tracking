"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { NetPerMonthPoint } from "@/types";

interface Props {
  data: NetPerMonthPoint[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const net = payload[0].value;
  const positive = net >= 0;
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    }}>
      <p style={{ fontWeight: 600, color: "#334155", marginBottom: 4 }}>{label}</p>
      <p style={{ color: positive ? "#059669" : "#e11d48", fontWeight: 700, fontSize: 15 }}>
        {positive ? "+" : ""}{formatCurrency(net)}
      </p>
      <p style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>
        {positive ? "saved this month" : "over budget"}
      </p>
    </div>
  );
}

export function SpendingByCategoryChart({ data }: Props) {
  if (!data.length) return <EmptyState />;

  const hasNegative = data.some((d) => d.net < 0);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
        <defs>
          <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#A8D5BA" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#A8D5BA" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="netGradientNeg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F4B8C1" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#F4B8C1" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 9999 }} />
        {hasNegative && <ReferenceLine y={0} stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="4 4" />}
        <Area
          type="monotone"
          dataKey="net"
          stroke="#7DC4A3"
          strokeWidth={2.5}
          fill="url(#netGradient)"
          dot={{ r: 3.5, fill: "#7DC4A3", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#7DC4A3", strokeWidth: 0 }}
          name="Net Savings"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function EmptyState() {
  return <div className="h-48 flex items-center justify-center text-sm text-slate-400">No data yet</div>;
}
