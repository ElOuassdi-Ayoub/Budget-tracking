"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryColorPicker } from "./CategoryColorPicker";
import type { CategoryDTO } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (category: CategoryDTO) => void;
  editing?: CategoryDTO | null;
}

export function AddCategoryDialog({ open, onOpenChange, onSaved, editing }: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [color, setColor] = useState(editing?.color ?? "#A8D5BA");
  const [icon, setIcon] = useState(editing?.icon ?? "");
  const [loading, setLoading] = useState(false);

  const isEdit = !!editing;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = isEdit
        ? await fetch(`/api/categories/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, color, icon: icon || null }),
          })
        : await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, color, icon: icon || null }),
          });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Something went wrong");
        return;
      }

      const saved = await res.json();
      onSaved(saved);
      onOpenChange(false);
      toast.success(isEdit ? "Category updated" : "Category created");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(val: boolean) {
    if (!val) {
      setName(editing?.name ?? "");
      setColor(editing?.color ?? "#A8D5BA");
      setIcon(editing?.icon ?? "");
    }
    onOpenChange(val);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gym membership"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-icon">Icon (emoji, optional)</Label>
            <Input
              id="cat-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🏋️"
              className="w-24"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <CategoryColorPicker value={color} onChange={setColor} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Saving…" : isEdit ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
