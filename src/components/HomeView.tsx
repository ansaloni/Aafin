"use client";

import { useState, useMemo } from "react";
import { Budget, BudgetPeriod, Expense } from "@/lib/data";
import { BudgetCard } from "@/components/BudgetCard";
import { formatCurrency, cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

type HomePeriod = "day" | "week" | "month" | "year";

interface HomeViewProps {
  budgets: Budget[];
  expenses: Expense[];
  onBudgetClick?: (budgetId: string) => void;
  onOverallClick?: () => void;
}

const PERIODS: { value: HomePeriod; label: string }[] = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
  { value: "year", label: "Ano" },
];

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function budgetPeriodDays(period: BudgetPeriod, ref: Date): number {
  if (period === "Diário") return 1;
  if (period === "Semanal") return 7;
  if (period === "Mensal") return getDaysInMonth(ref);
  return 365; // Anual
}

function viewPeriodDays(period: HomePeriod, ref: Date): number {
  if (period === "day") return 1;
  if (period === "week") return 7;
  if (period === "month") return getDaysInMonth(ref);
  return 365;
}

function periodsMatch(budgetPeriod: BudgetPeriod, viewPeriod: HomePeriod): boolean {
  return (
    (budgetPeriod === "Diário" && viewPeriod === "day") ||
    (budgetPeriod === "Semanal" && viewPeriod === "week") ||
    (budgetPeriod === "Mensal" && viewPeriod === "month") ||
    (budgetPeriod === "Anual" && viewPeriod === "year")
  );
}

function periodBoundaryStart(date: Date, period: BudgetPeriod): Date {
  if (period === "Diário") {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === "Semanal") {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay()); // Sunday
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === "Mensal") {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  return new Date(date.getFullYear(), 0, 1); // Anual
}

function nextPeriodBoundary(start: Date, period: BudgetPeriod): Date {
  if (period === "Diário") {
    const d = new Date(start);
    d.setDate(d.getDate() + 1);
    return d;
  }
  if (period === "Semanal") {
    const d = new Date(start);
    d.setDate(d.getDate() + 7);
    return d;
  }
  if (period === "Mensal") {
    return new Date(start.getFullYear(), start.getMonth() + 1, 1);
  }
  return new Date(start.getFullYear() + 1, 0, 1); // Anual
}

function computeRollover(
  budget: Budget,
  allExpenses: Expense[],
  currentPeriodStart: Date
): number {
  const budgetExpenses = allExpenses.filter((e) => e.budgetId === budget.id);
  const startStr =
    budget.createdAt ??
    (budgetExpenses.length > 0
      ? budgetExpenses.reduce(
          (m, e) => (e.date < m ? e.date : m),
          budgetExpenses[0].date
        )
      : null);
  if (!startStr) return 0;

  let cursor = periodBoundaryStart(new Date(startStr), budget.period);
  let rollover = 0;

  while (cursor < currentPeriodStart) {
    const next = nextPeriodBoundary(cursor, budget.period);
    const spent = budgetExpenses
      .filter((e) => e.date >= cursor.toISOString() && e.date < next.toISOString())
      .reduce((s, e) => s + e.value, 0);
    rollover += budget.limit - spent;
    cursor = next;
  }

  return rollover;
}

function getPeriodStart(period: HomePeriod): string {
  const now = new Date();
  if (period === "day") {
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);
    return from.toISOString();
  }
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

export function HomeView({
  budgets,
  expenses,
  onBudgetClick,
  onOverallClick,
}: HomeViewProps) {
  const [period, setPeriod] = useState<HomePeriod>("month");

  const periodStart = useMemo(() => getPeriodStart(period), [period]);

  const budgetsWithPeriodSpent = useMemo(() => {
    const now = new Date();
    const currentPeriodStart = new Date(periodStart);
    return budgets.map((b) => {
      const periodSpent = expenses
        .filter((e) => e.budgetId === b.id && e.date >= periodStart)
        .reduce((s, e) => s + e.value, 0);

      let effectiveLimit: number;
      if (periodsMatch(b.period, period)) {
        const rollover = b.cumulative
          ? computeRollover(b, expenses, currentPeriodStart)
          : 0;
        effectiveLimit = b.limit + rollover;
      } else {
        effectiveLimit =
          b.limit *
          (viewPeriodDays(period, now) / budgetPeriodDays(b.period, now));
      }

      return { ...b, spent: periodSpent, limit: effectiveLimit };
    });
  }, [budgets, expenses, period, periodStart]);

  const totalSpent = budgetsWithPeriodSpent.reduce((s, b) => s + b.spent, 0);
  const totalLimit = budgetsWithPeriodSpent.reduce((s, b) => s + b.limit, 0);
  const totalRemaining = totalLimit - totalSpent;
  const overallPercent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  const periodLabel = PERIODS.find((p) => p.value === period)?.label ?? "";

  return (
    <div className="flex flex-col gap-4">
      {/* Period Selector */}
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

      {/* Summary Card */}
      <div
        className={cn(
          "bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-5 text-white shadow-lg shadow-indigo-200 transition-all",
          onOverallClick &&
            "cursor-pointer hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.99]"
        )}
        onClick={onOverallClick}
      >
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="h-4 w-4 opacity-80" />
          <span className="text-sm opacity-80 font-medium">
            Total Gasto — {periodLabel}
          </span>
        </div>
        <p className="text-3xl font-bold mb-4">{formatCurrency(totalSpent)}</p>
        <div className="relative h-2 w-full bg-white/25 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-700"
            style={{ width: `${Math.min(overallPercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <div className="flex items-center gap-1 text-xs opacity-75">
            <TrendingDown className="h-3 w-3" />
            <span>Gasto: {overallPercent.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1 text-xs opacity-75">
            <TrendingUp className="h-3 w-3" />
            <span>Limite: {formatCurrency(totalLimit)}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/20 flex justify-between">
          <span className="text-xs opacity-75">Disponível</span>
          <span className="text-sm font-semibold">
            {totalRemaining >= 0
              ? formatCurrency(totalRemaining)
              : `- ${formatCurrency(Math.abs(totalRemaining))}`}
          </span>
        </div>
      </div>

      {/* Budget list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-zinc-900">Orçamentos</h2>
          <span className="text-xs text-zinc-400">{budgets.length} ativos</span>
        </div>

        {budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 mb-3">
              <Wallet className="h-7 w-7 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-600 mb-1">
              Nenhum orçamento criado
            </p>
            <p className="text-xs text-zinc-400">
              Abra o menu para criar seu primeiro orçamento
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {budgetsWithPeriodSpent.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onClick={onBudgetClick ? () => onBudgetClick(budget.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
