// HeroSection import should resolve properly after tsconfig cleanup
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import FeaturedProducts from "@/components/FeaturedProducts";
import IngredientHighlights from "@/components/IngredientHighlights";
import ConsultationSection from "@/components/ConsultationSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import DailyTipsSection from "@/components/DailyTipsSection";
import CommunitySection from "@/components/CommunitySection";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import SEO from "@/components/SEO";

const Index = () => (
  <div className="min-h-screen bg-secondary">
    <SEO 
      title="Authentic Ayurvedic Formulations & Wellness"
      description="Discover the power of authentic Ayurveda. Clinically certified, GMP-audited herbal formulations for pain relief, immunity, and holistic healing. Shop Salmara today."
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Salmara Ayurveda",
        "url": "https://salmara.com",
        "logo": "https://salmara.com/salamara_icon.webp",
        "sameAs": [
          "https://www.facebook.com/share/18GfJXco63/?mibextid=wwXIfr",
          "https://www.instagram.com/salmara_ayurveda?igsh=ejhxdHA0NGFoeWNj",
          "https://www.youtube.com/@salmara_ayurveda"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-9353436373",
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": "en"
        }
      }}
    />
    <Header />
    <main className="overflow-x-hidden">
      <HeroSection />
      <AboutSection />
      <WhyChooseUs />
      <FeaturedProducts />
      <IngredientHighlights />
      <TestimonialsSection />
      <DailyTipsSection />
      <ConsultationSection />
      <CommunitySection />
    </main>
    <Footer />
    <FloatingButtons />
  </div>
);

export default Index;
