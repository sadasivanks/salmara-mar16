import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import aboutLab from "@/assets/about-lab.jpg";

const timeline = [
  { year: "1997", label: "Origins" },
  { year: "2005", label: "Certification" },
  { year: "2015", label: "Clinics" },
  { year: "2024", label: "Global Reach" },
];

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-24 bg-[#F2EDE4]" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Main Image with Badge */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={aboutLab} 
                alt="Salmara Laboratory" 
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            {/* 27+ Years Badge */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute bottom-4 right-4 bg-[#5A7A5C] text-white px-6 py-4 rounded-lg shadow-xl"
            >
              <p className="text-base font-sans-clean font-bold tracking-wider">27+ Years</p>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-[#C5A059] font-sans-clean text-xs uppercase tracking-[0.3em] mb-4">OUR HERITAGE</p>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-[#1A2E35] mb-8 leading-tight">
              The Salmara Story
            </h2>
            
            <p className="text-[#1A2E35]/70 font-body text-base leading-relaxed mb-8 max-w-xl">
              Founded in Karnataka with a vision to make authentic Ayurveda accessible to 
              every home, Salmara Herbals blends tradition with technology. Our formulations 
              are rooted in ancient wisdom and perfected through modern GMP-certified 
              processes.
            </p>
            
            <div className="relative pl-6 py-2 mb-10 border-l-4 border-[#C5A059]/60">
              <p className="text-[#1A2E35]/50 italic font-body text-lg">
                "We don't just manufacture products — we preserve Ayurveda."
              </p>
            </div>

            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <a 
                href="/about" 
                className="inline-flex items-center gap-2 text-sm font-sans-clean font-bold text-[#5A7A5C] hover:text-[#4a654c] transition-colors group"
              >
                Read More 
                <span className="p-1 rounded-full bg-[#5A7A5C]/10 group-hover:bg-[#5A7A5C] group-hover:text-white transition-all">
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
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Horizontal Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-4xl mx-auto mt-20"
        >
          <div className="flex justify-between items-center gap-4">
            {timeline.map((item, i) => (
              <div key={item.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center text-center">
                  <p className="font-display font-bold text-[#5A7A5C] text-2xl lg:text-3xl mb-1">{item.year}</p>
                  <p className="font-sans-clean text-[#1A2E35]/60 text-xs md:text-sm tracking-wide">{item.label}</p>
                </div>
                
                {/* Connecting Line */}
                {i < timeline.length - 1 && (
                  <div className="flex-1 mx-4 h-[1px] bg-[#C5A059]/30" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;

