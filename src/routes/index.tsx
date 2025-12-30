import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Receipt,
  BarChart3,
  Sparkles,
  ArrowRight,
  Target,
  CreditCard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, formatRelativeDate } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

// Empty state component with enhanced design
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">{description}</p>
      {action && (
        <Link to={action.href} className="mt-6">
          <Button className="rounded-xl gradient-bg hover:opacity-90 transition-opacity gap-2 shadow-lg">
            <Plus className="h-4 w-4" />
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
  className,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
  variant?: "default" | "income" | "expense" | "primary";
  className?: string;
}) {
  const variantStyles = {
    default: "bg-card",
    income: "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
    expense: "bg-gradient-to-br from-rose-500/10 to-rose-500/5 border-rose-500/20",
    primary: "gradient-bg text-white border-0",
  };

  const iconStyles = {
    default: "bg-secondary text-foreground",
    income: "bg-emerald-500/20 text-emerald-500",
    expense: "bg-rose-500/20 text-rose-500",
    primary: "bg-white/20 text-white",
  };

  return (
    <Card className={cn(
      "relative overflow-hidden border transition-all duration-300 hover-lift",
      variantStyles[variant],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className={cn(
              "text-sm font-medium",
              variant === "primary" ? "text-white/80" : "text-muted-foreground"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-3xl font-bold tracking-tight currency",
              variant === "income" && "text-emerald-500",
              variant === "expense" && "text-rose-500"
            )}>
              {value}
            </p>
            {trend && trendValue && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend === "up" ? "text-emerald-500" : "text-rose-500",
                variant === "primary" && "text-white/80"
              )}>
                {trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{trendValue} from last month</span>
              </div>
            )}
          </div>
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            iconStyles[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
      {/* Decorative gradient */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-2xl" />
    </Card>
  );
}

function DashboardPage() {
  // TODO: Replace with actual API data
  const transactions: Array<{
    id: string;
    description: string;
    category: string;
    amount: number;
    date: Date;
    account: string;
  }> = [];

  const spendingByCategory: Array<{
    name: string;
    value: number;
    color: string;
  }> = [];

  const overviewData = {
    totalBalance: 0,
    monthlySpending: 0,
    monthlyIncome: 0,
    monthlyBudget: 0,
    savingsGoal: 0,
    currentSavings: 0,
  };

  const budgetPercentage = overviewData.monthlyBudget > 0
    ? Math.round((overviewData.monthlySpending / overviewData.monthlyBudget) * 100)
    : 0;
  const savingsPercentage = overviewData.savingsGoal > 0
    ? Math.round((overviewData.currentSavings / overviewData.savingsGoal) * 100)
    : 0;

  const hasTransactions = transactions.length > 0;
  const hasSpendingData = spendingByCategory.length > 0;

  // Sample chart data for demo
  const monthlyTrend = [
    { month: "Jan", income: 0, expense: 0 },
    { month: "Feb", income: 0, expense: 0 },
    { month: "Mar", income: 0, expense: 0 },
    { month: "Apr", income: 0, expense: 0 },
    { month: "May", income: 0, expense: 0 },
    { month: "Jun", income: 0, expense: 0 },
  ];

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Header Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Good morning, <span className="gradient-text">Hasif</span>
            </h1>
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-lg">
            Here's your financial overview for today.
          </p>
        </div>
        <Link to="/transactions/new" className="hidden md:block">
          <Button
            className="rounded-xl gradient-bg hover:opacity-90 transition-all gap-2 shadow-lg glow-sm h-12 px-6"
            data-testid="quick-add-button"
          >
            <Plus className="h-5 w-5" />
            Add Transaction
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4" data-testid="overview-cards">
        <StatCard
          title="Total Balance"
          value={formatCurrency(overviewData.totalBalance)}
          icon={Wallet}
          variant="primary"
          trend="up"
          trendValue="+12.5%"
          className="col-span-2 lg:col-span-1"
          data-testid="overview-balance-card"
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(overviewData.monthlyIncome)}
          icon={TrendingUp}
          variant="income"
          trend="up"
          trendValue="+8.2%"
          data-testid="overview-income-card"
        />
        <StatCard
          title="Monthly Spending"
          value={formatCurrency(overviewData.monthlySpending)}
          icon={CreditCard}
          variant="expense"
          trend="down"
          trendValue="-3.1%"
          data-testid="overview-spending-card"
        />
        <StatCard
          title="Savings Goal"
          value={formatCurrency(overviewData.currentSavings)}
          icon={Target}
          variant="default"
          data-testid="overview-savings-card"
        />
      </div>

      {/* Budget Progress Card */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-secondary/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold">Monthly Budget</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(overviewData.monthlySpending)} of {formatCurrency(overviewData.monthlyBudget)} spent
              </p>
            </div>
            <div className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold",
              budgetPercentage > 100
                ? "bg-rose-500/10 text-rose-500"
                : budgetPercentage > 75
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-emerald-500/10 text-emerald-500"
            )}>
              {budgetPercentage}% used
            </div>
          </div>
          <div className="progress-bar h-3 rounded-full">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                budgetPercentage > 100
                  ? "bg-rose-500"
                  : budgetPercentage > 75
                    ? "bg-gradient-to-r from-amber-500 to-amber-400"
                    : "progress-bar-fill"
              )}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>GBP 0</span>
            <span>{formatCurrency(overviewData.monthlyBudget)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Recent Transactions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Spending Trend Chart */}
        <Card className="lg:col-span-2 border-0 bg-card/50 backdrop-blur" data-testid="spending-chart">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Spending Trend</CardTitle>
                <CardDescription>Income vs Expenses over time</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">
                View Report
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {hasSpendingData ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `£${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px hsl(var(--foreground) / 0.1)",
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="hsl(160, 84%, 39%)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorIncome)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="hsl(0, 84%, 60%)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorExpense)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No spending data yet"
                description="Add transactions to see your spending trends over time."
                action={{ label: "Add Transaction", href: "/transactions/new" }}
              />
            )}
          </CardContent>
        </Card>

        {/* Spending by Category */}
        <Card className="border-0 bg-card/50 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">By Category</CardTitle>
            <CardDescription>This month's breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {hasSpendingData ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {spendingByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <PiggyBank className="h-10 w-10 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">No categories yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-0 bg-card/50 backdrop-blur" data-testid="recent-transactions">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </div>
            <Link to="/transactions" data-testid="view-all-transactions">
              <Button variant="outline" className="rounded-xl gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {hasTransactions ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={cn(
                    "transaction-item fade-in-up",
                    `stagger-${index + 1}`
                  )}
                  data-testid="recent-transaction-item"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl",
                        transaction.amount > 0
                          ? "bg-income-soft text-income"
                          : "bg-expense-soft text-expense"
                      )}
                    >
                      {transaction.amount > 0 ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category} • {formatRelativeDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-bold currency",
                        transaction.amount > 0 ? "text-income" : "text-foreground"
                      )}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">{transaction.account}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              description="Start tracking your finances by adding your first transaction."
              action={{ label: "Add Transaction", href: "/transactions/new" }}
            />
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - Mobile */}
      <div className="md:hidden pb-20">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/transactions/new">
            <Card className="border-0 bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center mb-2">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium">Add Transaction</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/budgets">
            <Card className="border-0 bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-amber-500" />
                </div>
                <span className="text-sm font-medium">Set Budget</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
