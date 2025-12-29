import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Trash2, 
  Plus, 
  Calendar,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { format, differenceInDays, addMonths } from 'date-fns';
import type { FinancialGoal, UpdateGoalInput } from '@/hooks/useFinancialGoals';

interface GoalCardProps {
  goal: FinancialGoal;
  monthlySavingsRate: number;
  onUpdate: (id: string, input: UpdateGoalInput) => Promise<{ error: string | null }>;
  onDelete: (id: string) => Promise<{ error: string | null }>;
  onAddFunds: (id: string, amount: number) => Promise<{ error: string | null }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  savings: 'Savings',
  emergency: 'Emergency Fund',
  investment: 'Investment',
  debt: 'Debt Payoff',
  purchase: 'Major Purchase',
  travel: 'Travel',
  education: 'Education',
  other: 'Other',
};

export function GoalCard({ 
  goal, 
  monthlySavingsRate, 
  onUpdate, 
  onDelete, 
  onAddFunds 
}: GoalCardProps) {
  const [addAmount, setAddAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const remaining = Math.max(goal.target_amount - goal.current_amount, 0);

  // Calculate estimated completion date based on monthly savings rate
  const getEstimatedCompletion = () => {
    if (goal.is_completed || remaining <= 0) return null;
    if (monthlySavingsRate <= 0) return 'N/A (no savings)';

    const monthsNeeded = Math.ceil(remaining / monthlySavingsRate);
    const estimatedDate = addMonths(new Date(), monthsNeeded);
    return format(estimatedDate, 'MMM yyyy');
  };

  const getDaysRemaining = () => {
    if (!goal.deadline) return null;
    const days = differenceInDays(new Date(goal.deadline), new Date());
    return days;
  };

  const daysRemaining = getDaysRemaining();
  const estimatedCompletion = getEstimatedCompletion();

  const handleAddFunds = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) return;
    setIsAdding(true);
    await onAddFunds(goal.id, parseFloat(addAmount));
    setAddAmount('');
    setShowAddForm(false);
    setIsAdding(false);
  };

  const handleToggleComplete = async () => {
    await onUpdate(goal.id, { is_completed: !goal.is_completed });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className={`border-2 ${goal.is_completed ? 'border-primary bg-primary/5' : 'border-border'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              {goal.is_completed ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Target className="h-5 w-5" />
              )}
              {goal.name}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {CATEGORY_LABELS[goal.category] || goal.category}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleToggleComplete}
              title={goal.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              <CheckCircle2 className={`h-4 w-4 ${goal.is_completed ? 'text-primary' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(goal.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-bold">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-sm">
            <span>{formatCurrency(goal.current_amount)}</span>
            <span className="text-muted-foreground">{formatCurrency(goal.target_amount)}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 p-3 border-2 border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Remaining</p>
            <p className="text-lg font-bold">{formatCurrency(remaining)}</p>
          </div>
          {goal.deadline && (
            <div className="bg-muted/50 p-3 border-2 border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Deadline
              </p>
              <p className="text-lg font-bold">
                {format(new Date(goal.deadline), 'MMM d, yyyy')}
              </p>
              {daysRemaining !== null && (
                <p className={`text-xs ${daysRemaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {daysRemaining < 0 
                    ? `${Math.abs(daysRemaining)} days overdue`
                    : `${daysRemaining} days left`
                  }
                </p>
              )}
            </div>
          )}
        </div>

        {/* Estimated Completion */}
        {!goal.is_completed && estimatedCompletion && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 border-2 border-primary/30">
            <TrendingUp className="h-4 w-4 text-primary" />
            <div className="text-sm">
              <span className="text-muted-foreground">Est. completion: </span>
              <span className="font-semibold">{estimatedCompletion}</span>
            </div>
          </div>
        )}

        {/* Notes */}
        {goal.notes && (
          <p className="text-sm text-muted-foreground italic border-l-2 border-border pl-3">
            {goal.notes}
          </p>
        )}

        {/* Add Funds */}
        {!goal.is_completed && (
          <div>
            {showAddForm ? (
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddFunds} 
                  disabled={isAdding || !addAmount}
                  size="sm"
                >
                  Add
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddAmount('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Funds
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
