import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinancialGoals } from '@/hooks/useFinancialGoals';
import { useTransactions } from '@/hooks/useTransactions';
import { GoalForm } from '@/components/GoalForm';
import { GoalCard } from '@/components/GoalCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { subMonths, isAfter } from 'date-fns';

export default function FinancialGoals() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { goals, isLoading, createGoal, updateGoal, deleteGoal, addToGoal } = useFinancialGoals();
  const { transactions } = useTransactions();

  // Calculate average monthly savings rate from last 3 months
  const monthlySavingsRate = useMemo(() => {
    const threeMonthsAgo = subMonths(new Date(), 3);
    const recentTransactions = transactions.filter((t) =>
      isAfter(new Date(t.date), threeMonthsAgo)
    );

    let totalIncome = 0;
    let totalExpenses = 0;

    recentTransactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
      }
    });

    const netSavings = totalIncome - totalExpenses;
    return Math.max(netSavings / 3, 0); // Average per month, min 0
  }, [transactions]);

  const activeGoals = goals.filter((g) => !g.is_completed);
  const completedGoals = goals.filter((g) => g.is_completed);

  const totalTargetAmount = activeGoals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalCurrentAmount = activeGoals.reduce((sum, g) => sum + g.current_amount, 0);
  const overallProgress = totalTargetAmount > 0
    ? (totalCurrentAmount / totalTargetAmount) * 100
    : 0;

  const handleCreateGoal = async (input: Parameters<typeof createGoal>[0]) => {
    const result = await createGoal(input);
    if (result.error) {
      toast({ title: t('common.error'), description: result.error, variant: 'destructive' });
    } else {
      toast({ title: t('common.goalCreated'), description: `"${input.name}" ${t('common.hasBeenAdded')}` });
    }
    return result;
  };

  const handleUpdateGoal = async (id: string, input: Parameters<typeof updateGoal>[1]) => {
    const result = await updateGoal(id, input);
    if (result.error) {
      toast({ title: t('common.error'), description: result.error, variant: 'destructive' });
    }
    return result;
  };

  const handleDeleteGoal = async (id: string) => {
    const goal = goals.find((g) => g.id === id);
    const result = await deleteGoal(id);
    if (result.error) {
      toast({ title: t('common.error'), description: result.error, variant: 'destructive' });
    } else {
      toast({ title: t('common.goalDeleted'), description: `"${goal?.name}" ${t('common.hasBeenRemoved')}` });
    }
    return result;
  };

  const handleAddFunds = async (id: string, amount: number) => {
    const result = await addToGoal(id, amount);
    if (result.error) {
      toast({ title: t('common.error'), description: result.error, variant: 'destructive' });
    } else {
      toast({ title: t('common.fundsAdded'), description: `${amount.toFixed(2)} ${t('common.addedToGoal')}` });
    }
    return result;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('goals.title')}</h1>
        <p className="text-muted-foreground">
          {t('goals.subtitle')}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t('goals.activeGoals')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeGoals.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {t('goals.completed')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completedGoals.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('goals.overallProgress')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overallProgress.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalCurrentAmount)} of {formatCurrency(totalTargetAmount)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('goals.monthlySavings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(monthlySavingsRate)}</p>
            <p className="text-xs text-muted-foreground">{t('goals.threeMonthAverage')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Goal Form */}
        <div className="lg:col-span-1">
          <GoalForm onSubmit={handleCreateGoal} />
        </div>

        {/* Goals List */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">
                {t('goals.active')} ({activeGoals.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                {t('goals.completed')} ({completedGoals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              {activeGoals.length === 0 ? (
                <Card className="border-2 border-dashed border-border">
                  <CardContent className="p-8 text-center">
                    <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      {t('goals.noActiveGoals')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {activeGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      monthlySavingsRate={monthlySavingsRate}
                      onUpdate={handleUpdateGoal}
                      onDelete={handleDeleteGoal}
                      onAddFunds={handleAddFunds}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              {completedGoals.length === 0 ? (
                <Card className="border-2 border-dashed border-border">
                  <CardContent className="p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      {t('goals.noCompletedGoals')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {completedGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      monthlySavingsRate={monthlySavingsRate}
                      onUpdate={handleUpdateGoal}
                      onDelete={handleDeleteGoal}
                      onAddFunds={handleAddFunds}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}