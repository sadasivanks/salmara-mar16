import { useState, useEffect, useRef, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { m, AnimatePresence, useInView } from "framer-motion";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ShoppingCart, 
  ShieldCheck, 
  CheckCircle2, 
  Package, 
  ArrowRight,
  Leaf,
  Loader2,
  X,
  Check,
  Heart,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  type ShopifyProduct, 
  fetchProductsViaAdmin, 
  fetchCollectionsViaAdmin,
  createHybridCheckout, 
  getStoredSession,
  type Address,
  fetchBulkReviews,
  type ShopifyCollection
} from "@/lib/shopifyAdmin";
import { throttle } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";

import { useWishlistStore } from "@/stores/wishlistStore";
import { toast } from "sonner";
import { lazy, Suspense } from "react";
const AddressSelectionModal = lazy(() => import("@/components/AddressSelectionModal"));
import { useNavigate, useSearchParams } from "react-router-dom";
import { Image } from "@/components/ui/Image";
import SEO from "@/components/SEO";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";


const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "Under ₹500", value: "0-500" },
  { label: "₹500 - ₹1,000", value: "500-1000" },
  { label: "₹1,000 - ₹2,000", value: "1000-2000" },
  { label: "Over ₹2,000", value: "2000-plus" },
];

const sortByLabels: Record<string, string> = {
  "Bestselling": "Bestselling",
  "Price: Low to High": "Price: Low to High",
  "Price: High to Low": "Price: High to Low",
  "Newest First": "Newest First",
  "Doctor Recommended": "Doctor Recommended"
};

const getProductDisplayPrice = (product: ShopifyProduct) => {
  const metafields = (product.node as any)?.metafields?.edges || [];
  const priceMeta = metafields.find(
    (edge: any) =>
      edge?.node?.namespace === "custom" &&
      ["price", "mrp", "selling_price"].includes(String(edge?.node?.key || "").toLowerCase())
  )?.node?.value as string | undefined;

  if (priceMeta) {
    const firstPart = priceMeta
      .split("/")
      .map((part) => part.trim())
      .find(Boolean);
    const parsed = Number((firstPart || "").replace(/[^\d.]/g, ""));
    if (Number.isFinite(parsed) && parsed > 0) {
      return { amount: parsed, currency: "INR", fromMetafield: true };
    }
  }

  const variant = product.node.variants.edges[0]?.node;
  const parsedVariant = Number(variant?.price?.amount || 0);
  return {
    amount: Number.isFinite(parsedVariant) ? parsedVariant : 0,
    currency: variant?.price?.currencyCode || "INR",
    fromMetafield: false,
  };
};

