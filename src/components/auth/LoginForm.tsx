import React from "react";
import { m } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  loading: boolean;
  onLogin: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  onRegisterClick: () => void;
  icon: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  onLogin,
  onForgotPassword,
  onRegisterClick,
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
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#5A7A5C] font-bold">Secure Access</span>
      </div>
      <h2 className="text-3xl font-display font-medium text-[#1A2E35] mb-6 text-center">Login</h2>
      <form onSubmit={onLogin} className="w-full space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]/60 ml-1">Email Address</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full bg-white border border-[#E5E7EB] rounded-2xl px-5 py-3 text-sm font-sans-clean outline-none focus:border-[#5A7A5C] transition-all shadow-sm focus:shadow-md" 
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]/60">Password</label>
            <button 
              type="button" 
              onClick={onForgotPassword}
              className="text-[10px] font-bold text-[#5A7A5C] hover:underline tracking-widest"
            >
              Forgot your password?
            </button>
          </div>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
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
        <button disabled={loading} className="w-full bg-[#1A2E35] text-white py-4 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 hover:bg-[#5A7A5C] transition-all duration-300 shadow-xl shadow-[#1A2E35]/10 disabled:opacity-50">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} {loading ? "Authenticating..." : "Login"}
        </button>
      </form>
      <p className="mt-6 text-sm text-[#1A2E35]/40 font-sans-clean">Don't have an account? <button onClick={onRegisterClick} className="text-[#5A7A5C] font-bold hover:underline underline-offset-4 decoration-2">Register Now</button></p>
    </m.div>
  );
};
