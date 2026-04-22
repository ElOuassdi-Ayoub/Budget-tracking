"use client";

import { cn } from "@/lib/utils";
import { TIME_FILTERS, type TimeFilter } from "@/lib/constants";

interface Props {
  value: TimeFilter;
  onChange: (value: TimeFilter) => void;
}

export function FilterBar({ value, onChange }: Props) {
  return (
    <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
      {TIME_FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            value === f.value
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
