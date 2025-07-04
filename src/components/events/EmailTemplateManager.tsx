
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Plus, Edit2, Trash2, Star, Copy } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_type: string;
  variables: any;
  is_default: boolean;
  created_at: string;
}

export function EmailTemplateManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [templateType, setTemplateType] = useState("invitation");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: {
      name: string;
      subject: string;
      content: string;
      template_type: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("email_templates")
        .insert({
          ...templateData,
          user_id: userData.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      resetForm();
      setIsCreateOpen(false);
      toast({
        title: "Template Created",
        description: "Email template has been created successfully.",
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async (templateData: {
      id: string;
      name: string;
      subject: string;
      content: string;
      template_type: string;
    }) => {
      const { id, ...updateData } = templateData;
      const { data, error } = await supabase
        .from("email_templates")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      resetForm();
      setEditingTemplate(null);
      toast({
        title: "Template Updated",
        description: "Email template has been updated successfully.",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast({
        title: "Template Deleted",
        description: "Email template has been deleted successfully.",
      });
    },
  });

  const resetForm = () => {
    setTemplateName("");
    setTemplateSubject("");
    setTemplateContent("");
    setTemplateType("invitation");
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateSubject(template.subject);
    setTemplateContent(template.content);
    setTemplateType(template.template_type);
  };

  const handleSubmit = () => {
    if (!templateName || !templateSubject || !templateContent) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const templateData = {
      name: templateName,
      subject: templateSubject,
      content: templateContent,
      template_type: templateType,
    };

    if (editingTemplate) {
      updateTemplateMutation.mutate({
        id: editingTemplate.id,
        ...templateData,
      });
    } else {
      createTemplateMutation.mutate(templateData);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      invitation: "bg-blue-100 text-blue-800",
      reminder: "bg-yellow-100 text-yellow-800",
      confirmation: "bg-green-100 text-green-800",
      cancellation: "bg-red-100 text-red-800",
    };
    return colors[type] || colors.invitation;
  };

  const defaultTemplateContent = {
    invitation: `Dear {{guest_name}},

You're invited to {{event_title}}!

📅 Date: {{event_date}}
📍 Location: {{event_location}}

{{event_description}}

Please RSVP by clicking the link below:
{{rsvp_link}}

Looking forward to seeing you there!

Best regards,
{{host_name}}`,
    reminder: `Hi {{guest_name}},

This is a friendly reminder about {{event_title}} happening soon!

📅 Date: {{event_date}}
📍 Location: {{event_location}}

Don't forget to bring: {{additional_info}}

See you there!

Best regards,
{{host_name}}`,
    confirmation: `Hi {{guest_name}},

Thank you for RSVPing to {{event_title}}!

Your response: {{rsvp_status}}
Ticket Code: {{ticket_code}}

Event Details:
📅 Date: {{event_date}}
📍 Location: {{event_location}}

Best regards,
{{host_name}}`,
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Email Templates
        </h3>
        <Dialog 
          open={isCreateOpen || !!editingTemplate} 
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateOpen(false);
              setEditingTemplate(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Email Template" : "Create Email Template"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="template-type">Template Type</Label>
                  <Select value={templateType} onValueChange={(value) => {
                    setTemplateType(value);
                    if (!templateContent && defaultTemplateContent[value as keyof typeof defaultTemplateContent]) {
                      setTemplateContent(defaultTemplateContent[value as keyof typeof defaultTemplateContent]);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invitation">Invitation</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="confirmation">Confirmation</SelectItem>
                      <SelectItem value="cancellation">Cancellation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="template-subject">Subject Line</Label>
                <Input
                  id="template-subject"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>
              <div>
                <Label htmlFor="template-content">Email Content</Label>
                <Textarea
                  id="template-content"
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  placeholder="Enter email content"
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use variables like: guest_name, event_title, event_date, event_location, rsvp_link
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingTemplate(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                >
                  {createTemplateMutation.isPending || updateTemplateMutation.isPending 
                    ? (editingTemplate ? "Updating..." : "Creating...") 
                    : (editingTemplate ? "Update Template" : "Create Template")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates?.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base flex items-center">
                    {template.name}
                    {template.is_default && (
                      <Star className="h-4 w-4 ml-2 text-yellow-500 fill-current" />
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{template.subject}</p>
                </div>
                <Badge className={getTypeColor(template.template_type)}>
                  {template.template_type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {template.content.substring(0, 150)}...
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {new Date(template.created_at).toLocaleDateString()}
                </span>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(template.content);
                      toast({ title: "Template content copied to clipboard" });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTemplateMutation.mutate(template.id)}
                    disabled={deleteTemplateMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates?.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Email Templates</h3>
            <p className="text-muted-foreground mb-4">
              Create your first email template to streamline your event communications.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
