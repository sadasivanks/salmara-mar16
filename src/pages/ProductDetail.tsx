import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  fetchProductByHandleViaAdmin,
  fetchProductsByIdsViaAdmin,
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
  const [selectedMetafieldOptionIdx, setSelectedMetafieldOptionIdx] = useState(0);
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
  const [activeTab, setActiveTab] = useState<'description' | 'additional' | 'shipping' | 'faq' | 'reviews'>('description');
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
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoadingRelatedProducts, setIsLoadingRelatedProducts] = useState(false);

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
          setSelectedMetafieldOptionIdx(0);
        }
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [handle]);

  useEffect(() => {
    const loadRelatedProducts = async () => {
      if (!product?.metafields?.edges?.length) {
        setRelatedProducts([]);
        return;
      }

      const relatedMetafield = product.metafields.edges.find(
        (edge: any) =>
          edge?.node?.namespace === "custom" &&
          edge?.node?.key?.toLowerCase() === "related_products"
      );

      const rawValue = relatedMetafield?.node?.value;
      if (!rawValue) {
        setRelatedProducts([]);
        return;
      }

      let parsedIds: string[] = [];

      try {
        const parsed = JSON.parse(rawValue);
        if (Array.isArray(parsed)) {
          parsedIds = parsed.map((id) => String(id)).filter(Boolean);
        }
      } catch {
        parsedIds = rawValue
          .split(",")
          .map((id: string) => id.trim())
          .filter(Boolean);
      }

      if (!parsedIds.length) {
        setRelatedProducts([]);
        return;
      }

      setIsLoadingRelatedProducts(true);
      try {
        const products = await fetchProductsByIdsViaAdmin(parsedIds);
        const currentProductId = product.id;
        setRelatedProducts(products.filter((p: any) => p.id !== currentProductId));
      } catch (error) {
        console.error("Failed to load related products:", error);
        setRelatedProducts([]);
      } finally {
        setIsLoadingRelatedProducts(false);
      }
    };

    loadRelatedProducts();
  }, [product?.id, product?.metafields?.edges]);

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
      price: ['price', 'mrp', 'selling_price'],
      manufacturedby: ['manufactured_by', 'manufacturer'],
      batchno: ['batch_no', 'batch_number'],
      licenseno: ['license_no', 'license_number'],
      formulationtype: ['formulation_type', 'type_of_formulation'],
      keyhighlights: ['key_highlights', 'highlights', 'key_points'],
      deliveryreturns: ['delivery_and_returns', 'delivery_returns', 'returns', 'shipping_returns'],
      relatedproducts: ['related_products']
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
  const parseRows = (value: string | null) => {
    if (!value) return [];
    const normalized = value
      .replace(/\r/g, "\n")
      .split(/\n+|\|+/)
      .map((row) => row.trim())
      .filter(Boolean);

    if (normalized.length === 1 && normalized[0].includes(",")) {
      return normalized[0]
        .split(",")
        .map((row) => row.trim())
        .filter(Boolean);
    }

    return normalized;
  };
  const keyHighlights = parseRows(getMetafieldValue("keyhighlights"));
  const deliveryReturnsRows = parseRows(getMetafieldValue("deliveryreturns"));

  const variants = product.variants?.edges || [];
  const selectedVariant = variants[selectedVariantIdx]?.node;
  const images = product.images?.edges || [];
  const hasMultipleVariants = variants.length > 1 && !(variants.length === 1 && variants[0].node.title === "Default Title");
  const parseMetafieldParts = (value: string | null) =>
    (value || "")
      .split("/")
      .map((part) => part.trim())
      .filter(Boolean);

  const metafieldNetQuantities = parseMetafieldParts(getMetafieldValue("netquantity"));
  const metafieldPrices = parseMetafieldParts(getMetafieldValue("price"));
  const metafieldOptionsCount = Math.max(metafieldNetQuantities.length, metafieldPrices.length);
  const usesMetafieldVariantOptions = !hasMultipleVariants && metafieldOptionsCount > 1;

  const selectedMetafieldNetQty = metafieldNetQuantities[selectedMetafieldOptionIdx] || metafieldNetQuantities[0] || "";
  const selectedMetafieldPriceRaw = metafieldPrices[selectedMetafieldOptionIdx] || metafieldPrices[0] || "";
  const selectedMetafieldPrice = Number((selectedMetafieldPriceRaw || "").replace(/[^\d.]/g, ""));
  const hasValidMetafieldPrice = Number.isFinite(selectedMetafieldPrice) && selectedMetafieldPrice > 0;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    const cartPrice = hasValidMetafieldPrice
      ? { amount: selectedMetafieldPrice.toFixed(2), currencyCode: "INR" }
      : selectedVariant.price;
    const selectedFormatLabel =
      selectedMetafieldNetQty ||
      (selectedVariant?.title !== "Default Title" ? selectedVariant.title : "Default Title");

    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedFormatLabel,
      price: cartPrice,
      quantity: quantity,
      selectedOptions:
        usesMetafieldVariantOptions && selectedMetafieldNetQty
          ? [{ name: "Net Quantity", value: selectedMetafieldNetQty }]
          : selectedVariant.selectedOptions || [],
    });
    toast.success("Added to cart", { description: product.title, position: "top-center" });
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;

    const session = getStoredSession();
    if (!session?.user) {
       toast.info("Please sign in to proceed with direct checkout");
      const encodedId = encodeURIComponent(selectedVariant.id);
      const checkoutUnitPrice = hasValidMetafieldPrice
        ? selectedMetafieldPrice
        : Number(selectedVariant?.price?.amount || 0);
      const checkoutTitle =
        selectedMetafieldNetQty || (selectedVariant?.title !== "Default Title" ? selectedVariant?.title : "");
      navigate(
        `/login?redirect=buy_now&variantId=${encodedId}&quantity=${quantity}&unitPrice=${encodeURIComponent(
          checkoutUnitPrice.toString()
        )}&title=${encodeURIComponent(checkoutTitle ? `${product.title} - ${checkoutTitle}` : product.title)}`
      );
      return;
    }

    setIsAddressModalOpen(true);
  };

  const onAddressSelect = async (address: any) => {
    setIsBuyingNow(true);
    
    try {
      const checkoutUnitPrice = hasValidMetafieldPrice
        ? selectedMetafieldPrice
        : Number(selectedVariant?.price?.amount || 0);
      const checkoutTitle =
        selectedMetafieldNetQty || (selectedVariant?.title !== "Default Title" ? selectedVariant?.title : "");
      const lineItems = [{
        variantId: selectedVariant.id,
        quantity: quantity,
        unitPrice: checkoutUnitPrice,
        title: checkoutTitle ? `${product.title} - ${checkoutTitle}` : product.title,
      }];
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

            <div className="space-y-6 lg:mt-2">
              <div className="space-y-4">
                <m.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-[#5A7A5C]/5 rounded-full border border-[#5A7A5C]/10"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-[#5A7A5C]" />
                  <span className="text-[9px] uppercase tracking-[0.22em] text-[#5A7A5C] font-bold">{benefitLine}</span>
                </m.div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium text-[#1A2E35] leading-tight tracking-tight">
                  {product.title}
                </h1>

                <div className="flex items-center gap-4 whitespace-nowrap">
                  {safeReviews.length > 0 ? (
                    <div className="flex items-center gap-3">
                      <div className="flex gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`h-4 w-4 ${s <= Math.round(averageRating) ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#F2EDE4]'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-[#1A2E35] shrink-0 font-sans-clean">
                        {averageRating} <span className="text-[#1A2E35]/30">({safeReviews.length} Reviews)</span>
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-[#1A2E35]/40 tracking-tight uppercase italic">No reviews yet</span>
                  )}

                  {selectedVariant?.availableForSale && (
                    <>
                      <div className="h-3 w-px bg-[#F2EDE4] mx-1" />
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#5A7A5C]/10 text-[#5A7A5C] rounded-full">
                        <div className="h-1 w-1 rounded-full bg-[#5A7A5C] animate-pulse" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">In Stock</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-baseline gap-3 pt-2">
                  <span className="text-3xl font-sans-clean font-bold text-[#C5A059]">
                    {hasValidMetafieldPrice ? '₹' : (selectedVariant?.price.currencyCode === 'INR' ? '₹' : selectedVariant?.price.currencyCode)}{' '}
                    {hasValidMetafieldPrice ? selectedMetafieldPrice.toFixed(2) : parseFloat(selectedVariant?.price.amount || "0").toFixed(2)}
                  </span>
                  
                  {selectedVariant?.compareAtPrice && parseFloat(selectedVariant.compareAtPrice.amount) > parseFloat(selectedVariant.price.amount) && (
                    <span className="text-lg text-[#1A2E35]/30 line-through">
                      {selectedVariant.compareAtPrice.currencyCode === 'INR' ? '₹' : selectedVariant.compareAtPrice.currencyCode}{' '}
                      {parseFloat(selectedVariant.compareAtPrice.amount).toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-base text-[#1A2E35]/60 font-sans-clean leading-relaxed max-w-lg">
                   {subtitle}
                </p>
              </div>



              {(hasMultipleVariants || usesMetafieldVariantOptions) && (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 px-1">Size/Volume</label>
                  <div className="flex flex-wrap gap-2">
                    {hasMultipleVariants ? (
                      variants.map((v: any, i: number) => (
                        <button
                          key={v.node.id}
                          onClick={() => { setSelectedVariantIdx(i); setSelectedImage(0); }}
                          disabled={!v.node.availableForSale}
                          className={`px-5 py-2.5 rounded-xl text-[10px] font-bold transition-all border uppercase tracking-widest ${
                            i === selectedVariantIdx
                              ? 'bg-primary border-primary text-white shadow-lg'
                              : 'bg-white border-[#F2EDE4] text-[#1A2E35] hover:border-primary/30'
                          } ${!v.node.availableForSale ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          {v.node.title}
                        </button>
                      ))
                    ) : (
                      Array.from({ length: metafieldOptionsCount }).map((_, i) => {
                        const label = metafieldNetQuantities[i] || `Option ${i + 1}`;
                        return (
                          <button
                            key={`meta-option-${i}`}
                            onClick={() => setSelectedMetafieldOptionIdx(i)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-bold transition-all border uppercase tracking-widest ${
                              i === selectedMetafieldOptionIdx
                                ? 'bg-primary border-primary text-white shadow-lg'
                                : 'bg-white border-[#F2EDE4] text-[#1A2E35] hover:border-primary/30'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2 md:space-y-4 max-w-md">
                {!selectedVariant?.availableForSale ? (
                  <button
                    disabled
                    className="w-full bg-[#F2EDE4] text-[#1A2E35]/40 min-h-[50px] rounded-xl font-bold uppercase tracking-widest text-sm cursor-not-allowed flex items-center justify-center shadow-inner"
                  >
                    Sold Out
                  </button>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                      <div className="flex items-center bg-white border border-[#F2EDE4] rounded-xl px-2 min-h-[50px] md:w-32 justify-between shrink-0">
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
                        className="flex-1 border border-[#5A7A5C] text-[#5A7A5C] min-h-[50px] rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#5A7A5C] hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
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
                      className="w-full bg-[#1A2E35] text-white min-h-[50px] rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#1A2E35]/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-[#1A2E35]/20 flex items-center justify-center gap-2"
                    >
                      {isBuyingNow ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buy now directly"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-16 md:mt-24">
            <div className="flex items-center justify-center border-b border-[#F2EDE4] mb-12">
              <div className="flex gap-6 md:gap-12 flex-wrap justify-center">
                {(['description', 'additional', 'shipping', 'faq', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
                      activeTab === tab ? 'text-primary' : 'text-[#1A2E35]/30 hover:text-[#1A2E35]'
                    }`}
                  >
                    {tab === 'shipping' ? 'Shipping & Returns' : tab === 'faq' ? 'FAQ' : tab}
                    {activeTab === tab && (
                      <m.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" 
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'description' && (
                  <m.div
                    key="description"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-12"
                  >
                    <div 
                      className="text-sm md:text-base text-[#1A2E35]/70 font-sans-clean leading-relaxed prose prose-stone max-w-none 
                                 prose-p:mb-5 prose-p:leading-loose prose-strong:text-[#1A2E35] prose-strong:font-bold prose-headings:font-display prose-headings:text-[#1A2E35]"
                      dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
                    />

                    {/* Clinical Insight */}
                    <div className="bg-[#5A7A5C]/5 border border-[#5A7A5C]/10 rounded-3xl p-8 md:p-12">
                      <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <Stethoscope className="h-5 w-5 text-[#5A7A5C]" />
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5A7A5C]">Doctor's Insight</h2>
                          </div>
                          {getMetafieldValue('doctorsinsight') ? (
                            <p className="text-lg text-[#1A2E35]/80 font-sans-clean italic leading-relaxed">
                              "{getMetafieldValue('doctorsinsight')}"
                            </p>
                          ) : (
                            <p className="text-sm text-[#1A2E35]/40 italic">Expert clinical analysis for this formulation is being finalized.</p>
                          )}
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-[#5A7A5C]/10 shadow-sm">
                          <h3 className="text-xs font-bold text-[#1A2E35] uppercase tracking-widest mb-2">Need Personalized Advice?</h3>
                          <p className="text-xs text-[#1A2E35]/50 mb-6 font-sans-clean">Connect with our Ayurvedic practitioners for guidance on this formulation.</p>
                          <a 
                            href={`https://wa.me/919353436373?text=${encodeURIComponent(`Hello Salmara Team, I would like to consult a doctor regarding ${product.title}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest border-b border-primary pb-1 hover:gap-3 transition-all"
                          >
                            Consult via WhatsApp <ArrowRight className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </m.div>
                )}

                {activeTab === 'additional' && (
                  <m.div
                    key="additional"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-16"
                  >
                    {/* Benefits Section */}
                    {getMetafieldValue('benefits') && (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {getMetafieldValue('benefits').split(/[,\n]+/).map((benefit: string, i: number) => {
                          const [title, ...descParts] = benefit.split(/\s*[—–-]\s*/);
                          return (
                            <div key={i} className="space-y-3">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                                {getBenefitIcon(title)}
                              </div>
                              <h4 className="font-display font-bold text-base text-[#1A2E35] tracking-tight mb-2">{title}</h4>
                              {descParts.length > 0 && (
                                <p className="text-xs text-[#1A2E35]/60 font-sans-clean leading-loose italic">{descParts.join(' — ')}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Ingredients Section */}
                    {getMetafieldValue('ingredients') && (
                      <div className="pt-12 border-t border-[#F2EDE4]">
                        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#1A2E35]/30 mb-8">Key Ingredients</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                          {getMetafieldValue('ingredients').split(/\n+/).map((line: string, i: number) => {
                            const [name, ...descParts] = line.trim().split(/\s*[—–-]\s*/);
                            return (
                              <div key={i} className="flex gap-3 md:gap-4 items-start group">
                                <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/10 transition-colors">
                                  <Leaf className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm md:text-base font-bold text-[#1A2E35] uppercase tracking-wider mb-2 leading-snug">{name}</p>
                                  {descParts.length > 0 && <p className="text-[11px] md:text-sm text-[#1A2E35]/80 font-sans-clean leading-relaxed">{descParts.join(' — ')}</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Technical Specs Table */}
                    <div className="pt-12 border-t border-[#F2EDE4]">
                      <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#1A2E35]/30 mb-8">Product Specifications</h3>
                      <div className="overflow-hidden rounded-2xl border border-[#F2EDE4]">
                        <table className="w-full text-left bg-white">
                          <tbody>
                            {[
                              { label: "Shelf Life", value: getMetafieldValue('shelf') },
                              { label: "Net Quantity", value: selectedMetafieldNetQty || getMetafieldValue('netquantity') },
                              { label: "Formulation Type", value: getMetafieldValue('formulationtype') || product.productType },
                              { label: "Manufactured By", value: getMetafieldValue('manufacturedby') || product.vendor },
                            ].map((row, i) => (
                              <tr key={i} className={`border-b border-[#F2EDE4] last:border-none ${i % 2 === 0 ? 'bg-secondary/10' : ''}`}>
                                <th className="py-5 px-8 text-[10px] font-bold text-[#1A2E35] uppercase tracking-[0.2em] w-1/3 font-sans-clean">
                                  {row.label}
                                </th>
                                <td className="py-5 px-8 text-sm text-[#1A2E35]/70 font-sans-clean italic">
                                  {row.value || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </m.div>
                )}

                {activeTab === 'shipping' && (
                  <m.div
                    key="shipping"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8 max-w-3xl mx-auto"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-primary" />
                        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#1A2E35]">Delivery Information</h3>
                      </div>
                      
                      {deliveryReturnsRows.length > 0 ? (
                        <div className="grid gap-4">
                          {deliveryReturnsRows.map((row, idx) => (
                            <div key={idx} className="flex gap-4 p-5 bg-white border border-[#F2EDE4] rounded-2xl items-start group hover:border-primary/30 transition-colors">
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <p className="text-sm text-[#1A2E35]/60 font-sans-clean leading-relaxed">{row}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-secondary/20 rounded-2xl border border-dashed border-[#F2EDE4]">
                          <p className="text-xs text-[#1A2E35]/40 italic uppercase tracking-widest font-sans-clean">Shipping details for this formulation are being updated.</p>
                        </div>
                      )}
                    </div>

                  </m.div>
                )}

                {activeTab === 'faq' && (
                  <m.div
                    key="faq"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8 max-w-3xl mx-auto"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#1A2E35]/30 mb-2">Common Inquiries</h3>
                      <h2 className="text-2xl font-display font-medium text-[#1A2E35]">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-4">
                      {faqs.map((faq, i) => (
                        <div key={i} className="border border-[#F2EDE4] rounded-2xl overflow-hidden bg-white shadow-sm hover:border-primary/20 transition-all">
                          <button 
                            onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                            className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-[#FDFBF7] transition-all group"
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
                                <p className="text-[11px] md:text-sm text-[#1A2E35]/60 leading-relaxed font-sans-clean pt-4 border-t border-[#F2EDE4]">
                                  {faq.a}
                                </p>
                              </m.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </m.div>
                )}

                {activeTab === 'reviews' && (
                  <m.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-12"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                      <div className="text-center md:text-left">
                        <p className="text-4xl font-display font-bold text-[#1A2E35] mb-2">{averageRating}</p>
                        <div className="flex gap-1 text-[#C5A059] mb-2">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.round(averageRating) ? 'fill-current' : 'text-[#F2EDE4]'}`} />)}
                        </div>
                        <p className="text-[10px] font-bold text-[#1A2E35]/40 uppercase tracking-widest">Based on {safeReviews.length} verified reviews</p>
                      </div>
                      <div className="flex flex-col items-center md:items-end gap-3">
                        <button 
                          onClick={() => setReviewModalOpen(true)}
                          disabled={!hasPurchased || isCheckingEligibility}
                          className={`px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2 ${
                            (!hasPurchased || isCheckingEligibility)
                              ? 'bg-[#1A2E35]/10 text-[#1A2E35]/40 cursor-not-allowed shadow-none'
                              : 'bg-[#1A2E35] text-white hover:bg-primary'
                          }`}
                        >
                          {isCheckingEligibility ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}
                          {isCheckingEligibility ? 'Checking eligibility...' : 'Write a Review'}
                        </button>
                        {!hasPurchased && !isCheckingEligibility && (
                          <p className="text-[9px] font-bold text-[#C5A059] uppercase tracking-wider italic">
                            Only verified buyers can leave a review
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {safeReviews.map((review, i) => (
                        <div key={review.id} className="p-8 bg-white rounded-3xl border border-[#F2EDE4] space-y-4">
                          <div className="flex justify-between">
                            <div className="flex gap-1 text-[#C5A059]">
                              {[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-current' : 'text-[#F2EDE4]'}`} />)}
                            </div>
                            <span className="text-[8px] font-bold text-[#5A7A5C] uppercase tracking-widest">Verified Buyer</span>
                          </div>
                          <p className="text-sm text-[#1A2E35]/70 italic leading-relaxed font-sans-clean">"{review.review_text}"</p>
                          <div className="pt-4 border-t border-[#F2EDE4]/50 flex items-center justify-between">
                            <span className="text-xs font-bold text-[#1A2E35] uppercase">{review.customer_name || "Verified Customer"}</span>
                            <span className="text-[9px] text-[#1A2E35]/30">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                      {safeReviews.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-secondary/20 rounded-3xl border border-dashed border-[#F2EDE4]">
                          <p className="text-xs text-[#1A2E35]/40 uppercase tracking-[0.2em] italic">No reviews yet. Be the first to share your journey.</p>
                        </div>
                      )}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Related Products Section */}
          <section className="mt-24 pt-24 border-t border-[#F2EDE4]">
            <div className="text-center mb-12">
              <p className="text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-3">You May Also Like</p>
              <h2 className="text-3xl md:text-4xl font-display font-medium text-[#1A2E35]">Explore Related Products</h2>
            </div>
            
            {isLoadingRelatedProducts ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-[#5A7A5C]" />
              </div>
            ) : relatedProducts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {relatedProducts.map((rp: any) => {
                  const variant = rp?.variants?.edges?.[0]?.node;
                  const image = rp?.images?.edges?.[0]?.node;
                  const rpPriceMeta = (rp?.metafields?.edges || []).find(
                    (edge: any) =>
                      edge?.node?.namespace === "custom" &&
                      ["price", "mrp", "selling_price"].includes(String(edge?.node?.key || "").toLowerCase())
                  )?.node?.value as string | undefined;
                  const rpMetaFirstPrice = rpPriceMeta
                    ? Number(
                        (rpPriceMeta
                          .split("/")
                          .map((part: string) => part.trim())
                          .find(Boolean) || "").replace(/[^\d.]/g, "")
                      )
                    : NaN;
                  const rpDisplayPrice = Number.isFinite(rpMetaFirstPrice) && rpMetaFirstPrice > 0
                    ? rpMetaFirstPrice
                    : Number(variant?.price?.amount || 0);
                  const rpDisplayCurrency = Number.isFinite(rpMetaFirstPrice) && rpMetaFirstPrice > 0
                    ? "INR"
                    : (variant?.price?.currencyCode || "INR");
                  return (
                    <Link
                      key={rp.id}
                      to={`/product/${rp.handle}`}
                      className="group bg-white rounded-3xl border border-[#F2EDE4] overflow-hidden shadow-sm hover:shadow-lg hover:shadow-[#5A7A5C]/10 transition-all"
                    >
                      <div className="aspect-square bg-[#FDFBF7] overflow-hidden">
                        {image?.url ? (
                          <Image
                            src={image.url}
                            alt={image.altText || rp.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Leaf className="h-10 w-10 text-[#1A2E35]/15" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 space-y-2">
                        <h3 className="text-lg font-display font-medium text-[#1A2E35] group-hover:text-[#5A7A5C] transition-colors line-clamp-1">
                          {rp.title}
                        </h3>
                        {rpDisplayPrice > 0 && (
                          <p className="text-sm font-bold text-[#C5A059]">
                            {rpDisplayCurrency === "INR" ? "₹" : rpDisplayCurrency}{" "}
                            {rpDisplayPrice.toFixed(2)}
                          </p>
                        )}
                        <p className="text-xs text-[#1A2E35]/50 line-clamp-2 font-sans-clean">
                          {rp.description || "Explore this formulation for your wellness goals."}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-[#1A2E35]/40 italic">Related products will appear here shortly.</p>
              </div>
            )}
          </section>

          <section className="py-12 border-t border-[#F2EDE4]">
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

        {/* Benefits Summary Footer */}
        <section className="bg-secondary/30 border-y border-[#F2EDE4] py-12 mt-24">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-3">
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-[#F2EDE4]">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-sm font-bold text-[#1A2E35] uppercase tracking-widest">Free Shipping</h4>
                <p className="text-[11px] text-[#1A2E35]/40 uppercase tracking-widest">On orders above ₹999</p>
              </div>
              <div className="space-y-3">
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-[#F2EDE4]">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-sm font-bold text-[#1A2E35] uppercase tracking-widest">Secure Payments</h4>
                <p className="text-[11px] text-[#1A2E35]/40 uppercase tracking-widest">100% Secure Gateway</p>
              </div>
              <div className="space-y-3">
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-[#F2EDE4]">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-sm font-bold text-[#1A2E35] uppercase tracking-widest">Expert Guidance</h4>
                <p className="text-[11px] text-[#1A2E35]/40 uppercase tracking-widest">Consult via WhatsApp</p>
              </div>
            </div>
          </div>
        </section>
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
    </div>
  );
};

export default ProductDetail;
