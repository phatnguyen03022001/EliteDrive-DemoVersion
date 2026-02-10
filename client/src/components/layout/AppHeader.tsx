"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react"; // Import icon
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
// ... các imports Breadcrumb giữ nguyên

export function AppHeader() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const segments = pathname.split("/").filter(Boolean);
  const roleBase = segments[0];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Làm mới tất cả dữ liệu đang active trên màn hình
      await queryClient.invalidateQueries();
      toast.success("Dữ liệu đã được cập nhật mới nhất");
    } catch (error) {
      toast.error("Không thể làm mới dữ liệu");
    } finally {
      // Giữ hiệu ứng xoay thêm một chút cho mượt
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <header className="sticky top-3 z-40 ml-6 m-2 flex items-center justify-between pr-4">
      <div className="flex items-center h-8 gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${roleBase}/dashboard`} className="transition-colors hover:text-primary">
                Elite Drive
              </BreadcrumbLink>
            </BreadcrumbItem>
            {segments.slice(1).map((segment) => (
              <React.Fragment key={segment}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="capitalize font-medium text-foreground/80">
                    {segment.replace("-", " ")}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Nút Làm mới dữ liệu */}
      <Button
        // Bỏ variant mặc định để tự định nghĩa màu sắc
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}>
        <RefreshCw />
        <span className="text-sm font-semibold tracking-tight">
          {isRefreshing ? "Đang cập nhật..." : "Đồng bộ dữ liệu"}
        </span>
      </Button>
    </header>
  );
}
