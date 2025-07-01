
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for small personal events",
      features: [
        "Up to 50 guests",
        "Basic event pages",
        "Email invitations",
        "RSVP tracking",
        "Basic analytics",
        "Email support"
      ],
      cta: "Get Started Free",
      popular: false,
      href: "/signup"
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "Great for regular event organizers",
      features: [
        "Up to 500 guests",
        "Custom branding",
        "SMS invitations",
        "Advanced analytics",
        "QR code check-in",
        "Custom domains",
        "Priority support",
        "Guest messaging",
        "Payment collection"
      ],
      cta: "Start Pro Trial",
      popular: true,
      href: "/signup?plan=pro"
    },
    {
      name: "Business",
      price: "$49",
      period: "per month",
      description: "For teams and large events",
      features: [
        "Unlimited guests",
        "Team collaboration",
        "White-label solution",
        "API access",
        "Advanced integrations",
        "Dedicated support",
        "Custom workflows",
        "Multi-language support",
        "Advanced security"
      ],
      cta: "Contact Sales",
      popular: false,
      href: "/contact"
    }
  ];

  const faqs = [
    {
      question: "Can I change plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any charges."
    },
    {
      question: "What happens if I exceed my guest limit?",
      answer: "We'll notify you when approaching your limit. You can upgrade your plan or purchase additional guest capacity as needed."
    },
    {
      question: "Do you offer annual discounts?",
      answer: "Yes! Save 20% when you choose annual billing. The discount is applied automatically at checkout."
    },
    {
      question: "Is there a setup fee?",
      answer: "No setup fees ever. You only pay the monthly subscription fee for your chosen plan."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. Cancel anytime with no penalties. Your account remains active until the end of your billing period."
    }
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your events. Start free and upgrade as you grow.
          </p>
          <div className="flex justify-center items-center space-x-4 mb-8">
            <span className="text-gray-700 font-medium">Monthly</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" />
              <div className="w-10 h-6 bg-gray-300 rounded-full shadow-inner"></div>
              <div className="absolute w-4 h-4 bg-white rounded-full shadow left-1 top-1 transform transition-transform"></div>
            </div>
            <span className="text-gray-700 font-medium">Annual</span>
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">Save 20%</span>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 border-2 shadow-xl' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={plan.href} className="block">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white font-semibold py-3`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about our pricing</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of event organizers who trust InviteJoy for their events.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
};

export default Pricing;
