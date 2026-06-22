"use client";

import { useState } from "react";
import { Menu, Plus, LayoutDashboard, History } from "lucide-react";
import { Budget, Expense, initialBudgets, initialExpenses } from "@/lib/data";
import { HomeView } from "@/components/HomeView";
import { HistoryView } from "@/components/HistoryView";
import { NewExpenseModal } from "@/components/NewExpenseModal";
import { SideDrawer } from "@/components/SideDrawer";
import { cn } from "@/lib/utils";

type View = "home" | "history";

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);

  function handleAddExpense(expense: Omit<Expense, "id">) {
    const id = `e${Date.now()}`;
    setExpenses((prev) => [{ ...expense, id }, ...prev]);
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === expense.budgetId ? { ...b, spent: b.spent + expense.value } : b
      )
    );
  }

  function handleCreateBudget(budget: Omit<Budget, "id" | "spent">) {
    const id = `b${Date.now()}`;
    setBudgets((prev) => [...prev, { ...budget, id, spent: 0 }]);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-[430px] min-h-screen relative bg-zinc-50 flex flex-col shadow-2xl">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-white/90 backdrop-blur-md border-b border-zinc-100">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-zinc-900">
            {view === "home" ? "Visão Geral" : "Histórico"}
          </h1>
          <div className="w-9" />
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 pt-5 pb-28 overflow-y-auto">
          {view === "home" ? (
            <HomeView
              budgets={budgets}
              totalSpent={totalSpent}
              totalLimit={totalLimit}
            />
          ) : (
            <HistoryView expenses={expenses} budgets={budgets} />
          )}
        </main>

        {/* Bottom navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 bg-white/95 backdrop-blur-md border-t border-zinc-100">
          <div className="flex items-center justify-around px-4 pt-2 pb-4">
            <button
              onClick={() => setView("home")}
              className={cn(
                "flex flex-col items-center gap-1 px-6 py-1.5 rounded-xl transition-all",
                view === "home" ? "text-indigo-600" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Início</span>
            </button>

            <button
              onClick={() => setExpenseModalOpen(true)}
              className="flex h-14 w-14 -mt-7 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-300 hover:bg-indigo-700 active:scale-95 transition-all"
              aria-label="Nova Despesa"
            >
              <Plus className="h-6 w-6" strokeWidth={2.5} />
            </button>

            <button
              onClick={() => setView("history")}
              className={cn(
                "flex flex-col items-center gap-1 px-6 py-1.5 rounded-xl transition-all",
                view === "history" ? "text-indigo-600" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <History className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Histórico</span>
            </button>
          </div>
        </nav>

        <SideDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onCreateBudget={handleCreateBudget}
          activeView={view}
          onNavigate={setView}
        />

        <NewExpenseModal
          open={expenseModalOpen}
          onClose={() => setExpenseModalOpen(false)}
          budgets={budgets}
          onAdd={handleAddExpense}
        />
      </div>
    </div>
  );
}
