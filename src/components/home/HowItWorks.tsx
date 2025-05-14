
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Create your event",
    description: "Choose from our templates or start from scratch. Add all your event details with our easy-to-use builder."
  },
  {
    number: "2",
    title: "Customize your invitations",
    description: "Design beautiful invitations with our drag-and-drop editor. Match your event's theme and branding."
  },
  {
    number: "3",
    title: "Invite your guests",
    description: "Send invitations via email, social media, or generate a shareable link for wider distribution."
  },
  {
    number: "4",
    title: "Track responses",
    description: "Monitor RSVPs in real-time. Collect guest information, meal preferences, and plus-one details automatically."
  }
];

const benefits = [
  "Save time with automated RSVP tracking",
  "Reduce stress with reminders and notifications",
  "Create professional-looking invitations in minutes",
  "Access detailed guest reports and analytics",
  "Manage everything from a single dashboard"
];

const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-title">How RSVPlatform Works</h2>
          <p className="section-subtitle">
            Our simple four-step process makes event planning effortless
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg p-6 shadow-md border border-gray-100 relative pt-12"
            >
              <div className="absolute -top-5 left-6 flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary text-white font-bold">
                {step.number}
              </div>
              <h3 className="text-xl font-bold mb-3 text-brand-primary">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-brand-primary">
              Why event planners choose RSVPlatform
            </h3>
            
            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-brand-accent mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
            
            <Button asChild className="bg-brand-primary hover:bg-brand-primary/90">
              <Link to="/signup">Start Planning Your Event</Link>
            </Button>
          </div>
          
          <div className="bg-brand-light rounded-lg p-8">
            <img 
              src="https://placehold.co/600x400/e3f9ed/1f4d3a?text=Dashboard+Preview" 
              alt="RSVPlatform Dashboard" 
              className="rounded-md shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
