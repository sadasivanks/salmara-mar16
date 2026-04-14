import React from "react";
import { m } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface RegisterFormProps {
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  loading: boolean;
  onRegister: (e: React.FormEvent) => void;
  onLoginClick: () => void;
  icon: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  phone,
  setPhone,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  onRegister,
  onLoginClick,
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
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#5A7A5C] font-bold">Join Salmara</span>
      </div>
      <h2 className="text-3xl font-display font-medium text-[#1A2E35] mb-6 text-center">Create Account</h2>
      <form onSubmit={onRegister} className="w-full space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]/60 ml-1">First Name</label>
            <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-white border border-[#E5E7EB] rounded-2xl px-5 py-3 text-sm font-sans-clean outline-none focus:border-[#5A7A5C] transition-all shadow-sm focus:shadow-md" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]/60 ml-1">Last Name</label>
            <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-white border border-[#E5E7EB] rounded-2xl px-5 py-3 text-sm font-sans-clean outline-none focus:border-[#5A7A5C] transition-all shadow-sm focus:shadow-md" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]/60 ml-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border border-[#E5E7EB] rounded-2xl px-5 py-3 text-sm font-sans-clean outline-none focus:border-[#5A7A5C] transition-all shadow-sm focus:shadow-md" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]/60 ml-1">Phone Number</label>
          <input 
            type="tel" 
            required 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="+91..."
            className="w-full bg-white border border-[#E5E7EB] rounded-2xl px-5 py-3 text-sm font-sans-clean outline-none focus:border-[#5A7A5C] transition-all shadow-sm focus:shadow-md" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]/60 ml-1">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              className="w-full bg-white border border-[#E5E7EB] rounded-2xl px-5 py-3 pr-12 text-sm font-sans-clean outline-none focus:border-[#5A7A5C] transition-all shadow-sm focus:shadow-md" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A2E35]/40 hover:text-[#5A7A5C] transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <button disabled={loading} className="w-full bg-[#1A2E35] text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-[#5A7A5C] transition-all duration-300 shadow-xl shadow-[#1A2E35]/10 disabled:opacity-50">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} {loading ? "Creating Account..." : "Register"}
        </button>
      </form>
      <p className="mt-6 text-sm text-[#1A2E35]/40 font-sans-clean text-center">Already have account? <button onClick={onLoginClick} className="text-[#5A7A5C] font-bold hover:underline underline-offset-4 decoration-2">Login</button></p>
    </m.div>
  );
};
