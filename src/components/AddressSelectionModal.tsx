import React, { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { X, MapPin, Plus, Loader2, Check, ChevronRight } from "lucide-react";
import { fetchCustomerViaAdmin, type Address } from "@/lib/shopifyAdmin";
import { toast } from "sonner";

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  onSelect: (address: Address | null) => void;
  isProcessing?: boolean;
}

const AddressSelectionModal: React.FC<AddressSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  customerId, 
  onSelect,
  isProcessing = false
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Body scroll lock & Address Loading
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position to restore later
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll'; // Keep scrollbar space to prevent jump
      
      if (customerId) {
        loadAddresses();
      }
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
    };
  }, [isOpen, customerId]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const customer = await fetchCustomerViaAdmin(customerId);
      if (customer?.addresses) {
        setAddresses(customer.addresses);
        if (customer.addresses.length > 0) {
          setSelectedId(customer.addresses[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
      toast.error("Could not load saved addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    const selected = addresses.find(a => a.id === selectedId);
    if (selected) {
      onSelect(selected);
    } else {
      toast.error("Please select an address");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex flex-col justify-end sm:justify-center sm:items-center overflow-hidden touch-none">
          {/* Backdrop */}
          <m.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-[#1A2E35]/70 backdrop-blur-md" 
          />
          
          {/* Modal Container */}
          <m.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }} 
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full sm:max-w-[480px] bg-[#FDFBF7] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] border-t sm:border border-[#F2EDE4] overflow-hidden min-w-0" 
            onClick={(e) => e.stopPropagation()}
          >
          {/* Mobile Handle */}
          <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0 bg-white">
            <div className="w-12 h-1.5 bg-[#1A2E35]/10 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pb-6 pt-2 sm:p-8 border-b border-[#F2EDE4] bg-white flex items-center justify-between shrink-0">
            <div>
              <p className="text-[#5A7A5C] font-sans-clean text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Secure Checkout</p>
              <h2 className="text-xl sm:text-2xl font-display font-medium text-[#1A2E35]">Select Shipping Address</h2>
            </div>
            <button 
              onClick={onClose} 
              disabled={isProcessing}
              className="w-10 h-10 flex items-center justify-center text-[#1A2E35]/30 hover:text-[#1A2E35] transition-colors sm:bg-[#FDFBF7] rounded-full hover:bg-white sm:border border-[#F2EDE4] disabled:opacity-30"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Processing Overlay */}
          <AnimatePresence>
            {isProcessing && (
              <m.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-[#F2EDE4] border-t-[#5A7A5C] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-6 w-6 text-[#5A7A5C]/20" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5A7A5C] animate-pulse">Please wait...</p>
                  <p className="text-xs text-[#1A2E35]/40 font-sans-clean">Preparing your secure checkout</p>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {/* Address List */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 space-y-4 custom-scrollbar bg-[#FDFBF7]/50">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#5A7A5C]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40">Gathering your saved addresses...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-6">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center border border-[#F2EDE4] shadow-sm">
                  <MapPin className="h-10 w-10 text-[#1A2E35]/5" />
                </div>
                <div className="space-y-2">
                  <p className="text-base font-medium text-[#1A2E35]">No Addresses Found</p>
                  <p className="text-sm text-[#1A2E35]/40 max-w-[240px] mx-auto">Please add a shipping address in your profile to proceed with checkout.</p>
                </div>
                <button 
                  onClick={() => onSelect(null)}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-[#5A7A5C]/10 text-[#5A7A5C] rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#5A7A5C] hover:text-white transition-all disabled:opacity-50"
                >
                  Add New Address
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <label 
                    key={address.id}
                    className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${
                      selectedId === address.id 
                        ? 'bg-white border-[#5A7A5C] shadow-xl shadow-[#5A7A5C]/5' 
                        : 'bg-white/40 border-[#F2EDE4] hover:bg-white hover:border-[#5A7A5C]/20'
                    }`}
                  >
                    <input 
                      type="radio" 
                      className="sr-only" 
                      name="address" 
                      value={address.id}
                      checked={selectedId === address.id}
                      onChange={() => setSelectedId(address.id)}
                    />
                    
                    <div className={`mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                      selectedId === address.id ? 'border-[#5A7A5C] bg-[#5A7A5C]' : 'border-[#F2EDE4] group-hover:border-[#5A7A5C]/40'
                    }`}>
                      {selectedId === address.id && (
                         <m.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                           <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
                         </m.div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[13px] font-bold text-[#1A2E35] uppercase tracking-wide truncate">
                          {address.firstName} {address.lastName}
                        </span>
                        {selectedId === address.id && (
                          <span className="shrink-0 px-2 py-0.5 bg-[#5A7A5C]/10 text-[#5A7A5C] text-[7px] font-bold uppercase tracking-widest rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm text-[#1A2E35]/60 font-sans-clean leading-snug">
                          {address.address1}{address.address2 ? `, ${address.address2}` : ''}
                        </p>
                        <p className="text-xs text-[#1A2E35]/40 font-sans-clean">
                          {address.city}, {address.province} {address.zip}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}

                {/* Add New Address Option */}
                <button 
                  onClick={() => onSelect(null)}
                  disabled={isProcessing}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-[#F2EDE4] bg-white/20 hover:bg-white hover:border-[#5A7A5C]/40 transition-all duration-300 group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="h-6 w-6 rounded-full border-2 border-[#F2EDE4] group-hover:border-[#5A7A5C]/40 flex items-center justify-center shrink-0 transition-all">
                    <Plus className="h-4 w-4 text-[#1A2E35]/30 group-hover:text-[#5A7A5C] group-hover:scale-110 transition-all" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#1A2E35] uppercase tracking-wide">Add New Address</p>
                    <p className="text-xs text-[#1A2E35]/40 font-sans-clean">Add address during checkout</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 sm:p-8 bg-white border-t border-[#F2EDE4] shrink-0 pb-10 sm:pb-8">
            <button 
              onClick={handleContinue}
              disabled={loading || addresses.length === 0}
              className="w-full bg-[#1A2E35] text-white py-5 rounded-2xl font-bold uppercase tracking-[0.15em] text-[11px] sm:text-xs hover:bg-[#5A7A5C] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-[#1A2E35]/20 disabled:opacity-50 disabled:grayscale"
            >
              Proceed to Payment <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </m.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddressSelectionModal;
