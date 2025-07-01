
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, CheckCircle, Star, Calendar, Users, Shield, Zap, BarChart, Mail, Smartphone } from "lucide-react";

const Index = () => {
  const { user, profile } = useAuth();

  const getDashboardLink = () => {
    if (!profile) return "/user-dashboard";
    if (profile.role === "admin") return "/admin-dashboard";
    if (profile.role === "host") return "/host-dashboard";
    return "/user-dashboard";
  };

  const features = [
    {
      icon: Calendar,
      title: "Beautiful Event Pages",
      description: "Create stunning, mobile-responsive event pages that reflect your brand"
    },
    {
      icon: Mail,
      title: "Smart Invitations",
      description: "Send personalized invites via email, SMS, or social media with tracking"
    },
    {
      icon: Users,
      title: "Guest Management",
      description: "Organize attendees, track RSVPs, and manage guest lists effortlessly"
    },
    {
      icon: CheckCircle,
      title: "Easy Check-in",
      description: "Streamlined event check-in with QR codes and real-time updates"
    },
    {
      icon: BarChart,
      title: "Event Analytics",
      description: "Get insights into attendance, engagement, and event performance"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security with GDPR compliance and data protection"
    }
  ];

  const testimonials = [
    {
      quote: "InviteJoy transformed how we manage corporate events. The interface is intuitive and our attendees love the seamless experience.",
      name: "Sarah Chen",
      role: "Event Manager",
      company: "TechCorp",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b2d64e5c?w=64&h=64&fit=crop&crop=face"
    },
    {
      quote: "We've saved hours on event planning and our RSVP rates have increased by 40% since switching to InviteJoy.",
      name: "Michael Rodriguez",
      role: "Marketing Director", 
      company: "Growth Co",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
    },
    {
      quote: "The analytics and insights help us understand our audience better and improve our events continuously.",
      name: "Emily Johnson",
      role: "Community Manager",
      company: "Startup Hub",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Events Created" },
    { number: "500,000+", label: "Invitations Sent" },
    { number: "98%", label: "Customer Satisfaction" },
    { number: "50+", label: "Countries Served" }
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 pb-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Create Beautiful Events
              <span className="text-blue-600 block">That People Love</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              The all-in-one platform for event management, invitations, and guest experiences. 
              From corporate events to celebrations, make every moment memorable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to={user ? getDashboardLink() : "/signup"}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  {user ? "Go to Dashboard" : "Start Free Trial"}
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" size="lg" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-lg">
                  Watch Demo
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              ✨ Free 14-day trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to create amazing events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed to streamline your event planning and delight your guests
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How InviteJoy Works
            </h2>
            <p className="text-xl text-gray-600">
              Get your event up and running in minutes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Your Event</h3>
              <p className="text-gray-600">Set up your event details, customize your page, and configure your settings in minutes.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Send Invitations</h3>
              <p className="text-gray-600">Invite guests via email, SMS, or social media with beautiful, branded invitations.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Manage & Track</h3>
              <p className="text-gray-600">Track RSVPs, manage attendees, and get real-time insights about your event.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by event organizers everywhere
            </h2>
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600">Rated 4.9/5 by over 1,000 customers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to create your next amazing event?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of event organizers who trust InviteJoy to create memorable experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg">
                <ArrowRight className="w-5 h-5 mr-2" />
                Start Your Free Trial
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-lg">
                Learn More
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-blue-200 text-sm">
            No setup fees • Cancel anytime • 24/7 support
          </p>
        </div>
      </section>
    </PageLayout>
  );
};

export default Index;
