# EliteDrive - Car Rental Management System

EliteDrive là một hệ thống quản lý cho thuê xe được xây dựng bằng **Next.js** (client), **NestJS** (server), và **MongoDB** (database).

## 🏗️ Cấu trúc dự án

```
EliteDrive/
├── client/          # Frontend (Next.js)
├── server/          # Backend (NestJS)
├── docker/          # Docker configurations (MongoDB, MinIO, Garage)
└── README.md        # This file
```

---

## 📋 Yêu cầu

- **Node.js**: v18 hoặc cao hơn
- **npm** hoặc **yarn** hoặc **pnpm**
- **Docker** (tùy chọn, để chạy MongoDB, MinIO, Garage)
- **Git**

---

## 🚀 Hướng dẫn chạy dự án

### 1️⃣ Clone và cài đặt dependencies

```bash
# Clone repository
git clone git@github.com:phatnguyen03022001/EliteDrive-Demo-Version-.git
cd EliteDrive

# Cài đặt dependencies cho client
cd client
npm install
# hoặc
yarn install

# Cài đặt dependencies cho server (từ thư mục gốc)
cd ../server
npm install
# hoặc
yarn install
```

### 2️⃣ Cấu hình Database

#### Option A: Sử dụng MongoDB Atlas (Cloud)

Database đã được cấu hình tại:
```
mongodb+srv://elitedrive:elitedrive@elitedrive.qwuvogw.mongodb.net/?appName=EliteDrive
```

#### Option B: Chạy MongoDB cục bộ bằng Docker

```bash
cd docker/mongodb
docker-compose up -d
```

MongoDB sẽ chạy tại `mongodb://localhost:27017`

### 3️⃣ Cấu hình biến môi trường

#### Server (.env)

Tạo file `.env` trong thư mục `server/`:

```env
DATABASE_URL=mongodb+srv://elitedrive:elitedrive@elitedrive.qwuvogw.mongodb.net/?appName=EliteDrive
# hoặc nếu dùng local MongoDB
# DATABASE_URL=mongodb://localhost:27017/elitedrive

JWT_SECRET=your_jwt_secret_key
BCRYPT_ROUNDS=10
```

#### Client (.env.local)

Tạo file `.env.local` trong thư mục `client/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4️⃣ Khởi động ứng dụng

#### Chạy Backend (NestJS)

```bash
cd server

# Development mode
npm run start:dev
# hoặc
yarn start:dev

# Production mode
npm run build
npm run start
```

Backend sẽ chạy tại `http://localhost:3001`

#### Chạy Frontend (Next.js)

Mở terminal mới:

```bash
cd client

# Development mode
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

Frontend sẽ chạy tại `http://localhost:3000`

---

## 🛠️ Cơ sở dữ liệu - Prisma

### Prisma Migration

```bash
cd server

# Tạo migration mới
npm run prisma:migrate:dev -- --name <migration_name>

# Reset database
npm run prisma:migrate:reset

# Kiểm tra trạng thái migration
npm run prisma:migrate:status

# Mở Prisma Studio (UI để quản lý dữ liệu)
npm run prisma:studio
```

---

## 📚 Cấu trúc dự án chi tiết

### Frontend (Next.js)

```
client/src/
├── app/                 # App router
│   ├── (auth)/         # Auth routes
│   ├── admin/          # Admin pages
│   ├── customer/       # Customer pages
│   └── owner/          # Owner pages
├── components/         # Reusable components
│   ├── layout/
│   ├── provider/
│   └── ui/
├── features/           # Feature modules
│   ├── admin/
│   ├── auth/
│   ├── customer/
│   ├── home/
│   ├── owner/
│   └── shared/
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── types/              # TypeScript types
```

### Backend (NestJS)

```
server/src/
├── app.controller.ts   # Main controller
├── app.module.ts       # Main module
├── app.service.ts      # Main service
├── main.ts             # Entry point
├── common/             # Common utilities, enums
├── config/             # Configuration
├── modules/            # Feature modules
└── prisma/             # Prisma service
```

---

## 🐳 Docker Services (Tùy chọn)

### MongoDB

```bash
cd docker/mongodb
docker-compose up -d
docker-compose down  # Stop service
```

### MinIO (Object Storage)

```bash
cd docker/minio
docker-compose up -d
```

Access at: `http://localhost:9001`

### Garage (Distributed Storage)

```bash
cd docker/garage
docker-compose up -d
```

---

## 🔐 Authentication

Dự án hỗ trợ 3 loại người dùng:

1. **Admin** - Quản lý toàn hệ thống
2. **Owner** - Chủ sở hữu xe
3. **Customer** - Khách hàng

---

## 📁 Tệp cấu hình quan trọng

- **server/prisma/schema.prisma** - Database schema
- **client/next.config.ts** - Next.js configuration
- **client/tailwind.config.ts** - Tailwind CSS configuration
- **server/nest-cli.json** - NestJS CLI configuration

---

## 🐛 Troubleshooting

### Port đã được sử dụng

```bash
# Tìm process dùng port
lsof -i :3000    # Frontend
lsof -i :3001    # Backend

# Kill process
kill -9 <PID>
```

### Database connection error

- Kiểm tra MongoDB đang chạy: `mongo --eval "db.adminCommand('ping')"`
- Xác minh `DATABASE_URL` trong `.env`

### Dependencies conflict

```bash
# Xóa node_modules và package-lock.json
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Support

Nếu gặp vấn đề, vui lòng kiểm tra:

1. Node.js version: `node --version`
2. npm version: `npm --version`
3. Logs từ server và client
4. Database connection status

---

## 📝 License

This project is proprietary software.

---

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Happy coding! 🚀**
