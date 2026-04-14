import React, { memo } from 'react';
import { m } from 'framer-motion';
import { CalendarCheck, ShieldCheck, ChevronLeft, MapPin, Video } from 'lucide-react';
import { Image } from '@/components/ui/Image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StepProps } from './types';

const Step4PatientDetails = memo(({ selection, setSelection, nextStep, prevStep }: StepProps) => {
  const isDetailsComplete = selection.details.name && selection.details.phone && selection.details.email;

  return (
    <m.div 
      key="step4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 border border-[#F2EDE4] rounded-[2.5rem] shadow-sm space-y-10">
            <SectionHeading 
              title="Patient Details"
              centered={false}
              animate={false}
              className="mb-0"
            />
            
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2E35]/40 ml-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Your full name"
                  className="w-full bg-[#F8F9FA] border border-[#F2EDE4] rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-[#5A7A5C] transition-all focus:bg-white focus:shadow-lg focus:shadow-[#5A7A5C]/5"
                  value={selection.details.name}
                  onChange={(e) => setSelection(prev => ({...prev, details: {...prev.details, name: e.target.value}}))}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2E35]/40 ml-1">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+91 00000 00000"
                  className="w-full bg-[#F8F9FA] border border-[#F2EDE4] rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-[#5A7A5C] transition-all focus:bg-white focus:shadow-lg focus:shadow-[#5A7A5C]/5"
                  value={selection.details.phone}
                  onChange={(e) => setSelection(prev => ({...prev, details: {...prev.details, phone: e.target.value}}))}
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
                onChange={(e) => setSelection(prev => ({...prev, details: {...prev.details, email: e.target.value}}))}
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2E35]/40 ml-1">Primary Concern (Optional)</label>
              <textarea 
                placeholder="Please mention any health issues or symptoms you'd like to discuss..."
                className="w-full bg-[#F8F9FA] border border-[#F2EDE4] rounded-2xl px-6 py-5 text-sm h-40 resize-none focus:outline-none focus:border-[#5A7A5C] transition-all focus:bg-white focus:shadow-lg focus:shadow-[#5A7A5C]/5"
                value={selection.details.concern}
                onChange={(e) => setSelection(prev => ({...prev, details: {...prev.details, concern: e.target.value}}))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#1A2E35] text-white p-10 rounded-[2.5rem] shadow-2xl shadow-[#1A2E35]/20 space-y-10 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[4rem] -mr-8 -mt-8" />
            
            <h2 className="text-xl font-display font-medium border-b border-white/10 pb-6">Summary</h2>
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
                  <Image src={selection.doctor?.image} alt={selection.doctor?.name} className="w-full h-full object-cover grayscale-[30%]" />
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
                disabled={!isDetailsComplete}
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
    </m.div>
  );
});

Step4PatientDetails.displayName = 'Step4PatientDetails';
export default Step4PatientDetails;
