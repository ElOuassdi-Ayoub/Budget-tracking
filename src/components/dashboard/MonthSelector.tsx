"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthYear } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Props {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

type PickerStep = "month" | "year";

export function MonthSelector({ year, month, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<PickerStep>("month");
  const [pickerYear, setPickerYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function openPicker() {
    setStep("month");
    setPickerYear(year);
    setSelectedMonth(null);
    setOpen(true);
  }

  function handleMonthClick(m: number) {
    setSelectedMonth(m);
    setStep("year");
  }

  function handleYearClick(y: number) {
    onChange(y, selectedMonth!);
    setOpen(false);
  }

  function prev() {
    if (month === 1) onChange(year - 1, 12);
    else onChange(year, month - 1);
  }

  function next() {
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    if (nextYear > now.getFullYear() || (nextYear === now.getFullYear() && nextMonth > now.getMonth() + 1)) return;
    onChange(nextYear, nextMonth);
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  // Year range: from 5 years before current back to 2020, capped at current year
  const currentYear = now.getFullYear();
  const minYear = 2018;
  const years: number[] = [];
  for (let y = currentYear; y >= minYear; y--) years.push(y);

  // Which months are disabled for a given year (future months)
  function isMonthDisabled(m: number) {
    return pickerYear > currentYear || (pickerYear === currentYear && m > now.getMonth() + 1);
  }

  return (
    <div className="relative" ref={popoverRef}>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prev}>
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <button
          onClick={openPicker}
          className="text-sm font-semibold text-slate-700 min-w-[130px] text-center px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {formatMonthYear(year, month)}
        </button>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={next} disabled={isCurrentMonth}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {open && (
        <div className="absolute right-0 top-10 z-50 bg-white rounded-xl shadow-lg border border-slate-100 p-3 w-64">
          {step === "month" && (
            <>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3 px-1">
                Select Month
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {MONTHS.map((label, i) => {
                  const m = i + 1;
                  const disabled = isMonthDisabled(m);
                  return (
                    <button
                      key={m}
                      onClick={() => !disabled && handleMonthClick(m)}
                      disabled={disabled}
                      className={cn(
                        "py-2 rounded-lg text-sm font-medium transition-colors",
                        disabled
                          ? "text-slate-200 cursor-not-allowed"
                          : m === month
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === "year" && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setStep("month")}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ← Back
                </button>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {MONTHS[(selectedMonth ?? 1) - 1]} — Select Year
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                {years.map((y) => {
                  const disabled = y === currentYear && (selectedMonth ?? 0) > now.getMonth() + 1;
                  return (
                    <button
                      key={y}
                      onClick={() => !disabled && handleYearClick(y)}
                      disabled={disabled}
                      className={cn(
                        "py-2 rounded-lg text-sm font-medium transition-colors",
                        disabled
                          ? "text-slate-200 cursor-not-allowed"
                          : y === year && selectedMonth === month
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
