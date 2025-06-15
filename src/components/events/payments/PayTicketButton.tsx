
import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

// Placeholder for future Stripe integration
export function PayTicketButton({ disabled }: { disabled?: boolean }) {
  return (
    <Button disabled={disabled}>
      <CreditCard className="mr-2 h-4 w-4" />
      Pay Ticket
    </Button>
  );
}
