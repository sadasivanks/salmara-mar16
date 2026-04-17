import React, { useState } from 'react';
import { MapPin, Truck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

const PincodeChecker = () => {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    available: boolean;
    edd?: string;
    courier?: string;
    message?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkServiceability = async () => {
    const cleanPincode = pincode.trim();
    if (!cleanPincode || cleanPincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/shiprocket?action=serviceability&pincode=${cleanPincode}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check serviceability');
      }

      // Shiprocket success structure: { status: 200, data: { available_courier_companies: [...] } }
      if (data.status === 200 && data.data?.available_courier_companies?.length > 0) {
        // Sort by ETD if available, or just pick the first one
        const couriers = data.data.available_courier_companies;
        const bestCourier = couriers.find((c: any) => c.etd) || couriers[0];
        
        setResult({
          available: true,
          edd: bestCourier.etd || bestCourier.estimated_delivery_days,
          courier: bestCourier.courier_name
        });
      } else {
        // Valid API call but pincode is not serviceable
        setResult({ 
          available: false, 
          message: data.data?.message || "Delivery is not yet available for this location." 
        });
      }
    } catch (err: any) {
      console.error('Pincode Check Error:', err);
      setError(err.message || 'Unable to check serviceability. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-[#F2EDE4] p-6 md:p-8 lg:p-10 xl:p-12 space-y-6 md:space-y-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 md:h-12 md:w-12 bg-[#5A7A5C]/5 rounded-2xl flex items-center justify-center text-[#5A7A5C] shrink-0">
          <MapPin className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div>
          <h3 className="text-xs md:text-sm font-bold text-[#1A2E35] uppercase tracking-[0.2em]">Delivery Check</h3>
          <p className="text-[10px] md:text-xs text-[#1A2E35]/40 font-sans-clean mt-1">Check availability in your area</p>
        </div>
      </div>

      {/* Input Group */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="relative flex-1 group">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setPincode(val);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') checkServiceability();
            }}
            placeholder="Enter Pincode"
            className="w-full bg-[#FDFBF7] border-2 border-[#F2EDE4] rounded-2xl px-5 py-3.5 text-base font-display font-medium text-[#1A2E35] focus:outline-none focus:border-[#5A7A5C] focus:bg-white transition-all placeholder:text-[#1A2E35]/20 group-hover:border-[#5A7A5C]/20"
          />
        </div>
        <button
          onClick={checkServiceability}
          disabled={loading || pincode.length !== 6}
          className="bg-[#5A7A5C] text-white px-8 py-3.5 rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#1A2E35] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#5A7A5C]/10 active:scale-95 shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
          ) : (
            'Check Availability'
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 text-red-500 text-[10px] md:text-sm font-bold bg-red-50/50 p-4 rounded-2xl border border-red-100"
          >
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </m.div>
        )}

        {result && (
          <m.div
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: 10 }}
            className="pt-2"
          >
            {result.available ? (
              <div className="bg-[#5A7A5C]/5 border border-[#5A7A5C]/10 rounded-3xl p-5 md:p-6 flex items-center gap-5">
                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-[#5A7A5C] shadow-sm shrink-0 border border-[#5A7A5C]/10">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] md:text-xs font-bold text-[#5A7A5C] uppercase tracking-[0.2em]">Serviceable</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#5A7A5C]" />
                  </div>
                  <p className="text-xs md:text-sm text-[#1A2E35]/70 font-sans-clean leading-relaxed">
                    Great news! Estimated delivery by <span className="font-bold text-[#1A2E35]">{result.edd}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50/50 border border-red-100 rounded-3xl p-5 md:p-6 flex items-center gap-5">
                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm shrink-0 border border-red-100/20">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] md:text-xs font-bold text-red-500 uppercase tracking-[0.2em]">Not Serviceable</span>
                  <p className="text-xs md:text-sm text-[#1A2E35]/60 font-sans-clean leading-relaxed mt-0.5">
                    {result.message}
                  </p>
                </div>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PincodeChecker;
