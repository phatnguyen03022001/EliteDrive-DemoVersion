# EliteDrive - Car Rental Management System

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://elite-drive-iota.vercel.app/)

---

EliteDrive is a comprehensive car rental management system built with **Next.js** (client), **NestJS** (server), and **MongoDB** (database).

**🌐 Live Demo:** [https://elite-drive-iota.vercel.app/](https://elite-drive-iota.vercel.app/)

## 🏗️ Project Structure

```
EliteDrive/
├── client/          # Frontend (Next.js)
├── server/          # Backend (NestJS)
├── docker/          # Docker configurations (MongoDB, MinIO, Garage)
└── README.md        # This file
```

---

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm**, **yarn**, or **pnpm**
- **Docker** (optional, for running MongoDB, MinIO, Garage)
- **Git**

---

## 🚀 Quick Start Guide

### 1️⃣ Clone and Install Dependencies

```bash
# Clone repository
git clone git@github.com:phatnguyen03022001/EliteDrive-Demo-Version-.git
cd EliteDrive

# Install client dependencies
cd client
npm install
# or
yarn install

# Install server dependencies (from root directory)
cd ../server
npm install
# or
yarn install
```

### 2️⃣ Database Configuration

#### Option A: Use MongoDB Atlas (Cloud)

Database is already configured at:
```
mongodb+srv://elitedrive:elitedrive@elitedrive.qwuvogw.mongodb.net/?appName=EliteDrive
```

#### Option B: Run MongoDB Locally with Docker

```bash
cd docker/mongodb
docker-compose up -d
```

MongoDB will run at `mongodb://localhost:27017`

### 3️⃣ Environment Configuration

#### Server (.env)

Create `.env` file in `server/` directory:

```env
DATABASE_URL=xxxs
# or for local MongoDB
# DATABASE_URL=mongodb://localhost:27017/elitedrive

JWT_SECRET=your_jwt_secret_key
BCRYPT_ROUNDS=10
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=your_email@domain.com
EMAIL_FROM_NAME=Elite Drive
APP_PORT=3001
```

#### Client (.env.local)

Create `.env.local` file in `client/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4️⃣ Start the Application

#### Start Backend (NestJS)

```bash
cd server

# Development mode
npm run start:dev
# or
yarn start:dev

# Production mode
npm run build
npm run start
```

Backend will run at `http://localhost:3001`

#### Start Frontend (Next.js)

Open a new terminal:

```bash
cd client

# Development mode
npm run dev
# or
yarn dev
# or
pnpm dev
```

Frontend will run at `http://localhost:3000`

---

## 🛠️ Database - Prisma

### Prisma Migration

```bash
cd server

# Create new migration
npm run prisma:migrate:dev -- --name <migration_name>

# Reset database
npm run prisma:migrate:reset

# Check migration status
npm run prisma:migrate:status

# Open Prisma Studio (UI for data management)
npm run prisma:studio
```

---

## 📚 Detailed Project Structure

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
├── common/             # Common utilities, enums, decorators
│   ├── decorators/     # Custom decorators (CurrentUser, Roles, Public)
│   ├── dto/            # Data Transfer Objects
│   ├── guards/         # Auth guards (JwtAuthGuard, RolesGuard)
│   └── interfaces/     # TypeScript interfaces
├── config/             # Configuration
├── modules/            # Feature modules
│   ├── admin/          # Admin management
│   ├── auth/           # Authentication
│   ├── customer/       # Customer operations
│   ├── mail/           # Email service (Brevo integration)
│   ├── public/         # Public endpoints
│   └── upload/         # File upload service
└── prisma/             # Prisma service
```

---

## 🔐 Authentication & Authorization

The system supports three user roles with JWT-based authentication:

### User Roles
1. **Admin** - Full system management
2. **Owner** - Car owners and fleet management
3. **Customer** - Car rental customers

### Authentication Flow
- JWT tokens with role-based access control
- Email verification via OTP
- Password reset functionality
- Session management

---

## 📊 API Modules Overview

### 1. Authentication Module (`/api/auth`)
- User registration with email verification
- Login with email/password or OTP
- Password reset functionality
- JWT token generation

### 2. Customer Module (`/api/customer`)
- Profile management
- KYC submission and verification
- Car search and booking
- Payment processing
- Contract management
- Wallet operations
- Reviews and ratings

### 3. Admin Module (`/api/admin`)
- System overview and analytics
- Car approval and management
- KYC customer verification
- Promotion management
- Payment and settlement processing
- Dispute resolution
- User management
- Platform wallet management

### 4. Public Module (`/api`)
- Public car listings
- Promotion display
- Car availability checking
- Review summaries

### 5. Upload Module (`/upload`)
- Image upload to Cloudinary
- File validation and processing

---

## 📧 Email Service

The system uses **Brevo** (formerly Sendinblue) for transactional emails:
- OTP delivery for registration/login
- Password reset emails
- Booking confirmations
- System notifications

### Configuration
```env
BREVO_API_KEY=your_api_key
EMAIL_FROM=your_email@domain.com
EMAIL_FROM_NAME=Elite Drive
```

---

## 🗄️ Database Schema

### Core Models
- **User**: User accounts with role-based permissions
- **KYC**: Know Your Customer verification data
- **Car**: Vehicle listings with pricing and availability
- **Booking**: Rental reservations
- **Payment**: Transaction records
- **Wallet**: User wallet for payments
- **Contract**: Rental agreements
- **Review**: Customer feedback
- **Promotion**: Discount codes and offers
- **Dispute**: Conflict resolution system

### Key Features
- Multi-role user system (Admin, Owner, Customer)
- KYC verification with document upload
- Real-time car availability tracking
- Escrow payment system
- Contract signing workflow
- Dispute management
- Settlement processing for owners

---

## 🐳 Docker Services (Optional)

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

## 🔧 Development Commands

### Backend (NestJS)
```bash
# Development with watch mode
npm run start:dev

# Production build
npm run build
npm run start:prod

# Run tests
npm run test
npm run test:e2e

# Linting
npm run lint
npm run format
```

### Frontend (Next.js)
```bash
# Development server
npm run dev

# Production build
npm run build
npm run start

# Linting
npm run lint
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000    # Frontend
lsof -i :3001    # Backend

# Kill process
kill -9 <PID>
```

### Database Connection Error
- Check MongoDB is running: `mongo --eval "db.adminCommand('ping')"`
- Verify `DATABASE_URL` in `.env`

### Dependencies Conflict
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json
npm install
```

### Email Service Issues
- Verify Brevo API key is valid
- Check email quota and rate limits
- Ensure email templates are properly configured

---

## 📞 Support

If you encounter issues, please check:

1. Node.js version: `node --version`
2. npm version: `npm --version`
3. Server and client logs
4. Database connection status
5. Environment variable configuration

For production deployment issues:
- Verify all environment variables are set
- Check database connection strings
- Ensure email service API keys are valid
- Review CORS configuration

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Brevo API Documentation](https://developers.brevo.com/docs)

---

## 🚀 Deployment

### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Railway/Heroku (Backend)
```bash
# Build and deploy
npm run build
# Configure environment variables in hosting platform
```

### Docker Deployment
```bash
# Build Docker images
docker build -t elitedrive-client ./client
docker build -t elitedrive-server ./server

# Run with Docker Compose
docker-compose up -d
```

---

