import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    BookOpen,
    LayoutDashboard,
    ArrowLeftRight,
    Repeat,
    TrendingUp,
    PieChart,
    Settings as SettingsIcon,
    Search,
    ChevronRight,
    Rocket,
    CheckCircle2,
    Lightbulb,
    AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const Docs = () => {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('getting-started');
    const [searchQuery, setSearchQuery] = useState('');

    const sections = [
        { id: 'getting-started', label: 'Getting Started', icon: Rocket },
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
        { id: 'recurring-expenses', label: 'Recurring Expenses', icon: Repeat },
        { id: 'recurring-income', label: 'Recurring Income', icon: TrendingUp },
        { id: 'portfolio', label: 'Portfolio', icon: PieChart },
        { id: 'budget', label: 'Budget', icon: PieChart },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b-2 border-border bg-background/95 backdrop-blur sticky top-0 z-10">
                <div className="container py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                <BookOpen className="h-8 w-8" />
                                Documentation
                            </h1>
                            <p className="text-muted-foreground mt-1">Learn how to use Finance Tracker</p>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search docs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 border-2"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-32">
                            <nav className="space-y-1">
                                {sections.map((section) => {
                                    const Icon = section.icon;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => scrollToSection(section.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === section.id
                                                    ? 'bg-primary text-primary-foreground font-medium'
                                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{section.label}</span>
                                            {activeSection === section.id && <ChevronRight className="h-4 w-4 ml-auto" />}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3 space-y-12">
                        {/* Getting Started */}
                        <section id="getting-started" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold mb-4">Welcome to Finance Tracker! 👋</h2>
                            <p className="text-lg text-muted-foreground mb-6">
                                Finance Tracker is your personal financial management tool that helps you take control of your money.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <Card className="border-2">
                                    <CardContent className="p-6">
                                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-3" />
                                        <h3 className="font-bold mb-2">Track Transactions</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Record all your income and expenses with detailed categories
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-2">
                                    <CardContent className="p-6">
                                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-3" />
                                        <h3 className="font-bold mb-2">Recurring Payments</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Automate tracking of recurring expenses and income
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-2">
                                    <CardContent className="p-6">
                                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-3" />
                                        <h3 className="font-bold mb-2">Investment Portfolio</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Monitor your stocks and cryptocurrency holdings
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-2">
                                    <CardContent className="p-6">
                                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-3" />
                                        <h3 className="font-bold mb-2">Budget Management</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Set budgets and track your spending by category
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-2 border-primary/20 bg-primary/5">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Rocket className="h-5 w-5" />
                                        Quick Start Guide
                                    </h3>
                                    <ol className="space-y-3">
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                                            <div>
                                                <strong>Set up your profile</strong>
                                                <p className="text-sm text-muted-foreground">Go to Settings and add your personal details</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                                            <div>
                                                <strong>Add your first transaction</strong>
                                                <p className="text-sm text-muted-foreground">Click "Add Transaction" on the dashboard</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                                            <div>
                                                <strong>Create a budget</strong>
                                                <p className="text-sm text-muted-foreground">Navigate to Budget and set your monthly limits</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</span>
                                            <div>
                                                <strong>Track investments</strong>
                                                <p className="text-sm text-muted-foreground">Add your stocks and crypto to Portfolio</p>
                                            </div>
                                        </li>
                                    </ol>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Dashboard */}
                        <section id="dashboard" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
                            <p className="text-muted-foreground mb-6">
                                Your financial overview at a glance. The dashboard shows your current balance, recent transactions, and spending trends.
                            </p>

                            <Card className="border-2 mb-6">
                                <CardContent className="p-6">
                                    <h3 className="font-bold mb-3">Understanding Your Dashboard</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                            <span><strong>Current Balance:</strong> Shows your total balance (income - expenses)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                            <span><strong>Monthly Summary:</strong> Income and expenses for the current month</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                            <span><strong>Recent Transactions:</strong> Your latest 5 transactions</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                            <span><strong>Spending Chart:</strong> Visual breakdown of expenses by category</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-blue-500/20 bg-blue-500/5">
                                <CardContent className="p-4 flex gap-3">
                                    <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <div className="text-sm">
                                        <strong>Tip:</strong> Click on any widget to navigate to the detailed view
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Transactions */}
                        <section id="transactions" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold mb-4">Transactions</h2>
                            <p className="text-muted-foreground mb-6">
                                Track all your financial transactions in one place. Add income and expenses with detailed information.
                            </p>

                            <Card className="border-2 mb-6">
                                <CardContent className="p-6">
                                    <h3 className="font-bold mb-3">Adding a Transaction</h3>
                                    <ol className="space-y-2 text-sm list-decimal list-inside">
                                        <li>Click the "Add Transaction" button</li>
                                        <li>Select transaction type (Income or Expense)</li>
                                        <li>Enter the amount</li>
                                        <li>Choose a category</li>
                                        <li>Add a description (optional)</li>
                                        <li>Select the date</li>
                                        <li>Click "Save"</li>
                                    </ol>
                                </CardContent>
                            </Card>

                            <Card className="border-2 mb-6">
                                <CardContent className="p-6">
                                    <h3 className="font-bold mb-3">Categories</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Organize your transactions with categories:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <strong>Income:</strong>
                                            <ul className="ml-4 mt-1 space-y-1 text-muted-foreground">
                                                <li>• Salary</li>
                                                <li>• Freelance</li>
                                                <li>• Investment</li>
                                                <li>• Other</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <strong>Expenses:</strong>
                                            <ul className="ml-4 mt-1 space-y-1 text-muted-foreground">
                                                <li>• Food & Dining</li>
                                                <li>• Transportation</li>
                                                <li>• Shopping</li>
                                                <li>• Bills & Utilities</li>
                                                <li>• Entertainment</li>
                                                <li>• Healthcare</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-orange-500/20 bg-orange-500/5">
                                <CardContent className="p-4 flex gap-3">
                                    <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                                    <div className="text-sm">
                                        <strong>Note:</strong> Deleted transactions cannot be recovered. Make sure to double-check before deleting.
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Recurring Expenses */}
                        <section id="recurring-expenses" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold mb-4">Recurring Expenses</h2>
                            <p className="text-muted-foreground mb-6">
                                Automate tracking of regular expenses like rent, subscriptions, and bills.
                            </p>

                            <Card className="border-2 mb-6">
                                <CardContent className="p-6">
                                    <h3 className="font-bold mb-3">Setting Up Recurring Expenses</h3>
                                    <ol className="space-y-2 text-sm list-decimal list-inside">
                                        <li>Navigate to "Recurring Expenses"</li>
                                        <li>Click "Add Recurring Expense"</li>
                                        <li>Enter expense details (name, amount, category)</li>
                                        <li>Choose frequency (Daily, Weekly, Monthly, Yearly)</li>
                                        <li>Set start date</li>
                                        <li>Save the recurring expense</li>
                                    </ol>
                                </CardContent>
                            </Card>

                            <Card className="border-2 mb-6">
                                <CardContent className="p-6">
                                    <h3 className="font-bold mb-3">Auto-Generation</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        The app automatically generates transactions based on your recurring expenses:
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                            <span>Transactions are created when you visit the page</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                            <span>Only generates transactions for dates that have passed</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                            <span>Prevents duplicate transactions</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Recurring Income */}
                        <section id="recurring-income" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold mb-4">Recurring Income</h2>
                            <p className="text-muted-foreground mb-6">
                                Track regular income sources like salary, rental income, or dividends.
                            </p>

                            <Card className="border-2 mb-6">
                                <CardContent className="p-6">
                                    <h3 className="font-bold mb-3">Common Use Cases</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                                            <span><strong>Monthly Salary:</strong> Set frequency to "Monthly"</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                                            <span><strong>Bi-weekly Paycheck:</strong> Use "Weekly" with 2-week intervals</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                                            <span><strong>Rental Income:</strong> Set to "Monthly" for rent payments</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Portfolio */}
                        <section id="portfolio" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold mb-4">Portfolio</h2>
                            <p className="text-muted-foreground mb-6">
                                Track your investment holdings including stocks and cryptocurrencies.
                            </p>

                            <Card className="border-2 mb-6">
                                <CardContent className="p-6">
                                    <h3 className="font-bold mb-3">Adding Holdings</h3>
                                    <ol className="space-y-2 text-sm list-decimal list-inside">
                                        <li>Go to Portfolio page</li>
                                        <li>Click "Add Holding"</li>
                                        <li>Select asset type (Stock or Crypto)</li>
                                        <li>Enter ticker symbol (e.g., AAPL, BTC)</li>
                                        <li>Enter quantity and purchase price</li>
                                        <li>Select purchase date</li>
                                        <li>Save the holding</li>
                                    </ol>
                                </CardContent>
                            </Card>

                            <Card className="border-2 mb-6">
                                <CardContent className="p-6">
                                    <h3 className="font-bold mb-3">Portfolio Summary</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Your portfolio shows:
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                            <span><strong>Total Invested:</strong> Sum of all purchase costs</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                            <span><strong>Holdings Count:</strong> Number of different assets</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                            <span><strong>Export:</strong> Download your portfolio as CSV</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Budget */}
                        <section id="budget" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold mb-4">Budget</h2>
                            <p className="text-muted-foreground mb-6">
                                Set spending limits for different categories and track your progress.
                            </p>

                            <Card className="border-2 mb-6">
                                <CardContent className="p-6">
                                    <h3 className="font-bold mb-3">Creating a Budget</h3>
                                    <ol className="space-y-2 text-sm list-decimal list-inside">
                                        <li>Navigate to Budget page</li>
                                        <li>Click "Add Budget"</li>
                                        <li>Select category</li>
                                        <li>Set monthly limit</li>
                                        <li>Save the budget</li>
                                    </ol>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-blue-500/20 bg-blue-500/5">
                                <CardContent className="p-4 flex gap-3">
                                    <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <div className="text-sm">
                                        <strong>Tip:</strong> Start with realistic budgets based on your past spending patterns
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Settings */}
                        <section id="settings" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold mb-4">Settings</h2>
                            <p className="text-muted-foreground mb-6">
                                Customize your Finance Tracker experience.
                            </p>

                            <Card className="border-2 mb-6">
                                <CardContent className="p-6">
                                    <h3 className="font-bold mb-3">Available Settings</h3>
                                    <ul className="space-y-3 text-sm">
                                        <li>
                                            <strong>Profile:</strong> Update your name and email
                                        </li>
                                        <li>
                                            <strong>Appearance:</strong> Customize theme colors for light and dark modes
                                        </li>
                                        <li>
                                            <strong>Language:</strong> Choose your preferred language
                                        </li>
                                        <li>
                                            <strong>Theme:</strong> Switch between Light, Dark, or System theme
                                        </li>
                                        <li>
                                            <strong>Security:</strong> Change your password
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-2 mb-6">
                                <CardContent className="p-6">
                                    <h3 className="font-bold mb-3">Theme Customization</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Personalize your app's appearance:
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                            <span>Choose from 5 preset themes</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                            <span>Customize primary and accent colors</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                            <span>Set custom colors for income and expenses</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                            <span>Separate settings for light and dark modes</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Docs;
