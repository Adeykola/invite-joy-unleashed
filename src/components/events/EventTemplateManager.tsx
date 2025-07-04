
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
import { Template, Save, Star, Users, Calendar } from "lucide-react";

interface EventTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  event_data: any;
  is_public: boolean;
  usage_count: number;
  created_at: string;
}

export function EventTemplateManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateCategory, setTemplateCategory] = useState("general");
  const [selectedEventData, setSelectedEventData] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["event-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_templates")
        .select("*")
        .order("usage_count", { ascending: false });

      if (error) throw error;
      return data as EventTemplate[];
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: {
      name: string;
      description: string;
      category: string;
      event_data: any;
      is_public: boolean;
    }) => {
      const { data, error } = await supabase
        .from("event_templates")
        .insert(templateData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-templates"] });
      setIsCreateOpen(false);
      setTemplateName("");
      setTemplateDescription("");
      setTemplateCategory("general");
      toast({
        title: "Template Created",
        description: "Event template has been saved successfully.",
      });
    },
  });

  const handleCreateTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name.",
        variant: "destructive",
      });
      return;
    }

    createTemplateMutation.mutate({
      name: templateName,
      description: templateDescription,
      category: templateCategory,
      event_data: selectedEventData,
      is_public: false,
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: "bg-gray-100 text-gray-800",
      corporate: "bg-blue-100 text-blue-800",
      social: "bg-green-100 text-green-800",
      wedding: "bg-pink-100 text-pink-800",
      conference: "bg-purple-100 text-purple-800",
    };
    return colors[category] || colors.general;
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
          <Template className="h-5 w-5 mr-2" />
          Event Templates
        </h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Event Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe this template"
                />
              </div>
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select value={templateCategory} onValueChange={setTemplateCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate} disabled={createTemplateMutation.isPending}>
                  {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <Badge className={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>
              </div>
              {template.description && (
                <p className="text-sm text-muted-foreground">{template.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Used {template.usage_count} times
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(template.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-3 flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Use Template
                </Button>
                <Button variant="ghost" size="sm">
                  <Star className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates?.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Template className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Templates Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first event template to save time on future events.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Save className="h-4 w-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
