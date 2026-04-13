import { useState, useEffect } from "react";
import { Image } from "@/components/ui/Image";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { getStoredSession, logCheckoutToTerminal } from "@/lib/shopifyAdmin";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AddressSelectionModal from "./AddressSelectionModal";

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const navigate = useNavigate();
  const { items, isLoading, updateQuantity, removeItem, checkout, syncCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);

  useEffect(() => { if (isOpen) syncCart(); }, [isOpen, syncCart]);

  const handleCheckout = async () => {
    const session = getStoredSession();
    if (!session?.user) {
      setIsOpen(false);
      navigate("/login?redirect=checkout");
      return;
    }

    // Open address selection modal first
    setIsOpen(false); // Close the cart drawer
    setIsAddressModalOpen(true);
  };

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const onAddressSelect = async (address: any) => {
    setIsCheckingOut(true);
    
    try {
      const checkoutUrl = await checkout(address);
      if (checkoutUrl) {
        await logCheckoutToTerminal(checkoutUrl, `CartDrawer (Direct Checkout ${address ? 'w/ Address' : 'w/o Saved Address'})`);
        window.location.href = checkoutUrl;
      } else {
        toast.error("Checkout failed. Please try again.");
        setIsCheckingOut(false);
        setIsAddressModalOpen(false);
      }
    } catch (error) {
      toast.error("Checkout failed");
      setIsCheckingOut(false);
      setIsAddressModalOpen(false);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="p-2 text-foreground/70 hover:text-primary transition-colors relative" aria-label={`Shopping Cart ${totalItems > 0 ? `(${totalItems} items)` : '(empty)'}`}>
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-sans-clean font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle className="font-display text-sm md:text-lg lg:text-2xl">Shopping Cart</SheetTitle>
            <SheetDescription>
              {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col flex-1 pt-6 min-h-0">
            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-body">Your cart is empty</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.variantId} className="flex gap-4 p-2 border border-border rounded-lg">
                        <div className="w-16 h-16 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                          {item.product.node.images?.edges?.[0]?.node && (
                            <Image src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-medium truncate text-sm">{item.product.node.title}</h4>
                          {item.variantTitle !== "Default Title" && (
                            <p className="text-xs text-muted-foreground font-sans-clean">{item.variantTitle}</p>
                          )}
                          <p className="font-sans-clean font-semibold text-sm mt-1">
                            {item.price.currencyCode === 'INR' ? '₹' : item.price.currencyCode} {parseFloat(item.price.amount).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <button 
                            onClick={() => removeItem(item.variantId)} 
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                            aria-label={`Remove ${item.product.node.title} from cart`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)} 
                              className="h-6 w-6 flex items-center justify-center border border-border rounded text-xs hover:bg-secondary transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-sans-clean">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)} 
                              className="h-6 w-6 flex items-center justify-center border border-border rounded text-xs hover:bg-secondary transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 space-y-4 pt-4 border-t border-border">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm font-sans-clean text-muted-foreground">
                      <span>Shipping</span>
                      <span className="text-[#5A7A5C] font-bold">FREE</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-display font-semibold">Total</span>
                      <span className="text-xl font-sans-clean font-bold">
                        {items[0]?.price.currencyCode === 'INR' ? '₹' : items[0]?.price.currencyCode} {totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic text-right font-sans-clean">
                      *Shipping charges included in MRP
                    </p>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-herbal-dark text-primary-foreground py-3 rounded-lg font-sans-clean font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ExternalLink className="w-4 h-4" /> Checkout</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {getStoredSession()?.user?.id && (
        <AddressSelectionModal 
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          customerId={getStoredSession()?.user?.id}
          onSelect={onAddressSelect}
          isProcessing={isCheckingOut}
        />
      )}
    </>
  );
};
