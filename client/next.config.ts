import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["shared", "ui"],

  async rewrites() {
    // LƯU Ý: Ở Production, process.env.BACKEND_URL nên là URL của Render
    // (Ví dụ: https://elitedrive-demoversion.onrender.com)
    // KHÔNG nên dùng NEXT_PUBLIC_ ở đây để bảo mật phía Server
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

    return [
      {
        source: "/api/:path*",
        // Nếu Backend của bạn đã có prefix /api sẵn, hãy cẩn thận tránh lặp lại thành /api/api
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },

  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "elitedrive-demoversion.onrender.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/elitedrive/**",
      },
      // Thêm pattern chung cho các dịch vụ lưu trữ ảnh khác nếu cần
      {
        protocol: "https",
        hostname: "**",
      },
    ],

    // Ở Production nên để false để Next.js tối ưu ảnh (WebP/AVIF) cho khách thuê xe
    unoptimized: false,
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_APP_URL || "https://elite-drive-iota.vercel.app",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  // Giữ nguyên các dòng này
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
