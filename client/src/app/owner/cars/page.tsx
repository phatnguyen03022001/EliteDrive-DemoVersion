"use client";

import { CarTable, CreateCarDialog } from "@/features/owner/car/CarComponents";
import { ShieldCheck, Info, CarFront, Clock, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyCars } from "@/features/owner/owner.queries";

export default function OwnerCarPage() {
  // 1. Fetch data tại đây
  const { data: cars = [], isLoading, refetch } = useMyCars();

  // 2. Logic lọc dữ liệu
  const activeCars = cars.filter((car: any) => car.verificationStatus === "APPROVED");
  const pendingCars = cars.filter(
    (car: any) => car.verificationStatus === "PENDING" || car.verificationStatus === "DRAFT",
  );

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Xe của tôi</h1>
          <p className="text-muted-foreground text-lg mt-2">Quản lý đội xe và theo dõi hiệu suất kinh doanh của bạn.</p>
        </div>
        <CreateCarDialog />
      </div>

      {/* Stats Overview - Hiển thị số thực tế */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số xe</CardTitle>
            <CarFront className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cars.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ phê duyệt</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCars.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCars.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Thông báo */}
      <Alert variant="default" className="bg-primary/5 border-primary/20">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="font-semibold text-primary">Hướng dẫn</AlertTitle>
        <AlertDescription className="text-primary/80">
          Xe mới đăng ký cần được gửi duyệt. Sau khi quản trị viên xác nhận, xe sẽ hiển thị ở trạng thái{" "}
        </AlertDescription>
      </Alert>

      {/* Main Content - Danh sách xe */}
      <Card className="shadow-sm">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Danh sách phương tiện
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tất cả ({cars.length})</TabsTrigger>
              <TabsTrigger value="active">Đang hoạt động ({activeCars.length})</TabsTrigger>
              <TabsTrigger value="pending">Chờ duyệt ({pendingCars.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="m-0">
              <CarTable cars={cars} isLoading={isLoading} refetch={refetch} isRefetching={false} />
            </TabsContent>

            <TabsContent value="active" className="m-0">
              <CarTable cars={activeCars} isLoading={isLoading} refetch={refetch} isRefetching={false} />
            </TabsContent>

            <TabsContent value="pending" className="m-0">
              <CarTable cars={pendingCars} isLoading={isLoading} refetch={refetch} isRefetching={false} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <footer className="text-center text-sm text-muted-foreground py-10">
        <p>© 2026 Elite Drive System.</p>
      </footer>
    </div>
  );
}
