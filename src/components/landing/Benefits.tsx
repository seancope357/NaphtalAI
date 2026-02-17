import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Benefits() {
  return (
    <div className="py-24 bg-background sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="max-w-2xl mx-auto lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Unlock Your Potential
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to dive deep into Freemasonry
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our AI-powered tools help you explore, create, and connect with the
            rich history and symbolism of Freemasonry.
          </p>
        </div>
        <div className="max-w-2xl mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary text-primary-foreground">
                  <Check className="w-6 h-6" />
                </div>
                <CardTitle className="mt-4">Streamline Your Research</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Save time and effort with our AI-powered research tools.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary text-primary-foreground">
                  <Check className="w-6 h-6" />
                </div>
                <CardTitle className="mt-4">Generate Unique Designs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create stunning, one-of-a-kind designs with our AI-powered
                  design tools.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary text-primary-foreground">
                  <Check className="w-6 h-6" />
                </div>
                <CardTitle className="mt-4">Access a Vast Knowledge Base</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Explore a vast library of Freemasonic texts, symbols, and
                  rituals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
