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
      
      <main className="pt-32 pb-24 bg-[#F8F9FA]">
        <div className="container px-4 max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-12">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2E35]/40 hover:text-[#1A2E35] transition-all group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Dashboard
            </button>
          </div>

          {/* Header & Progress */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-display font-medium text-[#1A2E35] mb-6 tracking-tight">Book Your Consultation</h1>
            <p className="text-[#1A2E35]/60 font-sans-clean max-w-xl mx-auto leading-relaxed">Experience personalized Ayurvedic care from our expert practitioners. Take the first step towards balanced, long-term health.</p>
          </div>

          {step < 5 && (
            <div className="flex items-center justify-between mb-20 relative px-4 max-w-3xl mx-auto">
              <div className="absolute top-5 left-10 right-10 h-[2px] bg-[#F2EDE4] -z-10" />
              {steps.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-4 relative">
                  <motion.div 
                    initial={false}
                    animate={{ 
                      scale: step === i + 1 ? 1.1 : 1,
                      backgroundColor: step > i + 1 ? '#5A7A5C' : step === i + 1 ? '#FFFFFF' : '#FFFFFF',
                      borderColor: step >= i + 1 ? '#5A7A5C' : '#F2EDE4',
                      color: step > i + 1 ? '#FFFFFF' : step === i + 1 ? '#5A7A5C' : '#1A2E35/20'
                    }}
                    className={`h-11 w-11 rounded-full flex items-center justify-center transition-all duration-500 border-2 shadow-sm z-10`}
                  >
                    {step > i + 1 ? <CheckCircle2 className="h-5 w-5" /> : 
                     <span className="text-xs font-bold">{i + 1}</span>}
                  </motion.div>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.15em] absolute -bottom-8 whitespace-nowrap transition-colors duration-300 ${step === i + 1 ? 'text-[#1A2E35]' : 'text-[#1A2E35]/30'}`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: CONSULTATION TYPE */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-display font-medium text-[#1A2E35]">How would you like to visit us?</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <button 
                    onClick={() => { setSelection({...selection, type: "In-Person", clinic: "Indiranagar"}); nextStep(); }}
                    className="group relative p-12 bg-white border border-[#F2EDE4] rounded-[2.5rem] hover:border-[#5A7A5C] hover:shadow-2xl transition-all duration-500 text-left overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#5A7A5C]/5 rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    
                    <div className="h-16 w-16 bg-[#FDFBF7] rounded-2xl flex items-center justify-center text-[#5A7A5C] mb-8 border border-[#F2EDE4] group-hover:bg-[#5A7A5C] group-hover:text-white group-hover:border-[#5A7A5C] transition-all duration-500">
                      <MapPin className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-display font-medium text-[#1A2E35] mb-4">In-Person Clinic Visit</h3>
                    <p className="text-base text-[#1A2E35]/50 font-sans-clean leading-relaxed mb-8">Visit our certified centers in Bengaluru for a physical pulse examination and direct interaction with senior doctors.</p>
                    <div className="inline-flex items-center gap-3 text-xs font-bold text-[#5A7A5C] uppercase tracking-widest border-b-2 border-[#5A7A5C]/20 pb-1 group-hover:border-[#5A7A5C] transition-all">
                      Select Location <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>

                  <button 
                    onClick={() => { setSelection({...selection, type: "Virtual", clinic: "Digital Clinic"}); nextStep(); }}
                    className="group relative p-12 bg-white border border-[#F2EDE4] rounded-[2.5rem] hover:border-[#C5A059] hover:shadow-2xl transition-all duration-500 text-left overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                    <div className="h-16 w-16 bg-[#FDFBF7] rounded-2xl flex items-center justify-center text-[#C5A059] mb-8 border border-[#F2EDE4] group-hover:bg-[#C5A059] group-hover:text-white group-hover:border-[#C5A059] transition-all duration-500">
                      <Video className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-display font-medium text-[#1A2E35] mb-4">Virtual Video Consult</h3>
                    <p className="text-base text-[#1A2E35]/50 font-sans-clean leading-relaxed mb-8">Expert guidance from the comfort of your home. Secure high-definition video calls with our senior consultants.</p>
                    <div className="inline-flex items-center gap-3 text-xs font-bold text-[#C5A059] uppercase tracking-widest border-b-2 border-[#C5A059]/20 pb-1 group-hover:border-[#C5A059] transition-all">
                      Book Digital Slot <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DATE & TIME */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="bg-white p-8 md:p-14 border border-[#F2EDE4] rounded-[2.5rem] shadow-sm">
                  <div className="grid lg:grid-cols-2 gap-16">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-8 bg-[#5A7A5C]/10 rounded-lg flex items-center justify-center text-[#5A7A5C]">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A2E35]">Select Date</label>
                      </div>
                      <div className="bg-[#F8F9FA] rounded-3xl border border-[#F2EDE4] p-6 flex justify-center shadow-inner">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            if (date) {
                              setSelection({ ...selection, date: format(date, "MMM dd, yyyy") });
                            }
                          }}
                          className="rounded-md border-none scale-110 md:scale-125 my-4"
                          disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0,0,0,0))}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-8 bg-[#C5A059]/10 rounded-lg flex items-center justify-center text-[#C5A059]">
                          <Clock className="h-4 w-4" />
                        </div>
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A2E35]">Select Time</label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {timeSlots.map((t) => (
                          <button 
                            key={t}
                            onClick={() => setSelection({...selection, time: t})}
                            className={`py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 border ${selection.time === t ? 'bg-[#1A2E35] border-[#1A2E35] text-white shadow-xl transform -translate-y-1' : 'bg-white border-[#F2EDE4] text-[#1A2E35]/60 hover:border-[#5A7A5C] hover:text-[#5A7A5C]'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <div className="mt-8 p-6 bg-[#F8F9FA] rounded-2xl border border-[#F2EDE4] flex items-start gap-3">
                        <Info className="h-4 w-4 text-[#C5A059] shrink-0 mt-0.5" />
                        <p className="text-[10px] text-[#1A2E35]/50 leading-relaxed font-sans-clean">Choose an available slot. Each consultation typically lasts 45-60 minutes for a thorough assessment.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-16 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-[#F2EDE4] pt-10">
                    <button onClick={prevStep} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 hover:text-[#1A2E35] transition-colors order-2 sm:order-1">
                      <ChevronLeft className="h-4 w-4" /> Reset Change
                    </button>
                    <button 
                      disabled={!selection.date || !selection.time}
                      onClick={nextStep} 
                      className="bg-[#5A7A5C] text-white px-12 py-5 rounded-2xl text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#4a654c] transition-all shadow-xl shadow-[#5A7A5C]/20 disabled:opacity-20 disabled:cursor-not-allowed order-1 sm:order-2 w-full sm:w-auto transform hover:-translate-y-1"
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-display font-medium text-[#1A2E35]">Choose Your Expert</h2>
                  <p className="text-sm text-[#1A2E35]/50 font-sans-clean mt-2">All our practitioners are certified experts in traditional Ayurveda.</p>
                </div>
                <div className="grid gap-8">
                  {doctors.map((dr) => (
                    <button 
                      key={dr.id}
                      onClick={() => { setSelection({...selection, doctor: dr}); nextStep(); }}
                      className="group bg-white p-8 border border-[#F2EDE4] rounded-3xl flex flex-col md:flex-row items-center gap-10 hover:border-[#5A7A5C] hover:shadow-2xl transition-all duration-500 text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-2 h-full bg-[#5A7A5C]/10 group-hover:bg-[#5A7A5C] transition-all" />
                      
                      <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500">
                        <img src={dr.image} alt={dr.name} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-display font-medium text-[#1A2E35] group-hover:text-[#5A7A5C] transition-colors">{dr.name}</h3>
                          <div className="px-4 py-1.5 bg-[#F8F9FA] text-[#1A2E35]/60 border border-[#F2EDE4] rounded-full text-[10px] font-bold uppercase tracking-widest">Expert Practitioner</div>
                        </div>
                        <p className="text-base font-sans-clean font-medium text-[#1A2E35]/70 leading-relaxed">{dr.specialty}</p>
                        <p className="inline-flex items-center gap-2 text-xs font-sans-clean text-[#5A7A5C] font-bold bg-[#5A7A5C]/5 px-3 py-1.5 rounded-lg border border-[#5A7A5C]/10">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {dr.exp}
                        </p>
                        <div className="pt-4 flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-2 text-[10px] text-[#1A2E35]/60 font-bold uppercase tracking-[0.1em]">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#5A7A5C] animate-pulse" /> Available On {selection.date}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#1A2E35]/60 font-bold uppercase tracking-[0.1em]">
                            <Clock className="h-3.5 w-3.5 text-[#C5A059]" /> {selection.time}
                          </div>
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-full border border-[#F2EDE4] flex items-center justify-center text-[#1A2E35]/20 group-hover:bg-[#1A2E35] group-hover:text-white group-hover:border-[#1A2E35] transition-all shrink-0 shadow-sm mt-4 md:mt-0">
                        <ChevronRight className="h-6 w-6" />
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-center pt-8">
                  <button onClick={prevStep} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 hover:text-[#1A2E35] transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Reset Date & Time
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: CONFIRMATION */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="grid lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 border border-[#F2EDE4] rounded-[2.5rem] shadow-sm space-y-10">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-[#5A7A5C]/10 rounded-xl flex items-center justify-center text-[#5A7A5C]">
                          <User className="h-5 w-5" />
                        </div>
                        <h3 className="text-2xl font-display font-medium text-[#1A2E35]">Patient Details</h3>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2E35]/40 ml-1">Full Name</label>
                          <input 
                            type="text" 
                            placeholder="Your full name"
                            className="w-full bg-[#F8F9FA] border border-[#F2EDE4] rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-[#5A7A5C] transition-all focus:bg-white focus:shadow-lg focus:shadow-[#5A7A5C]/5"
                            value={selection.details.name}
                            onChange={(e) => setSelection({...selection, details: {...selection.details, name: e.target.value}})}
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2E35]/40 ml-1">Phone Number</label>
                          <input 
                            type="tel" 
                            placeholder="+91 00000 00000"
                            className="w-full bg-[#F8F9FA] border border-[#F2EDE4] rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-[#5A7A5C] transition-all focus:bg-white focus:shadow-lg focus:shadow-[#5A7A5C]/5"
                            value={selection.details.phone}
                            onChange={(e) => setSelection({...selection, details: {...selection.details, phone: e.target.value}})}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2E35]/40 ml-1">Email Address</label>
                        <input 
                          type="email" 
                          placeholder="email@example.com"
                          className="w-full bg-[#F8F9FA] border border-[#F2EDE4] rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-[#5A7A5C] transition-all focus:bg-white focus:shadow-lg focus:shadow-[#5A7A5C]/5"
                          value={selection.details.email}
                          onChange={(e) => setSelection({...selection, details: {...selection.details, email: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2E35]/40 ml-1">Primary Concern (Optional)</label>
                        <textarea 
                          placeholder="Please mention any health issues or symptoms you'd like to discuss..."
                          className="w-full bg-[#F8F9FA] border border-[#F2EDE4] rounded-2xl px-6 py-5 text-sm h-40 resize-none focus:outline-none focus:border-[#5A7A5C] transition-all focus:bg-white focus:shadow-lg focus:shadow-[#5A7A5C]/5"
                          value={selection.details.concern}
                          onChange={(e) => setSelection({...selection, details: {...selection.details, concern: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-[#1A2E35] text-white p-10 rounded-[2.5rem] shadow-2xl shadow-[#1A2E35]/20 space-y-10 border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[4rem] -mr-8 -mt-8" />
                      
                      <h3 className="text-xl font-display font-medium border-b border-white/10 pb-6">Summary</h3>
                      <div className="space-y-8">
                        <div className="flex gap-4">
                          <div className="h-11 w-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                            {selection.type === "Virtual" ? <Video className="h-5 w-5 text-[#C5A059]" /> : <MapPin className="h-5 w-5 text-[#C5A059]" />}
                          </div>
                          <div>
                            <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em] mb-1">Consultation Mode</p>
                            <p className="text-sm font-sans-clean font-medium">{selection.type} Visit</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="h-11 w-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                            <CalendarCheck className="h-5 w-5 text-[#C5A059]" />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em] mb-1">Appointment Schedule</p>
                            <p className="text-sm font-sans-clean font-medium">{selection.date} at {selection.time}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="h-11 w-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/10 overflow-hidden shadow-inner">
                            <img src={selection.doctor?.image} className="w-full h-full object-cover grayscale-[30%]" />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em] mb-1">Selected Expert</p>
                            <p className="text-sm font-sans-clean font-medium line-clamp-1">{selection.doctor?.name}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-10 border-t border-white/10 space-y-8">
                        <div className="flex justify-between items-center">
                          <span className="text-sm opacity-50 font-sans-clean">Consultation Fee</span>
                          <span className="font-display text-2xl text-[#C5A059]">₹499</span>
                        </div>
                        <button 
                          disabled={!selection.details.name || !selection.details.phone || !selection.details.email}
                          onClick={nextStep}
                          className="w-full bg-[#5A7A5C] text-white py-5 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#4a654c] transition-all disabled:opacity-20 shadow-xl shadow-[#5A7A5C]/20 transform hover:-translate-y-1"
                        >
                          Confirm Appointment
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-white border border-[#F2EDE4] rounded-2xl flex gap-4">
                      <div className="h-10 w-10 bg-[#5A7A5C]/10 rounded-full flex items-center justify-center shrink-0 text-[#5A7A5C]">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <p className="text-[10px] text-[#1A2E35]/50 leading-relaxed font-sans-clean">Your data is secured by industry-standard encryption. Salmara Ayurveda maintains 100% patient confidentiality.</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center pt-8">
                  <button onClick={prevStep} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 hover:text-[#1A2E35] transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Change Practitioner
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: SUCCESS STATE */}
            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto text-center py-16"
              >
                <motion.div 
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="h-28 w-28 bg-[#5A7A5C] rounded-full flex items-center justify-center text-white mx-auto mb-12 shadow-[0_20px_50px_rgba(90,122,92,0.3)] relative"
                >
                  <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping opacity-20" />
                  <CheckCircle2 className="h-14 w-14" />
                </motion.div>
                
                <h2 className="text-4xl md:text-6xl font-display font-medium text-[#1A2E35] mb-6 tracking-tight">Appointment Secured</h2>
                <p className="text-lg text-[#1A2E35]/60 font-sans-clean mb-12 max-w-md mx-auto leading-relaxed">We've reserved your session with **{selection.doctor?.name}**. Your journey to holistic wellness starts here.</p>
                
                <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-[#F2EDE4] shadow-xl shadow-[#1A2E35]/5 mb-12 space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#5A7A5C]/5 rounded-bl-[6rem] -mr-8 -mt-8" />
                  
                  <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 py-8 border-y border-[#F2EDE4]">
                    <div className="text-center md:text-left">
                      <p className="text-[10px] font-bold text-[#1A2E35]/40 uppercase tracking-[0.2em] mb-2 text-center md:text-left">Confirmation ID</p>
                      <p className="font-display font-medium text-2xl text-[#1A2E35]">SAL-094382</p>
                    </div>
                    <div className="h-12 w-px bg-[#F2EDE4] hidden md:block" />
                    <div className="text-center md:text-left">
                      <p className="text-[10px] font-bold text-[#1A2E35]/40 uppercase tracking-[0.2em] mb-2 text-center md:text-left">Schedule</p>
                      <p className="font-display font-medium text-2xl text-[#1A2E35]">{selection.date} • {selection.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 justify-center bg-[#F8F9FA] px-8 py-5 rounded-2xl border border-[#F2EDE4]">
                    <Info className="h-5 w-5 text-[#C5A059]" />
                    <p className="text-xs text-[#1A2E35]/60 font-sans-clean leading-relaxed">
                      Assigned instructions and a calendar invite have been sent to **{selection.details.email}**.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link 
                    to="/dashboard"
                    className="bg-[#1A2E35] text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#1A2E35]/90 transition-all shadow-2xl shadow-[#1A2E35]/20 transform hover:-translate-y-1"
                  >
                    Go to Dashboard
                  </Link>
                  <Link 
                    to="/"
                    className="px-12 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs border border-[#F2EDE4] text-[#1A2E35]/60 hover:bg-white hover:border-[#F2EDE4] hover:shadow-lg transition-all"
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
