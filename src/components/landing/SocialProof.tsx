import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SocialProof() {
  return (
    <div className="py-24 bg-background sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="max-w-2xl mx-auto lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Trusted by Researchers and Designers Worldwide
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Join a community of like-minded individuals
          </p>
        </div>
        <div className="max-w-2xl mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>“A game-changer for my research.”</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  “This tool has been an invaluable resource for my research.
                  The AI-powered search has helped me uncover connections I
                  never would have found on my own.”
                </p>
                <p className="mt-4 font-semibold text-foreground">
                  - John Doe, Masonic Researcher
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>“Stunning designs in a fraction of the time.”</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  “The AI-powered design tools have been a game-changer for my
                  work. I can now create stunning, one-of-a-kind designs in a
                  fraction of the time.”
                </p>
                <p className="mt-4 font-semibold text-foreground">
                  - Jane Doe, Masonic Designer
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
