import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageLayout from "@/components/layouts/PageLayout";
import { Link } from "react-router-dom";
import { BookOpen, Download, Video, Users, Calendar, Lightbulb, FileText, Megaphone, Award, Clock } from "lucide-react";

const Resources = () => {
  const featuredGuides = [
    {
      title: "Complete Event Planning Checklist",
      description: "Step-by-step guide to planning successful events, from conception to execution.",
      category: "Planning",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=200&fit=crop",
      badge: "Most Popular"
    },
    {
      title: "RSVP Best Practices Guide",
      description: "Maximize attendance and engagement with proven RSVP strategies.",
      category: "RSVP Management",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=200&fit=crop",
      badge: "New"
    },
    {
      title: "Virtual Event Success Playbook",
      description: "Everything you need to know about hosting engaging virtual events.",
      category: "Virtual Events",
      readTime: "12 min read",
      image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=200&fit=crop",
      badge: "Trending"
    }
  ];

  const resourceCategories = [
    {
      icon: BookOpen,
      title: "Guides & Best Practices",
      description: "Comprehensive guides to master event planning",
      count: 25,
      items: [
        "Event Planning 101",
        "Guest Management Strategies",
        "Budget Planning Templates",
        "Timeline Management"
      ]
    },
    {
      icon: Download,
      title: "Templates & Checklists",
      description: "Ready-to-use templates for your events",
      count: 18,
      items: [
        "Event Planning Checklist",
        "Budget Spreadsheet",
        "Guest List Template",
        "Timeline Templates"
      ]
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step video guides and demos",
      count: 12,
      items: [
        "Platform Walkthrough",
        "Setting Up Your First Event",
        "Advanced Features Demo",
        "Mobile App Tutorial"
      ]
    },
    {
      icon: Users,
      title: "Case Studies",
      description: "Real success stories from event organizers",
      count: 8,
      items: [
        "Corporate Conference (500+ attendees)",
        "Wedding Planning Success",
        "Non-profit Fundraiser",
        "Product Launch Event"
      ]
    }
  ];

  const webinars = [
    {
      title: "Event Marketing Strategies That Work",
      date: "December 15, 2024",
      time: "2:00 PM PST",
      speaker: "Sarah Johnson, Event Marketing Expert",
      attendees: "150+ registered",
      status: "upcoming"
    },
    {
      title: "Maximizing Event ROI",
      date: "December 8, 2024",
      time: "1:00 PM PST",
      speaker: "Michael Chen, Business Strategist",
      attendees: "220+ attended",
      status: "recorded"
    },
    {
      title: "The Future of Hybrid Events",
      date: "November 24, 2024",
      time: "3:00 PM PST",
      speaker: "Emily Rodriguez, Event Technology Specialist",
      attendees: "180+ attended",
      status: "recorded"
    }
  ];

  const tools = [
    {
      title: "Event ROI Calculator",
      description: "Calculate the return on investment for your events",
      icon: Calculator,
      action: "Use Calculator"
    },
    {
      title: "Guest List Builder",
      description: "Build and organize your guest lists efficiently",
      icon: Users,
      action: "Start Building"
    },
    {
      title: "Budget Planner",
      description: "Plan and track your event budget with ease",
      icon: FileText,
      action: "Plan Budget"
    },
    {
      title: "Timeline Generator",
      description: "Create detailed event timelines automatically",
      icon: Calendar,
      action: "Generate Timeline"
    }
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Resources & Learning Center
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Everything you need to plan, execute, and measure successful events. 
            From beginner guides to advanced strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              <BookOpen className="w-5 h-5 mr-2" />
              Browse All Guides
            </Button>
            <Button variant="outline" size="lg" className="border-blue-300 text-blue-600 hover:bg-blue-50 px-8">
              <Video className="w-5 h-5 mr-2" />
              Watch Tutorials
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Guides */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Guides</h2>
            <p className="text-xl text-gray-600">Start with our most popular resources</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredGuides.map((guide, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={guide.image} 
                    alt={guide.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {guide.badge && (
                    <Badge className="absolute top-3 left-3 bg-blue-600 text-white">
                      {guide.badge}
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      {guide.category}
                    </Badge>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {guide.readTime}
                    </span>
                  </div>
                  <CardTitle className="text-lg text-gray-900">{guide.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{guide.description}</p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Read Guide
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600">Find exactly what you're looking for</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {resourceCategories.map((category, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <category.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">{category.title}</CardTitle>
                  <p className="text-gray-600">{category.description}</p>
                  <Badge variant="outline" className="mx-auto mt-2">
                    {category.count} resources
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1 h-1 bg-blue-600 rounded-full mr-2"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
                    View All
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Webinars */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Webinars & Events</h2>
            <p className="text-xl text-gray-600">Learn from industry experts and connect with peers</p>
          </div>
          <div className="max-w-4xl mx-auto space-y-6">
            {webinars.map((webinar, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{webinar.title}</h3>
                        <Badge 
                          className={
                            webinar.status === 'upcoming' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {webinar.status === 'upcoming' ? 'Upcoming' : 'Recorded'}
                        </Badge>
                      </div>
                      <div className="text-gray-600 mb-2">
                        <span className="flex items-center mb-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          {webinar.date} at {webinar.time}
                        </span>
                        <span className="flex items-center mb-1">
                          <Users className="w-4 h-4 mr-2" />
                          {webinar.speaker}
                        </span>
                        <span className="flex items-center">
                          <Award className="w-4 h-4 mr-2" />
                          {webinar.attendees}
                        </span>
                      </div>
                    </div>
                    <Button 
                      className={
                        webinar.status === 'upcoming'
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }
                    >
                      {webinar.status === 'upcoming' ? 'Register' : 'Watch Recording'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
              View All Webinars
            </Button>
          </div>
        </div>
      </section>

      {/* Tools & Calculators */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Free Tools & Calculators</h2>
            <p className="text-xl text-gray-600">Helpful tools to streamline your event planning</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {tools.map((tool, index) => (
              <Card key={index} className="text-center border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <tool.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{tool.description}</p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {tool.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to plan your first event?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Put what you've learned into practice. Start creating amazing events today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Create Your First Event
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                Get Expert Help
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

// Add missing Calculator import
const Calculator = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default Resources;