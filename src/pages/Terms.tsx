import PageLayout from "@/components/layouts/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, AlertTriangle, Users, CreditCard, Scale } from "lucide-react";

const Terms = () => {
  const lastUpdated = "December 1, 2024";
  const effectiveDate = "December 1, 2024";

  const sections = [
    {
      icon: Users,
      title: "Account Terms",
      content: [
        "You must be 18 years or older to use InviteJoy services",
        "You are responsible for maintaining the security of your account credentials",
        "One person or legal entity may not maintain more than one free account",
        "You are responsible for all activity that occurs under your account",
        "You must provide accurate and complete information when creating your account",
        "We reserve the right to suspend or terminate accounts that violate these terms"
      ]
    },
    {
      icon: Shield,
      title: "Acceptable Use",
      content: [
        "Use our services only for lawful purposes and in accordance with these terms",
        "Do not use our platform to send spam, harassment, or malicious content",
        "Respect intellectual property rights of others",
        "Do not attempt to gain unauthorized access to our systems",
        "Do not use our services to violate any applicable laws or regulations",
        "Do not interfere with or disrupt the integrity or performance of our services"
      ]
    },
    {
      icon: FileText,
      title: "Content & Data",
      content: [
        "You retain ownership of all content you create and upload to our platform",
        "You grant us a license to use your content to provide our services",
        "You are responsible for the accuracy and legality of content you submit",
        "We may remove content that violates these terms or applicable laws",
        "You represent that you have the right to share any guest information you upload",
        "We reserve the right to backup and store your data for service provision"
      ]
    },
    {
      icon: CreditCard,
      title: "Payment Terms",
      content: [
        "Subscription fees are billed in advance on a monthly or annual basis",
        "All fees are non-refundable except as required by law",
        "You authorize us to charge your payment method for all applicable fees",
        "Price changes will be communicated with 30 days advance notice",
        "Failed payments may result in service suspension or account termination",
        "You are responsible for any taxes applicable to your use of our services"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Service Availability",
      content: [
        "We strive for 99.9% uptime but cannot guarantee uninterrupted service",
        "We may perform maintenance that temporarily affects service availability",
        "We are not liable for service interruptions beyond our reasonable control",
        "Critical updates may require brief service interruptions",
        "We provide advance notice of planned maintenance when possible",
        "Emergency maintenance may be performed without advance notice"
      ]
    },
    {
      icon: Scale,
      title: "Limitation of Liability",
      content: [
        "Our liability is limited to the amount you paid us in the 12 months before the claim",
        "We are not liable for indirect, incidental, or consequential damages",
        "You use our services at your own risk",
        "We do not guarantee that our services will meet your specific requirements",
        "We are not responsible for data loss due to user error or system failures",
        "Some jurisdictions do not allow liability limitations; these may not apply to you"
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
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              These terms govern your use of InviteJoy services. Please read them carefully.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-gray-500">
              <p>Last updated: {lastUpdated}</p>
              <p className="hidden sm:block">•</p>
              <p>Effective: {effectiveDate}</p>
            </div>
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
                <h2 className="text-2xl font-bold text-blue-900 mb-4">Agreement Overview</h2>
                <div className="text-blue-800 space-y-4">
                  <p>
                    Welcome to InviteJoy! These Terms of Service ("Terms") are a legal agreement between 
                    you and InviteJoy, Inc. ("InviteJoy", "we", "us", or "our") regarding your use of 
                    our event management platform and related services.
                  </p>
                  <p>
                    By accessing or using InviteJoy, you agree to be bound by these Terms and our Privacy Policy. 
                    If you don't agree to these Terms, please don't use our services.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Terms Sections */}
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

            {/* Additional Important Terms */}
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Termination</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-gray-700">
                  <p>
                    <strong>By You:</strong> You may cancel your account at any time through your 
                    account settings or by contacting us.
                  </p>
                  <p>
                    <strong>By Us:</strong> We may suspend or terminate your account if you violate 
                    these terms or for other reasons outlined in this agreement.
                  </p>
                  <p>
                    <strong>Effect:</strong> Upon termination, your right to use our services stops 
                    immediately, but these terms continue to apply.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Modifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-gray-700">
                  <p>
                    <strong>Service Changes:</strong> We may modify or discontinue features of our 
                    service with reasonable notice.
                  </p>
                  <p>
                    <strong>Terms Changes:</strong> We may update these terms from time to time. 
                    Material changes will be communicated with 30 days notice.
                  </p>
                  <p>
                    <strong>Continued Use:</strong> Your continued use after changes indicates 
                    acceptance of the updated terms.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Governing Law */}
            <Card className="mt-8 border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Governing Law & Disputes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  <strong>Governing Law:</strong> These terms are governed by the laws of the State of California, 
                  United States, without regard to conflict of law principles.
                </p>
                <p>
                  <strong>Dispute Resolution:</strong> Any disputes arising from these terms will be resolved 
                  through binding arbitration in San Francisco, California, except for claims that may be 
                  brought in small claims court.
                </p>
                <p>
                  <strong>Class Action Waiver:</strong> You agree that any arbitration or legal proceeding 
                  will be limited to the dispute between you and InviteJoy individually.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="mt-12 border-green-200 bg-green-50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-green-900 mb-4">Questions About These Terms?</h2>
                <div className="text-green-800 space-y-2">
                  <p>
                    If you have questions about these Terms of Service, please contact us:
                  </p>
                  <div className="space-y-1">
                    <p><strong>Email:</strong> legal@invitejoy.com</p>
                    <p><strong>Address:</strong> InviteJoy, Inc., 123 Market Street, Suite 456, San Francisco, CA 94105</p>
                    <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Severability Notice */}
            <Card className="mt-8 border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Severability</h3>
                <p className="text-amber-800">
                  If any provision of these terms is found to be unenforceable, that provision will be 
                  limited or eliminated to the minimum extent necessary so that the remaining terms 
                  remain in full force and effect.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Terms;