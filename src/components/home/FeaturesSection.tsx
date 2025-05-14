
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Mail, CheckCircle, Settings, Users, Clock, Globe } from "lucide-react";

const featuresData = [
  {
    title: "Event Registration",
    description: "Create beautiful registration forms for any type of event",
    icon: <Calendar className="h-10 w-10 text-brand-primary" />
  },
  {
    title: "Guest Management",
    description: "Track RSVPs, dietary preferences, and other important guest details",
    icon: <Users className="h-10 w-10 text-brand-primary" />
  },
  {
    title: "Customizable Invitations",
    description: "Design stunning invitations that match your event theme",
    icon: <Mail className="h-10 w-10 text-brand-primary" />
  },
  {
    title: "RSVP Tracking",
    description: "Real-time updates and automated response collection",
    icon: <CheckCircle className="h-10 w-10 text-brand-primary" />
  },
  {
    title: "Event Website Builder",
    description: "Create a dedicated website for your event with all details",
    icon: <Globe className="h-10 w-10 text-brand-primary" />
  },
  {
    title: "Automatic Reminders",
    description: "Schedule reminders to keep your guests informed",
    icon: <Clock className="h-10 w-10 text-brand-primary" />
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-brand-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-title">Everything You Need for Successful Events</h2>
          <p className="section-subtitle">
            Our comprehensive suite of tools helps you create, invite, and manage events with ease
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <Card key={index} className="feature-card border-none">
              <CardHeader className="pb-2">
                <div className="mb-3">{feature.icon}</div>
                <CardTitle className="text-2xl font-bold text-brand-primary">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
