"use client";

import { useState } from "react";
import { MoreVertical, Pencil } from "lucide-react";
import { Budget } from "@/lib/data";
import { formatCurrency, getProgressColor, getProgressTextColor } from "@/lib/utils";

interface BudgetCardProps {
  budget: Budget;
  onEdit?: (budget: Budget) => void;
}

export function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const percent = Math.min((budget.spent / budget.limit) * 100, 100);
  const remaining = budget.limit - budget.spent;
  const progressColor = getProgressColor(percent);
  const textColor = getProgressTextColor(percent);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-block h-3 w-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: budget.color }}
          />
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">{budget.name}</h3>
            <span className="text-xs text-zinc-400">{budget.period}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="text-right mr-1">
            <p className={`text-sm font-bold ${textColor}`}>
              {formatCurrency(budget.spent)}
            </p>
            <p className="text-xs text-zinc-400">de {formatCurrency(budget.limit)}</p>
          </div>
          {onEdit && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500 transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 z-20 min-w-[130px] rounded-xl bg-white shadow-xl border border-zinc-100 py-1 overflow-hidden">
                    <button
                      onClick={() => { setMenuOpen(false); onEdit(budget); }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5 text-indigo-500" />
                      Editar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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
