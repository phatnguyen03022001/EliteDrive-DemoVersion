"use client";

import { useAuthContext } from "@/components/provider/AuthProvider";
import { useState, useSyncExternalStore } from "react"; // Xóa useEffect
import { Loader2, Menu } from "lucide-react";
// import { CustomerSidebar } from "@/components/layout/customer/CustomerSidebar";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "../../components/layout/AppSidebar";
import { AppHeader } from "../../components/layout/AppHeader";

// Helper để kiểm tra môi trường Client/Server chuẩn React 18+
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthContext();
  const [open, setOpen] = useState(false);
  const isClient = useIsClient();

  // 1. Xử lý Hydration & Auth Loading (Chỉ chạy 1 lần check)
  if (!isClient || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Bảo vệ Route
  if (!user || user.role !== "CUSTOMER") return null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card sticky top-0 h-screen shrink-0">
        <AppSidebar role="CUSTOMER" />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center pr-4">
          {/* MOBILE NAVIGATION */}
          <div className="md:hidden pl-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                {/* Fix lỗi "DialogContent requires a DialogTitle" */}
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Customer navigation menu</SheetDescription>
                </SheetHeader>
                <AppSidebar role="CUSTOMER" />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1">
            <AppHeader />
          </div>
        </div>

        <main className="p-4 md:p-6 flex-1 bg-background">{children}</main>
      </div>
    </div>
  );
}
