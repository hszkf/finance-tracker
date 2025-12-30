import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Utensils,
  Car,
  Gamepad2,
  ShoppingBag,
  Lightbulb,
  Heart,
  Home,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency, calculatePercentage } from "@/lib/utils";

export const Route = createFileRoute("/budgets/")({
  component: BudgetsPage,
});

const categoryConfig = [
  { value: "food", label: "Food & Dining", icon: Utensils, color: "from-orange-500/20 to-orange-600/10", iconColor: "text-orange-500", bgColor: "bg-orange-500/20" },
  { value: "transport", label: "Transportation", icon: Car, color: "from-blue-500/20 to-blue-600/10", iconColor: "text-blue-500", bgColor: "bg-blue-500/20" },
  { value: "entertainment", label: "Entertainment", icon: Gamepad2, color: "from-purple-500/20 to-purple-600/10", iconColor: "text-purple-500", bgColor: "bg-purple-500/20" },
  { value: "shopping", label: "Shopping", icon: ShoppingBag, color: "from-pink-500/20 to-pink-600/10", iconColor: "text-pink-500", bgColor: "bg-pink-500/20" },
  { value: "utilities", label: "Utilities", icon: Lightbulb, color: "from-yellow-500/20 to-yellow-600/10", iconColor: "text-yellow-500", bgColor: "bg-yellow-500/20" },
  { value: "healthcare", label: "Healthcare", icon: Heart, color: "from-red-500/20 to-red-600/10", iconColor: "text-red-500", bgColor: "bg-red-500/20" },
  { value: "housing", label: "Housing", icon: Home, color: "from-emerald-500/20 to-emerald-600/10", iconColor: "text-emerald-500", bgColor: "bg-emerald-500/20" },
  { value: "other", label: "Other", icon: MoreHorizontal, color: "from-slate-500/20 to-slate-600/10", iconColor: "text-slate-500", bgColor: "bg-slate-500/20" },
];

// Empty state component
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="empty-state py-20">
      <div className="empty-state-icon">
        <PiggyBank className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-2xl font-bold">No budgets yet</h3>
      <p className="text-muted-foreground mt-2 max-w-md">
        Create budgets to track your spending and stay on top of your financial goals.
      </p>
      <Button size="lg" className="mt-6 rounded-xl gradient-bg hover:opacity-90 gap-2 shadow-lg" onClick={onAdd}>
        <Plus className="h-5 w-5" />
        Create Your First Budget
      </Button>
    </div>
  );
}

function BudgetsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    name: "",
    category: "",
    amount: "",
    period: "monthly",
  });

  // TODO: Replace with actual API data
  const budgets: Array<{
    id: string;
    name: string;
    category: string;
    budgeted: number;
    spent: number;
  }> = [];

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = calculatePercentage(totalSpent, totalBudgeted);
  const totalRemaining = totalBudgeted - totalSpent;

  const getCategoryConfig = (categoryValue: string) => {
    return categoryConfig.find((c) => c.value === categoryValue) || categoryConfig[categoryConfig.length - 1];
  };

  const handleAddBudget = () => {
    // TODO: Implement add budget functionality
    console.log("Adding budget:", newBudget);
    setIsAddDialogOpen(false);
    setNewBudget({ name: "", category: "", amount: "", period: "monthly" });
  };

  const hasBudgets = budgets.length > 0;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-rose-500";
    if (percentage >= 80) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-500">
          <AlertTriangle className="h-3 w-3" />
          Over Budget
        </span>
      );
    }
    if (percentage >= 80) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-500">
          <TrendingUp className="h-3 w-3" />
          Almost There
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-500">
        <Sparkles className="h-3 w-3" />
        On Track
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground text-lg mt-1">
            Track your spending against budgets
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gradient-bg hover:opacity-90 gap-2 shadow-lg h-11">
              <Plus className="h-5 w-5" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Create New Budget</DialogTitle>
              <DialogDescription>
                Set a spending limit for a category
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Budget Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Monthly Groceries"
                  value={newBudget.name}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, name: e.target.value })
                  }
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newBudget.category}
                  onValueChange={(value) =>
                    setNewBudget({ ...newBudget, category: value })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryConfig.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-3">
                          <category.icon className={cn("h-4 w-4", category.iconColor)} />
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Select
                  value={newBudget.period}
                  onValueChange={(value) =>
                    setNewBudget({ ...newBudget, period: value })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Budget Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={newBudget.amount}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, amount: e.target.value })
                  }
                  className="h-11 rounded-xl currency"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleAddBudget} className="rounded-xl gradient-bg hover:opacity-90">
                Create Budget
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {hasBudgets ? (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:gap-6 md:grid-cols-3">
            {/* Monthly Budget Card */}
            <Card className="relative overflow-hidden border-0 gradient-bg text-white md:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-sm font-medium text-white/80">Monthly Overview</p>
                    <p className="text-3xl font-bold mt-1 currency">
                      {formatCurrency(totalSpent)}
                    </p>
                    <p className="text-sm text-white/80 mt-1">
                      of {formatCurrency(totalBudgeted)} budgeted
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <PiggyBank className="h-6 w-6" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">{overallPercentage}% spent</span>
                    <span className={cn(
                      overallPercentage > 100 ? "text-rose-300" : "text-emerald-300"
                    )}>
                      {formatCurrency(Math.abs(totalRemaining))} {totalRemaining >= 0 ? "remaining" : "over"}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-white/20">
                    <div
                      className={cn(
                        "h-3 rounded-full transition-all duration-500",
                        overallPercentage > 100 ? "bg-rose-400" : "bg-white"
                      )}
                      style={{ width: `${Math.min(overallPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            </Card>

            {/* Budget Health Card */}
            <Card className={cn(
              "relative overflow-hidden border-0",
              overallPercentage > 100
                ? "bg-gradient-to-br from-rose-500/10 to-rose-600/5 border-rose-500/20"
                : overallPercentage >= 80
                  ? "bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20"
                  : "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
            )}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Budget Health</p>
                    <p className={cn(
                      "text-3xl font-bold mt-1",
                      overallPercentage > 100
                        ? "text-rose-500"
                        : overallPercentage >= 80
                          ? "text-amber-500"
                          : "text-emerald-500"
                    )}>
                      {overallPercentage > 100 ? "Over" : overallPercentage >= 80 ? "Warning" : "Healthy"}
                    </p>
                    <div className="mt-2">
                      {getStatusBadge(overallPercentage)}
                    </div>
                  </div>
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center",
                    overallPercentage > 100
                      ? "bg-rose-500/20 text-rose-500"
                      : overallPercentage >= 80
                        ? "bg-amber-500/20 text-amber-500"
                        : "bg-emerald-500/20 text-emerald-500"
                  )}>
                    {overallPercentage > 100
                      ? <TrendingDown className="h-6 w-6" />
                      : <TrendingUp className="h-6 w-6" />
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget Cards Grid */}
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget, index) => {
              const percentage = calculatePercentage(budget.spent, budget.budgeted);
              const isOverBudget = budget.spent > budget.budgeted;
              const remaining = budget.budgeted - budget.spent;
              const config = getCategoryConfig(budget.category);
              const Icon = config.icon;

              return (
                <Card
                  key={budget.id}
                  className={cn(
                    "relative overflow-hidden border-0 bg-card/50 backdrop-blur hover-lift cursor-pointer transition-all duration-200 fade-in-up",
                    `stagger-${(index % 5) + 1}`
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center",
                          config.bgColor
                        )}>
                          <Icon className={cn("h-6 w-6", config.iconColor)} />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{budget.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{config.label}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold currency">
                            {formatCurrency(budget.spent)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            of {formatCurrency(budget.budgeted)}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "text-right",
                            isOverBudget ? "text-rose-500" : "text-emerald-500"
                          )}
                        >
                          <p className="text-sm font-medium">
                            {isOverBudget ? "Over by" : "Remaining"}
                          </p>
                          <p className="font-bold currency">
                            {formatCurrency(Math.abs(remaining))}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{percentage}% spent</span>
                          {getStatusBadge(percentage)}
                        </div>
                        <div className="progress-bar">
                          <div
                            className={cn("progress-bar-fill", getProgressColor(percentage))}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <Card className="border-0 bg-card/50 backdrop-blur">
          <CardContent>
            <EmptyState onAdd={() => setIsAddDialogOpen(true)} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
