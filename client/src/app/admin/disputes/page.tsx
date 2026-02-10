"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PlayCircle, CheckCircle2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// 1. Định nghĩa Enum đồng bộ với Prisma
enum DisputeStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

// 2. Định nghĩa Interface cho Dispute để fix lỗi 'never'
interface Dispute {
  id: string;
  title: string;
  description: string;
  status: DisputeStatus;
  createdAt: string;
  updatedAt: string;
  initiator: {
    firstName: string;
    lastName: string;
    email: string;
  };
  bookingId?: string | null;
  attachments?: string[];
}

export default function AdminDisputePage() {
  // 3. Gán kiểu dữ liệu cho State
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");
  const [finalStatus, setFinalStatus] = useState<DisputeStatus>(DisputeStatus.RESOLVED);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const res = await fetch("/api/admin/disputes?page=1&limit=10");
      const data = await res.json();
      // data.items khớp với cấu trúc mảng Dispute
      setDisputes(data.items);
    } catch (error) {
      toast.error("Không thể tải danh sách khiếu nại");
    } finally {
      setLoading(false);
    }
  };

  const handleStartProcess = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/disputes/${id}/process`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      toast.success("Đã chuyển sang trạng thái đang xử lý");
      fetchDisputes();
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

  const handleResolve = async () => {
    if (!resolution || !selectedDispute) return toast.error("Vui lòng nhập hướng giải quyết");

    try {
      const res = await fetch(`/api/admin/disputes/${selectedDispute.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution, status: finalStatus }),
      });
      if (!res.ok) throw new Error();

      toast.success("Đã phản hồi và đóng khiếu nại");
      setIsModalOpen(false);
      setResolution("");
      fetchDisputes();
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const getStatusBadge = (status: DisputeStatus) => {
    const config = {
      [DisputeStatus.OPEN]: { label: "Mới", class: "bg-blue-500 hover:bg-blue-600" },
      [DisputeStatus.IN_PROGRESS]: { label: "Đang xử lý", class: "bg-orange-500 hover:bg-orange-600" },
      [DisputeStatus.RESOLVED]: { label: "Đã giải quyết", class: "bg-emerald-500 hover:bg-emerald-600" },
      [DisputeStatus.CLOSED]: { label: "Đã đóng", class: "bg-slate-500 hover:bg-slate-600" },
    };
    return <Badge className={cn("text-white border-none", config[status].class)}>{config[status].label}</Badge>;
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-muted-foreground animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Card className="shadow-lg border-primary/5">
        <CardHeader className="border-b bg-muted/10">
          <CardTitle className="text-2xl flex items-center gap-3 font-bold">
            <MessageSquare className="w-6 h-6 text-primary" />
            Danh sách Khiếu nại & Hỗ trợ
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-xl border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Người gửi</TableHead>
                  <TableHead className="font-bold">Tiêu đề & Nội dung</TableHead>
                  <TableHead className="font-bold w-[140px]">Trạng thái</TableHead>
                  <TableHead className="font-bold w-[180px]">Ngày tạo</TableHead>
                  <TableHead className="text-right font-bold">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disputes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Không tìm thấy yêu cầu khiếu nại nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  disputes.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="font-bold text-sm">
                          {item.initiator.firstName} {item.initiator.lastName}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                          {item.initiator.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-primary line-clamp-1">{item.title}</div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1 italic">{item.description}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-xs font-medium">
                        {new Date(item.createdAt).toLocaleString("vi-VN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {item.status === DisputeStatus.OPEN && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-orange-200 text-orange-600 hover:bg-orange-50"
                              onClick={() => handleStartProcess(item.id)}>
                              <PlayCircle className="w-3.5 h-3.5 mr-1" /> Xử lý
                            </Button>
                          )}
                          {(item.status === DisputeStatus.OPEN || item.status === DisputeStatus.IN_PROGRESS) && (
                            <Button
                              size="sm"
                              className="h-8 shadow-sm"
                              onClick={() => {
                                setSelectedDispute(item);
                                setIsModalOpen(true);
                              }}>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Đóng
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal phản hồi */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Giải quyết khiếu nại</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
              <p className="text-[11px] uppercase tracking-wider font-bold text-primary/70 mb-1">Đang xử lý yêu cầu:</p>
              <p className="text-sm font-semibold">{selectedDispute?.title}</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2">
                Nội dung phản hồi <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Nhập chi tiết hướng giải quyết cho khách hàng..."
                className="min-h-[150px] resize-none focus-visible:ring-primary"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground italic">
                * Nội dung này sẽ được đính kèm vào phần mô tả của khiếu nại.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold">Chốt trạng thái cuối</label>
              <Select value={finalStatus} onValueChange={(v) => setFinalStatus(v as DisputeStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DisputeStatus.RESOLVED} className="text-emerald-600 font-medium">
                    RESOLVED - Chấp nhận & Hoàn tất
                  </SelectItem>
                  <SelectItem value={DisputeStatus.CLOSED} className="text-slate-600 font-medium">
                    CLOSED - Đóng / Từ chối yêu cầu
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button onClick={handleResolve} disabled={!resolution} className="px-8 shadow-md">
              Gửi phản hồi ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
