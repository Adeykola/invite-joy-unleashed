
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import HeroBanner from "@/components/home/HeroBanner";
import FeaturesSection from "@/components/home/FeaturesSection";
import HowItWorks from "@/components/home/HowItWorks";
import SocialProof from "@/components/home/SocialProof";
import CTASection from "@/components/home/CTASection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, CheckCircle, Clock } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  // Quick features for highlight section
  const quickFeatures = [
    {
      icon: <Calendar className="h-8 w-8 text-brand-primary" />,
      title: "Event Management",
      description: "Create and manage all your events in one place"
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-brand-primary" />,
      title: "RSVP Tracking",
      description: "Real-time responses with detailed analytics"
    },
    {
      icon: <Clock className="h-8 w-8 text-brand-primary" />,
      title: "Guest Communication",
      description: "Send updates and reminders automatically"
    }
  ];
  
  return (
    <PageLayout>
      {/* Hero Banner */}
      <HeroBanner />
      
      {/* Quick Feature Highlights */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {quickFeatures.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center p-4">
                <div className="mb-4 p-3 bg-brand-light rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-brand-primary">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Main Sections */}
      <FeaturesSection />
      <HowItWorks />
      <SocialProof />
      
      {/* Event Types Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title">Perfect for Every Occasion</h2>
            <p className="section-subtitle">
              No matter what type of event you're planning, we have the tools you need
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Weddings', 'Corporate Events', 'Birthdays', 
              'Fundraisers', 'Social Gatherings', 'Virtual Events'
            ].map((eventType, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-6 text-center shadow-md border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2 text-brand-primary">{eventType}</h3>
                <Button asChild variant="outline" className="mt-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white">
                  <Link to="/features">Learn More</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <CTASection />
    </PageLayout>
  );
};

export default Index;
