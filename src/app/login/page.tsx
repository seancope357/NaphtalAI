import LandingLayout from "../landing-layout";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Footer from "@/components/landing/Footer";

export default function LoginPage() {
  return (
    <LandingLayout>
      <Header />
      <Hero />
      <Footer />
    </LandingLayout>
  );
}
