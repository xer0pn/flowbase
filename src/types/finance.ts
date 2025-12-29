export type TransactionType = 'income' | 'expense';
export type ActivityType = 'operating' | 'investing' | 'financing';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  activityType?: ActivityType;
  createdAt: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  cashFlow: number;
}

export interface CategorySummary {
  category: string;
  categoryId: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: string; // Format: 'YYYY-MM'
}

// Asset types inspired by Cash Flow Quadrant
export type AssetType = 'savings' | 'investments' | 'business' | 'real_estate' | 'other';
export type LiabilityType = 'credit_card' | 'loan' | 'mortgage' | 'other';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  value: number;
  monthlyIncome?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  amountOwed: number;
  monthlyPayment: number;
  createdAt: string;
  updatedAt: string;
}

// Installment tracking
export type InstallmentStatus = 'active' | 'completed' | 'overdue';
export type InstallmentProvider = 'tabby' | 'tamara' | 'bank' | 'store_credit' | 'other';

export interface Installment {
  id: string;
  itemName: string;
  totalAmount: number;
  downPayment: number;
  remainingAmount: number;
  monthlyPayment: number;
  totalPayments: number;
  completedPayments: number;
  nextDueDate: string;
  status: InstallmentStatus;
  interestRate: number;
  provider: InstallmentProvider;
  createdAt: string;
  updatedAt: string;
}

// Portfolio tracking
export type AssetCategory = 'stock' | 'crypto';

export interface PortfolioHolding {
  id: string;
  assetType: AssetCategory;
  ticker: string;
  assetName: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Recurring Income
export type RecurringFrequency = 'weekly' | 'bi-weekly' | 'monthly';

export interface RecurringIncome {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  frequency: RecurringFrequency;
  dayOfMonth: number;
  isActive: boolean;
  lastGeneratedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceData {
  ticker: string;
  price: number;
  currency: string;
  lastUpdated: string;
}

// Default categories inspired by Cash Flow Quadrant
export const DEFAULT_CATEGORIES: Category[] = [
  // Income Categories (E, S, B, I quadrants)
  { id: 'salary', name: 'Salary/Wages', type: 'income' },
  { id: 'freelance', name: 'Freelance/Consulting', type: 'income' },
  { id: 'business', name: 'Business Income', type: 'income' },
  { id: 'investments', name: 'Investment Returns', type: 'income' },
  { id: 'dividends', name: 'Dividends', type: 'income' },
  { id: 'rental', name: 'Rental Income', type: 'income' },
  { id: 'royalties', name: 'Royalties', type: 'income' },
  { id: 'other-income', name: 'Other Income', type: 'income' },

  // Expense Categories
  { id: 'housing', name: 'Housing/Rent', type: 'expense' },
  { id: 'utilities', name: 'Utilities', type: 'expense' },
  { id: 'groceries', name: 'Groceries', type: 'expense' },
  { id: 'transportation', name: 'Transportation', type: 'expense' },
  { id: 'insurance', name: 'Insurance', type: 'expense' },
  { id: 'healthcare', name: 'Healthcare', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', type: 'expense' },
  { id: 'dining', name: 'Dining Out', type: 'expense' },
  { id: 'shopping', name: 'Shopping', type: 'expense' },
  { id: 'subscriptions', name: 'Subscriptions', type: 'expense' },
  { id: 'education', name: 'Education', type: 'expense' },
  { id: 'debt', name: 'Debt Payments', type: 'expense' },
  { id: 'installments', name: 'Installments', type: 'expense' },
  { id: 'taxes', name: 'Taxes', type: 'expense' },
  { id: 'other-expense', name: 'Other Expense', type: 'expense' },
];

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  savings: 'Savings',
  investments: 'Investments',
  business: 'Business',
  real_estate: 'Real Estate',
  other: 'Other',
};

export const LIABILITY_TYPE_LABELS: Record<LiabilityType, string> = {
  credit_card: 'Credit Card',
  loan: 'Loan',
  mortgage: 'Mortgage',
  other: 'Other',
};

export const INSTALLMENT_STATUS_LABELS: Record<InstallmentStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  overdue: 'Overdue',
};

export const INSTALLMENT_PROVIDER_LABELS: Record<InstallmentProvider, string> = {
  tabby: 'Tabby',
  tamara: 'Tamara',
  bank: 'Bank',
  store_credit: 'Store Credit',
  other: 'Other',
};

// Chart colors for categories
export const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--income))',
  'hsl(var(--expense))',
  'hsl(var(--savings))',
];