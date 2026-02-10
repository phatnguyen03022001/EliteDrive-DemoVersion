"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ===== Types ===== */
type CustomerStatus = "active" | "inactive" | "blocked";

type Customer = {
  id: number;
  name: string;
  email: string;
  status: CustomerStatus;
  role: "user" | "vip";
};

/* ===== Mock Data ===== */
const CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "a@test.com",
    status: "active",
    role: "vip",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "b@test.com",
    status: "inactive",
    role: "user",
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "c@test.com",
    status: "blocked",
    role: "user",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    email: "d@test.com",
    status: "active",
    role: "user",
  },
  // --- Data mock thêm ---
  {
    id: 5,
    name: "Hoàng Gia Bảo",
    email: "bao.hoang@company.vn",
    status: "active",
    role: "user",
  },
  {
    id: 6,
    name: "Ngô Thanh Vân",
    email: "van.ngo@gmail.com",
    status: "inactive",
    role: "vip",
  },
  {
    id: 7,
    name: "Đặng Minh Khôi",
    email: "khoi.dang@outlook.com",
    status: "active",
    role: "user",
  },
  {
    id: 8,
    name: "Bùi Bích Phương",
    email: "phuong.bui@work.ai",
    status: "blocked",
    role: "user",
  },
  {
    id: 9,
    name: "Vũ Hoàng Long",
    email: "long.vu@service.com",
    status: "active",
    role: "vip",
  },
  {
    id: 10,
    name: "Trịnh Công Sơn",
    email: "son.trinh@music.vn",
    status: "active",
    role: "user",
  },
];

export default function CustomerTestPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Test Page</h1>
        <p className="text-muted-foreground">Danh sách khách hàng (mock data – single file)</p>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b ">
            <tr className="h-12 text-left">
              <th className="px-4">ID</th>
              <th className="px-4">Tên</th>
              <th className="px-4">Email</th>
              <th className="px-4">Trạng thái</th>
              <th className="px-4">Role</th>
              <th className="px-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {CUSTOMERS.map((c) => (
              <tr key={c.id} className="h-12 hover: transition-colors">
                <td className="px-4">{c.id}</td>
                <td className="px-4 font-medium">{c.name}</td>
                <td className="px-4">{c.email}</td>

                <td className="px-4">
                  <Badge
                    variant={c.status === "active" ? "default" : c.status === "inactive" ? "secondary" : "destructive"}>
                    {c.status}
                  </Badge>
                </td>

                <td className="px-4">{c.role === "vip" ? <Badge variant="outline">VIP</Badge> : "User"}</td>

                <td className="px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        •••
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Xem</DropdownMenuItem>
                      <DropdownMenuItem>Sửa</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
