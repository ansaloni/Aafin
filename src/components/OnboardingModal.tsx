"use client";

import { useState, useEffect } from "react";
import { PiggyBank, Plus, History, Menu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    Icon: PiggyBank,
    iconBg: "bg-indigo-600",
    shadowColor: "shadow-indigo-200",
    title: "Bem-vindo ao Grana!",
    description:
      "Tenha o controle das suas finanças na palma da mão. Deixa a gente te guiar pelos primeiros passos.",
    hint: null,
  },
  {
    Icon: Menu,
    iconBg: "bg-emerald-500",
    shadowColor: "shadow-emerald-200",
    title: "Crie seus orçamentos",
    description:
      'Toque no ☰ no canto superior esquerdo para abrir o menu. Crie categorias como "Alimentação" ou "Transporte" e defina um limite de gastos para cada uma.',
    hint: "☰ Menu → Criar Orçamento",
  },
  {
    Icon: Plus,
    iconBg: "bg-indigo-600",
    shadowColor: "shadow-indigo-200",
    title: "Registre seus gastos",
    description:
      "Toque no botão + no centro da barra inferior para adicionar uma despesa. Informe nome, valor, categoria e data.",
    hint: "Botão + na barra inferior",
  },
  {
    Icon: History,
    iconBg: "bg-violet-500",
    shadowColor: "shadow-violet-200",
    title: "Acompanhe tudo",
    description:
      "Veja o progresso de cada orçamento na tela inicial e acesse o Histórico para filtrar, editar ou excluir seus lançamentos.",
    hint: "Aba Histórico",
  },
];

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  if (!open) return null;

  const { Icon, iconBg, shadowColor, title, description, hint } = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-[430px] bg-white rounded-t-3xl px-6 pt-8 pb-10 animate-slide-up">
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === step
                  ? "w-6 bg-indigo-600"
                  : i < step
                  ? "w-1.5 bg-indigo-300"
                  : "w-1.5 bg-zinc-200"
              )}
            />
          ))}
        </div>

        {/* Icon */}
        <div
          className={cn(
            "mx-auto flex h-24 w-24 items-center justify-center rounded-3xl mb-6 shadow-xl",
            iconBg,
            shadowColor
          )}
        >
          <Icon className="h-12 w-12 text-white" strokeWidth={1.5} />
        </div>

        {/* Text */}
        <h2 className="text-xl font-bold text-zinc-900 text-center mb-3">{title}</h2>
        <p className="text-sm text-zinc-500 text-center leading-relaxed">{description}</p>

        {/* Hint chip */}
        {hint && (
          <div className="flex justify-center mt-4">
            <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              {hint}
            </span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 mt-8">
          <Button
            size="lg"
            className="w-full"
            onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
          >
            {isLast ? (
              "Vamos lá!"
            ) : (
              <span className="flex items-center gap-1.5">
                Próximo <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </Button>
          {!isLast && (
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors py-1 text-center"
            >
              Pular tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
