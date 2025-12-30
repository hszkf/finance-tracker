import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  PiggyBank,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/budgets", label: "Budgets", icon: PiggyBank },
  { to: "/groups", label: "Groups", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar({ isCollapsed, onToggle, isMobile, onClose }: SidebarProps) {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-card/50 backdrop-blur-xl transition-all duration-300 border-r border-border/50",
        isCollapsed ? "w-20" : "w-72",
        isMobile && "w-72 bg-card"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex h-20 items-center border-b border-border/50",
        isCollapsed && !isMobile ? "justify-center px-2" : "justify-between px-6"
      )}>
        {(!isCollapsed || isMobile) && (
          <Link
            to="/"
            className="flex items-center gap-3 group"
            onClick={handleNavClick}
          >
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg shadow-lg glow-sm">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">FinTrack</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Personal Finance
              </span>
            </div>
          </Link>
        )}

        {isCollapsed && !isMobile && (
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg shadow-lg glow-sm">
            <Wallet className="h-5 w-5 text-white" />
          </Link>
        )}

        {isMobile && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all",
              isCollapsed && "absolute -right-4 top-6 z-50 bg-card border border-border shadow-lg"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 space-y-1 p-3 overflow-y-auto",
        isCollapsed && !isMobile && "px-2"
      )}>
        <div className={cn(
          "mb-4",
          (!isCollapsed || isMobile) && "px-3"
        )}>
          {(!isCollapsed || isMobile) && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Menu
            </span>
          )}
        </div>

        {navItems.map((item, index) => {
          const isActive =
            item.to === "/" ? currentPath === "/" : currentPath.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={cn(
                "nav-item group",
                isActive && "active",
                !isActive && "text-muted-foreground hover:bg-accent hover:text-foreground",
                isCollapsed && !isMobile && "justify-center px-3",
                "fade-in-up",
                `stagger-${index + 1}`
              )}
            >
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "bg-transparent group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              {(!isCollapsed || isMobile) && (
                <span className="font-medium">{item.label}</span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && !isMobile && (
                <div className="absolute left-full ml-2 hidden rounded-lg bg-popover px-3 py-2 text-sm font-medium shadow-lg group-hover:block z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Currency Selector */}
      {(!isCollapsed || isMobile) && (
        <div className="mx-3 mb-3 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-4 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Currency
            </span>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 rounded-lg bg-primary/20 px-3 py-2 text-sm font-bold text-primary transition-all hover:bg-primary/30">
              GBP
            </button>
            <button className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground">
              MYR
            </button>
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className={cn(
        "border-t border-border/50 p-4",
        isCollapsed && !isMobile && "px-2"
      )}>
        {!isCollapsed || isMobile ? (
          <div className="flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-accent cursor-pointer">
            <div className="relative">
              <div className="h-11 w-11 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">HZ</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-card"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Hasif Zulkifli</p>
              <p className="text-xs text-muted-foreground truncate">Premium Plan</p>
            </div>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="relative group cursor-pointer">
              <div className="h-11 w-11 rounded-xl gradient-bg flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                <span className="text-sm font-bold text-white">HZ</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-card"></div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
