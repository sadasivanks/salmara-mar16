import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
const heroHerbs = "/images/lifestyle/hero-ayurveda.webp";
const heroConsultation = "/images/clinics/consultation.webp";
const heroProduct = "/images/lifestyle/skincare-wellness.webp";

const badges = [
  "GMP\nCERTIFIED",
  "DOCTOR\nFORMULATED",
  "100%\nHERBAL",
  "27\nYEARS OF\nTRUST",
];

const slides = [
  {
    type: "image",
    url: heroHerbs
  },
  {
    type: "image",
    url: heroConsultation
  },
  {
    type: "image",
    url: heroProduct
  }
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 8000); // 8 seconds per slide
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative h-[90vh] md:min-h-screen flex items-center overflow-hidden bg-[#1A2E35]">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={slides[currentSlide].url} 
              alt="Salmara Hero" 
              className="w-full h-full object-cover brightness-[0.7]"
              width="1920"
              height="1080"
              loading={currentSlide === 0 ? "eager" : "lazy"}
              {...({ fetchpriority: currentSlide === 0 ? "high" : "auto" } as any)}
              decoding="async"
            />
            {/* Global Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E35]/90 via-[#1A2E35]/40 to-transparent" />
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Badges Overlay */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute top-6 md:top-24 inset-x-0 md:inset-x-auto md:right-12 z-20 flex flex-nowrap justify-center md:justify-end gap-2 md:gap-5 overflow-x-auto no-scrollbar pb-2 px-4 md:px-0"
      >
        {badges.map((badge) => (
          <div
            key={badge}
            className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-28 md:h-28 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-center p-2 md:p-3"
          >
            <span className="text-[5px] sm:text-[7px] md:text-[10px] font-sans-clean font-bold text-white uppercase tracking-widest leading-tight whitespace-pre-line">
              {badge}
            </span>
          </div>
        ))}
      </motion.div>
 
      {/* Main Content Overlay */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl lg:pr-32 xl:pr-48">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-center md:text-left"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[72px] xl:text-[84px] font-display font-medium text-white leading-[1.2] md:leading-tight mb-6 md:mb-8 lg:mb-10 xl:mb-12 drop-shadow-2xl">
              <span className="inline-block">Rooted in Ayurveda.</span>
              <br />
              <span className="italic inline-block text-[#C5A059]">Refined by Science.</span>
            </h1>
            
            <p className="text-white/90 text-sm sm:text-lg md:text-2xl font-body leading-relaxed mb-6 md:mb-8 lg:mb-10 xl:mb-12 max-w-sm sm:max-w-xl md:max-w-2xl mx-auto md:mx-0 drop-shadow-lg">
              Unlock the power of ancestral formulations with modern quality standards. 
              Pure ingredients, proven results.
            </p>
 
            <div className="flex flex-col sm:flex-row gap-6 md:gap-8 lg:gap-10 xl:gap-12 items-center md:items-start">
         <Link
  to="/shop"
  className="w-full sm:w-auto 
  bg-white text-[#1A2E35] 

  hover:bg-[#5A7A5C] 
  hover:text-white 

  active:bg-[#4A634B] 
  active:text-white 

  px-10 py-4 sm:py-5 
  rounded-lg 
  font-sans-clean font-bold text-xs sm:text-sm 
  tracking-[0.2em] uppercase 

  transition-all duration-300 
  transform hover:scale-105 active:scale-95 

  shadow-xl shadow-black/20 
  text-center"
>
  Shop Now
</Link>
           <a 
  href="https://wa.me/919353436373?text=Hello%20Salmara%20Team,%20I%20would%20like%20to%20know%20more%20about%20your%20Ayurvedic%20wellness%20products."
  target="_blank"
  rel="noopener noreferrer"
  className="group w-full sm:w-auto 
  border border-white/60 text-white 

  px-10 py-4 sm:py-5 
  rounded-xl sm:rounded-2xl   /* 👈 curve added */

  font-sans-clean font-bold text-xs sm:text-sm tracking-[0.2em] uppercase 

  transition-all duration-300 
  hover:bg-white hover:text-[#1A2E35] 
  transform hover:scale-105 active:scale-95 

  block shadow-xl text-center"
>
  <span className="flex items-center justify-center gap-2">
    Book Consultation
  </span>
</a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {/* <div className="absolute bottom-12 right-4 md:right-12 z-20 flex gap-4">
        <button
          onClick={prevSlide}
          className="p-3 rounded-full border border-white/20 bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-[#1A2E35] transition-all duration-300 group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 group-hover:scale-110" />
        </button>
        <button
          onClick={nextSlide}
          className="p-3 rounded-full border border-white/20 bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-[#1A2E35] transition-all duration-300 group"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 group-hover:scale-110" />
        </button>
      </div> */}

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
};

export default HeroSection;
