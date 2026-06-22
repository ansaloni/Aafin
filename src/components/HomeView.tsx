"use client";

import { Budget } from "@/lib/data";
import { BudgetCard } from "@/components/BudgetCard";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

interface HomeViewProps {
  budgets: Budget[];
  totalSpent: number;
  totalLimit: number;
}

export function HomeView({ budgets, totalSpent, totalLimit }: HomeViewProps) {
  const totalRemaining = totalLimit - totalSpent;
  const overallPercent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-5 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="h-4 w-4 opacity-80" />
          <span className="text-sm opacity-80 font-medium">Total Gasto este Mês</span>
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
            <p className="text-sm font-medium text-zinc-600 mb-1">Nenhum orçamento criado</p>
            <p className="text-xs text-zinc-400">Abra o menu e crie seu primeiro orçamento</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {budgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
