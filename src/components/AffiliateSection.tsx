import { motion, useInView } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useRef } from "react";
import { Users, TrendingUp, Banknote } from "lucide-react";

const AffiliateSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="affiliate" className="py-6 md:py-8 lg:py-10 xl:py-12 bg-secondary" ref={ref}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Central Users Icon */}
          <div className="flex justify-center mb-6 md:mb-8 lg:mb-10 xl:mb-12">
            <Users className="h-16 w-16 text-[#C5A059]" strokeWidth={1.5} />
          </div>

          <SectionHeading 
            title="Share Ayurveda and Earn" 
            animate={false} 
          />
          
          <p className="text-[#1A2E35]/80 font-body text-base md:text-lg mb-6 md:mb-8 lg:mb-10 xl:mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the Salmara Affiliate Program and grow with India's trusted Ayurvedic brand.
          </p>

          <a
            href="#"
            className="inline-block bg-[#C5A059] hover:bg-[#B48F48] text-white px-12 py-4 rounded-lg font-sans-clean font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-xl shadow-lg"
          >
            Become an Affiliate
          </a>
        </div>
      </div>
    </section>
  );
};

export default AffiliateSection;
