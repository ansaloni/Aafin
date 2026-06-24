export type BudgetPeriod = "Diário" | "Semanal" | "Mensal" | "Anual";

export interface Budget {
  id: string;
  name: string;
  limit: number;
  spent: number;
  period: BudgetPeriod;
  cumulative: boolean;
  color: string;
  createdAt?: string;
}

export interface Expense {
  id: string;
  name: string;
  value: number;
  budgetId: string;
  budgetName: string;
  note: string;
  date: string;
}

export const BUDGET_COLORS = [
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#10b981",
  "#3b82f6",
];

export const initialBudgets: Budget[] = [
  {
    id: "1",
    name: "Alimentação",
    limit: 1200,
    spent: 840,
    period: "Mensal",
    cumulative: false,
    color: "#10b981",
  },
  {
    id: "2",
    name: "Transporte",
    limit: 400,
    spent: 380,
    period: "Mensal",
    cumulative: true,
    color: "#6366f1",
  },
  {
    id: "3",
    name: "Lazer",
    limit: 300,
    spent: 95,
    period: "Mensal",
    cumulative: false,
    color: "#ec4899",
  },
  {
    id: "4",
    name: "Saúde",
    limit: 500,
    spent: 490,
    period: "Mensal",
    cumulative: false,
    color: "#f59e0b",
  },
];

export const initialExpenses: Expense[] = [
  {
    id: "e1",
    name: "Supermercado Pão de Açúcar",
    value: 234.5,
    budgetId: "1",
    budgetName: "Alimentação",
    note: "Compras da semana",
    date: "2026-06-22T10:30:00",
  },
  {
    id: "e2",
    name: "Uber",
    value: 28.0,
    budgetId: "2",
    budgetName: "Transporte",
    note: "Ida ao trabalho",
    date: "2026-06-22T08:15:00",
  },
  {
    id: "e3",
    name: "Cinema",
    value: 45.0,
    budgetId: "3",
    budgetName: "Lazer",
    note: "Filme com amigos",
    date: "2026-06-21T19:00:00",
  },
  {
    id: "e4",
    name: "Farmácia",
    value: 87.3,
    budgetId: "4",
    budgetName: "Saúde",
    note: "Remédios mensais",
    date: "2026-06-21T14:20:00",
  },
  {
    id: "e5",
    name: "iFood",
    value: 62.9,
    budgetId: "1",
    budgetName: "Alimentação",
    note: "Almoço home office",
    date: "2026-06-20T12:30:00",
  },
  {
    id: "e6",
    name: "Metro",
    value: 22.0,
    budgetId: "2",
    budgetName: "Transporte",
    note: "Cartão recarga",
    date: "2026-06-19T09:00:00",
  },
];
