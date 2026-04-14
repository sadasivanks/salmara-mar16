import React, { useState, useCallback, Suspense, lazy } from "react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { m } from "framer-motion";
import { CheckCircle2, User, Calendar, Stethoscope, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SelectionData } from "@/components/book-appointment/types";

// Lazy loaded step components
const Step1ConsultationType = lazy(() => import("@/components/book-appointment/Step1ConsultationType"));
const Step2DateTime = lazy(() => import("@/components/book-appointment/Step2DateTime"));
const Step3ChooseExpert = lazy(() => import("@/components/book-appointment/Step3ChooseExpert"));
const Step4PatientDetails = lazy(() => import("@/components/book-appointment/Step4PatientDetails"));
const Step5Success = lazy(() => import("@/components/book-appointment/Step5Success"));

const stepsInfo = [
  { title: "Consultation Type", icon: <Stethoscope className="h-4 w-4" /> },
  { title: "Date & Time", icon: <Calendar className="h-4 w-4" /> },
  { title: "Choose Expert", icon: <User className="h-4 w-4" /> },
  { title: "Confirmation", icon: <CheckCircle2 className="h-4 w-4" /> }
];

const LoadingFallback = () => (
  <div className="flex justify-center items-center py-20">
    <div className="h-8 w-8 rounded-full border-2 border-[#5A7A5C] border-t-transparent animate-spin" />
  </div>
);

const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState<SelectionData>({
    type: "",
    clinic: "",
    date: "",
    time: "",
    doctor: null,
    details: { name: "", email: "", phone: "", concern: "" }
  });

  const nextStep = useCallback(() => setStep(s => Math.min(s + 1, 5)), []);
  const prevStep = useCallback(() => setStep(s => Math.max(s - 1, 1)), []);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <SEO 
        title="Book an Appointment | Personalised Ayurvedic Consultation" 
        description="Experience personalized Ayurvedic care from our expert practitioners. Take the first step towards balanced, long-term health with Salmara Ayurveda."
      />
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
          <SectionHeading 
            title="Book Your Consultation"
            description="Experience personalized Ayurvedic care from our expert practitioners. Take the first step towards balanced, long-term health."
            level="h1"
            animate={false}
            className="mb-16"
          />

          {step < 5 && (
            <div className="flex items-center justify-between mb-20 relative px-4 max-w-3xl mx-auto hidden sm:flex">
              <div className="absolute top-5 left-10 right-10 h-[2px] bg-[#F2EDE4] -z-10" />
              {stepsInfo.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-4 relative">
                  <m.div 
                    initial={false}
                    animate={{ 
                      scale: step === i + 1 ? 1.1 : 1,
                      backgroundColor: step > i + 1 ? '#5A7A5C' : step === i + 1 ? '#FFFFFF' : '#FFFFFF',
                      borderColor: step >= i + 1 ? '#5A7A5C' : '#F2EDE4',
                      color: step > i + 1 ? '#FFFFFF' : step === i + 1 ? '#5A7A5C' : 'rgba(26, 46, 53, 0.2)'
                    }}
                    className="h-11 w-11 rounded-full flex items-center justify-center transition-all duration-500 border-2 shadow-sm z-10"
                  >
                    {step > i + 1 ? <CheckCircle2 className="h-5 w-5" /> : 
                     <span className="text-xs font-bold">{i + 1}</span>}
                  </m.div>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.15em] absolute -bottom-8 whitespace-nowrap transition-colors duration-300 ${step === i + 1 ? 'text-[#1A2E35]' : 'text-[#1A2E35]/30'}`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Suspense fallback={<LoadingFallback />}>
            {step === 1 && <Step1ConsultationType selection={selection} setSelection={setSelection} nextStep={nextStep} />}
            {step === 2 && <Step2DateTime selection={selection} setSelection={setSelection} nextStep={nextStep} prevStep={prevStep} />}
            {step === 3 && <Step3ChooseExpert selection={selection} setSelection={setSelection} nextStep={nextStep} prevStep={prevStep} />}
            {step === 4 && <Step4PatientDetails selection={selection} setSelection={setSelection} nextStep={nextStep} prevStep={prevStep} />}
            {/* {step === 5 && <Step5Success selection={selection} setSelection={setSelection} nextStep={nextStep} />} */}
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookAppointmentPage;
