import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Users, MessageSquare, Smartphone, Star, CheckCircle, ArrowRight, Zap, PartyPopper } from "lucide-react";

const Index = () => {
  const { user, profile } = useAuth();

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

  return (
    <PageLayout>
      {/* Hero Section */}
      <header 
        className="relative bg-cover bg-center text-white py-20 md:py-32"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-poppins font-bold mb-6 leading-tight">
              Unleash the Joy in Every Invite
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed font-sans">
              Create, manage, and celebrate unforgettable events with a platform designed to bring people together.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
              {user ? (
                <Link to={getDashboardLink()}>
                  <Button size="lg" className="bg-yellow-400 text-green-900 hover:bg-yellow-300 text-lg px-8 py-4 font-semibold transform hover:scale-105 transition-transform">
                    <Zap className="w-5 h-5 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button size="lg" className="bg-yellow-400 text-green-900 hover:bg-yellow-300 text-lg px-8 py-4 font-semibold transform hover:scale-105 transition-transform">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Get Started Free
                  </Button>
                </Link>
              )}
            </div>
            <p className="text-sm text-gray-400">Create your first event in 60 seconds. No credit card required.</p>
          </div>
        </div>
      </header>

      <main>
        {/* Why Choose Us Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-800 mb-6">
                Why Choose InviteJoy?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
                We're more than just an RSVP tool. We're your partner in creating memorable experiences.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div>
                <PartyPopper className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-2xl font-poppins font-bold text-gray-800 mb-4">Effortless Planning</h3>
                <p className="text-gray-600 text-lg font-sans">From guest lists to reminders, we automate the tedious tasks so you can focus on the fun.</p>
              </div>
              <div>
                <Users className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-2xl font-poppins font-bold text-gray-800 mb-4">Engaging Experience</h3>
                <p className="text-gray-600 text-lg font-sans">Beautiful, interactive invitations and event pages that your guests will love.</p>
              </div>
              <div>
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-2xl font-poppins font-bold text-gray-800 mb-4">Seamless Management</h3>
                <p className="text-gray-600 text-lg font-sans">Track RSVPs, manage updates, and get real-time insights all in one place.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-800 mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-sans">
                Get started in three simple steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform">
                  <span className="text-2xl font-poppins font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-poppins font-bold text-gray-800 mb-4">Create Your Event</h3>
                <p className="text-gray-600 text-lg font-sans">Set up your event details, customize the page, and add all the important information your guests need.</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform">
                  <span className="text-2xl font-poppins font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-poppins font-bold text-gray-800 mb-4">Invite Your Guests</h3>
                <p className="text-gray-600 text-lg font-sans">Send beautiful invitations via email, WhatsApp, or share your custom event link directly.</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform">
                  <span className="text-2xl font-poppins font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-poppins font-bold text-gray-800 mb-4">Manage & Track</h3>
                <p className="text-gray-600 text-lg font-sans">Monitor RSVPs in real-time, send updates, and ensure your event runs smoothly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-800 mb-6">
                Loved by Hosts Everywhere
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-sans">
                Join thousands of satisfied event organizers who chose InviteJoy.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 text-lg font-sans">"Planning my birthday was so easy. InviteJoy saved me so much time and stress!"</p>
                <div className="flex items-center">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Albert" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="text-gray-800 font-poppins font-semibold">Albert, Lagos</div>
                    <div className="text-gray-500 font-sans">Birthday Party Host</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 text-lg font-sans">"The WhatsApp integration is a game-changer. Our guests loved the instant updates!"</p>
                <div className="flex items-center">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Sarah" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="text-gray-800 font-poppins font-semibold">Sarah, Abuja</div>
                    <div className="text-gray-500 font-sans">Wedding Planner</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 text-lg font-sans">"Our corporate events have never been more organized. The analytics are fantastic."</p>
                <div className="flex items-center">
                  <img src="https://randomuser.me/api/portraits/men/56.jpg" alt="David" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="text-gray-800 font-poppins font-semibold">David, Port Harcourt</div>
                    <div className="text-gray-500 font-sans">Corporate Event Manager</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="bg-gradient-to-r from-green-600 to-yellow-500 py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-poppins font-bold mb-6">Ready to Create Joyful Events?</h2>
              <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto leading-relaxed font-sans">
                Start planning your next memorable event with InviteJoy today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100 text-lg px-8 py-4 font-semibold transform hover:scale-105 transition-transform">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Start for Free
                  </Button>
                </Link>
              </div>
               <p className="text-sm text-green-200">Free forever plan available. No credit card required.</p>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
};

export default Index;
