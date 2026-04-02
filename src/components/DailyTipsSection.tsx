import { motion, useInView } from "framer-motion";
import { Image } from "@/components/ui/Image";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
const neemImg = "/images/products/neem_dark.jpg";
const meditationImg = "/images/lifestyle/meditation_dark.jpg";
const skincareImg = "/images/lifestyle/skincare-wellness.jpg";

const tips = [
  {
    title: "The Power of Neem",
    snippet: "Discover the natural detoxifying properties of Neem for glowing, healthy skin and natural immunity.",
    image: neemImg,
  },
  {
    title: "Mindful Meditation",
    snippet: "Learn how daily meditation balances Vata, Pitta, and Kapha for lasting mental clarity and peace.",
    image: meditationImg,
  },
  {
    title: "Morning Wellness Rituals",
    snippet: "Easy-to-follow Ayurvedic rituals to kickstart your digestion and energy every single morning.",
    image: skincareImg,
  },
];

const DailyTipsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="tips" className="py-6 md:py-8 lg:py-10 xl:py-12 bg-secondary" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-8 lg:mb-10 xl:mb-12"
        >
          <p className="text-[#C5A059] font-sans-clean text-xs sm:text-sm uppercase tracking-[0.3em] font-bold mb-4">DAILY WISDOM</p>
          <h2 className="text-3xl sm:text-4xl font-display font-medium text-[#1A2E35]">
            Ayurvedic Tips for Vibrant Living
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 xl:gap-12 max-w-6xl mx-auto">
          {tips.map((tip, i) => (
            <motion.article
              key={tip.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group bg-[#FDFBF7] rounded-xl overflow-hidden border border-[#F2EDE4] hover:shadow-xl transition-all duration-500"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <Image 
                  src={tip.image} 
                  alt={tip.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-8">
                <h3 className="font-display font-bold text-[#1A2E35] text-xl mb-4 leading-tight group-hover:text-[#5A7A5C] transition-colors">
                  {tip.title}
                </h3>
                <p className="text-[#4A5568] font-body text-sm leading-relaxed mb-6 line-clamp-2">
                  {tip.snippet}
                </p>
                {/* <div className="flex items-center gap-1.5 text-[#5A7A5C] font-sans-clean text-xs font-bold uppercase tracking-wider group/link">
                  <span>Explore Tip</span>
                  <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                </div> */}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DailyTipsSection;
