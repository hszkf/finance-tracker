import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Pencil,
  Trash2,
  ShoppingCart,
  Utensils,
  Car,
  Film,
  Zap,
  Heart,
  MoreVertical,
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

// Mock data - replace with real API data
const budgets = [
  {
    id: "1",
    name: "Food & Dining",
    category: "Food & Dining",
    budgeted: 600,
    spent: 450,
    icon: Utensils,
    color: "bg-orange-500",
  },
  {
    id: "2",
    name: "Transportation",
    category: "Transportation",
    budgeted: 300,
    spent: 280,
    icon: Car,
    color: "bg-blue-500",
  },
  {
    id: "3",
    name: "Entertainment",
    category: "Entertainment",
    budgeted: 200,
    spent: 150,
    icon: Film,
    color: "bg-purple-500",
  },
  {
    id: "4",
    name: "Shopping",
    category: "Shopping",
    budgeted: 400,
    spent: 520,
    icon: ShoppingCart,
    color: "bg-pink-500",
  },
  {
    id: "5",
    name: "Utilities",
    category: "Utilities",
    budgeted: 250,
    spent: 220,
    icon: Zap,
    color: "bg-yellow-500",
  },
  {
    id: "6",
    name: "Healthcare",
    category: "Healthcare",
    budgeted: 150,
    spent: 80,
    icon: Heart,
    color: "bg-red-500",
  },
];

const categories = [
  "Food & Dining",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Utilities",
  "Healthcare",
  "Other",
];

function BudgetsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    name: "",
    category: "",
    amount: "",
  });

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = calculatePercentage(totalSpent, totalBudgeted);

  const handleAddBudget = () => {
    // TODO: Implement add budget functionality
    console.log("Adding budget:", newBudget);
    setIsAddDialogOpen(false);
    setNewBudget({ name: "", category: "", amount: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Track your spending against budgets
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>
                Set a spending limit for a category
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Budget Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Monthly Groceries"
                  value={newBudget.name}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, name: e.target.value })
                  }
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Monthly Budget</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    GBP
                  </span>
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
                    className="pl-14"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBudget}>Create Budget</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
          <CardDescription>
            Your spending progress for this month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{overallPercentage}% spent</span>
              <span
                className={cn(
                  overallPercentage > 100 ? "text-red-600" : "text-green-600"
                )}
              >
                {formatCurrency(totalBudgeted - totalSpent)} remaining
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-secondary">
              <div
                className={cn(
                  "h-3 rounded-full transition-all",
                  overallPercentage > 100 ? "bg-red-500" : "bg-primary"
                )}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const percentage = calculatePercentage(budget.spent, budget.budgeted);
          const isOverBudget = budget.spent > budget.budgeted;
          const remaining = budget.budgeted - budget.spent;

          return (
            <Card key={budget.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg text-white",
                        budget.color
                      )}
                    >
                      <budget.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{budget.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {budget.category}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(budget.spent)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      of {formatCurrency(budget.budgeted)}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "text-right",
                      isOverBudget ? "text-red-600" : "text-green-600"
                    )}
                  >
                    <p className="text-sm font-medium">
                      {isOverBudget ? "Over by" : "Left"}
                    </p>
                    <p className="font-semibold">
                      {formatCurrency(Math.abs(remaining))}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage}%</span>
                    {isOverBudget && (
                      <span className="text-red-600">Over budget!</span>
                    )}
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        isOverBudget ? "bg-red-500" : "bg-primary"
                      )}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
