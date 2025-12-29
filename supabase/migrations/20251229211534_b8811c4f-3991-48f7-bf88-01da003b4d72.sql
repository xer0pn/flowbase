-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  activity_type TEXT CHECK (activity_type IN ('operating', 'investing', 'financing')),
  installment_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Create budgets table
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  month TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- Create assets table
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('savings', 'investments', 'business', 'real_estate', 'other')),
  value DECIMAL(12, 2) NOT NULL,
  monthly_income DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assets" ON public.assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own assets" ON public.assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assets" ON public.assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own assets" ON public.assets FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create liabilities table
CREATE TABLE public.liabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit_card', 'loan', 'mortgage', 'other')),
  amount_owed DECIMAL(12, 2) NOT NULL,
  monthly_payment DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own liabilities" ON public.liabilities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own liabilities" ON public.liabilities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own liabilities" ON public.liabilities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own liabilities" ON public.liabilities FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_liabilities_updated_at BEFORE UPDATE ON public.liabilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create installments table
CREATE TABLE public.installments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  down_payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
  remaining_amount DECIMAL(12, 2) NOT NULL,
  monthly_payment DECIMAL(12, 2) NOT NULL,
  total_payments INTEGER NOT NULL,
  completed_payments INTEGER NOT NULL DEFAULT 0,
  next_due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue')),
  interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  provider TEXT NOT NULL CHECK (provider IN ('tabby', 'tamara', 'bank', 'store_credit', 'other')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own installments" ON public.installments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own installments" ON public.installments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own installments" ON public.installments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own installments" ON public.installments FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON public.installments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create portfolio_holdings table
CREATE TABLE public.portfolio_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'crypto')),
  ticker TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  quantity DECIMAL(18, 8) NOT NULL,
  purchase_price DECIMAL(18, 8) NOT NULL,
  purchase_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own holdings" ON public.portfolio_holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own holdings" ON public.portfolio_holdings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own holdings" ON public.portfolio_holdings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own holdings" ON public.portfolio_holdings FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_portfolio_holdings_updated_at BEFORE UPDATE ON public.portfolio_holdings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create recurring_income table
CREATE TABLE public.recurring_income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly')),
  day_of_month INTEGER NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
  is_active BOOLEAN NOT NULL DEFAULT true,
  activity_type TEXT CHECK (activity_type IN ('operating', 'investing', 'financing')),
  last_generated_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recurring_income ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recurring income" ON public.recurring_income FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own recurring income" ON public.recurring_income FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recurring income" ON public.recurring_income FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recurring income" ON public.recurring_income FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_recurring_income_updated_at BEFORE UPDATE ON public.recurring_income FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create recurring_expenses table
CREATE TABLE public.recurring_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly')),
  day_of_month INTEGER NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
  is_active BOOLEAN NOT NULL DEFAULT true,
  activity_type TEXT CHECK (activity_type IN ('operating', 'investing', 'financing')),
  last_generated_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recurring expenses" ON public.recurring_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own recurring expenses" ON public.recurring_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recurring expenses" ON public.recurring_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recurring expenses" ON public.recurring_expenses FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_recurring_expenses_updated_at BEFORE UPDATE ON public.recurring_expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update financial_goals table to add user_id
ALTER TABLE public.financial_goals ADD COLUMN user_id UUID;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Allow public insert access to goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Allow public update access to goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Allow public delete access to goals" ON public.financial_goals;

-- Create user-based policies for financial_goals
CREATE POLICY "Users can view their own goals" ON public.financial_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own goals" ON public.financial_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.financial_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.financial_goals FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_assets_user_id ON public.assets(user_id);
CREATE INDEX idx_liabilities_user_id ON public.liabilities(user_id);
CREATE INDEX idx_installments_user_id ON public.installments(user_id);
CREATE INDEX idx_portfolio_holdings_user_id ON public.portfolio_holdings(user_id);
CREATE INDEX idx_recurring_income_user_id ON public.recurring_income(user_id);
CREATE INDEX idx_recurring_expenses_user_id ON public.recurring_expenses(user_id);
CREATE INDEX idx_financial_goals_user_id ON public.financial_goals(user_id);