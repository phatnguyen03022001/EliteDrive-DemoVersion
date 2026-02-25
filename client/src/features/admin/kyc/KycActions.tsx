"use client";

import { useState } from "react";
import { useApproveKyc } from "../admin.queries";
import { RejectDialog } from "./RejectDialog";

export function KycActions({ userId }: { userId: string }) {
  const approve = useApproveKyc();
  const [openReject, setOpenReject] = useState(false);

  return (
    <div className="flex gap-2">
      <button onClick={() => approve.mutate({ userId })} className="px-2 py-1 bg-green-500 text-white">
        Approve
      </button>
      <button onClick={() => setOpenReject(true)} className="px-2 py-1 bg-red-500 text-white">
        Reject
      </button>

      <RejectDialog open={openReject} onClose={() => setOpenReject(false)} userId={userId} />
    </div>
  );
}
