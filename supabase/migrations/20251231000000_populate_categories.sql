-- ============================================================================
-- POPULATE DEFAULT CATEGORIES
-- ============================================================================
-- This migration populates the categories table with default categories
-- for all existing users, and ensures new users get them too.
-- ============================================================================

-- Function to create default categories for a user
CREATE OR REPLACE FUNCTION public.create_default_categories_for_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Insert default income categories
  INSERT INTO public.categories (user_id, name, type, is_default)
  VALUES
    (target_user_id, 'Salary/Wages', 'income', true),
    (target_user_id, 'Freelance/Consulting', 'income', true),
    (target_user_id, 'Business Income', 'income', true),
    (target_user_id, 'Investment Returns', 'income', true),
    (target_user_id, 'Dividends', 'income', true),
    (target_user_id, 'Rental Income', 'income', true),
    (target_user_id, 'Royalties', 'income', true),
    (target_user_id, 'Other Income', 'income', true),
    
    -- Insert default expense categories
    (target_user_id, 'Housing/Rent', 'expense', true),
    (target_user_id, 'Utilities', 'expense', true),
    (target_user_id, 'Groceries', 'expense', true),
    (target_user_id, 'Transportation', 'expense', true),
    (target_user_id, 'Insurance', 'expense', true),
    (target_user_id, 'Healthcare', 'expense', true),
    (target_user_id, 'Entertainment', 'expense', true),
    (target_user_id, 'Dining Out', 'expense', true),
    (target_user_id, 'Shopping', 'expense', true),
    (target_user_id, 'Subscriptions', 'expense', true),
    (target_user_id, 'Education', 'expense', true),
    (target_user_id, 'Debt Payments', 'expense', true),
    (target_user_id, 'Installments', 'expense', true),
    (target_user_id, 'Taxes', 'expense', true),
    (target_user_id, 'Other Expense', 'expense', true)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default categories for all existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    PERFORM public.create_default_categories_for_user(user_record.id);
  END LOOP;
END $$;

-- Create trigger to auto-create categories for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.create_default_categories_for_user(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- DONE
-- ============================================================================
