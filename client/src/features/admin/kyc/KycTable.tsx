// app/admin/kyc/components/KycTable.tsx
"use client";

import { KYCItem, KYCStatus } from "../admin.schema";
import { KycActions } from "./KycActions";

export function KycTable({ items }: { items: KYCItem[] }) {
  return (
    <table className="w-full border">
      <thead>
        <tr className="border-b text-left">
          <th className="p-2">Email</th>
          <th className="p-2">Name</th>
          <th className="p-2">Status</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-b">
            <td className="p-2">{item.user.email}</td>
            <td className="p-2">
              {item.user.firstName} {item.user.lastName}
            </td>
            <td className="p-2">{item.status}</td>
            <td className="p-2">{item.status === KYCStatus.enum.PENDING && <KycActions userId={item.userId} />}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
