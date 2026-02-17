export default function FAQ() {
  return (
    <div className="py-24 bg-background sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="max-w-2xl mx-auto lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="max-w-2xl mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="space-y-10">
            <div>
              <dt className="text-base font-semibold leading-7 text-foreground">
                What is this tool?
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">
                This is an AI-powered Freemasonic research and design tool that
                helps you explore, create, and connect with the rich history and
                symbolism of Freemasonry.
              </dd>
            </div>
            <div>
              <dt className="text-base font-semibold leading-7 text-foreground">
                How does the AI work?
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">
                Our AI uses state-of-the-art machine learning algorithms to
                analyze vast amounts of data and provide you with personalized
                insights and recommendations.
              </dd>
            </div>
            <div>
              <dt className="text-base font-semibold leading-7 text-foreground">
                Is my data secure?
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">
                Yes, we take data security very seriously. All your data is
                encrypted and stored securely in our database.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
