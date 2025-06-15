import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FeatureSection from "@/components/FeatureSection";
import PageLayout from "@/components/layouts/PageLayout";
import { Link } from "react-router-dom";

const Features = () => {
  const featureCategories = [
    {
      title: "Create",
      description: "All you need to create and customize stunning events, plus custom branding.",
      features: [
        { title: "Event Registration", description: "Beautiful, branded, mobile-friendly forms for any event type." },
        { title: "Online RSVP", description: "Collect responses easily through our intuitive platform." },
        { title: "Flexible Ticketing", description: "Set up ticket sales with pricing tiers and guest limits." },
        { title: "Virtual Event Support", description: "Host online events with integrated green/yellow styled video calls." },
        { title: "Event Website Builder", description: "Create custom event websites with our drag-and-drop builder." },
        { title: "Design & Customization", description: "Every detail reflects your unique identity and colors." },
        { title: "Secondary Events", description: "Add rehearsal dinners, after-parties, and more with a click." },
        { title: "Custom Questions", description: "Collect dietary needs, t-shirt sizes, and more from guests." },
        { title: "Meal & Menu Choices", description: "Let guests select preferences, allergies, or meal types." }
      ]
    },
    {
      title: "Invite",
      description: "Send, manage, and track invitations with our integrated communication tools.",
      features: [
        { title: "Guest List Management", description: "Organize contacts, track RSVPs, and see real-time status." },
        { title: "Online Invitations", description: "Send digital invites in a fresh green/yellow style." },
        { title: "QR Codes", description: "Generate QR codes for check-in with zero extra work." },
        { title: "Form Embeds", description: "Add RSVP forms anywhere—your website, emails, or social." },
        { title: "Contact Tagging", description: "Tag and group guests for perfect personalization." }
      ]
    },
    {
      title: "Manage",
      description: "The best dashboard to keep everything running like clockwork.",
      features: [
        { title: "Donations & Gifts", description: "Seamlessly accept donations, sell merch, and manage gifts." },
        { title: "Check-In", description: "Streamline arrivals with instant green or yellow touch-free check-in." },
        { title: "Dynamic Seating Charts", description: "Drag and drop tables; see it all in green/yellow accents." },
        { title: "Live Dashboards", description: "Real-time analytics, guest lists, and revenue all in one view." },
        { title: "Automated Reminders", description: "Schedule reminders, updates, or thank-yous with ease." },
        { title: "Scheduling", description: "Let attendees book time slots or reserve special activities." },
        { title: "Data Imports/Exports", description: "Upload spreadsheets or export everything as needed." },
        { title: "Zapier Integration", description: "Connect to thousands of apps for total automation." }
      ]
    }
  ];

  return (
    <PageLayout>
      <div className="container mx-auto py-16 px-4 sm:px-6 md:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-yellow-400 bg-clip-text text-transparent mb-6">
            The Only Event Platform in Green & Yellow
          </h1>
          <p className="text-xl text-green-700 max-w-3xl mx-auto">
            Everything you need to create, invite, and manage awesome events—styled and branded in refreshing green and yellow.
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
          <h2 className="text-3xl font-bold mb-6 text-green-700">Ready to host in fresh colors?</h2>
          <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-yellow-500 text-white px-8 py-6 text-lg shadow-lg hover:from-green-700 hover:to-yellow-400 transition">
            <Link to="/signup">Get Started for Free</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Features;
