import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Search, Sparkles } from "lucide-react";

const features = [
  {
    icon: <Search className="w-8 h-8" />,
    title: "Intelligent Search",
    description: "Our AI-powered search engine helps you find relevant information from a vast library of Freemasonic texts, symbols, and rituals.",
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "AI-Powered Design",
    description: "Generate unique, high-quality designs for regalia, logos, and other visual assets with our AI-powered design tools.",
  },
  {
    icon: <Lightbulb className="w-8 h-8" />,
    title: "Personalized Insights",
    description: "Our AI analyzes your research and provides personalized insights and recommendations to help you deepen your understanding of Freemasonry.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto">
        <h2 className="mb-12 text-3xl font-bold text-center md:text-4xl">Features</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="flex items-center justify-center mx-auto mb-4 bg-primary text-primary-foreground w-14 h-14 rounded-full">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
