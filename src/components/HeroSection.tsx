import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import heroHerbs from "@/assets/hero-ayurveda.jpg";
import heroConsultation from "@/assets/consultation.jpg";
import heroProduct from "@/assets/skincare-wellness.png";

const badges = [
  "GMP\nCERTIFIED",
  "DOCTOR\nFORMULATED",
  "100%\nHERBAL",
  "27\nYEARS OF\nTRUST",
];

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center overflow-hidden bg-[#1A2E35]">
    {/* 3-panel background images */}
    <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-3">
      {/* Panel 1 */}
      <div className="relative overflow-hidden border-r border-white/5">
        <img 
          src={heroHerbs} 
          alt="Ayurvedic herbs" 
          className="absolute inset-0 w-full h-full object-cover grayscale-[20%] brightness-[0.8]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E35]/80 via-[#1A2E35]/20 to-transparent" />
      </div>
      {/* Panel 2 */}
      <div className="relative overflow-hidden border-r border-white/5 hidden md:block">
        <img 
          src={heroConsultation} 
          alt="Consultation" 
          className="absolute inset-0 w-full h-full object-cover grayscale-[10%] brightness-[0.8]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E35]/80 via-[#1A2E35]/20 to-transparent" />
      </div>
      {/* Panel 3 */}
      <div className="relative overflow-hidden hidden md:block">
        <img 
          src={heroProduct} 
          alt="Product experience" 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.85]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E35]/80 via-[#1A2E35]/20 to-transparent" />
      </div>
    </div>

    {/* Global Dark Overlay for consistent text contrast */}
    <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none" />

    {/* Badges Overlay (Outside panels to avoid clipping) */}
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="absolute top-20 right-4 md:right-12 z-20 flex flex-nowrap justify-end gap-3 md:gap-5"
    >
      {badges.map((badge) => (
        <div
          key={badge}
          className="w-16 h-16 md:w-28 md:h-28 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-center p-3"
        >
          <span className="text-[7px] md:text-[10px] font-sans-clean font-bold text-white uppercase tracking-widest leading-tight whitespace-pre-line">
            {badge}
          </span>
        </div>
      ))}
    </motion.div>

    {/* Main Content Overlay */}
    <div className="container mx-auto px-4 relative z-10 pt-20">
      <div className="max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[80px] xl:text-[95px] font-display font-medium text-white leading-tight mb-8 drop-shadow-lg">
            <span className="inline-block whitespace-nowrap">Rooted in Ayurveda.</span>
            <br />
            <span className="italic inline-block whitespace-nowrap">Refined by Science.</span>
          </h1>
          
          <p className="text-white/90 text-lg md:text-2xl font-body leading-relaxed mb-12 max-w-2xl drop-shadow-md">
            From pure herbs to certified formulations – crafted in Karnataka 
            for today's wellness seekers.
          </p>

          <div className="flex flex-wrap gap-6 items-center">
            <Link
              to="/shop"
              className="bg-white text-[#1A2E35] px-10 py-4 font-sans-clean font-bold text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#F2EDE4]"
            >
              Shop Now
            </Link>
            <a 
              href="https://wa.me/919995731915?text=Hello%20Salmara%20Team,%20I%20would%20like%20to%20book%20an%20Ayurvedic%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/60 text-white px-10 py-4 font-sans-clean font-bold text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white/10 hover:border-white block w-fit"
            >
              Book Consultation
            </a>
          </div>
        </motion.div>
      </div>
    </div>

    {/* Scroll indicator */}
    <motion.div
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
    >
      <ChevronDown className="h-8 w-8 text-white/50" />
    </motion.div>
  </section>
);

export default HeroSection;
