import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

// 1. Cấu hình các hằng số
const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/otp"];

const ROLE_PATH_MAP: Record<string, string> = {
  ADMIN: "/admin/kyc",
  OWNER: "/owner/cars",
  CUSTOMER: "/customer/cars",
};

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // Kiểm tra xem route hiện tại có phải public không
  const isPublicRoute = PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // --- TRƯỜNG HỢP 1: CHƯA ĐĂNG NHẬP ---
  if (!token) {
    if (isPublicRoute) return NextResponse.next();

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- TRƯỜNG HỢP 2: ĐÃ ĐĂNG NHẬP ---
  try {
    const decoded: any = jwtDecode(token);
    const userRole = decoded.role as keyof typeof ROLE_PATH_MAP;
    const allowedPrefix = ROLE_PATH_MAP[userRole];

    // Nếu không tìm thấy role hợp lệ trong Map, xóa token và bắt login lại
    if (!allowedPrefix) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("token");
      return res;
    }

    // A. Nếu đang ở Login/Register hoặc trang Dashboard chung hoặc trang chủ
    // Ép điều hướng về trang đúng của Role đó (ví dụ /admin)
    const isCommonPath = ["/login", "/register", "/", "/dashboard"].includes(pathname);
    if (isCommonPath) {
      return NextResponse.redirect(new URL(allowedPrefix, req.url));
    }

    // B. Nếu vào đúng khu vực của mình (ví dụ /customer/...) -> Cho qua
    if (pathname.startsWith(allowedPrefix)) {
      return NextResponse.next();
    }

    // C. Nếu cố tình vào khu vực của Role khác (ví dụ Customer vào /admin)
    const allPrefixes = Object.values(ROLE_PATH_MAP);
    const isOtherRolePath = allPrefixes.some((p) => pathname.startsWith(p) && p !== allowedPrefix);

    if (isOtherRolePath) {
      return NextResponse.redirect(new URL(allowedPrefix, req.url));
    }

    // D. Cho phép các đường dẫn khác (không nằm trong danh sách cấm/phân vùng)
    return NextResponse.next();
  } catch (error) {
    // Nếu token lỗi hoặc hết hạn
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    return res;
  }
}

// Cấu hình Matcher: Loại bỏ các file tĩnh và API
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.json$).*)"],
};
