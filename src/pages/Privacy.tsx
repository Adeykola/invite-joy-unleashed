import PageLayout from "@/components/layouts/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Users, Settings, Download } from "lucide-react";

const Privacy = () => {
  const lastUpdated = "December 1, 2024";

  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: [
        "Personal information you provide when creating an account (name, email, phone number)",
        "Event information you create and manage through our platform",
        "Guest information you add to your events (names, emails, RSVP responses)",
        "Usage data about how you interact with our platform",
        "Device information and IP addresses for security and analytics",
        "Payment information (processed securely through our payment partners)"
      ]
    },
    {
      icon: Settings,
      title: "How We Use Your Information",
      content: [
        "Provide and improve our event management services",
        "Send event invitations and reminders on your behalf",
        "Process payments and manage billing",
        "Communicate with you about your account and our services",
        "Analyze usage patterns to improve our platform",
        "Ensure platform security and prevent fraud",
        "Comply with legal obligations"
      ]
    },
    {
      icon: Users,
      title: "Information Sharing",
      content: [
        "We never sell your personal information to third parties",
        "Guest information is only shared with event hosts who added them",
        "We may share data with service providers who help us operate our platform",
        "Anonymous, aggregated data may be used for research and analytics",
        "We will disclose information if required by law or to protect our rights",
        "In case of business transfer, user data may be transferred to new owners"
      ]
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        "All data is encrypted in transit and at rest",
        "We use industry-standard security measures to protect your information",
        "Regular security audits and penetration testing",
        "Access to personal data is restricted to authorized personnel only",
        "We maintain detailed security logs and monitoring",
        "Payment data is processed by PCI-compliant payment processors"
      ]
    },
    {
      icon: Shield,
      title: "Your Rights & Controls",
      content: [
        "Access and download your personal data at any time",
        "Correct or update your personal information",
        "Delete your account and associated data",
        "Control email and notification preferences",
        "Request data portability to another service",
        "Opt out of marketing communications",
        "Request information about data processing"
      ]
    },
    {
      icon: Download,
      title: "Data Retention",
      content: [
        "Personal account data is retained while your account is active",
        "Event data is preserved for 2 years after event completion",
        "Guest data is deleted when events are permanently deleted",
        "Billing records are retained for 7 years for tax purposes",
        "Support communications are kept for 3 years",
        "Anonymous analytics data may be retained indefinitely"
      ]
    }
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Your privacy is important to us. This policy explains how we collect, 
              use, and protect your personal information.
            </p>
            <p className="text-gray-500">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <Card className="mb-12 border-blue-200 bg-blue-50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-blue-900 mb-4">Our Commitment to Privacy</h2>
                <p className="text-blue-800 leading-relaxed">
                  At InviteJoy, we believe that your personal information belongs to you. We're committed to being 
                  transparent about what data we collect, how we use it, and giving you control over your information. 
                  This policy applies to all InviteJoy services and explains your privacy rights in clear, simple language.
                </p>
              </CardContent>
            </Card>

            {/* Privacy Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => (
                <Card key={index} className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl text-gray-900">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <section.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* GDPR & International Users */}
            <Card className="mt-12 border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">International Users & GDPR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>For European Union users:</strong> InviteJoy complies with the General Data Protection 
                    Regulation (GDPR). You have additional rights including the right to data portability, 
                    the right to be forgotten, and the right to object to processing.
                  </p>
                  <p>
                    <strong>Data transfers:</strong> Your data may be processed in the United States and other 
                    countries where our service providers operate. We ensure appropriate safeguards are in 
                    place for international data transfers.
                  </p>
                  <p>
                    <strong>Legal basis for processing:</strong> We process your data based on consent, 
                    contractual necessity, legitimate interests, and legal obligations.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="mt-12 border-green-200 bg-green-50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-green-900 mb-4">Questions About Privacy?</h2>
                <div className="text-green-800 space-y-2">
                  <p>
                    If you have questions about this privacy policy or how we handle your data, 
                    we're here to help.
                  </p>
                  <div className="space-y-1">
                    <p><strong>Email:</strong> privacy@invitejoy.com</p>
                    <p><strong>Address:</strong> InviteJoy Privacy Officer, 123 Market Street, Suite 456, San Francisco, CA 94105</p>
                    <p><strong>EU Representative:</strong> privacy-eu@invitejoy.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Updates Notice */}
            <Card className="mt-8 border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Policy Updates</h3>
                <p className="text-amber-800">
                  We may update this privacy policy from time to time. We'll notify you of any 
                  material changes by email and by posting the updated policy on our website. 
                  Continued use of our services after changes become effective constitutes acceptance 
                  of the updated policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Privacy;