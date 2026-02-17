import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Benefits from "@/components/landing/Benefits";
import SocialProof from "@/components/landing/SocialProof";
import UseCases from "@/components/landing/UseCases";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import Divider from "@/components/landing/Divider";

export default function Login() {
  return (
    <>
      <Hero />
      <Divider />
      <Features />
      <Divider />
      <Benefits />
      <Divider />
      <SocialProof />
      <Divider />
      <UseCases />
      <Divider />
      <FAQ />
      <Divider />
      <Footer />
    </>
  );
}
