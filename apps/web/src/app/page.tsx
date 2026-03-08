import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";

import ComponentsSection from "@/components/ComponentsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import SuggestionForm from "@/components/SuggestionForm";

export default function HomePage() {
  return (
    <>
      <Header />
      <HeroSection />
      <ComponentsSection />
      <CTASection />
      <SuggestionForm />
      <Footer />
    </>
  );
}
