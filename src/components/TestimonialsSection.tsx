import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Star, BadgeCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Image } from "@/components/ui/Image";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface Testimonial {
  id: string | number;
  name: string;
  message: string;
  rating: number;
  designation?: string;
  image_url?: string;
  status: string;
}

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTestimonials(data || []);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section className="py-6 md:py-8 lg:py-10 xl:py-12 bg-secondary" ref={ref}>
      <div className="container mx-auto px-4 overflow-hidden">
        <SectionHeading 
          title="Real Stories, Real Wellness" 
          eyebrow="TESTIMONIALS" 
          animate={false}
        />

        <div className="relative group/marquee overflow-hidden flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-[#5A7A5C]" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/20">Fetching Wellness Stories...</p>
            </div>
          ) : testimonials.length === 0 ? (
             <p className="text-sm font-display text-[#1A2E35]/40 italic">Coming soon: More heart-led wellness stories.</p>
          ) : (
            <>
            

              <motion.div 
                className="flex gap-6 w-max"
                animate={{
                  x: [0, -1750], // Adjust based on content width
                }}
                transition={{
                  duration: 40,
                  ease: "linear",
                  repeat: Infinity,
                }}
                style={{ x: 0 }}
              >
                {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                  <div
                    key={`${t.id}-${i}`}
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
                        "{t.message}"
                      </p>
                    </div>
                    
                    <div className="flex items-end justify-between mt-auto">
                      <div className="flex items-center gap-3">
                        {t.image_url ? (
                          <Image src={t.image_url} alt="" className="h-10 w-10 rounded-full object-cover border border-[#F2EDE4]" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-[#5A7A5C] flex items-center justify-center text-white text-[10px] font-bold">
                            {t.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-sans-clean font-bold text-[#1A2E35] text-sm">{t.name}</p>
                          <p className="font-sans-clean text-[#1A2E35]/40 text-xs truncate max-w-[120px]">{t.designation || "Verified Customer"}</p>
                        </div>
                      </div>
                      <div className="bg-[#5A7A5C]/10 text-[#5A7A5C] px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0">
                        <BadgeCheck size={12} />
                        <span className="text-[10px] font-sans-clean font-bold uppercase tracking-wider">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
