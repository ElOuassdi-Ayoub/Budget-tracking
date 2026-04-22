import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  accentColor: string;
  icon: string;
}

export function SummaryCard({ title, value, subtitle, accentColor, icon }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ backgroundColor: accentColor }}
        >
          {icon}
        </div>
      </div>
      <div>
        <div className={cn("text-2xl font-bold", subtitle ? "" : "text-slate-800")}>{value}</div>
        {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
}
