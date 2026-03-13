import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  MapPin, 
  Video, 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  ChevronLeft,
  CalendarCheck,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Info
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

const doctors = [
  { id: 1, name: "Dr. Anirudh Sharma", specialty: "Chronic Pain & Joint Health", exp: "12+ Years Exp", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop" },
  { id: 2, name: "Dr. Lakshmi Prasad", specialty: "Women's Wellness & Hormonal Balance", exp: "10+ Years Exp", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1974&auto=format&fit=crop" },
  { id: 3, name: "Dr. S. Mallikarjuna", specialty: "Internal Medicine & Detox", exp: "15+ Years Exp", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop" }
];

const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"];

const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    type: "",
    clinic: "",
    date: "",
    time: "",
    doctor: null as any,
    details: { name: "", email: "", phone: "", concern: "" }
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const steps = [
    { title: "Consultation Type", icon: <Stethoscope className="h-4 w-4" /> },
    { title: "Date & Time", icon: <Calendar className="h-4 w-4" /> },
    { title: "Choose Expert", icon: <User className="h-4 w-4" /> },
    { title: "Confirmation", icon: <CheckCircle2 className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-32 pb-24">
        <div className="container px-4 max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1A2E35]/40 hover:text-[#1A2E35] transition-all group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back
            </button>
          </div>

          {/* Header & Progress */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-display font-medium text-[#1A2E35] mb-4">Book Your Consultation</h1>
            <p className="text-[#1A2E35]/50 font-sans-clean">Take the first step towards balanced, long-term health.</p>
          </div>

          {step < 5 && (
            <div className="flex items-center justify-between mb-16 relative px-2">
              <div className="absolute top-1/2 left-0 w-full h-px bg-[#F2EDE4] -z-10" />
              {steps.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${step > i + 1 ? 'bg-[#5A7A5C] border-[#5A7A5C] text-white' : step === i + 1 ? 'bg-white border-[#5A7A5C] text-[#5A7A5C]' : 'bg-white border-[#F2EDE4] text-[#1A2E35]/20'}`}>
                    {step > i + 1 ? <CheckCircle2 className="h-5 w-5" /> : s.icon}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest hidden md:block ${step === i + 1 ? 'text-[#5A7A5C]' : 'text-[#1A2E35]/30'}`}>{s.title}</span>
                </div>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: CONSULTATION TYPE */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-xl font-display font-medium text-[#1A2E35]">How would you like to visit us?</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <button 
                    onClick={() => { setSelection({...selection, type: "In-Person", clinic: "Indiranagar"}); nextStep(); }}
                    className="p-10 bg-white border border-[#F2EDE4] rounded-2xl hover:border-[#5A7A5C] hover:shadow-xl transition-all group text-left"
                  >
                    <div className="h-12 w-12 bg-[#FDFBF7] rounded-xl flex items-center justify-center text-[#5A7A5C] mb-6 group-hover:bg-[#5A7A5C] group-hover:text-white transition-all">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-display font-medium text-[#1A2E35] mb-2">In-Person Clinic Visit</h3>
                    <p className="text-sm text-[#1A2E35]/50 font-sans-clean leading-relaxed mb-6">Visit our certified centers in Bengaluru for a physical pulse examination and direct interaction.</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#5A7A5C] uppercase tracking-widest">
                      Explore Locations <ArrowRight className="h-3 w-3" />
                    </div>
                  </button>
                  <button 
                    onClick={() => { setSelection({...selection, type: "Virtual", clinic: "Digital Clinic"}); nextStep(); }}
                    className="p-10 bg-white border border-[#F2EDE4] rounded-2xl hover:border-[#5A7A5C] hover:shadow-xl transition-all group text-left"
                  >
                    <div className="h-12 w-12 bg-[#FDFBF7] rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Video className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-display font-medium text-[#1A2E35] mb-2">Virtual Video Consult</h3>
                    <p className="text-sm text-[#1A2E35]/50 font-sans-clean leading-relaxed mb-6">Expert guidance from the comfort of your home. Secure HD video calls with our senior consultants.</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                      Book Digital Slot <ArrowRight className="h-3 w-3" />
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DATE & TIME */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 md:p-12 border border-[#F2EDE4] rounded-2xl">
                  <div className="grid lg:grid-cols-2 gap-12">
                    <div className="flex flex-col">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]/40 mb-4 block">Select Date</label>
                      <div className="bg-[#FDFBF7] rounded-xl border border-[#F2EDE4] p-2 flex justify-center">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            if (date) {
                              setSelection({ ...selection, date: format(date, "MMM dd, yyyy") });
                            }
                          }}
                          className="rounded-md border-none"
                          disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0,0,0,0))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]/40 mb-4 block">Select Time</label>
                      <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map((t) => (
                          <button 
                            key={t}
                            onClick={() => setSelection({...selection, time: t})}
                            className={`py-3 rounded-lg text-xs font-sans-clean transition-all border ${selection.time === t ? 'bg-[#5A7A5C] border-[#5A7A5C] text-white shadow-lg' : 'bg-[#FDFBF7] border-[#F2EDE4] text-[#1A2E35]/70 hover:border-[#5A7A5C]'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 flex justify-between items-center border-t border-[#F2EDE4] pt-8">
                    <button onClick={prevStep} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1A2E35]/40 hover:text-[#1A2E35]">
                      <ChevronLeft className="h-4 w-4" /> Back
                    </button>
                    <button 
                      disabled={!selection.date || !selection.time}
                      onClick={nextStep} 
                      className="bg-[#1A2E35] text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#1A2E35]/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next: Choose Expert
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PICK DOCTOR */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid gap-6">
                  {doctors.map((dr) => (
                    <button 
                      key={dr.id}
                      onClick={() => { setSelection({...selection, doctor: dr}); nextStep(); }}
                      className="group bg-white p-6 border border-[#F2EDE4] rounded-2xl flex flex-col md:flex-row items-center gap-8 hover:border-[#5A7A5C] hover:shadow-xl transition-all text-left"
                    >
                      <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl overflow-hidden shrink-0">
                        <img src={dr.image} alt={dr.name} className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-display font-medium text-[#1A2E35]">{dr.name}</h3>
                          <div className="px-3 py-1 bg-[#5A7A5C]/5 text-[#5A7A5C] rounded-full text-[10px] font-bold uppercase tracking-widest">Top Expert</div>
                        </div>
                        <p className="text-sm font-sans-clean font-medium text-[#1A2E35]/70">{dr.specialty}</p>
                        <p className="text-xs font-sans-clean text-[#1A2E35]/40">{dr.exp}</p>
                        <div className="pt-4 flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[10px] text-[#5A7A5C] font-bold uppercase tracking-widest">
                            <CheckCircle2 className="h-3 w-3" /> Available On {selection.date}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#1A2E35]/40 font-bold uppercase tracking-widest">
                            <Clock className="h-3 w-3" /> {selection.time}
                          </div>
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-full border border-[#F2EDE4] flex items-center justify-center text-[#1A2E35]/20 group-hover:bg-[#5A7A5C] group-hover:text-white group-hover:border-[#5A7A5C] transition-all shrink-0">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-start">
                  <button onClick={prevStep} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1A2E35]/40 hover:text-[#1A2E35]">
                    <ChevronLeft className="h-4 w-4" /> Reset Time
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: CONFIRMATION */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 border border-[#F2EDE4] rounded-2xl space-y-6">
                      <h3 className="text-lg font-display font-medium text-[#1A2E35]">Personal Details</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 ml-1">Full Name</label>
                          <input 
                            type="text" 
                            placeholder="Your name"
                            className="w-full bg-[#FDFBF7] border border-[#F2EDE4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#5A7A5C]"
                            value={selection.details.name}
                            onChange={(e) => setSelection({...selection, details: {...selection.details, name: e.target.value}})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 ml-1">Phone Number</label>
                          <input 
                            type="tel" 
                            placeholder="+91 00000 00000"
                            className="w-full bg-[#FDFBF7] border border-[#F2EDE4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#5A7A5C]"
                            value={selection.details.phone}
                            onChange={(e) => setSelection({...selection, details: {...selection.details, phone: e.target.value}})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 ml-1">Email Address</label>
                        <input 
                          type="email" 
                          placeholder="email@example.com"
                          className="w-full bg-[#FDFBF7] border border-[#F2EDE4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#5A7A5C]"
                          value={selection.details.email}
                          onChange={(e) => setSelection({...selection, details: {...selection.details, email: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 ml-1">Primary Concern (Optional)</label>
                        <textarea 
                          placeholder="Briefly describe what you'd like to discuss..."
                          className="w-full bg-[#FDFBF7] border border-[#F2EDE4] rounded-xl px-4 py-3 text-sm h-32 resize-none focus:outline-none focus:border-[#5A7A5C]"
                          value={selection.details.concern}
                          onChange={(e) => setSelection({...selection, details: {...selection.details, concern: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#1A2E35] text-white p-8 rounded-2xl space-y-8">
                      <h3 className="text-lg font-display font-medium">Booking Summary</h3>
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                            {selection.type === "Virtual" ? <Video className="h-5 w-5 text-blue-400" /> : <MapPin className="h-5 w-5 text-[#C5A059]" />}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold border-b border-white/10 pb-1 mb-1 opacity-40 uppercase tracking-widest">Mode</p>
                            <p className="text-sm font-sans-clean">{selection.type} ({selection.clinic})</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                            <CalendarCheck className="h-5 w-5 text-[#C5A059]" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold border-b border-white/10 pb-1 mb-1 opacity-40 uppercase tracking-widest">Schedule</p>
                            <p className="text-sm font-sans-clean">{selection.date}, {selection.time}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                            <img src={selection.doctor?.image} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold border-b border-white/10 pb-1 mb-1 opacity-40 uppercase tracking-widest">Practitioner</p>
                            <p className="text-sm font-sans-clean">{selection.doctor?.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-8 border-t border-white/10">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-sm opacity-60">Consultation Fee</span>
                          <span className="font-display text-xl">₹499</span>
                        </div>
                        <button 
                          disabled={!selection.details.name || !selection.details.phone || !selection.details.email}
                          onClick={nextStep}
                          className="w-full bg-[#5A7A5C] py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#4a654c] transition-all disabled:opacity-30 shadow-xl shadow-[#5A7A5C]/20"
                        >
                          Confirm & Book
                        </button>
                      </div>
                    </div>
                    <div className="p-4 bg-[#F2EDE4]/30 rounded-xl flex gap-3">
                      <ShieldCheck className="h-5 w-5 text-[#5A7A5C] shrink-0" />
                      <p className="text-[10px] text-[#1A2E35]/60 leading-relaxed font-sans-clean">Your health data is encrypted and strictly private. Salmara Ayurveda complies with global standards for patient confidentiality.</p>
                    </div>
                  </div>
                </div>
                <button onClick={prevStep} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1A2E35]/40 hover:text-[#1A2E35]">
                  <ChevronLeft className="h-4 w-4" /> Change Professional
                </button>
              </motion.div>
            )}

            {/* STEP 5: SUCCESS STATE */}
            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto text-center py-12"
              >
                <div className="h-24 w-24 bg-[#5A7A5C] rounded-full flex items-center justify-center text-white mx-auto mb-10 shadow-2xl shadow-[#5A7A5C]/30 animate-bounce" style={{ animationDuration: '3s' }}>
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-medium text-[#1A2E35] mb-6">Appointment Confirmed!</h2>
                <div className="bg-white p-8 rounded-3xl border border-[#F2EDE4] mb-10 space-y-6">
                  <p className="text-lg text-[#1A2E35]/70 font-sans-clean">We've reserved your slot with **{selection.doctor?.name}**.</p>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4 border-y border-[#F2EDE4]">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-[#1A2E35]/40 uppercase tracking-widest mb-1">Confirmation ID</p>
                      <p className="font-display font-medium text-[#1A2E35]">SAL-094382</p>
                    </div>
                    <div className="h-8 w-px bg-[#F2EDE4] hidden md:block" />
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-[#1A2E35]/40 uppercase tracking-widest mb-1">Time & Date</p>
                      <p className="font-display font-medium text-[#1A2E35]">{selection.date} at {selection.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-center text-xs text-[#1A2E35]/50 font-sans-clean">
                    <Info className="h-4 w-4 text-[#C5A059]" />
                    A confirmation email & SMS has been sent to your registered contacts.
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    to="/dashboard"
                    className="bg-[#1A2E35] text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#1A2E35]/90 transition-all shadow-xl"
                  >
                    View in Dashboard
                  </Link>
                  <Link 
                    to="/"
                    className="px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs border border-[#F2EDE4] hover:bg-[#F2EDE4]/30 transition-all"
                  >
                    Return Home
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookAppointmentPage;
