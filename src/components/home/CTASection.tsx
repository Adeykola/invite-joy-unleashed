
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-16 md:py-24 bg-brand-primary text-white">
      <div className="container mx-auto px-4 text-center max-w-4xl">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Ready to create your next successful event?
        </h2>
        <p className="text-lg md:text-xl mb-8 text-brand-light">
          Join thousands of event planners who use RSVPlatform to create memorable experiences for their guests.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <Button asChild size="lg" className="bg-brand-accent text-brand-primary hover:bg-brand-accent/90 text-lg">
            <Link to="/signup">Start for Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
            <Link to="/features">Learn More</Link>
          </Button>
        </div>
        
        <div className="mt-8 text-brand-light text-sm">
          No credit card required • Free plan available • Cancel anytime
        </div>
      </div>
    </section>
  );
};

export default CTASection;
