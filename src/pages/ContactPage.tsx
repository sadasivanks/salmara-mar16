import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { m, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  MessageSquare, 
  Users, 
  MapPin, 
  Send, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  Clock,
  Phone,
  ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { siteConfig } from "@/config/site.config";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ContactPage = () => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [activeRoute, setActiveRoute] = useState<'support' | 'clinic' | 'affiliate'>('support');
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    category: "",
    message: ""
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    
    try {
      const response = await fetch('/api/contact_us', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone_number: formData.phone,
          category: formData.category,
          user_text: formData.message
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      setFormState('success');
      toast.success("Message sent successfully!", {
        description: "We've received your inquiry and will get back to you soon.",
        className: "font-sans-clean",
      });
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        category: "",
        message: ""
      });
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      setFormState('error');
      toast.error("Failed to send message", {
        description: error.message || "An unexpected error occurred. Please try again later.",
        className: "font-sans-clean",
      });
    }
  };
  const faqs = [
    { q: "Where is my order?", a: "You can track it under My Account → Orders or use the Track Order link in the header." },
    { q: "Can I book a doctor consultation online?", a: "Yes, through our Book Appointment page using real-time slot selection." },
    { q: "How long will my order take to arrive?", a: "Orders are usually delivered within 335 business days." },
    { q: "Do you ship internationally?", a: " Currently, we ship across India. International orders" },
  ]
  const contactRoutes = [
    {
      id: 'support' as const,
      title: "Product Support",
      desc: "For inquiries about orders, ingredients, or general wellness advice.",
      icon: <MessageSquare className="h-6 w-6" />,
      color: "bg-[#5A7A5C]/5 text-[#5A7A5C]"
    },
    {
      id: 'clinic' as const,
      title: "Clinic Services",
      desc: "For appointment inquiries, treatment details, or medical reports.",
      icon: <MapPin className="h-6 w-6" />,
      color: "bg-[#C5A059]/5 text-[#C5A059]"
    },
    {
      id: 'affiliate' as const,
      title: "Brand & Affiliate",
      desc: "For partnerships, retail inquiries, or wholesale collaborations.",
      icon: <Users className="h-6 w-6" />,
      color: "bg-[#1A2E35]/5 text-[#1A2E35]"
    }
  ];

  return (
    <div className="min-h-screen bg-secondary">
      <SEO 
        title="Get in Touch | Ayurvedic Consultation & Support" 
        description="Connecting with Salmara is the first step in your wellness journey. Contact us for product inquiries, clinic appointments, or business partnerships."
      />
      <Header />
      
      <main>
        {/* HERO SECTION */}
        <section className="relative py-6 md:py-8 lg:py-10 xl:py-12 overflow-hidden">
          <div className="absolute inset-0 bg-white">

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/80 to-secondary" />
          </div>
          
          <div className="container mx-auto px-6 md:px-4 text-center relative z-10">
            <m.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-[26px] sm:text-4xl md:text-6xl font-display font-medium text-[#1A2E35] mb-4 tracking-tight leading-tight px-2">
                Connect With <span className="italic font-normal">Salmara Ayurveda</span>
              </h1>
              <p className="text-xs sm:text-base md:text-lg text-[#1A2E35]/60 font-sans-clean max-w-xl mx-auto leading-relaxed px-4">
                Have a question, feedback, or collaboration idea? We'd love to hear from you.
              </p>
            </m.div>
          </div>
        </section>

        {/* QUICK CONTACT OPTIONS */}
        <section className="py-6 md:py-8 lg:py-10 xl:py-12 container mx-auto px-6 md:px-4">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 xl:gap-12 max-w-6xl mx-auto items-stretch">
            {/* General Enquiries Card */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-2 border-[#1A2E35]/5 rounded-[2.5rem] p-6 sm:p-10 pt-16 text-center relative group hover:shadow-2xl hover:shadow-[#1A2E35]/10 hover:-translate-y-1 transition-all duration-500 flex flex-col h-full"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 sm:h-16 sm:w-16 bg-herbal-dark rounded-full flex items-center justify-center text-white shadow-xl z-20 group-hover:scale-110 transition-transform duration-500">
                <MessageSquare className="h-5 w-5 sm:h-7 sm:w-7" />
              </div>

              
              <h2 className="text-2xl font-display font-bold text-[#1A2E35] mb-4">General Enquiries</h2>
              <p className="text-sm text-[#1A2E35]/50 leading-relaxed font-sans-clean px-2 mb-8">
                For questions about products, orders, or website support.
              </p>
              
              <div className="mt-auto pt-8 border-t border-[#F2EDE4] space-y-4">
                <p className="text-[10px] font-bold text-[#1A2E35]/40 uppercase tracking-[0.2em]">Primary Email</p>
                <a 
                  href={`mailto:${siteConfig.contact.email}`} 
                  className="bg-primary text-white py-4 px-2 sm:px-4 rounded-2xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-[0.2em] flex items-center justify-center gap-1 sm:gap-2 hover:bg-herbal-dark transition-all shadow-lg shadow-primary/10 break-all sm:break-normal"
                >
                  {siteConfig.contact.email}
                </a>
              </div>
            </m.div>

            {/* Clinic & Consultations Card */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border-2 border-[#1A2E35]/5 rounded-[2.5rem] p-10 pt-16 text-center relative group hover:shadow-2xl hover:shadow-[#1A2E35]/10 hover:-translate-y-1 transition-all duration-500 flex flex-col h-full"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 sm:h-16 sm:w-16 bg-herbal-dark rounded-full flex items-center justify-center text-white shadow-xl z-20 group-hover:scale-110 transition-transform duration-500">
                <MapPin className="h-5 w-5 sm:h-7 sm:w-7" />
              </div>
              

              <h2 className="text-2xl font-display font-bold text-[#1A2E35] mb-4">Clinic & Consultations</h2>
              <p className="text-sm text-[#1A2E35]/50 leading-relaxed font-sans-clean px-2 mb-8">
                For appointments, doctor availability, or treatment info.
              </p>
              
              <div className="mt-auto pt-8 border-t border-[#F2EDE4] space-y-4">
              <p className="text-[10px] font-bold text-[#1A2E35]/40 uppercase tracking-[0.2em]">
                Secure Booking
              </p>

              <a 
                href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Hello%20Salmara%20Team,%20I%20would%20like%20to%20book%20an%20Ayurvedic%20consultation.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white py-4 px-2 sm:px-4 rounded-2xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-[0.2em] flex items-center justify-center gap-1 sm:gap-2 hover:bg-herbal-dark transition-all shadow-lg shadow-primary/10 break-all sm:break-normal"
              >
                Book Appointment <ArrowRight className="h-3 w-3" />
              </a>
            </div>
            </m.div>

            {/* Affiliate & Partnerships Card */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border-2 border-[#1A2E35]/5 rounded-[2.5rem] p-10 pt-16 text-center relative group hover:shadow-2xl hover:shadow-[#1A2E35]/10 hover:-translate-y-1 transition-all duration-500 flex flex-col h-full"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 sm:h-16 sm:w-16 bg-herbal-dark rounded-full flex items-center justify-center text-white shadow-xl z-20 group-hover:scale-110 transition-transform duration-500">
                <Users className="h-5 w-5 sm:h-7 sm:w-7" />
              </div>
  

              <h2 className="text-2xl font-display font-bold text-[#1A2E35] mb-4">Affiliate & Partnerships</h2>
              <p className="text-sm text-[#1A2E35]/50 leading-relaxed font-sans-clean px-2 mb-8">
                For collaborations, commissions, or marketing tie-ups.
              </p>
              
             <div className="mt-auto pt-8 border-t border-[#F2EDE4] space-y-4">
              <p className="text-[10px] font-bold text-[#1A2E35]/40 uppercase tracking-[0.2em]">
                Join Network
              </p>

              <Link 
                to="/affiliate"
                className="bg-primary text-white py-4 px-2 sm:px-4 rounded-2xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-[0.2em] flex items-center justify-center gap-1 sm:gap-2 hover:bg-herbal-dark transition-all shadow-lg shadow-primary/10 break-all sm:break-normal"
              >
                Join the Program <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            </m.div>
          </div>
        </section>

        {/* COMMUNICATION HUB SECTION */}
        <section className="py-6 md:py-8 lg:py-10 xl:py-12 bg-white">
          <div className="container mx-auto px-6 md:px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 xl:gap-12 items-start">
              
              {/* DETAILS SIDE */}
              <div className="space-y-12">
                <SectionHeading 
                  title="Our Communication Hub"
                  description="For us, Ayurveda is a dialogue. We've dedicated teams for each touchpoint to ensure your inquiry reaches the right hands instantly."
                  centered={false}
                  animate={false}
                />
                
                <div className="space-y-2 md:space-y-4 lg:space-y-6 xl:space-y-8">
                  <div className="flex gap-6 items-start">
                    <div className="h-12 w-12 bg-white rounded-2xl border border-[#F2EDE4] flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1.5">Doctor's Insight</h3>
                      <p className="text-[#1A2E35] font-sans-clean font-medium">{siteConfig.contact.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-6 items-start">
                    <div className="h-12 w-12 bg-white rounded-2xl border border-[#F2EDE4] flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 mb-1">Clinic Concierge</p>
                      <p className="text-[#1A2E35] font-sans-clean font-medium">{siteConfig.contact.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-6 items-start">
                    <div className="h-12 w-12 bg-white rounded-2xl border border-[#F2EDE4] flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-blue-500/50" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 mb-1">Response Time</p>
                      <p className="text-[#1A2E35] font-sans-clean font-medium">Within 24 Business Hours</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="p-8 rounded-3xl bg-white border border-[#F2EDE4] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Send className="h-20 w-20 rotate-12" />
                    </div>
                    <h3 className="font-display font-medium text-[#1A2E35] mb-2">Need a faster response?</h3>
                    <p className="text-xs text-[#1A2E35]/50 leading-relaxed mb-6 font-sans-clean">Chat with our experts on WhatsApp for immediate product guidance.</p>
                    <a 
                      href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Hello%20Salmara%20Team,%20I%20would%20like%20to%20know%20more%20about%20your%20Ayurvedic%20wellness%20products.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-1 transition-transform"
                    >
                      Open WhatsApp <ChevronRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* FORM SIDE */}
              <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-[#F2EDE4] shadow-2xl shadow-[#1A2E35]/5 relative">
                <AnimatePresence mode="wait">
                  {formState === 'success' ? (
                    <m.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-12 text-center"
                    >
                      <div className="h-20 w-20 bg-primary rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-primary/20">
                        <CheckCircle2 className="h-10 w-10" />
                      </div>
                      <h2 className="text-2xl font-display font-medium text-[#1A2E35] mb-4">Message Transmitted</h2>
                      <p className="text-sm text-[#1A2E35]/60 font-sans-clean max-w-xs mx-auto mb-10">We've received your inquiry. A Salmara representative will be in touch shortly.</p>
                      <button 
                        onClick={() => setFormState('idle')}
                        className="text-xs font-bold text-primary uppercase tracking-widest underline underline-offset-8"
                      >
                        Send another message
                      </button>
                    </m.div>
                  ) : (
                    <m.form 
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-8"
                    >
                      <div className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="fullName" className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 ml-1">Full Name</label>
                            <input 
                              id="fullName"
                              type="text" 
                              required
                              aria-required="true"
                              placeholder="e.g. Advait Sharma"
                              value={formData.fullName}
                              onChange={handleChange}
                              className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#F2EDE4] rounded-2xl text-sm font-sans-clean focus:outline-none focus:border-primary transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 ml-1">Email Address</label>
                            <input 
                              id="email"
                              type="email" 
                              required
                              aria-required="true"
                              placeholder="name@example.com"
                              value={formData.email}
                              onChange={handleChange}
                              className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#F2EDE4] rounded-2xl text-sm font-sans-clean focus:outline-none focus:border-primary transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 ml-1">Phone Number</label>
                            <input 
                              id="phone"
                              type="tel" 
                              required
                              aria-required="true"
                              placeholder="e.g. +91 99999 99999"
                              value={formData.phone}
                              onChange={handleChange}
                              className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#F2EDE4] rounded-2xl text-sm font-sans-clean focus:outline-none focus:border-primary transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="category" className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 ml-1">Category of Query</label>
                            <select 
                              id="category"
                              required
                              aria-required="true"
                              value={formData.category}
                              onChange={handleChange}
                              className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#F2EDE4] rounded-2xl text-sm font-sans-clean focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                            >
                              <option value="" disabled>Select Category</option>
                              <option value="product">Product Inquiry</option>
                              <option value="order">Order/Shipping</option>
                              <option value="clinic">Consultation / Clinic</option>
                              <option value="partnership">Affiliate / Business Partnership</option>
                              <option value="feedback">Feedback / Suggestion</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 ml-1">How can we help?</label>
                          <textarea 
                            id="message"
                            required
                            aria-required="true"
                            rows={5}
                            placeholder="Tell us about your inquiry..."
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#F2EDE4] rounded-2xl text-sm font-sans-clean focus:outline-none focus:border-primary transition-colors resize-none"
                          />
                        </div>

                        <div className="flex items-start gap-3 px-1 pt-2">
                          <input type="checkbox" className="mt-1 accent-primary" id="privacy" required />
                          <label htmlFor="privacy" className="text-[10px] text-black font-sans-clean leading-relaxed cursor-pointer">
                            I agree to Salmara's Privacy Policy and consent to being contacted regarding my inquiry.
                          </label>
                        </div>
                      </div>

                      <button 
                        disabled={formState === 'submitting'}
                        className="w-full bg-herbal-dark text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-herbal-dark/90 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-herbal-dark/20 disabled:opacity-50"
                      >
                        {formState === 'submitting' ? (
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>Send Message <Send className="h-3 w-3" /></>
                        )}
                      </button>
                    </m.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* CLINIC HIGHLIGHTS */}
        <section className="py-2 md:py-4 xl:py-6 bg-white relative">
          <div className="container mx-auto px-6 md:px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-left md:items-center">
                  <SectionHeading 
                    title="Visit Our Sanctuary"
                    description="Experience Ayurvedic wisdom in person. Our certified clinics offer personalized consultations and a full range of standardized treatments."
                    centered={false}
                    animate={false}
                  />
                <Link
                  to="/clinics"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 hover:border-primary transition-all"
                >
                  Explore All Clinics <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
           <section className="py-6 md:py-8 lg:py-10 xl:py-12 bg-white relative">
                  <div className="container px-4">
                    <div className="max-w-3xl mx-auto">
                      <SectionHeading 
                        title="Common Questions"
                        description="Everything you need to know about starting your order."
                        animate={false}
                      />
        
                      <div className="space-y-4">
                        {faqs.map((faq, i) => (
                          <div key={i} className="border border-[#F2EDE4] rounded-2xl overflow-hidden bg-white">
                            <button
                              onClick={() => setOpenFaq(openFaq === i ? null : i)}
                              className="w-full px-6 py-3 flex items-center justify-between text-left bg-secondary transition-colors"
                            >
                              <span className="font-display font-medium text-[#1A2E35]">{faq.q}</span>
                              <ChevronDown className={`h-5 w-5 text-primary transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {openFaq === i && (
                                <m.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 pb-3 text-sm text-[#1A2E35]/70 font-sans-clean leading-relaxed border-t border-[#F2EDE4]/50 bg-secondary">
                                    {faq.a}
                                  </div>
                                </m.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
