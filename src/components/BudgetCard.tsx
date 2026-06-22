"use client";

import { Budget } from "@/lib/data";
import { formatCurrency, getProgressColor, getProgressTextColor } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface BudgetCardProps {
  budget: Budget;
  onClick?: () => void;
}

export function BudgetCard({ budget, onClick }: BudgetCardProps) {
  const percent = Math.min((budget.spent / budget.limit) * 100, 100);
  const remaining = budget.limit - budget.spent;
  const progressColor = getProgressColor(percent);
  const textColor = getProgressTextColor(percent);

  return (
    <div
      className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 cursor-pointer hover:shadow-md hover:border-zinc-200 transition-all active:scale-[0.99]"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-block h-3 w-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: budget.color }}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-zinc-900">
                {budget.name}
              </h3>
              {budget.cumulative && (
                <span title="Cumulativo">
                  <RefreshCw className="h-3 w-3 text-zinc-400" />
                </span>
              )}
            </div>
            <span className="text-xs text-zinc-400">{budget.period}</span>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-bold ${textColor}`}>
            {formatCurrency(budget.spent)}
          </p>
          <p className="text-xs text-zinc-400">de {formatCurrency(budget.limit)}</p>
        </div>
      </div>

      <div className="relative h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className={`text-xs font-medium ${textColor}`}>
          {percent.toFixed(0)}% usado
        </span>
        <span className="text-xs text-zinc-500">
          {remaining >= 0
            ? `${formatCurrency(remaining)} restante`
            : `${formatCurrency(Math.abs(remaining))} excedido`}
        </span>
      </div>

      {percent >= 90 && (
        <div className="mt-2.5 flex items-center gap-1.5 bg-red-50 text-red-600 rounded-lg px-3 py-1.5">
          <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 5a1 1 0 011 1v3a1 1 0 11-2 0V8a1 1 0 011-1zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
          </svg>
          <span className="text-xs font-medium">Orçamento quase esgotado</span>
        </div>
      )}
    </div>
  );
}
