import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Zap, ArrowRight, ShieldCheck, Users, Calendar, CheckCircle, Star } from "lucide-react";

const Index = () => {
  const { user, profile } = useAuth();

  const getDashboardLink = () => {
    if (!profile) return "/user-dashboard";
    if (profile.role === "admin") return "/admin-dashboard";
    if (profile.role === "host") return "/host-dashboard";
    return "/user-dashboard";
  };

  return (
    <PageLayout>
      {/* Hero */}
      <header
        className="relative bg-cover bg-center text-white pt-24 pb-32"
        style={{ backgroundImage: "url('/images/rsvp-hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Create Any Event in Minutes
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Automate your event — from invite to check‑in. No ads, no data sharing.<br/>
            Get started free today.
          </p>
          <Link to={user ? getDashboardLink() : "/signup"}>
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-transform">
              {user ? <Zap className="w-5 h-5 mr-2" /> : <ArrowRight className="w-5 h-5 mr-2" />}
              {user ? "Go to Dashboard" : "Get Started Free"}
            </Button>
          </Link>
          <p className="mt-4 text-sm text-indigo-200">
            Free plan forever • No credit card required
          </p>
        </div>
      </header>

      <main className="space-y-20">
        {/* Features */}
        <section className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">All‑In‑One Event Manager</h2>
          <div className="grid sm:grid-cols-3 gap-12">
            <div>
              <ShieldCheck className="mx-auto h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Private & Secure</h3>
              <p>We never sell your data or show ads to guests :contentReference[oaicite:1]{index=1}</p>
            </div>
            <div>
              <Users className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Branded & Custom</h3>
              <p>Upload your colors, fonts, logos & templates :contentReference[oaicite:2]{index=2}</p>
            </div>
            <div>
              <Calendar className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Powerful Tools</h3>
              <p>Manage invites, check‑in, seating, tags, donations & more :contentReference[oaicite:3]{index=3}</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-gray-50 py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Loved by Organizers Everywhere</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { text: "“A clean, secure RSVP experience—no ads and zero data selling.”", name: "Olivia A.", role: "Executive Assistant" },
                { text: "“Beautifully branded invites, easy to customize, excellent support.”", name: "Allison Y.", role: "Marketing Specialist" },
                { text: "“inviteJoy scaled with our corporate events—analytics & check‑in rock.”", name: "Chenelle C.", role: "Marketing Manager" },
              ].map((t, i) => (
                <div key={i} className="bg-white p-8 rounded-xl shadow">
                  <div className="flex mb-4 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400" />
                    ))}
                  </div>
                  <p className="mb-4 text-gray-700 italic">{t.text}</p>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy section */}
        <section className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Privacy Is at Our Core</h2>
          <p className="max-w-xl mx-auto text-gray-600 mb-8">
            Unlike other platforms, Invite never monetizes data or sends spam. Event data stays with you :contentReference[oaicite:4]{index=4}
          </p>
        </section>

        {/* CTA */}
        <section className="bg-indigo-600 py-20 text-white text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Ditch the Noise?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join the thousands who trust inviteJoy. Start your first event for free today.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-100 px-8 py-4 font-semibold transform hover:scale-105 transition-transform">
              <ArrowRight className="w-5 h-5 mr-2" />
              Start Free Event
            </Button>
          </Link>
        </section>
      </main>
    </PageLayout>
  );
};

export default Index;
