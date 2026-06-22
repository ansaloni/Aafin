"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Budget } from "@/lib/data";

export interface Filters {
  budgetId: string;
  dateFrom: string;
  dateTo: string;
  sortBy: "date_desc" | "date_asc" | "value_desc" | "value_asc";
}

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  budgets: Budget[];
  filters: Filters;
  onApply: (filters: Filters) => void;
}

export function FilterModal({ open, onClose, budgets, filters, onApply }: FilterModalProps) {
  const [local, setLocal] = useState<Filters>(filters);

  const budgetOptions = [
    { value: "", label: "Todos os orçamentos" },
    ...budgets.map((b) => ({ value: b.id, label: b.name })),
  ];

  const sortOptions = [
    { value: "date_desc", label: "Data (mais recente)" },
    { value: "date_asc", label: "Data (mais antiga)" },
    { value: "value_desc", label: "Valor (maior)" },
    { value: "value_asc", label: "Valor (menor)" },
  ];

  function handleApply() {
    onApply(local);
    onClose();
  }

  function handleClear() {
    const cleared: Filters = { budgetId: "", dateFrom: "", dateTo: "", sortBy: "date_desc" };
    setLocal(cleared);
    onApply(cleared);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Filtrar Despesas">
      <div className="flex flex-col gap-4">
        <Select
          label="Orçamento"
          options={budgetOptions}
          value={local.budgetId}
          onChange={(e) => setLocal((p) => ({ ...p, budgetId: e.target.value }))}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700">De</label>
          <input
            type="date"
            value={local.dateFrom}
            onChange={(e) => setLocal((p) => ({ ...p, dateFrom: e.target.value }))}
            className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700">Até</label>
          <input
            type="date"
            value={local.dateTo}
            onChange={(e) => setLocal((p) => ({ ...p, dateTo: e.target.value }))}
            className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <Select
          label="Ordenar por"
          options={sortOptions}
          value={local.sortBy}
          onChange={(e) =>
            setLocal((p) => ({ ...p, sortBy: e.target.value as Filters["sortBy"] }))
          }
        />

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={handleClear}>
            Limpar
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Aplicar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
