import { Check } from "lucide-react";

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
        <div className="max-w-2xl mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-foreground">
                <div className="absolute top-0 left-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                  <Check className="w-6 h-6 text-white" />
                </div>
                Streamline Your Research
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">
                Save time and effort with our AI-powered research tools.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-foreground">
                <div className="absolute top-0 left-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                  <Check className="w-6 h-6 text-white" />
                </div>
                Generate Unique Designs
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">
                Create stunning, one-of-a-kind designs with our AI-powered
                design tools.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-foreground">
                <div className="absolute top-0 left-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                  <Check className="w-6 h-6 text-white" />
                </div>
                Access a Vast Knowledge Base
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">
                Explore a vast library of Freemasonic texts, symbols, and
                rituals.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
