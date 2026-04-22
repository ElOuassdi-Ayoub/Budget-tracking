import { formatCurrency } from "@/lib/utils";
import type { ExpenseDTO } from "@/types";

interface Props {
  expenses: ExpenseDTO[];
}

export function RecentTransactions({ expenses }: Props) {
  const recent = expenses.slice(0, 6);

  if (recent.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-400">
        No expenses yet this month
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {recent.map((e) => (
        <div key={e.id} className="flex items-center gap-3 py-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
            style={{ backgroundColor: e.category.color }}
          >
            {e.category.icon ?? "📌"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-700 truncate">{e.label}</div>
            <div className="text-xs text-slate-400">{e.category.name}</div>
          </div>
          <span className="text-sm font-semibold text-rose-500 shrink-0">
            -{formatCurrency(e.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
