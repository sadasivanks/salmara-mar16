import { m, useInView } from "framer-motion";
import { Image } from "@/components/ui/Image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useRef } from "react";
const tulsi = "/images/products/tulsi_dark.webp";
const guggul = "/images/products/guggul_dark.webp";
const triphala = "/images/products/triphala_dark.webp";
const ashwagandha = "/images/products/ashwagandha_dark.webp";

const ingredients = [
  {
    name: "Tulsi",
    benefit: "Strengthens Immunity",
    image: tulsi,
  },
  {
    name: "Guggul",
    benefit: "Supports joint flexibility",
    image: guggul,
  },
  {
    name: "Triphala",
    benefit: "Enhances digestion",
    image: triphala,
  },
  {
    name: "Ashwagandha",
    benefit: "Reduces stress and improves vitality",
    image: ashwagandha,
  },
];

const IngredientHighlights = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-6 md:py-8 lg:py-10 xl:py-12 bg-secondary" ref={ref}>
      <div className="container mx-auto px-4">
        <SectionHeading 
          title="The Science of Nature" 
          eyebrow="Pure Ingredients" 
          animate={false}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 xl:gap-12 max-w-6xl mx-auto">
          {ingredients.map((item, i) => (
            <m.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="relative mb-6">
                {/* Circular Image Container */}
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full overflow-hidden border border-[#C5A059]/40 shadow-sm transition-all duration-500 group-hover:border-[#C5A059] group-hover:shadow-md">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>

              <h3 className="font-display font-medium text-[#1A2E35] text-xl mb-1">
                {item.name}
              </h3>
              <p className="text-[#1A2E35]/60 text-sm font-body leading-relaxed max-w-[180px]">
                {item.benefit}
              </p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IngredientHighlights;
