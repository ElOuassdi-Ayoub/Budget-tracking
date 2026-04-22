export interface CategoryDTO {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  isPreset: boolean;
  _count?: { expenses: number };
}

export interface IncomeDTO {
  id: string;
  label: string;
  amount: number;
  month: number;
  year: number;
  note?: string | null;
  createdAt: string;
}

export interface ExpenseDTO {
  id: string;
  label: string;
  amount: number;
  month: number;
  year: number;
  date: string;
  note?: string | null;
  categoryId: string;
  category: CategoryDTO;
  createdAt: string;
}

export interface MonthSummary {
  totalIncome: number;
  totalExpenses: number;
  net: number;
  savingsRate: number;
}

export interface NetPerMonthPoint {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface TopCategory {
  name: string;
  total: number;
  color: string;
  icon?: string | null;
}

export interface AnalyticsPayload {
  netPerMonth: NetPerMonthPoint[];
  spendingByCategory: Record<string, number | string>[];
  incomeTrends: Record<string, number | string>[];
  topCategories: TopCategory[];
}
