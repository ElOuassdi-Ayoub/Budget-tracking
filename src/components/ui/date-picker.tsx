"use client";

import { useState, useRef, useEffect } from "react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, addYears, subYears, setMonth, setYear,
  getYear, getMonth,
} from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;        // "YYYY-MM-DD" or ""
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;         // "YYYY-MM-DD" — dates before this are disabled
}

const DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type View = "days" | "months" | "years";

function buildYearRange(center: number): number[] {
  const start = Math.floor(center / 12) * 12;
  return Array.from({ length: 12 }, (_, i) => start + i);
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", min }: Props) {
  const selected = value ? new Date(value + "T00:00:00") : null;
  const [viewMonth, setViewMonth] = useState<Date>(selected ?? new Date());
  const [view, setView] = useState<View>("days");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const minDate = min ? new Date(min + "T00:00:00") : null;

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setView("days");
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 }),
  });

  const yearRange = buildYearRange(getYear(viewMonth));

  function select(day: Date) {
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, "0");
    const d = String(day.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setOpen(false);
    setView("days");
  }

  function pickMonth(monthIndex: number) {
    setViewMonth((v) => setMonth(v, monthIndex));
    setView("days");
  }

  function pickYear(year: number) {
    setViewMonth((v) => setYear(v, year));
    setView("months");
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-left transition-colors",
          "hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400",
          !value && "text-slate-400"
        )}
      >
        <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
        {value ? format(new Date(value + "T00:00:00"), "MMM d, yyyy") : placeholder}
      </button>

      {/* Dropdown calendar */}
      {open && (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-[9999] w-72 rounded-2xl border border-slate-100 bg-white shadow-xl p-4"
          onMouseDown={(e) => e.stopPropagation()}
        >

          {/* ── DAY VIEW ── */}
          {view === "days" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setViewMonth((m) => subMonths(m, 1))}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView("months")}
                  className="text-sm font-semibold text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                >
                  {format(viewMonth, "MMMM yyyy")}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMonth((m) => addMonths(m, 1))}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {DAY_NAMES.map((d) => (
                  <div key={d} className="h-8 flex items-center justify-center text-xs font-medium text-slate-400">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-0.5">
                {days.map((day) => {
                  const isSelected = !!selected && isSameDay(day, selected);
                  const inMonth = isSameMonth(day, viewMonth);
                  const todayDate = isToday(day);
                  const disabled = !!minDate && day < minDate;

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={disabled}
                      onClick={() => { if (!disabled) select(day); }}
                      className={cn(
                        "h-9 w-full rounded-lg text-sm font-medium transition-colors",
                        isSelected && "bg-indigo-500 text-white",
                        !isSelected && inMonth && !disabled && "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600",
                        !isSelected && todayDate && inMonth && !disabled && "text-indigo-500 font-bold",
                        !inMonth && "text-slate-300",
                        disabled && "text-slate-200 cursor-not-allowed",
                      )}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── MONTH VIEW ── */}
          {view === "months" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setViewMonth((m) => subYears(m, 1))}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView("years")}
                  className="text-sm font-semibold text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                >
                  {format(viewMonth, "yyyy")}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMonth((m) => addYears(m, 1))}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {MONTH_NAMES.map((name, i) => {
                  const isCurrentMonth = selected
                    ? getMonth(selected) === i && getYear(selected) === getYear(viewMonth)
                    : false;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => pickMonth(i)}
                      className={cn(
                        "h-10 rounded-xl text-sm font-medium transition-colors",
                        isCurrentMonth
                          ? "bg-indigo-500 text-white"
                          : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                      )}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── YEAR VIEW ── */}
          {view === "years" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setViewMonth((m) => subYears(m, 12))}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-slate-800">
                  {yearRange[0]} – {yearRange[yearRange.length - 1]}
                </span>
                <button
                  type="button"
                  onClick={() => setViewMonth((m) => addYears(m, 12))}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {yearRange.map((year) => {
                  const isCurrentYear = selected ? getYear(selected) === year : false;
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => pickYear(year)}
                      className={cn(
                        "h-10 rounded-xl text-sm font-medium transition-colors",
                        isCurrentYear
                          ? "bg-indigo-500 text-white"
                          : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                      )}
                    >
                      {year}
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
