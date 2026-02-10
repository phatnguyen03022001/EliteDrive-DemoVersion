"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PaymentMethodForm } from "@/features/customer/payments/[bookingId]/PaymentMethodForm";
import { QrPaymentBox } from "@/features/customer/payments/[bookingId]/QrPaymentBox";

export default function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>();

  const [paymentResult, setPaymentResult] = useState<any>(null);

  return (
    <div>
      <h1>Thanh toán booking</h1>

      {!paymentResult && <PaymentMethodForm bookingId={bookingId} onSuccess={setPaymentResult} />}

      {paymentResult && <QrPaymentBox bookingId={bookingId} payment={paymentResult} />}
    </div>
  );
}
