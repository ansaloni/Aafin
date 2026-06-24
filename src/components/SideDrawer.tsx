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
  UserCircle,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { Budget } from "@/lib/data";
import type { User } from "@/lib/auth";
import { updateProfile, changePassword } from "@/lib/auth";
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
  onUpdateUser: (user: User) => void;
}

type Section = "menu" | "budgets" | "profile";

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-600">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "••••••••"}
          className={cn(
            "flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 pr-9 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
            error && "border-red-400 focus:ring-red-400"
          )}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}

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
  onUpdateUser,
}: SideDrawerProps) {
  const [section, setSection] = useState<Section>("menu");

  // Profile editing state
  const [profileName, setProfileName] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password change state
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  function handleClose() {
    setSection("menu");
    onClose();
  }

  function navigate(view: AppView) {
    handleClose();
    onNavigate(view);
  }

  function openProfile() {
    setProfileName(user.name);
    setProfileError("");
    setProfileSuccess(false);
    setPwForm({ current: "", next: "", confirm: "" });
    setPwError("");
    setPwSuccess(false);
    setSection("profile");
  }

  function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess(false);
    const result = updateProfile(user.id, profileName);
    if ("error" in result) {
      setProfileError(result.error);
    } else {
      onUpdateUser(result.user);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2000);
    }
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    if (!pwForm.current) { setPwError("Informe a senha atual"); return; }
    if (pwForm.next.length < 6) { setPwError("A nova senha deve ter pelo menos 6 caracteres"); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("As senhas não coincidem"); return; }
    const result = changePassword(user.id, pwForm.current, pwForm.next);
    if (result !== true) {
      setPwError(result.error);
    } else {
      setPwForm({ current: "", next: "", confirm: "" });
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 2000);
    }
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
          {section === "menu" && (
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
          )}

          {section === "budgets" && (
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

          {section === "profile" && (
            <div className="py-3">
              <div className="px-3 mb-4 flex items-center gap-2">
                <button
                  onClick={() => setSection("menu")}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-zinc-900">
                  Meu Perfil
                </span>
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center gap-2 mb-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
                  <span className="text-xl font-bold text-indigo-700">
                    {userInitials}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{user.email}</p>
              </div>

              {/* Name form */}
              <div className="px-4">
                <form onSubmit={handleSaveName} className="flex flex-col gap-3 mb-5">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Nome
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={profileName}
                      onChange={(e) => {
                        setProfileName(e.target.value);
                        setProfileError("");
                        setProfileSuccess(false);
                      }}
                      placeholder="Seu nome"
                      className="flex h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                      {profileSuccess ? <Check className="h-4 w-4" /> : <Pencil className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {profileError && (
                    <p className="text-[10px] text-red-500">{profileError}</p>
                  )}
                  {profileSuccess && (
                    <p className="text-[10px] text-green-600 font-medium">Nome atualizado!</p>
                  )}
                </form>

                <div className="h-px bg-zinc-100 mb-4" />

                {/* Password form */}
                <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Alterar Senha
                  </p>
                  <PasswordField
                    label="Senha atual"
                    value={pwForm.current}
                    onChange={(v) => { setPwForm((p) => ({ ...p, current: v })); setPwError(""); setPwSuccess(false); }}
                  />
                  <PasswordField
                    label="Nova senha"
                    value={pwForm.next}
                    onChange={(v) => { setPwForm((p) => ({ ...p, next: v })); setPwError(""); setPwSuccess(false); }}
                  />
                  <PasswordField
                    label="Confirmar nova senha"
                    value={pwForm.confirm}
                    onChange={(v) => { setPwForm((p) => ({ ...p, confirm: v })); setPwError(""); setPwSuccess(false); }}
                  />
                  {pwError && (
                    <p className="text-[10px] text-red-500">{pwError}</p>
                  )}
                  {pwSuccess && (
                    <p className="text-[10px] text-green-600 font-medium">Senha alterada com sucesso!</p>
                  )}
                  <button
                    type="submit"
                    className="flex h-10 w-full items-center justify-center rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    Salvar nova senha
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* User footer */}
        <div className="border-t border-zinc-100 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={openProfile}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 hover:bg-indigo-200 transition-colors"
              title="Editar perfil"
            >
              <span className="text-xs font-bold text-indigo-700">
                {userInitials}
              </span>
            </button>
            <button
              onClick={openProfile}
              className="flex-1 min-w-0 text-left"
            >
              <p className="text-sm font-semibold text-zinc-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-zinc-400 truncate">{user.email}</p>
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={openProfile}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 transition-colors"
                title="Editar perfil"
              >
                <UserCircle className="h-4 w-4" />
              </button>
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
