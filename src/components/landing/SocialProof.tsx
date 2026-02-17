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
        <div className="max-w-2xl mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            <div className="relative pl-16">
              <blockquote className="text-xl font-semibold leading-8 text-foreground">
                <p>
                  “This tool has been an invaluable resource for my research.
                  The AI-powered search has helped me uncover connections I
                  never would have found on my own.”
                </p>
              </blockquote>
              <figcaption className="mt-6">
                <div className="text-base font-semibold text-foreground">
                  - John Doe, Masonic Researcher
                </div>
              </figcaption>
            </div>
            <div className="relative pl-16">
              <blockquote className="text-xl font-semibold leading-8 text-foreground">
                <p>
                  “The AI-powered design tools have been a game-changer for my
                  work. I can now create stunning, one-of-a-kind designs in a
                  fraction of the time.”
                </p>
              </blockquote>
              <figcaption className="mt-6">
                <div className="text-base font-semibold text-foreground">
                  - Jane Doe, Masonic Designer
                </div>
              </figcaption>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
