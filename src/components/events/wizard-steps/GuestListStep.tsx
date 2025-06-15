import React, { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Mail, Users } from "lucide-react";
import { FormLabel } from "@/components/ui/form";
import { ImportGuestsDialog } from "./ImportGuestsDialog";
import { TicketQRCodeDialog } from "../TicketQRCodeDialog";

export interface Guest {
  id?: string;
  name: string;
  email: string;
  category?: string;
  is_vip?: boolean;
  plus_one_name?: string;
  plus_one_allowed?: boolean;
  ticket_code?: string;
}

export function GuestListStep() {
  const { setValue, getValues } = useFormContext();
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [qrDialogGuest, setQrDialogGuest] = useState<Guest | null>(null);
  
  // Get current guests list
  const guests = useWatch({
    name: "guests",
    defaultValue: [],
  }) as Guest[];

  const addGuest = () => {
    setError(null);
    
    if (!newGuestName.trim()) {
      setError("Guest name is required");
      return;
    }
    
    if (!newGuestEmail.trim()) {
      setError("Guest email is required");
      return;
    }
    
    if (!isValidEmail(newGuestEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    
    // Check if guest with this email already exists
    const existingGuestWithEmail = guests.find(
      guest => guest.email.toLowerCase() === newGuestEmail.toLowerCase()
    );
    
    if (existingGuestWithEmail) {
      setError("A guest with this email already exists");
      return;
    }
    
    const newGuest: Guest = {
      id: crypto.randomUUID(), // This will be replaced when saved to database
      name: newGuestName,
      email: newGuestEmail,
    };
    
    setValue("guests", [...guests, newGuest]);
    
    // Clear input fields
    setNewGuestName("");
    setNewGuestEmail("");
  };
  
  const removeGuest = (index: number) => {
    const updatedGuests = [...guests];
    updatedGuests.splice(index, 1);
    setValue("guests", updatedGuests);
  };
  
  const handleImportGuests = (importedGuests: Guest[]) => {
    // Filter out duplicates by email
    const existingEmails = new Set(guests.map(guest => guest.email.toLowerCase()));
    const newGuests = importedGuests.filter(guest => !existingEmails.has(guest.email.toLowerCase()));
    
    if (newGuests.length > 0) {
      setValue("guests", [...guests, ...newGuests]);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Guest List</h3>
        <p className="text-sm text-muted-foreground">
          Add guests who should receive invitations to your event
        </p>
      </div>
      
      <div className="flex items-end gap-3">
        <div className="space-y-2 flex-1">
          <FormLabel htmlFor="guestName">Name</FormLabel>
          <Input
            id="guestName"
            placeholder="Guest Name"
            value={newGuestName}
            onChange={e => setNewGuestName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2 flex-1">
          <FormLabel htmlFor="guestEmail">Email</FormLabel>
          <Input
            id="guestEmail"
            type="email"
            placeholder="guest@example.com"
            value={newGuestEmail}
            onChange={e => setNewGuestEmail(e.target.value)}
          />
        </div>
        
        <Button type="button" onClick={addGuest} className="mb-0.5">
          <Plus className="h-4 w-4 mr-1" />
          Add Guest
        </Button>
      </div>
      
      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      <div className="flex justify-between items-center">
        <h4 className="font-medium flex items-center">
          <Users className="mr-2 h-4 w-4" />
          Guest List ({guests.length})
        </h4>
        <ImportGuestsDialog onImport={handleImportGuests} />
      </div>
      
      {guests.length === 0 ? (
        <div className="text-sm text-center py-8 border border-dashed rounded-md bg-muted/30">
          No guests added yet
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>VIP</TableHead>
                <TableHead>Plus-One</TableHead>
                <TableHead>QR Ticket</TableHead>
                <TableHead className="w-[110px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest, index) => (
                <TableRow key={guest.id || index}>
                  <TableCell>{guest.name}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>{guest.category || "-"}</TableCell>
                  <TableCell>
                    {guest.is_vip ? <span className="text-yellow-900 font-semibold">VIP</span> : "-"}
                  </TableCell>
                  <TableCell>
                    {guest.plus_one_name ? guest.plus_one_name : guest.plus_one_allowed ? "Allowed" : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQrDialogGuest(guest)}
                    >
                      View QR
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeGuest(index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {qrDialogGuest && (
        <TicketQRCodeDialog
          open={!!qrDialogGuest}
          onOpenChange={() => setQrDialogGuest(null)}
          ticketCode={qrDialogGuest.ticket_code || ""}
          guestName={qrDialogGuest.name}
          guestEmail={qrDialogGuest.email}
        />
      )}
    </div>
  );
}
