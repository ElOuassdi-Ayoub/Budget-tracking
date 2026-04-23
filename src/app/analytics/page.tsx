"use client";

import { useState, useEffect } from "react";
import { FilterBar } from "@/components/analytics/FilterBar";
import { NetPerMonthChart } from "@/components/analytics/NetPerMonthChart";
import { SpendingByCategoryChart } from "@/components/analytics/SpendingByCategoryChart";
import { IncomeTrendChart } from "@/components/analytics/IncomeTrendChart";
import { TopCategoriesChart } from "@/components/analytics/TopCategoriesChart";
import type { AnalyticsPayload } from "@/types";
import type { TimeFilter } from "@/lib/constants";

const EMPTY: AnalyticsPayload = {
  netPerMonth: [],
  spendingByCategory: [],
  incomeTrends: [],
  topCategories: [],
};

export default function AnalyticsPage() {
  const [range, setRange] = useState<TimeFilter>("6m");
  const [data, setData] = useState<AnalyticsPayload>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?range=${range}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [range]);

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Spending and income trends</p>
        </div>
        <FilterBar value={range} onChange={setRange} />
      </div>

      <div className={`grid lg:grid-cols-2 gap-6 transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}>
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-sm font-medium text-slate-700 mb-4">Income vs Expenses</h2>
          <NetPerMonthChart data={data.netPerMonth} />
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-sm font-medium text-slate-700 mb-4">Monthly Net Savings</h2>
          <SpendingByCategoryChart data={data.netPerMonth} />
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-sm font-medium text-slate-700 mb-4">Income Sources</h2>
          <IncomeTrendChart data={data.incomeTrends} />
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-sm font-medium text-slate-700 mb-4">Top Spending Categories</h2>
          <TopCategoriesChart data={data.topCategories} />
        </div>
      </div>
    </div>
  );
}
