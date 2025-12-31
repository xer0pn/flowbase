import { ReactNode, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { useRecurringAutomation } from '@/hooks/useRecurringAutomation';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  FileText,
  Scale,
  TrendingUp,
  Menu,
  X,
  CreditCard,
  BarChart3,
  Coins,
  Receipt,
  CalendarDays,
  Target,
  LogOut,
  Settings,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/income-statement', labelKey: 'nav.incomeStatement', icon: FileText },
  { to: '/income-sources', labelKey: 'nav.incomeSources', icon: Coins },
  { to: '/recurring-expenses', labelKey: 'nav.recurringExpenses', icon: Receipt },
  { to: '/bills-calendar', labelKey: 'nav.billsCalendar', icon: CalendarDays },
  { to: '/financial-goals', labelKey: 'nav.financialGoals', icon: Target },
  { to: '/balance-sheet', labelKey: 'nav.balanceSheet', icon: Scale },
  { to: '/cash-flow-statement', labelKey: 'nav.cashFlow', icon: TrendingUp },
  { to: '/installments', labelKey: 'nav.installments', icon: CreditCard },
  { to: '/portfolio', labelKey: 'nav.portfolio', icon: BarChart3 },
  { to: '/docs', labelKey: 'nav.docs', icon: BookOpen },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const { generateAllRecurring } = useRecurringAutomation();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateRecurring = async () => {
    setIsGenerating(true);
    await generateAllRecurring();
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:sticky top-0 left-0 z-50 h-screen border-r-2 border-border bg-background transition-all duration-300 overflow-hidden',
        isSidebarOpen ? 'w-64' : 'w-0 lg:w-16'
      )}>
        <div className={cn(
          'flex flex-col h-full w-64 lg:w-auto',
          !isSidebarOpen && 'lg:items-center lg:w-16'
        )}>
          {/* Header */}
          <div className={cn(
            'p-6 border-b-2 border-border flex-shrink-0',
            !isSidebarOpen && 'lg:p-4'
          )}>
            <div className="flex items-center justify-between">
              {isSidebarOpen && (
                <>
                  <h1 className="text-xl font-bold tracking-tight">FlowBase</h1>
                  <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </>
              )}
              {!isSidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(true)}
                  className="hidden lg:flex"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
            </div>
            {isSidebarOpen && (
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Financial Tracker</p>
            )}
          </div>

          {/* Navigation */}
          <nav className={cn(
            'flex-1 p-4 space-y-1 overflow-y-auto',
            !isSidebarOpen && 'lg:p-2'
          )}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-2 rounded-lg',
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-transparent hover:border-border hover:bg-muted',
                    !isSidebarOpen && 'lg:justify-center lg:px-2'
                  )}
                  title={!isSidebarOpen ? t(item.labelKey) : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {isSidebarOpen && <span>{t(item.labelKey)}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={cn(
            'p-4 border-t-2 border-border space-y-3 flex-shrink-0',
            !isSidebarOpen && 'lg:p-2'
          )}>
            {isSidebarOpen && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleGenerateRecurring}
                disabled={isGenerating}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
                {t('recurring.generateTransactions')}
              </Button>
            )}
            <div className={cn(
              'flex items-center',
              isSidebarOpen ? 'justify-between' : 'lg:flex-col lg:gap-2'
            )}>
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            {isSidebarOpen ? (
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('auth.signOut')}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex w-full justify-center"
                onClick={signOut}
                title={t('auth.signOut')}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header Only */}
        <header className="lg:hidden border-b-2 border-border p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">FlowBase</h1>
          <ThemeToggle />
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
