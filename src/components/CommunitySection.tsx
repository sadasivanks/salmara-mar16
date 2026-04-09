import { motion, useInView } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useRef, useState } from "react";
import { Mail, Sparkles, Loader2, Users, Gift, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const CommunitySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch("/api/user-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.alreadySubscribed) {
          toast.info("You're already part of the Circle! 🌿", {
            description: "We already have your email on our list. Stay tuned for updates!",
          });
        } else {
          toast.success("Welcome to the Circle of Wellness! 🌿", {
            description: "You'll receive Ayurvedic tips, offers, and early product updates.",
          });
        }
        setEmail("");
      } else {
        throw new Error(data.error || "Failed to subscribe.");
      }
    } catch (error: any) {
      toast.error("Subscription failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="community" className="py-6 md:py-8 lg:py-10 xl:py-12 bg-secondary relative overflow-hidden" ref={ref}>
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading 
          title="Grow with Us" 
          eyebrow="SALMARA COMMUNITY" 
          animate={false}
        />

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-10 xl:gap-12 max-w-6xl mx-auto">
          {/* Newsletter Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/40 backdrop-blur-md border border-[#1A2E35]/5 rounded-3xl p-8 md:p-12 flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-2xl font-display font-semibold text-[#1A2E35] mb-4">
                Join the Salmara Circle of Wellness
              </h3>
              <p className="text-[#1A2E35]/70 font-body text-base mb-8 leading-relaxed">
                Receive Ayurvedic tips, offers, and early product updates.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1A2E35]/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your favorite email"
                  required
                  className="w-full bg-white/60 border border-[#1A2E35]/10 rounded-xl pl-11 pr-4 py-4 text-sm font-sans-clean outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full hover:bg-[#1A2E35] bg-herbal-dark text-white py-4 rounded-xl font-sans-clean font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    Subscribe Now <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Affiliate Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-[#1A2E35]/90 text-white rounded-3xl p-8 md:p-12 flex flex-col justify-between shadow-2xl relative overflow-hidden"
          >
            {/* Visual background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-[#C5A059]" />
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4 text-white">
                Share Ayurveda and Earn
              </h3>
              <p className="text-white/70 font-body text-base mb-8 leading-relaxed">
                Join the Salmara Affiliate Program and grow with India's trusted Ayurvedic brand.
              </p>
              
              <ul className="space-y-3 mb-10">
                {[
                  "Generous Commissions",
                  "Verified Support Team",
                  "Early Access to Campaigns"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/80 font-sans-clean">
                    <div className="h-1.5 w-1.5 bg-[#C5A059] rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full py-4 border border-[#C5A059]/30 rounded-xl font-sans-clean font-bold text-xs uppercase tracking-[0.2em] text-[#C5A059] text-center cursor-default">
              Coming Soon
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
