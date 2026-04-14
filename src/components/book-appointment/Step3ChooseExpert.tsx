import React, { memo } from 'react';
import { m } from 'framer-motion';
import { CheckCircle2, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { Image } from '@/components/ui/Image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StepProps } from './types';

const doctors = [
  { id: 1, name: "Dr. Anirudh Sharma", specialty: "Chronic Pain & Joint Health", exp: "12+ Years Exp", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop" },
  { id: 2, name: "Dr. Lakshmi Prasad", specialty: "Women's Wellness & Hormonal Balance", exp: "10+ Years Exp", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1974&auto=format&fit=crop" },
  { id: 3, name: "Dr. S. Mallikarjuna", specialty: "Internal Medicine & Detox", exp: "15+ Years Exp", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop" }
];

const Step3ChooseExpert = memo(({ selection, setSelection, nextStep, prevStep }: StepProps) => {
  return (
    <m.div 
      key="step3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      <SectionHeading 
        title="Choose Your Expert"
        description="All our practitioners are certified experts in traditional Ayurveda."
        animate={false}
      />
      <div className="grid gap-8">
        {doctors.map((dr) => (
          <button 
            key={dr.id}
            onClick={() => { setSelection(prev => ({...prev, doctor: dr})); nextStep(); }}
            className="group bg-white p-8 border border-[#F2EDE4] rounded-3xl flex flex-col md:flex-row items-center gap-10 hover:border-[#5A7A5C] hover:shadow-2xl transition-all duration-500 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-[#5A7A5C]/10 group-hover:bg-[#5A7A5C] transition-all" />
            
            <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500">
              <Image src={dr.image} alt={dr.name} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" />
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
    </m.div>
  );
});

Step3ChooseExpert.displayName = 'Step3ChooseExpert';
export default Step3ChooseExpert;
