"use client";

import { COLOR_PALETTE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export function CategoryColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_PALETTE.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            "w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center",
            value === color ? "border-slate-400 scale-110" : "border-transparent hover:border-slate-300"
          )}
          style={{ backgroundColor: color }}
        >
          {value === color && <Check className="w-3 h-3 text-slate-600" strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
}
