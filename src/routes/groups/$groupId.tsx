import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Plus,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
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
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Users, Receipt } from "lucide-react";

export const Route = createFileRoute("/groups/$groupId")({
  component: GroupDetailsPage,
});

// Empty state for transactions
function EmptyTransactionsState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Receipt className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No expenses yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        Add your first expense to start tracking spending in this group.
      </p>
      <Button className="mt-4" onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Add Expense
      </Button>
    </div>
  );
}

// Empty state for members
function EmptyMembersState({ onInvite }: { onInvite: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">Just you so far</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Invite friends to split expenses.
      </p>
      <Button variant="outline" size="sm" className="mt-3" onClick={onInvite}>
        <UserPlus className="mr-2 h-4 w-4" />
        Invite Members
      </Button>
    </div>
  );
}

function GroupDetailsPage() {
  const { groupId: _groupId } = Route.useParams();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
  });

  // TODO: Replace with actual API data fetched based on groupId
  const group: {
    id: string;
    name: string;
    description: string;
    type: string;
    inviteCode: string;
    members: Array<{ id: string; name: string; avatar: string; email: string; balance: number }>;
    transactions: Array<{
      id: string;
      description: string;
      amount: number;
      paidBy: { id: string; name: string; avatar: string };
      date: Date;
      splitBetween: string[];
    }>;
    totalExpenses: number;
  } = {
    id: "",
    name: "Loading...",
    description: "",
    type: "other",
    inviteCode: "",
    members: [],
    transactions: [],
    totalExpenses: 0,
  };

  const hasTransactions = group.transactions.length > 0;
  const hasMembers = group.members.length > 0;

  const currentUser = group.members.find((m) => m.id === "1"); // TODO: Get from auth context

  const handleCopyInviteCode = async () => {
    await navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddExpense = () => {
    // TODO: Implement add expense functionality
    console.log("Adding expense:", newExpense);
    setIsAddExpenseDialogOpen(false);
    setNewExpense({ description: "", amount: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/groups">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
          <p className="text-muted-foreground">{group.description}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Members</DialogTitle>
                <DialogDescription>
                  Share this code to invite people to the group
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Invite Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={group.inviteCode}
                      readOnly
                      className="font-mono text-lg"
                    />
                    <Button onClick={handleCopyInviteCode}>
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Or invite by email</Label>
                  <Input placeholder="Enter email address" type="email" />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsInviteDialogOpen(false)}
                >
                  Close
                </Button>
                <Button>Send Invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isAddExpenseDialogOpen}
            onOpenChange={setIsAddExpenseDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
                <DialogDescription>
                  Add a new expense to split with the group
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Dinner at restaurant"
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
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
                      value={newExpense.amount}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, amount: e.target.value })
                      }
                      className="pl-14"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Split between</Label>
                  <div className="flex flex-wrap gap-2">
                    {group.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm bg-accent"
                      >
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                          {member.avatar}
                        </div>
                        {member.name.split(" ")[0]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddExpenseDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddExpense}>Add Expense</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(group.totalExpenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Your Balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                currentUser && currentUser.balance >= 0
                  ? "text-green-600"
                  : "text-red-600"
              )}
            >
              {currentUser && currentUser.balance >= 0
                ? `+${formatCurrency(currentUser.balance)}`
                : formatCurrency(currentUser?.balance || 0)}
            </div>
            <p className="text-sm text-muted-foreground">
              {currentUser && currentUser.balance < 0
                ? "You owe"
                : "You are owed"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group.members.length}</div>
            <div className="flex -space-x-2 mt-2">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary border-2 border-background"
                >
                  {member.avatar}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Group Transactions</CardTitle>
            <CardDescription>Recent expenses in this group</CardDescription>
          </CardHeader>
          <CardContent>
            {!hasTransactions ? (
              <EmptyTransactionsState onAdd={() => setIsAddExpenseDialogOpen(true)} />
            ) : (
              <div className="space-y-4">
                {group.transactions.map((transaction) => {
                  const isPaidByCurrentUser = transaction.paidBy.id === "1";
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full",
                            isPaidByCurrentUser
                              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          )}
                        >
                          {isPaidByCurrentUser ? (
                            <ArrowUpRight className="h-5 w-5" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Paid by {transaction.paidBy.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Group balances</CardDescription>
          </CardHeader>
          <CardContent>
            {!hasMembers ? (
              <EmptyMembersState onInvite={() => setIsInviteDialogOpen(true)} />
            ) : (
              <div className="space-y-4">
                {group.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "font-semibold",
                        member.balance >= 0 ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {member.balance >= 0
                        ? `+${formatCurrency(member.balance)}`
                        : formatCurrency(member.balance)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