const ShopPage = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedProductForCheckout, setSelectedProductForCheckout] = useState<ShopifyProduct | null>(null);
  const [reviewsMap, setReviewsMap] = useState<Record<string, any[]>>({});

  const navigate = useNavigate();

  // Filter & Sort State
  const [availableCollections, setAvailableCollections] = useState<ShopifyCollection[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState("Bestselling");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { addItem, isLoading: isCartStoreLoading } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();

  const gridRef = useRef(null);
  const isGridInView = useInView(gridRef, { once: true, margin: "-100px" });

  useEffect(() => {
    setLoading(true);
    
    // Fetch products and collections in parallel
    Promise.all([
      fetchProductsViaAdmin(50),
      fetchCollectionsViaAdmin(20)
    ])
      .then(async ([fetchedProducts, fetchedCollections]) => {
        setProducts(fetchedProducts);
        setAvailableCollections(fetchedCollections);
        
        // Fetch reviews in bulk
        const ids = fetchedProducts.map((p: any) => p.node.id);
        const reviewsData = await fetchBulkReviews(ids);
        const map: Record<string, any[]> = {};
        reviewsData.forEach((item: any) => {
          map[item.id] = item.reviews;
        });
        setReviewsMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Handle search parameter from URL
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }

    // Scroll listener for sticky header 'dull' effect
    const handleScroll = throttle(() => {
      setIsScrolled(window.scrollY > 120);
    }, 50);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Derived Categories from Shopify Collections
  const categories = useMemo(() => {
    const colls = availableCollections.map(c => c.title);
    return ["All Categories", ...colls];
  }, [availableCollections]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Category Filter (Check if product belongs to the selected Shopify Collection)
      if (selectedCategory !== "All Categories") {
        const belongsToCollection = p.node.collections?.edges.some(
          edge => edge.node.title === selectedCategory
        );
        if (!belongsToCollection) return false;
      }

      // 3. Price Filter
      const price = getProductDisplayPrice(p).amount;
      if (selectedPriceRange !== "all") {
        const [min, max] = selectedPriceRange.split("-");
        if (max === "plus") {
          if (price < parseFloat(min)) return false;
        } else {
          if (price < parseFloat(min) || price > parseFloat(max)) return false;
        }
      }

      // 4. Availability Filter
      if (inStockOnly && !p.node.variants.edges.some(v => {
        // Since we mapped Admin API inventoryQuantity to availableForSale in shopifyAdmin.ts
        // we can simply check availableForSale or check inventoryQuantity directly if provided
        if (typeof (v.node as any).inventoryQuantity === 'number') {
          return (v.node as any).inventoryQuantity > 0;
        }
        return v.node.availableForSale;
      })) {
        return false;
      }

      // 5. Search Query
      if (searchQuery && !p.node.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sorting Logic
      const priceA = getProductDisplayPrice(a).amount;
      const priceB = getProductDisplayPrice(b).amount;

      if (sortBy === "Price: Low to High") return priceA - priceB;
      if (sortBy === "Price: High to Low") return priceB - priceA;
      if (sortBy === "Newest First") return b.node.id.localeCompare(a.node.id); // Simple ID fallback for mock "newest"
      if (sortBy === "Doctor Recommended") {
        const isDocA = a.node.tags?.includes("Doctor Recommended") || a.node.handle === 'brahmi-hair-oil';
        const isDocB = b.node.tags?.includes("Doctor Recommended") || b.node.handle === 'brahmi-hair-oil';
        if (isDocA && !isDocB) return -1;
        if (!isDocA && isDocB) return 1;
        return 0;
      }
      return 0; // Default Bestselling
    });
  }, [products, selectedCategory, selectedPriceRange, inStockOnly, sortBy, searchQuery]);

  const handleAddToCart = async (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    const displayPrice = getProductDisplayPrice(product);

    setAddingId(product.node.id);
    try {
      await addItem({
        product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: {
          amount: displayPrice.amount.toFixed(2),
          currencyCode: displayPrice.currency,
        },
        quantity: 1,
        selectedOptions: variant.selectedOptions || [],
      });
      toast.success("Added to cart", { description: product.node.title, position: "top-center" });
    } finally {
      setAddingId(null);
    }
  };

  const handleBuyNow = async (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) {
      console.error("No variant found for product:", product.node.title);
      toast.error("Product unavailable", { description: "This product has no available variants." });
      return;
    }

    const session = getStoredSession();
    if (!session?.user) {
      toast.info("Please sign in to proceed with direct checkout");
      const displayPrice = getProductDisplayPrice(product);
      const checkoutTitle =
        variant.title && variant.title !== "Default Title"
          ? `${product.node.title} - ${variant.title}`
          : product.node.title;
      navigate(
        `/login?redirect=buy_now&variantId=${encodeURIComponent(variant.id)}&quantity=1&unitPrice=${encodeURIComponent(
          displayPrice.amount.toString()
        )}&title=${encodeURIComponent(checkoutTitle)}`
      );
      return;
    }

    setSelectedProductForCheckout(product);
    setIsAddressModalOpen(true);
  };

  const onAddressSelect = async (address: Address | null) => {
    if (!selectedProductForCheckout) return;

    const variant = selectedProductForCheckout.node.variants.edges[0]?.node;
    if (!variant) return;

    setBuyingId(selectedProductForCheckout.node.id); // Also set buyingId for card loader

    try {
      const session = getStoredSession();
      const displayPrice = getProductDisplayPrice(selectedProductForCheckout);
      const lineItems = [{
        variantId: variant.id,
        quantity: 1,
        unitPrice: displayPrice.amount,
        title:
          variant.title && variant.title !== "Default Title"
            ? `${selectedProductForCheckout.node.title} - ${variant.title}`
            : selectedProductForCheckout.node.title,
      }];
      const result = await createHybridCheckout(lineItems, session?.user?.id, session?.user?.email, address);

      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.error("Checkout failed. Please try again.");
        setBuyingId(null);
        setIsAddressModalOpen(false); // Close modal on error
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
      setBuyingId(null);
      setIsAddressModalOpen(false); // Close modal on error
    }
  };

  const clearFilters = () => {
    setSelectedCategory("All Categories");
    setSelectedPriceRange("all");
    setInStockOnly(false);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-secondary">
      <SEO
        title="Shop Ayurvedic Formulations | Natural Wellness Remedies"
        description="Browse our curated collection of Ayurvedic remedies. From joint mobility to liver care, find traditional formulations backed by clinical evidence."
      />
      <Header />

      <main className="w-full">
    


        {/* 3) Filter & Sort Bar */}
        <section 
          id="product-grid" 
          className="relative z-30 transition-all duration-500 border-y border-[#F2EDE4] py-1.5 md:py-2 bg-white"
        >
          <div className="container px-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
              
              {/* Top Row: Search & Mobile Toggle */}
              <div className="flex items-center gap-2 w-full lg:max-w-xs transition-all">
                <div className="relative group flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1A2E35]/60 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="SEARCH PRODUCTS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-secondary border border-[#F2EDE4] rounded-xl py-1.5 pl-11 pr-4 text-[10px] sm:text-xs tracking-widest text-[#1A2E35] placeholder:text-[#1A2E35]/40 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-all font-sans-clean"
                  />
                </div>

                {/* Mobile Filter Toggle */}
                  <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className={cn(
                    "lg:hidden flex items-center gap-2 px-4 py-1.5 rounded-xl border transition-all",
                    showMobileFilters || selectedCategory !== "All Categories" || selectedPriceRange !== "all" || inStockOnly
                    ? "bg-primary border-primary text-white"
                    : "bg-white border-[#F2EDE4] text-[#1A2E35]"
                  )}
                >
                  <Filter className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Filters</span>
                </button>
              </div>

              {/* Selective Filters Content */}
              <AnimatePresence>
                {(showMobileFilters || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 w-full lg:w-auto overflow-hidden",
                      !showMobileFilters && "hidden lg:flex"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-4 lg:gap-8 py-2 lg:py-0 border-t lg:border-none border-[#F2EDE4]/50">
                      {/* Category Filter */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="group flex items-center gap-2 outline-none py-1 px-3 rounded-lg hover:bg-white border border-transparent hover:border-[#F2EDE4] hover:shadow-sm transition-all text-[#1A2E35]">
                          <span className="text-[11px] font-bold tracking-[0.2em] uppercase">Category</span>
                          <ChevronDown className="h-4 w-4 text-[#1A2E35]/40 group-hover:text-primary transition-colors" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64 rounded-2xl border-[#F2EDE4] shadow-2xl p-2 z-[100]">
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 px-4 py-3">Select Category</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <div className="max-h-[300px] overflow-y-auto">
                            {categories.map((cat) => (
                              <DropdownMenuItem
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`rounded-xl px-4 py-3 cursor-pointer text-xs font-display transition-colors ${
                                  selectedCategory === cat ? 'text-primary font-bold bg-primary/5' : 'text-[#1A2E35] hover:bg-muted'
                                }`}
                              >
                                {cat}
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Price Filter */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="group flex items-center gap-2 outline-none py-1 px-3 rounded-lg hover:bg-white border border-transparent hover:border-[#F2EDE4] hover:shadow-sm transition-all text-[#1A2E35]">
                          <span className="text-[11px] font-bold tracking-[0.2em] uppercase">Price</span>
                          <ChevronDown className="h-4 w-4 text-[#1A2E35]/40 group-hover:text-primary transition-colors" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 rounded-2xl border-[#F2EDE4] shadow-2xl p-2 z-[100]">
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 px-4 py-3">Price Range</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <div className="space-y-1">
                            {priceRanges.map((range) => (
                              <DropdownMenuItem
                                key={range.value}
                                onClick={() => setSelectedPriceRange(range.value)}
                                className={`rounded-xl px-4 py-3 cursor-pointer text-xs font-display transition-colors ${
                                  selectedPriceRange === range.value ? 'text-primary font-bold bg-primary/5' : 'text-[#1A2E35] hover:bg-muted'
                                }`}
                              >
                                {range.label}
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Availability Toggle */}
                      <div className="flex items-center gap-3 py-1 px-3 rounded-lg hover:bg-white border border-transparent hover:border-[#F2EDE4] hover:shadow-sm transition-all cursor-pointer group" onClick={() => setInStockOnly(!inStockOnly)}>
                        <span className="text-[11px] font-bold tracking-[0.2em] text-[#1A2E35] uppercase select-none">In Stock</span>
                        <Switch
                          checked={inStockOnly}
                          onCheckedChange={setInStockOnly}
                          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-[#F2EDE4]"
                        />
                      </div>
                    </div>

                    {/* Right: Sort By */}
                    <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto border-t lg:border-none pt-4 lg:pt-0">
                      <span className="text-[10px] lg:hidden uppercase tracking-[0.2em] text-[#1A2E35]/40 font-bold">Sort By</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="group flex items-center gap-2 outline-none py-1 px-3 rounded-lg hover:bg-white border border-transparent hover:border-[#F2EDE4] hover:shadow-sm transition-all text-[#1A2E35]">
                          <span className="text-[11px] font-bold tracking-[0.2em] uppercase">{sortByLabels[sortBy] || sortBy}</span>
                          <ChevronDown className="h-4 w-4 text-[#1A2E35]/40 group-hover:text-primary transition-colors" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 rounded-2xl border-[#F2EDE4] shadow-2xl p-2 z-[100]">
                          <div className="space-y-1">
                            {["Bestselling", "Price: Low to High", "Price: High to Low", "Newest First", "Doctor Recommended"].map((s) => (
                              <DropdownMenuItem
                                key={s}
                                onClick={() => setSortBy(s)}
                                className={`rounded-xl px-4 py-3 cursor-pointer text-xs font-display transition-colors ${
                                  sortBy === s ? 'text-primary font-bold bg-primary/5' : 'text-[#1A2E35] hover:bg-muted'
                                }`}
                              >
                                {s}
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status Bar - Only show when filters are active */}
            {(selectedCategory !== "All Categories" || selectedPriceRange !== "all" || inStockOnly || searchQuery) && (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-4 py-1.5 px-4 bg-white/50 border border-[#F2EDE4] rounded-xl">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]">
                    Showing {filteredProducts.length} formulations
                  </p>
                  {/* Active Chips */}
                  {selectedCategory !== "All Categories" && (
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                      {selectedCategory} <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("All Categories")} />
                    </div>
                  )}
                </div>

                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                >
                  Reset All Filters <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 4) Product Grid */}
        <section className="py-6 md:py-8 lg:py-10 xl:py-12 bg-secondary" ref={gridRef}>
          <div className="container px-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2E35]/40">Harvesting Pure Ingredients...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-32 border-2 border-dashed border-[#F2EDE4] rounded-[48px] bg-white">
                <Leaf className="h-12 w-12 text-[#1A2E35]/10 mx-auto mb-6" />
                <h3 className="text-xl font-display font-medium text-[#1A2E35] mb-2">No products found.</h3>
                <p className="text-[#1A2E35]/40 text-sm font-sans-clean max-w-sm mx-auto mb-8">No products found for this category. Try adjusting your filters.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <button onClick={clearFilters} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline underline-offset-4">Clear filters</button>
                  <Link to="/shop" onClick={clearFilters} className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/60 hover:text-[#1A2E35]">Shop all products</Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product, i) => {
                  const variant = product.node.variants.edges[0]?.node;
                  const image = product.node.images.edges[0]?.node;
                  const displayPrice = getProductDisplayPrice(product);
                  
                  return (
                    <m.div
                      key={product.node.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={isGridInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group relative"
                    >
                      <Link to={`/product/${product.node.handle}`}>
                        <div className="relative aspect-square bg-gradient-to-br from-secondary to-sand-warm flex items-center justify-center overflow-hidden">
                          {image ? (
                            <Image 
                              src={image.url} 
                              alt={image.altText || product.node.title} 
                              fill={true} 
                              className="object-cover transition-transform duration-500 group-hover:scale-110" 
                            />
                          ) : (
                            <Leaf className="h-16 w-16 text-primary/20" />
                          )}
                        </div>
                      </Link>

                      {/* Wishlist Button */}
                      <button 
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (variant) await toggleItem(product, variant.id);
                        }}
                        aria-label={variant && isInWishlist(variant.id) ? `Remove ${product.node.title} from wishlist` : `Add ${product.node.title} to wishlist`}
                        className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md border transition-all z-20 shadow-sm ${
                          variant && isInWishlist(variant.id) 
                            ? 'bg-red-500 border-red-500 text-white' 
                            : 'bg-white/90 border-border text-foreground hover:bg-white'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${variant && isInWishlist(variant.id) ? 'fill-white' : ''}`} />
                      </button>

                      <div className="p-5">
                        <Link to={`/product/${product.node.handle}`}>
                          <h3 className="font-display font-semibold text-foreground text-lg mb-1 hover:text-primary transition-colors">
                            {product.node.title}
                          </h3>
                        </Link>
                        
                        {/* Rating Display */}
                        <div className="flex items-center gap-1.5 mb-3">
                          {(() => {
                            const productReviews = reviewsMap[product.node.id] || [];
                            const hasReviews = productReviews.length > 0;
                            
                            const avgRating = hasReviews 
                              ? Number((productReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / productReviews.length).toFixed(1))
                              : 0;
                            const count = hasReviews ? productReviews.length : 0;

                            return (
                              <>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${i < Math.round(avgRating) ? 'fill-accent text-accent' : 'text-[#F2EDE4]'}`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] font-bold text-[#1A2E35]/40 tracking-tighter">
                                  {count > 0 ? `${avgRating} (${count} reviews)` : 'No reviews yet'}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                        <div className="mb-3">
                          <p className="text-muted-foreground font-body text-sm line-clamp-2">
                            {product.node.description}
                          </p>
                        </div>

                        {displayPrice.amount > 0 && (
                          <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-xl font-sans-clean font-bold text-foreground">
                              {displayPrice.currency === 'INR' ? '₹' : displayPrice.currency} {displayPrice.amount.toFixed(2)}
                            </span>
                            {!displayPrice.fromMetafield && variant.compareAtPrice && parseFloat(variant.compareAtPrice.amount) > displayPrice.amount && (
                              <span className="text-sm text-muted-foreground/50 line-through">
                                {variant.compareAtPrice.currencyCode === 'INR' ? '₹' : variant.compareAtPrice.currencyCode} {parseFloat(variant.compareAtPrice.amount).toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}
                                    {!variant?.availableForSale ? (
                          <button
                            disabled
                            className="w-full bg-[#F2EDE4] text-[#1A2E35]/40 py-2.5 rounded-lg font-sans-clean text-xs font-semibold flex items-center justify-center cursor-not-allowed"
                          >
                            Sold Out
                          </button>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={addingId === product.node.id || buyingId === product.node.id}
                                className="flex-1 border border-primary/20 text-primary py-2.5 rounded-lg font-sans-clean text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:bg-primary/5 active:scale-[0.98] disabled:opacity-50 group/cart"
                              >
                                {addingId === product.node.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <><ShoppingCart className="h-3.5 w-3.5 group-hover/cart:scale-110 transition-transform" /> Add to Cart</>
                                )}
                              </button>
                              <Link
                                to={`/product/${product.node.handle}`}
                                aria-label={`View details for ${product.node.title}`}
                                className="px-4 py-2.5 rounded-lg border border-[#F2EDE4] text-[#1A2E35]/60 font-sans-clean text-xs font-semibold hover:border-[#1A2E35] hover:text-[#1A2E35] transition-all flex items-center justify-center whitespace-nowrap"
                              >
                                Details
                              </Link>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleBuyNow(product);
                              }}
                              disabled={buyingId === product.node.id}
                              className="w-full bg-[#1A2E35] text-white py-3 rounded-lg font-sans-clean text-[10px] font-bold uppercase tracking-wider hover:bg-[#1A2E35]/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#1A2E35]/10"
                            >
                              {buyingId === product.node.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                              {buyingId === product.node.id ? "Redirecting..." : "Buy Now Direct"}
                            </button>
                          </div>
                        )}
                      </div>
                    </m.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 5) Shop Trust Strip */}
        <section className="py-6 md:py-8 lg:py-10 xl:py-12 border-y border-[#F2EDE4] bg-secondary">
          <div className="container px-4">
            <div className="grid md:grid-cols-3 gap-12 lg:gap-16 max-w-6xl mx-auto">
              {/* GMP Certified */}
              <div className="text-center space-y-5 group">
                <div className="w-16 h-16 bg-white border border-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary shadow-sm group-hover:shadow-md transition-shadow">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1A2E35]">GMP Certified</h3>
                  <p className="text-xs text-[#1A2E35]/70 leading-relaxed font-sans-clean max-w-[280px] mx-auto">Manufactured in clinical-grade environments under strict Ayurvedic manufacturing standards.</p>
                </div>
              </div>
              
              {/* Batch Integrity */}
              <div className="text-center space-y-5 group">
                <div className="w-16 h-16 bg-white border border-accent/10 rounded-2xl flex items-center justify-center mx-auto text-accent shadow-sm group-hover:shadow-md transition-shadow">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1A2E35]">Batch Integrity</h3>
                  <p className="text-xs text-[#1A2E35]/70 leading-relaxed font-sans-clean max-w-[280px] mx-auto">Every batch undergoes consistency checks for purity, potency, and standardized extraction.</p>
                </div>
              </div>
              
              {/* Full Transparency */}
              <div className="text-center space-y-5 group">
                <div className="w-16 h-16 bg-white border border-blue-500/10 rounded-2xl flex items-center justify-center mx-auto text-blue-500 shadow-sm group-hover:shadow-md transition-shadow">
                  <Package className="h-7 w-7" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1A2E35]">Full Transparency</h3>
                  <p className="text-xs text-[#1A2E35]/70 leading-relaxed font-sans-clean max-w-[280px] mx-auto">Clearly labeled botanical names and concentration ratios for zero-guesswork wellness.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Address Selection Modal */}
      {selectedProductForCheckout && (
        <Suspense fallback={null}>
          <AddressSelectionModal
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            customerId={getStoredSession()?.user?.id || ""}
            onSelect={onAddressSelect}
            isProcessing={!!buyingId}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ShopPage;
