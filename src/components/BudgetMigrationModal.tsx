"use client";

import { useState } from "react";
import { Budget } from "@/lib/data";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BudgetMigrationModalProps {
  open: boolean;
  onClose: () => void;
  budget: Budget | null;
  availableBudgets: Budget[];
  onConfirm: (migrateTo?: string) => void;
}

export function BudgetMigrationModal({
  open,
  onClose,
  budget,
  availableBudgets,
  onConfirm,
}: BudgetMigrationModalProps) {
  const [choice, setChoice] = useState<"migrate" | "keep">("keep");
  const [targetId, setTargetId] = useState("");

  function handleConfirm() {
    onConfirm(choice === "migrate" && targetId ? targetId : undefined);
    setChoice("keep");
    setTargetId("");
  }

  function handleClose() {
    setChoice("keep");
    setTargetId("");
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={`Excluir "${budget?.name}"`}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-600">
          Este orçamento possui despesas vinculadas. O que deseja fazer com elas?
        </p>

        <div className="flex flex-col gap-2">
          <div
            onClick={() => setChoice("migrate")}
            className={cn(
              "flex items-start gap-3 rounded-xl border-2 p-3.5 cursor-pointer transition-colors",
              choice === "migrate" ? "border-indigo-500 bg-indigo-50" : "border-zinc-200"
            )}
          >
            <div
              className={cn(
                "mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                choice === "migrate" ? "border-indigo-600" : "border-zinc-300"
              )}
            >
              {choice === "migrate" && (
                <div className="h-2 w-2 rounded-full bg-indigo-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                Migrar para outro orçamento
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                As despesas serão movidas para o orçamento selecionado
              </p>
            </div>
          </div>

          {choice === "migrate" && (
            <div className="ml-7">
              {availableBudgets.length > 0 ? (
                <Select
                  label="Orçamento destino"
                  options={[
                    { value: "", label: "Selecione..." },
                    ...availableBudgets.map((b) => ({
                      value: b.id,
                      label: b.name,
                    })),
                  ]}
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                />
              ) : (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  Nenhum outro orçamento disponível
                </p>
              )}
            </div>
          )}

          <div
            onClick={() => setChoice("keep")}
            className={cn(
              "flex items-start gap-3 rounded-xl border-2 p-3.5 cursor-pointer transition-colors",
              choice === "keep" ? "border-indigo-500 bg-indigo-50" : "border-zinc-200"
            )}
          >
            <div
              className={cn(
                "mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                choice === "keep" ? "border-indigo-600" : "border-zinc-300"
              )}
            >
              {choice === "keep" && (
                <div className="h-2 w-2 rounded-full bg-indigo-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                Manter sem orçamento
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                As despesas ficam sem orçamento e podem ser reatribuídas depois
                no histórico
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={handleConfirm}
            disabled={
              choice === "migrate" &&
              (!targetId || availableBudgets.length === 0)
            }
          >
            Excluir Orçamento
          </Button>
        </div>
      </div>
    </Modal>
  );
}
