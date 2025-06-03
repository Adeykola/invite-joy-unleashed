
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Template {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export const MessageTemplates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['message-templates', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Template[];
    },
    enabled: !!user?.id,
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: { title: string; content: string }) => {
      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          user_id: user?.id,
          title: templateData.title,
          content: templateData.content
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      setIsCreateOpen(false);
      setFormData({ title: '', content: '' });
      toast({
        title: "Template Created",
        description: "Message template has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, ...templateData }: { id: string; title: string; content: string }) => {
      const { data, error } = await supabase
        .from('message_templates')
        .update(templateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      setEditingTemplate(null);
      setFormData({ title: '', content: '' });
      toast({
        title: "Template Updated",
        description: "Message template has been updated successfully",
      });
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast({
        title: "Template Deleted",
        description: "Message template has been deleted successfully",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTemplate) {
      updateTemplateMutation.mutate({
        id: editingTemplate.id,
        ...formData
      });
    } else {
      createTemplateMutation.mutate(formData);
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({ title: template.title, content: template.content });
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setFormData({ title: '', content: '' });
  };

  const defaultTemplates = [
    {
      title: "Event Invitation",
      content: "Hi {{guest_name}}! You're invited to {{event_title}} on {{event_date}} at {{event_location}}. Please RSVP: {{rsvp_link}}"
    },
    {
      title: "RSVP Confirmation",
      content: "Thanks for confirming your attendance to {{event_title}}! We'll see you on {{event_date}} at {{event_location}}."
    },
    {
      title: "Event Reminder",
      content: "Reminder: {{event_title}} is tomorrow at {{event_time}} at {{event_location}}. Can't wait to see you there!"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Message Templates
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Message Template</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Template Name</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Event Invitation"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content">Message Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Use {{guest_name}}, {{event_title}}, {{event_date}}, {{event_location}} for dynamic content"
                    rows={4}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available variables: {{guest_name}}, {{event_title}}, {{event_date}}, {{event_location}}, {{rsvp_link}}
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTemplateMutation.isPending}>
                    Create Template
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Templates */}
          <div>
            <h4 className="font-medium mb-2">Quick Start Templates</h4>
            <div className="grid gap-2">
              {defaultTemplates.map((template, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm">{template.title}</h5>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFormData({ title: template.title, content: template.content });
                        setIsCreateOpen(true);
                      }}
                    >
                      Use Template
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{template.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Templates */}
          <div>
            <h4 className="font-medium mb-2">Your Templates</h4>
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading templates...</p>
            ) : templates && templates.length > 0 ? (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-3">
                    {editingTemplate?.id === template.id ? (
                      <form onSubmit={handleSubmit} className="space-y-3">
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Template name"
                          required
                        />
                        <Textarea
                          value={formData.content}
                          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Message content"
                          rows={3}
                          required
                        />
                        <div className="flex justify-end space-x-2">
                          <Button type="button" size="sm" variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                          <Button type="submit" size="sm" disabled={updateTemplateMutation.isPending}>
                            Save
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm">{template.title}</h5>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(template)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteTemplateMutation.mutate(template.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{template.content}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No custom templates yet. Create your first template above.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
