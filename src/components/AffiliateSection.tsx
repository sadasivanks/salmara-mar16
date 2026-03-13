import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, TrendingUp, Banknote } from "lucide-react";

const AffiliateSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="affiliate" className="py-24 bg-[#5A7A5C]" ref={ref}>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Central Users Icon */}
          <div className="flex justify-center mb-10">
            <Users className="h-16 w-16 text-[#C5A059]" strokeWidth={1.5} />
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium text-white mb-6">
            Share Ayurveda and Earn
          </h2>
          
          <p className="text-white/80 font-body text-base md:text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the Salmara Affiliate Program and grow with India's trusted Ayurvedic brand.
          </p>

          <a
            href="#"
            className="inline-block bg-[#C5A059] hover:bg-[#B48F48] text-white px-12 py-4 rounded-lg font-sans-clean font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-xl shadow-lg"
          >
            Become an Affiliate
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default AffiliateSection;
