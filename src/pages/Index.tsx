import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import FeatureSection from "@/components/FeatureSection";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Calendar, Users, MessageSquare, Smartphone, Star, CheckCircle, ArrowRight, Zap } from "lucide-react";

const Index = () => {
  const { user, profile } = useAuth();

  // Determine where to direct users based on their role
  const getDashboardLink = () => {
    if (!profile) return "/user-dashboard";
    
    switch (profile.role) {
      case "admin": 
        return "/admin-dashboard";
      case "host": 
        return "/host-dashboard";
      default: 
        return "/user-dashboard";
    }
  };

  // Features for the feature section
  const featureData = {
    title: "Powerful Event Management",
    description: "Everything you need to create unforgettable experiences",
    features: [
      {
        title: "Smart RSVP Tracking",
        description: "Real-time guest responses with automated follow-ups and analytics"
      },
      {
        title: "WhatsApp Integration",
        description: "Send invitations and updates directly through WhatsApp messaging"
      },
      {
        title: "Beautiful Event Pages",
        description: "Customizable event pages that reflect your unique style and brand"
      }
    ]
  };
  
  return (
    <PageLayout>
      {/* Hero Section with Gradient */}
      <header className="bg-gradient-to-br from-green-600 via-green-500 to-yellow-400 text-white py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Modern Event
              <span className="block text-yellow-300">Management</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-50 max-w-2xl mx-auto leading-relaxed">
              Create, manage, and host events with ease. Provide a seamless experience for your guests with our all-in-one platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              {user ? (
                <Link to={getDashboardLink()}>
                  <Button size="lg" className="bg-yellow-400 text-green-900 hover:bg-yellow-300 text-lg px-8 py-4 font-semibold">
                    <Zap className="w-5 h-5 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button size="lg" className="bg-yellow-400 text-green-900 hover:bg-yellow-300 text-lg px-8 py-4 font-semibold">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Get Started Free
                  </Button>
                </Link>
              )}
              <Link to="/events">
                <Button size="lg" variant="outline" className="border-2 border-white text-green-300 bg-transparent hover:bg-transparent hover:text-white text-lg px-8 py-4 font-semibold">
                  Browse Events
                </Button>
              </Link>
            </div>
            
            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-300">10K+</div>
                <div className="text-green-100">Events Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-300">50K+</div>
                <div className="text-green-100">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-300">99%</div>
                <div className="text-green-100">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Features Grid Section */}
        <section className="py-24 bg-gradient-to-b from-green-50 to-yellow-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">
                Why Choose Our Platform?
              </h2>
              <p className="text-xl text-green-600 max-w-3xl mx-auto">
                Streamline your event planning with cutting-edge tools designed for modern organizers
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-3">Easy Event Creation</h3>
                <p className="text-green-600">Create stunning events in minutes with our intuitive event builder</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-100">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-3">Guest Management</h3>
                <p className="text-green-600">Track RSVPs, manage guest lists, and send automated reminders</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-3">WhatsApp Integration</h3>
                <p className="text-green-600">Send invites and updates directly through WhatsApp messaging</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-100">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-3">Real-time Communication</h3>
                <p className="text-green-600">Keep guests informed with instant notifications and updates</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">
                How It Works
              </h2>
              <p className="text-xl text-green-600 max-w-2xl mx-auto">
                Get started in three simple steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-4">Create Your Event</h3>
                <p className="text-green-600 text-lg">Set up your event details, customize the page, and add all the important information your guests need.</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-4">Invite Your Guests</h3>
                <p className="text-green-600 text-lg">Send beautiful invitations via email, WhatsApp, or share your custom event link directly.</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-4">Manage & Track</h3>
                <p className="text-green-600 text-lg">Monitor RSVPs in real-time, send updates, and ensure your event runs smoothly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-gradient-to-r from-green-600 to-yellow-400">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                What Our Users Say
              </h2>
              <p className="text-xl text-green-100 max-w-2xl mx-auto">
                Join thousands of satisfied event organizers
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-300 fill-current" />
                  ))}
                </div>
                <p className="text-white mb-6 text-lg">"This platform made organizing our company retreat so much easier. The WhatsApp integration was a game-changer!"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">SM</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">Sarah Martinez</div>
                    <div className="text-green-100">Event Coordinator</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-300 fill-current" />
                  ))}
                </div>
                <p className="text-white mb-6 text-lg">"The real-time RSVP tracking saved me hours of manual work. Highly recommend for any event planner!"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">DJ</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">David Johnson</div>
                    <div className="text-green-100">Wedding Planner</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-300 fill-current" />
                  ))}
                </div>
                <p className="text-white mb-6 text-lg">"Beautiful event pages and seamless guest management. Our events have never looked better!"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">ER</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">Emily Rodriguez</div>
                    <div className="text-green-100">Marketing Director</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <FeatureSection 
          title={featureData.title}
          description={featureData.description}
          features={featureData.features}
        />

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-green-800 via-green-700 to-green-600 py-20 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-[length:60px_60px] bg-[image:url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%223%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Event Planning?</h2>
              <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto leading-relaxed">
                Join thousands of event organizers who use our platform to create memorable experiences. Start your journey today!
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                {user ? (
                  <Link to={getDashboardLink()}>
                    <Button size="lg" className="bg-yellow-400 text-green-900 hover:bg-yellow-300 text-lg px-8 py-4 font-semibold">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/signup">
                    <Button size="lg" className="bg-yellow-400 text-green-900 hover:bg-yellow-300 text-lg px-8 py-4 font-semibold">
                      <ArrowRight className="w-5 h-5 mr-2" />
                      Start Free Today
                    </Button>
                  </Link>
                )}
                <Link to="/features">
                  <Button size="lg" variant="outline" className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-green-900 text-lg px-8 py-4 font-semibold">
                    Learn More
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-center text-green-200">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>No credit card required • Free forever plan available</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-green-900 border-t border-green-800 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Link to="/" className="text-2xl font-bold text-yellow-400 mb-4 block">RSVPlatform</Link>
              <p className="text-green-200 mb-4 max-w-md">
                The modern way to create, manage, and host events. Simplifying event management for everyone.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <span className="text-yellow-400 font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <span className="text-yellow-400 font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <span className="text-yellow-400 font-bold">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-yellow-400 font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <Link to="/features" className="text-green-200 hover:text-yellow-400 transition-colors block">Features</Link>
                <Link to="/events" className="text-green-200 hover:text-yellow-400 transition-colors block">Browse Events</Link>
                <Link to="/signup" className="text-green-200 hover:text-yellow-400 transition-colors block">Get Started</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-yellow-400 font-semibold mb-4">Account</h4>
              <div className="space-y-2">
                <Link to="/login" className="text-green-200 hover:text-yellow-400 transition-colors block">Login</Link>
                <Link to="/signup" className="text-green-200 hover:text-yellow-400 transition-colors block">Sign Up</Link>
                <Link to="/reset-password" className="text-green-200 hover:text-yellow-400 transition-colors block">Reset Password</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-green-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-green-300">&copy; {new Date().getFullYear()} RSVPlatform. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-green-300 hover:text-yellow-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-green-300 hover:text-yellow-400 transition-colors">Terms of Service</a>
              <a href="#" className="text-green-300 hover:text-yellow-400 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </PageLayout>
  );
};

export default Index;
