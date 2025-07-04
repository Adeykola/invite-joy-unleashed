
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGuestManagement, DetailedGuest } from "@/hooks/useGuestManagement";
import { GuestManagementDialog } from "./GuestManagementDialog";
import { InviteGuestsDialog } from "./InviteGuestsDialog";
import { TicketQRCodeDialog } from "../TicketQRCodeDialog";
import { PaymentStatusBadge } from "../payments/PaymentStatusBadge";
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Filter, 
  Users,
  Mail,
  UserCheck,
  Crown,
  Calendar,
  QrCode
} from "lucide-react";

interface EnhancedGuestListProps {
  eventId: string;
}

export function EnhancedGuestList({ eventId }: EnhancedGuestListProps) {
  const {
    guests,
    guestStats,
    isLoadingGuests,
    isLoadingStats,
    addGuest,
    updateGuest,
    deleteGuest,
    bulkInvite,
    isAddingGuest,
    isUpdatingGuest,
    isDeletingGuest,
  } = useGuestManagement(eventId);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedGuest, setSelectedGuest] = useState<DetailedGuest | null>(null);
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [qrDialogGuest, setQrDialogGuest] = useState<DetailedGuest | null>(null);

  const filteredGuests = guests?.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || guest.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "invited" && guest.invite_sent) ||
                         (statusFilter === "pending" && !guest.invite_sent) ||
                         (statusFilter === "confirmed" && guest.rsvp_status === "confirmed") ||
                         (statusFilter === "declined" && guest.rsvp_status === "declined") ||
                         (statusFilter === "vip" && guest.is_vip);
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const handleAddGuest = () => {
    setSelectedGuest(null);
    setIsGuestDialogOpen(true);
  };

  const handleEditGuest = (guest: DetailedGuest) => {
    setSelectedGuest(guest);
    setIsGuestDialogOpen(true);
  };

  const handleSaveGuest = (guestData: any) => {
    if (selectedGuest) {
      updateGuest({ guestId: selectedGuest.id, updates: guestData });
    } else {
      addGuest(guestData);
    }
  };

  const handleDeleteGuest = (guestId: string) => {
    if (confirm("Are you sure you want to remove this guest?")) {
      deleteGuest(guestId);
    }
  };

  const getRSVPStatusBadge = (status?: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "declined":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Declined</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">No Response</Badge>;
    }
  };

  if (isLoadingGuests || isLoadingStats) {
    return <div className="text-center py-8">Loading guest list...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Guest Statistics */}
      {guestStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{guestStats.total_guests}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Mail className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{guestStats.invited_guests}</div>
              <div className="text-sm text-muted-foreground">Invited</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <UserCheck className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{guestStats.rsvp_confirmed}</div>
              <div className="text-sm text-muted-foreground">Confirmed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold">{guestStats.rsvp_declined}</div>
              <div className="text-sm text-muted-foreground">Declined</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Crown className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">{guestStats.vip_guests}</div>
              <div className="text-sm text-muted-foreground">VIP</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <QrCode className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{guestStats.checked_in_guests}</div>
              <div className="text-sm text-muted-foreground">Checked In</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Mail className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{guestStats.rsvp_pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-bold">{guestStats.pending_invites}</div>
              <div className="text-sm text-muted-foreground">Not Invited</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[120px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="friends">Friends</SelectItem>
              <SelectItem value="colleagues">Colleagues</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsInviteDialogOpen(true)} variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Send Invites
          </Button>
          <Button onClick={handleAddGuest}>
            <Plus className="h-4 w-4 mr-2" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Guest Table */}
      <Card>
        <CardHeader>
          <CardTitle>Guest List ({filteredGuests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Special</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium">
                      <div>
                        {guest.name}
                        {guest.is_vip && <Crown className="inline h-4 w-4 ml-1 text-yellow-500" />}
                      </div>
                      {guest.plus_one_allowed && (
                        <div className="text-xs text-muted-foreground">
                          +1: {guest.plus_one_name || "Allowed"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{guest.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {guest.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {guest.invite_sent ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Invited
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getRSVPStatusBadge(guest.rsvp_status)}</TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={guest.payment_status || "pending"} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {guest.checked_in && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Checked In
                          </Badge>
                        )}
                        {guest.dietary_restrictions && (
                          <Badge variant="outline" className="text-xs">
                            Dietary
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditGuest(guest)}>
                            Edit Guest
                          </DropdownMenuItem>
                          {guest.ticket_code && (
                            <DropdownMenuItem onClick={() => setQrDialogGuest(guest)}>
                              View QR Code
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteGuest(guest.id)}
                            className="text-red-600"
                          >
                            Remove Guest
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredGuests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || categoryFilter !== "all" || statusFilter !== "all" 
                ? "No guests match your filters"
                : "No guests added yet"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <GuestManagementDialog
        open={isGuestDialogOpen}
        onOpenChange={setIsGuestDialogOpen}
        guest={selectedGuest}
        onSave={handleSaveGuest}
        isLoading={isAddingGuest || isUpdatingGuest}
      />

      <InviteGuestsDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        eventId={eventId}
        guests={guests || []}
        onInvite={bulkInvite}
        isLoading={false}
      />

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
