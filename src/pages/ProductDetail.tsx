import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  fetchProductByHandleViaAdmin,
  checkCustomerHasPurchased,
  getStoredSession,
  fetchReviewStatsViaAdmin,
  createHybridCheckout,
  logCheckoutToTerminal
} from "@/lib/shopifyAdmin";
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
  ArrowRight,
  Heart,
  X,
  Send,
  ChevronRight,
  MessageCircle,
  Droplets,
  Activity,
  Zap,
  Wind,
  Sparkles,
  Stethoscope
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { m, AnimatePresence } from "framer-motion";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useQuestionStore } from "@/stores/questionStore";
import { Image } from "@/components/ui/Image";
import { lazy, Suspense } from "react";
const AddressSelectionModal = lazy(() => import("@/components/AddressSelectionModal"));
import SEO from "@/components/SEO";
import { SectionHeading } from "@/components/ui/SectionHeading";

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
  const [isProductInfoOpen, setIsProductInfoOpen] = useState(true);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const { addItem, isLoading } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { addReview, getReviews, getAverageRating } = useReviewStore();
  const { addQuestion } = useQuestionStore();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewName, setReviewName] = useState("");

  const [questionName, setQuestionName] = useState("");
  const [questionEmail, setQuestionEmail] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Safely calculate average rating
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const averageRating = safeReviews.length > 0
    ? parseFloat((safeReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / safeReviews.length).toFixed(1))
    : 0;

  useEffect(() => {
    const session = getStoredSession();
    if (session?.user) {
      setReviewName(session.user.name || "");
      setQuestionName(session.user.name || "");
      setQuestionEmail(session.user.email || "");

      if (product?.id) {
        checkEligibility(session.user.id, product.id);
      }
    }
  }, [product?.id]);

  const checkEligibility = async (customerId: string, productId: string) => {
    setIsCheckingEligibility(true);
    try {
      const purchased = await checkCustomerHasPurchased(customerId, productId);
      setHasPurchased(purchased);
    } catch (error) {
      console.error("Eligibility check failed:", error);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  useEffect(() => {
    const loadReviews = async () => {
      if (!product?.id) return;
      try {
        const response = await fetch(`/api/reviews?product_id=${encodeURIComponent(product.id)}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(Array.isArray(data) ? data : []);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Failed to load reviews:", error);
      }
    };
    loadReviews();
  }, [product?.id]);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle) return;

    if (!questionName.trim() || !questionEmail.trim() || !questionText.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmittingQuestion(true);
    try {
      const response = await fetch('/api/user_doubt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: questionName,
          email: questionEmail,
          message: questionText,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit question");
      }

      toast.success("Question submitted", { description: "We'll get back to you soon!" });
      setQuestionText("");
    } catch (error) {
      toast.error("Failed to submit question");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;

    const session = getStoredSession();
    if (!session?.user) {
      toast.info("Please login to leave a review");
      navigate("/login");
      return;
    }

    if (!hasPurchased) {
      toast.error("Verification Required", {
        description: "Only customers who purchased this product can leave a review."
      });
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please add your feedback");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          customerId: session.user.id,
          rating: reviewRating,
          reviewText: reviewComment,
          customerName: reviewName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Review submitted", { description: "Thank you for your feedback!" });
        setReviewModalOpen(false);
        setReviewComment("");
        // Reload reviews
        const updatedReviews = await fetch(`/api/reviews?product_id=${encodeURIComponent(product.id)}`).then(r => r.json());
        setReviews(Array.isArray(updatedReviews) ? updatedReviews : []);
      } else {
        toast.error("Submission failed", { description: data.error || "Failed to save review" });
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;
      setLoading(true);
      try {
        const data = await fetchProductByHandleViaAdmin(handle);
        if (data) {
          setProduct(data);
          // Set initial variant
          if (data.variants?.edges?.length > 0) {
            setSelectedVariantIdx(0);
          }
        }
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
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


  const getMetafieldValue = (keyMatch: string) => {
    if (!product?.metafields?.edges) return null;
    
    const cleanMatch = keyMatch.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanHandle = (handle || '').toLowerCase().replace(/-/g, '_').replace(/[^a-z0-9_]/g, '');

    // Common mapping for keys that might have different names in Shopify
    const keyMap: Record<string, string[]> = {
      ingredients: ['ingredients', 'ingrediants', 'triphala_churna', 'herb_list', cleanHandle],
      doctorsinsight: ['doctor_s_insight', 'doctors_insight', 'insight'],
      benefits: ['benefits', 'key_benefits'],
      dosage: ['dosage', 'recommended_dosage'],
      usage: ['usage', 'how_to_use', 'timing'],
      shelf: ['shelf', 'shelf_life_duration'],
      shelflife: ['shelf_life', 'country_of_origin'], // User mentioned shelf_life contains "India"
      netquantity: ['net_quantity', 'quantity'],
      manufacturedby: ['manufactured_by', 'manufacturer'],
      batchno: ['batch_no', 'batch_number'],
      licenseno: ['license_no', 'license_number'],
      formulationtype: ['formulation_type', 'type_of_formulation']
    };

    const possibleKeys = keyMap[cleanMatch] || [cleanMatch];

    const node = product.metafields.edges.find((e: any) => {
      const rawKey = e.node.key.toLowerCase();
      const cleanKey = rawKey.replace(/[^a-z0-9]/g, '');
      
      return (
        cleanKey === cleanMatch || 
        possibleKeys.includes(rawKey) ||
        possibleKeys.includes(cleanKey)
      );
    })?.node;

    return node ? node.value : null;
  };

  const getBenefitIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('bleeding') || t.includes('blood') || t.includes('digestion') || t.includes('stomach')) return <Droplets className="h-4 w-4" />;
    if (t.includes('energy') || t.includes('stamina') || t.includes('metabolism')) return <Zap className="h-4 w-4" />;
    if (t.includes('lung') || t.includes('breathing') || t.includes('respiratory')) return <Wind className="h-4 w-4" />;
    if (t.includes('skin') || t.includes('glow') || t.includes('detox')) return <Sparkles className="h-4 w-4" />;
    if (t.includes('heart') || t.includes('stress') || t.includes('mind')) return <Heart className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const firstBenefit = getMetafieldValue('benefits')?.split(/[,\n]+/)[0]?.trim();
  const benefitLine = firstBenefit || "Ayurvedic Formulation";
  const subtitle = product.description?.split('.')[0] + '.' || "-";

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

    const session = getStoredSession();
    if (!session?.user) {
       toast.info("Please sign in to proceed with direct checkout");
      const encodedId = encodeURIComponent(selectedVariant.id);
      navigate(`/login?redirect=buy_now&variantId=${encodedId}&quantity=${quantity}`);
      return;
    }

    setIsAddressModalOpen(true);
  };

  const onAddressSelect = async (address: any) => {
    setIsBuyingNow(true);
    
    try {
      const lineItems = [{ variantId: selectedVariant.id, quantity: quantity }];
      const result = await createHybridCheckout(lineItems, getStoredSession()?.user?.id, getStoredSession()?.user?.email, address);

       if (result.success && result.checkoutUrl) {
        await logCheckoutToTerminal(result.checkoutUrl, `ProductDetail (Buy Now: ${encodeURIComponent(selectedVariant.id)})`);
        window.location.href = result.checkoutUrl;
      } else {
        toast.error("Checkout failed", {
          description: "Could not generate checkout link. Please try again."
        });
        setIsBuyingNow(false);
        setIsAddressModalOpen(false);
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
      setIsBuyingNow(false);
      setIsAddressModalOpen(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const currentUrl = window.location.href;
  const productDescription = product.description?.substring(0, 160) || "";
  const productImage = images[0]?.node?.url || "";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": images[0]?.node?.url,
    "description": product.description,
    "sku": selectedVariant?.sku || "",
    "brand": {
      "@type": "Brand",
      "name": "Salmara Ayurveda"
    },
    "offers": {
      "@type": "Offer",
      "url": currentUrl,
      "priceCurrency": selectedVariant?.price.currencyCode || "INR",
      "price": selectedVariant?.price.amount,
      "availability": selectedVariant?.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={product.title}
        description={product.description}
        image={images[0]?.node?.url}
        jsonLd={productJsonLd}
      />
      <Header />
      
      <main className="py-6 md:py-8 lg:py-10 xl:py-12 overflow-x-hidden">
        <div className="container px-4 mx-auto max-w-7xl">
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 mb-6 md:mb-8 lg:mb-10 xl:mb-12">
            <Link to="/" className="hover:text-[#5A7A5C]">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/shop" className="hover:text-[#5A7A5C]">Shop</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#1A2E35]">{product.title}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 xl:gap-12 mb-6 md:mb-8 lg:mb-10 xl:mb-12">
            <div className="space-y-6">
              <div className="sticky top-32">
                <m.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                  className="aspect-square bg-white rounded-3xl overflow-hidden border border-[#F2EDE4] flex items-center justify-center shadow-lg mb-6 relative cursor-zoom-in"
                >
                  {images[selectedImage]?.node ? (
                    <Image 
                      src={images[selectedImage].node.url} 
                      alt={images[selectedImage].node.altText || product.title} 
                      className="w-full h-full object-cover transition-transform duration-200 ease-out"
                      style={{
                        transform: isZooming ? `scale(2)` : `scale(1)`,
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                      }}
                    />
                  ) : (
                    <Leaf className="h-20 w-20 text-[#1A2E35]/10" />
                  )}
                  <button 
                    onClick={async (e) => {
                      e.preventDefault();
                      if (selectedVariant) await toggleItem({ node: product } as any, selectedVariant.id);
                    }}
                    className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md border transition-all z-20 ${
                      selectedVariant && isInWishlist(selectedVariant.id) 
                        ? 'bg-red-500 border-red-500 text-white' 
                        : 'bg-white/80 border-[#F2EDE4] text-[#1A2E35] hover:bg-white'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${selectedVariant && isInWishlist(selectedVariant.id) ? 'fill-white' : ''}`} />
                  </button>
                </m.div>
                
                {images.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {images.map((img: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${i === selectedImage ? 'border-[#5A7A5C]' : 'border-[#F2EDE4] hover:border-[#5A7A5C]/30'}`}
                      >
                         <Image src={img.node.url} alt={`${product.title} view ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <m.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-[#5A7A5C]/5 rounded-full border border-[#5A7A5C]/10"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-[#5A7A5C]" />
                  <span className="text-[9px] uppercase tracking-[0.22em] text-[#5A7A5C] font-bold">{benefitLine}</span>
                </m.div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-[#1A2E35] leading-tight tracking-tight">
                  {product.title}
                </h1>
                
                <p className="text-lg text-[#1A2E35]/50 font-sans-clean leading-relaxed max-w-md">
                   {subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A2E35]/60 uppercase tracking-widest">
                    <ShieldCheck className="h-4 w-4 text-[#5A7A5C]" /> GMP Certified
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A2E35]/60 uppercase tracking-widest">
                    <Leaf className="h-4 w-4 text-[#C5A059]" /> 100% Herbal
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A2E35]/60 uppercase tracking-widest">
                    <CheckCircle2 className="h-4 w-4 text-[#5A7A5C]" /> CLINICAL
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-4xl font-sans-clean font-bold text-[#1A2E35]">
                      {selectedVariant?.price.currencyCode === 'INR' ? '₹' : selectedVariant?.price.currencyCode}{' '}
                      {parseFloat(selectedVariant?.price.amount || "0").toFixed(2)}
                    </span>
                  </div>
                  
                  {selectedVariant?.compareAtPrice && parseFloat(selectedVariant.compareAtPrice.amount) > parseFloat(selectedVariant.price.amount) && (
                    <div className="flex flex-col justify-center">
                      <span className="text-sm text-[#1A2E35]/30 line-through">
                        {selectedVariant.compareAtPrice.currencyCode === 'INR' ? '₹' : selectedVariant.compareAtPrice.currencyCode}{' '}
                        {parseFloat(selectedVariant.compareAtPrice.amount).toFixed(2)}
                      </span>
                      <span className="text-[#5A7A5C] text-[10px] font-bold uppercase tracking-wider">
                        Save {Math.round(((parseFloat(selectedVariant.compareAtPrice.amount) - parseFloat(selectedVariant.price.amount)) / parseFloat(selectedVariant.compareAtPrice.amount)) * 100)}% Today
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-6 whitespace-nowrap">
                  {safeReviews.length > 0 ? (
                    <>
                      <div className="flex gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`h-4 w-4 ${s <= Math.round(averageRating) ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#F2EDE4]'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-[#1A2E35] shrink-0">
                        {averageRating}
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="h-4 w-4 text-[#F2EDE4]" />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-[#1A2E35]/40 tracking-tight uppercase">New Launch / No reviews yet</span>
                    </div>
                  )}
                  <a href="#reviews" className="text-xs text-[#1A2E35]/40 shrink-0 hover:text-[#5A7A5C] underline underline-offset-4">
                    ({safeReviews.length} reviews)
                  </a>
                </div>
              </div>

              {hasMultipleVariants && (
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 px-1">Select Format</label>
                  <div className="flex flex-wrap gap-3">
                    {variants.map((v: any, i: number) => (
                      <button
                        key={v.node.id}
                        onClick={() => { setSelectedVariantIdx(i); setSelectedImage(0); }}
                        disabled={!v.node.availableForSale}
                        className={`px-8 py-4 rounded-2xl text-[10px] font-bold transition-all border uppercase tracking-widest ${
                          i === selectedVariantIdx
                            ? 'bg-[#1A2E35] border-[#1A2E35] text-white shadow-[#1A2E35]/20 shadow-xl'
                            : 'bg-white border-[#F2EDE4] text-[#1A2E35] hover:border-[#5A7A5C]'
                        } ${!v.node.availableForSale ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {v.node.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 md:space-y-4">
                {!selectedVariant?.availableForSale ? (
                  <button
                    disabled
                    className="w-full bg-[#F2EDE4] text-[#1A2E35]/40 min-h-[64px] rounded-xl font-bold uppercase tracking-widest text-sm cursor-not-allowed flex items-center justify-center shadow-inner"
                  >
                    Sold Out
                  </button>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                      <div className="flex items-center bg-white border border-[#F2EDE4] rounded-xl px-2 min-h-[56px] md:w-32 justify-between shrink-0">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                          className="p-3 text-[#1A2E35]/30 hover:text-[#1A2E35] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-display font-medium text-[#1A2E35]">
                          {quantity}
                        </span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)} 
                          className="p-3 text-[#1A2E35]/30 hover:text-[#1A2E35] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={handleAddToCart}
                        disabled={isLoading}
                        className="flex-1 border border-[#5A7A5C] text-[#5A7A5C] min-h-[56px] rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#5A7A5C] hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <><ShoppingCart className="h-5 w-5" /> Add to Cart</>
                        )}
                      </button>
                    </div>
                    
                    <button 
                      onClick={handleBuyNow}
                      disabled={isBuyingNow}
                      className="w-full bg-[#1A2E35] text-white min-h-[56px] rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#1A2E35]/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-[#1A2E35]/20 flex items-center justify-center gap-2"
                    >
                      {isBuyingNow ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buy Now Direct"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Description Section */}
          <div className="pt-2 md:pt-4 lg:pt-6 border-t border-[#F2EDE4]">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 lg:space-y-10 xl:space-y-12">
              <div className="space-y-2">
                <label className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-[#1A2E35]/40 px-1 font-sans-clean">Detailed Description</label>
                <div 
                  className="text-sm md:text-base text-[#1A2E35]/70 font-sans-clean leading-relaxed prose prose-stone max-w-none 
                             prose-p:mb-5 prose-p:leading-loose prose-strong:text-[#1A2E35] prose-strong:font-bold prose-headings:font-display prose-headings:text-[#1A2E35]"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
                />
              </div>

              {/* Combined Clinical Guidance & Doctor's Insight */}
              <m.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#5A7A5C]/5 border border-[#5A7A5C]/10 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-12 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-[#5A7A5C]/10 rounded-full blur-2xl md:blur-3xl -mr-24 md:-mr-32 -mt-24 md:-mt-32" />
                
                <div className="relative z-10 grid lg:grid-cols-12 gap-8 md:gap-10 lg:gap-16 items-center">
                  <div className="lg:col-span-7 space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-sm">
                        <Leaf className="h-4 w-4 md:h-5 md:w-5 text-[#5A7A5C]" />
                      </div>
                      <h2 className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#5A7A5C] font-sans-clean">Doctor's Clinical Insight</h2>
                    </div>
                    
                    {getMetafieldValue('doctorsinsight') ? (
                      <blockquote className="text-base md:text-lg lg:text-xl text-[#1A2E35]/80 font-sans-clean leading-relaxed italic border-l-4 border-[#5A7A5C]/20 pl-4 md:pl-6">
                        "{getMetafieldValue('doctorsinsight')}"
                      </blockquote>
                    ) : (
                      <p className="text-sm text-[#1A2E35]/40 italic px-1 font-sans-clean">Expert clinical analysis for this formulation is being finalized.</p>
                    )}
                  </div>

                  <div className="lg:col-span-5 bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-[#5A7A5C]/10 shadow-xl shadow-[#5A7A5C]/5 space-y-5 md:space-y-6">
                    <div>
                      <h3 className="text-[11px] md:text-xs font-bold text-[#1A2E35] uppercase tracking-widest mb-1 md:mb-2 font-sans-clean">Need Guidance?</h3>
                      <p className="text-[11px] md:text-xs text-[#1A2E35]/50 leading-relaxed font-sans-clean">
                        Connect with our Ayurvedic practitioners for personalized advice on how to integrate this formulation into your regimen.
                      </p>
                    </div>
                    <a 
                      href={`https://wa.me/919353436373?text=${encodeURIComponent(`Hello Salmara Team, I would like to consult a doctor regarding ${product.title}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#5A7A5C] text-white h-14 md:h-16 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-[#4A634B] transition-all shadow-lg shadow-[#5A7A5C]/20 flex items-center justify-center gap-3 group"
                    >
                      <MessageCircle className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:scale-110" />
                      Consult via WhatsApp
                    </a>
                  </div>
                </div>
              </m.div>
            </div>
          </div>

          {getMetafieldValue('benefits') && (
            <section className="py-6 md:py-8 lg:py-10 xl:py-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white via-[#FDFBF7]/50 to-white -z-10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5A7A5C]/3 rounded-full blur-[100px] -z-10" />
              
              <div className="container px-4 mx-auto">
                <div className="max-w-2xl mx-auto text-center mb-10 md:mb-12">
                  <SectionHeading 
                    title="How it Supports Your Wellness"
                    eyebrow="THE SALMARA EXPERIENCE"
                    animate={false}
                    className="mb-4"
                  />
                  <p className="text-sm text-[#1A2E35]/40 font-params-body max-w-lg mx-auto leading-relaxed">
                    Authentic clinical standards localized in every batch for holistic care.
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                  {getMetafieldValue('benefits')
                    .split(/[,\n]+/)
                    .map((benefit: string, i: number) => {
                      // Split by common dash separators: — (em), – (en), - (hyphen)
                      const [title, ...descParts] = benefit.split(/\s*[—–-]\s*/);
                      const description = descParts.join(' — ');

                      return (
                        <m.div 
                          key={i} 
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          className="group relative h-full"
                        >
                          <div className="h-full p-6 md:p-8 bg-white/60 backdrop-blur-sm rounded-[2.5rem] md:rounded-[3rem] border border-[#F2EDE4] transition-all duration-500 overflow-hidden shadow-sm flex flex-col hover:border-[#5A7A5C]/30 hover:shadow-lg hover:shadow-[#5A7A5C]/5">
                            
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#5A7A5C]/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                            
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl flex items-center justify-center mb-5 md:mb-6 shrink-0 bg-[#5A7A5C]/10 text-[#5A7A5C] transition-colors group-hover:bg-[#5A7A5C] group-hover:text-white">
                              {getBenefitIcon(title)}
                            </div>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <div className="h-px w-3 md:w-5 bg-[#5A7A5C]/30"/>
                              <h4 className="text-[8px] md:text-[9px] font-sans-clean font-bold uppercase tracking-[0.2em] text-[#5A7A5C]/60 truncate">
                                Support {i + 1}
                              </h4>
                            </div>

                            {description ? (
                              <>
                                <h3 className="text-sm md:text-base font-bold text-[#1A2E35] mb-2 font-sans-clean uppercase tracking-tight">
                                  {title}
                                </h3>
                                <p className="text-[11px] md:text-sm font-sans-clean text-[#1A2E35]/70 leading-relaxed italic flex-1">
                                  {description}
                                </p>
                              </>
                            ) : (
                              <p className="text-[11px] md:text-base font-sans-clean text-[#1A2E35] leading-relaxed flex-1 uppercase font-bold tracking-tight">
                                {title}
                              </p>
                            )}


                          </div>
                        </m.div>
                      );
                    })}
                </div>
              </div>
            </section>
          )}

          <section className="py-6 md:py-8 lg:py-10 xl:py-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-[#FDFBF7]/30 to-white -z-10" />
            
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="max-w-2xl mx-auto text-center mb-10 md:mb-12">
                <SectionHeading 
                  title="Core Herbs & Extracts"
                  eyebrow="Ingredient Insights"
                  animate={false}
                  className="mb-4"
                />
                <p className="text-sm text-[#1A2E35]/50 font-sans-clean max-w-lg mx-auto leading-relaxed italic">
                  "Transparency is the root of trust. Every milligram is ethically sourced and standardized."
                </p>
              </div>
              
              {getMetafieldValue('ingredients') ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                  {getMetafieldValue('ingredients')
                    .split(/\n+/)
                    .map((line: string) => line.trim())
                    .filter(Boolean)
                    .map((item: string, i: number) => {
                      // Split by common dash separators: — (em), – (en), - (hyphen)
                      const [name, ...descParts] = item.split(/\s*[—–-]\s*/);
                      const description = descParts.join(' — ');
                      
                      return (
                        <m.div 
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: i * 0.03 }}
                          className="group flex flex-col h-full p-6 md:p-8 bg-white/60 hover:bg-white/90 backdrop-blur-sm rounded-[2.5rem] md:rounded-[3rem] border border-[#F2EDE4] hover:border-[#5A7A5C]/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-[#5A7A5C]/5"
                        >
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#5A7A5C]/10 rounded-2xl flex items-center justify-center text-[#5A7A5C] mb-5 md:mb-6 shrink-0 transition-colors group-hover:bg-[#5A7A5C] group-hover:text-white">
                            <Leaf className="h-5 w-5" />
                          </div>
                          
                          <div className="flex flex-col flex-1">
                            <h3 className="text-sm md:text-base font-bold text-[#1A2E35] mb-2 font-display transition-colors group-hover:text-[#5A7A5C]">
                              {name}
                            </h3>
                            {description && (
                              <p className="text-[11px] md:text-sm text-[#1A2E35]/70 leading-relaxed font-sans-clean italic">
                                {description}
                              </p>
                            )}
                          </div>
                        </m.div>
                      );
                    })}
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-[#F2EDE4] text-center bg-white/50 max-w-xs mx-auto">
                  <p className="text-xs text-[#1A2E35]/40 font-sans-clean italic">Details updating soon.</p>
                </div>
              )}

              <div className="mt-6 md:mt-8 lg:mt-10 xl:mt-12 p-6 md:p-10 bg-white/40 backdrop-blur-md rounded-[2rem] md:rounded-[3rem] text-center max-w-4xl mx-auto border border-[#5A7A5C]/10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#5A7A5C] transition-colors duration-500" />
                <div className="flex flex-col md:flex-row items-center gap-8 md:text-left">
                  <div className="h-20 w-20 bg-[#5A7A5C]/5 rounded-full flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-10 w-10 text-[#5A7A5C] stroke-[1]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                      <CheckCircle2 className="h-3 w-3 text-[#5A7A5C]" />
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#1A2E35]">Quality Assurance</h3>
                    </div>
                    <h4 className="text-base md:text-lg font-display font-medium text-[#1A2E35] mb-3">Standardization Protocol</h4>
                    <p className="text-sm text-[#1A2E35]/50 leading-relaxed font-sans-clean">
                      This formulation aligns with GMP (Good Manufacturing Practices) and rigorous hygiene standards. Every batch is ethically sourced, free from synthetic additives, and standardized for maximum therapeutic efficacy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-6 md:py-8 lg:py-10 xl:py-12 px-4 max-w-7xl mx-auto border-t border-[#F2EDE4]/30">
            <div className="text-center mb-6 md:mb-8 lg:mb-10 xl:mb-12">
              <SectionHeading 
                title="Suggested Use"
                eyebrow="DOSAGE & GUIDELINES"
                animate={false}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 lg:gap-10 max-w-6xl mx-auto">
              <m.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 bg-white/60 backdrop-blur-sm rounded-[2.5rem] border border-[#F2EDE4] shadow-sm flex gap-6 items-start"
              >
                <div className="h-12 w-12 bg-[#1A2E35] text-white rounded-2xl flex items-center justify-center font-display font-medium shrink-0 shadow-lg shadow-[#1A2E35]/10">01</div>
                <div>
                  <h3 className="text-[10px] font-bold text-[#1A2E35] uppercase tracking-[0.2em] mb-3">Recommended Dosage</h3>
                  <p className="text-[15px] text-[#1A2E35]/70 leading-relaxed font-sans-clean italic">
                    {getMetafieldValue('dosage') ? `"${getMetafieldValue('dosage')}"` : "Consult your practitioner for personalized dosage details."}
                  </p>
                </div>
              </m.div>

              <m.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-8 bg-white/60 backdrop-blur-sm rounded-[2.5rem] border border-[#F2EDE4] shadow-sm flex gap-6 items-start"
              >
                <div className="h-12 w-12 bg-[#1A2E35] text-white rounded-2xl flex items-center justify-center font-display font-medium shrink-0 shadow-lg shadow-[#1A2E35]/10">02</div>
                <div>
                  <h3 className="text-[10px] font-bold text-[#1A2E35] uppercase tracking-[0.2em] mb-3">Timing & Usage</h3>
                  <p className="text-[15px] text-[#1A2E35]/70 leading-relaxed font-sans-clean italic">
                    {getMetafieldValue('usage') ? `"${getMetafieldValue('usage')}"` : "Instructions updated per individual therapeutic recommendations."}
                  </p>
                </div>
              </m.div>
            </div>
          </section>

          {hasPurchased && (
            <section id="reviews" className="py-6 md:py-8 lg:py-10 xl:py-12 px-4 max-w-7xl mx-auto">
              <div className="bg-[#FDFBF7]/50 border border-[#F2EDE4] rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12">
                <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-16 mb-12">
                  <div className="flex-1 space-y-4">
                    <SectionHeading 
                      title="Customer Experience"
                      eyebrow="VERIFIED FEEDBACK"
                      centered={false}
                      animate={false}
                      className="mb-0"
                    />
                    <div className="flex flex-wrap items-center gap-5">
                      <div className="flex items-center gap-1.5 text-[#C5A059]">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star 
                            key={s} 
                            className={`h-5 w-5 ${s <= Math.round(averageRating) ? 'fill-current' : 'text-[#F2EDE4]'}`} 
                          />
                        ))}
                      </div>
                      <div className="h-4 w-px bg-[#F2EDE4]" />
                      <span className="text-[11px] font-bold text-[#1A2E35] uppercase tracking-widest">
                        {averageRating} / 5.0
                      </span>
                      <span className="text-[10px] font-bold text-[#1A2E35]/30 uppercase tracking-widest">
                        ({safeReviews.length} Verified Ratings)
                      </span>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center">
                    <button 
                      onClick={() => setReviewModalOpen(true)}
                      className="w-full sm:w-auto bg-[#1A2E35] text-white px-10 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#5A7A5C] transition-all shadow-xl shadow-[#1A2E35]/10 flex items-center justify-center gap-3 active:scale-[0.98]"
                      disabled={isCheckingEligibility}
                    >
                      {isCheckingEligibility ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Write a Review</>}
                    </button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                  <AnimatePresence mode="popLayout">
                    {safeReviews.map((review, idx) => (
                      <m.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white/70 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-[#F2EDE4] shadow-sm flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-1 text-[#C5A059]">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-current' : 'text-[#F2EDE4]'}`} />
                              ))}
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#5A7A5C]/5 border border-[#5A7A5C]/10 rounded-full">
                              <CheckCircle2 className="h-3 w-3 text-[#5A7A5C]" />
                              <span className="text-[8px] font-bold text-[#5A7A5C] uppercase tracking-wider">Verified Buyer</span>
                            </div>
                          </div>
                          <p className="text-sm md:text-base text-[#1A2E35]/70 leading-relaxed font-sans-clean italic">
                            "{review.review_text}"
                          </p>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-[#F2EDE4]/50 flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#1A2E35] uppercase tracking-wide">{review.customer_name || "Verified Customer"}</span>
                            <span className="text-[9px] text-[#1A2E35]/40 font-bold uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="h-8 w-8 bg-[#FDFBF7] rounded-full flex items-center justify-center border border-[#F2EDE4]">
                            <Star className="h-3 w-3 text-[#C5A059]" />
                          </div>
                        </div>
                      </m.div>
                    ))}
                  </AnimatePresence>

                  {safeReviews.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white/40 border border-dashed border-[#F2EDE4] rounded-3xl">
                      <div className="h-12 w-12 bg-[#F2EDE4]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="h-6 w-6 text-[#1A2E35]/10" />
                      </div>
                      <p className="text-xs text-[#1A2E35]/40 italic font-body uppercase tracking-[0.2em]">"No reviews yet. Be the first to share your journey."</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          <AnimatePresence>
            {reviewModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setReviewModalOpen(false)}
                  className="absolute inset-0 bg-[#1A2E35]/40 backdrop-blur-sm"
                />
                <m.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-lg bg-[#FDFBF7] rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-[#F2EDE4]"
                >
                  <button 
                    onClick={() => setReviewModalOpen(false)}
                    className="absolute top-8 right-8 p-2 text-[#1A2E35]/20 hover:text-[#1A2E35] transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="text-center mb-6">
                    <p className="text-[#5A7A5C] font-sans-clean text-[10px] font-bold uppercase tracking-[0.3em] mb-3">Share your experience</p>
                    <h3 className="text-3xl font-display font-medium text-[#1A2E35]">Product Review</h3>
                  </div>

                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40">Your Rating</label>
                      <div className="flex gap-2 justify-center py-2 bg-white rounded-2xl border border-[#F2EDE4]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 transition-transform hover:scale-125 focus:outline-none"
                          >
                            <Star 
                              className={`h-7 w-7 transition-colors ${star <= reviewRating ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#F2EDE4]'}`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40">Your Name</label>
                      <input
                        type="text"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-white border border-[#F2EDE4] rounded-2xl px-6 py-3 text-sm font-sans-clean outline-none focus:border-[#5A7A5C] transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40">Your Feedback</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="How has this formulation supported you?"
                        rows={3}
                        className="w-full bg-white border border-[#F2EDE4] rounded-2xl px-6 py-3 text-sm font-sans-clean outline-none focus:border-[#5A7A5C] transition-colors resize-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full bg-[#1A2E35] text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#5A7A5C] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#1A2E35]/10 disabled:opacity-50"
                    >
                      {isSubmittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Submit Review <Send className="h-4 w-4" /></>}
                    </button>
                  </form>
                </m.div>
              </div>
            )}
          </AnimatePresence>

          <section className="py-6 md:py-8 lg:py-10 xl:py-12 max-w-3xl mx-auto">
            <SectionHeading 
              title="Product Information & FAQ"
              animate={false}
            />
            <div className="space-y-8">
              
              <div className="border border-[#F2EDE4] rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setIsProductInfoOpen(!isProductInfoOpen)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-[#F2EDE4]/20 transition-all group bg-[#FDFBF7]"
                >
                  <span className="text-xs md:text-sm font-bold text-[#1A2E35] uppercase tracking-widest leading-relaxed pr-8">Know Your Product</span>
                  <ChevronDown className={`h-4 w-4 text-[#1A2E35]/30 transition-transform ${isProductInfoOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isProductInfoOpen && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 bg-[#FDFBF7]"
                    >
                      <div className="pt-4 border-t border-[#F2EDE4] overflow-x-auto">
                        <table className="w-full text-left bg-white border border-[#F2EDE4] rounded-2xl overflow-hidden shadow-sm">
                          <thead>
                            <tr className="border-b border-[#F2EDE4] bg-[#FDFBF7]">
                              <th className="py-5 px-6 text-sm font-bold text-[#1A2E35] w-1/3">Field</th>
                              <th className="py-5 px-6 text-sm font-bold text-[#1A2E35]">Example</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-[#F2EDE4] hover:bg-[#F2EDE4]/20 transition-colors">
                              <th className="py-4 px-6 text-sm font-bold text-[#1A2E35]/70">Shelf Life:</th>
                              <td className="py-4 px-6 text-sm text-[#1A2E35]/60 font-sans-clean">{getMetafieldValue('shelf') || "-"}</td>
                            </tr>
                            <tr className="border-b border-[#F2EDE4] bg-[#FDFBF7]/50 hover:bg-[#F2EDE4]/20 transition-colors">
                              <th className="py-4 px-6 text-sm font-bold text-[#1A2E35]/70">Net Quantity:</th>
                              <td className="py-4 px-6 text-sm text-[#1A2E35]/60 font-sans-clean">{getMetafieldValue('netquantity') || (selectedVariant?.title !== "Default Title" ? selectedVariant?.title : null) || "-"}</td>
                            </tr>
                            <tr className="border-b border-[#F2EDE4] hover:bg-[#F2EDE4]/20 transition-colors">
                              <th className="py-4 px-6 text-sm font-bold text-[#1A2E35]/70">Formulation Type:</th>
                              <td className="py-4 px-6 text-sm text-[#1A2E35]/60 font-sans-clean">{getMetafieldValue('formulationtype') || product.productType || "-"}</td>
                            </tr>
                            <tr className="border-b border-[#F2EDE4] bg-[#FDFBF7]/50 hover:bg-[#F2EDE4]/20 transition-colors">
                              <th className="py-4 px-6 text-sm font-bold text-[#1A2E35]/70">Manufactured By:</th>
                              <td className="py-4 px-6 text-sm text-[#1A2E35]/60 font-sans-clean">{getMetafieldValue('manufacturedby') || product.vendor || "-"}</td>
                            </tr>
                            <tr className="border-b border-[#F2EDE4] hover:bg-[#F2EDE4]/20 transition-colors">
                              <th className="py-4 px-6 text-sm font-bold text-[#1A2E35]/70">Batch No.:</th>
                              <td className="py-4 px-6 text-sm text-[#1A2E35]/60 font-sans-clean">
                                {getMetafieldValue('batchno') ? (
                                  <span className="px-2 py-1 rounded text-xs font-bold bg-[#5A7A5C] text-white tracking-widest">{getMetafieldValue('batchno')}</span>
                                ) : "-"}
                              </td>
                            </tr>
                            <tr className="border-b border-[#F2EDE4] bg-[#FDFBF7]/50 hover:bg-[#F2EDE4]/20 transition-colors">
                              <th className="py-4 px-6 text-sm font-bold text-[#1A2E35]/70">License No.:</th>
                              <td className="py-4 px-6 text-sm text-[#1A2E35]/60 font-sans-clean">
                                {getMetafieldValue('licenseno') ? (
                                  <span className="px-2 py-1 rounded text-xs font-bold bg-[#5A7A5C] text-white tracking-widest">{getMetafieldValue('licenseno')}</span>
                                ) : "-"}
                              </td>
                            </tr>
                            <tr className="hover:bg-[#F2EDE4]/20 transition-colors">
                              <th className="py-4 px-6 text-sm font-bold text-[#1A2E35]/70">Country of Origin:</th>
                              <td className="py-4 px-6 text-sm text-[#1A2E35]/60 font-sans-clean">{getMetafieldValue('shelflife') || "India"}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-4 pt-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-[#F2EDE4] rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-[#F2EDE4]/20 transition-all group"
                  >
                    <span className="text-xs md:text-sm font-bold text-[#1A2E35] uppercase tracking-widest leading-relaxed pr-8">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-[#1A2E35]/30 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6"
                      >
                        <p className="text-[11px] md:text-sm text-[#1A2E35]/50 leading-relaxed font-sans-clean pt-2 border-t border-[#F2EDE4]">
                          {faq.a}
                        </p>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              </div>
            </div>
          </section>

          <section className="py-6 md:py-8 lg:py-10 xl:py-12 border-t border-[#F2EDE4]">
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#1A2E35] rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#5A7A5C]/10 rounded-full blur-3xl" />
                
                <div className="grid lg:grid-cols-2 gap-16 relative z-10">
                  <div className="space-y-6">
                    <p className="text-[#C5A059] font-sans-clean text-[10px] font-bold uppercase tracking-[0.3em]">Support & Guidance</p>
                    <SectionHeading 
                      title={<>Herbal Wisdom <br className="sm:hidden" /> and Standardization <br /> Meet Modern Lifestyle.</>}
                      titleClassName="!text-white"
                      animate={false}
                    />
                    <p className="text-white/60 font-sans-clean leading-relaxed">
                      Our practitioners are here to guide you. Whether it's about ingredients, dosage, or specific wellness goals, we're happy to help.
                    </p>
                    
                    <div className="pt-8 flex flex-col gap-4">
                      <div className="flex items-center gap-4 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        <div className="h-px w-8 bg-white/10" /> Response within 24 hours
                      </div>
                      <div className="flex items-center gap-4 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        <div className="h-px w-8 bg-white/10" /> Personalized Guidance
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleQuestionSubmit} className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={questionName}
                          onChange={(e) => setQuestionName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#C5A059] transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={questionEmail}
                          onChange={(e) => setQuestionEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#C5A059] transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-1">Your Question</label>
                        <textarea
                          required
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          placeholder="What would you like to know?"
                          rows={4}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#C5A059] transition-colors resize-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingQuestion}
                      className="w-full bg-[#C5A059] text-[#1A2E35] py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all flex items-center justify-center gap-2 group"
                    >
                      {isSubmittingQuestion ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Submit Inquiry 
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
      {getStoredSession()?.user?.id && (
        <Suspense fallback={null}>
          <AddressSelectionModal 
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            customerId={getStoredSession()?.user?.id}
            onSelect={onAddressSelect}
            isProcessing={isBuyingNow}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ProductDetail;
