"use client";

import { useState } from "react";
import { useRejectKyc } from "../admin.queries";

export function RejectDialog({ open, onClose, userId }: { open: boolean; onClose: () => void; userId: string }) {
  const [reason, setReason] = useState("");
  const reject = useRejectKyc();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 space-y-3 w-80">
        <h3 className="font-semibold">Reject KYC</h3>
        <textarea
          className="w-full border p-2"
          placeholder="Lý do từ chối"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={() => {
              reject.mutate({ userId, dto: { rejectionReason: reason } });
              onClose();
            }}
            className="bg-red-500 text-white px-3 py-1">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
