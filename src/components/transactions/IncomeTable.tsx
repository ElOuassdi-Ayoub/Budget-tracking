"use client";

import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditDeleteMenu } from "./EditDeleteMenu";
import type { IncomeDTO } from "@/types";

interface Props {
  entries: IncomeDTO[];
  onEdit: (entry: IncomeDTO) => void;
  onDelete: (entry: IncomeDTO) => void;
}

export function IncomeTable({ entries, onEdit, onDelete }: Props) {
  if (entries.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-slate-400">
        No income recorded for this month.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Source</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="hidden sm:table-cell">Note</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="font-medium text-slate-800">{entry.label}</TableCell>
            <TableCell className="text-right font-semibold text-emerald-600">
              {formatCurrency(entry.amount)}
            </TableCell>
            <TableCell className="hidden sm:table-cell text-slate-400 text-sm">
              {entry.note ?? "—"}
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
