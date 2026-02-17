export default function UseCases() {
  return (
    <div className="py-24 bg-background sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="max-w-2xl mx-auto lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            How It Works
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Explore, create, and connect
          </p>
        </div>
        <div className="max-w-2xl mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-foreground">
                For Researchers
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">
                Our AI-powered search engine helps you find relevant information
                from a vast library of Freemasonic texts, symbols, and rituals.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-foreground">
                For Designers
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">
                Generate unique, high-quality designs for regalia, logos, and
                other visual assets with our AI-powered design tools.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
