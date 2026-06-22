"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2, ArrowRightLeft } from "lucide-react";
import { Expense, Budget } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ExpenseItemProps {
  expense: Expense;
  budgets: Budget[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
  onReassign?: (expense: Expense) => void;
  selected?: boolean;
  onSelect?: (expense: Expense) => void;
}

export function ExpenseItem({
  expense,
  budgets,
  onEdit,
  onDelete,
  onReassign,
  selected,
  onSelect,
}: ExpenseItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const budget = budgets.find((b) => b.id === expense.budgetId);
  const isOrphaned = !budget;

  return (
    <div
      className={`relative flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border transition-colors ${
        isOrphaned
          ? "border-amber-200 bg-amber-50/30"
          : selected
          ? "border-indigo-300 bg-indigo-50/30"
          : "border-zinc-100"
      }`}
    >
      {/* Select checkbox */}
      {onSelect && (
        <button
          onClick={() => onSelect(expense)}
          className={`flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            selected
              ? "bg-indigo-600 border-indigo-600"
              : "border-zinc-300 bg-white"
          }`}
        >
          {selected && (
            <svg className="h-3 w-3 text-white fill-current" viewBox="0 0 12 12">
              <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      )}

      {/* Avatar */}
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{
          backgroundColor: budget?.color ? `${budget.color}20` : "#fef3c720",
        }}
      >
        <span
          className="text-sm font-bold"
          style={{ color: budget?.color ?? "#d97706" }}
        >
          {expense.name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900 truncate">
          {expense.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: budget?.color ? `${budget.color}18` : "#fef3c740",
              color: budget?.color ?? "#d97706",
            }}
          >
            {isOrphaned ? "Sem orçamento" : expense.budgetName}
          </span>
          <span className="text-xs text-zinc-400">
            {formatDate(new Date(expense.date))}
          </span>
        </div>
        {expense.note && (
          <p className="text-xs text-zinc-400 truncate mt-0.5">{expense.note}</p>
        )}
      </div>

      {/* Value + menu */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <p className="text-sm font-bold text-zinc-900">
          {formatCurrency(expense.value)}
        </p>
        {(onEdit || onDelete || onReassign) && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500 transition-colors ml-1"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 min-w-[140px] rounded-xl bg-white shadow-xl border border-zinc-100 py-1 overflow-hidden">
                  {onReassign && isOrphaned && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onReassign(expense);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5 text-amber-500" />
                      Reatribuir
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(expense);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5 text-indigo-500" />
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(expense);
                      }}
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
