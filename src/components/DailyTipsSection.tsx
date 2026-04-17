import { m, useInView } from "framer-motion";
import { Image } from "@/components/ui/Image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
const neemImg = "/images/products/neem_dark.webp";
const meditationImg = "/images/lifestyle/meditation_dark.webp";
const skincareImg = "/images/lifestyle/skincare-wellness.webp";

const tips = [
  {
    title: "Caring for the Scalp Naturally",
    snippet: "In Ayurveda, hair health often begins with scalp care. Regular oiling, gentle cleansing, and attention to dryness or heat can help maintain better scalp comfort and stronger looking hair over time. Consistency matters more than doing too much at once.",
    image: neemImg,
  },
  {
    title: "Why Digestion Matters in Ayurveda",
    snippet: "Ayurveda gives great importance to digestion because it is seen as central to overall balance. Eating at regular times, choosing suitable foods, and avoiding excess heaviness can support a more comfortable and steady daily rhythm.",
    image: meditationImg,
  },
  {
    title: "Daily Care for Body Comfort",
    snippet: "Body discomfort is often made worse by strain, routine imbalance, or lack of proper care. In Ayurveda, supportive practices, regular attention, and suitable formulations are often used to help the body feel more at ease over time.",
    image: skincareImg,
  },
];

const DailyTipsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="tips" className="py-6 md:py-8 lg:py-10 xl:py-12 bg-secondary" ref={ref}>
      <div className="container mx-auto px-4">
        <SectionHeading 
          title="Daily Ayurvedic Insights" 
          eyebrow="DAILY WISDOM" 
          animate={false}
          titleClassName="text-[22px] xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl whitespace-nowrap"
        />

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 xl:gap-12 max-w-7xl mx-auto">
          {tips.map((tip, i) => (
            <m.article
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
              <div className="pt-8 px-8 pb-2 flex flex-col items-center text-center">
                <h3 className="font-display font-bold text-[#1A2E35] text-lg lg:text-xl mb-4 leading-tight group-hover:text-[#5A7A5C] transition-colors whitespace-nowrap">
                  {tip.title}
                </h3>
                <p className="text-[#4A5568] font-body text-[13px] md:text-sm leading-relaxed mb-6 text-justify">
                  {tip.snippet}
                </p>
                {/* <div className="flex items-center gap-1.5 text-[#5A7A5C] font-sans-clean text-xs font-bold uppercase tracking-wider group/link">
                  <span>Explore Tip</span>
                  <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                </div> */}
              </div>
            </m.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DailyTipsSection;
