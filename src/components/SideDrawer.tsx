"use client";

import { useState } from "react";
import {
  X,
  PiggyBank,
  LayoutDashboard,
  History,
  ChevronRight,
  LogOut,
  Trash2,
  BarChart2,
  Pencil,
  Plus,
  ChevronLeft,
} from "lucide-react";
import { Budget } from "@/lib/data";
import type { User } from "@/lib/auth";
import { cn, formatCurrency, getProgressColor } from "@/lib/utils";

export type AppView =
  | "home"
  | "history"
  | "analysis"
  | "create-budget"
  | "edit-budget";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  budgets: Budget[];
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onEditBudget: (budget: Budget) => void;
  onDeleteBudget: (budget: Budget) => void;
  user: User;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

type Section = "menu" | "budgets";

export function SideDrawer({
  open,
  onClose,
  budgets,
  activeView,
  onNavigate,
  onEditBudget,
  onDeleteBudget,
  user,
  onLogout,
  onDeleteAccount,
}: SideDrawerProps) {
  const [section, setSection] = useState<Section>("menu");

  function handleClose() {
    setSection("menu");
    onClose();
  }

  function navigate(view: AppView) {
    handleClose();
    onNavigate(view);
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
                  onClick={() => navigate("home")}
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
                  onClick={() => navigate("history")}
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
                <button
                  onClick={() => navigate("analysis")}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    activeView === "analysis"
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  <BarChart2 className="h-4 w-4" />
                  Análise
                </button>
              </div>

              <div className="mx-3 my-2 h-px bg-zinc-100" />

              {/* Budgets */}
              <div className="px-3">
                <div className="flex items-center justify-between px-2 mb-1">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Orçamentos
                  </p>
                  <button
                    onClick={() => navigate("create-budget")}
                    className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                    title="Criar orçamento"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {budgets.length === 0 ? (
                  <button
                    onClick={() => navigate("create-budget")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-50 transition-colors"
                  >
                    <PiggyBank className="h-4 w-4" />
                    Criar primeiro orçamento
                  </button>
                ) : (
                  <button
                    onClick={() => setSection("budgets")}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <PiggyBank className="h-4 w-4" />
                      Gerenciar Orçamentos
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">
                        {budgets.length}
                      </span>
                      <ChevronRight className="h-4 w-4 text-zinc-400" />
                    </div>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Budget management section */
            <div className="py-3">
              <div className="px-3 mb-3 flex items-center gap-2">
                <button
                  onClick={() => setSection("menu")}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-zinc-900">
                  Orçamentos
                </span>
              </div>

              <div className="px-3">
                <button
                  onClick={() => navigate("create-budget")}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors mb-1"
                >
                  <Plus className="h-4 w-4" />
                  Criar novo orçamento
                </button>

                {budgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-zinc-50 transition-colors"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: budget.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-zinc-800 truncate">
                          {budget.name}
                        </p>
                        <span className="text-[10px] text-zinc-400 bg-zinc-100 rounded px-1 flex-shrink-0">
                          {budget.period}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        {formatCurrency(budget.spent)} /{" "}
                        {formatCurrency(budget.limit)}
                      </p>
                      <div className="mt-1 h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getProgressColor(Math.min((budget.spent / budget.limit) * 100, 100))}`}
                          style={{ width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleClose();
                        onEditBudget(budget);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        handleClose();
                        onDeleteBudget(budget);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User footer */}
        <div className="border-t border-zinc-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100">
              <span className="text-xs font-bold text-indigo-700">
                {userInitials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-zinc-400 truncate">{user.email}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onDeleteAccount}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Excluir conta"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
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
    </div>
  );
}
