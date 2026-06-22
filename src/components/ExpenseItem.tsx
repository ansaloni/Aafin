"use client";

import { Expense, Budget } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ExpenseItemProps {
  expense: Expense;
  budgets: Budget[];
}

export function ExpenseItem({ expense, budgets }: ExpenseItemProps) {
  const budget = budgets.find((b) => b.id === expense.budgetId);

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: budget?.color ? `${budget.color}20` : "#f4f4f5" }}
      >
        <span
          className="text-sm font-bold"
          style={{ color: budget?.color ?? "#71717a" }}
        >
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
          <span className="text-xs text-zinc-400">
            {formatDate(new Date(expense.date))}
          </span>
        </div>
        {expense.note && (
          <p className="text-xs text-zinc-400 truncate mt-0.5">{expense.note}</p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-zinc-900">
          {formatCurrency(expense.value)}
        </p>
      </div>
    </div>
  );
}
