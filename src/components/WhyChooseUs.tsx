import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, Stethoscope, ThumbsUp, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Leaf,
    title: "Certified Herbs",
    desc: "Sourced ethically, lab tested for purity and potency.",
  },
  {
    icon: Stethoscope,
    title: "Expert Doctors",
    desc: "Led by experienced Ayurvedic practitioners with decades of trust.",
  },
  {
    icon: ThumbsUp,
    title: "Proven Results",
    desc: "Thousands of satisfied clients across India and beyond.",
  },
];

const WhyChooseUs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[#C5A059] font-sans-clean text-xs sm:text-sm uppercase tracking-[0.3em] font-bold mb-4">WHY SALMARA</p>
          <h2 className="text-3xl sm:text-4xl font-display font-medium text-[#1A2E35]">
            Why Choose Us
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-[#FDFBF7] border border-[#F2EDE4] p-10 rounded-xl text-center shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-white border border-[#F2EDE4] flex items-center justify-center mx-auto mb-8 shadow-sm">
                <feature.icon className="h-6 w-6 text-[#5A7A5C]" />
              </div>
              <h3 className="font-display text-[22px] font-semibold text-[#1A2E35] mb-4">{feature.title}</h3>
              <p className="text-[#4A5568] font-body text-sm leading-relaxed max-w-[240px] mx-auto">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-16"
        >
          <a 
            href="https://wa.me/919995731915?text=Hello%20Salmara%20Team,%20I%20would%20like%20to%20book%20an%20Ayurvedic%20consultation."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#5A7A5C] hover:bg-[#4A634B] text-white px-10 py-4 rounded-lg shadow-lg font-sans-clean font-bold text-sm transition-all duration-300 transform hover:-translate-y-1 block w-fit"
          >
            Book Appointment
          </a>
          <Link
            to="/shop"
            className="border-2 border-[#5A7A5C]/20 hover:border-[#5A7A5C] text-[#5A7A5C] px-10 py-4 rounded-lg font-sans-clean font-bold text-sm transition-all duration-300"
          >
            Shop Now
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
