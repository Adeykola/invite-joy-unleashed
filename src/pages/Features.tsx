
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FeatureSection from "@/components/FeatureSection";
import PageLayout from "@/components/layouts/PageLayout";
import { Link } from "react-router-dom";

const Features = () => {
  const featureCategories = [
    {
      title: "Create",
      description: "Everything you need to build and customize your events",
      features: [
        { title: "Event Registration", description: "Create beautiful registration forms for any event type" },
        { title: "Online RSVP", description: "Collect responses easily through our intuitive platform" },
        { title: "Sell Tickets", description: "Set up ticket sales with various pricing tiers" },
        { title: "Virtual Events", description: "Host online events with integrated video conferencing" },
        { title: "Event Website Builder", description: "Create custom event websites with our drag-and-drop builder" },
        { title: "Design & Customization", description: "Customize every aspect of your event branding" },
        { title: "Secondary Events", description: "Add additional gatherings like rehearsal dinners or after-parties" },
        { title: "Custom Questions & Data", description: "Collect exactly the information you need from guests" },
        { title: "Meal & Menu Options", description: "Let guests select their meal preferences" }
      ]
    },
    {
      title: "Invite",
      description: "Tools to reach your audience and track responses",
      features: [
        { title: "Guest List Management", description: "Organize contacts and track RSVPs in real-time" },
        { title: "Online Invitations", description: "Send beautiful digital invitations to your guests" },
        { title: "QR Codes", description: "Generate unique QR codes for check-ins and promotions" },
        { title: "Embed RSVP Form", description: "Add RSVP forms to any website with our embed code" },
        { title: "Contact Tagging", description: "Categorize contacts with custom tags for better organization" }
      ]
    },
    {
      title: "Manage",
      description: "Powerful tools to run your events smoothly",
      features: [
        { title: "Donations & Gifts", description: "Accept donations and manage gift registries" },
        { title: "Check-In", description: "Streamline the arrival process with our check-in tools" },
        { title: "Contactless Check-In", description: "Enable safe, touch-free check-in for your events" },
        { title: "Seating Charts", description: "Create and manage seating arrangements visually" },
        { title: "Event Dashboards", description: "Get real-time analytics on all aspects of your events" },
        { title: "Email Reminders & Blasts", description: "Automate communications with scheduled emails" },
        { title: "Appointment Scheduling", description: "Allow attendees to book specific time slots" },
        { title: "Data Imports & Exports", description: "Easily move data in and out of the platform" },
        { title: "Zapier Integration", description: "Connect with thousands of other apps via Zapier" }
      ]
    }
  ];

  return (
    <PageLayout>
      <div className="container mx-auto py-16 px-4 sm:px-6 md:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Powerful Features for Every Event
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of tools helps you create, invite, and manage successful events of any size or type.
          </p>
        </div>

        {featureCategories.map((category, index) => (
          <FeatureSection 
            key={index}
            title={category.title}
            description={category.description}
            features={category.features}
            isAlternate={index % 2 !== 0}
          />
        ))}

        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold mb-6">Ready to elevate your events?</h2>
          <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-6 text-lg">
            <Link to="/signup">Get Started for Free</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Features;
