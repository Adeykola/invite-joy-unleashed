
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, CheckCircle, Clock, Mail, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">RSVPro</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">Features</a>
              <a href="#pricing" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">Pricing</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">Testimonials</a>
              <a href="#faq" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">FAQ</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="hidden md:inline-flex">Log in</Button>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700">
                Start Free
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 md:pt-32 md:pb-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-6">
                Simplify Event Planning & Guest Management
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create beautiful event websites, send digital invitations, and manage RSVPs with ease.
                The all-in-one platform for event hosts and planners.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-indigo-600 border-indigo-300 hover:bg-indigo-50">
                  Watch Demo
                </Button>
              </div>
              <div className="mt-8 flex items-center text-sm text-gray-500">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>No credit card required</span>
                <CheckCircle className="h-5 w-5 text-green-500 ml-4 mr-2" />
                <span>14-day free trial</span>
              </div>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg transform rotate-3"></div>
                <img 
                  src="https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80" 
                  alt="Event Dashboard" 
                  className="relative rounded-lg shadow-xl z-10 transform -rotate-1"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wide mb-8">Trusted by thousands of event planners worldwide</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
            {/* We would normally use real logos here */}
            <div className="h-8 w-auto text-gray-400 font-bold">COMPANY 1</div>
            <div className="h-8 w-auto text-gray-400 font-bold">COMPANY 2</div>
            <div className="h-8 w-auto text-gray-400 font-bold">COMPANY 3</div>
            <div className="h-8 w-auto text-gray-400 font-bold">COMPANY 4</div>
            <div className="h-8 w-auto text-gray-400 font-bold">COMPANY 5</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need for successful events</h2>
            <p className="text-xl text-gray-600">Powerful features to create, manage, and host exceptional events of any size.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="p-3 bg-indigo-100 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                <Mail className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Digital Invitations</h3>
              <p className="text-gray-600 mb-4">Create and send beautiful digital invitations with custom designs that match your event theme.</p>
              <a href="#" className="text-indigo-600 font-medium flex items-center">
                Learn more 
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="p-3 bg-purple-100 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                <Users className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Guest Management</h3>
              <p className="text-gray-600 mb-4">Track RSVPs, manage your guest list, and communicate with attendees all in one place.</p>
              <a href="#" className="text-indigo-600 font-medium flex items-center">
                Learn more 
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="p-3 bg-pink-100 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                <Calendar className="h-7 w-7 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Event Websites</h3>
              <p className="text-gray-600 mb-4">Create beautiful, mobile-friendly event websites with all the information your guests need.</p>
              <a href="#" className="text-indigo-600 font-medium flex items-center">
                Learn more 
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="p-3 bg-blue-100 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                <Clock className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Check-In Tools</h3>
              <p className="text-gray-600 mb-4">Streamline the check-in process with QR codes and our mobile check-in app.</p>
              <a href="#" className="text-indigo-600 font-medium flex items-center">
                Learn more 
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="p-3 bg-green-100 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                <Users className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Seating Charts</h3>
              <p className="text-gray-600 mb-4">Create and manage table assignments and seating charts with our intuitive drag-and-drop tool.</p>
              <a href="#" className="text-indigo-600 font-medium flex items-center">
                Learn more 
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="p-3 bg-orange-100 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                <Mail className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Custom Forms</h3>
              <p className="text-gray-600 mb-4">Collect the exact information you need from guests with customizable RSVP forms.</p>
              <a href="#" className="text-indigo-600 font-medium flex items-center">
                Learn more 
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that's right for you and start creating memorable events.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$29</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-6">Perfect for occasional event planners and small gatherings.</p>
              <ul className="space-y-4 mb-8">
                {["Up to 100 guests", "Digital invitations", "Event website", "RSVP management"].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full">Get Started</Button>
            </div>

            <div className="bg-gradient-to-b from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 transform scale-105 -translate-y-2">
              <div className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">MOST POPULAR</div>
              <h3 className="text-lg font-semibold text-white mb-2">Professional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$79</span>
                <span className="text-indigo-100">/month</span>
              </div>
              <p className="text-indigo-100 mb-6">Ideal for frequent event planners and medium-sized events.</p>
              <ul className="space-y-4 mb-8">
                {[
                  "Up to 500 guests",
                  "Premium digital invitations",
                  "Custom event website",
                  "Advanced RSVP tools",
                  "Seating charts",
                  "Guest messaging",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-indigo-200 mr-2" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50">Get Started</Button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$199</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-6">For event professionals and large-scale events.</p>
              <ul className="space-y-4 mb-8">
                {[
                  "Unlimited guests",
                  "Premium features",
                  "White-label solution",
                  "Priority support",
                  "API access",
                  "Advanced analytics",
                  "Dedicated manager",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by event planners everywhere</h2>
            <p className="text-xl text-gray-600">See what our customers are saying about their experience with RSVPro.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "RSVPro transformed how we plan and manage our corporate events. The time saved on administrative tasks alone has been worth every penny.",
                name: "Sarah Johnson",
                title: "Event Director, TechCorp"
              },
              {
                quote: "As a wedding planner, I've tried numerous event platforms. RSVPro stands out with its beautiful designs and powerful guest management tools.",
                name: "Michael Chen",
                title: "Wedding Planner"
              },
              {
                quote: "The customer service is exceptional. Whenever I've had questions, the team has been responsive and incredibly helpful.",
                name: "Jessica Williams",
                title: "Fundraising Coordinator"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                <div className="text-indigo-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 max-w-3xl mx-auto">Ready to transform how you manage events?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">Join thousands of successful event planners who trust RSVPro for their events.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 px-8">
              Start Your Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Find answers to common questions about RSVPro.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                q: "How long is the free trial?",
                a: "Our free trial lasts for 14 days with full access to all features. No credit card required to sign up."
              },
              {
                q: "Do you offer custom branding?",
                a: "Yes, our Professional and Enterprise plans allow you to customize your event websites and digital invitations with your own branding."
              },
              {
                q: "Can I import my guest list?",
                a: "Absolutely! You can import your guest list from a CSV or Excel file, or manually enter guest information."
              },
              {
                q: "Is there a limit to how many events I can create?",
                a: "There's no limit to the number of events you can create on any of our plans. The plans differ in the number of guests per event."
              },
              {
                q: "Do you offer discounts for non-profits?",
                a: "Yes, we offer special pricing for non-profit organizations. Please contact our sales team for more information."
              },
              {
                q: "Is my data secure?",
                a: "Absolutely. We use industry-standard encryption and security measures to keep your data and your guests' information safe."
              }
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Button variant="outline" className="text-indigo-600 border-indigo-300 hover:bg-indigo-50">
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                {["Features", "Pricing", "Testimonials", "FAQ", "Demo"].map((item, index) => (
                  <li key={index}><a href="#" className="text-gray-400 hover:text-white transition">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                {["About", "Blog", "Careers", "Press", "Contact"].map((item, index) => (
                  <li key={index}><a href="#" className="text-gray-400 hover:text-white transition">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                {["Help Center", "Documentation", "Guides", "API", "Status"].map((item, index) => (
                  <li key={index}><a href="#" className="text-gray-400 hover:text-white transition">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                {["Privacy", "Terms", "Security", "Accessibility", "Cookies"].map((item, index) => (
                  <li key={index}><a href="#" className="text-gray-400 hover:text-white transition">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">RSVPro</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} RSVPro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
