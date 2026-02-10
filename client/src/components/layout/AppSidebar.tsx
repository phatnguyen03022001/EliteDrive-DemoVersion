"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuthContext } from "@/components/provider/AuthProvider";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Car, LogOut, Moon, Sun } from "lucide-react";
import { ROLE_NAV_CONFIG } from "@/enum/nav";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  role: "ADMIN" | "OWNER" | "CUSTOMER";
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, logout } = useAuthContext();
  const navGroups = ROLE_NAV_CONFIG[role] || [];
  if (!resolvedTheme) return null;

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-sidebar-border">
      {/* 1. Brand Header - Tự động đổi màu/text theo Role */}
      <div className="h-20 flex items-center px-6 shrink-0">
        <Link href={`/${role.toLowerCase()}/dashboard`} className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-transform hover:rotate-3",
              role === "ADMIN" ? "bg-destructive shadow-destructive/20" : "bg-primary shadow-primary/20",
            )}>
            <Car size={22} className="text-primary-foreground" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none tracking-tight">Elite Drive</span>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">
              {role === "ADMIN" ? "Quản trị viên" : role === "OWNER" ? "Đối tác" : "Khách hàng"}
            </span>
          </div>
        </Link>
      </div>

      {/* 2. Body: Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-6 mt-4">
          {navGroups.map((group, index) => (
            <div key={`${group.label}-${index}`} className="space-y-2">
              <h4 className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                {group.label}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link key={item.href} href={item.href}>
                      <span
                        className={cn(
                          "group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-bold"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                        )}>
                        {isActive && <div className="absolute left-0 h-5 w-1 rounded-r-full bg-sidebar-foreground" />}
                        <item.icon
                          strokeWidth={isActive ? 2 : 1.5}
                          className={cn(
                            "h-5 w-5 mr-2 shrink-0 transition-all group-hover:scale-110",
                            isActive ? "text-primary" : "text-muted-foreground/60",
                          )}
                        />
                        {item.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* 3. Footer: User & Theme Toggle */}
      <div className="p-4 border-t border-sidebar-border/50 flex flex-col gap-3">
        {/* PHẦN TRÊN: USER PROFILE (FULL WIDTH) */}
        <Button
          variant="ghost"
          className="w-full h-14 justify-start gap-3 px-2 rounded-xl hover:bg-sidebar-accent group transition-all"
          onClick={() => /* Điều hướng profile */ {}}>
          <Avatar className="h-9 w-9 shrink-0 border border-sidebar-border transition-transform group-hover:scale-105">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {user?.firstName?.substring(0, 2).toUpperCase() || "ED"}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start overflow-hidden text-left">
            <span className="text-sm font-bold truncate w-full text-foreground">
              {user?.lastName || "-"} {user?.firstName}
            </span>
            <span className="text-[10px] text-muted-foreground truncate w-full lowercase italic">{user?.email}</span>
          </div>
        </Button>

        {/* PHẦN DƯỚI: 2 NÚT CHỨC NĂNG (GRID 2 CỘT) */}
        <div className="grid grid-cols-2 gap-2">
          {/* THEME TOGGLE */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-lg border-sidebar-border/50 bg-transparent hover:bg-sidebar-accent flex gap-2 text-[11px] font-medium"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
            {resolvedTheme === "dark" ? (
              <>
                <Sun className="h-3.5 w-3.5" />
                <span>Sáng</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" />
                <span>Tối</span>
              </>
            )}
          </Button>

          {/* LOGOUT */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-lg border-sidebar-border/50 bg-transparent hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 flex gap-2 text-[11px] font-medium transition-colors"
            onClick={logout}>
            <LogOut className="h-3.5 w-3.5" />
            <span>Thoát</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
