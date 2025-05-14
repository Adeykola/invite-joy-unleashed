
import PageLayout from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Wedding Planner",
    company: "Perfect Day Weddings",
    image: "https://placehold.co/300x300/e3f9ed/1f4d3a?text=SJ",
    content: "RSVPlatform completely transformed how I manage client events. The tracking features saved me countless hours of work and helped me provide a better experience for my clients!",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Corporate Event Manager",
    company: "TechCorp Inc.",
    image: "https://placehold.co/300x300/e3f9ed/1f4d3a?text=MC",
    content: "We've used RSVPlatform for all our company events and the response has been incredible. Our attendance rates have improved dramatically and the analytics give us valuable insights.",
    rating: 5
  },
  {
    name: "Priya Patel",
    role: "Nonprofit Organizer",
    company: "Hope Foundation",
    image: "https://placehold.co/300x300/e3f9ed/1f4d3a?text=PP",
    content: "The platform is intuitive and our donors love how easy it is to RSVP. The customization options are exactly what we needed for our fundraising galas.",
    rating: 5
  },
  {
    name: "James Wilson",
    role: "Conference Organizer",
    company: "Global Tech Summit",
    image: "https://placehold.co/300x300/e3f9ed/1f4d3a?text=JW",
    content: "Managing a conference with 1000+ attendees used to be a logistical nightmare. RSVPlatform streamlined everything from registration to check-in. Cannot recommend it enough!",
    rating: 5
  },
  {
    name: "Emma Rodriguez",
    role: "Social Media Manager",
    company: "Brand Amplify Agency",
    image: "https://placehold.co/300x300/e3f9ed/1f4d3a?text=ER",
    content: "Our client events look so professional now with RSVPlatform. The customization options allow us to maintain brand consistency across all touchpoints.",
    rating: 4
  },
  {
    name: "David Kim",
    role: "University Administrator",
    company: "Metropolitan University",
    image: "https://placehold.co/300x300/e3f9ed/1f4d3a?text=DK",
    content: "We use RSVPlatform for alumni events, open houses, and graduation ceremonies. The platform scales beautifully for events of all sizes.",
    rating: 5
  },
  {
    name: "Linda Thomas",
    role: "Event Coordinator",
    company: "Creative Events Co.",
    image: "https://placehold.co/300x300/e3f9ed/1f4d3a?text=LT",
    content: "The customer support team is exceptional. Whenever I have a question, they respond quickly and are always helpful. That level of support is rare these days.",
    rating: 5
  },
  {
    name: "Robert Garcia",
    role: "HR Director",
    company: "Innovative Solutions",
    image: "https://placehold.co/300x300/e3f9ed/1f4d3a?text=RG",
    content: "Our company retreats and team-building events are so much easier to organize now. The plus-one management and dietary preference tracking have been game-changers.",
    rating: 4
  }
];

const Testimonials = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-primary mb-6">
            What Our Customers Say
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of event planners who trust RSVPlatform for their events
          </p>
        </div>

        {/* Featured testimonial */}
        <div className="mb-16 max-w-4xl mx-auto">
          <Card className="border-none shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-brand-primary p-10 text-white flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-4">Success Story</h2>
                <p className="text-xl mb-6 italic">
                  "Since switching to RSVPlatform, we've seen a 40% increase in attendance rates and saved over 15 hours per week on event management tasks."
                </p>
                <div>
                  <p className="font-semibold text-xl">Maria Lopez</p>
                  <p className="text-brand-light">Director of Events, Global Connections</p>
                </div>
              </div>
              <div className="p-0">
                <img 
                  src="https://placehold.co/600x600/e3f9ed/1f4d3a?text=Featured+Testimonial" 
                  alt="Maria Lopez" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex space-x-1 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-brand-accent text-brand-accent" />
                  ))}
                  {[...Array(5 - item.rating)].map((_, i) => (
                    <Star key={i + item.rating} className="h-5 w-5 text-gray-300" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 italic">"{item.content}"</p>
                
                <div className="flex items-center mt-4">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="font-semibold text-brand-primary">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.role}, {item.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-20 text-center bg-brand-light p-12 rounded-xl">
          <h2 className="text-3xl font-bold text-brand-primary mb-4">
            Ready to create memorable events?
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users and experience the difference with RSVPlatform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-brand-primary hover:bg-brand-primary/90">
              <Link to="/signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-brand-primary text-brand-primary hover:bg-brand-light">
              <Link to="/features">See All Features</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Testimonials;
