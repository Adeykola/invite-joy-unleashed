
import { Card, CardContent } from "@/components/ui/card";

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  primaryColor: string;
  accentColor: string;
  bannerUrl?: string;
}

export const eventTemplates: EventTemplate[] = [
  {
    id: "wedding",
    name: "Wedding",
    description: "Elegant design for wedding ceremonies and receptions",
    thumbnail: "/templates/wedding-thumb.jpg",
    primaryColor: "#9b87f5",
    accentColor: "#f5e6ff",
    bannerUrl: "/templates/wedding-banner.jpg",
  },
  {
    id: "conference",
    name: "Conference",
    description: "Professional layout for business meetings and conferences",
    thumbnail: "/templates/conference-thumb.jpg",
    primaryColor: "#0ea5e9",
    accentColor: "#e0f2fe",
    bannerUrl: "/templates/conference-banner.jpg",
  },
  {
    id: "party",
    name: "Party",
    description: "Fun and festive design for celebrations and parties",
    thumbnail: "/templates/party-thumb.jpg",
    primaryColor: "#f97316",
    accentColor: "#ffedd5",
    bannerUrl: "/templates/party-banner.jpg",
  },
  {
    id: "workshop",
    name: "Workshop",
    description: "Focused design for educational workshops and seminars",
    thumbnail: "/templates/workshop-thumb.jpg",
    primaryColor: "#10b981",
    accentColor: "#d1fae5",
    bannerUrl: "/templates/workshop-banner.jpg",
  },
  {
    id: "custom",
    name: "Custom",
    description: "Create your own custom branded event design",
    thumbnail: "/templates/custom-thumb.jpg",
    primaryColor: "#8b5cf6",
    accentColor: "#ede9fe",
  },
];

export function EventTemplateSelector({
  selectedTemplate,
  onSelectTemplate,
}: {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {eventTemplates.map((template) => (
        <Card
          key={template.id}
          className={`cursor-pointer hover:shadow-md transition-shadow ${
            selectedTemplate === template.id
              ? "ring-2 ring-primary ring-offset-2"
              : ""
          }`}
          onClick={() => onSelectTemplate(template.id)}
        >
          <CardContent className="p-4">
            <div className="aspect-video bg-muted rounded-md overflow-hidden mb-3">
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback for missing images
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
            <h3 className="font-medium">{template.name}</h3>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
