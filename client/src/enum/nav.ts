import {
  Car,
  History,
  Home,
  ShieldCheck,
  LayoutDashboard,
  Settings,
  TicketPercent,
  Wallet,
  Star,
  FileText,
  Key,
  TrendingUp,
  Banknote,
  Gavel,
  ClipboardCheck,
  BarChart3,
  CalendarDays,
  UserCog,
  CreditCard, // NEW
  AlertCircle, // NEW
  DollarSign, // NEW
  Shield, // NEW
} from "lucide-react";

export const ROLE_NAV_CONFIG = {
  // --- CUSTOMER SIDEBAR (UPDATED) ---
  CUSTOMER: [
    {
      label: "Khám phá",
      items: [
        // { title: "Trang chủ", href: "/customer/dashboard", icon: Home },
        { title: "Tìm thuê xe", href: "/customer/cars", icon: Car },
        { title: "Ưu đãi", href: "/customer/promotions", icon: TicketPercent }, // ✅ Backend có
      ],
    },
    {
      label: "Đặt xe",
      items: [{ title: "Lịch sử đặt xe", href: "/customer/bookings", icon: History }],
    },
    // {
    //   label: "Thanh toán",
    //   items: [
    //     // ⭐ NEW: Nạp tiền ví
    //     { title: "Nạp tiền ví", href: "/customer/wallet/topup", icon: CreditCard },
    //     { title: "Lịch sử giao dịch", href: "/customer/wallet/transactions", icon: Wallet },
    //   ],
    // },
    {
      label: "Tài khoản",
      items: [
        { title: "Hồ sơ cá nhân", href: "/customer/profile", icon: UserCog },
        { title: "Xác thực KYC", href: "/customer/kyc", icon: ShieldCheck },
        { title: "Đánh giá", href: "/customer/reviews", icon: Star },
      ],
    },
    {
      label: "Hỗ trợ",
      items: [{ title: "Liên hệ & Hỗ trợ", href: "/customer/support", icon: FileText }],
    },
  ],

  // --- OWNER SIDEBAR (UPDATED) ---
  OWNER: [
    {
      label: "Quản lý xe",
      items: [
        { title: "Danh sách xe", href: "/owner/cars", icon: Car },
        { title: "Lịch & Giá xe", href: "/owner/calendar", icon: CalendarDays },
      ],
    },
    {
      label: "Vận hành",
      items: [
        { title: "Yêu cầu thuê", href: "/owner/bookings", icon: History },
        { title: "Giao nhận xe", href: "/owner/trips", icon: Key }, // ✅ Backend đã fix
      ],
    },
    {
      label: "Tài chính",
      items: [
        // ⭐ NEW: Ví điện tử (xem số dư)
        { title: "Ví điện tử", href: "/owner/wallet", icon: Wallet },
      ],
    },
    {
      label: "Cài đặt",
      items: [
        { title: "Hồ sơ chủ xe", href: "/owner/profile", icon: UserCog }, // ✅ Backend đã có
        { title: "Xác thực KYC", href: "/owner/kyc", icon: ShieldCheck },
      ],
    },
    {
      label: "Hỗ trợ",
      items: [{ title: "Liên hệ & Hỗ trợ", href: "/owner/support", icon: FileText }],
    },
  ],

  // --- ADMIN SIDEBAR (UPDATED) ---
  ADMIN: [
    {
      label: "Hệ thống",
      items: [
        // { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { title: "Duyệt KYC", href: "/admin/kyc", icon: ShieldCheck },
        { title: "Duyệt xe", href: "/admin/cars", icon: ClipboardCheck },
      ],
    },
    {
      label: "Quản trị",
      items: [
        { title: "Đối soát tiền", href: "/admin/settlements", icon: DollarSign },
        { title: "Duyệt rút tiền", href: "/admin/withdraws", icon: Banknote },
        { title: "Giám sát Escrow", href: "/admin/escrow", icon: Shield },
        { title: "Khiếu nại", href: "/admin/disputes", icon: Gavel },
        { title: "Khuyến mãi", href: "/admin/promotions", icon: TicketPercent },
      ],
    },
    {
      label: "Cấu hình & Báo cáo",
      items: [{ title: "Báo cáo doanh thu", href: "/admin/reports", icon: BarChart3 }],
    },
  ],
};
