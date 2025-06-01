
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, Plus, Trash2, AlertCircle } from "lucide-react";

interface Template {
  id: string;
  title: string;
  content: string;
}

interface TemplateEditorProps {
  onTemplateSelect?: (template: Template) => void;
}

export function TemplateEditor({ onTemplateSelect }: TemplateEditorProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Template>({ id: '', title: '', content: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load templates when component mounts
  useEffect(() => {
    if (user && isAuthenticated) {
      loadTemplates();
    }
  }, [user, isAuthenticated]);

  // Validate template content
  const validateTemplate = (template: Template): string[] => {
    const errors: string[] = [];
    
    if (!template.title.trim()) {
      errors.push('Template name is required');
    }
    
    if (!template.content.trim()) {
      errors.push('Template content is required');
    }
    
    if (template.title.length > 100) {
      errors.push('Template name must be 100 characters or less');
    }
    
    if (template.content.length > 4096) {
      errors.push('Template content must be 4096 characters or less');
    }
    
    // Check for valid placeholder format
    const placeholderRegex = /\{\{[^}]+\}\}/g;
    const placeholders = template.content.match(placeholderRegex) || [];
    const invalidPlaceholders = placeholders.filter(p => 
      !p.match(/^\{\{[a-zA-Z_][a-zA-Z0-9_]*\}\}$/)
    );
    
    if (invalidPlaceholders.length > 0) {
      errors.push(`Invalid placeholders: ${invalidPlaceholders.join(', ')}`);
    }
    
    return errors;
  };

  // Load templates from the database
  const loadTemplates = async () => {
    if (!user) {
      console.log('No user found, skipping template load');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Loading templates for user:', user.id);
      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .eq("user_id", user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading templates:', error);
        throw error;
      }

      console.log('Templates loaded:', data?.length);
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
        description: "Failed to load templates. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new template
  const createNewTemplate = () => {
    setCurrentTemplate({ id: '', title: '', content: '' });
    setValidationErrors([]);
  };

  // Select a template
  const selectTemplate = (template: Template) => {
    setCurrentTemplate(template);
    setValidationErrors([]);
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  // Save the current template
  const saveTemplate = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save templates",
        variant: "destructive"
      });
      return;
    }

    // Validate template
    const errors = validateTemplate(currentTemplate);
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      let result;
      
      if (currentTemplate.id) {
        console.log('Updating template:', currentTemplate.id);
        // Update existing template
        result = await supabase
          .from("message_templates")
          .update({
            title: currentTemplate.title.trim(),
            content: currentTemplate.content.trim(),
            updated_at: new Date().toISOString()
          })
          .eq("id", currentTemplate.id)
          .select();
      } else {
        console.log('Creating new template for user:', user.id);
        // Create new template
        result = await supabase
          .from("message_templates")
          .insert({
            user_id: user.id,
            title: currentTemplate.title.trim(),
            content: currentTemplate.content.trim(),
          })
          .select();
      }

      if (result.error) {
        console.error('Error saving template:', result.error);
        throw result.error;
      }

      toast({
        title: "Success",
        description: currentTemplate.id ? "Template updated successfully" : "Template created successfully",
      });

      // Refresh templates
      await loadTemplates();
      
      // If this was a new template, select it
      if (!currentTemplate.id && result.data && result.data.length > 0) {
        const newTemplate = result.data[0];
        setCurrentTemplate(newTemplate);
        if (onTemplateSelect) {
          onTemplateSelect(newTemplate);
        }
      }
    } catch (err) {
      console.error("Error saving template:", err);
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a template
  const deleteTemplate = async () => {
    if (!user || !currentTemplate.id) return;

    if (!confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      return;
    }

    setIsSaving(true);
    try {
      console.log('Deleting template:', currentTemplate.id);
      const { error } = await supabase
        .from("message_templates")
        .delete()
        .eq("id", currentTemplate.id)
        .eq("user_id", user.id); // Additional security check

      if (error) {
        console.error('Error deleting template:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      // Clear current template and refresh list
      createNewTemplate();
      await loadTemplates();
    } catch (err) {
      console.error("Error deleting template:", err);
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function for template placeholders
  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = 
        currentTemplate.content.substring(0, start) + 
        placeholder + 
        currentTemplate.content.substring(end);
      
      setCurrentTemplate({
        ...currentTemplate,
        content: newContent
      });
      
      // Reset cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
        textarea.focus();
      }, 0);
    } else {
      setCurrentTemplate({
        ...currentTemplate,
        content: currentTemplate.content + placeholder
      });
    }
  };

  // Show loading state if not authenticated
  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You need to be logged in to manage templates.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Template List */}
        <div className="w-full lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                Templates
                <Button variant="ghost" size="sm" onClick={createNewTemplate}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No templates yet</p>
                  <p className="text-xs mt-1">Create your first template to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant={currentTemplate.id === template.id ? "default" : "outline"}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => selectTemplate(template)}
                    >
                      <div className="truncate">
                        <div className="font-medium truncate">{template.title}</div>
                        <div className="text-xs text-muted-foreground truncate mt-1">
                          {template.content.substring(0, 50)}...
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Template Editor */}
        <div className="w-full lg:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {currentTemplate.id ? 'Edit Template' : 'New Template'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Template Name */}
              <div className="space-y-2">
                <Label htmlFor="template-title">Template Name</Label>
                <Input
                  id="template-title"
                  value={currentTemplate.title}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, title: e.target.value})}
                  placeholder="Enter template name"
                  maxLength={100}
                />
              </div>

              {/* Placeholder Buttons */}
              <div className="space-y-2">
                <Label>Insert Placeholders</Label>
                <div className="flex flex-wrap gap-2">
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
                    Event Title
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
              </div>

              {/* Template Content */}
              <div className="space-y-2">
                <Label htmlFor="template-content">Message Content</Label>
                <Textarea
                  id="template-content"
                  value={currentTemplate.content}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, content: e.target.value})}
                  placeholder="Enter message content with placeholders like {{name}}"
                  rows={8}
                  maxLength={4096}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {currentTemplate.content.length}/4096 characters
                </div>
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
                disabled={!currentTemplate.title.trim() || !currentTemplate.content.trim() || isSaving}
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
