"use client";

import { useState } from "react";
import { PiggyBank } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { register, login } from "@/lib/auth";
import type { User } from "@/lib/auth";

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (tab === "login") {
        if (!form.email || !form.password) {
          setError("Preencha todos os campos");
          return;
        }
        const result = login(form.email, form.password);
        if ("error" in result) {
          setError(result.error);
        } else {
          onLogin(result.user);
        }
      } else {
        if (!form.name || !form.email || !form.password) {
          setError("Preencha todos os campos");
          return;
        }
        if (form.password.length < 6) {
          setError("A senha deve ter pelo menos 6 caracteres");
          return;
        }
        if (form.password !== form.confirmPassword) {
          setError("As senhas não coincidem");
          return;
        }
        const result = register(form.name, form.email, form.password);
        if ("error" in result) {
          setError(result.error);
        } else {
          onLogin(result.user);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <div className="mx-auto w-full max-w-[430px] min-h-screen flex flex-col bg-white shadow-2xl">
        <div className="flex flex-col items-center pt-16 pb-10 bg-gradient-to-b from-indigo-600 to-indigo-500">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 mb-4 shadow-lg">
            <PiggyBank className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Aafin</h1>
          <p className="text-sm text-indigo-200 mt-1">Gestão financeira simplificada</p>
        </div>

        <div className="flex border-b border-zinc-100 mx-6 mt-6">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
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
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            autoComplete={tab === "login" ? "current-password" : "new-password"}
          />

          {tab === "register" && (
            <Input
              label="Confirmar Senha"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              autoComplete="new-password"
            />
          )}

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" disabled={loading} className="mt-2">
            {loading ? "Carregando..." : tab === "login" ? "Entrar" : "Criar Conta"}
          </Button>

          {tab === "login" && (
            <p className="text-center text-xs text-zinc-400">
              Não tem conta?{" "}
              <button
                type="button"
                onClick={() => setTab("register")}
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
