import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  CreditCard,
  Building2,
  PiggyBank,
  Wallet,
  MoreVertical,
  TrendingUp,
  TrendingDown,
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

// Mock data - replace with real API data
const accounts = [
  {
    id: "1",
    name: "Main Account",
    type: "checking",
    balance: 5420.5,
    institution: "Barclays",
    lastUpdated: new Date(),
    monthlyChange: 350,
  },
  {
    id: "2",
    name: "Credit Card",
    type: "credit",
    balance: -1250.0,
    institution: "HSBC",
    lastUpdated: new Date(),
    monthlyChange: -200,
  },
  {
    id: "3",
    name: "Savings Account",
    type: "savings",
    balance: 8500.0,
    institution: "Nationwide",
    lastUpdated: new Date(),
    monthlyChange: 500,
  },
  {
    id: "4",
    name: "Emergency Fund",
    type: "savings",
    balance: 3000.0,
    institution: "Marcus",
    lastUpdated: new Date(),
    monthlyChange: 200,
  },
];

const accountTypes = [
  { value: "checking", label: "Checking Account", icon: Building2 },
  { value: "savings", label: "Savings Account", icon: PiggyBank },
  { value: "credit", label: "Credit Card", icon: CreditCard },
  { value: "cash", label: "Cash", icon: Wallet },
];

function AccountsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "",
    balance: "",
    institution: "",
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalAssets = accounts
    .filter((acc) => acc.balance > 0)
    .reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = accounts
    .filter((acc) => acc.balance < 0)
    .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);

  const getAccountIcon = (type: string) => {
    const accountType = accountTypes.find((t) => t.value === type);
    return accountType?.icon || Wallet;
  };

  const handleAddAccount = () => {
    // TODO: Implement add account functionality
    console.log("Adding account:", newAccount);
    setIsAddDialogOpen(false);
    setNewAccount({ name: "", type: "", balance: "", institution: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your financial accounts
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
              <DialogDescription>
                Add a new financial account to track your finances
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Main Checking Account"
                  value={newAccount.name}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, name: e.target.value })
                  }
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Current Balance</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    GBP
                  </span>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newAccount.balance}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, balance: e.target.value })
                    }
                    className="pl-14"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution">Institution (Optional)</Label>
                <Input
                  id="institution"
                  placeholder="e.g., Barclays, HSBC"
                  value={newAccount.institution}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, institution: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAccount}>Add Account</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Worth</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                totalBalance >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {formatCurrency(totalBalance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalAssets)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Liabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalLiabilities)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
          <CardDescription>
            {accounts.length} account{accounts.length !== 1 ? "s" : ""} connected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.map((account) => {
              const Icon = getAccountIcon(account.type);
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full",
                        account.balance >= 0
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{account.institution}</span>
                        {account.institution && <span>-</span>}
                        <span className="capitalize">{account.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-lg font-semibold",
                          account.balance >= 0
                            ? "text-foreground"
                            : "text-red-600"
                        )}
                      >
                        {formatCurrency(account.balance)}
                      </p>
                      <div
                        className={cn(
                          "flex items-center justify-end gap-1 text-sm",
                          account.monthlyChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {account.monthlyChange >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>
                          {account.monthlyChange >= 0 ? "+" : ""}
                          {formatCurrency(account.monthlyChange)}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
