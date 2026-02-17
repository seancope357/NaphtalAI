import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is this tool?",
    answer: "This is an AI-powered Freemasonic research and design tool that helps you explore, create, and connect with the rich history and symbolism of Freemasonry.",
  },
  {
    question: "How does the AI work?",
    answer: "Our AI uses state-of-the-art machine learning algorithms to analyze vast amounts of data and provide you with personalized insights and recommendations.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take data security very seriously. All your data is encrypted and stored securely in our database.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-32 bg-muted">
      <div className="container mx-auto">
        <h2 className="mb-12 text-3xl font-bold text-center md:text-4xl">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
