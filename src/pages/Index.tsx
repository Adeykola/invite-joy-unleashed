
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layouts/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Calendar, Users, Shield, Zap, BarChart, Mail, Smartphone, Star, CheckCircle, Clock, Globe, Lock, Headphones, Mobile, Settings } from "lucide-react";

const Index = () => {
  const { user, profile } = useAuth();

  const getDashboardLink = () => {
    if (!profile) return "/user-dashboard";
    if (profile.role === "admin") return "/admin-dashboard";
    if (profile.role === "host") return "/host-dashboard";
    return "/user-dashboard";
  };

  const automationFeatures = [
    {
      icon: Mail,
      title: "Smart Invitations",
      description: "Automatically send personalized invites and track responses in real-time"
    },
    {
      icon: Users,
      title: "Guest Management",
      description: "Organize attendees, manage RSVPs, and handle check-ins seamlessly"
    },
    {
      icon: BarChart,
      title: "Live Analytics",
      description: "Get instant insights on attendance, engagement, and event performance"
    }
  ];

  const features = [
    { icon: Mail, title: "Email Invites", description: "Beautiful branded invitations" },
    { icon: Users, title: "Guest Management", description: "Organize and track attendees" },
    { icon: BarChart, title: "Analytics", description: "Real-time event insights" },
    { icon: Smartphone, title: "Mobile App", description: "Manage events on the go" },
    { icon: CheckCircle, title: "Check-in System", description: "QR code guest check-in" },
    { icon: Calendar, title: "Event Scheduling", description: "Smart calendar integration" },
    { icon: Globe, title: "Multi-language", description: "Support for 20+ languages" },
    { icon: Shield, title: "Secure & Private", description: "Enterprise-grade security" },
    { icon: Settings, title: "Customization", description: "Brand your event pages" }
  ];

  const eventImages = [
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop"
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-light-purple to-white pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-6xl md:text-7xl font-bold text-dark-gray mb-6 leading-tight">
                Create any event
                <span className="block">in minutes</span>
              </h1>
              <p className="text-xl text-dark-gray/70 mb-8 max-w-2xl mx-auto">
                The all-in-one platform for event management that makes organizing 
                celebrations effortless and memorable.
              </p>
              <Link to={user ? getDashboardLink() : "/signup"}>
                <Button size="lg" className="bg-purple-primary hover:bg-purple-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg">
                  {user ? "Go to Dashboard" : "Get Started Free"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            
            {/* Event Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {eventImages.map((image, index) => (
                <div key={index} className="aspect-[3/2] rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={image} 
                    alt={`Event ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Automate Your Events Section */}
      <section className="py-20 bg-light-purple/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-dark-gray mb-6">
                Automate your events
              </h2>
              <p className="text-xl text-dark-gray/70 max-w-2xl mx-auto">
                Let our intelligent platform handle the heavy lifting while you focus on creating amazing experiences.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {automationFeatures.map((feature, index) => (
                <Card key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border-0">
                  <CardContent className="p-0">
                    <div className="w-16 h-16 bg-purple-primary/10 rounded-2xl flex items-center justify-center mb-6">
                      <feature.icon className="w-8 h-8 text-purple-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold text-dark-gray mb-4">{feature.title}</h3>
                    <p className="text-dark-gray/70 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guest Engagement Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-5xl font-bold text-dark-gray mb-6">
                  Keep your guests engaged
                </h2>
                <p className="text-xl text-dark-gray/70 mb-8 leading-relaxed">
                  Interactive RSVP forms, real-time updates, and personalized communications 
                  that make your guests feel valued and excited about your event.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-purple-primary mr-3" />
                    <span className="text-dark-gray">Interactive RSVP experience</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-purple-primary mr-3" />
                    <span className="text-dark-gray">Real-time event updates</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-purple-primary mr-3" />
                    <span className="text-dark-gray">Personalized communications</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-light-purple to-purple-primary/10 p-8 rounded-3xl">
                <img 
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&h=400&fit=crop" 
                  alt="Guest engagement interface"
                  className="w-full rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Creation Section */}
      <section className="py-20 bg-light-purple/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="bg-gradient-to-br from-white to-light-purple p-8 rounded-3xl order-2 md:order-1">
                <img 
                  src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=400&fit=crop" 
                  alt="Event creation dashboard"
                  className="w-full rounded-2xl shadow-lg"
                />
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-5xl font-bold text-dark-gray mb-6">
                  Create stunning events effortlessly
                </h2>
                <p className="text-xl text-dark-gray/70 mb-8 leading-relaxed">
                  Our intuitive event builder lets you create professional event pages 
                  in minutes, not hours. Choose from beautiful templates or start from scratch.
                </p>
                <Button className="bg-purple-primary hover:bg-purple-600 text-white px-6 py-3 rounded-full">
                  Try Event Builder
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-dark-gray mb-6">
                Everything you need in one place
              </h2>
              <p className="text-xl text-dark-gray/70 max-w-2xl mx-auto">
                Powerful features designed to make event management simple and effective.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 rounded-2xl border-0 bg-light-purple/20 hover:bg-light-purple/40 transition-colors">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-purple-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-purple-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-dark-gray mb-2">{feature.title}</h3>
                    <p className="text-dark-gray/70 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-20 bg-dark-gray text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-purple-primary/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Shield className="w-10 h-10 text-purple-primary" />
            </div>
            <h2 className="text-4xl font-bold mb-6">Privacy is our core</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Your data is encrypted, secure, and never shared. We comply with GDPR, 
              CCPA, and other privacy regulations to keep your information safe.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-gray-400">
              <span className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                GDPR Compliant
              </span>
              <span className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                256-bit Encryption
              </span>
              <span className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                SOC 2 Certified
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-light-purple/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-dark-gray mb-4">
                Loved by event organizers worldwide
              </h2>
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-dark-gray/70">Rated 4.9/5 by over 10,000 customers</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 rounded-2xl border-0 bg-white shadow-sm">
                <CardContent className="p-0">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-dark-gray mb-6 text-lg leading-relaxed">
                    "InviteJoy transformed how we manage our corporate events. The automation 
                    features saved us countless hours, and our attendees love the seamless experience."
                  </p>
                  <div className="flex items-center">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108755-2616b612b780?w=64&h=64&fit=crop&crop=face" 
                      alt="Sarah Chen"
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-dark-gray">Sarah Chen</div>
                      <div className="text-sm text-dark-gray/70">Event Manager, TechCorp</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="p-8 rounded-2xl border-0 bg-white shadow-sm">
                <CardContent className="p-0">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-dark-gray mb-6 text-lg leading-relaxed">
                    "The analytics and insights help us understand our audience better. 
                    Our RSVP rates increased by 40% since switching to InviteJoy."
                  </p>
                  <div className="flex items-center">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face" 
                      alt="Michael Rodriguez"
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-dark-gray">Michael Rodriguez</div>
                      <div className="text-sm text-dark-gray/70">Marketing Director, Growth Co</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-5xl font-bold text-dark-gray mb-6">
                  Book event vendors and RSVP on the go
                </h2>
                <p className="text-xl text-dark-gray/70 mb-8 leading-relaxed">
                  Our mobile app lets your guests manage everything from their phone. 
                  RSVP, view event details, connect with other attendees, and more.
                </p>
                <div className="flex space-x-4">
                  <Button className="bg-dark-gray hover:bg-dark-gray/90 text-white px-6 py-3 rounded-xl">
                    <Mobile className="w-5 h-5 mr-2" />
                    Download App
                  </Button>
                </div>
              </div>
              <div className="bg-gradient-to-br from-light-purple to-purple-primary/10 p-8 rounded-3xl">
                <img 
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=500&fit=crop" 
                  alt="Mobile app interface"
                  className="w-full max-w-sm mx-auto rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-primary to-purple-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to create your next amazing event?</h2>
          <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
            Join thousands of event organizers who trust InviteJoy to create memorable experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-purple-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg">
                <ArrowRight className="w-5 h-5 mr-2" />
                Start Your Free Trial
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-purple-primary px-8 py-4 text-lg font-semibold rounded-full">
                Learn More
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-purple-200 text-sm">
            No setup fees • Cancel anytime • 24/7 support
          </p>
        </div>
      </section>
    </PageLayout>
  );
};

export default Index;
