
import { useState } from 'react';
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, CheckCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  
  const plans = [
    {
      name: "Basic",
      monthlyPrice: 0,
      annualPrice: 0,
      description: "For small personal events",
      features: [
        "1 active event",
        "Up to 50 guests",
        "Email invitations",
        "Basic RSVP tracking",
        "Standard templates",
      ],
      isPopular: false,
      buttonText: "Get Started"
    },
    {
      name: "Standard",
      monthlyPrice: 29,
      annualPrice: 19,
      description: "Perfect for regular event hosts",
      features: [
        "Up to 5 active events",
        "Up to 250 guests per event",
        "Custom questions",
        "Meal selection options",
        "Premium templates",
        "Guest reminders",
        "Plus-one management"
      ],
      isPopular: true,
      buttonText: "Choose Standard"
    },
    {
      name: "Professional",
      monthlyPrice: 59,
      annualPrice: 39,
      description: "For professional event planners",
      features: [
        "Unlimited active events",
        "Unlimited guests",
        "Custom branding",
        "Advanced analytics",
        "Priority support",
        "Guest check-in system",
        "Custom domain",
        "API access",
        "Integrations"
      ],
      isPopular: false,
      buttonText: "Choose Professional"
    }
  ];

  return (
    <PageLayout>
      <div className="bg-brand-light py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-brand-primary">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Choose the plan that's right for your events
            </p>
            
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={isAnnual ? "text-gray-500" : "text-brand-primary font-medium"}>Monthly</span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
              />
              <span className={!isAnnual ? "text-gray-500" : "text-brand-primary font-medium"}>
                Annually <span className="text-sm text-brand-accent font-bold ml-2">Save 35%</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12 md:py-16 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${
                plan.isPopular 
                  ? "border-brand-accent shadow-lg shadow-brand-accent/10" 
                  : "border-gray-200"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit bg-brand-accent text-brand-primary px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-brand-primary">{plan.name}</CardTitle>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-bold">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                {isAnnual && plan.annualPrice > 0 && (
                  <p className="text-sm text-gray-500">Billed annually</p>
                )}
                <p className="mt-2 text-gray-600">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-brand-accent mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  asChild 
                  className={`w-full ${
                    plan.isPopular 
                      ? "bg-brand-primary hover:bg-brand-primary/90" 
                      : "bg-brand-primary/80 hover:bg-brand-primary"
                  }`}
                >
                  <Link to="/signup">{plan.buttonText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4 text-brand-primary">Enterprise Solutions</h3>
          <p className="text-gray-700 mb-6">
            Need a custom solution for large-scale or specialized events? Our enterprise plan offers tailored features, dedicated support, and custom integrations.
          </p>
          <Button asChild variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white">
            <Link to="/contact">Contact Sales</Link>
          </Button>
        </div>
        
        <div className="mt-16 p-8 bg-brand-light rounded-lg max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <CheckCircle className="h-16 w-16 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-brand-primary">100% Satisfaction Guarantee</h3>
              <p className="text-gray-700">
                Try any of our paid plans risk-free for 14 days. If you're not completely satisfied, let us know and we'll refund your payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Pricing;
