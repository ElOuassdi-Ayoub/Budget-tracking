"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthYear } from "@/lib/utils";

interface Props {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export function MonthSelector({ year, month, onChange }: Props) {
  function prev() {
    if (month === 1) onChange(year - 1, 12);
    else onChange(year, month - 1);
  }
  function next() {
    const now = new Date();
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    if (nextYear > now.getFullYear() || (nextYear === now.getFullYear() && nextMonth > now.getMonth() + 1)) return;
    onChange(nextYear, nextMonth);
  }

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prev}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm font-semibold text-slate-700 min-w-[120px] text-center">
        {formatMonthYear(year, month)}
      </span>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={next} disabled={isCurrentMonth}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
