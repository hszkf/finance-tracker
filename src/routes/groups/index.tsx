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

// Mock data - replace with real API data
const groups = [
  {
    id: "1",
    name: "Household Expenses",
    description: "Shared home expenses",
    type: "home",
    members: [
      { id: "1", name: "John Doe", avatar: "JD" },
      { id: "2", name: "Jane Smith", avatar: "JS" },
    ],
    totalExpenses: 2450.0,
    yourBalance: -125.5,
    lastActivity: new Date(),
  },
  {
    id: "2",
    name: "Summer Trip 2024",
    description: "Beach vacation expenses",
    type: "travel",
    members: [
      { id: "1", name: "John Doe", avatar: "JD" },
      { id: "3", name: "Mike Wilson", avatar: "MW" },
      { id: "4", name: "Sarah Johnson", avatar: "SJ" },
    ],
    totalExpenses: 5680.0,
    yourBalance: 350.0,
    lastActivity: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: "3",
    name: "Dinner Club",
    description: "Weekly dinner gatherings",
    type: "food",
    members: [
      { id: "1", name: "John Doe", avatar: "JD" },
      { id: "5", name: "Emily Brown", avatar: "EB" },
      { id: "6", name: "David Lee", avatar: "DL" },
      { id: "7", name: "Anna Chen", avatar: "AC" },
    ],
    totalExpenses: 890.0,
    yourBalance: -45.0,
    lastActivity: new Date(Date.now() - 86400000 * 5),
  },
];

const groupTypes = [
  { value: "home", label: "Home/Rent", icon: Home },
  { value: "travel", label: "Travel", icon: Plane },
  { value: "food", label: "Food & Dining", icon: Utensils },
  { value: "other", label: "Other", icon: ShoppingBag },
];

function GroupsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    type: "",
  });

  const totalOwed = groups
    .filter((g) => g.yourBalance < 0)
    .reduce((sum, g) => sum + Math.abs(g.yourBalance), 0);

  const totalOwedToYou = groups
    .filter((g) => g.yourBalance > 0)
    .reduce((sum, g) => sum + g.yourBalance, 0);

  const getGroupIcon = (type: string) => {
    const groupType = groupTypes.find((t) => t.value === type);
    return groupType?.icon || Users;
  };

  const handleCreateGroup = () => {
    // TODO: Implement create group functionality
    console.log("Creating group:", newGroup);
    setIsCreateDialogOpen(false);
    setNewGroup({ name: "", description: "", type: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">
            Split expenses with friends and family
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Start a new group to split expenses with others
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Apartment Bills"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupTypes.map((type) => (
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
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateGroup}>Create Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>You Owe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalOwed)}
            </div>
            <p className="text-sm text-muted-foreground">
              across {groups.filter((g) => g.yourBalance < 0).length} group
              {groups.filter((g) => g.yourBalance < 0).length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Owed to You</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalOwedToYou)}
            </div>
            <p className="text-sm text-muted-foreground">
              across {groups.filter((g) => g.yourBalance > 0).length} group
              {groups.filter((g) => g.yourBalance > 0).length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Groups List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Groups</CardTitle>
          <CardDescription>
            {groups.length} group{groups.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No groups yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create a group to start splitting expenses
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => {
                const Icon = getGroupIcon(group.type);
                return (
                  <Link
                    key={group.id}
                    to="/groups/$groupId"
                    params={{ groupId: group.id }}
                    className="block"
                  >
                    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex -space-x-2">
                              {group.members.slice(0, 3).map((member) => (
                                <div
                                  key={member.id}
                                  className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background"
                                >
                                  {member.avatar}
                                </div>
                              ))}
                              {group.members.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                                  +{group.members.length - 3}
                                </div>
                              )}
                            </div>
                            <span>
                              {group.members.length} member
                              {group.members.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p
                            className={cn(
                              "font-semibold",
                              group.yourBalance > 0
                                ? "text-green-600"
                                : group.yourBalance < 0
                                  ? "text-red-600"
                                  : "text-muted-foreground"
                            )}
                          >
                            {group.yourBalance === 0
                              ? "Settled up"
                              : group.yourBalance > 0
                                ? `You are owed ${formatCurrency(group.yourBalance)}`
                                : `You owe ${formatCurrency(Math.abs(group.yourBalance))}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total: {formatCurrency(group.totalExpenses)}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
