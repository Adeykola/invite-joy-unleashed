
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FeatureSection from "@/components/FeatureSection";
import PageLayout from "@/components/PageLayout";
import { Link } from "react-router-dom";
import { Calendar, Users, Mail, BarChart, Shield, Zap, Smartphone, Globe, CreditCard, QrCode, Bell, Settings } from "lucide-react";

const Features = () => {
  const featureCategories = [
    {
      title: "Create Beautiful Events",
      description: "Design stunning event pages that capture your brand and excite your guests.",
      icon: Calendar,
      features: [
        { title: "Custom Event Pages", description: "Beautiful, mobile-responsive pages with your branding", icon: Globe },
        { title: "Flexible Registration", description: "Collect exactly the information you need from guests", icon: Settings },
        { title: "Multiple Event Types", description: "Conferences, weddings, parties, and everything in between", icon: Calendar },
        { title: "Rich Media Support", description: "Add photos, videos, and documents to your event pages", icon: Zap }
      ]
    },
    {
      title: "Invite & Communicate",
      description: "Reach your guests where they are with multi-channel invitations.",
      icon: Mail,
      features: [
        { title: "Email Invitations", description: "Beautiful, branded email invites with tracking", icon: Mail },
        { title: "SMS Notifications", description: "Send reminders and updates via text message", icon: Smartphone },
        { title: "Social Sharing", description: "Let guests share your event on social media", icon: Globe },
        { title: "Automated Reminders", description: "Set up automatic follow-ups and reminders", icon: Bell }
      ]
    },
    {
      title: "Manage Like a Pro",
      description: "Powerful tools to handle everything from RSVPs to check-in.",
      icon: Users,
      features: [
        { title: "Guest List Management", description: "Organize, tag, and track all your attendees", icon: Users },
        { title: "QR Code Check-in", description: "Fast, contactless check-in for smooth entry", icon: QrCode },
        { title: "Payment Processing", description: "Collect ticket sales and donations securely", icon: CreditCard },
        { title: "Real-time Analytics", description: "Track RSVPs, attendance, and engagement", icon: BarChart }
      ]
    }
  ];

  const additionalFeatures = [
    {
      title: "Enterprise Security",
      description: "Bank-level security with GDPR compliance and data protection.",
      icon: Shield
    },
    {
      title: "Team Collaboration",
      description: "Work together with your team to plan perfect events.",
      icon: Users
    },
    {
      title: "API Integration",
      description: "Connect with your favorite tools via our robust API.",
      icon: Settings
    },
    {
      title: "24/7 Support",
      description: "Get help when you need it with our dedicated support team.",
      icon: Bell
    }
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Everything you need for
            <span className="text-blue-600 block">amazing events</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            From small gatherings to large conferences, InviteJoy has all the tools
            you need to create memorable experiences.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Main Feature Categories */}
      {featureCategories.map((category, index) => (
        <section key={index} className={`py-20 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <category.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{category.title}</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{category.description}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {category.features.map((feature, featureIndex) => (
                  <Card key={featureIndex} className="border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Additional Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Plus so much more
            </h2>
            <p className="text-xl text-gray-600">
              Advanced features to take your events to the next level
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to create your first event?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of event organizers who trust InviteJoy to create amazing experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Features;
