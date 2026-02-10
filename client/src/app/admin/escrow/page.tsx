// "use client";

// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import api from "@/lib/axios";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { TrendingUp, Wallet, Car, Users, Info } from "lucide-react";
// import { Badge } from "@/components/ui/badge";

// export default function AdminDashboard() {
//   const [overview, setOverview] = useState<any>(null);
//   const [platformWallet, setPlatformWallet] = useState<any>(null);
//   const [revenueDataRaw, setRevenueDataRaw] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const [ovRes, walletRes, revRes] = await Promise.all([
//         api.get("/api/admin/reports/overview"),
//         api.get("/api/admin/wallets/platform"),
//         api.get("/api/admin/reports/revenue"),
//       ]);

//       setOverview(ovRes.data);
//       setPlatformWallet(walletRes.data);
//       setRevenueDataRaw(revRes.data || []);
//     } catch (error) {
//       console.error("Lỗi fetch dashboard:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // LOGIC TÍNH TOÁN SỐ DƯ CHÍNH XÁC
//   const calculatedBalance = useMemo(() => {
//     const totalTransactions = revenueDataRaw.reduce((acc, item) => acc + Number(item._sum?.amount || 0), 0);
//     const pendingEscrow = platformWallet?.balance || 0; // Tiền chưa đối soát
//     const netRevenue = overview?.totalRevenue || 0; // Doanh thu thực

//     // Công thức theo yêu cầu: Tổng - (Chưa đối soát + Doanh thu thực)
//     return totalTransactions - (pendingEscrow + netRevenue);
//   }, [revenueDataRaw, platformWallet, overview]);

//   return (
//     <div className="max-w-7xl mx-auto p-6 space-y-8 bg-background text-foreground">
//       <header className="flex justify-between items-end">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Tổng quan hệ thống</h1>
//           <p className="text-muted-foreground">Phân tích dòng tiền thực tế năm 2026.</p>
//         </div>
//         {loading && <span className="text-sm animate-pulse text-primary">Đang cập nhật dữ liệu...</span>}
//       </header>

//       {/* Stats Grid */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <StatsCard
//           title="Số dư khả dụng"
//           value={calculatedBalance}
//           sub="Sau khi trừ nợ/doanh thu"
//           icon={<Wallet className="h-4 w-4 text-primary" />}
//           isMoney
//           loading={loading}
//         />
//         <StatsCard
//           title="Doanh thu thực"
//           value={overview?.totalRevenue}
//           sub="Phí sàn đã thu"
//           icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
//           isMoney
//           loading={loading}
//         />
//         <StatsCard
//           title="Đơn đặt xe"
//           value={overview?.totalBookings}
//           sub={`Từ ${overview?.totalCars || 0} xe`}
//           icon={<Car className="h-4 w-4 text-blue-500" />}
//           loading={loading}
//         />
//         <StatsCard
//           title="Người dùng"
//           value={overview ? overview.totalUsers - 1 : 0}
//           sub="Khách & Chủ xe"
//           icon={<Users className="h-4 w-4 text-orange-500" />}
//           loading={loading}
//         />
//       </div>

//       {/* Detail Table Section */}
//       <Card className="shadow-sm border-border">
//         <CardHeader className="flex flex-row items-center justify-between">
//           <div>
//             <CardTitle>Chi tiết dòng tiền</CardTitle>
//             <CardDescription>Số liệu tổng hợp từ các giao dịch Settlement.</CardDescription>
//           </div>
//           <Info className="h-4 w-4 text-muted-foreground" />
//         </CardHeader>
//         <CardContent>
//           <div className="rounded-md border overflow-hidden">
//             <table className="w-full text-sm">
//               <thead className="bg-muted/50 border-b">
//                 <tr>
//                   <th className="p-4 text-left font-semibold">Trạng thái giao dịch</th>
//                   <th className="p-4 text-right font-semibold">Tổng số tiền quy đổi</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {loading ? (
//                   [1, 2, 3].map((i) => (
//                     <tr key={i}>
//                       <td colSpan={2} className="p-4">
//                         <Skeleton className="h-5 w-full" />
//                       </td>
//                     </tr>
//                   ))
//                 ) : revenueDataRaw.length > 0 ? (
//                   revenueDataRaw.map((item: any, index: number) => (
//                     <tr key={index} className="hover:bg-accent/40 transition-colors">
//                       <td className="p-4">
//                         <Badge variant={item.status === "COMPLETED" ? "default" : "secondary"} className="font-mono">
//                           {item.status}
//                         </Badge>
//                       </td>
//                       <td className="p-4 text-right font-bold text-base">
//                         {Number(item._sum?.amount || 0).toLocaleString()}₫
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={2} className="p-8 text-center text-muted-foreground">
//                       Không có dữ liệu.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// function StatsCard({ title, value, sub, icon, isMoney = false, loading }: any) {
//   return (
//     <Card className="border-border">
//       <CardHeader className="flex flex-row items-center justify-between pb-2">
//         <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{title}</CardTitle>
//         <div className="p-2 bg-secondary/50 rounded-md">{icon}</div>
//       </CardHeader>
//       <CardContent>
//         {loading ? (
//           <Skeleton className="h-8 w-24 mb-1" />
//         ) : (
//           <div className="text-2xl font-black">
//             {value?.toLocaleString() || 0}
//             {isMoney ? "₫" : ""}
//           </div>
//         )}
//         <p className="text-[11px] text-muted-foreground font-medium mt-1">{sub}</p>
//       </CardContent>
//     </Card>
//   );
// }
// app/admin/dashboard/page.tsx
"use client";

