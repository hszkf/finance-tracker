import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  X,
  Receipt,
  TrendingUp,
  TrendingDown,
  Wallet,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export const Route = createFileRoute("/transactions/")({
  component: TransactionsPage,
});

// Empty state component
function EmptyState() {
  return (
    <div className="empty-state py-20">
      <div className="empty-state-icon">
        <Receipt className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-2xl font-bold">No transactions yet</h3>
      <p className="text-muted-foreground mt-2 max-w-md">
        Start tracking your finances by adding your first transaction.
      </p>
      <Link to="/transactions/new">
        <Button size="lg" className="mt-6 rounded-xl gradient-bg hover:opacity-90 gap-2 shadow-lg">
          <Plus className="h-5 w-5" />
          Add Your First Transaction
        </Button>
      </Link>
    </div>
  );
}

const categories = [
  "All Categories",
  "Food & Dining",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Shopping",
  "Income",
  "Other",
];

const accounts = ["All Accounts", "Main Account", "Credit Card", "Savings"];

const dateRanges = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedAccount, setSelectedAccount] = useState("All Accounts");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // TODO: Replace with actual API data
  const transactions: Array<{
    id: string;
    description: string;
    category: string;
    amount: number;
    date: Date;
    account: string;
    type: string;
  }> = [];

  const hasTransactions = transactions.length > 0;

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      transaction.category === selectedCategory;
    const matchesAccount =
      selectedAccount === "All Accounts" || transaction.account === selectedAccount;

    return matchesSearch && matchesCategory && matchesAccount;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netBalance = totalIncome - totalExpenses;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedAccount("All Accounts");
    setSelectedDateRange("all");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "All Categories" ||
    selectedAccount !== "All Accounts" ||
    selectedDateRange !== "all";

  const activeFilterCount = [
    selectedCategory !== "All Categories",
    selectedAccount !== "All Accounts",
    selectedDateRange !== "all",
  ].filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-lg mt-1">
            View and manage all your transactions
          </p>
        </div>
        <Link to="/transactions/new">
          <Button className="rounded-xl gradient-bg hover:opacity-90 gap-2 shadow-lg h-11">
            <Plus className="h-5 w-5" />
            Add Transaction
          </Button>
        </Link>
      </div>

      {hasTransactions ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:gap-6 md:grid-cols-3">
            {/* Income Card */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                    <p className="text-3xl font-bold mt-1 text-emerald-500 currency">
                      +{formatCurrency(totalIncome)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {filteredTransactions.filter(t => t.amount > 0).length} transactions
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expenses Card */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-rose-500/10 to-rose-600/5 border-rose-500/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                    <p className="text-3xl font-bold mt-1 text-rose-500 currency">
                      -{formatCurrency(totalExpenses)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {filteredTransactions.filter(t => t.amount < 0).length} transactions
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-rose-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Net Balance Card */}
            <Card className="relative overflow-hidden border-0 gradient-bg text-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Net Balance</p>
                    <p className="text-3xl font-bold mt-1 currency">
                      {netBalance >= 0 ? "+" : ""}{formatCurrency(netBalance)}
                    </p>
                    <p className="text-xs text-white/80 mt-2">
                      {filteredTransactions.length} total transactions
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Wallet className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col gap-4">
                {/* Search Row */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11 rounded-xl bg-secondary/50 border-border/50"
                    />
                  </div>
                  <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-11 rounded-xl gap-2 sm:w-auto"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {activeFilterCount > 0 && (
                          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {activeFilterCount}
                          </span>
                        )}
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          showFilters && "rotate-180"
                        )} />
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                </div>

                {/* Filter Row */}
                <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                  <CollapsibleContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3 pt-2">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder="Account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account} value={account}>
                              {account}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <Calendar className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Date Range" />
                        </SelectTrigger>
                        <SelectContent>
                          {dateRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Active Filters */}
                {hasActiveFilters && (
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-sm text-muted-foreground">
                      {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""} found
                    </span>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 rounded-lg gap-1 text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">All Transactions</CardTitle>
              <CardDescription>
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No transactions found</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Try adjusting your search or filters to find what you're looking for
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 rounded-xl" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className={cn(
                        "transaction-item fade-in-up",
                        `stagger-${(index % 5) + 1}`
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl",
                            transaction.amount > 0
                              ? "bg-emerald-500/20 text-emerald-500"
                              : "bg-rose-500/20 text-rose-500"
                          )}
                        >
                          {transaction.amount > 0 ? (
                            <ArrowUpRight className="h-5 w-5" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-secondary">
                              {transaction.category}
                            </span>
                            <span className="text-border">•</span>
                            <span className="truncate">{transaction.account}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "text-lg font-bold currency",
                            transaction.amount > 0
                              ? "text-emerald-500"
                              : "text-foreground"
                          )}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-0 bg-card/50 backdrop-blur">
          <CardContent>
            <EmptyState />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
