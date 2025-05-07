import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import FeatureSection from "@/components/FeatureSection";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";

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
    title: "Key Features",
    description: "Everything you need to create memorable events",
    features: [
      {
        title: "Easy RSVP Management",
        description: "Track responses in real-time with our intuitive dashboard"
      },
      {
        title: "Customizable Event Pages",
        description: "Create beautiful event pages that match your vision and style"
      },
      {
        title: "Guest Communications",
        description: "Send updates, reminders, and messages to your attendees"
      }
    ]
  };
  
  return (
    <PageLayout>
      <header className="bg-gradient-to-r from-purple-600 to-blue-500 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Modern Event Management</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Create, manage, and host events with ease. Provide a seamless experience for your guests.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Get Started
              </Button>
            </Link>
            <Link to="/events">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-24 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Event Planning Made Simple
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Create, manage, and track RSVPs for all your events in one place.
            </p>
            <div className="flex justify-center space-x-4">
              {user ? (
                <Link to={getDashboardLink()}>
                  <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                    Get Started
                  </Button>
                </Link>
              )}
              <Link to="/features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
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
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 text-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Ready to simplify your event planning?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of event organizers who use our platform to create memorable experiences.
            </p>
            {user ? (
              <Link to={getDashboardLink()}>
                <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100">
                  Sign Up Now
                </Button>
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link to="/" className="text-xl font-bold text-indigo-600">RSVPlatform</Link>
              <p className="text-gray-500 mt-1">Simplifying event management</p>
            </div>
            <div className="flex space-x-6">
              <Link to="/features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</Link>
              <Link to="/login" className="text-gray-600 hover:text-indigo-600 transition-colors">Login</Link>
              <Link to="/signup" className="text-gray-600 hover:text-indigo-600 transition-colors">Sign Up</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} RSVPlatform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </PageLayout>
  );
};

export default Index;
