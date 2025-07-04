
import { useState } from "react";
import { useAdvancedEventManagement, AdvancedEventData } from "@/hooks/useAdvancedEventManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Settings, Tag, Clock } from "lucide-react";

interface AdvancedEventFormProps {
  onSuccess?: () => void;
  initialData?: Partial<AdvancedEventData>;
  mode?: "create" | "edit";
}

export function AdvancedEventForm({ onSuccess, initialData, mode = "create" }: AdvancedEventFormProps) {
  const [formData, setFormData] = useState<AdvancedEventData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    date: initialData?.date || "",
    location: initialData?.location || "",
    capacity: initialData?.capacity,
    event_type: initialData?.event_type || "general",
    is_private: initialData?.is_private || false,
    require_approval: initialData?.require_approval || false,
    max_guests_per_rsvp: initialData?.max_guests_per_rsvp || 1,
    registration_deadline: initialData?.registration_deadline,
    tags: initialData?.tags || [],
    custom_fields: initialData?.custom_fields || {},
  });

  const [newTag, setNewTag] = useState("");
  const { createAdvancedEvent, updateEvent, isCreating, isUpdating } = useAdvancedEventManagement();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "create") {
      createAdvancedEvent(formData);
    } else {
      updateEvent({ id: initialData?.id as string, ...formData });
    }
    
    onSuccess?.();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const updateFormData = (field: keyof AdvancedEventData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>
            <div>
              <Label htmlFor="event-type">Event Type</Label>
              <Select value={formData.event_type} onValueChange={(value) => updateFormData("event_type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              placeholder="Describe your event"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date & Time *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => updateFormData("date", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
                placeholder="Enter event location"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Guest Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="capacity">Event Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity || ""}
                onChange={(e) => updateFormData("capacity", e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Max attendees"
              />
            </div>
            <div>
              <Label htmlFor="max-guests">Max Guests per RSVP</Label>
              <Select value={formData.max_guests_per_rsvp.toString()} onValueChange={(value) => updateFormData("max_guests_per_rsvp", parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 8, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="registration-deadline">Registration Deadline</Label>
              <Input
                id="registration-deadline"
                type="datetime-local"
                value={formData.registration_deadline || ""}
                onChange={(e) => updateFormData("registration_deadline", e.target.value || undefined)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-private"
                checked={formData.is_private}
                onCheckedChange={(checked) => updateFormData("is_private", checked)}
              />
              <Label htmlFor="is-private">Private Event</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="require-approval"
                checked={formData.require_approval}
                onCheckedChange={(checked) => updateFormData("require_approval", checked)}
              />
              <Label htmlFor="require-approval">Require RSVP Approval</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Tags & Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              Add Tag
            </Button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isCreating || isUpdating}>
          {mode === "create" 
            ? (isCreating ? "Creating..." : "Create Event")
            : (isUpdating ? "Updating..." : "Update Event")
          }
        </Button>
      </div>
    </form>
  );
}
