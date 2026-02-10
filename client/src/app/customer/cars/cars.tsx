"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, User, MapPin, Gauge, MessageSquare } from "lucide-react";

interface CarProps {
  id: string;
  name: string;
  brand: string;
  pricePerDay: number;
  mainImageUrl: string;
  averageRating: number;
  seatCount: number;
  _count?: { reviews: number };
  location?: { name: string };
  owner: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
}

export function CarCard({ car }: { car: CarProps }) {
  const reviewCount = car._count?.reviews || 0;

  return (
    <Link href={`/cars/${car.id}`} className="group">
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
        {/* Image Container */}
        <div className="relative h-64 w-full bg-gray-50 overflow-hidden">
          <Image
            src={car.mainImageUrl || "/placeholder-car.jpg"}
            alt={car.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Badge Brand */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-white/90 backdrop-blur-md text-black text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
              {car.brand}
            </span>
          </div>

          {/* Giá Overlay */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-xl">
              <span className="text-lg font-bold">{car.pricePerDay.toLocaleString("vi-VN")}đ</span>
              <span className="text-[10px] opacity-80"> /ngày</span>
            </div>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-4 right-4">
            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg shadow-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold ml-1 text-yellow-700">
                {car.averageRating > 0 ? car.averageRating.toFixed(1) : "Mới"}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Tên xe và địa điểm */}
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
              {car.name}
            </h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <MapPin className="w-3 h-3" />
              <span>{car.location?.name || "Hồ Chí Minh"}</span>
            </div>
          </div>

          {/* Thông số nhanh */}
          <div className="flex items-center gap-4 py-3 border-y border-gray-50 mb-4">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-600">{car.seatCount} chỗ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-600 font-medium">Tự động</span>
            </div>
          </div>

          {/* Review Count - Hiển thị nổi bật */}
          {reviewCount > 0 && (
            <div className="mb-4 flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">{reviewCount} đánh giá</span>
              <div className="flex-1" />
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-bold text-gray-700">{car.averageRating.toFixed(1)}</span>
              </div>
            </div>
          )}

          {/* Chủ xe & Action */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-100">
                <Image src={car.owner.avatar} alt="avatar" fill className="object-cover" />
              </div>
              <span className="text-xs font-medium text-gray-700">{car.owner.firstName}</span>
            </div>

            <span className="text-sm font-bold text-blue-600 group-hover:underline">Thuê ngay</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CarList({ cars }: { cars: CarProps[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {cars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
}
