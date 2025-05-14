
import PageLayout from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Wedding Planner",
    company: "Forever Weddings",
    image: "https://placehold.co/100x100/e3f9ed/1f4d3a?text=SJ",
    content: "RSVPlatform completely transformed how I manage client events. The tracking features saved me countless hours of work, and my clients love how professional everything looks. I've been able to take on more clients because of the time I save using this platform.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Corporate Event Manager",
    company: "TechCorp Inc.",
    image: "https://placehold.co/100x100/e3f9ed/1f4d3a?text=MC",
    content: "We've used RSVPlatform for all our company events ranging from small team gatherings to our annual conference with over 1,000 attendees. The response has been incredible. Our attendance rates have improved dramatically, and the analytics help us plan better events each time.",
    rating: 5
  },
  {
    name: "Priya Patel",
    role: "Nonprofit Organizer",
    company: "Hope Foundation",
    image: "https://placehold.co/100x100/e3f9ed/1f4d3a?text=PP",
    content: "The platform is intuitive and our donors love how easy it is to RSVP. The customization options are exactly what we needed to make our fundraising events stand out. We've seen a 30% increase in attendance since switching to RSVPlatform.",
    rating: 5
  },
  {
    name: "James Wilson",
    role: "Event Host",
    company: "",
    image: "https://placehold.co/100x100/e3f9ed/1f4d3a?text=JW",
    content: "I planned my 25th anniversary party using RSVPlatform and couldn't be happier with how smooth the process was. From sending invitations to tracking dietary restrictions, everything was handled in one place. Our guests commented on how professional it all seemed.",
    rating: 5
  },
  {
    name: "Emma Rodriguez",
    role: "Marketing Director",
    company: "Global Media",
    image: "https://placehold.co/100x100/e3f9ed/1f4d3a?text=ER",
    content: "We host product launch events quarterly, and RSVPlatform has streamlined our entire process. The ability to create custom questions helps us gather valuable insights from attendees, and the reporting features make follow-up remarkably efficient.",
    rating: 4
  },
  {
    name: "David Thompson",
    role: "Conference Organizer",
    company: "Industry Summit",
    image: "https://placehold.co/100x100/e3f9ed/1f4d3a?text=DT",
    content: "Managing a multi-day conference with dozens of sessions used to be a logistical nightmare. RSVPlatform's session management tools and attendee tracking changed everything. We now run three major conferences a year with half the administrative staff.",
    rating: 5
  }
];

const Testimonials = () => {
  return (
    <PageLayout>
      <div className="bg-brand-light py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-brand-primary">
              What Our Customers Say
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Don't just take our word for it. Here's what event planners and hosts have to say about RSVPlatform.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-brand-accent text-brand-accent" />
                  ))}
                  {[...Array(5 - testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-gray-300" />
                  ))}
                </div>
                
                <p className="text-lg mb-6 italic">"{testimonial.content}"</p>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-primary">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">
                      {testimonial.role}
                      {testimonial.company && ` • ${testimonial.company}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Case Studies Section */}
        <div className="mt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-primary mb-4">Featured Case Studies</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore in-depth stories of how organizations have transformed their events with RSVPlatform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                title: "How TechCorp Increased Conference Attendance by 45%",
                company: "TechCorp Inc.",
                image: "https://placehold.co/800x400/e3f9ed/1f4d3a?text=Case+Study+1"
              },
              {
                title: "Streamlining Wedding Planning: A Planner's Journey",
                company: "Forever Weddings",
                image: "https://placehold.co/800x400/e3f9ed/1f4d3a?text=Case+Study+2"
              }
            ].map((caseStudy, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <img 
                  src={caseStudy.image}
                  alt={caseStudy.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <p className="text-sm text-brand-accent font-semibold mb-2">{caseStudy.company}</p>
                  <h3 className="text-xl font-bold mb-3 text-brand-primary">{caseStudy.title}</h3>
                  <p className="text-gray-600 mb-4">
                    Learn how {caseStudy.company} revolutionized their event management process and achieved outstanding results with RSVPlatform.
                  </p>
                  <a href="#" className="text-brand-primary font-medium hover:underline">
                    Read the full case study →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Testimonials;
