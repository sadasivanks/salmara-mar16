import React, { useState, useMemo } from "react";
import { Image } from "@/components/ui/Image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate, Link } from "react-router-dom";
import { m, AnimatePresence } from "framer-motion";
const clinicImg = "/images/clinics/clinics-page.webp";
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
  ArrowLeft,
  Filter
} from "lucide-react";
import SEO from "@/components/SEO";
import { siteConfig } from "@/config/site.config";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ClinicsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [treatmentFilter, setTreatmentFilter] = useState("All");
  const [consultType, setConsultType] = useState("All");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<number>(1);

  const clinics = siteConfig.clinics;

  const filteredClinics = useMemo(() => {
    return clinics.filter(clinic => {
      const matchesSearch =
        clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = cityFilter === "All" || cityFilter === "All Locations" || clinic.city === cityFilter;
      const matchesType = consultType === "All" || consultType === "All Types" || clinic.type === consultType;

      const matchesTreatment = treatmentFilter === "All" || treatmentFilter === "All Treatments" ||
        clinic.specialties.some(s => s.toLowerCase().includes(treatmentFilter.toLowerCase()));

      return matchesSearch && matchesCity && matchesType && matchesTreatment;
    });
  }, [searchQuery, cityFilter, consultType, treatmentFilter]);

  const treatments = [
    {
      title: "Pain & Mobility",
      desc: "Natural oils and therapies to relieve joint and muscle pain.",
      icon: <Plus className="h-6 w-6" />
    },
    {
      title: "Liver & Detox",
      desc: "Herbal tonics to cleanse and rejuvenate your system.",
      icon: <ShieldCheck className="h-6 w-6" />
    },
    {
      title: "Women's Wellness",
      desc: "Ayurvedic care for hormonal balance and comfort.",
      icon: <UserCheck className="h-6 w-6" />
    },
    {
      title: "Gut & Digestive Health",
      desc: "Remedies for better digestion and metabolism.",
      icon: <ChevronRight className="h-6 w-6" />
    },
    {
      title: "Immunity & Respiratory Health",
      desc: "Tulsi-based blends for daily defense and breathing support.",
      icon: <ArrowRight className="h-6 w-6" />
    }
  ];

  const faqs = [
    { q: "How long is each consultation?", a: "Initial consultations typically last 45-60 minutes to allow for a comprehensive Prakriti (constitution) analysis and health history review. Follow-ups are generally 20-30 minutes." },
    { q: "Can I book online and visit in person?", a: "Yes, our integrated platform allows you to select your preferred clinic, book your slot online, and visit our physical location for your consultation." },
    { q: "Is my booking confirmed immediately?", a: "Absolutely. Once you complete the 5-step booking process, you will receive an instant confirmation via email and SMS with all relevant details." },
    { q: "What if I need to reschedule?", a: "You can easily reschedule through your User Dashboard or the link in your confirmation email up to 4 hours before the appointment time." },
    { q: "Do you offer follow-up sessions?", a: "Yes, continuity of care is central to our philosophy. Your doctor will recommend a follow-up schedule tailored to your personal treatment plan." },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      <SEO
        title="Ayurvedic Clinics Near Me | Certified Practitioners"
        description="Visit our authentic Ayurvedic clinics in Bangalore, Mysore, Hubli, and beyond. Personalized consultations with expert doctors for holistic health management."
        jsonLd={clinics.filter(c => c.type !== 'Virtual').map(clinic => ({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": clinic.name,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": clinic.streetAddress,
            "addressLocality": clinic.city,
            "addressRegion": clinic.state,
            "postalCode": clinic.zip,
            "addressCountry": clinic.country
          },
          "telephone": siteConfig.contact.phone,
          "url": window.location.href,
          "openingHours": "Mo-Sa 10:00-18:00",
          "image": clinicImg
        }))}
      />
      <Header />

      <main className="relative overflow-x-hidden">
        {/* 1) Hero Section */}
        <section className="relative pt-12 pb-0 md:pt-16 md:pb-0 bg-secondary overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
            <Image
              src={clinicImg}
              alt="Ayurvedic Consultation"
              className="w-full h-full object-cover grayscale-[20%] opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary to-transparent" />
          </div>

          <div className="container relative z-10 px-4">
            <m.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-xl py-6 md:py-8 lg:py-10 xl:py-12"
            >
              <h1 className="text-4xl md:text-6xl font-display font-medium text-[#1A2E35] mb-6 md:mb-8 lg:mb-10 xl:mb-12 leading-tight">
                Personalized <br /> Ayurvedic Care, <br /> Near You.
              </h1>
              <p className="text-lg text-[#1A2E35]/70 font-sans-clean leading-relaxed mb-10">
                Visit our certified clinics or book a virtual consultation with Salmara’s Ayurvedic experts.
              </p>
              <a
                href="https://wa.me/919353436373?text=Hello%20Salmara%20Team,%20I%20would%20like%20to%20book%20an%20Ayurvedic%20consultation."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white px-10 py-4 rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-herbal-dark transition-all shadow-xl shadow-primary/20 transform hover:-translate-y-1 block w-fit"
              >
                Book Appointment
              </a>
              <br />
            </m.div>
          </div>
        </section>

        {/* 2 & 3) Search, Filter and Available Clinics Combined Container */}
        <div className="relative">
          {/* Search & Filter - Sticky but localized to this container */}
          <section className="py-2 md:py-4 lg:py-6 xl:py-8 bg-white border-b border-[#F2EDE4] sticky top-[64px] lg:top-[80px] z-40 shadow-sm">
            <div className="container px-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                <div className="flex items-center gap-2 w-full lg:flex-1">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1A2E35]/40 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Search by location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FA] border border-[#F2EDE4] rounded-xl text-xs font-sans-clean focus:outline-none focus:border-primary transition-colors placeholder:text-[#1A2E35]/20"
                    />
                  </div>

                  {/* Mobile Filter Toggle Button */}
                  <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${showMobileFilters || cityFilter !== 'All' || treatmentFilter !== 'All' || consultType !== 'All'
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white border-[#F2EDE4] text-[#1A2E35]'
                      }`}
                  >
                    <Filter className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Filters</span>
                    {(cityFilter !== 'All' && cityFilter !== 'All Locations' || treatmentFilter !== 'All' && treatmentFilter !== 'All Treatments' || consultType !== 'All' && consultType !== 'All Types') && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 border border-white" />
                    )}
                  </button>
                </div>

                <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-wrap items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0 p-3 lg:p-0 bg-secondary lg:bg-transparent rounded-2xl border border-[#F2EDE4] lg:border-none shadow-lg lg:shadow-none`}>
                  <div className="flex flex-col gap-1 flex-1 min-w-[110px] lg:min-w-[140px]">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#1A2E35]/40 ml-1">City</label>
                    <div className="relative">
                      <select
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="w-full appearance-none bg-white lg:bg-[#F8F9FA] border border-[#F2EDE4] rounded-lg px-3 py-2 text-[11px] font-sans-clean focus:outline-none cursor-pointer pr-8"
                      >
                        <option>All Locations</option>
                        <option>Bengaluru</option>
                        <option>Puttur</option>
                        <option>Mysuru</option>
                        <option>Hubli</option>
                        <option>Mumbai</option>
                        <option>Raichur</option>
                        <option>Chennai</option>
                        <option>Coimbatore</option>
                        <option>Kozhikode</option>
                        <option>Kochi</option>
                        <option>Digital</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1A2E35]/40 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-[110px] lg:min-w-[140px]">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#1A2E35]/40 ml-1">Treatment</label>
                    <div className="relative">
                      <select
                        value={treatmentFilter}
                        onChange={(e) => setTreatmentFilter(e.target.value)}
                        className="w-full appearance-none bg-white lg:bg-[#F8F9FA] border border-[#F2EDE4] rounded-lg px-3 py-2 text-[11px] font-sans-clean focus:outline-none cursor-pointer pr-8"
                      >
                        <option>All Treatments</option>
                        <option>Pain & Mobility</option>
                        <option>Gut & Digestive Health</option>
                        <option>Liver & Detox</option>
                        <option>Women's Wellness</option>
                        <option>Immunity</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1A2E35]/40 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-[110px] lg:min-w-[140px]">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#1A2E35]/40 ml-1">Type</label>
                    <div className="relative">
                      <select
                        value={consultType}
                        onChange={(e) => setConsultType(e.target.value)}
                        className="w-full appearance-none bg-white lg:bg-[#F8F9FA] border border-[#F2EDE4] rounded-lg px-3 py-2 text-[11px] font-sans-clean focus:outline-none cursor-pointer pr-8"
                      >
                        <option>All Types</option>
                        <option>In-Person</option>
                        <option>Virtual</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1A2E35]/40 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] text-[#1A2E35]/40 italic ml-1">
                  {filteredClinics.length} clinical centers found
                </p>
                {(cityFilter !== 'All' && cityFilter !== 'All Locations' || treatmentFilter !== 'All' && treatmentFilter !== 'All Treatments' || consultType !== 'All' && consultType !== 'All Types' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCityFilter("All");
                      setTreatmentFilter("All");
                      setConsultType("All");
                    }}
                    className="text-[9px] font-bold text-red-500 uppercase tracking-widest hover:underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Clinic Cards & Map Grid */}
          <section className="py-6 md:py-8 lg:py-10 xl:py-12 container px-4">
            <SectionHeading 
              title="Available Clinics"
              centered={false}
              animate={false}
            />
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 xl:gap-12">
              <div className="h-full">
                <div className="space-y-6 h-[600px] overflow-y-auto pr-4 custom-scrollbar scroll-smooth">
                  {filteredClinics.length > 0 ? (
                    filteredClinics.map((clinic) => (
                      <m.div
                        key={clinic.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => clinic.type !== 'Virtual' && setSelectedClinicId(clinic.id)}
                        className={`p-6 sm:p-8 rounded-2xl shadow-sm border transition-all relative overflow-hidden ${
                          selectedClinicId === clinic.id
                            ? 'bg-white border-primary ring-1 ring-primary/20 ring-offset-0'
                            : 'bg-white border-[#F2EDE4] group'
                        }`}
                      >
                        {selectedClinicId === clinic.id && clinic.type !== 'Virtual' && (
                          <div className="absolute top-0 right-0 p-4">
                            <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-4 sm:mb-6">
                          <div className="space-y-2">
                            <h3 className={`text-lg sm:text-xl font-display font-medium transition-colors ${
                              selectedClinicId === clinic.id ? 'text-primary' : 'text-[#1A2E35] group-hover:text-primary'
                            }`}>{clinic.name}</h3>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-[11px] sm:text-sm text-[#1A2E35]/40 font-sans-clean leading-snug">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span>{clinic.address}</span>
                              </div>
                              {clinic.fulladdress && (
                                <div className="text-[11px] sm:text-sm text-[#1A2E35]/60 font-sans-clean leading-relaxed">
                                  {clinic.fulladdress}
                                </div>
                              )}
                            </div>
                            {clinic.type !== 'Virtual' && (
                              <a
                                href={clinic.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-[9px] sm:text-[10px] text-accent font-bold underline underline-offset-4 uppercase tracking-widest hover:text-accent/80 mt-1 md:mt-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View on Google Maps
                              </a>
                            )}
                          </div>
                          <div className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                            clinic.type === 'Virtual' ? 'bg-blue-50 text-blue-600' : 'bg-primary/5 text-primary'
                          }`}>
                            {clinic.type === 'Virtual' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                            {clinic.type}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-[#F2EDE4]">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 md:gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40">
                              <Clock className="h-3 w-3" /> Hours
                            </div>
                            <p className="text-[11px] sm:text-xs font-sans-clean text-[#1A2E35]/80 line-clamp-1">{clinic.hours}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 md:gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40">
                              <UserCheck className="h-3 w-3" /> Expert
                            </div>
                            <p className="text-[11px] sm:text-xs font-sans-clean text-primary font-bold line-clamp-1">{clinic.availability}</p>
                          </div>
                        </div>

                        <a
                          href={`https://wa.me/919353436373?text=Hello%20Salmara%20Team,%20I%20would%20like%20to%20book%20an%20appointment%20at%20${encodeURIComponent(clinic.name)}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full mt-6 sm:mt-8 bg-primary text-white py-3.5 sm:py-4 rounded-xl font-bold uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-herbal-dark transition-colors flex items-center justify-center"
                        >
                          Book Appointment
                        </a>
                      </m.div>
                    ))
                  ) : (
                    <m.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-12 text-center bg-[#F8F9FA] rounded-2xl border-2 border-dashed border-[#F2EDE4] space-y-4"
                    >
                      <div className="h-16 w-16 bg-[#F2EDE4] rounded-full flex items-center justify-center mx-auto text-[#1A2E35]/20">
                        <Search className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-display font-medium text-[#1A2E35]">No clinics found</h3>
                        <p className="text-sm text-[#1A2E35]/50 font-sans-clean mt-1">Try adjusting your filters or search keywords.</p>
                      </div>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setCityFilter("All");
                          setTreatmentFilter("All");
                          setConsultType("All");
                        }}
                        className="text-xs font-bold text-primary uppercase tracking-widest underline underline-offset-4"
                      >
                        Clear all filters
                      </button>
                    </m.div>
                  )}
                </div>
              </div>

              {/* Google Map Integration */}
              <div className="sticky top-60 h-[600px] bg-secondary rounded-3xl overflow-hidden border border-[#F2EDE4] hidden lg:block shadow-2xl shadow-[#1A2E35]/5">
                <AnimatePresence mode="wait">
                  <m.div
                    key={selectedClinicId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full"
                  >
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: '600px' }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Map for ${clinics.find(c => c.id === selectedClinicId)?.name}`}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(clinics.find(c => c.id === selectedClinicId)?.address || 'Bengaluru')}&t=&z=15&ie=UTF8&iwloc=near&output=embed`}
                    />
                  </m.div>
                </AnimatePresence>

                <div className="absolute top-6 left-6 right-6">
                  <a
                    href={clinics.find(c => c.id === selectedClinicId)?.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white/95 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-xl hover:bg-white transition-all group/card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-[#5A7A5C]/10 rounded-lg flex items-center justify-center group-hover/card:bg-[#5A7A5C] group-hover/card:text-white transition-colors">
                          <Navigation className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 block">Click to open in Maps</span>
                          <span className="text-xs font-sans-clean font-bold text-[#1A2E35]">{clinics.find(c => c.id === selectedClinicId)?.name}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 items-center">
                        <MapPin className="h-3.5 w-3.5 text-accent" />
                        <div className="flex gap-0.5 ml-2">
                          <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
                          <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse delay-75" />
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 5) Treatment Programs - Holistic Healing for Every Need */}
        <section className="py-6 md:py-8 lg:py-10 xl:py-12 bg-secondary relative">
          <div className="container px-4">
            <SectionHeading 
              title="Holistic Healing for Every Need"
              animate={false}
            />

            <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
              {treatments.map((t, i) => (
                <div key={i} className="w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.33%-2rem)] p-10 bg-white border border-black rounded-3xl hover:border-[#5A7A5C] hover:shadow-2xl hover:shadow-[#1A2E35]/5 transition-all duration-500 group">
                  <div className="h-14 w-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    {t.icon}
                  </div>
                  <h3 className="text-xl font-display font-bold text-[#1A2E35] mb-4">{t.title}</h3>
                  <p className="text-sm text-[#1A2E35]/60 leading-relaxed font-sans-clean">{t.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 md:mt-8 lg:mt-10 xl:mt-12 text-center">
              <a
                href="https://wa.me/919353436373?text=Hello%20Salmara%20Team,%20I%20would%20like%20to%20book%20an%20Ayurvedic%20consultation."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-herbal-dark transition-all shadow-xl shadow-primary/20 transform hover:-translate-y-1 group"
              >
                Book Your Consultation <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </section>

        {/* 6) Consultation Process */}
        <section className="py-6 md:py-8 lg:py-10 xl:py-12 bg-white relative">
          <div className="container px-4">
            <SectionHeading 
              title="Consultation Process"
              description="A straightforward journey from booking to healing."
              descriptionClassName="italic"
              animate={false}
            />

            <div className="relative max-w-5xl mx-auto px-10">
              {/* Connector line */}
              <div className="absolute top-10 left-20 right-20 h-px bg-[#1A2E35]/10 hidden lg:block" />

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-10 xl:gap-12 relative">
                {[
                  { step: "Choose Clinic", icon: <MapPin className="h-5 w-5" /> },
                  { step: "Pick Doctor", icon: <UserCheck className="h-5 w-5" /> },
                  { step: "Select Date & Time", icon: <Calendar className="h-5 w-5" /> },
                  { step: "Confirm Appointment", icon: <CheckCircle2 className="h-5 w-5" /> },
                  { step: "Receive Confirmation", icon: <ArrowRight className="h-5 w-5" /> }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center group">
                    <div className="h-20 w-20 rounded-full bg-secondary border border-[#F2EDE4] flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all shadow-sm z-10">
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
        <section className="py-6 md:py-8 lg:py-10 xl:py-12 bg-white relative">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <SectionHeading 
                title="Common Questions"
                description="Everything you need to know about starting your treatment."
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

        {/* 8) Page-End CTA Banner */}
        <section className="py-6 md:py-8 lg:py-10 xl:py-12 bg-white relative">
          <div className="container px-4 mb-6 md:mb-8 lg:mb-10 xl:mb-12">
            <div className="bg-[#1A2E35] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop')] bg-cover bg-center opacity-10" />

              <div className="relative z-10 max-w-3xl mx-auto space-y-10">
                <SectionHeading 
                  title={<>Ready to Begin Your <br /> Ayurvedic Journey?</>}
                  description="Experience personalized healing designed for your unique constitution by Salmara’s trusted experts."
                  descriptionClassName="!text-white/60"
                  titleClassName="!text-white"
                  animate={false}
                />
                <div className="pt-4">
                  <a
                    href="https://wa.me/919353436373?text=Hello%20Salmara%20Team,%20I%20would%20like%20to%20start%20my%20Ayurvedic%20journey."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-white px-12 py-5 rounded-2xl font-bold tracking-[0.2em] uppercase text-xs hover:bg-herbal-dark transition-all shadow-2xl shadow-black/40 transform hover:-translate-y-1 inline-block"
                  >
                    Book Appointment
                  </a>
                </div>
                <div className="flex items-center justify-center gap-8 pt-8 opacity-40">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                  <ShieldCheck className="h-6 w-6 text-white" />
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
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
