import React from "react";
import { m } from "framer-motion";
import { Loader2 } from "lucide-react";

interface OtpFormProps {
  title: string;
  subtitle: string;
  phoneHint: string;
  otp: string;
  setOtp: (otp: string) => void;
  loading: boolean;
  resendTimer: number;
  onVerify: (e: React.FormEvent) => void;
  onResend: () => void;
  onBackToLogin?: () => void;
  icon: string;
}

export const OtpForm: React.FC<OtpFormProps> = ({
  title,
  subtitle,
  phoneHint,
  otp,
  setOtp,
  loading,
  resendTimer,
  onVerify,
  onResend,
  onBackToLogin,
  icon,
}) => {
  return (
    <m.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 20 }} 
      transition={{ duration: 0.3 }} 
      className="flex flex-col items-center"
    >
      <img src={icon} alt="Salmara" className="h-16 w-auto mb-4" />
      <div className="flex items-center gap-2 mb-1">
        <div className="h-1.5 w-1.5 rounded-full bg-[#5A7A5C] animate-pulse" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#5A7A5C] font-bold">{subtitle}</span>
      </div>
      <h2 className="text-3xl font-display font-medium text-[#1A2E35] mb-2 text-center">{title}</h2>
      <p className="text-sm text-[#1A2E35]/40 font-sans-clean mb-8 text-center max-w-[280px]">
        We've sent a code to your registered mobile 
        <span className="text-[#1A2E35] font-medium block mt-1">{phoneHint}</span>
      </p>
      
      <form onSubmit={onVerify} className="w-full space-y-6">
        <div className="flex justify-center">
          <input 
            type="text" 
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="w-full max-w-[240px] bg-white border border-[#E5E7EB] rounded-2xl px-5 py-4 text-2xl font-sans-clean text-center tracking-[0.5em] font-bold outline-none focus:border-[#5A7A5C] transition-all shadow-sm focus:shadow-md"
            placeholder="000000"
            autoFocus
            autoComplete="one-time-code"
          />
        </div>
        
        <button disabled={loading} className="w-full bg-[#1A2E35] text-white py-4 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 hover:bg-[#5A7A5C] transition-all duration-300 shadow-xl shadow-[#1A2E35]/10 disabled:opacity-50">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} {loading ? "Verifying..." : "Verify & Continue"}
        </button>
      </form>
      
      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="text-xs text-[#1A2E35]/40 font-sans-clean">Didn't receive the code?</p>
        <div className="flex items-center gap-4">
          <button 
            type="button"
            disabled={loading || resendTimer > 0} 
            onClick={onResend} 
            className="text-[10px] font-bold text-[#5A7A5C] uppercase tracking-widest hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {resendTimer > 0 ? `Resend in ${Math.floor(resendTimer / 60)}:${(resendTimer % 60).toString().padStart(2, '0')}` : "Resend Code"}
          </button>
          {onBackToLogin && (
            <>
              <div className="h-3 w-[1px] bg-[#F2EDE4]" />
              <button onClick={onBackToLogin} className="text-[10px] font-bold text-[#1A2E35]/60 uppercase tracking-widest hover:underline">Back to Login</button>
            </>
          )}
        </div>
      </div>
    </m.div>
  );
};
