import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "For individuals and small teams just getting started.",
    features: [
      "Basic search functionality",
      "Limited design generation",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    description: "For professionals and teams who need more power and flexibility.",
    features: [
      "Advanced search with AI-powered insights",
      "Unlimited design generation",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with custom needs.",
    features: [
      "All Pro features",
      "Dedicated account manager",
      "On-premise deployment options",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container mx-auto">
        <h2 className="mb-12 text-3xl font-bold text-center md:text-4xl">Pricing</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {tiers.map((tier, index) => (
            <Card key={index} className={tier.name === 'Pro' ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <p className="text-4xl font-bold">{tier.price}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      <Check className="w-6 h-6 mr-3 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">{tier.name === 'Enterprise' ? 'Contact Us' : 'Get Started'}</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
