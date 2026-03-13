import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Award, ShieldCheck, Microscope, FlaskConical, MapPin, ArrowRight } from "lucide-react";

const AboutUsPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="relative">
        <div className="absolute top-32 left-4 md:left-8 lg:left-12 z-20">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back
          </button>
        </div>
        {/* 1) Hero Banner */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-[#1A2E35]">
          <div className="absolute inset-0 opacity-40">
            {/* Minimalistic lab/herbal visual placeholder style */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1A2E35]" />
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2080&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay animate-pulse" style={{ animationDuration: '10s' }} />
          </div>
          
          <div className="container relative z-10 px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-display font-medium text-white mb-6">
                Where Tradition <br /> Meets Science.
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 font-sans-clean leading-relaxed">
                We didn’t reinvent Ayurveda — we refined it through proof, purity, and precision.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
                <span className="flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.2em] text-[#C5A059] uppercase border border-[#C5A059]/30 px-3 py-1.5 rounded-full">
                  <ShieldCheck className="h-3 w-3" /> GMP Certified
                </span>
                <span className="flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.2em] text-[#C5A059] uppercase border border-[#C5A059]/30 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" /> ISO Compliant
                </span>
                <span className="flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.2em] text-[#C5A059] uppercase border border-[#C5A059]/30 px-3 py-1.5 rounded-full">
                  <Award className="h-3 w-3" /> AYUSH Approved
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/#products" className="w-full sm:w-auto px-8 py-4 bg-[#5A7A5C] text-white rounded-lg font-bold tracking-widest uppercase text-xs hover:bg-[#4a654c] transition-all shadow-xl shadow-black/20">
                  Explore Our Products
                </Link>
                <a href="#consultation" className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-lg font-bold tracking-widest uppercase text-xs hover:bg-white/20 transition-all">
                  Discover Our Clinics
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2) Founder’s Message */}
        <section className="py-24 md:py-32 container px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1974&auto=format&fit=crop" 
                  alt="Founder" 
                  className="rounded-2xl grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl"
                />
                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-[#5A7A5C] rounded-2xl -z-10 opacity-10" />
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-8">
              <h2 className="text-3xl md:text-4xl font-display font-medium text-[#1A2E35]">A Promise Born in Karnataka</h2>
              <div className="space-y-6 text-[#1A2E35]/70 font-sans-clean leading-relaxed text-lg">
                <p>
                  "For generations, Ayurveda has been more than just medicine in Karnataka — it has been our way of life. However, I noticed a growing gap between ancient wisdom and the modern demand for transparency."
                </p>
                <p>
                  "Salmara was founded to bridge that gap. We believe that restoring Ayurveda’s credibility requires something that feels traditional yet proven. Every bottle that leaves our facility is a testament to that — tested, verified, and crafted with uncompromising standards."
                </p>
                <p>
                  "My promise to you is simple: Ayurveda that doesn't just work in theory, but is guided by evidence and integrity."
                </p>
              </div>
              <div className="pt-4">
                <p className="font-display italic text-2xl text-[#5A7A5C]">Dr. S. Mallikarjuna</p>
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A2E35]/40 mt-2">— Founder, Salmara Ayurveda</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3) Philosophy */}
        <section className="py-24 bg-[#F8F9FA]">
          <div className="container px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-display font-medium text-[#1A2E35] mb-4">Purity. Precision. Proof.</h2>
              <p className="text-[#1A2E35]/60 font-sans-clean">The three pillars that define the Salmara standard.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div whileHover={{ y: -5 }} className="bg-white p-10 rounded-3xl shadow-sm border border-[#F2EDE4] space-y-6">
                <div className="h-14 w-14 bg-[#5A7A5C]/5 rounded-2xl flex items-center justify-center text-[#5A7A5C]">
                  <Leaf className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-display font-medium text-[#1A2E35]">Purity</h3>
                <p className="text-[#1A2E35]/60 font-sans-clean leading-relaxed">
                  Ethically sourced from the richest soil, every ingredient is verified and tested for absolute authenticity before it enters our lab.
                </p>
              </motion.div>
              
              <motion.div whileHover={{ y: -5 }} className="bg-white p-10 rounded-3xl shadow-sm border border-[#F2EDE4] space-y-6">
                <div className="h-14 w-14 bg-[#5A7A5C]/5 rounded-2xl flex items-center justify-center text-[#5A7A5C]">
                  <Microscope className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-display font-medium text-[#1A2E35]">Precision</h3>
                <p className="text-[#1A2E35]/60 font-sans-clean leading-relaxed">
                  Our GMP-certified manufacturing processes combine traditional extraction techniques with advanced modern quality controls for consistency.
                </p>
              </motion.div>
              
              <motion.div whileHover={{ y: -5 }} className="bg-white p-10 rounded-3xl shadow-sm border border-[#F2EDE4] space-y-6">
                <div className="h-14 w-14 bg-[#5A7A5C]/5 rounded-2xl flex items-center justify-center text-[#5A7A5C]">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-display font-medium text-[#1A2E35]">Proof</h3>
                <p className="text-[#1A2E35]/60 font-sans-clean leading-relaxed">
                  Guided by clinical evidence and validated processes, every batch is tested and trusted by thousands for its predictable efficiency.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 4) Certification Gallery */}
        <section className="py-24 md:py-32 container px-4">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-medium text-[#1A2E35] mb-6">Approved by Standards That Matter</h2>
            <p className="text-[#1A2E35]/60 font-sans-clean leading-relaxed">
              Integrity is not just a word; it’s a certification. Our facility and products undergo rigorous external audits to ensure they meet the highest global standards.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 border border-[#F2EDE4] rounded-2xl text-center">
              <h4 className="text-lg font-display font-bold text-[#1A2E35] mb-1">GMP Certified</h4>
              <p className="text-[10px] uppercase tracking-widest text-[#C5A059] mb-4">Quality Council of India</p>
              <p className="text-sm text-[#1A2E35]/60 font-sans-clean">Ensuring our manufacturing products are consistently produced and controlled according to quality standards.</p>
            </div>
            
            <div className="p-8 border border-[#F2EDE4] rounded-2xl text-center">
              <h4 className="text-lg font-display font-bold text-[#1A2E35] mb-1">ISO 9001:2015</h4>
              <p className="text-[10px] uppercase tracking-widest text-[#C5A059] mb-4">International Standards Organization</p>
              <p className="text-sm text-[#1A2E35]/60 font-sans-clean">Globally recognized standard for Quality Management Systems, focused on customer satisfaction and quality delivery.</p>
            </div>
            
            <div className="p-8 border border-[#F2EDE4] rounded-2xl text-center">
              <h4 className="text-lg font-display font-bold text-[#1A2E35] mb-1">AYUSH License</h4>
              <p className="text-[10px] uppercase tracking-widest text-[#C5A059] mb-4">Ministry of AYUSH, Govt. of India</p>
              <p className="text-sm text-[#1A2E35]/60 font-sans-clean">Full regulatory compliance for traditional Ayurvedic formulations and clinical procedures.</p>
            </div>
            
            <div className="p-8 border border-dashed border-[#F2EDE4] rounded-2xl text-center flex flex-col items-center justify-center min-h-[200px]">
              <p className="text-xs font-bold text-[#1A2E35]/20 uppercase tracking-widest">Add your certificate here</p>
            </div>
          </div>
        </section>

        {/* 5) Our Journey */}
        <section className="py-24 bg-[#1A2E35] text-white">
          <div className="container px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-display font-medium mb-4">From Karnataka to the World</h2>
              <p className="text-white/60 font-sans-clean">A timeline of milestones and scientific achievements.</p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-12 relative">
              <div className="absolute left-[31px] md:left-1/2 top-0 bottom-0 w-px bg-white/10 hidden md:block" />
              
              {[
                { step: "1", year: "2022", title: "Emerging Ayurvedic Brand of the Year", desc: "AYUSH Excellence Awards, Bengaluru" },
                { step: "2", year: "2023", title: "Innovation in Herbal Formulation", desc: "Indian Herbal Summit" },
                { step: "3", year: "2024", title: "Excellence in GMP Compliance", desc: "Karnataka Herbal Manufacturers' Association" },
                { step: "4", year: "2024", title: "Ayurveda for Modern Life", desc: "National Wellness Innovation Forum" }
              ].map((milestone, idx) => (
                <div key={idx} className={`flex flex-col md:flex-row items-start md:items-center gap-8 ${idx % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                  <div className="w-full md:w-1/2 flex flex-col md:items-end md:text-right px-4">
                    {idx % 2 === 0 ? (
                      <div className="space-y-4">
                        <span className="text-4xl font-display text-[#C5A059]">{milestone.year}</span>
                        <h4 className="text-xl font-bold leading-snug">{milestone.title}</h4>
                        <p className="text-white/40 text-xs uppercase tracking-widest font-bold">{milestone.desc}</p>
                      </div>
                    ) : null}
                  </div>
                  
                  <div className="h-16 w-16 rounded-full bg-[#5A7A5C] border-4 border-[#1A2E35] flex items-center justify-center shrink-0 z-10 mx-auto md:mx-0 shadow-lg shadow-[#5A7A5C]/20">
                    <span className="text-white text-sm font-bold">{milestone.step}</span>
                  </div>
                  
                  <div className="w-full md:w-1/2 px-4">
                    {idx % 2 !== 0 ? (
                      <div className="space-y-4">
                        <span className="text-4xl font-display text-[#C5A059]">{milestone.year}</span>
                        <h4 className="text-xl font-bold leading-snug">{milestone.title}</h4>
                        <p className="text-white/40 text-xs uppercase tracking-widest font-bold">{milestone.desc}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6) Awards & Recognitions */}
        <section className="py-24 md:py-32 container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-medium text-[#1A2E35] mb-4">Honoured for Our Integrity</h2>
            <p className="text-[#1A2E35]/60 font-sans-clean leading-relaxed">Building trust with the community and industry peers.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="p-10 bg-white border border-[#F2EDE4] rounded-2xl flex flex-col items-center justify-center text-center group hover:border-[#5A7A5C] transition-all">
                <Award className="h-8 w-8 text-[#5A7A5C]/20 group-hover:text-[#5A7A5C] transition-colors mb-4" />
                <h5 className="font-bold text-[#1A2E35] text-sm">Industry Recognition</h5>
                <p className="text-[10px] text-[#1A2E35]/40 mt-1 uppercase tracking-widest">202{i+1} Award</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7) The Process */}
        <section className="py-24 bg-[#F8F9FA]">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-display font-medium text-[#1A2E35] mb-6">Science Behind Every Drop</h2>
                <p className="text-[#1A2E35]/70 font-sans-clean leading-relaxed text-lg italic">
                  "Traditional Ayurveda provides the map; modern science provides the verification. Our process ensures that every product delivers on the wisdom of the ancients."
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12">
                {[
                  { title: "Raw Material Verification", desc: "Every herb is DNA-authenticated and tested for heavy metals and pesticides before entry.", icon: <Leaf className="h-6 w-6" /> },
                  { title: "Quality Testing & Formulation", desc: "Batch-controlled extraction ensures consistent phyto-actives, verified through HPLC analysis.", icon: <Microscope className="h-6 w-6" /> },
                  { title: "Packaging & Labelling", desc: "Controlled environment packaging to prevent oxidative damage and maintain bio-potency.", icon: <ShieldCheck className="h-6 w-6" /> },
                  { title: "Distribution & Feedback", desc: "Direct distribution with full QR traceability and transparent feedback integration.", icon: <CheckCircle2 className="h-6 w-6" /> }
                ].map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="h-12 w-12 rounded-xl bg-white border border-[#F2EDE4] flex items-center justify-center shrink-0 text-[#5A7A5C] shadow-sm">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-[#1A2E35] mb-2">{step.title}</h4>
                      <p className="text-sm text-[#1A2E35]/60 font-sans-clean leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-20 text-center">
                <Link to="/#products" className="inline-flex items-center gap-3 px-10 py-4 bg-[#5A7A5C] text-white rounded-lg font-bold tracking-widest uppercase text-xs hover:bg-[#4a654c] transition-all">
                  Explore Our Products <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 container px-4 overflow-hidden">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-medium text-[#1A2E35]">Trust in Every Word</h2>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-[#FDFBF7] p-10 rounded-3xl border border-[#F2EDE4] relative">
              <div className="absolute top-8 right-8 text-[#5A7A5C]/10 text-6xl font-display self-end">“</div>
              <p className="text-[#1A2E35]/80 font-sans-clean italic leading-relaxed mb-6">
                "Having used various brands, the transparency Salmara offers through their testing certificates changed how I perceive Ayurveda. It’s effective and reliable."
              </p>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-[#5A7A5C]/10 rounded-full flex items-center justify-center text-[#5A7A5C] font-bold text-xs">RK</div>
                <div>
                  <p className="font-bold text-[#1A2E35] text-sm">Rakesh K.</p>
                  <p className="text-[10px] uppercase text-[#1A2E35]/40 tracking-widest">Verified Customer</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#FDFBF7] p-10 rounded-3xl border border-[#F2EDE4] relative">
              <div className="absolute top-8 right-8 text-[#5A7A5C]/10 text-6xl font-display self-end">“</div>
              <p className="text-[#1A2E35]/80 font-sans-clean italic leading-relaxed mb-6">
                "Finally, an Ayurvedic brand that prioritizes quality standards over marketing. Their products have become a staple in my wellness routine."
              </p>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-[#5A7A5C]/10 rounded-full flex items-center justify-center text-[#5A7A5C] font-bold text-xs">SP</div>
                <div>
                  <p className="font-bold text-[#1A2E35] text-sm">Sunita P.</p>
                  <p className="text-[10px] uppercase text-[#1A2E35]/40 tracking-widest">Wellness Enthusiast</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8) Closing Section */}
        <section className="py-24 md:py-32 bg-[#FDFBF7] border-t border-[#F2EDE4]">
          <div className="container px-4 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-display font-medium text-[#1A2E35] mb-8">A Legacy of Trust</h2>
            <div className="space-y-6 text-[#1A2E35]/70 font-sans-clean leading-relaxed text-lg mb-12">
              <p>
                From a single humble lab in Karnataka to homes across Bharat, our journey has always been about one thing: the belief that Ayurveda deserves scientific rigor.
              </p>
              <p>
                At Salmara, we are building a space where faith meets evidence and healing meets honesty. Thank you for being a part of our story.
              </p>
            </div>
            <Link to="/#products" className="inline-block px-12 py-5 bg-[#5A7A5C] text-white rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-[#4a654c] transition-all shadow-2xl shadow-[#5A7A5C]/30 transform hover:-translate-y-1">
              Explore Our Products
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
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
