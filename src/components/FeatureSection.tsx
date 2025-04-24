
import { Card, CardContent } from "@/components/ui/card";

interface Feature {
  title: string;
  description: string;
}

interface FeatureSectionProps {
  title: string;
  description: string;
  features: Feature[];
  isAlternate?: boolean;
}

const FeatureSection = ({ title, description, features, isAlternate = false }: FeatureSectionProps) => {
  return (
    <section className={`py-16 ${isAlternate ? 'bg-indigo-50' : ''}`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <p className="text-gray-600">{description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
