"use client";

import { useState } from "react";
import { X, PiggyBank, LayoutDashboard, History, ChevronRight, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Budget, BudgetPeriod, BUDGET_COLORS } from "@/lib/data";
import type { User } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreateBudget: (budget: Omit<Budget, "id" | "spent">) => void;
  activeView: "home" | "history";
  onNavigate: (view: "home" | "history") => void;
  user: User;
  onLogout: () => void;
}

const periodOptions: { value: BudgetPeriod; label: string }[] = [
  { value: "Diário", label: "Diário" },
  { value: "Semanal", label: "Semanal" },
  { value: "Mensal", label: "Mensal" },
  { value: "Anual", label: "Anual" },
];

const initialForm = {
  name: "",
  limit: "",
  period: "Mensal" as BudgetPeriod,
  cumulative: false,
  color: BUDGET_COLORS[0],
};

export function SideDrawer({
  open,
  onClose,
  onCreateBudget,
  activeView,
  onNavigate,
  user,
  onLogout,
}: SideDrawerProps) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [section, setSection] = useState<"menu" | "create">("menu");

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Nome é obrigatório";
    if (!form.limit || isNaN(Number(form.limit)) || Number(form.limit) <= 0)
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
    onCreateBudget({
      name: form.name.trim(),
      limit: Number(form.limit),
      period: form.period,
      cumulative: form.cumulative,
      color: form.color,
    });
    setForm(initialForm);
    setErrors({});
    setSection("menu");
    onClose();
  }

  function handleClose() {
    setSection("menu");
    setErrors({});
    onClose();
  }

  const userInitials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative z-10 flex h-full w-[300px] max-w-[85vw] flex-col bg-white shadow-2xl animate-slide-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
              <PiggyBank className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-zinc-900">Grana</span>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {section === "menu" ? (
            <div className="py-3">
              {/* Navigation */}
              <div className="px-3 mb-3">
                <p className="px-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Navegação
                </p>
                <button
                  onClick={() => {
                    onNavigate("home");
                    handleClose();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    activeView === "home"
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Visão Geral
                </button>
                <button
                  onClick={() => {
                    onNavigate("history");
                    handleClose();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    activeView === "history"
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  <History className="h-4 w-4" />
                  Histórico
                </button>
              </div>

              <div className="mx-3 my-2 h-px bg-zinc-100" />

              {/* Budgets */}
              <div className="px-3">
                <p className="px-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Orçamentos
                </p>
                <button
                  onClick={() => setSection("create")}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <PiggyBank className="h-4 w-4" />
                    Criar Orçamento
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4">
              <button
                onClick={() => setSection("menu")}
                className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium mb-4 hover:text-indigo-700 transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                Voltar ao menu
              </button>

              <h3 className="text-base font-bold text-zinc-900 mb-4">Criar Orçamento</h3>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  type="number"
                  inputMode="decimal"
                  placeholder="0,00"
                  min="0.01"
                  step="0.01"
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

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-700">Cor</label>
                  <div className="flex gap-2 flex-wrap">
                    {BUDGET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, color }))}
                        className={cn(
                          "h-7 w-7 rounded-full transition-all",
                          form.color === color
                            ? "ring-2 ring-offset-2 ring-zinc-900 scale-110"
                            : "hover:scale-105"
                        )}
                        style={{ backgroundColor: color }}
                      />
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
                    onClick={() => setSection("menu")}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" className="flex-1">
                    Criar
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* User footer */}
        <div className="border-t border-zinc-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100">
              <span className="text-xs font-bold text-indigo-700">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 truncate">{user.name}</p>
              <p className="text-xs text-zinc-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}