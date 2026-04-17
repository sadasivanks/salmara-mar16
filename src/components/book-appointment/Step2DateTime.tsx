import React, { memo, useState } from 'react';
import { m } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, Info } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { StepProps } from './types';

const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"];

const Step2DateTime = memo(({ selection, setSelection, nextStep, prevStep }: StepProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    selection.date ? new Date(selection.date) : undefined
  );

  return (
    <m.div 
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
            <div className="bg-[#F8F9FA] rounded-3xl border border-[#F2EDE4] p-6 flex justify-center shadow-inner overflow-hidden">
              <style>{`.rdp { --rdp-accent-color: #5A7A5C; }`}</style>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  if (date) {
                    setSelection(prev => ({ ...prev, date: format(date, "MMM dd, yyyy") }));
                  }
                }}
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                className="my-4 mx-auto scale-110"
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
                  onClick={() => setSelection(prev => ({...prev, time: t}))}
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
    </m.div>
  );
});

Step2DateTime.displayName = 'Step2DateTime';
export default Step2DateTime;
