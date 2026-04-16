import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
const AboutSection = lazy(() => import("@/components/AboutSection"));
const WhyChooseUs = lazy(() => import("@/components/WhyChooseUs"));

const FeaturedProducts = lazy(() => import("@/components/FeaturedProducts"));
const ConsultationSection = lazy(() => import("@/components/ConsultationSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const DailyTipsSection = lazy(() => import("@/components/DailyTipsSection"));
const CommunitySection = lazy(() => import("@/components/CommunitySection"));
const Footer = lazy(() => import("@/components/Footer"));
const FloatingButtons = lazy(() => import("@/components/FloatingButtons"));
const SEO = lazy(() => import("@/components/SEO"));

const Index = () => (
  <div className="min-h-screen bg-secondary">
    <Suspense fallback={null}>
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
    </Suspense>
    <Header />
    <main className="overflow-x-hidden">
      <HeroSection />
      <Suspense fallback={<div className="min-h-screen bg-secondary animate-pulse" />}>
        <AboutSection />
        <WhyChooseUs />
        <FeaturedProducts />
        <TestimonialsSection />
        <DailyTipsSection />
        <ConsultationSection />
        <CommunitySection />
      </Suspense>
    </main>
    <Suspense fallback={null}>
      <Footer />
      <FloatingButtons />
    </Suspense>
  </div>
);

export default Index;
