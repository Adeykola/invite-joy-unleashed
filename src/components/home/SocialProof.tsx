
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Wedding Planner",
    content: "RSVPlatform completely transformed how I manage client events. The tracking features saved me countless hours of work!",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Corporate Event Manager",
    content: "We've used RSVPlatform for all our company events and the response has been incredible. Our attendance rates have improved dramatically.",
    rating: 5
  },
  {
    id: 3,
    name: "Priya Patel",
    role: "Nonprofit Organizer",
    content: "The platform is intuitive and our donors love how easy it is to RSVP. The customization options are exactly what we needed.",
    rating: 5
  }
];

const clients = [
  "Acme Inc.", "Globex", "Initech", "Umbrella Corp", "Stark Industries", "Wayne Enterprises"
];

const SocialProof = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextTestimonial = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  };
  
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-title">Trusted by Thousands of Event Planners</h2>
          <p className="section-subtitle">
            Join the community of event hosts who rely on our platform for seamless event management
          </p>
        </div>
        
        {/* Testimonial Carousel */}
        <div className="mb-20 max-w-4xl mx-auto">
          <Card className="border-none shadow-lg">
            <CardContent className="p-8">
              <div className="flex space-x-1 mb-4">
                {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-brand-accent text-brand-accent" />
                ))}
              </div>
              
              <p className="text-lg mb-6 italic">"{testimonials[activeIndex].content}"</p>
              
              <div>
                <p className="font-semibold text-brand-primary">{testimonials[activeIndex].name}</p>
                <p className="text-sm text-gray-500">{testimonials[activeIndex].role}</p>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={prevTestimonial}
                  className="rounded-full border-gray-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={nextTestimonial}
                  className="rounded-full border-gray-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Client Logos */}
        <div className="text-center">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-6">Trusted by companies and planners worldwide</p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {clients.map((client, index) => (
              <div key={index} className="text-xl font-bold text-gray-400">
                {client}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
