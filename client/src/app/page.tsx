"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Car,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Shield,
  Users,
  Fuel,
  Gauge,
} from "lucide-react";
import Image, { StaticImageData } from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function EliteDriveLanding() {
  return (
    <div className="min-h-screen selection:bg-primary/20">
      {/* 1. NAVIGATION BAR */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Car size={20} />
            </div>
            <span className="font-bold text-xl tracking-tighter uppercase">Elite Drive</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-wider">
            <a href="#fleet" className="hover:text-primary transition-colors">
              Đội xe
            </a>
            <a href="#features" className="hover:text-primary transition-colors">
              An toàn
            </a>
            <a href="#process" className="hover:text-primary transition-colors">
              Quy trình
            </a>
          </div>
          <Button className="rounded-full px-6">Hotline: 039 999 6868</Button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-muted/30">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto">
            <motion.div variants={fadeIn}>
              <Badge variant="default" className="mb-6 py-1 px-4 text-xs font-bold tracking-[0.2em] uppercase">
                Chỉ có tại TP. Hồ Chí Minh
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Thuê xe tự lái cao cấp <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground/50 to-foreground">
                Đẳng cấp thực sự.
              </span>
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Làm chủ mọi hành trình chỉ trong 90 giây. Xe đời mới dưới 3 năm, bảo hiểm 100%, sẵn sàng giao ngay tại Sài
              Gòn.
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="h-14 px-8 rounded-full text-md font-bold hover:scale-105 transition-transform">
                  Khám phá đội xe ngay <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-md font-bold border-2">
                Đặt xe trong 90 giây
              </Button>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute inset-0 z-0 opacity-20">
          <Image src="/images/car3.png" alt="Luxury car in Saigon" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-background/20" />
        </div>
      </section>

      {/* 3. FLEET SECTION */}
      {/* 3. FLEET SECTION (ĐỘI XE) */}

      <section id="fleet" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-tight">
              Đội xe đa dạng & Sang trọng
            </h2>

            <p className="text-slate-500">Tất cả xe đều dưới 3 năm tuổi, bảo dưỡng chính hãng, sạch sẽ 100%.</p>
          </div>

          <Tabs defaultValue="luxury" className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="bg-slate-100 p-1 h-auto rounded-full overflow-x-auto">
                <TabsTrigger
                  value="luxury"
                  className="rounded-full px-6 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white">
                  Sedan Biểu Tượng
                </TabsTrigger>

                <TabsTrigger
                  value="suv"
                  className="rounded-full px-6 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white">
                  SUV Mạnh Mẽ
                </TabsTrigger>

                <TabsTrigger
                  value="group"
                  className="rounded-full px-6 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white">
                  Gia Đình & Nhóm
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="luxury" className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <CarCard
                imageSrc={"/images/car4.png"}
                name="Mercedes E-Class"
                price="3.500.000"
                type="Luxury Sedan"
                imageDescription="A sleek black Mercedes E-Class parked elegantly in a city street at dusk, cinematic lighting."
              />

              <CarCard
                imageSrc={"/images/car3.png"}
                name="BMW 5 Series"
                price="3.200.000"
                type="Sport Sedan"
                imageDescription="A silver BMW 5 Series driving on a highway with the city skyline in the background, dynamic shot."
              />

              <CarCard
                imageSrc={"/images/car2.png"}
                name="Audi A6"
                price="3.000.000"
                type="Business Sedan"
                imageDescription="A pristine white Audi A6 parked in front of a modern glass building, reflecting sunlight."
              />
            </TabsContent>

            <TabsContent value="suv" className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <CarCard
                imageSrc={"/images/car4.png"}
                name="Porsche Cayenne"
                price="6.500.000"
                type="Luxury SUV"
                imageDescription="A powerful grey Porsche Cayenne navigating a winding mountain road, scenic view."
              />

              <CarCard
                imageSrc={"/images/car2.png"}
                name="Range Rover Defender"
                price="5.500.000"
                type="Off-road Luxury"
                imageDescription="A rugged green Land Rover Defender parked by a serene lake, adventure theme."
              />

              <CarCard
                imageSrc={"/images/car3.png"}
                name="Mercedes GLC 300"
                price="2.800.000"
                type="Premium SUV"
                imageDescription="A dark blue Mercedes GLC 300 in an urban setting, sleek and modern."
              />
            </TabsContent>

            <TabsContent value="group" className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <CarCard
                imageSrc={"/images/car4.png"}
                name="Toyota Veloz Cross"
                price="1.200.000"
                type="7-Seater"
                imageDescription="A spacious silver Toyota Veloz Cross parked at a family picnic spot, sunny day."
              />

              <CarCard
                imageSrc={"/images/car3.png"}
                name="Mitsubishi Xpander"
                price="1.100.000"
                type="7-Seater"
                imageDescription="A red Mitsubishi Xpander driving through a suburban neighborhood, family friendly."
              />

              <CarCard
                imageSrc={"/images/car2.png"}
                name="Innova Cross 2024"
                price="1.500.000"
                type="Premium MPV"
                imageDescription="A new model white Toyota Innova Cross parked at a luxurious resort entrance."
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* 4. FEATURES */}
      <section id="features" className="py-24 bg-primary text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                An toàn & Tin cậy <br /> Chỉ có tại Elite Drive
              </h2>
              <div className="space-y-6">
                <FeatureItem
                  icon={<ShieldCheck />}
                  title="Hệ thống Escrow thông minh"
                  desc="Tiền được giữ an toàn, chỉ chuyển cho chủ xe khi bạn nhận xe và thực sự hài lòng."
                />
                <FeatureItem
                  icon={<UserCheck />}
                  title="KYC hai chiều nghiêm ngặt"
                  desc="Cả chủ xe lẫn khách thuê đều được xác thực danh tính rõ ràng qua CCCD & Selfie."
                />
                <FeatureItem
                  icon={<Shield />}
                  title="Bảo hiểm toàn diện 100%"
                  desc="Không lo va chạm hay rủi ro mất mát – quy trình bồi thường cực nhanh."
                />
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-primary-foreground/10 rounded-3xl border border-primary-foreground/20 p-8 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 bg-primary-foreground/20 rounded-full flex items-center justify-center font-bold text-xl">
                    24/7
                  </div>
                  <p className="text-xl font-medium">Hỗ trợ kỹ thuật & sự cố tại mọi khu vực TP.HCM</p>
                </div>
                <hr className="border-primary-foreground/10 mb-8" />
                <p className="text-primary-foreground/60 mb-4 tracking-wide uppercase text-xs">
                  Khu vực bàn giao miễn phí
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {["Quận 1, 3, 7", "Bình Thạnh", "Phú Nhuận", "TP. Thủ Đức"].map((loc) => (
                    <div key={loc} className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-accent" />
                      <span>{loc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROCESS */}
      <section id="process" className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold mb-16 uppercase tracking-wider">Quy trình siêu đơn giản</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <Step
              number="1"
              title="Chọn xe & Thời gian"
              desc="Lọc theo loại xe, màu sắc và giá phù hợp với phong cách của bạn."
            />
            <Step
              number="2"
              title="Xác thực & Thanh toán"
              desc="Xác thực nhanh qua CCCD + Selfie. Thanh toán bảo mật qua Ví Elite/Visa."
            />
            <Step
              number="3"
              title="Nhận xe & Khởi hành"
              desc="Kiểm tra xe nhanh cùng chủ xe, chụp ảnh và bắt đầu hành trình."
            />
          </div>
        </div>
      </section>

      {/* 6. PROMOTION */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground border-none overflow-hidden rounded-3xl">
            <div className="grid md:grid-cols-2">
              <div className="p-10 md:p-16">
                <Badge variant="secondary" className="mb-4">
                  Ưu đãi khách mới
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Tự lái. Tự tin. Tự do.</h2>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-accent" /> Giảm ngay 20-30% cho 3 ngày đầu
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-accent" /> Hoàn tiền ví đến 800.000 VNĐ
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-accent" /> Miễn phí giao xe Q1, Q3, Q7
                  </li>
                </ul>
                <Link href="/login">
                  <Button size="lg" variant="secondary" className="rounded-full font-bold">
                    Đặt xe ngay
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground p-1 rounded">
                <Car size={16} />
              </div>
              <span className="font-bold tracking-tighter uppercase">Elite Drive</span>
            </div>
            <p className="text-muted-foreground text-sm">Nơi mọi chuyến đi tại Sài Gòn đều xứng đáng đẳng cấp.</p>
          </div>
          <div className="text-center md:text-right">
            <p className="font-bold mb-2">Hotline hỗ trợ 24/7</p>
            <p className="text-2xl font-black">039 999 6868</p>
            <p className="text-xs text-muted-foreground mt-2">© 2026 Elite Drive - TP. Hồ Chí Minh</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---

interface CarCardProps {
  name: string;
  price: string;
  type: string;
  imageSrc?: StaticImageData | string; // actual image file
  imageDescription?: string; // fallback alt text if no image
}

const CarCard = ({ name, price, type, imageSrc }: CarCardProps) => {
  return (
    <div className="group overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        <div className="absolute top-4 left-4">
          <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-none shadow-sm font-bold uppercase tracking-wider text-[10px]">
            {type}
          </Badge>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold leading-none mb-1">{name}</h3>
            <p className="text-xs text-muted-foreground">Đời 2024 • Mới 99%</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold leading-none">{price}đ</p>
            <p className="text-[10px] text-muted-foreground mt-1">/ ngày</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2 border-y py-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <Users size={14} className="text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">5 Chỗ</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x">
            <Fuel size={14} className="text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">Xăng</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Gauge size={14} className="text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">Tự động</span>
          </div>
        </div>

        <Link href="/login">
          <Button className="w-full rounded-xl py-6 font-bold">
            Thuê ngay <ArrowRight size={18} className="ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 h-10 w-10 flex-shrink-0 bg-primary-foreground/10 rounded-lg flex items-center justify-center border border-primary-foreground/10">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-lg mb-1">{title}</h4>
        <p className="text-primary-foreground/70 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center px-4">
      <div className="w-16 h-16 rounded-full bg-muted border-2 flex items-center justify-center text-2xl font-black mb-6">
        {number}
      </div>
      <h4 className="font-bold text-xl mb-3">{title}</h4>
      <p className="text-muted-foreground text-sm">{desc}</p>
    </div>
  );
}
