"use client";

import { CustomerService } from "@/features/customer/customer.service";

export function QrPaymentBox({
  payment,
  bookingId,
}: {
  bookingId: string;
  payment: {
    id: string;
    amount: number;
    mockQrUrl?: string;
  };
}) {
  const handleConfirm = async () => {
    await CustomerService.confirmPayment({
      bookingId,
      transactionId: `MOCK_TX_${Date.now()}`,
    });

    alert("Thanh toán thành công");
  };

  return (
    <div>
      <h3>Thông tin thanh toán</h3>

      <p>Số tiền: {payment.amount}</p>

      {payment.mockQrUrl && (
        <>
          <p>QR Mock (dev)</p>
          <a href={payment.mockQrUrl} target="_blank">
            Quét QR (mock)
          </a>
        </>
      )}

      <button onClick={handleConfirm}>Xác nhận đã thanh toán</button>
    </div>
  );
}
