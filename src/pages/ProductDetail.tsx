import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchProductByHandle, createShopifyCart } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Loader2, 
  Leaf, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  Info,
  ChevronDown,
  Plus,
  Minus,
  AlertCircle,
  Package, 
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  { q: "Is this suitable for daily use?", a: "Yes, this formulation is designed for consistent support. However, we always recommend following the dosage directed by your practitioner." },
  { q: "How soon will I see results?", a: "Ayurveda works with the body's natural rhythms. While some feel immediate support, consistent use for 4-6 weeks is typically recommended for stabilizing results." },
  { q: "Can I take it with other supplements/medications?", a: "Our formulas are natural, but we advise a 30-minute gap between different supplements. Consult your doctor if you are on specific prescription medication." },
  { q: "Is it safe during pregnancy/breastfeeding?", a: "We recommend consulting your healthcare provider before starting any new wellness regimen during pregnancy or lactation." },
  { q: "What is your return policy?", a: "We accept returns for damaged items within 7 days of delivery. For more details, please visit our dedicated returns policy page." },
];

const ProductDetail = () => {
  const navigate = useNavigate();
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const { addItem, isLoading } = useCartStore();

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    fetchProductByHandle(handle)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5A7A5C]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] gap-4">
        <Leaf className="h-16 w-16 text-[#1A2E35]/10" />
        <p className="text-[#1A2E35]/40 font-body">Formulation not found</p>
        <Link to="/shop" className="text-[#5A7A5C] font-bold uppercase tracking-widest text-xs border-b border-[#5A7A5C] pb-1">Return to Shop</Link>
      </div>
    );
  }

  const variants = product.variants?.edges || [];
  const selectedVariant = variants[selectedVariantIdx]?.node;
  const images = product.images?.edges || [];
  const hasMultipleVariants = variants.length > 1 && !(variants.length === 1 && variants[0].node.title === "Default Title");

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: quantity,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success("Added to cart", { description: product.title, position: "top-center" });
  };
  
  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    
    setIsBuyingNow(true);
    try {
      const cartData = await createShopifyCart({
        variantId: selectedVariant.id,
        quantity: quantity
      });
      
      if (cartData?.checkoutUrl) {
        window.location.href = cartData.checkoutUrl;
      } else {
        toast.error("Checkout failed", { description: "Could not generate checkout link. Please try adding to cart." });
      }
    } catch (error) {
      console.error("Buy Now Error:", error);
      toast.error("Something went wrong", { description: "Please try again or use standard Add to Cart." });
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="pt-32 pb-24">
        <div className="container px-4 mx-auto">
          {/* 6) PDP Hero Section */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 mb-32">
            {/* Gallery */}
            <div className="space-y-6">
              <div className="sticky top-32">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/30 hover:text-[#1A2E35] transition-colors mb-8"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Collection
                </button>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="aspect-square bg-white rounded-3xl overflow-hidden border border-[#F2EDE4] flex items-center justify-center shadow-lg mb-6"
                >
                  {images[selectedImage]?.node ? (
                    <img src={images[selectedImage].node.url} alt={images[selectedImage].node.altText || product.title} className="w-full h-full object-cover" />
                  ) : (
                    <Leaf className="h-20 w-20 text-[#1A2E35]/10" />
                  )}
                </motion.div>
                
                {images.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {images.map((img: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${i === selectedImage ? 'border-[#5A7A5C]' : 'border-[#F2EDE4] hover:border-[#5A7A5C]/30'}`}
                      >
                        <img src={img.node.url} alt={img.node.altText || ''} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-10">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#C5A059] uppercase tracking-widest mb-4">
                  <Package className="h-3 w-3" /> Traditionally Sourced Formulation
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-medium text-[#1A2E35] mb-4 leading-tight">
                  {product.title}
                </h1>
                <div className="flex items-center gap-4 py-2">
                  <div className="flex items-center gap-1 text-[#C5A059]">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-4 w-4 fill-current" />)}
                  </div>
                  <a href="#reviews" className="text-xs font-bold text-[#1A2E35]/40 uppercase tracking-widest hover:text-[#5A7A5C] underline underline-offset-4">Read 112 reviews</a>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-display font-medium text-[#1A2E35]">
                    {selectedVariant?.price.currencyCode === 'INR' ? '₹' : selectedVariant?.price.currencyCode}{' '}
                    {parseFloat(selectedVariant?.price.amount || "0").toFixed(0)}
                  </span>
                  <span className="text-lg text-[#1A2E35]/30 line-through mb-1">₹{((parseFloat(selectedVariant?.price.amount || "0") * 1.15)).toFixed(0)}</span>
                  <span className="bg-[#5A7A5C]/5 text-[#5A7A5C] text-[10px] font-bold px-2 py-1 rounded-md mb-1 uppercase tracking-widest">Inclusive of Taxes</span>
                </div>
                
                <div 
                  className="text-base text-[#1A2E35]/60 font-sans-clean leading-relaxed prose prose-sm prose-stone max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
                />
              </div>

              {hasMultipleVariants && (
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40">Select Format</label>
                  <div className="flex flex-wrap gap-3">
                    {variants.map((v: any, i: number) => (
                      <button
                        key={v.node.id}
                        onClick={() => { setSelectedVariantIdx(i); setSelectedImage(0); }}
                        disabled={!v.node.availableForSale}
                        className={`px-6 py-3 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                          i === selectedVariantIdx
                            ? 'bg-[#1A2E35] border-[#1A2E35] text-white shadow-[#1A2E35]/20 shadow-lg'
                            : 'bg-white border-[#F2EDE4] text-[#1A2E35] hover:border-[#5A7A5C]'
                        } ${!v.node.availableForSale ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {v.node.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-6 pt-6 border-t border-[#F2EDE4]">
                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-white border border-[#F2EDE4] rounded-xl px-2">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-[#1A2E35]/30 hover:text-[#1A2E35]">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-display font-medium text-[#1A2E35]">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-[#1A2E35]/30 hover:text-[#1A2E35]">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={isLoading || !selectedVariant?.availableForSale}
                    className="flex-1 bg-[#5A7A5C] text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#4A634B] transition-all shadow-xl shadow-[#5A7A5C]/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>}
                  </button>
                </div>
                
                <button 
                  onClick={handleBuyNow}
                  disabled={isBuyingNow || !selectedVariant?.availableForSale}
                  className="w-full border-2 border-[#1A2E35] text-[#1A2E35] py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#1A2E35] hover:text-white transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isBuyingNow ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isBuyingNow ? "Preparing Checkout..." : "Buy Now"}
                </button>
                
                <div className="flex items-center justify-center gap-8 py-4 bg-[#F2EDE4]/30 rounded-2xl">
                   <div className="flex items-center gap-2 text-[9px] font-bold text-[#1A2E35]/40 uppercase tracking-widest">
                    <CheckCircle2 className="h-3 w-3 text-[#5A7A5C]" /> Ships in 24–48 hours
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-[#1A2E35]/40 uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3 text-[#5A7A5C]" /> Secure Checkout
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7) What It’s For (Benefits) */}
          <section className="py-24 border-t border-[#F2EDE4]">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-[#C5A059] font-sans-clean text-[10px] font-bold uppercase tracking-[0.3em] mb-4">THE SALMARA EXPERIENCE</p>
              <h2 className="text-3xl font-display font-medium text-[#1A2E35] mb-12">How it Supports Your Wellness</h2>
              <div className="grid md:grid-cols-2 gap-12 text-left">
                {[
                  `Expertly balanced to support ${product.productType?.toLowerCase() || 'general'} wellness and vitality.`,
                  "Formulated with traditional botanical extracts for consistent, stabilizing results.",
                  "Contains pure herbal concentrations that respect the body's natural rhythms.",
                  "Supports smooth metabolic flow and adaptive internal resilience."
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-4 p-8 bg-white rounded-3xl border border-[#F2EDE4] hover:border-[#5A7A5C]/30 transition-all">
                    <div className="h-8 w-8 bg-[#5A7A5C]/5 rounded-xl flex items-center justify-center text-[#5A7A5C] shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-sans-clean text-[#1A2E35]/70 leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 8) Ingredients & Formulation */}
          <section className="py-24 bg-white -mx-4 px-4 border-y border-[#F2EDE4]">
            <div className="max-w-4xl mx-auto space-y-16">
              <div className="text-center">
                <h2 className="text-3xl font-display font-medium text-[#1A2E35] mb-4">Pure Ingredients. Scientific Precision.</h2>
                <p className="text-[#1A2E35]/40 font-sans-clean max-w-xl mx-auto text-sm">We believe transparency is the root of trust. Every milligram in this formulation is ethically sourced and standardized.</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {(product.tags?.slice(0, 3) || ["Dashamoola", "Botanical Extract", "Ayurvedic Base"]).map((ing: string) => (
                  <div key={ing} className="p-10 rounded-3xl border border-[#F2EDE4] text-center hover:bg-[#FDFBF7] transition-all group">
                    <div className="w-16 h-16 bg-[#FDFBF7] rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:bg-[#5A7A5C]/5 transition-colors">
                      <Leaf className="h-6 w-6 text-[#5A7A5C]" />
                    </div>
                    <h4 className="text-sm font-bold text-[#1A2E35] uppercase tracking-widest">{ing}</h4>
                    <p className="text-[11px] text-[#1A2E35]/40 mt-3 uppercase tracking-widest">Standardized Integrity</p>
                  </div>
                ))}
              </div>

              <div className="p-10 bg-[#F2EDE4]/20 rounded-3xl text-center space-y-4">
                <ShieldCheck className="h-8 w-8 text-[#5A7A5C] mx-auto mb-2" />
                <h3 className="text-xl font-display font-medium text-[#1A2E35]">Clinical Formulation Standards</h3>
                <p className="text-sm text-[#1A2E35]/60 max-w-2xl mx-auto leading-relaxed font-sans-clean">
                  Salmara Ayurveda aligns with GMP (Good Manufacturing Practices) and rigorous hygiene standards. Every batch is tested for consistency and ensures no added harmful synthetics, supporting a holistic journey without compromise.
                </p>
              </div>
            </div>
          </section>

          {/* 9) How to Use */}
          <section className="py-24 max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-medium text-[#1A2E35] text-center mb-12">Suggested Use</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="h-12 w-12 bg-[#1A2E35] text-white rounded-2xl flex items-center justify-center font-display font-medium shrink-0">01</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1A2E35] uppercase tracking-widest mb-2">Dosage</h4>
                    <p className="text-sm text-[#1A2E35]/50 leading-relaxed font-sans-clean">Take 1-2 units twice daily, or as directed by your healthcare practitioner. Consistency is key for Ayurvedic efficacy.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="h-12 w-12 bg-[#1A2E35] text-white rounded-2xl flex items-center justify-center font-display font-medium shrink-0">02</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1A2E35] uppercase tracking-widest mb-2">Timing</h4>
                    <p className="text-sm text-[#1A2E35]/50 leading-relaxed font-sans-clean">Best consumed after meals with lukewarm water or milk for optimal bioavailability and gentle digestion.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1A2E35] text-white p-10 rounded-3xl space-y-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-[#C5A059]" />
                  <span className="text-xs font-bold uppercase tracking-widest">Safety Notes</span>
                </div>
                <ul className="space-y-4 text-xs font-sans-clean text-white/60 leading-relaxed">
                  <li>• Store in a cool, dry place away from direct sunlight.</li>
                  <li>• Use within the specific batch timelines (see packaging).</li>
                  <li>• Consult your Ayurvedic practitioner if pregnant or nursing.</li>
                  <li>• For external oils: Conduct a patch test on a small area first.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 10) Quality & Certification */}
          <section className="py-16 bg-[#1A2E35] -mx-4 px-4">
            <div className="container px-4 text-center space-y-10">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.4em]">Standards we align with</h3>
              <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
                {["GMP CERTIFIED", "CERTIFIED BOTANICALS", "AYUSH STANDARDS", "CLINICALLY TESTED"].map(cert => (
                  <span key={cert} className="text-white font-display text-sm tracking-[0.4em] px-6 border-x border-white/10">{cert}</span>
                ))}
              </div>
            </div>
          </section>

          {/* 11) Reviews */}
          <section id="reviews" className="py-24 max-w-4xl mx-auto border-b border-[#F2EDE4]">
            <div className="flex items-center justify-between mb-16">
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-medium text-[#1A2E35]">Customer Reviews</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-[#C5A059]">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-4 w-4 fill-current" />)}
                  </div>
                  <span className="text-xs font-bold text-[#1A2E35]/40 uppercase tracking-widest">Based on 112 verified ratings</span>
                </div>
              </div>
              <button className="bg-[#1A2E35] text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#1A2E35]/90 transition-all">
                Write a Review
              </button>
            </div>
            
            <div className="text-center py-20 bg-white border border-[#F2EDE4] rounded-3xl">
              <p className="text-sm text-[#1A2E35]/40 italic font-body mb-6">"Be the first to review this formulation."</p>
              <div className="h-10 w-px bg-[#F2EDE4] mx-auto" />
            </div>
          </section>

          {/* 12) FAQs */}
          <section className="py-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-display font-medium text-[#1A2E35] text-center mb-16">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-[#F2EDE4] rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full text-left px-8 py-6 flex items-center justify-between hover:bg-[#F2EDE4]/20 transition-all group"
                  >
                    <span className="text-sm font-bold text-[#1A2E35] uppercase tracking-widest leading-relaxed pr-8">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-[#1A2E35]/30 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-8 pb-8"
                      >
                        <p className="text-sm text-[#1A2E35]/50 leading-relaxed font-sans-clean pt-2 border-t border-[#F2EDE4]">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>

          {/* 13) Cross-sells (Recommended) */}
          <section className="py-24 border-t border-[#F2EDE4]">
            <h2 className="text-3xl font-display font-medium text-[#1A2E35] text-center mb-16">Pairs well with</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[1, 2, 3].map(item => (
                <div key={item} className="group bg-white border border-[#F2EDE4] rounded-3xl p-6 text-center hover:border-[#5A7A5C] transition-all">
                  <div className="aspect-square bg-[#FDFBF7] rounded-2xl overflow-hidden mb-6 flex items-center justify-center">
                    <Leaf className="h-12 w-12 text-[#1A2E35]/10 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <p className="text-[10px] font-bold text-[#5A7A5C] uppercase tracking-widest mb-2">Recommended Pair</p>
                  <h4 className="text-base font-display font-medium text-[#1A2E35] mb-4">Ayurvedic Complementary Formulation</h4>
                  <button className="text-[10px] font-bold text-[#1A2E35] underline underline-offset-8 uppercase tracking-widest hover:text-[#5A7A5C] transition-colors">View Product</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
