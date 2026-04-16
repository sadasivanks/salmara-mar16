import React, { useState } from "react";
import { Image } from "@/components/ui/Image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate, Link } from "react-router-dom";
import { m, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, CheckCircle2, Award, ShieldCheck, Microscope, 
  FlaskConical, MapPin, ArrowRight, ChevronRight,
  HandHeart, Users, Activity, History, Trophy, X, Maximize2
} from "lucide-react";
import SEO from "@/components/SEO";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Award Images - Now from public/images
const awardIMG7909 = "/images/awards/IMG_7909.webp";
const awardIMG7913 = "/images/awards/IMG_7913.webp";
const awardIMG7915 = "/images/awards/IMG_7915.webp";
const awardIMG7916 = "/images/awards/IMG_7916.webp";
const awardIMG7918 = "/images/awards/IMG_7918.webp";
const awardIMG7921 = "/images/awards/IMG_7921.webp";
const awardNobleMan = "/images/awards/Noble-Man-Award.webp";
const founder = "/images/brand/founder.webp";
const aboutLab = "/images/clinics/about-lab.webp";

const AboutUsPage = () => {
  const navigate = useNavigate();
  const awards = [
    { title: "Foundation Ceremony ", year: "2006", img: awardIMG7921 },
    { title: "Taluku Kannada Rajyotsa award ", year: "2025", img: awardIMG7909 },
    { title: "Karunada Ratna Award ", year: "2025", img: awardIMG7918 },
    { title: "Nava Rathna Award ", year: "2019", img: awardIMG7913 },
    { title: "National Health Award", year: "2025", img: awardIMG7916 },
    { title: "Vaidya Seva Ratna Award", year: "2025", img: awardIMG7915 },
    { title: "Noble Man Award (Mumbai)", year: "2009", img: awardNobleMan },
  ];

  const [selectedAwardIndex, setSelectedAwardIndex] = useState<number | null>(null);
  
  const handlePrevAward = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedAwardIndex !== null) {
      setSelectedAwardIndex((selectedAwardIndex - 1 + awards.length) % awards.length);
    }
  };

  const handleNextAward = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedAwardIndex !== null) {
      setSelectedAwardIndex((selectedAwardIndex + 1) % awards.length);
    }
  };
  return (
    <div className="min-h-screen bg-secondary">
      <SEO 
        title="Our Story & Legacy | Traditional Ayurvedic Wisdom" 
        description="Founded in 1996, Salmara Ayurveda bridges ancestral knowledge with modern science. Learn about our founding journey, clinical impact, and commitment to purity."
      />
      <Header />
      
      <main className="relative overflow-x-hidden">
        {/* 1) Hero Banner */}
        <section className="relative min-h-[60vh] md:h-[60vh] py-16 md:py-0 flex items-center justify-center overflow-hidden bg-herbal-dark">
          <div className="absolute inset-0 opacity-40">
            {/* Minimalistic lab/herbal visual placeholder style */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-herbal-dark" />
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2080&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay animate-pulse" style={{ animationDuration: '10s' }} />
          </div>
          
          <div className="container relative z-10 px-4 text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white mb-4 leading-tight">
                The Brand Behind the Care.
              </h1>
              <p className="text-xs sm:text-sm md:text-lg text-white/80 max-w-xl mx-auto mb-8 font-sans-clean leading-relaxed px-4">
                Salmara was built to bring Ayurveda into daily life through products, guidance and care spaces.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-10 px-4">
                <span className="flex items-center gap-2 text-[8px] sm:text-[10px] md:text-xs font-bold tracking-[0.2em] text-accent uppercase border border-accent/30 px-3 py-1.5 rounded-full whitespace-nowrap">
                  <ShieldCheck className="h-3 w-3" /> GMP Certified
                </span>
                <span className="flex items-center gap-2 text-[8px] sm:text-[10px] md:text-xs font-bold tracking-[0.2em] text-accent uppercase border border-accent/30 px-3 py-1.5 rounded-full whitespace-nowrap">
                  <CheckCircle2 className="h-3 w-3" /> ISO Compliant
                </span>
                <span className="flex items-center gap-2 text-[8px] sm:text-[10px] md:text-xs font-bold tracking-[0.2em] text-accent uppercase border border-accent/30 px-3 py-1.5 rounded-full whitespace-nowrap">
                  <Award className="h-3 w-3" /> AYUSH Approved
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6 sm:px-0">
                <Link to="/shop" className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-xl font-bold tracking-widest uppercase text-[10px] sm:text-xs hover:bg-herbal-dark transition-all shadow-xl shadow-black/20">
                  Explore Our Products
                </Link>
                <Link to="/clinics" className="w-full sm:w-auto px-10 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold tracking-widest uppercase text-[10px] sm:text-xs hover:bg-white/20 transition-all">
                  Explore Our Clinics
                </Link>
              </div>
            </m.div>
          </div>
        </section>

        {/* 2) Founder’s Message - Minimalist Premium Redesign */}
        <section className="py-6 md:py-8 lg:py-10 xl:py-12 container px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-10 xl:gap-12">
            {/* Image Column - Compact but Premium */}
            <div className="w-full md:w-1/4 flex-shrink-0">
              <div className="relative">
                <Image 
                  src={founder} 
                  alt="Founder" 
                  className="rounded-xl transition-all duration-700 shadow-lg w-full max-w-[300px] mx-auto md:max-w-none"
                />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-primary/10 rounded-lg -z-10" />
              </div>
            </div>

            {/* Text Column - Refined Typography */}
            <div className="w-full md:w-3/4 space-y-2 md:space-y-4">
              <SectionHeading 
                title="A Promise Born in Karnataka" 
                centered={false} 
                animate={false}
              />
              
              <div className="text-[#1A2E35]/70 font-sans-clean leading-relaxed text-base md:text-lg">
                <p>
                When Salmara began, it came from a desire to carry Ayurvedic knowledge forward in a way people could continue to rely on in daily life. What started with a few trusted formulations slowly grew into a wider journey of products, clinics, and consultations.
                </p>
              </div>

              <div>
                <p className="font-display italic text-xl text-primary">Shamsuddin Salmara</p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A2E35]/40">Founder, Salmara Ayurveda</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2.5) Our Journey */}
        <section className="py-6 md:py-8 lg:py-10 xl:py-12 bg-white overflow-hidden">
          <div className="container px-4 max-w-6xl mx-auto">
            <SectionHeading 
              title="Our Journey" 
              eyebrow="The Salmara Legacy" 
              animate={false}
            />

            <div className="grid lg:grid-cols-2 gap-10 md:gap-16 lg:gap-20 items-start">
              {/* Narrative Story */}
              <div className="space-y-4 md:space-y-6 lg:space-y-8 text-[#1A2E35]/80 font-sans-clean leading-relaxed text-base md:text-lg text-left">
                <p>
                  Salmara began in 1996 with inherited Ayurvedic knowledge and a small set of trusted formulations. In the years that followed, the work expanded through free medical camps and the opening of the first clinic in Murudinjira.
                </p>

                <p>
                  What started as a local practice gradually grew into a wider care network across multiple cities. Today, the journey reflects 26+ products, years of community outreach, and continued recognition for contributions to traditional medicine. Our founder also serves as Jilla Adhyaksha (District President) of Karnataka Parampaarika Vaidya Sangha, reflecting Salmara’s continued connection to traditional Ayurvedic practice and community leadership.
                </p>
              </div>

              {/* Milestones Timeline */}
              <div className="bg-secondary rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 border border-[#F2EDE4] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2EDE4]/30 rounded-full blur-3xl -mr-32 -mt-32" />
                <h3 className="text-xl md:text-2xl font-display font-medium text-[#1A2E35] mb-8 md:mb-10 relative z-10">Milestones of Growth</h3>
                
                <div className="space-y-4 md:space-y-6 lg:space-y-8 relative z-10">
                  <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-[#F2EDE4] md:left-[15px]" />
                  
                  {[
                    { year: "1996", label: "Began the journey with ancestral Ayurvedic knowledge" },
                    { year: "2004", label: "Began free medical camps" },
                    { year: "2005", label: "Opened the first clinic in Murudinjira" },
                    { year: "2006", label: "Received official AYUSH partner recognition" },
                    { year: "2024", label: "National Health Award" },
                    { year: "2025", label: "Major state recognitions" },
                  ].map((milestone, idx) => (
                    <m.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-6 relative"
                    >
                      <div className="w-[22px] h-[22px] md:w-[30px] md:h-[30px] rounded-full bg-white border-2 border-primary flex-shrink-0 z-10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-primary tracking-widest">{milestone.year}</span>
                        <span className="text-[#1A2E35]/80 font-sans-clean leading-snug">{milestone.label}</span>
                      </div>
                    </m.div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-8 lg:mt-10 xl:mt-12 bg-herbal-dark rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden">
{/* <div className="mt-16 md:mt-24 bg-[#1A2E35] rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden"> */}
  <div className="absolute inset-0 opacity-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--gold)/0.1),transparent_60%)]" />
  </div>
  
  <div className="relative z-10 grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
    
    <div className="space-y-4">
    <h3 className="text-2xl md:text-4xl font-display text-white border-b border-white/10 pb-4">
    Our Impact
  </h3>
      <p className="text-white/60 font-sans-clean italic">
        "What began as a local practice has grown into wider reach across products, camps, and cities."
      </p>
    </div>
    
    <div className="lg:col-span-2 grid grid-cols-2 gap-8 md:gap-12">
      {[
        { val: "26+", label: "Ancestral Products" },
        { val: "12+", label: "Cities Presence" },
        { val: "100+", label: "Medical Camps" },
        { val: "100k+", label: "Lives Healed" },
      ].map((stat, idx) => (
        <div key={idx} className="space-y-1">
          <div className="text-3xl md:text-5xl font-[Inter] font-semibold text-accent tracking-tight tabular-nums">
            {stat.val}
          </div>
          <div className="text-xs md:text-sm uppercase tracking-widest text-white/60 font-bold">
            {stat.label}
          </div>
        </div>
      ))}

      <div className="col-span-2 pt-4 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#C5A059]/20 rounded-xl text-[#C5A059]">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">Karnataka's No.1</div>
            <div className="text-xs text-white/60 uppercase tracking-widest">
              Non-surgical piles treatment
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>
            {/* Awards Hybrid Logic */}
            <div className="mt-6 md:mt-8 lg:mt-10 xl:mt-12">
              <SectionHeading 
                title="Achievements and Awards" 
                description="Key recognitions received over the years."
                animate={false}
              />

              {/* Comprehensive Honors List */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 md:mb-8 lg:mb-10 xl:mb-12">
                {[
                  { year: "2009", title: "Noble Man Award (Karnataka Sangha, Mumbai)" },
                  { year: "2017", title: "Vaidya Seva Ratna Award (Shimoga)" },
                  { year: "2017", title: "Gadi Nadu Award" },
                  { year: "2019", title: "Nava Rathna Award (Rudraksha Foundation)" },
                  { year: "2025", title: "National Health Award (Non‑surgical piles medicine)" },
                  { year: "2025", title: "Vaidya Seva Ratna Award" },
                  { year: "2025", title: "Taluku Kannada Rajyotsava Award" },
                  { year: "2025", title: "Karunada Ratna Award (Samaj Seva category)" },
                ].map((honor, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary border border-[#F2EDE4]/50 hover:border-primary/30 transition-colors">
                    <div className="text-xs font-bold text-primary w-12 shrink-0">{honor.year}</div>
                    <div className="w-[1px] h-4 bg-[#F2EDE4]" />
                    <div className="text-sm text-[#1A2E35]/80 font-medium">{honor.title}</div>
                  </div>
                ))}
              </div>

              {/* Featured Awards (with images) */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {awards.map((award, idx) => (
                  <m.div 
                    key={idx}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedAwardIndex(idx)}
                    className="bg-white rounded-3xl overflow-hidden border border-[#F2EDE4] shadow-sm group cursor-pointer"
                  >
                    <div className="aspect-[4/5] bg-gray-100 relative">
                      <Image src={award.img} alt={award.title} className="w-full h-full object-cover grayscale-[35%] group-hover:grayscale-0 transition-all duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" loading={idx < 3 ? "eager" : "lazy"} />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-[#1A2E35]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white transform scale-90 group-hover:scale-100 transition-transform">
                          <Maximize2 className="h-6 w-6" />
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                        <div className="text-[18px] font-[Inter] font-semibold uppercase tracking-widest mb-2 text-accent tabular-nums">{award.year}</div>
                        <div className="text-base md:text-xl font-display leading-tight drop-shadow-lg">{award.title}</div>
                      </div>
                    </div>
                  </m.div>
                ))}
              </div>
            </div>

            {/* Ending Narrative */}
            <div className="mt-6 md:mt-8 lg:mt-10 xl:mt-12 text-center max-w-2xl mx-auto">
              <p className="text-[#1A2E35]/60 mb-8 italic">
                Salmara grew from a local Ayurvedic practice into a wider care journey built through products, clinics, and community reach.
              </p>
            </div>
          </div>
        </section>


        {/* 4) Certification Gallery */}
        <section className="py-6 md:py-8 lg:py-10 xl:py-12 container px-4">
          <SectionHeading 
            title="Approved by Standards That Matter" 
            animate={false}
            className="mb-6"
          />
          <div className="max-w-3xl mx-auto text-center mb-6 md:mb-8 lg:mb-10 xl:mb-12">
            <p className="text-[#1A2E35]/60 font-sans-clean leading-relaxed">
              Our manufacturing and care processes are supported by relevant certifications and regulatory approvals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="p-2 md:p-4 lg:p-8 border border-[#F2EDE4] rounded-2xl text-center">
              <h3 className="text-lg font-display font-bold text-[#1A2E35] mb-1">GMP Certified</h3>
              <p className="text-[10px] uppercase tracking-widest text-accent mb-4">Quality Council of India</p>
              <p className="text-sm text-[#1A2E35]/60 font-sans-clean">Manufacturing follows quality-controlled production standards.</p>
            </div>
            
            <div className="p-2 md:p-4 lg:p-8 border border-[#F2EDE4] rounded-2xl text-center">
              <h3 className="text-lg font-display font-bold text-[#1A2E35] mb-1">ISO 9001:2015</h3>
              <p className="text-[10px] uppercase tracking-widest text-accent mb-4">International Standards Organization</p>
              <p className="text-sm text-[#1A2E35]/60 font-sans-clean">Quality management systems support consistency and documentation across processes.</p>
            </div>
            
            <div className="p-2 md:p-4 lg:p-8 border border-[#F2EDE4] rounded-2xl text-center">
              <h3 className="text-lg font-display font-bold text-[#1A2E35] mb-1">AYUSH License</h3>
              <p className="text-[10px] uppercase tracking-widest text-accent mb-4">Ministry of AYUSH, Govt. of India</p>
              <p className="text-sm text-[#1A2E35]/60 font-sans-clean">Licensed compliance supports Ayurvedic formulations and related care practices.</p>
            </div>
            
          </div>
        </section>



        {/* 7) The Process - Science Behind Every Drop */}
        <section className="py-6 md:py-8 lg:py-10 xl:py-12 bg-[#F8F9FA] overflow-hidden">
          <div className="container px-4">
            <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-8 lg:gap-10 mb-6 md:mb-8 lg:mb-10 xl:mb-12">
              {/* Left visuals */}
              <div className="w-full lg:w-1/2 relative">
                <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl max-h-[300px] md:max-h-[400px]">
                  <Image 
                    src={aboutLab || "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=2070&auto=format&fit=crop"} 
                    alt="Salmara Labs" 
                    className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E35]/40 to-transparent" />
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/10 rounded-full blur-3xl -z-10" />
                <div className="absolute -top-6 -right-6 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />
              </div>

              {/* Right copy */}
              <div className="w-full lg:w-1/2 space-y-8">
                <SectionHeading 
                  title={<>Science Behind <br /> Every Drop</>} 
                  centered={false} 
                  animate={false}
                  description="A closer look at the formulation and testing practices behind Salmara products."
                  descriptionClassName="text-lg mb-8"
                  className="mb-4"
                />
                
                <div className="relative pl-8 border-l-2 border-accent/30 py-4">
                  <p className="text-[#1A2E35]/80 font-sans-clean italic leading-relaxed text-lg">
                    "From formulation to final batch, each stage is handled through a defined and controlled process."
                  </p>
                </div>

              </div>
            </div>

            {/* 4-Step Horizontal Infographic */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0">
                {[
                  { 
                    title: "Raw Material Verification", 
                    desc: "Herbs are sourced through identified partners and checked before entering production.",
                    icon: <Leaf className="h-6 w-6" />,
                    step: "01"
                  },
                  { 
                    title: "Formulation and Quality Testing", 
                    desc: "Ingredients are measured, processed, and tested under controlled manufacturing conditions.",
                    icon: <Microscope className="h-6 w-6" />,
                    step: "02"
                  },
                  { 
                    title: "Packaging and Labelling", 
                    desc: "Each batch is filled, labelled, and packed through compliant packaging processes.",
                    icon: <FlaskConical className="h-6 w-6" />,
                    step: "03"
                  },
                  { 
                    title: "Distribution and Traceability", 
                    desc: "Products remain linked to batch records and dispatch tracking for better traceability.",
                    icon: <ShieldCheck className="h-6 w-6" />,
                    step: "04"
                  }
                ].map((item, i, arr) => (
                  <div key={i} className="relative group p-8 lg:p-12 bg-white lg:bg-transparent hover:bg-white lg:hover:bg-white/50 transition-all duration-500 rounded-3xl lg:rounded-none lg:first:rounded-l-3xl lg:last:rounded-r-3xl border border-accent/30 lg:border-r-0 lg:last:border-r">
                    <div className="space-y-8">
                      {/* Step Visual */}
                      <div className="relative">
                        <div className="h-20 w-44 bg-[#F2EDE4] clip-chevron flex items-center justify-center text-primary group-hover:bg-accent/10 transition-colors">
                          <div className="transform -translate-x-2">
                            {item.icon}
                          </div>
                        </div>
                        <span className="absolute top-0 right-8 text-4xl font-display text-[#1A2E35]/5 font-bold group-hover:text-accent/20 transition-colors">
                          {item.step}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <h3 className="font-display font-bold text-[#1A2E35] text-lg leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                        <p className="text-sm text-[#1A2E35]/60 font-sans-clean leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                    
                  </div>
                ))}
              </div>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            .clip-chevron {
              clip-path: polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%, 15% 50%);
            }
          `}} />
        </section>


        {/* 8) Closing Section */}
        <section className="py-6 md:py-8 lg:py-10 xl:py-12 bg-secondary border-t border-[#F2EDE4]">
          <div className="container px-4 text-center max-w-3xl mx-auto">
            <SectionHeading 
              title="A Legacy of Trust" 
              animate={false}
            />
            <div className="space-y-6 text-[#1A2E35]/70 font-sans-clean leading-relaxed text-lg mb-12">
              <p>
                From a single humble lab in Karnataka to homes across Bharat, our journey has always been about one thing: the belief that Ayurveda deserves scientific rigor.
              </p>
              <p>
                At Salmara, we are building a space where faith meets evidence and healing meets honesty. Thank you for being a part of our story.
              </p>
            </div>
            <Link to="/shop" className="inline-block px-12 py-5 bg-primary text-white rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-herbal-dark transition-all shadow-2xl shadow-primary/30 transform hover:-translate-y-1">
              Explore Our Products
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />

      {/* Lightbox for Award Images */}
      <AnimatePresence>
        {selectedAwardIndex !== null && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAwardIndex(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-12 cursor-zoom-out"
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center gap-6 cursor-default"
            >
              <button 
                onClick={() => setSelectedAwardIndex(null)}
                className="absolute top-0 right-0 md:-top-4 md:-right-12 p-2 text-white/50 hover:text-white transition-colors z-50 bg-black/20 rounded-full backdrop-blur-sm"
                title="Close"
                aria-label="Close award details"
              >
                <X className="h-8 w-8" />
              </button>

              {/* Navigation Arrows */}
              <button 
                onClick={handlePrevAward}
                className="absolute left-0 md:-left-20 top-1/2 -translate-y-1/2 p-4 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
                aria-label="Previous award"
              >
                <ArrowLeft className="h-8 w-8 md:h-12 md:w-12" />
              </button>

              <button 
                onClick={handleNextAward}
                className="absolute right-0 md:-right-20 top-1/2 -translate-y-1/2 p-4 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
                aria-label="Next award"
              >
                <ArrowRight className="h-8 w-8 md:h-12 md:w-12" />
              </button>
              
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <div className="relative w-full h-[70vh] flex items-center justify-center">
                  <m.img 
                    key={awards[selectedAwardIndex].img}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={awards[selectedAwardIndex].img} 
                    alt={awards[selectedAwardIndex].title} 
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-xl"
                  />
                </div>
                
                <div className="text-center text-white mt-8 space-y-2">
                  <h2 className="text-2xl md:text-3xl font-display !text-white">{awards[selectedAwardIndex].title}</h2>
                  <div className="flex items-center justify-center gap-3">
                    <span className="h-px w-8 bg-white/20" />
                    <p className="text-white/60 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">{awards[selectedAwardIndex].year}</p>
                    <span className="h-px w-8 bg-white/20" />
                  </div>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper component for Leaf icon since it's used frequently
const Leaf = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8a7 7 0 0 1-10 10Z" />
    <path d="M7 21q-4 -1 -4 -5c0 -4.48 7 -5 7 -5" />
  </svg>
);

export default AboutUsPage;
