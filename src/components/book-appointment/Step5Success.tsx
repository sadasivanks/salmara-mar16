import React, { memo } from 'react';
import { m } from 'framer-motion';
import { CheckCircle2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StepProps } from './types';

const Step5Success = memo(({ selection }: Pick<StepProps, 'selection'>) => {
  return (
    <m.div 
      key="step5"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto text-center py-16"
    >
      <m.div 
        initial={{ rotate: -20, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="h-28 w-28 bg-[#5A7A5C] rounded-full flex items-center justify-center text-white mx-auto mb-12 shadow-[0_20px_50px_rgba(90,122,92,0.3)] relative"
      >
        <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping opacity-20" />
        <CheckCircle2 className="h-14 w-14" />
      </m.div>
      
      <SectionHeading 
        title="Appointment Secured"
        description={<>We've reserved your session with <strong>{selection.doctor?.name}</strong>. Your journey to holistic wellness starts here.</>}
        level="h1"
        animate={false}
        className="mb-12"
      />
      
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
            Assigned instructions and a calendar invite have been sent to <strong>{selection.details.email}</strong>.
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-6 justify-center">
        <Link 
          to="/dashboard"
          className="bg-[#1A2E35] text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#1A2E35]/90 transition-all shadow-2xl shadow-[#1A2E35]/20 transform hover:-translate-y-1 text-center"
        >
          Go to Dashboard
        </Link>
        <Link 
          to="/"
          className="px-12 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs border border-[#F2EDE4] text-[#1A2E35]/60 hover:bg-white hover:border-[#F2EDE4] hover:shadow-lg transition-all text-center"
        >
          Return Home
        </Link>
      </div>
    </m.div>
  );
});

Step5Success.displayName = 'Step5Success';
export default Step5Success;
