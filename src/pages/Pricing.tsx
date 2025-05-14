
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Link } from "react-router-dom";

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for small events",
    features: [
      "Up to 50 guests",
      "Basic event page",
      "Email invitations",
      "RSVP tracking",
      "Limited customization"
    ],
    cta: "Get Started",
    highlighted: false
  },
  {
    name: "Pro",
    price: "$39",
    period: "per month",
    description: "Great for regular events",
    features: [
      "Up to 250 guests",
      "Custom event pages",
      "Email & SMS invitations",
      "Detailed guest management",
      "Custom questions",
      "Event reminders",
      "Priority support"
    ],
    cta: "Start Free Trial",
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "For large organizations",
    features: [
      "Unlimited guests",
      "Multiple event management",
      "Advanced analytics",
      "API access",
      "Custom branding",
      "Dedicated account manager",
      "White-label option",
      "24/7 premium support"
    ],
    cta: "Contact Sales",
    highlighted: false
  }
];

const Pricing = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-20 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-primary mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that works best for your events and budget
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index}
              className={`rounded-xl overflow-hidden border transition-all hover:shadow-xl ${
                plan.highlighted 
                  ? "border-brand-primary ring-2 ring-brand-primary/30 shadow-lg" 
                  : "border-gray-200"
              }`}
            >
              <div className={`p-8 ${plan.highlighted ? "bg-brand-light" : "bg-white"}`}>
                <h3 className="text-2xl font-bold text-brand-primary">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && (
                    <span className="ml-1 text-xl text-gray-500">/{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-gray-600">{plan.description}</p>

                <Button 
                  asChild 
                  className={`mt-6 w-full ${
                    plan.highlighted 
                      ? "bg-brand-primary hover:bg-brand-primary/90" 
                      : "bg-white border border-brand-primary text-brand-primary hover:bg-brand-light"
                  }`}
                >
                  <Link to={plan.name === "Enterprise" ? "/contact" : "/signup"}>
                    {plan.cta}
                  </Link>
                </Button>
              </div>

              <div className="p-8 bg-white border-t">
                <p className="font-medium mb-4">What's included:</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-brand-primary flex-shrink-0 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Need a custom plan?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We offer tailored solutions for organizations with specific requirements. 
            Contact our sales team to discuss your needs.
          </p>
          <Button asChild className="bg-brand-primary hover:bg-brand-primary/90">
            <Link to="/contact">Contact Sales</Link>
          </Button>
        </div>

        <div className="mt-20 bg-brand-light p-8 rounded-xl max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-brand-primary mb-2">Can I switch plans later?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-brand-primary mb-2">Is there a contract or commitment?</h3>
              <p className="text-gray-600">No long-term contracts. All paid plans are billed monthly or annually, and you can cancel at any time.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-brand-primary mb-2">Do you offer non-profit discounts?</h3>
              <p className="text-gray-600">Yes, we offer special pricing for non-profit organizations. Please contact our sales team for details.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-brand-primary mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, PayPal, and can arrange for invoice payment for annual Enterprise plans.</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Pricing;
