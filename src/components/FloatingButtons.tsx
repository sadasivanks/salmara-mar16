import { MessageCircle, Phone, Users, MessageSquare } from "lucide-react";

const buttons = [
  { icon: MessageCircle, label: "WhatsApp", color: "bg-green-600 hover:bg-green-700", href: "https://wa.me/919999999999" },
  { icon: Phone, label: "+91 9876543210", color: "bg-[#5A7A5C] hover:bg-[#4A634C]", href: "tel:+919876543210" },
  { icon: Users, label: "Affiliate", color: "bg-[#C5A059] hover:bg-[#B48F48]", href: "#affiliate" },
  { icon: MessageSquare, label: "Feedback", color: "bg-[#8E9196] hover:bg-[#71717A]", href: "#" },
];

const FloatingButtons = () => (
  <div className="fixed right-4 bottom-1/4 z-40 flex flex-col gap-3">
    {buttons.map((btn) => (
      <a
        key={btn.label}
        href={btn.href}
        target={btn.href.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        className={`${btn.color} text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group relative`}
        aria-label={btn.label}
      >
        <btn.icon className="h-5 w-5" />
        <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-card text-foreground text-xs font-sans-clean px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {btn.label}
        </span>
      </a>
    ))}
  </div>
);

export default FloatingButtons;
