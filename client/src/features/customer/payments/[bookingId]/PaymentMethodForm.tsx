"use client";

import { useForm } from "react-hook-form";
import { CustomerService } from "@/features/customer/customer.service";

type FormValues = {
  paymentMethod: "QR" | "BANK_TRANSFER";
};

export function PaymentMethodForm({ bookingId, onSuccess }: { bookingId: string; onSuccess: (payment: any) => void }) {
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      paymentMethod: "QR",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const res = await CustomerService.createPayment({
      bookingId,
      paymentMethod: values.paymentMethod,
    });

    // BE trả về: { payment, mockQrUrl }
    onSuccess(res.data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3>Chọn phương thức thanh toán</h3>

      <label>
        <input type="radio" value="QR" {...register("paymentMethod")} />
        Thanh toán QR
      </label>

      <label>
        <input type="radio" value="BANK_TRANSFER" {...register("paymentMethod")} />
        Chuyển khoản ngân hàng
      </label>

      <button type="submit">Tạo thanh toán</button>
    </form>
  );
}
