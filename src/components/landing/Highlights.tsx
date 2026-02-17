import { Check } from "lucide-react";
import Image from "next/image";

const highlights = [
  { text: "Access a vast library of Freemasonic texts, symbols, and rituals." },
  { text: "Generate unique, high-quality designs for regalia, logos, and other visual assets." },
  { text: "Receive personalized insights and recommendations to deepen your understanding." },
];

export default function Highlights() {
  return (
    <section className="py-20 md:py-32">
      <div className="container grid items-center gap-8 mx-auto md:grid-cols-2">
        <div className="order-2 md:order-1">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Unlock the Secrets of Freemasonry</h2>
          <p className="mb-8 text-muted-foreground">
            Our AI-powered platform provides you with the tools you need to explore, create, and connect with the rich history and symbolism of Freemasonry.
          </p>
          <ul className="space-y-4">
            {highlights.map((highlight, index) => (
              <li key={index} className="flex items-start">
                <Check className="w-6 h-6 mr-3 text-primary" />
                <span>{highlight.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="order-1 md:order-2">
          <Image src="/placeholder.svg" alt="Freemasonry illustration" width={600} height={400} className="rounded-lg" />
        </div>
      </div>
    </section>
  );
}
