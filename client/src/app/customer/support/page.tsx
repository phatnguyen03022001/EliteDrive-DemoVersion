"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import api from "@/lib/axios"; // Sử dụng instance axios đã cấu hình của bạn
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PhoneCall, MessageSquare, LifeBuoy, ShieldAlert, Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";

// ── Interfaces ──────────────────────────────────────────────────
interface SupportTicketForm {
  type: string;
  bookingId: string;
  description: string;
}

interface TicketHistory {
  id: string;
  type: string;
  status: string;
  description: string;
  createdAt: string;
}

export default function SupportPage() {
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("faq");
  const { register, handleSubmit, reset } = useForm<SupportTicketForm>({
    defaultValues: {
      type: "Sự cố kỹ thuật",
      bookingId: "",
      description: "",
    },
  });

  interface DisputeResponse {
    success: boolean;
    data?: TicketHistory[]; // cho GET /disputes
    message?: string;
  }

  // Trong fetchHistory
  const fetchHistory = async () => {
    setFetchingHistory(true);
    try {
      const response = await api.get("/api/customer/disputes");
      // Adapter dữ liệu nếu cần, ở đây giả định trả về mảng data
      setHistory(response.data || []);
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);
    } finally {
      setFetchingHistory(false);
    }
  };
  // Trong onSubmit
  const onSubmit = async (values: SupportTicketForm) => {
    setLoading(true);
    try {
      const res = await api.post("/api/customer/disputes", {
        ...values,
        title: `[${values.type}] - ${values.bookingId || "Hỗ trợ chung"}`,
      });

      // Không phụ thuộc success nữa, miễn 201 là coi thành công
      toast.success("Yêu cầu đã được gửi!");
      reset();
      await fetchHistory();
      setActiveTab("history");
    } catch (error: any) {
      console.error("Lỗi gửi dispute:", error);
      toast.error(error?.response?.data?.message || "Gửi thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ── Phần Return nằm bên trong hàm SupportPage ──────────────────
  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Trung tâm Hỗ trợ & Liên hệ</h1>
        <p className="text-muted-foreground mt-2 font-medium">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
      </div>

      {/* Quick Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center space-x-4 pb-2">
            <PhoneCall className="text-primary h-6 w-6" />
            <CardTitle className="text-lg">Hotline 24/7</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">1900 6868</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Dành cho sự cố khẩn cấp (Incident)</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center space-x-4 pb-2">
            <ShieldAlert className="text-primary h-6 w-6" />
            <CardTitle className="text-lg">Tranh chấp</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive" className="mb-2">
              Dispute Center
            </Badge>
            <p className="text-xs text-muted-foreground font-medium">Gửi yêu cầu giải quyết tranh chấp</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
          <TabsTrigger value="faq" className="font-bold">
            FAQ
          </TabsTrigger>
          <TabsTrigger value="contact" className="font-bold">
            Gửi yêu cầu
          </TabsTrigger>
          <TabsTrigger value="history" className="font-bold" onClick={fetchHistory}>
            Lịch sử yêu cầu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" /> Định danh tài khoản
            </h2>
            <Accordion type="single" collapsible className="w-full bg-card border rounded-xl px-4">
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger className="hover:no-underline font-semibold">
                  Làm thế nào để xác thực KYC?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Bạn cần tải lên hình ảnh CCCD và Bằng lái xe rõ nét. Hệ thống sẽ phê duyệt tự động thông qua model KYC
                  trong vòng 15-30 phút.
                </AccordionContent>
              </AccordionItem>
              {/* Thêm các FAQ khác tại đây */}
            </Accordion>
          </section>
        </TabsContent>

        <TabsContent value="contact">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="text-xl">Gửi Ticket hỗ trợ chuyên sâu</CardTitle>
              <CardDescription>Chọn đúng danh mục để yêu cầu của bạn được xử lý nhanh nhất.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Loại vấn đề</label>
                    <select
                      {...register("type")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all">
                      <option value="Sự cố kỹ thuật">Sự cố kỹ thuật</option>
                      <option value="Tranh chấp giao dịch (Dispute)">Tranh chấp giao dịch (Dispute)</option>
                      <option value="Báo cáo tai nạn (Incident)">Báo cáo tai nạn (Incident)</option>
                      <option value="Yêu cầu hoàn tiền (Refund)">Yêu cầu hoàn tiền (Refund)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Mã đặt xe (Booking ID)</label>
                    <Input
                      {...register("bookingId")}
                      placeholder="Ví dụ: BK-12345"
                      className="focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Nội dung chi tiết</label>
                  <Textarea
                    {...register("description")}
                    placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                    className="min-h-[150px] focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <Button className="w-full h-12 text-md font-bold" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang gửi yêu cầu...
                    </>
                  ) : (
                    "Gửi yêu cầu hỗ trợ"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="text-xl">Yêu cầu đã gửi</CardTitle>
              <CardDescription>Theo dõi tiến độ xử lý các khiếu nại và hỗ trợ của bạn.</CardDescription>
            </CardHeader>
            <CardContent>
              {fetchingHistory ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">Bạn chưa gửi yêu cầu hỗ trợ nào.</div>
              ) : (
                <div className="space-y-4">
                  {history.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {/* <Badge variant="outline">{ticket.type}</Badge> */}
                          <span className="text-xs text-muted-foreground">
                            {new Date(ticket.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <p className="text-sm font-medium line-clamp-1">{ticket.description}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">ID: {ticket.id}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          className={cn(
                            "text-white", // Đảm bảo chữ trắng trên nền màu
                            ticket.status === "RESOLVED" && "bg-emerald-500 hover:bg-emerald-600",
                            (ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") &&
                              "bg-orange-500 hover:bg-orange-600",
                            ticket.status === "CLOSED" && "bg-slate-500 hover:bg-slate-600",
                          )}>
                          {ticket.status === "RESOLVED" && "Đã giải quyết"}
                          {ticket.status === "OPEN" && "Mới tiếp nhận"}
                          {ticket.status === "IN_PROGRESS" && "Đang xử lý"}
                          {ticket.status === "CLOSED" && "Đã đóng"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-20 border-t pt-10 text-center">
        <h3 className="font-bold mb-4">Các điều khoản quan trọng</h3>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">
            Điều khoản sử dụng
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Chính sách bảo mật (KYC)
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Quy trình xử lý Tranh chấp
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Chính sách hoàn tiền
          </a>
        </div>
      </div>
    </div>
  );
}
