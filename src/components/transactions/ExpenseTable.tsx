"use client";

import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditDeleteMenu } from "./EditDeleteMenu";
import type { ExpenseDTO } from "@/types";

interface Props {
  entries: ExpenseDTO[];
  onEdit: (entry: ExpenseDTO) => void;
  onDelete: (entry: ExpenseDTO) => void;
}

export function ExpenseTable({ entries, onEdit, onDelete }: Props) {
  if (entries.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-slate-400">
        No expenses recorded for this month.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead className="hidden sm:table-cell">Category</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="font-medium text-slate-800">{entry.label}</TableCell>
            <TableCell className="hidden sm:table-cell">
              <span className="flex items-center gap-1.5 text-sm">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: entry.category.color }}
                />
                {entry.category.name}
              </span>
            </TableCell>
            <TableCell className="text-right font-semibold text-rose-500">
              {formatCurrency(entry.amount)}
            </TableCell>
            <TableCell>
              <EditDeleteMenu onEdit={() => onEdit(entry)} onDelete={() => onDelete(entry)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
