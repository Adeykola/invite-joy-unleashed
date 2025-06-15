
import React from "react";

interface PaymentStatusBadgeProps {
  status: string;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  let color = "bg-gray-100 text-gray-800 border-gray-300";
  if (status === "paid") color = "bg-green-100 text-green-800 border-green-400";
  if (status === "pending") color = "bg-yellow-100 text-yellow-700 border-yellow-400";
  if (status === "refunded") color = "bg-blue-100 text-blue-700 border-blue-400";
  if (status === "failed") color = "bg-red-100 text-red-700 border-red-400";

  return (
    <span className={`px-2 py-0.5 rounded text-xs border ${color}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
