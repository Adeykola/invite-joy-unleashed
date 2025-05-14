
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="bg-brand-primary text-white py-16 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 max-w-xl">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                Create unforgettable events with ease
              </h1>
              <p className="text-lg md:text-xl text-brand-light">
                The complete event management platform for planning, invitations, 
                and RSVP tracking. All in one place.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-brand-accent text-brand-primary hover:bg-brand-accent/90 text-lg">
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link to="/features" className="flex items-center">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <div className="bg-white p-6 rounded-lg shadow-2xl">
              <img 
                src="https://placehold.co/600x400/e3f9ed/1f4d3a?text=RSVPlatform+Demo" 
                alt="RSVPlatform Demo" 
                className="rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
