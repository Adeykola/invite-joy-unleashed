
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";

interface Template {
  id: string;
  title: string;
  content: string;
}

interface TemplateEditorProps {
  onTemplateSelect?: (template: Template) => void;
}

export function TemplateEditor({ onTemplateSelect }: TemplateEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Template>({ id: '', title: '', content: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load templates when component mounts
  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  // Load templates from the database
  const loadTemplates = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      setTemplates(data || []);
      
      // Select the first template if available and callback exists
      if (data && data.length > 0 && onTemplateSelect) {
        setCurrentTemplate(data[0]);
        onTemplateSelect(data[0]);
      }
    } catch (err) {
      console.error("Error loading templates:", err);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new template
  const createNewTemplate = () => {
    setCurrentTemplate({ id: '', title: '', content: '' });
  };

  // Select a template
  const selectTemplate = (template: Template) => {
    setCurrentTemplate(template);
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  // Save the current template
  const saveTemplate = async () => {
    if (!user || !currentTemplate.title || !currentTemplate.content) return;

    setIsSaving(true);
    try {
      let result;
      
      if (currentTemplate.id) {
        // Update existing template
        result = await supabase
          .from("message_templates")
          .update({
            title: currentTemplate.title,
            content: currentTemplate.content,
          })
          .eq("id", currentTemplate.id);
      } else {
        // Create new template
        result = await supabase
          .from("message_templates")
          .insert({
            user_id: user.id,
            title: currentTemplate.title,
            content: currentTemplate.content,
          })
          .select();
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: "Template saved successfully",
      });

      // Refresh templates
      loadTemplates();
      
      // If this was a new template, clear the form
      if (!currentTemplate.id && result.data && result.data.length > 0) {
        setCurrentTemplate(result.data[0]);
        if (onTemplateSelect) {
          onTemplateSelect(result.data[0]);
        }
      }
    } catch (err) {
      console.error("Error saving template:", err);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a template
  const deleteTemplate = async () => {
    if (!user || !currentTemplate.id) return;

    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("message_templates")
        .delete()
        .eq("id", currentTemplate.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      // Clear current template and refresh list
      createNewTemplate();
      loadTemplates();
    } catch (err) {
      console.error("Error deleting template:", err);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function for template placeholders
  const insertPlaceholder = (placeholder: string) => {
    setCurrentTemplate({
      ...currentTemplate,
      content: currentTemplate.content + placeholder
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Templates
                <Button variant="ghost" size="sm" onClick={createNewTemplate}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No templates yet
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant={currentTemplate.id === template.id ? "default" : "outline"}
                      className="w-full justify-start text-left truncate"
                      onClick={() => selectTemplate(template)}
                    >
                      {template.title}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="w-full sm:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>
                {currentTemplate.id ? 'Edit Template' : 'New Template'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Template Name</Label>
                <Input
                  id="title"
                  value={currentTemplate.title}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, title: e.target.value})}
                  placeholder="Enter template name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Message Content</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertPlaceholder("{{name}}")}
                  >
                    Name
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertPlaceholder("{{event_title}}")}
                  >
                    Event
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertPlaceholder("{{date}}")}
                  >
                    Date
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertPlaceholder("{{location}}")}
                  >
                    Location
                  </Button>
                </div>
                <Textarea
                  id="content"
                  value={currentTemplate.content}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, content: e.target.value})}
                  placeholder="Enter message content with placeholders like {{name}}"
                  rows={8}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {currentTemplate.id && (
                <Button 
                  variant="destructive"
                  onClick={deleteTemplate}
                  disabled={isSaving}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button 
                onClick={saveTemplate}
                disabled={!currentTemplate.title || !currentTemplate.content || isSaving}
                className={!currentTemplate.id ? "w-full" : ""}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Template
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
