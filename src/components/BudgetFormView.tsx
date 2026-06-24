"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Budget, BudgetPeriod, BUDGET_COLORS } from "@/lib/data";
import { BudgetCard } from "@/components/BudgetCard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BudgetFormViewProps {
  mode: "create" | "edit";
  budget?: Budget | null;
  onSubmit: (data: Omit<Budget, "id" | "spent">) => void;
  onCancel: () => void;
}

const periodOptions: { value: BudgetPeriod; label: string }[] = [
  { value: "Diário", label: "Diário" },
  { value: "Semanal", label: "Semanal" },
  { value: "Mensal", label: "Mensal" },
  { value: "Anual", label: "Anual" },
];

const emptyForm = {
  name: "",
  limit: "",
  period: "Mensal" as BudgetPeriod,
  cumulative: false,
  color: BUDGET_COLORS[0],
};

export function BudgetFormView({
  mode,
  budget,
  onSubmit,
  onCancel,
}: BudgetFormViewProps) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && budget) {
      setForm({
        name: budget.name,
        limit: budget.limit.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        period: budget.period,
        cumulative: budget.cumulative,
        color: budget.color,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [mode, budget]);

  const parsedLimit = parseFloat(form.limit.replace(",", "."));

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Nome é obrigatório";
    if (!form.limit || isNaN(parsedLimit) || parsedLimit <= 0)
      errs.limit = "Insira um valor válido";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({
      name: form.name.trim(),
      limit: parsedLimit,
      period: form.period,
      cumulative: form.cumulative,
      color: form.color,
      createdAt:
        mode === "create"
          ? new Date().toISOString()
          : (budget?.createdAt ?? undefined),
    });
  }

  const previewBudget: Budget = {
    id: "preview",
    name: form.name || "Nome do orçamento",
    limit: isNaN(parsedLimit) || parsedLimit <= 0 ? 0 : parsedLimit,
    spent: 0,
    period: form.period,
    cumulative: form.cumulative,
    color: form.color,
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Live preview */}
      <div>
        <p className="text-xs font-medium text-zinc-400 mb-2">Pré-visualização</p>
        <div className="pointer-events-none">
          <BudgetCard budget={previewBudget} />
        </div>
      </div>

      <Input
        label="Nome do Orçamento"
        placeholder="Ex: Alimentação, Lazer..."
        value={form.name}
        onChange={(e) => {
          setForm((p) => ({ ...p, name: e.target.value }));
          if (errors.name) setErrors((p) => ({ ...p, name: "" }));
        }}
        error={errors.name}
        autoFocus
      />

      <Input
        label="Valor Limite (R$)"
        type="text"
        inputMode="decimal"
        placeholder="0,00"
        value={form.limit}
        onChange={(e) => {
          setForm((p) => ({ ...p, limit: e.target.value }));
          if (errors.limit) setErrors((p) => ({ ...p, limit: "" }));
        }}
        error={errors.limit}
      />

      <Select
        label="Prazo"
        options={periodOptions}
        value={form.period}
        onChange={(e) =>
          setForm((p) => ({ ...p, period: e.target.value as BudgetPeriod }))
        }
      />

      {/* Section divider */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-zinc-100" />
        <span className="text-xs text-zinc-400 font-medium">Aparência</span>
        <div className="h-px flex-1 bg-zinc-100" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700">Cor</label>
        <div className="flex gap-3 flex-wrap">
          {BUDGET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setForm((p) => ({ ...p, color }))}
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center transition-transform hover:scale-105",
                form.color === color ? "scale-110" : ""
              )}
              style={{ backgroundColor: color }}
            >
              {form.color === color && (
                <Check
                  className="h-4 w-4 text-white"
                  style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <Switch
        label="Orçamento Cumulativo"
        description="Saldo restante acumula para o próximo período"
        checked={form.cumulative}
        onCheckedChange={(v) => setForm((p) => ({ ...p, cumulative: v }))}
      />

      <div className="flex gap-3 pt-1 pb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit" size="sm" className="flex-1">
          {mode === "create" ? "Criar" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
