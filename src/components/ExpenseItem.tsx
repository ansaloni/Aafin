"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Expense, Budget } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ExpenseItemProps {
  expense: Expense;
  budgets: Budget[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

export function ExpenseItem({ expense, budgets, onEdit, onDelete }: ExpenseItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const budget = budgets.find((b) => b.id === expense.budgetId);

  return (
    <div className="relative flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: budget?.color ? `${budget.color}20` : "#f4f4f5" }}
      >
        <span className="text-sm font-bold" style={{ color: budget?.color ?? "#71717a" }}>
          {expense.name.charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900 truncate">{expense.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: budget?.color ? `${budget.color}18` : "#f4f4f5",
              color: budget?.color ?? "#71717a",
            }}
          >
            {expense.budgetName}
          </span>
          <span className="text-xs text-zinc-400">{formatDate(new Date(expense.date))}</span>
        </div>
        {expense.note && (
          <p className="text-xs text-zinc-400 truncate mt-0.5">{expense.note}</p>
        )}
      </div>

      <div className="flex items-center gap-0.5 flex-shrink-0">
        <p className="text-sm font-bold text-zinc-900">{formatCurrency(expense.value)}</p>
        {(onEdit || onDelete) && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500 transition-colors ml-1"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 min-w-[130px] rounded-xl bg-white shadow-xl border border-zinc-100 py-1 overflow-hidden">
                  {onEdit && (
                    <button
                      onClick={() => { setMenuOpen(false); onEdit(expense); }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5 text-indigo-500" />
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => { setMenuOpen(false); onDelete(expense); }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
