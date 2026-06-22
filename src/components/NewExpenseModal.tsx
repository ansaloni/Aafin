"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Budget, Expense } from "@/lib/data";

interface NewExpenseModalProps {
  open: boolean;
  onClose: () => void;
  budgets: Budget[];
  onAdd: (expense: Omit<Expense, "id">) => void;
}

function getCurrentDateTimeLocal() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function NewExpenseModal({ open, onClose, budgets, onAdd }: NewExpenseModalProps) {
  const [form, setForm] = useState({
    name: "",
    value: "",
    budgetId: "",
    note: "",
    date: getCurrentDateTimeLocal(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const budgetOptions = budgets.map((b) => ({ value: b.id, label: b.name }));

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Nome é obrigatório";
    if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0)
      errs.value = "Insira um valor válido";
    if (!form.budgetId) errs.budgetId = "Selecione um orçamento";
    if (!form.date) errs.date = "Data é obrigatória";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const budget = budgets.find((b) => b.id === form.budgetId);
    onAdd({
      name: form.name.trim(),
      value: Number(form.value),
      budgetId: form.budgetId,
      budgetName: budget?.name ?? "",
      note: form.note.trim(),
      date: new Date(form.date).toISOString(),
    });
    setForm({ name: "", value: "", budgetId: "", note: "", date: getCurrentDateTimeLocal() });
    setErrors({});
    onClose();
  }

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova Despesa">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome"
          placeholder="Ex: Supermercado, Uber..."
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          autoFocus
        />

        <Input
          label="Valor (R$)"
          type="number"
          inputMode="decimal"
          placeholder="0,00"
          min="0.01"
          step="0.01"
          value={form.value}
          onChange={(e) => handleChange("value", e.target.value)}
          error={errors.value}
        />

        <Select
          label="Orçamento"
          placeholder="Selecione um orçamento"
          options={budgetOptions}
          value={form.budgetId}
          onChange={(e) => handleChange("budgetId", e.target.value)}
          error={errors.budgetId}
        />

        <Textarea
          label="Observação"
          placeholder="Alguma anotação sobre esta despesa..."
          value={form.note}
          onChange={(e) => handleChange("note", e.target.value)}
          rows={3}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700">Data e Hora</label>
          <input
            type="datetime-local"
            value={form.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
        </div>

        <div className="flex gap-3 pt-2 pb-1">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1">
            Salvar Despesa
          </Button>
        </div>
      </form>
    </Modal>
  );
}
