"use client";

import { useState } from "react";
import { SlidersHorizontal, Receipt, X } from "lucide-react";
import { Expense, Budget } from "@/lib/data";
import { ExpenseItem } from "@/components/ExpenseItem";
import { FilterModal, Filters } from "@/components/FilterModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HistoryViewProps {
  expenses: Expense[];
  budgets: Budget[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

const defaultFilters: Filters = { budgetId: "", dateFrom: "", dateTo: "", sortBy: "date_desc" };

export function HistoryView({ expenses, budgets, onEdit, onDelete }: HistoryViewProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const activeFilterCount = [
    filters.budgetId !== "",
    filters.dateFrom !== "",
    filters.dateTo !== "",
    filters.sortBy !== "date_desc",
  ].filter(Boolean).length;

  const filtered = expenses
    .filter((e) => {
      if (filters.budgetId && e.budgetId !== filters.budgetId) return false;
      if (filters.dateFrom && e.date < filters.dateFrom) return false;
      if (filters.dateTo && e.date > filters.dateTo + "T23:59:59") return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === "date_desc") return b.date.localeCompare(a.date);
      if (filters.sortBy === "date_asc") return a.date.localeCompare(b.date);
      if (filters.sortBy === "value_desc") return b.value - a.value;
      if (filters.sortBy === "value_asc") return a.value - b.value;
      return 0;
    });

  function groupByDate(items: Expense[]) {
    const groups: Record<string, Expense[]> = {};
    for (const item of items) {
      const date = item.date.slice(0, 10);
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    }
    return groups;
  }

  const groups = groupByDate(filtered);

  function formatGroupDate(dateStr: string) {
    const date = new Date(dateStr + "T12:00:00");
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === today.toISOString().slice(0, 10)) return "Hoje";
    if (dateStr === yesterday.toISOString().slice(0, 10)) return "Ontem";
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" }).format(date);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-900">
          Histórico
          {filtered.length > 0 && (
            <span className="ml-2 text-xs font-normal text-zinc-400">
              {filtered.length} {filtered.length === 1 ? "despesa" : "despesas"}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button onClick={() => setFilters(defaultFilters)}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors font-medium">
              <X className="h-3 w-3" />Limpar
            </button>
          )}
          <Button variant={activeFilterCount > 0 ? "default" : "outline"} size="sm"
            onClick={() => setFilterOpen(true)} className="gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros
            {activeFilterCount > 0 && (
              <span className={cn("flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold", "bg-white text-indigo-600")}>
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 mb-3">
            <Receipt className="h-7 w-7 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-600 mb-1">Nenhuma despesa encontrada</p>
          <p className="text-xs text-zinc-400">
            {activeFilterCount > 0 ? "Tente ajustar os filtros" : "Adicione sua primeira despesa"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(groups)
            .sort(([a], [b]) => filters.sortBy.startsWith("date_asc") ? a.localeCompare(b) : b.localeCompare(a))
            .map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-zinc-500">{formatGroupDate(date)}</span>
                  <div className="flex-1 h-px bg-zinc-100" />
                  <span className="text-xs text-zinc-400">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      items.reduce((s, i) => s + i.value, 0)
                    )}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((expense) => (
                    <ExpenseItem key={expense.id} expense={expense} budgets={budgets}
                      onEdit={onEdit} onDelete={onDelete} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      <FilterModal open={filterOpen} onClose={() => setFilterOpen(false)}
        budgets={budgets} filters={filters} onApply={setFilters} />
    </div>
  );
}
