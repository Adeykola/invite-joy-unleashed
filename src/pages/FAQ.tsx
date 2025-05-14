
import PageLayout from "@/components/PageLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FAQ = () => {
  const faqs = [
    {
      question: "What is RSVPlatform?",
      answer: "RSVPlatform is a comprehensive event management solution that helps you create, organize, and manage events of any size. Our platform offers tools for event registration, guest management, custom invitations, and real-time RSVP tracking."
    },
    {
      question: "Is there a free plan available?",
      answer: "Yes, we offer a free plan that includes basic event creation and RSVP tracking for up to 50 guests. For larger events and additional features, we have various paid plans to suit your needs."
    },
    {
      question: "How do guests RSVP to my event?",
      answer: "Guests can RSVP through email invitations, a custom event website, or via a unique link that you can share across any platform. Our system automatically tracks all responses in real-time."
    },
    {
      question: "Can I customize my event page and invitations?",
      answer: "Absolutely! Our platform offers extensive customization options. You can personalize colors, add your own images, select from various themes, and even use your own branding throughout the invitation and event page."
    },
    {
      question: "How do I track who has and hasn't responded?",
      answer: "Our dashboard provides a real-time overview of all responses. You can see who has viewed the invitation, who has responded, and what their specific responses are to any questions you've asked."
    },
    {
      question: "Can I collect additional information from guests?",
      answer: "Yes, you can create custom questions to collect information such as meal preferences, dietary restrictions, song requests, or any other details you need for your event."
    },
    {
      question: "Is it possible to send automatic reminders?",
      answer: "Yes, our platform allows you to schedule automatic reminder emails to guests who haven't responded, as well as event reminders to all confirmed guests as the event date approaches."
    },
    {
      question: "How secure is the guest information I collect?",
      answer: "We take data security seriously. All guest information is encrypted and stored securely. We never share your guest data with any third parties and comply with all relevant data protection regulations."
    },
    {
      question: "Can I export my guest list and responses?",
      answer: "Yes, you can export your complete guest list along with all response data in various formats including Excel, CSV, and PDF for your records or to use with other planning tools."
    },
    {
      question: "What if I need help using the platform?",
      answer: "We offer comprehensive support through our help center, tutorial videos, and email support. Our customer service team is available to assist you with any questions or issues you might encounter."
    }
  ];

  return (
    <PageLayout>
      <div className="bg-brand-light py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-brand-primary">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Find answers to common questions about RSVPlatform and how it can help you manage your events.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="mb-10">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-medium text-brand-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-12 p-8 bg-brand-light rounded-lg">
            <h3 className="text-2xl font-semibold mb-4 text-brand-primary">
              Still have questions?
            </h3>
            <p className="mb-6 text-gray-700">
              Our support team is ready to assist you with any questions you may have about our platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild className="bg-brand-primary hover:bg-brand-primary/90">
                <Link to="/contact">Contact Support</Link>
              </Button>
              <Button asChild variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white">
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default FAQ;
