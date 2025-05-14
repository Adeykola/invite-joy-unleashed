
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// FAQ categories and questions
const faqCategories = [
  {
    id: "general",
    name: "General",
    questions: [
      {
        question: "What is RSVPlatform?",
        answer: "RSVPlatform is a comprehensive event management solution that helps you create, manage, and track events of all sizes. From weddings to corporate conferences, our platform provides tools for invitations, RSVP tracking, guest management, and more."
      },
      {
        question: "Do I need technical skills to use RSVPlatform?",
        answer: "Not at all! RSVPlatform is designed to be user-friendly and intuitive. Our drag-and-drop interfaces and templates make it easy for anyone to create beautiful event pages and invitations without any technical knowledge."
      },
      {
        question: "Can I try RSVPlatform before purchasing?",
        answer: "Yes, we offer a free plan with limited features that you can use indefinitely. For paid features, we offer a 14-day free trial on all our premium plans with no credit card required."
      },
      {
        question: "How many events can I create?",
        answer: "The number of events you can create depends on your plan. Our Free plan allows for 1 active event at a time, while our paid plans offer multiple or unlimited events depending on the tier."
      }
    ]
  },
  {
    id: "features",
    name: "Features & Functionality",
    questions: [
      {
        question: "Can I customize the look of my event page?",
        answer: "Absolutely! RSVPlatform offers extensive customization options including themes, colors, fonts, and layouts. You can also add your own images, logos, and custom text to match your event branding."
      },
      {
        question: "Does RSVPlatform support multiple languages?",
        answer: "Yes, our platform supports multiple languages for both the admin interface and guest-facing pages. You can create invitations in virtually any language and allow guests to view your event details in their preferred language."
      },
      {
        question: "Can guests add plus-ones to their RSVP?",
        answer: "Yes, you can enable plus-one options for your guests. You can set limits on the number of plus-ones allowed and collect information about them through custom fields."
      },
      {
        question: "Is there a mobile app available?",
        answer: "While we don't currently have a dedicated mobile app, RSVPlatform is fully responsive and works beautifully on mobile devices. Event hosts can manage their events on the go, and guests can RSVP easily from their smartphones."
      }
    ]
  },
  {
    id: "billing",
    name: "Billing & Payments",
    questions: [
      {
        question: "How does billing work?",
        answer: "We offer monthly and annual billing options. Annual plans come with a discount compared to paying monthly. You can upgrade, downgrade, or cancel your subscription at any time."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal. For enterprise plans, we can also arrange for invoice payment."
      },
      {
        question: "Is there a fee for collecting payments from guests?",
        answer: "For ticket sales and donations, there is a small processing fee in addition to standard payment processor fees. The exact fee depends on your plan level, with lower fees on higher-tier plans."
      },
      {
        question: "Do you offer refunds?",
        answer: "We offer a 30-day money-back guarantee on all new subscriptions. If you're not satisfied with our service within the first 30 days, contact our support team for a full refund."
      }
    ]
  },
  {
    id: "support",
    name: "Support & Training",
    questions: [
      {
        question: "How can I get help if I need it?",
        answer: "We offer multiple support channels including email, live chat during business hours, and an extensive knowledge base. Premium plans include priority support and dedicated account managers."
      },
      {
        question: "Do you offer training for new users?",
        answer: "Yes, we provide free onboarding webinars for all new users. Enterprise plans include personalized training sessions. We also have a library of video tutorials and step-by-step guides."
      },
      {
        question: "Is phone support available?",
        answer: "Phone support is available for Pro and Enterprise plan subscribers. Free and Basic plan users can upgrade to access phone support or use our other support channels."
      }
    ]
  },
  {
    id: "security",
    name: "Privacy & Security",
    questions: [
      {
        question: "Is my data secure with RSVPlatform?",
        answer: "Yes, we take security very seriously. We use industry-standard encryption for data transmission and storage. Our servers are hosted in secure facilities with multiple redundancies and regular security audits."
      },
      {
        question: "What happens to my guest data?",
        answer: "Your guest data belongs to you. We don't sell or share your data with third parties. You can export your guest data at any time and delete it from our servers when you no longer need it."
      },
      {
        question: "Is RSVPlatform GDPR compliant?",
        answer: "Yes, RSVPplatform is fully GDPR compliant. We provide tools to help you collect appropriate consent from your guests and fulfill data requests as required by privacy regulations."
      }
    ]
  }
];

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState("general");

  return (
    <PageLayout>
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-primary mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about RSVPlatform
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {faqCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className={
                  activeCategory === category.id 
                    ? "bg-brand-primary hover:bg-brand-primary/90" 
                    : "border-brand-primary text-brand-primary hover:bg-brand-light"
                }
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* FAQ accordion */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            {faqCategories
              .filter((category) => category.id === activeCategory)
              .map((category) => (
                <div key={category.id}>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left font-semibold text-brand-primary">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
          </div>

          {/* Still have questions section */}
          <div className="mt-16 text-center p-8 bg-brand-light rounded-lg">
            <h2 className="text-2xl font-bold text-brand-primary mb-4">Still have questions?</h2>
            <p className="text-gray-700 mb-6">
              Our support team is here to help with any other questions you might have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-brand-primary hover:bg-brand-primary/90">
                <Link to="/contact">Contact Support</Link>
              </Button>
              <Button asChild variant="outline" className="border-brand-primary text-brand-primary hover:bg-white">
                <a href="mailto:support@rsvplatform.com">Email Us</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default FAQ;
