"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddCategoryDialog } from "./AddCategoryDialog";
import type { CategoryDTO } from "@/types";

interface Props {
  initialCategories: CategoryDTO[];
}

export function CategoryList({ initialCategories }: Props) {
  const [categories, setCategories] = useState<CategoryDTO[]>(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDTO | null>(null);

  function handleSaved(cat: CategoryDTO) {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === cat.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = cat;
        return next;
      }
      return [cat, ...prev];
    });
  }

  async function handleDelete(cat: CategoryDTO) {
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
    if (res.status === 204) {
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast.success("Category deleted");
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Could not delete");
    }
  }

  function openEdit(cat: CategoryDTO) {
    setEditing(cat);
    setDialogOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Categories</h1>
          <p className="text-sm text-slate-500 mt-0.5">{categories.length} categories</p>
        </div>
        <Button onClick={openCreate} size="sm">+ New Category</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3 group"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
              style={{ backgroundColor: cat.color }}
            >
              {cat.icon ?? "📌"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800 text-sm truncate">{cat.name}</span>
                {cat.isPreset && (
                  <Badge variant="secondary" className="text-xs shrink-0">Preset</Badge>
                )}
              </div>
              <span className="text-xs text-slate-400">
                {cat._count?.expenses ?? 0} expense{cat._count?.expenses !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                className="w-7 h-7"
                onClick={() => openEdit(cat)}
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="w-7 h-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => handleDelete(cat)}
                disabled={cat.isPreset}
                title={cat.isPreset ? "Cannot delete preset" : "Delete"}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AddCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
        editing={editing}
      />
    </div>
  );
}
