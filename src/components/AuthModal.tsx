import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { saveSession } from "@/lib/shopifyAdmin";
import { createCustomerViaAdmin, loginViaProxy, verifyOtpViaProxy, updateCustomerCartId, requestPasswordReset, resetPassword } from "@/lib/shopifyAdmin";
import { syncShopifyCustomerToDb } from "@/lib/dbSync";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "register" | "otp";
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = "login" }) => {
  const [view, setView] = useState<"login" | "register" | "otp" | "forgot-password" | "verify-reset-otp" | "set-new-password" | "verify-registration-otp">(initialView);
  const [loading, setLoading] = useState(false);
  const { cartId, setCartId, syncCart, clearCart } = useCartStore();
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneHint, setPhoneHint] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer logic for Resend OTP
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Reset form state whenever the modal closes
  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, initialView]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setOtp("");
    setPhoneHint("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setResendTimer(0);
    setLoading(false);
    setView(initialView);
  };

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await loginViaProxy(email, password);

      if (result.requiresOtp || result.requiresVerification) {
        setPhoneHint(result.phoneHint || "");
        if (result.requiresVerification) {
          toast.info("Verification Required", { 
            description: "Please verify your mobile number to complete registration." 
          });
          setView("verify-registration-otp");
        } else {
          toast.info("Verification Required", { 
            description: `We've sent a 6-digit code to your registered mobile number ${result.phoneHint ? '(' + result.phoneHint + ')' : ''}.` 
          });
          setView("otp");
        }
        return;
      }

      if (!result.success) {
        const errorMsg = result.errors?.[0]?.message || "Invalid email or password.";
        throw new Error(errorMsg);
      }

      await completeLogin(result.user);
    } catch (error: any) {
      toast.error("Login failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtpViaProxy(email, otp);
      if (!result.success) {
        throw new Error(result.errors?.[0]?.message || "Verification failed");
      }
      await completeLogin(result.user);
    } catch (error: any) {
      toast.error("Verification failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = async (userData: any) => {
    // Explicitly clear local cart state before restoring the user's specific cart
    const currentCartId = cartId;
    clearCart();

    // Sync with standard session FIRST
    saveSession({
      accessToken: "admin_proxy_mode",
      user: userData,
      expires: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    });

    // 1. Restore Cart from Shopify if available
    if (userData?.shopifyCartId) {
      console.log("Found Shopify Cart ID, restoring:", userData.shopifyCartId);
      setCartId(userData.shopifyCartId);
      setTimeout(async () => {
        await syncCart(); 
        console.log("Cart restoration complete");
      }, 500);
    } else if (currentCartId) {
      console.log("Saving local cart to Shopify account:", currentCartId);
      await updateCustomerCartId(userData.id, currentCartId);
      setCartId(currentCartId);
    }

    toast.success(`Registration successful!`);
    onClose();
  };
  
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      if (!result.success) {
        throw new Error(result.errors?.[0]?.message || "Account not found or recovery unavailable.");
      }
      setPhoneHint(result.phoneHint || "");
      toast.info("Verification Required", { 
        description: `We've sent a recovery code to your registered mobile number ${result.phoneHint ? '(' + result.phoneHint + ')' : ''}.` 
      });
      setView("verify-reset-otp");
    } catch (error: any) {
      toast.error("Recovery failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword(email, otp, ""); // Call with empty password just to verify OTP
      if (!result.success) {
        throw new Error(result.errors?.[0]?.message || "Invalid or expired code.");
      }
      toast.success("Code verified successfully!");
      setView("set-new-password");
    } catch (error: any) {
      toast.error("Verification failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword(email, otp, newPassword);
      if (!result.success) {
        throw new Error(result.errors?.[0]?.message || "Reset failed.");
      }
      toast.success("Password updated successfully!");
      setView("login");
      setPassword(""); // Clear current password state
      setNewPassword("");
      setConfirmNewPassword("");
      setOtp("");
    } catch (error: any) {
      toast.error("Reset failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtpViaProxy(email, otp);
      if (!result.success) {
        throw new Error(result.errors?.[0]?.message || "Verification failed");
      }
      toast.success("Account verified successfully!");
      await completeLogin(result.user);
    } catch (error: any) {
      toast.error("Verification failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Auto-format phone for Shopify (requires + and country code)
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.length === 10) {
          formattedPhone = `+91${formattedPhone}`;
        } else if (formattedPhone.length > 10) {
          formattedPhone = `+${formattedPhone}`;
        }
      }

      // 1. Create Shopify customer via Admin API proxy
      const shopifyResult = await createCustomerViaAdmin({
        firstName,
        lastName,
        email,
        password,
        phone: formattedPhone,
        isPending: true
      });

      if (!shopifyResult.success) {
        const errorMsg = shopifyResult.errors?.[0]?.message || "Could not create account.";
        throw new Error(errorMsg);
      }

      const customer = shopifyResult.customer;

      // 3. Sync to local database
      if (customer) {
        try {
          await syncShopifyCustomerToDb({
            id: customer.id,
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
            password: password
          });
        } catch (syncErr: any) {
          console.error("Unexpected error during DB sync call:", syncErr);
        }
      }

      toast.success("Account created!", { 
        description: "Please enter the verification code sent to your mobile." 
      });
      setPhoneHint(phone.replace(/.(?=.{4})/g, '*'));
      setView("verify-registration-otp");
      
    } catch (error: any) {
      toast.error("Registration failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    try {
      // Re-use loginViaProxy to trigger a new OTP (works for both login and pending registration)
      const result = await loginViaProxy(email, password);
      if (!result.success && !result.requiresOtp && !result.requiresVerification) {
        throw new Error(result.errors?.[0]?.message || "Failed to resend code");
      }
      
      toast.success("OTP Resent Successfully", {
        description: `A new 6-digit code has been sent to ${result.phoneHint || email}.`
      });
      setResendTimer(120); // 2 minute cooldown
      setOtp(""); // Clear previous OTP
    } catch (error: any) {
      toast.error("Resend failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="relative w-full max-w-lg bg-[#FDFBF7] rounded-[32px] shadow-2xl p-6 sm:p-10 overflow-hidden border border-[#F2EDE4]" 
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 text-[#1A2E35]/40 hover:text-[#1A2E35] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <AnimatePresence mode="wait">
            {view === "login" ? (
              <motion.div 
                key="login" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }} 
                transition={{ duration: 0.3 }} 
                className="flex flex-col items-center"
              >
                <img src="/salamara_icon.jpg" alt="Salmara" className="h-16 w-auto mb-4" />
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#5A7A5C] animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#5A7A5C] font-bold">Secure Access</span>
                </div>
                <h2 className="text-3xl font-display font-medium text-[#1A2E35] mb-6 text-center">Login</h2>
                <form onSubmit={handleLogin} className="w-full space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]/60 ml-1">Email Address</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border border-[#E5E7EB] rounded-2xl px-5 py-3 text-sm font-sans-clean outline-none focus:border-[#5A7A5C] transition-all shadow-sm focus:shadow-md" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]/60">Password</label>
                      <button 
                        type="button" 
                        onClick={() => setView("forgot-password")}
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
                <p className="mt-6 text-sm text-[#1A2E35]/40 font-sans-clean">Don't have an account? <button onClick={() => setView("register")} className="text-[#5A7A5C] font-bold hover:underline underline-offset-4 decoration-2">Register Now</button></p>
              </motion.div>
            ) : view === "otp" ? (
              <motion.div 
                key="otp" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }} 
                transition={{ duration: 0.3 }} 
                className="flex flex-col items-center"
              >
                <img src="/salamara_icon.jpg" alt="Salmara" className="h-16 w-auto mb-4" />
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#5A7A5C] animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#5A7A5C] font-bold">Identity Verification</span>
                </div>
                <h2 className="text-3xl font-display font-medium text-[#1A2E35] mb-2 text-center">Verify Phone</h2>
                <p className="text-sm text-[#1A2E35]/40 font-sans-clean mb-8 text-center max-w-[280px]">
                  We've sent a code to your registered mobile 
                  <span className="text-[#1A2E35] font-medium block mt-1">{phoneHint || email}</span>
                </p>
                
                <form onSubmit={handleVerifyOtp} className="w-full space-y-6">
                  <div className="flex justify-center">
                    <input 
                      type="text" 
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full max-w-[240px] bg-white border border-[#E5E7EB] rounded-2xl px-5 py-4 text-2xl font-sans-clean text-center tracking-[0.5em] font-bold outline-none focus:border-[#5A7A5C] transition-all shadow-sm focus:shadow-md"
                      placeholder="000000"
                      autoFocus
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
                      onClick={handleResendOtp} 
                      className="text-[10px] font-bold text-[#5A7A5C] uppercase tracking-widest hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      {resendTimer > 0 ? `Resend in ${Math.floor(resendTimer / 60)}:${(resendTimer % 60).toString().padStart(2, '0')}` : "Resend Code"}
                    </button>
                    <div className="h-3 w-[1px] bg-[#F2EDE4]" />
                   <button onClick={() => setView("login")} className="text-[10px] font-bold text-[#1A2E35]/60 uppercase tracking-widest hover:underline">Back to Login</button>
                  </div>
                </div>
              </motion.div>
            ) : view === "forgot-password" ? (
              <motion.div 
                key="forgot" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }} 
                transition={{ duration: 0.3 }} 
                className="flex flex-col items-center"
              >
                <img src="/salamara_icon.jpg" alt="Salmara" className="h-16 w-auto mb-4" />
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#5A7A5C] animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#5A7A5C] font-bold">Account Recovery</span>
                </div>
                <h2 className="text-3xl font-display font-medium text-[#1A2E35] mb-2 text-center">Reset Password</h2>
                <p className="text-sm text-[#1A2E35]/40 font-sans-clean mb-8 text-center max-w-[280px]">
                  Enter your email to receive a secure recovery code via SMS.
                </p>
                <form onSubmit={handleRequestReset} className="w-full space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]/60 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full bg-white border border-[#E5E7EB] rounded-2xl px-5 py-3 text-sm font-sans-clean outline-none focus:border-[#5A7A5C] transition-all shadow-sm focus:shadow-md" 
                      placeholder="you@example.com"
                    />
                  </div>
                  <button disabled={loading} className="w-full bg-[#1A2E35] text-white py-4 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 hover:bg-[#5A7A5C] transition-all duration-300 shadow-xl shadow-[#1A2E35]/10 disabled:opacity-50">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />} {loading ? "Sending Code..." : "Get Recovery Code"}
                  </button>
                </form>
                <button onClick={() => setView("login")} className="mt-6 text-xs font-bold text-[#1A2E35]/60 uppercase tracking-widest hover:underline">Back to Login</button>
              </motion.div>
            ) : view === "verify-reset-otp" ? (
              <motion.div 
                key="verify-otp" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }} 
                transition={{ duration: 0.3 }} 
                className="flex flex-col items-center"
              >
                <img src="/salamara_icon.jpg" alt="Salmara" className="h-16 w-auto mb-4" />
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#5A7A5C] animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#5A7A5C] font-bold">Verification</span>
                </div>
                <h2 className="text-3xl font-display font-medium text-[#1A2E35] mb-2 text-center">Verify Code</h2>
                <p className="text-sm text-[#1A2E35]/40 font-sans-clean mb-8 text-center max-w-[280px]">
                  Enter the 6-digit code sent to <span className="text-[#1A2E35] font-medium">{phoneHint}</span>.
                </p>
                <form onSubmit={handleVerifyResetOtp} className="w-full space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]/60 ml-1 text-center block">Recovery Code</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white border border-[#E5E7EB] rounded-2xl px-5 py-3 text-xl font-sans-clean text-center tracking-[0.5em] font-bold outline-none focus:border-[#5A7A5C] transition-all shadow-sm focus:shadow-md"
                      placeholder="000000"
                    />
                  </div>
                  <button disabled={loading} className="w-full bg-[#1A2E35] text-white py-4 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 hover:bg-[#5A7A5C] transition-all duration-300 shadow-xl shadow-[#1A2E35]/10 disabled:opacity-50">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />} {loading ? "Verifying..." : "Verify Code"}
                  </button>
                </form>
                <button onClick={() => setView("forgot-password")} className="mt-6 text-[10px] font-bold text-[#5A7A5C] uppercase tracking-widest hover:underline">Change Email</button>
              </motion.div>
            ) : view === "set-new-password" ? (
              <motion.div 
                key="set-pwd" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }} 
                transition={{ duration: 0.3 }} 
                className="flex flex-col items-center"
              >
                <img src="/salamara_icon.jpg" alt="Salmara" className="h-16 w-auto mb-4" />
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#5A7A5C] animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#5A7A5C] font-bold">Secure Reset</span>
                </div>
                <h2 className="text-3xl font-display font-medium text-[#1A2E35] mb-2 text-center">New Password</h2>
                <p className="text-sm text-[#1A2E35]/40 font-sans-clean mb-6 text-center max-w-[280px]">
                  Create a strong new password for your account.
                </p>
                <form onSubmit={handleConfirmReset} className="w-full space-y-4">
                   <div className="space-y-2 w-full">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]/60 ml-1">New Password</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? "text" : "password"} 
                        required 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="w-full bg-white border border-[#E5E7EB] rounded-2xl px-5 py-3 pr-12 text-sm font-sans-clean outline-none focus:border-[#5A7A5C] transition-all shadow-sm focus:shadow-md" 
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A2E35]/40 hover:text-[#5A7A5C] transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 w-full">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]/60 ml-1">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        required 
                        value={confirmNewPassword} 
                        onChange={(e) => setConfirmNewPassword(e.target.value)} 
                        className="w-full bg-white border border-[#E5E7EB] rounded-2xl px-5 py-3 pr-12 text-sm font-sans-clean outline-none focus:border-[#5A7A5C] transition-all shadow-sm focus:shadow-md" 
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A2E35]/40 hover:text-[#5A7A5C] transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button disabled={loading} className="w-full bg-[#1A2E35] text-white py-4 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 hover:bg-[#5A7A5C] transition-all duration-300 shadow-xl shadow-[#1A2E35]/10 disabled:opacity-50">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />} {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </motion.div>
            ) : view === "verify-registration-otp" ? (
              <motion.div 
                key="verify-reg-otp" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }} 
                transition={{ duration: 0.3 }} 
                className="flex flex-col items-center"
              >
                <img src="/salamara_icon.jpg" alt="Salmara" className="h-16 w-auto mb-4" />
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#5A7A5C] animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#5A7A5C] font-bold">New Account Verification</span>
                </div>
                <h2 className="text-3xl font-display font-medium text-[#1A2E35] mb-2 text-center">Verify Account</h2>
                <p className="text-sm text-[#1A2E35]/40 font-sans-clean mb-8 text-center max-w-[280px]">
                  Enter the 6-digit code sent to <span className="text-[#1A2E35] font-medium">{phoneHint}</span>
                </p>
                
                <form onSubmit={handleVerifyRegistrationOtp} className="w-full space-y-6">
                  <div className="flex justify-center">
                    <input 
                      type="text" 
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full max-w-[240px] bg-white border border-[#E5E7EB] rounded-2xl px-5 py-4 text-2xl font-sans-clean text-center tracking-[0.5em] font-bold outline-none focus:border-[#5A7A5C] transition-all shadow-sm focus:shadow-md"
                      placeholder="000000"
                    />
                  </div>
                  
                  <button disabled={loading} className="w-full bg-[#1A2E35] text-white py-4 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 hover:bg-[#5A7A5C] transition-all duration-300 shadow-xl shadow-[#1A2E35]/10 disabled:opacity-50">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />} {loading ? "Verifying..." : "Complete Registration"}
                  </button>
                </form>
                
                <div className="mt-8 flex flex-col items-center gap-4">
                  <p className="text-xs text-[#1A2E35]/40 font-sans-clean">Didn't receive the code?</p>
                  <div className="flex items-center gap-4">
                    <button 
                      type="button"
                      disabled={loading || resendTimer > 0} 
                      onClick={handleResendOtp} 
                      className="text-[10px] font-bold text-[#5A7A5C] uppercase tracking-widest hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      {resendTimer > 0 ? `Resend in ${Math.floor(resendTimer / 60)}:${(resendTimer % 60).toString().padStart(2, '0')}` : "Resend Code"}
                    </button>
                    <div className="h-3 w-[1px] bg-[#F2EDE4]" />
                    {/* <button onClick={() => setView("register")} className="text-[10px] font-bold text-[#1A2E35]/60 uppercase tracking-widest hover:underline">Edit Details</button> */}
                  </div>
                </div>
             </motion.div>
            ) : (
              <motion.div 
                key="register" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }} 
                transition={{ duration: 0.3 }} 
                className="flex flex-col items-center"
              >
                <img src="/salamara_icon.jpg" alt="Salmara" className="h-16 w-auto mb-4" />
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#5A7A5C] animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#5A7A5C] font-bold">Join Salmara</span>
                </div>
                <h2 className="text-3xl font-display font-medium text-[#1A2E35] mb-6 text-center">Create Account</h2>
                <form onSubmit={handleRegister} className="w-full space-y-3">
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
                <p className="mt-6 text-sm text-[#1A2E35]/40 font-sans-clean text-center">Already have account? <button onClick={() => setView("login")} className="text-[#5A7A5C] font-bold hover:underline underline-offset-4 decoration-2">Login</button></p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
