import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const testimonials = [
  {
    quote: "This tool has been an invaluable resource for my research. The AI-powered search has helped me uncover connections I never would have found on my own.",
    name: "John Doe",
    title: "Masonic Researcher",
    avatar: "/placeholder.svg",
  },
  {
    quote: "The AI-powered design tools have been a game-changer for my work. I can now create stunning, one-of-a-kind designs in a fraction of the time.",
    name: "Jane Doe",
    title: "Masonic Designer",
    avatar: "/placeholder.svg",
  },
  {
    quote: "A must-have tool for any serious student of Freemasonry. The depth of knowledge and the power of the AI are simply astounding.",
    name: "Samuel Smith",
    title: "32° Mason",
    avatar: "/placeholder.svg",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-32 bg-muted">
      <div className="container mx-auto">
        <h2 className="mb-12 text-3xl font-bold text-center md:text-4xl">What Our Users Say</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <p className="italic">“{testimonial.quote}”</p>
                <div className="flex items-center mt-4">
                  <Image src={testimonial.avatar} alt={testimonial.name} width={40} height={40} className="mr-4 rounded-full" />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
