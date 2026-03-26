import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import FeaturedProducts from "@/components/FeaturedProducts";
import IngredientHighlights from "@/components/IngredientHighlights";
import ConsultationSection from "@/components/ConsultationSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import DailyTipsSection from "@/components/DailyTipsSection";
import AffiliateSection from "@/components/AffiliateSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import SEO from "@/components/SEO";

const Index = () => (
  <div className="min-h-screen bg-[#FDFBF7]">
    <SEO 
      title="Authentic Ayurvedic Formulations & Wellness"
      description="Discover the power of authentic Ayurveda. Clinically certified, GMP-audited herbal formulations for pain relief, immunity, and holistic healing. Shop Salmara today."
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Salmara Ayurveda",
        "url": "https://salmara.com",
        "logo": "https://salmara.com/salamara_icon.jpg",
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
      <AffiliateSection />
      <NewsletterSection />
    </main>
    <Footer />
    <FloatingButtons />
  </div>
);

export default Index;
