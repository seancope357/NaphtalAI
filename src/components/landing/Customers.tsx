import Image from "next/image";

const customers = [
  { src: "/placeholder.svg", alt: "Placeholder" },
  { src: "/placeholder.svg", alt: "Placeholder" },
  { src: "/placeholder.svg", alt: "Placeholder" },
  { src: "/placeholder.svg", alt: "Placeholder" },
  { src: "/placeholder.svg", alt: "Placeholder" },
];

export default function Customers() {
  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto">
        <h2 className="mb-8 text-2xl font-bold text-center text-foreground">Trusted by</h2>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {customers.map((customer, index) => (
            <Image key={index} src={customer.src} alt={customer.alt} width={120} height={40} />
          ))}
        </div>
      </div>
    </section>
  );
}
