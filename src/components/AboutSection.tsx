import { m } from "framer-motion";
import { Image } from "@/components/ui/Image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
const aboutLab = "/images/clinics/about-lab.webp";

const timeline = [
  { 
    year: "1996", 
    label: "Origins", 
    description: "Beginning of the Salmara journey in traditional Ayurvedic healing." 
  },
  { 
    year: "2005", 
    label: "Clinic & Practice Growth", 
    description: "Expanded into structured care and a stronger treatment presence." 
  },
  { 
    year: "2018", 
    label: "Formulation Expansion", 
    description: "Key formulations developed into trusted products for wider access." 
  },
  { 
    year: "2024", 
    label: "PAN India Reach", 
    description: "Salmara expanded its reach beyond local roots across India." 
  },
];

const AboutSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth } = scrollRef.current;
      const totalSlides = timeline.length;
      const slideWidth = scrollWidth / totalSlides;
      const currentSlide = Math.round(scrollLeft / slideWidth);
      if (currentSlide !== activeSlide) {
        setActiveSlide(currentSlide);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current && window.innerWidth < 1024) {
        const nextSlide = (activeSlide + 1) % timeline.length;
        const slideWidth = scrollRef.current.scrollWidth / timeline.length;
        scrollRef.current.scrollTo({
          left: nextSlide * slideWidth,
          behavior: "smooth"
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeSlide]);

  return (
    <section id="about" className="pt-12 pb-6 md:py-8 lg:py-10 xl:py-12 bg-secondary" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 xl:gap-12 items-center mb-6 md:mb-8 lg:mb-10 xl:mb-12">
          {/* Main Image with Badge */}
          <m.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <picture>
                <source
                  media="(max-width: 640px)"
                  srcSet={aboutLab}
                />
                <Image 
                  src={aboutLab} 
                  alt="Salmara Laboratory" 
                  className="w-full aspect-[4/3] object-cover"
                />
              </picture>
            </div>
            {/* 30+ Years Badge */}
            <m.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute bottom-4 right-4 bg-[#5A7A5C] text-white px-6 py-4 rounded-lg shadow-xl"
            >
              <p className="text-base font-sans-clean font-bold tracking-wider">Since 1996</p>
            </m.div>
          </m.div>

          {/* Content */}
          <m.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="mt-8 lg:mt-0"
          >
            <SectionHeading 
              title="A Brand Built on Ayurvedic Roots" 
              eyebrow="OUR HERITAGE" 
              centered={false} 
              animate={false} 
              className="text-center lg:text-left"
              titleClassName="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[42px]"
            />
              
            <p className="text-[#1A2E35]/70 font-body text-[13px] sm:text-base leading-relaxed mb-8 max-w-xl text-justify mx-auto lg:mx-0">
              Salmara has grown through trust built over time. Our products are shaped by a careful approach to Ayurveda, with attention to quality, consistency, and the needs of everyday life.
            </p>
            
            <div className="relative pl-6 py-2 mb-6 md:mb-8 lg:mb-10 xl:mb-12 border-l-4 border-[#C5A059]/60 mx-auto lg:mx-0 max-w-sm lg:max-w-none">
              <p className="text-[#1A2E35]/50 italic font-body text-[13px] sm:text-lg text-center lg:text-left whitespace-nowrap">
                "Trusted Ayurvedic care for everyday life."
              </p>
            </div>

            <div className="flex justify-center lg:justify-start">
              <Link 
                to="/about" 
                className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-[#5A7A5C] text-sm font-sans-clean font-bold text-white hover:bg-[#C5A059] transition-colors duration-300 group shadow-md"
              >
                Discover Our Journey 
                <span className="p-1.5 rounded-full bg-white text-[#5A7A5C] group-hover:text-[#C5A059] transition-colors">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>
          </m.div>
        </div>

        {/* Horizontal Timeline */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-7xl mx-auto mt-12 md:mt-16 lg:mt-20 xl:mt-24"
        >
          {/* Desktop Grid Layout */}
          <div className="hidden lg:grid grid-cols-4 gap-0 relative">
            {/* Absolute Line Layer */}
            <div className="absolute top-[28px] left-[12.5%] right-[12.5%] h-[1px] bg-[#C5A059]/30 -z-0" />
            
            {timeline.map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center relative z-10 px-4">
                <div className="bg-secondary px-6">
                  <p className="font-sans-clean font-bold text-[#5A7A5C] text-4xl mb-3 tracking-tight">{item.year}</p>
                </div>
                <div className="space-y-2 mt-2">
                  <p className="font-sans-clean font-bold text-[#1A2E35] text-sm tracking-[0.12em] uppercase whitespace-nowrap">
                    {item.label}
                  </p>
                  <p className="font-sans-clean text-[#1A2E35]/60 text-sm leading-relaxed max-w-[200px] mx-auto">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Slider Layout */}
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="lg:hidden flex flex-nowrap overflow-x-auto no-scrollbar pb-6 -mx-4 snap-x snap-mandatory"
          >
            {timeline.map((item) => (
              <div key={item.label} className="flex-shrink-0 w-full snap-center px-4">
                <div className="flex flex-col items-center text-center bg-white/40 backdrop-blur-sm p-6 rounded-2xl border border-[#C5A059]/10">
                  <p className="font-display font-bold text-[#5A7A5C] text-3xl mb-2">{item.year}</p>
                  <p className="font-sans-clean font-bold text-[#1A2E35] text-xs tracking-wider uppercase mb-2">
                    {item.label}
                  </p>
                  <p className="font-sans-clean text-[#1A2E35]/60 text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Slider Dots - Mobile Only */}
          <div className="flex lg:hidden justify-center gap-2 mt-2">
            {timeline.map((_, i) => (
              <div 
                key={i}
                className="h-1.5 w-6 rounded-full relative overflow-hidden bg-[#5A7A5C]/10"
              >
                <div 
                  className="absolute inset-0 bg-[#5A7A5C] transition-transform duration-500 ease-out origin-left"
                  style={{ 
                    transform: activeSlide === i ? 'scaleX(1)' : 'scaleX(0.25)',
                    opacity: activeSlide === i ? 1 : 0.2
                  }}
                />
              </div>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
};

export default AboutSection;

