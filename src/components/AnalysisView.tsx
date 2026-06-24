"use client";

import { useState, useMemo } from "react";
import { TrendingDown } from "lucide-react";
import { Expense, Budget } from "@/lib/data";
import { formatCurrency, cn } from "@/lib/utils";

interface AnalysisViewProps {
  expenses: Expense[];
  budgets: Budget[];
  initialBudgetId?: string | null;
}

type Period = "week" | "month" | "year" | "all";

const PERIODS: { value: Period; label: string }[] = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
  { value: "year", label: "Ano" },
  { value: "all", label: "Tudo" },
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getPeriodStart(period: Period): string | null {
  if (period === "all") return null;
  const now = new Date();
  if (period === "week") {
    const from = new Date(now);
    from.setDate(from.getDate() - from.getDay()); // Sunday
    from.setHours(0, 0, 0, 0);
    return from.toISOString();
  }
  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }
  return new Date(now.getFullYear(), 0, 1).toISOString();
}

export function AnalysisView({
  expenses,
  budgets,
  initialBudgetId,
}: AnalysisViewProps) {
  const [period, setPeriod] = useState<Period>("month");
  const [budgetFilter, setBudgetFilter] = useState<string>(
    initialBudgetId ?? ""
  );

  const filtered = useMemo(() => {
    const start = getPeriodStart(period);
    return expenses.filter((e) => {
      if (start && e.date < start) return false;
      if (budgetFilter && e.budgetId !== budgetFilter) return false;
      return true;
    });
  }, [expenses, period, budgetFilter]);

  const totalSpent = filtered.reduce((s, e) => s + e.value, 0);

  const byBudget = useMemo(() => {
    const map: Record<
      string,
      { name: string; value: number; color: string; id: string }
    > = {};
    for (const e of filtered) {
      if (!map[e.budgetId]) {
        const b = budgets.find((b) => b.id === e.budgetId);
        map[e.budgetId] = {
          id: e.budgetId,
          name: b?.name ?? e.budgetName ?? "Sem orçamento",
          value: 0,
          color: b?.color ?? "#94a3b8",
        };
      }
      map[e.budgetId].value += e.value;
    }
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [filtered, budgets]);

  const maxBudgetSpent = Math.max(...byBudget.map((b) => b.value), 1);

  const timeData = useMemo(() => {
    const now = new Date();
    if (period === "year") {
      return Array.from({ length: 12 }, (_, i) => {
        const monthStr = `${now.getFullYear()}-${String(i + 1).padStart(2, "0")}`;
        const d = new Date(now.getFullYear(), i, 1);
        const value = filtered
          .filter((e) => e.date.slice(0, 7) === monthStr)
          .reduce((s, e) => s + e.value, 0);
        return {
          label: d.toLocaleString("pt-BR", { month: "short" }).replace(".", ""),
          value,
        };
      });
    }

    // Week and month both show last 7 days
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const isToday = i === 6;
      const label = isToday
        ? "Hoje"
        : period === "week"
        ? WEEKDAYS[d.getDay()]
        : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      const value = filtered
        .filter((e) => e.date.slice(0, 10) === dateStr)
        .reduce((s, e) => s + e.value, 0);
      return { label, value };
    });
  }, [filtered, period]);

  const maxValue = Math.max(...timeData.map((d) => d.value), 1);
  const topExpenses = [...filtered].sort((a, b) => b.value - a.value).slice(0, 5);

  const chartTitle =
    period === "year"
      ? "Gasto por Mês"
      : period === "week"
      ? "Esta Semana"
      : "Últimos 7 dias";

  return (
    <div className="flex flex-col gap-5">
      {/* Period tabs */}
      <div className="flex gap-1 bg-zinc-100 rounded-xl p-1">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={cn(
              "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
              period === p.value
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Budget filter pills */}
      {budgets.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setBudgetFilter("")}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
              budgetFilter === ""
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-zinc-600 border-zinc-200"
            )}
          >
            Todos
          </button>
          {budgets.map((b) => (
            <button
              key={b.id}
              onClick={() =>
                setBudgetFilter(budgetFilter === b.id ? "" : b.id)
              }
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                budgetFilter === b.id
                  ? "text-white border-transparent"
                  : "bg-white text-zinc-600 border-zinc-200"
              )}
              style={
                budgetFilter === b.id
                  ? { backgroundColor: b.color, borderColor: b.color }
                  : {}
              }
            >
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: b.color }}
              />
              {b.name}
            </button>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-4 text-white">
        <p className="text-xs opacity-75 font-medium mb-1">Total no período</p>
        <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
        <p className="text-xs opacity-60 mt-1">
          {filtered.length}{" "}
          {filtered.length === 1 ? "despesa" : "despesas"}
        </p>
      </div>

      {/* Budget comparison chart */}
      {byBudget.length > 1 && !budgetFilter && (
        <div className="bg-white rounded-2xl p-4 border border-zinc-100">
          <h3 className="text-sm font-bold text-zinc-900 mb-3">
            Comparativo por Orçamento
          </h3>
          <div className="flex items-end gap-2" style={{ height: "110px" }}>
            {byBudget.map((item) => {
              const budget = budgets.find((b) => b.id === item.id);
              const heightPct =
                maxBudgetSpent > 0
                  ? (item.value / maxBudgetSpent) * 100
                  : 0;
              const limitPct =
                budget && maxBudgetSpent > 0
                  ? Math.min((budget.limit / maxBudgetSpent) * 100, 100)
                  : 100;
              return (
                <div
                  key={item.id}
                  className="flex flex-col items-center gap-1 flex-1 min-w-0"
                >
                  <div
                    className="relative w-full flex items-end justify-center"
                    style={{ height: "76px" }}
                  >
                    {/* Limit ghost bar */}
                    {budget && (
                      <div
                        className="absolute bottom-0 w-full max-w-[28px] rounded-t"
                        style={{
                          height: `${limitPct}%`,
                          backgroundColor: item.color,
                          opacity: 0.15,
                        }}
                      />
                    )}
                    {/* Spent bar */}
                    <div
                      className="relative w-full max-w-[28px] rounded-t transition-all duration-500"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: item.color,
                        minHeight: item.value > 0 ? "3px" : "0",
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-zinc-500 truncate w-full text-center leading-tight">
                    {item.name.split(" ")[0]}
                  </span>
                  <span
                    className="text-[9px] font-bold leading-none"
                    style={{ color: item.color }}
                  >
                    {formatCurrency(item.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Time-series bar chart */}
      {timeData.some((d) => d.value > 0) && (
        <div className="bg-white rounded-2xl p-4 border border-zinc-100">
          <h3 className="text-sm font-bold text-zinc-900 mb-3">{chartTitle}</h3>
          <div className="flex items-end gap-1" style={{ height: "120px" }}>
            {timeData.map((d, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 flex-1 min-w-0"
              >
                <div
                  className="w-full flex items-end justify-center"
                  style={{ height: "90px" }}
                >
                  <div
                    className="w-full max-w-[28px] rounded-t bg-indigo-500 transition-all"
                    style={{
                      height: `${(d.value / maxValue) * 100}%`,
                      minHeight: d.value > 0 ? "3px" : "0",
                      opacity: d.value > 0 ? 1 : 0.1,
                    }}
                  />
                </div>
                <span className="text-[9px] text-zinc-400 truncate w-full text-center leading-none">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By budget (proportion breakdown) */}
      {byBudget.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-zinc-100">
          <h3 className="text-sm font-bold text-zinc-900 mb-3">
            Por Orçamento
          </h3>
          <div className="flex flex-col gap-3">
            {byBudget.map((item) => (
              <div key={item.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-medium text-zinc-700 truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-xs text-zinc-400">
                      {totalSpent > 0
                        ? ((item.value / totalSpent) * 100).toFixed(0)
                        : 0}
                      %
                    </span>
                    <span className="text-xs font-bold text-zinc-700">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        totalSpent > 0 ? (item.value / totalSpent) * 100 : 0
                      }%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top expenses */}
      {topExpenses.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-zinc-100">
          <h3 className="text-sm font-bold text-zinc-900 mb-3">
            Maiores Despesas
          </h3>
          <div className="flex flex-col gap-3">
            {topExpenses.map((expense) => {
              const b = budgets.find((b) => b.id === expense.budgetId);
              return (
                <div key={expense.id} className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 flex-shrink-0 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${b?.color ?? "#94a3b8"}20`,
                    }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: b?.color ?? "#94a3b8" }}
                    >
                      {expense.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-800 truncate">
                      {expense.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {b?.name ?? expense.budgetName ?? "Sem orçamento"}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-zinc-700 flex-shrink-0">
                    {formatCurrency(expense.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 mb-3">
            <TrendingDown className="h-7 w-7 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-600 mb-1">
            Nenhuma despesa no período
          </p>
          <p className="text-xs text-zinc-400">
            Tente selecionar outro período ou filtro
          </p>
        </div>
      )}
    </div>
  );
}
