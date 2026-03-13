import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, BadgeCheck } from "lucide-react";

const testimonials = [
  { 
    name: "Ravi K.", 
    city: "Mumbai", 
    rating: 5, 
    quote: "The liver detox capsules are truly effective. I feel so much lighter.", 
    tag: "Verified Purchase" 
  },
  { 
    name: "Anita M.", 
    city: "Delhi", 
    rating: 5, 
    quote: "The quality of the herbs is exceptional. I've noticed a significant improvement in my daily energy levels. Fast delivery too!", 
    tag: "Verified Customer" 
  },
  { 
    name: "Suresh P.", 
    city: "Chennai", 
    rating: 4, 
    quote: "Great quality herbal products. Fast delivery and authentic ingredients.", 
    tag: "Verified Purchase" 
  },
  { 
    name: "Meera L.", 
    city: "Hyderabad", 
    rating: 5, 
    quote: "Ashwagandha capsules helped me manage stress beautifully.", 
    tag: "Verified Purchase" 
  },
  { 
    name: "Deepak R.", 
    city: "Pune", 
    rating: 4, 
    quote: "Trusted Ayurvedic brand. My whole family uses these products.", 
    tag: "Verified Customer" 
  },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-white" ref={ref}>
      <div className="container mx-auto px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[#C5A059] font-sans-clean text-xs sm:text-sm uppercase tracking-[0.3em] font-bold mb-4">
            TESTIMONIALS
          </p>
          <h2 className="text-4xl sm:text-5xl font-display font-medium text-[#1A2E35]">
            Real Stories, Real Wellness
          </h2>
        </motion.div>

        <div className="relative group/marquee overflow-hidden">
          {/* Subtle gradient overlays for fade effect */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

          <motion.div 
            className="flex gap-6 w-max"
            animate={{
              x: [0, -1750], // Adjust based on content width (5 cards * 350px gap)
            }}
            transition={{
              duration: 30,
              ease: "linear",
              repeat: Infinity,
            }}
            style={{ x: 0 }}
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={t.name + i}
                className="bg-[#FDFBF7] border border-[#F2EDE4] rounded-xl p-8 w-[300px] sm:w-[350px] flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
              >
                <div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, si) => (
                      <Star
                        key={si}
                        className={`h-4 w-4 ${si < t.rating ? "fill-[#C5A059] text-[#C5A059]" : "text-[#1A2E35]/10"}`}
                      />
                    ))}
                  </div>
                  <p className="text-[#1A2E35]/80 font-body text-sm leading-relaxed mb-8 italic">
                    "{t.quote}"
                  </p>
                </div>
                
                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <p className="font-sans-clean font-bold text-[#1A2E35] text-sm">{t.name}</p>
                    <p className="font-sans-clean text-[#1A2E35]/40 text-xs">{t.city}</p>
                  </div>
                  <div className="bg-[#5A7A5C]/10 text-[#5A7A5C] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <BadgeCheck size={12} />
                    <span className="text-[10px] font-sans-clean font-bold uppercase tracking-wider">
                      {t.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
