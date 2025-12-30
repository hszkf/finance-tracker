import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  CreditCard,
  Building2,
  PiggyBank,
  Wallet,
  TrendingUp,
  TrendingDown,
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
import { cn, formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/accounts/")({
  component: AccountsPage,
});

const accountTypes = [
  { value: "bank", label: "Bank Account", icon: Building2, color: "from-blue-500/20 to-blue-600/10" },
  { value: "credit_card", label: "Credit Card", icon: CreditCard, color: "from-purple-500/20 to-purple-600/10" },
  { value: "cash", label: "Cash", icon: Wallet, color: "from-emerald-500/20 to-emerald-600/10" },
  { value: "ewallet", label: "E-Wallet", icon: PiggyBank, color: "from-amber-500/20 to-amber-600/10" },
];

// Empty state component
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="empty-state py-20">
      <div className="empty-state-icon">
        <Wallet className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-2xl font-bold">No accounts yet</h3>
      <p className="text-muted-foreground mt-2 max-w-md">
        Add your bank accounts, credit cards, or cash to start tracking your finances.
      </p>
      <Button size="lg" className="mt-6 rounded-xl gradient-bg hover:opacity-90 gap-2 shadow-lg" onClick={onAdd}>
        <Plus className="h-5 w-5" />
        Add Your First Account
      </Button>
    </div>
  );
}

function AccountsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "",
    balance: "",
    currency: "GBP",
  });

  // TODO: Replace with actual API data
  const accounts: Array<{
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    isActive: boolean;
  }> = [];

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalAssets = accounts
    .filter((acc) => acc.balance > 0)
    .reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = accounts
    .filter((acc) => acc.balance < 0)
    .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);

  const getAccountType = (type: string) => {
    return accountTypes.find((t) => t.value === type) || accountTypes[0];
  };

  const handleAddAccount = () => {
    // TODO: Implement add account functionality
    console.log("Adding account:", newAccount);
    setIsAddDialogOpen(false);
    setNewAccount({ name: "", type: "", balance: "", currency: "GBP" });
  };

  const hasAccounts = accounts.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground text-lg mt-1">
            Manage your financial accounts
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gradient-bg hover:opacity-90 gap-2 shadow-lg h-11">
              <Plus className="h-5 w-5" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Account</DialogTitle>
              <DialogDescription>
                Add a new financial account to track your finances
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Monzo Current Account"
                  value={newAccount.name}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, name: e.target.value })
                  }
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Account Type</Label>
                <Select
                  value={newAccount.type}
                  onValueChange={(value) =>
                    setNewAccount({ ...newAccount, type: value })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-3">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={newAccount.currency}
                  onValueChange={(value) =>
                    setNewAccount({ ...newAccount, currency: value })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Current Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newAccount.balance}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, balance: e.target.value })
                  }
                  className="h-11 rounded-xl currency"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleAddAccount} className="rounded-xl gradient-bg hover:opacity-90">
                Add Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {hasAccounts ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:gap-6 md:grid-cols-3">
            <Card className="relative overflow-hidden border-0 gradient-bg text-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Net Worth</p>
                    <p className="text-3xl font-bold mt-1 currency">
                      {formatCurrency(totalBalance)}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-white/80">
                      <TrendingUp className="h-3 w-3" />
                      <span>+12.5% from last month</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Wallet className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                    <p className="text-3xl font-bold mt-1 text-emerald-500 currency">
                      {formatCurrency(totalAssets)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {accounts.filter(a => a.balance > 0).length} accounts
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-rose-500/10 to-rose-600/5 border-rose-500/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Liabilities</p>
                    <p className="text-3xl font-bold mt-1 text-rose-500 currency">
                      {formatCurrency(totalLiabilities)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {accounts.filter(a => a.balance < 0).length} accounts
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-rose-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accounts List */}
          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">All Accounts</CardTitle>
              <CardDescription>
                {accounts.length} account{accounts.length !== 1 ? "s" : ""} connected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accounts.map((account, index) => {
                  const accountType = getAccountType(account.type);
                  const Icon = accountType.icon;
                  return (
                    <div
                      key={account.id}
                      className={cn(
                        "flex items-center justify-between rounded-xl p-4 transition-all duration-200 hover-lift cursor-pointer fade-in-up",
                        `bg-gradient-to-r ${accountType.color}`,
                        `stagger-${index + 1}`
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-xl",
                            account.balance >= 0
                              ? "bg-emerald-500/20 text-emerald-500"
                              : "bg-rose-500/20 text-rose-500"
                          )}
                        >
                          <Icon className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{account.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {account.type.replace("_", " ")} • {account.currency}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p
                            className={cn(
                              "text-xl font-bold currency",
                              account.balance >= 0
                                ? "text-foreground"
                                : "text-rose-500"
                            )}
                          >
                            {formatCurrency(account.balance, account.currency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {account.isActive ? "Active" : "Inactive"}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
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
