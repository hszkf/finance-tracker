import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Plus,
  Users,
  ChevronRight,
  Home,
  Plane,
  Utensils,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Sparkles,
  Clock,
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

export const Route = createFileRoute("/groups/")({
  component: GroupsPage,
});

// Empty state component
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="empty-state py-20">
      <div className="empty-state-icon">
        <Users className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-2xl font-bold">No groups yet</h3>
      <p className="text-muted-foreground mt-2 max-w-md">
        Create a group to split expenses with friends and family.
      </p>
      <Button size="lg" className="mt-6 rounded-xl gradient-bg hover:opacity-90 gap-2 shadow-lg" onClick={onAdd}>
        <Plus className="h-5 w-5" />
        Create Your First Group
      </Button>
    </div>
  );
}

const groupTypes = [
  { value: "home", label: "Home/Rent", icon: Home, color: "from-emerald-500/20 to-emerald-600/10", iconColor: "text-emerald-500", bgColor: "bg-emerald-500/20" },
  { value: "travel", label: "Travel", icon: Plane, color: "from-blue-500/20 to-blue-600/10", iconColor: "text-blue-500", bgColor: "bg-blue-500/20" },
  { value: "food", label: "Food & Dining", icon: Utensils, color: "from-orange-500/20 to-orange-600/10", iconColor: "text-orange-500", bgColor: "bg-orange-500/20" },
  { value: "other", label: "Other", icon: ShoppingBag, color: "from-purple-500/20 to-purple-600/10", iconColor: "text-purple-500", bgColor: "bg-purple-500/20" },
];

function GroupsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    type: "",
  });

  // TODO: Replace with actual API data
  const groups: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    members: Array<{ id: string; name: string; avatar: string }>;
    totalExpenses: number;
    yourBalance: number;
    lastActivity: Date;
  }> = [];

  const hasGroups = groups.length > 0;

  const totalOwed = groups
    .filter((g) => g.yourBalance < 0)
    .reduce((sum, g) => sum + Math.abs(g.yourBalance), 0);

  const totalOwedToYou = groups
    .filter((g) => g.yourBalance > 0)
    .reduce((sum, g) => sum + g.yourBalance, 0);

  const netBalance = totalOwedToYou - totalOwed;

  const getGroupType = (type: string) => {
    return groupTypes.find((t) => t.value === type) || groupTypes[groupTypes.length - 1];
  };

  const handleCreateGroup = () => {
    // TODO: Implement create group functionality
    console.log("Creating group:", newGroup);
    setIsCreateDialogOpen(false);
    setNewGroup({ name: "", description: "", type: "" });
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground text-lg mt-1">
            Split expenses with friends and family
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gradient-bg hover:opacity-90 gap-2 shadow-lg h-11">
              <Plus className="h-5 w-5" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Create New Group</DialogTitle>
              <DialogDescription>
                Start a new group to split expenses with others
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Apartment Bills"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Brief description of the group"
                  value={newGroup.description}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, description: e.target.value })
                  }
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Group Type</Label>
                <Select
                  value={newGroup.type}
                  onValueChange={(value) =>
                    setNewGroup({ ...newGroup, type: value })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-3">
                          <type.icon className={cn("h-4 w-4", type.iconColor)} />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateGroup} className="rounded-xl gradient-bg hover:opacity-90">
                Create Group
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {hasGroups ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:gap-6 md:grid-cols-3">
            {/* You Owe Card */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-rose-500/10 to-rose-600/5 border-rose-500/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">You Owe</p>
                    <p className="text-3xl font-bold mt-1 text-rose-500 currency">
                      {formatCurrency(totalOwed)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      across {groups.filter((g) => g.yourBalance < 0).length} group{groups.filter((g) => g.yourBalance < 0).length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
                    <ArrowUpRight className="h-6 w-6 text-rose-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owed to You Card */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Owed to You</p>
                    <p className="text-3xl font-bold mt-1 text-emerald-500 currency">
                      {formatCurrency(totalOwedToYou)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      across {groups.filter((g) => g.yourBalance > 0).length} group{groups.filter((g) => g.yourBalance > 0).length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <ArrowDownRight className="h-6 w-6 text-emerald-500" />
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
                      {netBalance >= 0 ? "+" : ""}{formatCurrency(Math.abs(netBalance))}
                    </p>
                    <p className="text-xs text-white/80 mt-2">
                      {netBalance >= 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          You're ahead!
                        </span>
                      ) : (
                        "Time to settle up"
                      )}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            </Card>
          </div>

          {/* Groups List */}
          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Your Groups</CardTitle>
                  <CardDescription>
                    {groups.length} group{groups.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {groups.map((group, index) => {
                  const groupType = getGroupType(group.type);
                  const Icon = groupType.icon;
                  const isSettled = group.yourBalance === 0;
                  const youOwe = group.yourBalance < 0;

                  return (
                    <Link
                      key={group.id}
                      to="/groups/$groupId"
                      params={{ groupId: group.id }}
                      className="block"
                    >
                      <div
                        className={cn(
                          "flex items-center justify-between rounded-xl p-4 transition-all duration-200 hover-lift cursor-pointer fade-in-up",
                          `bg-gradient-to-r ${groupType.color}`,
                          `stagger-${(index % 5) + 1}`
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-14 w-14 rounded-xl flex items-center justify-center",
                            groupType.bgColor
                          )}>
                            <Icon className={cn("h-7 w-7", groupType.iconColor)} />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{group.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              {/* Member Avatars */}
                              <div className="flex -space-x-2">
                                {group.members.slice(0, 3).map((member) => (
                                  <div
                                    key={member.id}
                                    className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold border-2 border-background"
                                  >
                                    {member.avatar}
                                  </div>
                                ))}
                                {group.members.length > 3 && (
                                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold border-2 border-background text-primary">
                                    +{group.members.length - 3}
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                              </span>
                              <span className="text-border">•</span>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatRelativeTime(group.lastActivity)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            {isSettled ? (
                              <>
                                <p className="font-semibold text-muted-foreground flex items-center gap-1 justify-end">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                  Settled up
                                </p>
                                <p className="text-sm text-muted-foreground currency">
                                  Total: {formatCurrency(group.totalExpenses)}
                                </p>
                              </>
                            ) : (
                              <>
                                <p
                                  className={cn(
                                    "font-bold text-lg",
                                    youOwe ? "text-rose-500" : "text-emerald-500"
                                  )}
                                >
                                  {youOwe ? (
                                    <span className="currency">You owe {formatCurrency(Math.abs(group.yourBalance))}</span>
                                  ) : (
                                    <span className="currency">You're owed {formatCurrency(group.yourBalance)}</span>
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground currency">
                                  Total: {formatCurrency(group.totalExpenses)}
                                </p>
                              </>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-0 bg-card/50 backdrop-blur hover-lift cursor-pointer transition-all duration-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Invite Friends</p>
                  <p className="text-sm text-muted-foreground">Add people to your groups</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card/50 backdrop-blur hover-lift cursor-pointer transition-all duration-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Settle Up</p>
                  <p className="text-sm text-muted-foreground">Clear all balances in one go</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="border-0 bg-card/50 backdrop-blur">
          <CardContent>
            <EmptyState onAdd={() => setIsCreateDialogOpen(true)} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
