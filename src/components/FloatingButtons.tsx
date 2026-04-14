import { useState, useEffect } from "react";
import { MessageCircle, Phone, Users, ChevronUp } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

const buttons = [
  { icon: MessageCircle, label: "WhatsApp", color: "bg-green-600 hover:bg-green-700", href: "https://wa.me/919353436373?text=Hello%20Salmara%20Team,%20I%20would%20like%20to%20know%20more%20about%20your%20Ayurvedic%20wellness%20products." },
  { icon: Phone, label: "+91 93 5343 6373", color: "bg-[#5A7A5C] hover:bg-[#4A634C]", href: "tel:+919353436373", isPhone: true },
  { icon: Users, label: "Affiliate", color: "bg-[#C5A059] hover:bg-[#B48F48]", href: "/affiliate" },
];

const FloatingButtons = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed right-4 bottom-6 z-40 flex flex-col gap-3">
      <AnimatePresence>
        {isVisible && (
          <m.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            title="Scroll to Top"
            aria-label="Back to top"
            className="bg-[#1A2E35] text-white p-3 rounded-full shadow-2xl transition-all duration-300 hover:bg-[#5A7A5C] hover:scale-110 group relative flex items-center justify-center border border-white/10"
          >
            <ChevronUp className="h-5 w-5" />
            <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-white text-[#1A2E35] text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none border border-[#F2EDE4] transform translate-x-2 group-hover:translate-x-0">
              Back to Top
            </span>
          </m.button>
        )}
      </AnimatePresence>

      {buttons.map((btn) => {
        return (
          <a
            key={btn.label}
            href={btn.href}
            target={btn.href?.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={`${btn.color} text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group relative flex items-center justify-center`}
            aria-label={btn.label}
          >
            <btn.icon className="h-5 w-5" />
            <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-white text-[#1A2E35] text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none border border-[#F2EDE4] transform translate-x-2 group-hover:translate-x-0">
              {btn.label}
            </span>
          </a>
        );
      })}
    </div>
  );
};

export default FloatingButtons;
