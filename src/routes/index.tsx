import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  TrendingUp,
  Wallet,
  PiggyBank,
  Receipt,
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
  Legend,
  Tooltip,
} from "recharts";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

// Mock data - replace with real API data
const overviewData = {
  totalBalance: 12450.0,
  monthlySpending: 3240.5,
  monthlyBudget: 4000.0,
  savingsGoal: 15000.0,
  currentSavings: 8500.0,
};

const recentTransactions = [
  {
    id: "1",
    description: "Grocery Store",
    category: "Food & Dining",
    amount: -85.5,
    date: new Date(),
    account: "Main Account",
  },
  {
    id: "2",
    description: "Salary Deposit",
    category: "Income",
    amount: 4500.0,
    date: new Date(Date.now() - 86400000),
    account: "Main Account",
  },
  {
    id: "3",
    description: "Netflix Subscription",
    category: "Entertainment",
    amount: -15.99,
    date: new Date(Date.now() - 86400000 * 2),
    account: "Credit Card",
  },
  {
    id: "4",
    description: "Electric Bill",
    category: "Utilities",
    amount: -120.0,
    date: new Date(Date.now() - 86400000 * 3),
    account: "Main Account",
  },
  {
    id: "5",
    description: "Coffee Shop",
    category: "Food & Dining",
    amount: -4.5,
    date: new Date(Date.now() - 86400000 * 4),
    account: "Credit Card",
  },
];

const spendingByCategory = [
  { name: "Food & Dining", value: 450, color: "#3b82f6" },
  { name: "Transportation", value: 280, color: "#10b981" },
  { name: "Entertainment", value: 150, color: "#f59e0b" },
  { name: "Utilities", value: 320, color: "#ef4444" },
  { name: "Shopping", value: 200, color: "#8b5cf6" },
  { name: "Other", value: 100, color: "#6b7280" },
];

function DashboardPage() {
  const budgetPercentage = Math.round(
    (overviewData.monthlySpending / overviewData.monthlyBudget) * 100
  );
  const savingsPercentage = Math.round(
    (overviewData.currentSavings / overviewData.savingsGoal) * 100
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your financial overview.
          </p>
        </div>
        <Link to="/transactions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overviewData.totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overviewData.monthlySpending)}
            </div>
            <div className="flex items-center text-xs">
              <span
                className={cn(
                  "font-medium",
                  budgetPercentage > 100 ? "text-destructive" : "text-green-600"
                )}
              >
                {budgetPercentage}% of budget
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overviewData.monthlyBudget)}
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-secondary">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  budgetPercentage > 100 ? "bg-destructive" : "bg-primary"
                )}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overviewData.currentSavings)}
            </div>
            <p className="text-xs text-muted-foreground">
              {savingsPercentage}% of {formatCurrency(overviewData.savingsGoal)} goal
            </p>
            <div className="mt-2 h-2 w-full rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
                style={{ width: `${Math.min(savingsPercentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Spending by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Your spending breakdown this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
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
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </div>
            <Link to="/transactions">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        transaction.amount > 0
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      )}
                    >
                      {transaction.amount > 0 ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category} - {formatRelativeDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "font-semibold",
                      transaction.amount > 0 ? "text-green-600" : "text-foreground"
                    )}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
