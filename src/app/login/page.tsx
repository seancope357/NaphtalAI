import LandingLayout from "../landing-layout";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Customers from "@/components/landing/Customers";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import Highlights from "@/components/landing/Highlights";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import BottomCTA from "@/components/landing/BottomCTA";
import BottomBanner from "@/components/landing/BottomBanner";
import Footer from "@/components/landing/Footer";

export default function LoginPage() {
  return (
    <LandingLayout>
      <Header />
      <Hero />
      <Customers />
      <Features />
      <Testimonials />
      <Highlights />
      <Pricing />
      <FAQ />
      <BottomCTA />
      <BottomBanner />
      <Footer />
    </LandingLayout>
  );
}
