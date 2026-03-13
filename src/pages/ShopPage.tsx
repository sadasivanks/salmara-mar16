import { useState, useEffect, useRef, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Star, 
  Heart, 
  ShoppingCart, 
  ShieldCheck, 
  CheckCircle2, 
  Package, 
  ArrowRight,
  Leaf,
  Loader2,
  X,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
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

const concerns = [
  { id: "pain", title: "Pain & Mobility", desc: "For muscle relief, joints, and inflammation support." },
  { id: "women", title: "Women’s Wellness", desc: "Hormonal balance and cycle-specific nutritional care." },
  { id: "kidney", title: "Kidney & Urinary Health", desc: "Natural support for stone clearance and urinary tract health." },
  { id: "liver", title: "Liver & Detox", desc: "Hepatic support and metabolic waste elimination." },
  { id: "gut", title: "Gut Health & Digestion", desc: "Restoring digestive fire and smooth bowel movements." },
  { id: "immunity", title: "Immunity (Tulsi Range)", desc: "Seasonal protection and respiratory shield formulations." },
];

const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "Under ₹500", value: "0-500" },
  { label: "₹500 - ₹1,000", value: "500-1000" },
  { label: "₹1,000 - ₹2,000", value: "1000-2000" },
  { label: "Over ₹2,000", value: "2000-plus" },
];

