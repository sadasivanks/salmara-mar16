import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Clock, 
  Video, 
  UserCheck, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Minus,
  Navigation,
  Calendar,
  Stethoscope,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

const ClinicsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [treatmentFilter, setTreatmentFilter] = useState("All");
  const [consultType, setConsultType] = useState("All");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const clinics = [
    {
      id: 1,
      name: "Salmara Wellness Center - Indiranagar",
      address: "123, 100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038",
      hours: "Mon - Sat: 09:00 AM - 08:00 PM",
      availability: "Next available: Tomorrow, 10:00 AM",
      city: "Bengaluru",
      type: "In-Person",
      specialties: ["Pain Relief", "Liver Detox"]
    },
    {
      id: 2,
      name: "Salmara Ayurveda Hub - Jayanagar",
      address: "45, 4th Block, Jayanagar, Bengaluru, Karnataka 560011",
      hours: "Mon - Sun: 10:00 AM - 07:00 PM",
      availability: "Next available: Today, 04:30 PM",
      city: "Bengaluru",
      type: "In-Person",
      specialties: ["Women's Wellness", "Digestion"]
    },
    {
      id: 3,
      name: "Salmara Virtual Clinic - India Metro",
      address: "Online / Video Consultation",
      hours: "Mon - Sat: 08:00 AM - 09:00 PM",
      availability: "Next available: Tomorrow, 09:00 AM",
      city: "Digital",
      type: "Virtual",
      specialties: ["Immunity", "Skin Care", "Stress Management"]
    }
  ];

  const treatments = [
    { 
      title: "Pain & Mobility", 
      desc: "Comprehensive Ayurvedic management for joint health, muscle recovery, and chronic musculoskeletal conditions.",
      icon: <Plus className="h-6 w-6" />
    },
    { 
      title: "Gut & Digestive Health", 
      desc: "Personalized protocols to balance Agni (digestive fire), resolve bloating, and restore gut microbiome health.",
      icon: <ChevronRight className="h-6 w-6" />
    },
    { 
      title: "Liver & Detox", 
      desc: "Scientific detoxification based on classical Panchakarma principles to rejuvenate hepatic function.",
      icon: <CheckCircle2 className="h-6 w-6" />
    },
    { 
      title: "Women's Wellness", 
      desc: "Nurturing care for hormonal balance, menstrual health, and holistic vitality across every life stage.",
      icon: <UserCheck className="h-6 w-6" />
    },
    { 
      title: "Immunity & Respiratory Health", 
      desc: "Evidence-backed herbal interventions to strengthen the immune response and optimize lung capacity.",
      icon: <ArrowRight className="h-6 w-6" />
    }
  ];

  const faqs = [
    { q: "How long is each consultation?", a: "Initial consultations typically last 45-60 minutes to allow for a comprehensive Prakriti (constitution) analysis and health history review. Follow-ups are generally 20-30 minutes." },
    { q: "Can I book online and visit in person?", a: "Yes, our integrated platform allows you to select your preferred clinic, book your slot online, and visit our physical location for your consultation." },
    { q: "Is my booking confirmed immediately?", a: "Absolutely. Once you complete the 5-step booking process, you will receive an instant confirmation via email and SMS with all relevant details." },
    { q: "What if I need to reschedule?", a: "You can easily reschedule through your User Dashboard or the link in your confirmation email up to 4 hours before the appointment time." },
    { q: "Do you offer follow-up sessions?", a: "Yes, continuity of care is central to our philosophy. Your doctor will recommend a follow-up schedule tailored to your personal treatment plan." },
    { q: "Do you provide treatment plans or product recommendations?", a: "Following your consultation, you will receive a personalized wellness protocol, which may include dietary guidance, lifestyle adjustments, and recommendations from our tested product range." }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="relative">
        <div className="absolute top-32 left-4 md:left-8 lg:left-12 z-20">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1A2E35]/40 hover:text-[#1A2E35] transition-all group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back
          </button>
        </div>

        {/* 1) Hero Section */}
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 bg-[#F2EDE4] overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
            <img 
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop" 
              alt="Ayurvedic Consultation" 
              className="w-full h-full object-cover grayscale-[20%] opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#F2EDE4] to-transparent" />
          </div>
          
          <div className="container relative z-10 px-4">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-xl"
            >
              <h1 className="text-4xl md:text-6xl font-display font-medium text-[#1A2E35] mb-6 leading-tight">
                Personalized <br /> Ayurvedic Care, <br /> Near You.
              </h1>
              <p className="text-lg text-[#1A2E35]/70 font-sans-clean leading-relaxed mb-10">
                Visit our certified clinics or book a virtual consultation with Salmara’s Ayurvedic experts. Science-backed guidance for a balanced life.
              </p>
              <Link 
                to="/book-appointment"
                className="bg-[#5A7A5C] text-white px-10 py-4 rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-[#4a654c] transition-all shadow-xl shadow-[#5A7A5C]/20 transform hover:-translate-y-1 block w-fit"
              >
                Book Appointment
              </Link>
            </motion.div>
          </div>
        </section>

        {/* 2) Search & Filter */}
        <section className="py-12 bg-white border-b border-[#F2EDE4] sticky top-20 z-40 shadow-sm">
          <div className="container px-4">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#1A2E35]/40" />
                <input 
                  type="text" 
                  placeholder="Search by City / area / clinic name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border border-[#F2EDE4] rounded-xl text-sm font-sans-clean focus:outline-none focus:border-[#5A7A5C] transition-colors"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 ml-1">City</label>
                  <select 
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="appearance-none bg-[#F8F9FA] border border-[#F2EDE4] rounded-xl px-4 py-3 text-xs font-sans-clean focus:outline-none cursor-pointer"
                  >
                    <option>All Locations</option>
                    <option>Bengaluru</option>
                    <option>Digital</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 ml-1">Treatment Type</label>
                  <select 
                    value={treatmentFilter}
                    onChange={(e) => setTreatmentFilter(e.target.value)}
                    className="appearance-none bg-[#F8F9FA] border border-[#F2EDE4] rounded-xl px-4 py-3 text-xs font-sans-clean focus:outline-none cursor-pointer"
                  >
                    <option>All Treatments</option>
                    <option>Pain & Mobility</option>
                    <option>Gut & Digestive Health</option>
                    <option>Liver & Detox</option>
                    <option>Women's Wellness</option>
                    <option>Immunity</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 ml-1">Type</label>
                  <select 
                    value={consultType}
                    onChange={(e) => setConsultType(e.target.value)}
                    className="appearance-none bg-[#F8F9FA] border border-[#F2EDE4] rounded-xl px-4 py-3 text-xs font-sans-clean focus:outline-none cursor-pointer"
                  >
                    <option>All Types</option>
                    <option>In-Person</option>
                    <option>Virtual</option>
                  </select>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[#1A2E35]/40 italic mt-4 ml-1">Results updating in real-time based on your preferences.</p>
          </div>
        </section>

        {/* 3) Clinic Cards */}
        <section className="py-24 container px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <h2 className="text-3xl font-display font-medium text-[#1A2E35]">Available Clinics</h2>
              <div className="space-y-6">
                {clinics.map((clinic) => (
                  <motion.div 
                    key={clinic.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-[#F2EDE4] group hover:border-[#5A7A5C] transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-2">
                        <h3 className="text-xl font-display font-medium text-[#1A2E35] group-hover:text-[#5A7A5C] transition-colors">{clinic.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-[#1A2E35]/60 font-sans-clean">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{clinic.address}</span>
                        </div>
                        <button className="text-[10px] text-[#C5A059] font-bold underline underline-offset-4 uppercase tracking-widest hover:text-[#B38D45]">View on Google Maps</button>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${clinic.type === 'Virtual' ? 'bg-blue-50 text-blue-600' : 'bg-[#5A7A5C]/5 text-[#5A7A5C]'}`}>
                        {clinic.type === 'Virtual' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                        {clinic.type}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#F2EDE4]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40">
                          <Clock className="h-3 w-3" /> Operating Hours
                        </div>
                        <p className="text-xs font-sans-clean text-[#1A2E35]/80">{clinic.hours}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40">
                          <UserCheck className="h-3 w-3" /> Doctor Availability
                        </div>
                        <p className="text-xs font-sans-clean text-[#5A7A5C] font-bold">{clinic.availability}</p>
                      </div>
                    </div>
                    
                    <Link 
                      to="/book-appointment"
                      className="w-full mt-8 bg-[#5A7A5C] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#4a654c] transition-colors flex items-center justify-center"
                    >
                      Book Appointment
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 4) Google Map Integration */}
            <div className="sticky top-60 h-[600px] bg-[#F2EDE4] rounded-3xl overflow-hidden border border-[#F2EDE4] hidden lg:block">
              {/* Map Placeholder */}
              <div className="w-full h-full flex flex-col items-center justify-center text-[#1A2E35]/20 p-12 text-center space-y-4">
                <Navigation className="h-12 w-12" />
                <div className="space-y-2">
                  <p className="font-display font-medium text-[#1A2E35] opacity-40">Interactive Clinic Map</p>
                  <p className="text-xs font-sans-clean leading-relaxed">Click a clinic card to highlight its location on the map. Get real-time directions via integrated Google Maps pins.</p>
                </div>
              </div>
              {/* Overlay simulation */}
              <div className="absolute top-6 left-6 right-6">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-xl flex items-center justify-between">
                  <span className="text-xs font-sans-clean font-bold text-[#1A2E35]">Finding nearest providers in Bengaluru...</span>
                  <div className="flex gap-2">
                    <div className="h-2 w-2 bg-[#5A7A5C] rounded-full animate-pulse" />
                    <div className="h-2 w-2 bg-[#5A7A5C] rounded-full animate-pulse delay-75" />
                    <div className="h-2 w-2 bg-[#5A7A5C] rounded-full animate-pulse delay-150" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5) Treatment Programs */}
        <section className="py-24 bg-[#1A2E35] text-white">
          <div className="container px-4">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-display font-medium mb-6">Holistic Healing for Every Need</h2>
              <p className="text-white/60 font-sans-clean">Specialized Ayurvedic programs designed to restore internal harmony and physical vitality through evidence-based protocol.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {treatments.map((t, i) => (
                <div key={i} className="p-10 border border-white/10 rounded-2xl hover:bg-white/5 transition-all group">
                  <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center text-[#C5A059] mb-8 group-hover:scale-110 transition-transform">
                    {t.icon}
                  </div>
                  <h3 className="text-xl font-display font-medium mb-4">{t.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed font-sans-clean mb-6">{t.desc}</p>
                </div>
              ))}
              <div className="p-10 bg-[#5A7A5C] rounded-2xl flex flex-col justify-center items-center text-center space-y-6">
                <p className="text-lg font-display font-medium leading-tight">Can't find what you're looking for?</p>
                <button className="bg-white text-[#5A7A5C] px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#FDFBF7] transition-colors">
                  General Consultation
                </button>
              </div>
            </div>
            
            <div className="mt-20 text-center">
              <Link 
                to="/book-appointment"
                className="text-sm font-bold border-b-2 border-[#5A7A5C] pb-2 hover:text-[#C5A059] hover:border-[#C5A059] transition-all"
              >
                Book Your Consultation
              </Link>
            </div>
          </div>
        </section>

        {/* 6) Consultation Process */}
        <section className="py-24 bg-white border-b border-[#F2EDE4]">
          <div className="container px-4">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-display font-medium text-[#1A2E35]">Experience Seamless Care</h2>
              <p className="text-[#1A2E35]/50 font-sans-clean mt-2 italic">A straightforward journey from booking to healing.</p>
            </div>
            
            <div className="relative max-w-5xl mx-auto px-10">
              {/* Connector line */}
              <div className="absolute top-10 left-20 right-20 h-px bg-[#1A2E35]/10 hidden lg:block" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-8 relative">
                {[
                  { step: "Choose Clinic", icon: <MapPin className="h-5 w-5" /> },
                  { step: "Select Date & Time", icon: <Calendar className="h-5 w-5" /> },
                  { step: "Pick Doctor", icon: <UserCheck className="h-5 w-5" /> },
                  { step: "Confirm Appointment", icon: <CheckCircle2 className="h-5 w-5" /> },
                  { step: "Receive Confirmation", icon: <ArrowRight className="h-5 w-5" /> }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center group">
                    <div className="h-20 w-20 rounded-full bg-[#FDFBF7] border border-[#F2EDE4] flex items-center justify-center text-[#5A7A5C] mb-6 group-hover:bg-[#5A7A5C] group-hover:text-white transition-all shadow-sm z-10">
                      {item.icon}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#1A2E35] text-center max-w-[100px] leading-tight">
                      {item.step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7) FAQ */}
        <section className="py-24 md:py-32 container px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-display font-medium text-[#1A2E35]">Common Questions</h2>
              <p className="text-[#1A2E35]/60 mt-4">Everything you need to know about starting your treatment.</p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-[#F2EDE4] rounded-2xl overflow-hidden bg-white">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-[#FDFBF7] transition-colors"
                  >
                    <span className="font-display font-medium text-[#1A2E35]">{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 text-[#5A7A5C] transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-8 pt-2 text-sm text-[#1A2E35]/70 font-sans-clean leading-relaxed border-t border-[#F2EDE4]/50">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8) Page-End CTA Banner */}
        <section className="py-24 container px-4 mb-24">
          <div className="bg-[#1A2E35] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-10">
              <h2 className="text-4xl md:text-6xl font-display font-medium text-white leading-tight">Ready to Begin Your <br /> Ayurvedic Journey?</h2>
              <p className="text-white/60 text-lg font-sans-clean">Experience personalized healing designed for your unique constitution by Salmara’s trusted experts.</p>
              <div className="pt-4">
                <Link 
                  to="/book-appointment"
                  className="bg-[#5A7A5C] text-white px-12 py-5 rounded-2xl font-bold tracking-[0.2em] uppercase text-xs hover:bg-[#4a654c] transition-all shadow-2xl shadow-black/40 transform hover:-translate-y-1 inline-block"
                >
                  Book Appointment
                </Link>
              </div>
              <div className="flex items-center justify-center gap-8 pt-8 opacity-40">
                <CheckCircle2 className="h-6 w-6 text-white" />
                <ShieldCheck className="h-6 w-6 text-white" />
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ClinicsPage;
