"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, BarChart3, Tag, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/trips", label: "Trips", icon: Plane },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-slate-100 px-4 py-6">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <span className="text-2xl leading-none">💰</span>
        <span className="font-bold text-slate-900 text-base tracking-tight">Budget</span>
      </div>

      {/* Section label */}
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-2 mb-2">
        Menu
      </p>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                active
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium"
              )}
            >
              <span className={cn(
                "flex items-center justify-center w-8 h-8 rounded-xl transition-all shrink-0",
                active
                  ? "bg-indigo-600 shadow-md shadow-indigo-200/60"
                  : "bg-slate-100 group-hover:bg-slate-200"
              )}>
                <Icon className={cn("w-4 h-4", active ? "text-white" : "text-slate-500 group-hover:text-slate-700")} />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
