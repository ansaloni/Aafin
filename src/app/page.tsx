"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, Plus, LayoutDashboard, History } from "lucide-react";
import { Budget, Expense } from "@/lib/data";
import { HomeView } from "@/components/HomeView";
import { HistoryView } from "@/components/HistoryView";
import { NewExpenseModal } from "@/components/NewExpenseModal";
import { EditExpenseModal } from "@/components/EditExpenseModal";
import { SideDrawer } from "@/components/SideDrawer";
import { Toast, ToastData } from "@/components/Toast";
import { LoginView } from "@/components/LoginView";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { useNotifications } from "@/hooks/useNotifications";
import { getSession, logout as authLogout, deleteAccount as authDeleteAccount } from "@/lib/auth";
import type { User } from "@/lib/auth";
import { cn } from "@/lib/utils";

type View = "home" | "history";

const bKey = (uid: string) => `grana:budgets:${uid}`;
const eKey = (uid: string) => `grana:expenses:${uid}`;
const oKey = (uid: string) => `grana:onboarded:${uid}`;

export default function App() {
  const [authLoaded, setAuthLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const { requestPermission, notifyBudgetAlert, permissionStatus } = useNotifications();

  const showToast = useCallback(
    (message: string, type: ToastData["type"] = "success") => {
      setToast({ message, type });
    },
    []
  );

  function loadUserData(uid: string) {
    try {
      const b = localStorage.getItem(bKey(uid));
      const e = localStorage.getItem(eKey(uid));
      setBudgets(b ? JSON.parse(b) : []);
      setExpenses(e ? JSON.parse(e) : []);
      // Auto-mark existing users (who already have data) as onboarded
      if (b !== null && !localStorage.getItem(oKey(uid))) {
        localStorage.setItem(oKey(uid), "1");
      }
    } catch {
      setBudgets([]);
      setExpenses([]);
    }
  }

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
      const isOnboarded = localStorage.getItem(oKey(session.id)) === "1";
      loadUserData(session.id);
      if (!isOnboarded) setOnboardingOpen(true);
    }
    setAuthLoaded(true);
  }, []);

  function saveBudgets(uid: string, data: Budget[]) {
    localStorage.setItem(bKey(uid), JSON.stringify(data));
  }

  function saveExpenses(uid: string, data: Expense[]) {
    localStorage.setItem(eKey(uid), JSON.stringify(data));
  }

  function checkThresholds(updated: Budget[], prev: Budget[]) {
    updated.forEach((b) => {
      const old = prev.find((p) => p.id === b.id);
      if (!old) return;
      const oldPct = (old.spent / old.limit) * 100;
      const newPct = (b.spent / b.limit) * 100;
      if (
        (oldPct < 75 && newPct >= 75) ||
        (oldPct < 90 && newPct >= 90) ||
        (oldPct < 100 && newPct >= 100)
      ) {
        notifyBudgetAlert(b.name, newPct);
      }
    });
  }

  function handleLogin(loggedUser: User) {
    setUser(loggedUser);
    const isOnboarded = localStorage.getItem(oKey(loggedUser.id)) === "1";
    loadUserData(loggedUser.id);
    if (!isOnboarded) setOnboardingOpen(true);
  }

  function handleCloseOnboarding() {
    if (user) localStorage.setItem(oKey(user.id), "1");
    setOnboardingOpen(false);
  }

  function handleLogout() {
    authLogout();
    setUser(null);
    setBudgets([]);
    setExpenses([]);
    setDrawerOpen(false);
  }

  function handleDeleteAccount() {
    if (!user) return;
    authDeleteAccount(user.id);
    setUser(null);
    setBudgets([]);
    setExpenses([]);
    setDrawerOpen(false);
    setDeleteAccountOpen(false);
  }

  function handleAddExpense(expense: Omit<Expense, "id">) {
    if (!user) return;
    const newExpense: Expense = { ...expense, id: `e${Date.now()}` };
    const newExpenses = [newExpense, ...expenses];
    const newBudgets = budgets.map((b) =>
      b.id === expense.budgetId ? { ...b, spent: b.spent + expense.value } : b
    );
    setExpenses(newExpenses);
    setBudgets(newBudgets);
    saveExpenses(user.id, newExpenses);
    saveBudgets(user.id, newBudgets);
    checkThresholds(newBudgets, budgets);
    showToast("Despesa adicionada!");
  }

  function handleUpdateExpense(id: string, updated: Omit<Expense, "id">) {
    if (!user) return;
    const old = expenses.find((e) => e.id === id);
    if (!old) return;

    const newExpenses = expenses.map((e) => (e.id === id ? { ...updated, id } : e));
    const newBudgets = budgets.map((b) => {
      const wasSource = b.id === old.budgetId;
      const isSource = b.id === updated.budgetId;
      if (wasSource && isSource) {
        return { ...b, spent: Math.max(0, b.spent - old.value + updated.value) };
      }
      if (wasSource) return { ...b, spent: Math.max(0, b.spent - old.value) };
      if (isSource) return { ...b, spent: b.spent + updated.value };
      return b;
    });

    setExpenses(newExpenses);
    setBudgets(newBudgets);
    saveExpenses(user.id, newExpenses);
    saveBudgets(user.id, newBudgets);
    showToast("Despesa atualizada!");
  }

  function handleDeleteExpense(expense: Expense) {
    if (!user) return;
    const newExpenses = expenses.filter((e) => e.id !== expense.id);
    const newBudgets = budgets.map((b) =>
      b.id === expense.budgetId
        ? { ...b, spent: Math.max(0, b.spent - expense.value) }
        : b
    );
    setExpenses(newExpenses);
    setBudgets(newBudgets);
    saveExpenses(user.id, newExpenses);
    saveBudgets(user.id, newBudgets);
    showToast("Despesa excluída", "info");
  }

  function handleCreateBudget(budget: Omit<Budget, "id" | "spent">) {
    if (!user) return;
    const newBudgets = [...budgets, { ...budget, id: `b${Date.now()}`, spent: 0 }];
    setBudgets(newBudgets);
    saveBudgets(user.id, newBudgets);
    showToast(`Orçamento "${budget.name}" criado!`);
  }

  if (!authLoaded) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);

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

        {/* Content */}
        <main className="flex-1 px-4 pt-5 pb-28 overflow-y-auto">
          {/* Notification banner */}
          {permissionStatus === "default" && view === "home" && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-indigo-50 border border-indigo-100 px-4 py-3">
              <span className="text-lg flex-shrink-0">🔔</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-indigo-900">Ativar notificações</p>
                <p className="text-xs text-indigo-600 mt-0.5">
                  Receba alertas quando o orçamento estiver próximo do limite
                </p>
              </div>
              <button
                onClick={requestPermission}
                className="flex-shrink-0 text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
              >
                Ativar
              </button>
            </div>
          )}

          {view === "home" ? (
            <HomeView
              budgets={budgets}
              totalSpent={totalSpent}
              totalLimit={totalLimit}
            />
          ) : (
            <HistoryView
              expenses={expenses}
              budgets={budgets}
              onEdit={setEditingExpense}
              onDelete={setDeletingExpense}
            />
          )}
        </main>

        {/* Bottom nav */}
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

        {/* Drawer */}
        <SideDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onCreateBudget={handleCreateBudget}
          activeView={view}
          onNavigate={setView}
          user={user}
          onLogout={handleLogout}
          onDeleteAccount={() => setDeleteAccountOpen(true)}
        />

        {/* Modals */}
        <NewExpenseModal
          open={expenseModalOpen}
          onClose={() => setExpenseModalOpen(false)}
          budgets={budgets}
          onAdd={handleAddExpense}
        />

        <EditExpenseModal
          open={editingExpense !== null}
          onClose={() => setEditingExpense(null)}
          expense={editingExpense}
          budgets={budgets}
          onUpdate={handleUpdateExpense}
        />

        <ConfirmModal
          open={deletingExpense !== null}
          onClose={() => setDeletingExpense(null)}
          onConfirm={() => deletingExpense && handleDeleteExpense(deletingExpense)}
          title="Excluir Despesa"
          message={`Tem certeza que deseja excluir "${deletingExpense?.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          danger
        />

        <Toast toast={toast} onDismiss={() => setToast(null)} />

        <ConfirmModal
          open={deleteAccountOpen}
          onClose={() => setDeleteAccountOpen(false)}
          onConfirm={handleDeleteAccount}
          title="Excluir Conta"
          message="Tem certeza que deseja excluir sua conta? Todos os seus dados, orçamentos e despesas serão apagados permanentemente."
          confirmLabel="Excluir Conta"
          danger
        />

        <OnboardingModal open={onboardingOpen} onClose={handleCloseOnboarding} />
      </div>
    </div>
  );
}
