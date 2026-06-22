"use client";

import { useState, useCallback, useEffect } from "react";

export function useNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<
    NotificationPermission | "unsupported"
  >("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermissionStatus("unsupported");
    } else {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    const result = await Notification.requestPermission();
    setPermissionStatus(result);
    return result === "granted";
  }, []);

  const notify = useCallback((title: string, body: string) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    try {
      new Notification(title, { body });
    } catch {}
  }, []);

  const notifyBudgetAlert = useCallback(
    (budgetName: string, percent: number) => {
      if (percent >= 100) {
        notify(`Orçamento excedido: ${budgetName}`, "O limite foi ultrapassado!");
      } else if (percent >= 90) {
        notify(
          `⚠️ Alerta: ${budgetName}`,
          `${percent.toFixed(0)}% do orçamento utilizado`
        );
      } else if (percent >= 75) {
        notify(
          `${budgetName}`,
          `${percent.toFixed(0)}% do orçamento utilizado`
        );
      }
    },
    [notify]
  );

  return { requestPermission, notifyBudgetAlert, permissionStatus };
}
