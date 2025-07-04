import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/layouts/PageLayout";
import { Link } from "react-router-dom";
import { Users, Target, Award, Heart, ChevronRight } from "lucide-react";

const About = () => {
  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      description: "Former event planner with 15 years of experience organizing corporate and social events.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b780?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "CTO",
      description: "Tech leader passionate about creating seamless user experiences for event organizers.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Customer Success",
      description: "Dedicated to helping event hosts create memorable experiences for their guests.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Human-Centered Design",
      description: "Every feature is designed with real people in mind, making events more personal and meaningful."
    },
    {
      icon: Users,
      title: "Community First",
      description: "We believe great events bring people together and strengthen communities."
    },
    {
      icon: Target,
      title: "Simplicity",
      description: "Complex event management made simple, so you can focus on what matters most."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We're committed to delivering exceptional experiences for hosts and guests alike."
    }
  ];

  const stats = [
    { number: "50,000+", label: "Events Created" },
    { number: "2M+", label: "Happy Guests" },
    { number: "98%", label: "Customer Satisfaction" },
    { number: "150+", label: "Countries Served" }
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              We're on a mission to make
              <span className="text-blue-600 block">events extraordinary</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Founded by event professionals who understand the challenges of bringing people together, 
              InviteJoy exists to make every celebration, meeting, and gathering truly special.
            </p>
            <div className="flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop" 
                alt="Team collaborating on event planning"
                className="rounded-lg shadow-xl max-w-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Born from the frustration of managing events with outdated tools
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">The Problem We Solve</h3>
                <p className="text-gray-600 mb-6">
                  After years of organizing events using spreadsheets, email chains, and multiple disconnected tools, 
                  our founders knew there had to be a better way. Traditional event management was time-consuming, 
                  error-prone, and took the joy out of bringing people together.
                </p>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Our Solution</h3>
                <p className="text-gray-600">
                  InviteJoy was created to put the human connection back at the center of event planning. 
                  We've built a platform that handles the logistics seamlessly, so you can focus on creating 
                  meaningful experiences for your guests.
                </p>
              </div>
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&h=400&fit=crop" 
                  alt="People planning an event together"
                  className="rounded-lg shadow-lg w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-xl text-gray-600">The principles that guide everything we do</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center border-gray-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600">Passionate professionals dedicated to your success</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center border-gray-200">
                  <CardHeader>
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                    />
                    <CardTitle className="text-xl text-gray-900">{member.name}</CardTitle>
                    <p className="text-blue-600 font-medium">{member.role}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to create something amazing?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of event organizers who have made their celebrations extraordinary with InviteJoy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Get Started Free
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default About;