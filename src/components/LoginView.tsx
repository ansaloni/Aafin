"use client";

import { useState } from "react";
import { PiggyBank, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { register, login } from "@/lib/auth";
import type { User } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface LoginViewProps {
  onLogin: (user: User) => void;
}

function passwordScore(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const STRENGTH_LABELS = ["", "Fraca", "Razoável", "Forte", "Muito Forte"];
const STRENGTH_COLORS = ["", "bg-red-400", "bg-orange-400", "bg-green-500", "bg-emerald-500"];
const STRENGTH_TEXT   = ["", "text-red-500", "text-orange-500", "text-green-600", "text-emerald-600"];

function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  error,
  placeholder = "••••••••",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  error?: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={cn(
            "flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 pr-11 py-2 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
            error && "border-red-400 focus:ring-red-400"
          )}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
          tabIndex={-1}
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function handleChange(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  }

  function switchTab(next: "login" | "register") {
    setTab(next);
    setErrors({});
    setForm((p) => ({ ...p, name: "", password: "", confirmPassword: "" }));
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (tab === "login") {
      if (!form.email) errs.email = "Informe seu e-mail";
      if (!form.password) errs.password = "Informe sua senha";
    } else {
      if (!form.name.trim()) errs.name = "Nome é obrigatório";
      if (!form.email) errs.email = "Informe seu e-mail";
      if (!form.password) errs.password = "Crie uma senha";
      else if (form.password.length < 6) errs.password = "Mínimo de 6 caracteres";
      if (form.password !== form.confirmPassword)
        errs.confirmPassword = "As senhas não coincidem";
    }
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      if (tab === "login") {
        const result = login(form.email, form.password);
        if ("error" in result) {
          setErrors({ password: result.error });
        } else {
          onLogin(result.user);
        }
      } else {
        const result = register(form.name, form.email, form.password);
        if ("error" in result) {
          setErrors({ email: result.error });
        } else {
          onLogin(result.user);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const score = tab === "register" && form.password ? passwordScore(form.password) : 0;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <div className="mx-auto w-full max-w-[430px] min-h-screen flex flex-col bg-white shadow-2xl">
        <div className="flex flex-col items-center pt-16 pb-10 bg-gradient-to-b from-indigo-600 to-indigo-500">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 mb-4 shadow-lg">
            <PiggyBank className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Grana</h1>
          <p className="text-sm text-indigo-200 mt-1">Gestão financeira simplificada</p>
        </div>

        <div className="flex border-b border-zinc-100 mx-6 mt-6">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                tab === t
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {t === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 pt-6 pb-8">
          {tab === "register" && (
            <Input
              label="Nome"
              placeholder="Seu nome completo"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              autoComplete="name"
              error={errors.name}
              autoFocus
            />
          )}

          <Input
            label="E-mail"
            type="email"
            inputMode="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            autoComplete="email"
            error={errors.email}
            autoFocus={tab === "login"}
          />

          <PasswordInput
            label="Senha"
            value={form.password}
            onChange={(v) => handleChange("password", v)}
            autoComplete={tab === "login" ? "current-password" : "new-password"}
            error={errors.password}
          />

          {tab === "register" && form.password.length > 0 && (
            <div className="-mt-2 flex flex-col gap-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i <= score ? STRENGTH_COLORS[score] : "bg-zinc-100"
                    )}
                  />
                ))}
              </div>
              <p className={cn("text-xs font-medium", STRENGTH_TEXT[score])}>
                {STRENGTH_LABELS[score]}
              </p>
            </div>
          )}

          {tab === "register" && (
            <PasswordInput
              label="Confirmar Senha"
              value={form.confirmPassword}
              onChange={(v) => handleChange("confirmPassword", v)}
              autoComplete="new-password"
              error={errors.confirmPassword}
            />
          )}

          <Button type="submit" size="lg" disabled={loading} className="mt-2">
            {loading
              ? "Carregando..."
              : tab === "login"
              ? "Entrar"
              : "Criar Conta"}
          </Button>

          {tab === "login" && (
            <p className="text-center text-xs text-zinc-400">
              Não tem conta?{" "}
              <button
                type="button"
                onClick={() => switchTab("register")}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Cadastre-se
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
