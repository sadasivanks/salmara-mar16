import { m, useInView } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useRef, useEffect, useState } from "react";
import { Stethoscope, Calendar, Video, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
  <span ref={ref} className="tabular-nums font-[Inter] font-semibold tracking-tight">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const ConsultationSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="consultation" className="py-6 md:py-8 lg:py-10 xl:py-12 bg-secondary relative overflow-hidden" ref={ref}>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 xl:gap-12 items-center">
          <m.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <SectionHeading 
              title={<>Personalized Ayurvedic <br className="md:hidden" /> Consultation</>} 
              eyebrow="Expert Care" 
              centered={false} 
              animate={false}
              className="mb-6 text-center md:text-left"
              titleClassName="text-[26px] xs:text-3xl"
            />
            <p className="text-[#1A2E35]/70 font-body text-base lg:text-lg leading-relaxed mb-8 text-justify">
              Speak with an Ayurvedic doctor to better understand your concern and receive 
              guidance suited to your needs. Consultations are available online and in 
              person, with recommendations based on an individual focused approach.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: Video, label: "Online Consultation" },
                { icon: MapPin, label: "In-Person Guidance" },
                { icon: Calendar, label: "Flexible Slots" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center mx-auto mb-2">
                    <item.icon className="h-[23px] w-[23px] text-[#C5A059]" />
                  </div>
                  <p className="text-xs font-sans-clean text-[#1A2E35]/70">{item.label}</p>
                </div>
              ))}
            </div>

       <a 
  href="https://wa.me/919353436373?text=Hello%20Salmara%20Team,%20I%20would%20like%20to%20book%20an%20Ayurvedic%20consultation."
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 bg-[#C5A059] hover:bg-[#B48F48] text-white px-12 py-4 rounded-lg font-sans-clean font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-xl shadow-lg"
>
  Book a Consultation
</a>
          </m.div>

          <m.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <div className="bg-white/50 backdrop-blur-sm border border-[#1A2E35]/5 rounded-3xl p-12">
              <img src="/images/doctor.svg" alt="Doctor" className="h-28 w-28 object-contain mx-auto mb-6" />
              <p className="text-5xl sm:text-6xl font-[Inter] font-semibold tracking-tight text-[#1A2E35] mb-2">
                <AnimatedCounter target={15000} suffix="+" />
              </p>
              <p className="text-[#1A2E35]/60 font-sans-clean text-sm">Consultations Completed</p>
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-2xl font-[Inter] font-semibold tracking-tight text-[#C5A059]">
                    <AnimatedCounter target={30} suffix="+" />
                  </p>
                  <p className="text-[#1A2E35]/50 font-sans-clean text-xs">Doctors</p>
                </div>
                <div>
<p className="text-2xl font-[Inter] font-semibold tracking-tight text-[#C5A059]">
                    <AnimatedCounter target={12} />
                  </p>
                  <p className="text-[#1A2E35]/50 font-sans-clean text-xs">Clinic Locations</p>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
};

export default ConsultationSection;
