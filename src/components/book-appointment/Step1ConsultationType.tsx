import React, { memo } from 'react';
import { m } from 'framer-motion';
import { MapPin, Video, ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StepProps } from './types';

const Step1ConsultationType = memo(({ selection, setSelection, nextStep }: StepProps) => {
  return (
    <m.div 
      key="step1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <SectionHeading 
        title="How would you like to visit us?"
        animate={false}
      />
      <div className="grid md:grid-cols-2 gap-8">
        <button 
          onClick={() => { setSelection(prev => ({...prev, type: "In-Person", clinic: "Indiranagar"})); nextStep(); }}
          className="group relative p-12 bg-white border border-[#F2EDE4] rounded-[2.5rem] hover:border-[#5A7A5C] hover:shadow-2xl transition-all duration-500 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#5A7A5C]/5 rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          
          <div className="h-16 w-16 bg-[#FDFBF7] rounded-2xl flex items-center justify-center text-[#5A7A5C] mb-8 border border-[#F2EDE4] group-hover:bg-[#5A7A5C] group-hover:text-white group-hover:border-[#5A7A5C] transition-all duration-500">
            <MapPin className="h-7 w-7" />
          </div>
          <SectionHeading 
            title="In-Person Clinic Visit"
            description="Visit our certified centers in Bengaluru for a physical pulse examination and direct interaction with senior doctors."
            animate={false}
          />
          <div className="inline-flex items-center gap-3 text-xs font-bold text-[#5A7A5C] uppercase tracking-widest border-b-2 border-[#5A7A5C]/20 pb-1 group-hover:border-[#5A7A5C] transition-all">
            Select Location <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        <button 
          onClick={() => { setSelection(prev => ({...prev, type: "Virtual", clinic: "Digital Clinic"})); nextStep(); }}
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
    </m.div>
  );
});

Step1ConsultationType.displayName = 'Step1ConsultationType';
export default Step1ConsultationType;
