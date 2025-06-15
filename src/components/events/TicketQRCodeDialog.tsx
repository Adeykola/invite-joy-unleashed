
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCode from "../QRCode";

interface TicketQRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketCode: string;
  guestName: string;
  guestEmail: string;
}

export function TicketQRCodeDialog({
  open,
  onOpenChange,
  ticketCode,
  guestName,
  guestEmail,
}: TicketQRCodeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Guest Ticket QR</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 p-2">
          <QRCode value={ticketCode} size={180} />
          <div className="text-sm text-center">
            <div className="font-semibold">{guestName}</div>
            <div className="text-muted-foreground">{guestEmail}</div>
            <div className="mt-2 text-xs text-gray-500 break-all">{ticketCode}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
