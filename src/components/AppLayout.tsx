import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/income-statement', label: 'Income Statement', icon: FileText },
  { to: '/income-sources', label: 'Income Sources', icon: Coins },
  { to: '/recurring-expenses', label: 'Recurring Expenses', icon: Receipt },
  { to: '/bills-calendar', label: 'Bills Calendar', icon: CalendarDays },
  { to: '/balance-sheet', label: 'Balance Sheet', icon: Scale },
  { to: '/cash-flow-statement', label: 'Cash Flow', icon: TrendingUp },
  { to: '/installments', label: 'Installments', icon: CreditCard },
  { to: '/portfolio', label: 'Portfolio', icon: BarChart3 },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 border-r-2 border-border bg-background transition-transform lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b-2 border-border">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight">CashFlow</h1>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
              Financial Tracker
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-2',
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-transparent hover:border-border hover:bg-muted'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t-2 border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden border-b-2 border-border p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">CashFlow Tracker</h1>
          <ThemeToggle />
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
