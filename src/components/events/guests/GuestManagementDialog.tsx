
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DetailedGuest } from "@/hooks/useGuestManagement";

interface GuestManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest?: DetailedGuest | null;
  onSave: (guestData: any) => void;
  isLoading?: boolean;
}

export function GuestManagementDialog({
  open,
  onOpenChange,
  guest,
  onSave,
  isLoading = false,
}: GuestManagementDialogProps) {
  const [formData, setFormData] = useState({
    name: guest?.name || "",
    email: guest?.email || "",
    phone_number: guest?.phone_number || "",
    category: guest?.category || "general",
    is_vip: guest?.is_vip || false,
    plus_one_allowed: guest?.plus_one_allowed || false,
    plus_one_name: guest?.plus_one_name || "",
    dietary_restrictions: guest?.dietary_restrictions || "",
    notes: guest?.notes || "",
  });

  React.useEffect(() => {
    if (guest) {
      setFormData({
        name: guest.name || "",
        email: guest.email || "",
        phone_number: guest.phone_number || "",
        category: guest.category || "general",
        is_vip: guest.is_vip || false,
        plus_one_allowed: guest.plus_one_allowed || false,
        plus_one_name: guest.plus_one_name || "",
        dietary_restrictions: guest.dietary_restrictions || "",
        notes: guest.notes || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone_number: "",
        category: "general",
        is_vip: false,
        plus_one_allowed: false,
        plus_one_name: "",
        dietary_restrictions: "",
        notes: "",
      });
    }
  }, [guest, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {guest ? "Edit Guest" : "Add New Guest"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone_number}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="colleagues">Colleagues</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="vip"
              checked={formData.is_vip}
              onCheckedChange={(checked) => handleInputChange("is_vip", checked)}
            />
            <Label htmlFor="vip">VIP Guest</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="plus-one"
              checked={formData.plus_one_allowed}
              onCheckedChange={(checked) => handleInputChange("plus_one_allowed", checked)}
            />
            <Label htmlFor="plus-one">Allow Plus One</Label>
          </div>

          {formData.plus_one_allowed && (
            <div className="space-y-2">
              <Label htmlFor="plus-one-name">Plus One Name</Label>
              <Input
                id="plus-one-name"
                value={formData.plus_one_name}
                onChange={(e) => handleInputChange("plus_one_name", e.target.value)}
                placeholder="Enter plus one name if known"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dietary">Dietary Restrictions</Label>
            <Textarea
              id="dietary"
              value={formData.dietary_restrictions}
              onChange={(e) => handleInputChange("dietary_restrictions", e.target.value)}
              placeholder="Any dietary restrictions or allergies..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes about the guest..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : (guest ? "Update Guest" : "Add Guest")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
