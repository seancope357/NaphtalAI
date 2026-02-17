import { Lightbulb, Search, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Features() {
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
                  <Search className="w-6 h-6" />
                </div>
                <CardTitle className="mt-4">Intelligent Search</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI-powered search engine helps you find relevant information
                  from a vast library of Freemasonic texts, symbols, and rituals.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary text-primary-foreground">
                  <Sparkles className="w-6 h-6" />
                </div>
                <CardTitle className="mt-4">AI-Powered Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Generate unique, high-quality designs for regalia, logos, and
                  other visual assets with our AI-powered design tools.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary text-primary-foreground">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <CardTitle className="mt-4">Personalized Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI analyzes your research and provides personalized insights
                  and recommendations to help you deepen your understanding of
                  Freemasonry.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
