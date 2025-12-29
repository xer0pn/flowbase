-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create financial_goals table
CREATE TABLE public.financial_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  deadline DATE,
  category TEXT DEFAULT 'savings',
  notes TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access for now since no auth)
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no authentication yet)
CREATE POLICY "Allow public read access to goals" 
ON public.financial_goals 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to goals" 
ON public.financial_goals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to goals" 
ON public.financial_goals 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access to goals" 
ON public.financial_goals 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_financial_goals_updated_at
BEFORE UPDATE ON public.financial_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();