const ShopPage = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  
  // Filter & Sort State
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState("Bestselling");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { addItem, isLoading: isCartStoreLoading } = useCartStore();
  
  const gridRef = useRef(null);
  const isGridInView = useInView(gridRef, { once: true, margin: "-100px" });

  useEffect(() => {
    setLoading(true);
    fetchProducts(50) // Fetch more for better filtering
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Derived Categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.node.productType).filter(Boolean));
    return ["All Categories", ...Array.from(cats)];
  }, [products]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Concern Filter (Search in description or tags)
      if (selectedConcern) {
        const query = selectedConcern.toLowerCase();
        const matchesConcern = p.node.description.toLowerCase().includes(query) || 
                               p.node.title.toLowerCase().includes(query) ||
                               p.node.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesConcern) return false;
      }
      
      // 2. Category Filter
      if (selectedCategory !== "All Categories" && p.node.productType !== selectedCategory) {
        return false;
      }
      
      // 3. Price Filter
      const price = parseFloat(p.node.variants.edges[0]?.node?.price.amount || "0");
      if (selectedPriceRange !== "all") {
        const [min, max] = selectedPriceRange.split("-");
        if (max === "plus") {
          if (price < parseFloat(min)) return false;
        } else {
          if (price < parseFloat(min) || price > parseFloat(max)) return false;
        }
      }
      
      // 4. Availability Filter
      if (inStockOnly && !p.node.variants.edges.some(v => v.node.availableForSale)) {
        return false;
      }
      
      // 5. Search Query
      if (searchQuery && !p.node.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sorting Logic
      const priceA = parseFloat(a.node.variants.edges[0]?.node?.price.amount || "0");
      const priceB = parseFloat(b.node.variants.edges[0]?.node?.price.amount || "0");
      
      if (sortBy === "Price: Low to High") return priceA - priceB;
      if (sortBy === "Price: High to Low") return priceB - priceA;
      if (sortBy === "Newest First") return b.node.id.localeCompare(a.node.id); // Simple ID fallback for mock "newest"
      return 0; // Default Bestselling
    });
  }, [products, selectedConcern, selectedCategory, selectedPriceRange, inStockOnly, sortBy, searchQuery]);

  const handleAddToCart = async (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    
    setAddingId(product.node.id);
    try {
      await addItem({
        product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions || [],
      });
      toast.success("Added to cart", { description: product.node.title, position: "top-center" });
    } finally {
      setAddingId(null);
    }
  };

  const clearFilters = () => {
    setSelectedConcern(null);
    setSelectedCategory("All Categories");
    setSelectedPriceRange("all");
    setInStockOnly(false);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main>
        {/* 1) Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center bg-[#1A2E35] overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <img 
              src="https://images.unsplash.com/photo-1615485290382-441e4d019cb5?q=80&w=2070&auto=format&fit=crop" 
              alt="Ayurvedic flatlay" 
              className="w-full h-full object-cover grayscale-[30%]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E35] via-transparent to-transparent" />
          
          <div className="container px-4 relative z-10 text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-display font-medium text-white mb-6">
                Explore Our Certified Ayurvedic Range
              </h1>
              <p className="text-white/80 text-lg md:text-xl font-body leading-relaxed mb-10 max-w-2xl mx-auto">
                From muscle relief oils to immunity blends, each Salmara formulation is crafted under GMP-certified conditions and tested with quality standards for consistent results.
              </p>
              <button 
                onClick={() => {
                  document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white text-[#1A2E35] px-12 py-5 rounded-2xl font-bold tracking-widest uppercase text-xs hover:bg-[#F2EDE4] transition-all shadow-2xl"
              >
                Shop All Products
              </button>
            </motion.div>
          </div>
        </section>

        {/* 2) Shop by Concern */}
        <section className="py-24 bg-[#FDFBF7]">
          <div className="container px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-display font-medium text-[#1A2E35] mb-4">Find What Fits Your Wellness</h2>
              <p className="text-[#1A2E35]/40 text-sm font-sans-clean">Selecting a concern will tailor the formulations shown in the grid below.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {concerns.map((concern) => (
                <button
                  key={concern.id}
                  onClick={() => setSelectedConcern(selectedConcern === concern.id ? null : concern.id)}
                  className={`p-10 rounded-3xl border text-left transition-all group ${
                    selectedConcern === concern.id 
                    ? 'bg-[#5A7A5C] border-[#5A7A5C] shadow-2xl shadow-[#5A7A5C]/20 text-white' 
                    : 'bg-white border-[#F2EDE4] hover:border-[#5A7A5C] hover:shadow-xl'
                  }`}
                >
                  <h3 className={`text-xl font-display font-medium mb-3 transition-colors ${selectedConcern === concern.id ? 'text-white' : 'text-[#1A2E35]'}`}>
                    {concern.title}
                  </h3>
                  <p className={`text-sm font-sans-clean leading-relaxed transition-colors ${selectedConcern === concern.id ? 'text-white/80' : 'text-[#1A2E35]/50'}`}>
                    {concern.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3) Filters & Sorting */}
        <section id="product-grid" className="py-12 border-t border-[#F2EDE4] bg-[#FDFBF7] sticky top-[64px] lg:top-[80px] z-40">
          <div className="container px-4">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4 lg:gap-8">
                {/* Search Expansion Logic */}
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-[#1A2E35]/30 group-focus-within:text-[#5A7A5C] transition-colors" />
                  </div>
                  <input 
                    type="text"
                    placeholder="Search Formulations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border border-[#F2EDE4] rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold uppercase tracking-widest text-[#1A2E35] focus:outline-none focus:border-[#5A7A5C] transition-all w-full lg:w-64 placeholder:text-[#1A2E35]/20"
                  />
                </div>

                <div className="flex items-center gap-3 lg:gap-6">
                  {/* Category Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35] hover:text-[#5A7A5C] transition-colors focus:outline-none">
                      Category <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white rounded-2xl border-[#F2EDE4] shadow-2xl p-2 z-[100]">
                      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 px-4 py-3">Select Category</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                        {categories.map((cat) => (
                          <DropdownMenuRadioItem 
                            key={cat} 
                            value={cat}
                            className="rounded-xl px-4 py-3 cursor-pointer text-xs font-display focus:bg-[#F2EDE4]/30"
                          >
                            {cat}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Price Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35] hover:text-[#5A7A5C] transition-colors focus:outline-none">
                      Price <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white rounded-2xl border-[#F2EDE4] shadow-2xl p-2 z-[100]">
                      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 px-4 py-3">Price Range</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                        {priceRanges.map((range) => (
                          <DropdownMenuRadioItem 
                            key={range.value} 
                            value={range.value}
                            className="rounded-xl px-4 py-3 cursor-pointer text-xs font-display focus:bg-[#F2EDE4]/30"
                          >
                            {range.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Availability Filter */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setInStockOnly(!inStockOnly)}
                      className={`h-5 w-10 rounded-full transition-all relative ${inStockOnly ? 'bg-[#5A7A5C]' : 'bg-[#F2EDE4]'}`}
                    >
                      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${inStockOnly ? 'left-[22px]' : 'left-0.5 shadow-sm'}`} />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40">In Stock</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 mr-2">Sort by</span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35] border-b border-[#1A2E35]/20 pb-1 focus:outline-none">
                    {sortBy} <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white rounded-2xl border-[#F2EDE4] shadow-2xl p-2 z-[100]">
                    <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                      {["Bestselling", "Price: Low to High", "Price: High to Low", "Newest First"].map((s) => (
                        <DropdownMenuRadioItem 
                          key={s} 
                          value={s}
                          className="rounded-xl px-4 py-3 cursor-pointer text-xs font-display focus:bg-[#F2EDE4]/30"
                        >
                          {s}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-between bg-white/50 border border-[#F2EDE4] rounded-2xl px-6 py-4">
               <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]">
                Showing {filteredProducts.length} formulations
              </p>
              {(selectedConcern || selectedCategory !== "All Categories" || selectedPriceRange !== "all" || inStockOnly || searchQuery) && (
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                >
                  Reset All Filters <X className="h-3 w-3" />
                </button>
              )}
            </div>
            
            {/* Active Chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedConcern && (
                <div className="bg-[#5A7A5C]/10 text-[#5A7A5C] px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                  Concern: {selectedConcern} <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedConcern(null)} />
                </div>
              )}
              {selectedCategory !== "All Categories" && (
                <div className="bg-[#5A7A5C]/10 text-[#5A7A5C] px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                  {selectedCategory} <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("All Categories")} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4) Product Grid */}
        <section className="pb-24 bg-[#FDFBF7]" ref={gridRef}>
          <div className="container px-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#5A7A5C]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2E35]/40">Harvesting Pure Ingredients...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-32 border-2 border-dashed border-[#F2EDE4] rounded-[48px] bg-white">
                <Leaf className="h-12 w-12 text-[#1A2E35]/10 mx-auto mb-6" />
                <h3 className="text-xl font-display font-medium text-[#1A2E35] mb-2">No products found.</h3>
                <p className="text-[#1A2E35]/40 text-sm font-sans-clean max-w-sm mx-auto mb-8">No products found for this category. Try adjusting your filters.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <button onClick={clearFilters} className="text-[10px] font-bold uppercase tracking-widest text-[#5A7A5C] hover:underline underline-offset-4">Clear filters</button>
                  <Link to="/shop" onClick={clearFilters} className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/60 hover:text-[#1A2E35]">Shop all products</Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product, i) => {
                  const variant = product.node.variants.edges[0]?.node;
                  const image = product.node.images.edges[0]?.node;
                  const price = variant?.price;
                  
                  return (
                    <motion.div
                      key={product.node.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isGridInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="group bg-white border border-[#F2EDE4] rounded-[32px] overflow-hidden flex flex-col hover:border-[#5A7A5C] transition-all duration-500 hover:shadow-2xl hover:shadow-[#5A7A5C]/5"
                    >
                      <div className="relative aspect-square overflow-hidden bg-[#FDFBF7]">
                        <Link to={`/product/${product.node.handle}`}>
                          {image ? (
                            <img 
                              src={image.url} 
                              alt={image.altText || product.node.title} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary">
                              <Leaf className="h-12 w-12 text-[#1A2E35]/10" />
                            </div>
                          )}
                        </Link>
                        
                        {/* Wishlist Toggle */}
                        <button className="absolute top-6 right-6 h-10 w-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#1A2E35]/20 hover:text-red-500 transition-colors shadow-sm">
                          <Heart className="h-4 w-4" />
                        </button>
                        
                        {/* Status Badge */}
                        {!variant?.availableForSale ? (
                           <div className="absolute top-6 left-6 bg-red-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg">
                            Sold Out
                          </div>
                        ) : (
                          <div className="absolute top-6 left-6 bg-[#C5A059] text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg">
                            Premium Choice
                          </div>
                        )}
                      </div>

                      <div className="p-8 flex-1 flex flex-col">
                        <div className="flex items-center gap-1.5 mb-4">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="h-3 w-3 fill-[#C5A059] text-[#C5A059]" />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-[#1A2E35]">4.8</span>
                        </div>

                        <Link to={`/product/${product.node.handle}`} className="group/details">
                          <h3 className="font-display text-xl font-medium text-[#1A2E35] mb-1 line-clamp-2 leading-tight hover:text-[#5A7A5C] transition-colors">
                            {product.node.title}
                          </h3>
                          <p className="text-[9px] font-bold text-[#5A7A5C]/60 uppercase tracking-widest mb-2 group-hover/details:translate-x-1 transition-transform">View Details</p>
                        </Link>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                           <span className="text-[9px] font-bold text-[#5A7A5C] uppercase tracking-widest bg-[#5A7A5C]/5 px-2 py-1 rounded-md">{product.node.productType || "Wellness"}</span>
                        </div>
                        
                        <p className="text-sm text-[#1A2E35]/50 font-sans-clean line-clamp-2 mb-6 leading-relaxed">
                          {product.node.description}
                        </p>

                        <div className="mt-auto pt-6 border-t border-[#F2EDE4] flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-[#1A2E35]/30 line-through">₹{((parseFloat(price?.amount || "0") * 1.1)).toFixed(0)}</span>
                            <span className="text-lg font-display font-bold text-[#1A2E35]">
                              {price?.currencyCode === 'INR' ? '₹' : price?.currencyCode} {parseFloat(price?.amount || "0").toFixed(0)}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleAddToCart(product)}
                            disabled={!variant?.availableForSale || addingId === product.node.id}
                            className="h-12 w-12 bg-[#5A7A5C] rounded-2xl flex items-center justify-center text-white hover:bg-[#4A634B] transition-all shadow-xl shadow-[#5A7A5C]/20 disabled:opacity-50 group"
                          >
                            {addingId === product.node.id ? (
                               <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 5) Shop Trust Strip */}
        <section className="py-20 border-y border-[#F2EDE4] bg-white">
          <div className="container px-4">
            <div className="grid md:grid-cols-3 gap-16 max-w-5xl mx-auto">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-[#5A7A5C]/5 rounded-2xl flex items-center justify-center mx-auto text-[#5A7A5C]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]">GMP Certified</h4>
                <p className="text-[11px] text-[#1A2E35]/40 leading-relaxed font-sans-clean">Manufactured in clinical-grade environments under strict Ayurvedic manufacturing standards.</p>
              </div>
              <div className="text-center space-y-4 text-center">
                <div className="w-12 h-12 bg-[#C5A059]/5 rounded-2xl flex items-center justify-center mx-auto text-[#C5A059]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]">Batch Integrity</h4>
                <p className="text-[11px] text-[#1A2E35]/40 leading-relaxed font-sans-clean">Every batch undergoes consistency checks for purity, potency, and standardized extraction.</p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-blue-500/5 rounded-2xl flex items-center justify-center mx-auto text-blue-500">
                  <Package className="h-6 w-6" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A2E35]">Full Transparency</h4>
                <p className="text-[11px] text-[#1A2E35]/40 leading-relaxed font-sans-clean">Clearly labeled botanical names and concentration ratios for zero-guesswork wellness.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ShopPage;