import { useQueries } from "@tanstack/react-query";
import { Wallet, TrendingUp, Car, Users, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";

// ── Query keys & fetchers ──────────────────────────────────────
const adminKeys = {
  overview: ["admin", "overview"] as const,
  wallet: ["admin", "platform-wallet"] as const,
  revenue: ["admin", "revenue"] as const,
};

const fetchOverview = () => api.get("/api/admin/reports/overview").then((r) => r.data);
const fetchWallet = () => api.get("/api/admin/wallets/platform").then((r) => r.data);
const fetchRevenue = () => api.get("/api/admin/reports/revenue").then((r) => r.data || []);

// ── Stats Card Component ───────────────────────────────────────
type StatsCardProps = {
  title: string;
  value: number | string;
  sub: string;
  icon: React.ReactNode;
  isMoney?: boolean;
  loading: boolean;
};

function StatsCard({ title, value, sub, icon, isMoney, loading }: StatsCardProps) {
  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <div className="rounded-md bg-secondary/50 p-2">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <div className="text-2xl font-black">
            {typeof value === "number" ? value.toLocaleString() : value}
            {isMoney ? "₫" : ""}
          </div>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard Page ────────────────────────────────────────
export default function AdminDashboardPage() {
  const results = useQueries({
    queries: [
      {
        queryKey: adminKeys.overview,
        queryFn: fetchOverview,
        staleTime: 60 * 1000, // 1 phút
      },
      {
        queryKey: adminKeys.wallet,
        queryFn: fetchWallet,
        staleTime: 45 * 1000,
      },
      {
        queryKey: adminKeys.revenue,
        queryFn: fetchRevenue,
        staleTime: 2 * 60 * 1000, // 2 phút
      },
    ],
  });

  const [overviewQ, walletQ, revenueQ] = results;

  const isLoading = results.some((q) => q.isLoading);
  const isError = results.some((q) => q.isError);

  // Tính số dư khả dụng
  const calculatedBalance = (() => {
    if (!revenueQ.data || !walletQ.data || !overviewQ.data) return 0;

    const totalTx = revenueQ.data.reduce((sum: number, item: any) => sum + Number(item._sum?.amount || 0), 0);

    return totalTx - ((walletQ.data?.balance || 0) + (overviewQ.data?.totalRevenue || 0));
  })();

  if (isError) {
    return <div className="p-8 text-center text-destructive">Lỗi khi tải dữ liệu dashboard. Vui lòng thử lại sau.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-muted-foreground">Phân tích dòng tiền & hoạt động</p>
        </div>
        {isLoading && <span className="animate-pulse text-sm text-primary">Đang cập nhật...</span>}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Số dư khả dụng"
          value={calculatedBalance}
          sub="Sau khi trừ escrow & doanh thu thực"
          icon={<Wallet className="h-4 w-4 text-primary" />}
          isMoney
          loading={isLoading}
        />
        <StatsCard
          title="Doanh thu thực"
          value={overviewQ.data?.totalRevenue ?? 0}
          sub="Phí sàn đã thu"
          icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
          isMoney
          loading={isLoading}
        />
        <StatsCard
          title="Đơn đặt xe"
          value={overviewQ.data?.totalBookings ?? 0}
          sub={`Từ ${overviewQ.data?.totalCars ?? 0} xe`}
          icon={<Car className="h-4 w-4 text-blue-500" />}
          loading={isLoading}
        />
        <StatsCard
          title="Người dùng"
          value={overviewQ.data ? (overviewQ.data.totalUsers ?? 0) - 1 : 0}
          sub="Khách & Chủ xe"
          icon={<Users className="h-4 w-4 text-orange-500" />}
          loading={isLoading}
        />
      </div>

      {/* Chi tiết dòng tiền */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Chi tiết dòng tiền</CardTitle>
            <CardDescription>Tổng hợp từ các giao dịch Settlement</CardDescription>
          </div>
          <Info className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-4 text-left font-semibold">Trạng thái</th>
                  <th className="p-4 text-right font-semibold">Số tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i}>
                        <td colSpan={2} className="p-4">
                          <Skeleton className="h-5 w-full" />
                        </td>
                      </tr>
                    ))
                ) : revenueQ.data?.length > 0 ? (
                  revenueQ.data.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-accent/40 transition-colors">
                      <td className="p-4">
                        <Badge variant={item.status === "COMPLETED" ? "default" : "secondary"} className="font-mono">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-bold">{Number(item._sum?.amount || 0).toLocaleString()}₫</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="p-8 text-center text-muted-foreground">
                      Chưa có dữ liệu giao dịch
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
