import { Button } from "@/components/ui/button";

export default function BottomCTA() {
  return (
    <section className="py-20 text-center md:py-32">
      <div className="container mx-auto">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to get started?</h2>
        <p className="mb-8 text-lg text-muted-foreground">Join NaphtalAI today and unlock the secrets of Freemasonry.</p>
        <Button size="lg">Start Free Trial</Button>
      </div>
    </section>
  );
}
