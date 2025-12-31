-- Add missing database indexes for better query performance
-- This migration adds indexes on foreign key columns and frequently queried fields

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_installment_id ON public.transactions(installment_id);

-- Budgets table indexes
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON public.budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month ON public.budgets(month);

-- Recurring income indexes
CREATE INDEX IF NOT EXISTS idx_recurring_income_category_id ON public.recurring_income(category_id);
CREATE INDEX IF NOT EXISTS idx_recurring_income_is_active ON public.recurring_income(is_active);

-- Recurring expenses indexes
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_category_id ON public.recurring_expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_is_active ON public.recurring_expenses(is_active);

-- Add database constraints for data integrity
-- Ensure budgets are unique per category per month
ALTER TABLE public.budgets 
  DROP CONSTRAINT IF EXISTS unique_budget_per_category_month;
  
ALTER TABLE public.budgets 
  ADD CONSTRAINT unique_budget_per_category_month 
  UNIQUE (user_id, category_id, month);

-- Ensure transaction amounts are positive
ALTER TABLE public.transactions 
  DROP CONSTRAINT IF EXISTS check_positive_amount;
  
ALTER TABLE public.transactions 
  ADD CONSTRAINT check_positive_amount 
  CHECK (amount > 0);

-- Ensure budget amounts are positive
ALTER TABLE public.budgets 
  DROP CONSTRAINT IF EXISTS check_positive_budget_amount;
  
ALTER TABLE public.budgets 
  ADD CONSTRAINT check_positive_budget_amount 
  CHECK (amount > 0);

-- Ensure asset values are positive
ALTER TABLE public.assets 
  DROP CONSTRAINT IF EXISTS check_positive_asset_value;
  
ALTER TABLE public.assets 
  ADD CONSTRAINT check_positive_asset_value 
  CHECK (value >= 0);

-- Ensure liability amounts are positive
ALTER TABLE public.liabilities 
  DROP CONSTRAINT IF EXISTS check_positive_liability_amount;
  
ALTER TABLE public.liabilities 
  ADD CONSTRAINT check_positive_liability_amount 
  CHECK (amount_owed >= 0 AND monthly_payment >= 0);

-- Ensure installment amounts are positive
ALTER TABLE public.installments 
  DROP CONSTRAINT IF EXISTS check_positive_installment_amounts;
  
ALTER TABLE public.installments 
  ADD CONSTRAINT check_positive_installment_amounts 
  CHECK (
    total_amount > 0 AND 
    down_payment >= 0 AND 
    remaining_amount >= 0 AND 
    monthly_payment > 0 AND
    total_payments > 0 AND
    completed_payments >= 0 AND
    completed_payments <= total_payments
  );

-- Ensure portfolio quantities and prices are positive
ALTER TABLE public.portfolio_holdings 
  DROP CONSTRAINT IF EXISTS check_positive_portfolio_values;
  
ALTER TABLE public.portfolio_holdings 
  ADD CONSTRAINT check_positive_portfolio_values 
  CHECK (quantity > 0 AND purchase_price > 0);

-- Ensure recurring income/expense amounts are positive
ALTER TABLE public.recurring_income 
  DROP CONSTRAINT IF EXISTS check_positive_recurring_income_amount;
  
ALTER TABLE public.recurring_income 
  ADD CONSTRAINT check_positive_recurring_income_amount 
  CHECK (amount > 0);

ALTER TABLE public.recurring_expenses 
  DROP CONSTRAINT IF EXISTS check_positive_recurring_expense_amount;
  
ALTER TABLE public.recurring_expenses 
  ADD CONSTRAINT check_positive_recurring_expense_amount 
  CHECK (amount > 0);

-- Ensure financial goals have positive amounts
ALTER TABLE public.financial_goals 
  DROP CONSTRAINT IF EXISTS check_positive_goal_amounts;
  
ALTER TABLE public.financial_goals 
  ADD CONSTRAINT check_positive_goal_amounts 
  CHECK (target_amount > 0 AND current_amount >= 0);
