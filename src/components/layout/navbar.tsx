import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Menu,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  Search,
  Command,
  Plus,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onMenuClick: () => void;
  showMenuButton?: boolean;
}

export function Navbar({ onMenuClick, showMenuButton = true }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 md:px-6 safe-top">
      {/* Mobile Menu Button */}
      {showMenuButton && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10 rounded-xl"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Search Bar - Desktop */}
      <div className="hidden md:flex flex-1 max-w-md">
        <div
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-3 w-full h-10 px-4 rounded-xl bg-secondary/50 border border-border/50 text-muted-foreground cursor-pointer hover:bg-secondary hover:border-border transition-all"
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Search transactions...</span>
          <div className="ml-auto flex items-center gap-1 text-xs">
            <kbd className="h-5 px-1.5 rounded bg-muted font-mono flex items-center">
              <Command className="h-3 w-3" />
            </kbd>
            <kbd className="h-5 px-1.5 rounded bg-muted font-mono">K</kbd>
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0">
          <div className="flex items-center border-b px-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search transactions, accounts, budgets..."
              className="border-0 focus-visible:ring-0 text-base h-14"
              autoFocus
            />
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">
              Quick Actions
            </p>
            <div className="space-y-1">
              <Link
                to="/transactions/new"
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
                  <Plus className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Add Transaction</p>
                  <p className="text-xs text-muted-foreground">Record a new expense or income</p>
                </div>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex-1 md:hidden" />

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Mobile Search */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10 rounded-xl"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Quick Add - Desktop */}
        <Link to="/transactions/new" className="hidden sm:block">
          <Button className="h-10 rounded-xl gradient-bg hover:opacity-90 transition-opacity gap-2 shadow-lg glow-sm">
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">Add Transaction</span>
          </Button>
        </Link>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-10 w-10 rounded-xl hover:bg-accent"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-accent">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        </Button>

        {/* User Menu */}
        <Dialog open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-10 px-2 rounded-xl hover:bg-accent"
            >
              <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center shadow">
                <span className="text-xs font-bold text-white">HZ</span>
              </div>
              <span className="hidden sm:inline-block text-sm font-medium">Hasif</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[320px]">
            <DialogHeader>
              <DialogTitle>Account</DialogTitle>
              <DialogDescription>Manage your account settings</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 pt-4">
              {/* User Info */}
              <div className="flex items-center gap-3 px-3 py-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 mb-2">
                <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
                  <span className="text-base font-bold text-white">HZ</span>
                </div>
                <div>
                  <p className="font-semibold">Hasif Zulkifli</p>
                  <p className="text-xs text-muted-foreground">hasif@example.com</p>
                  <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/20 text-primary">
                    Premium
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <Link
                to="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent transition-colors"
              >
                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                Profile Settings
              </Link>
              <Link
                to="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent transition-colors"
              >
                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                  <Settings className="h-4 w-4" />
                </div>
                Preferences
              </Link>
              <div className="border-t border-border my-2" />
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  // Handle logout
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 w-full text-left transition-colors"
              >
                <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <LogOut className="h-4 w-4" />
                </div>
                Sign Out
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
