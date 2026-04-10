import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ShoppingCart, Leaf, Loader2, Star, Trophy, ShieldCheck, Sparkles, Heart } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { type ShopifyProduct, fetchProductsViaAdmin, createHybridCheckout, getStoredSession, type Address, fetchBulkReviews } from "@/lib/shopifyAdmin";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { toast } from "sonner";
import AddressSelectionModal from "@/components/AddressSelectionModal";
import { Image } from "@/components/ui/Image";
import { SectionHeading } from "@/components/ui/SectionHeading";

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedProductForCheckout, setSelectedProductForCheckout] = useState<ShopifyProduct | null>(null);
  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const [reviewsMap, setReviewsMap] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetchProductsViaAdmin(12)
      .then(async (fetchedProducts) => {
        setProducts(fetchedProducts);
        // Fetch reviews in bulk
        const ids = fetchedProducts.map(p => p.node.id);
        const reviewsData = await fetchBulkReviews(ids);
        const map: Record<string, any[]> = {};
        reviewsData.forEach((item: any) => {
          map[item.id] = item.reviews;
        });
        setReviewsMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  const handleBuyNow = async (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) {
      toast.error("Product unavailable", { description: "No available variants found." });
      return;
    }
    
    const session = getStoredSession();
    if (!session?.user) {
      toast.info("Please sign in to proceed with direct checkout");
      navigate(`/login?redirect=buy_now&variantId=${variant.id}&quantity=1`);
      return;
    }

    setSelectedProductForCheckout(product);
    setIsAddressModalOpen(true);
  };

  const onAddressSelect = async (address: Address | null) => {
    if (!selectedProductForCheckout) return;
    
    const variant = selectedProductForCheckout.node.variants.edges[0]?.node;
    if (!variant) return;

    setBuyingId(selectedProductForCheckout.node.id);
    
    try {
      const session = getStoredSession();
      const lineItems = [{ variantId: variant.id, quantity: 1 }];
      const result = await createHybridCheckout(lineItems, session?.user?.id, session?.user?.email, address);
      
      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.error("Checkout failed. Please try again.");
        setBuyingId(null);
        setIsAddressModalOpen(false);
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
      setBuyingId(null);
      setIsAddressModalOpen(false);
    }
  };

  // Duplicate products for infinite marquee effect
  const marqueeProducts = [...products, ...products, ...products];

  return (
    <section id="products" className="py-6 md:py-8 lg:py-10 xl:py-12 bg-secondary overflow-hidden" ref={ref}>
      <div className="container mx-auto">
        <SectionHeading 
          title={<>Best Loved <span>Formulations</span></>} 
          eyebrow="Pure Potency" 
          animate={false}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#5A7A5C]" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Leaf className="h-16 w-16 text-[#5A7A5C]/20 mx-auto mb-4" />
          <p className="text-[#1A2E35]/60 font-body text-lg">Our herbarium is currently being prepared.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Marquee Container */}
          <div className="flex overflow-hidden group">
            <motion.div 
              className="flex gap-6 md:gap-8 lg:gap-10 xl:gap-12"
              animate={{ x: ["0%", "-33.33%"] }}
              transition={{ 
                duration: 40, 
                repeat: Infinity, 
                ease: "linear",
                repeatType: "loop"
              }}
              style={{ width: "fit-content" }}
              whileHover={{ animationPlayState: "paused" }}
            >
              {marqueeProducts.map((product, idx) => {
                const variant = product.node.variants.edges[0]?.node;
                const image = product.node.images.edges[0]?.node;
                const price = variant?.price;

                return (
                  <motion.div
                    key={`${product.node.id}-${idx}`}
                    className="w-[280px] md:w-[320px] bg-white rounded-[2rem] p-4 border border-[#F2EDE4] shadow-sm hover:shadow-xl hover:shadow-[#5A7A5C]/5 transition-all duration-700 relative overflow-hidden flex-shrink-0"
                    whileHover={{ y: -8 }}
                  >
                    {/* Floating Glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F2EDE4]/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <Link to={`/product/${product.node.handle}`} className="block relative mb-6 rounded-2xl overflow-hidden bg-[#FDFBF7] aspect-square">
                      <div className="relative aspect-[4/5] overflow-hidden">
              {image ? (
                <Image 
                  src={image.url} 
                  alt={image.altText || product.node.title} 
                  fill={true}
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Leaf className="h-12 w-12 text-[#5A7A5C]/20" />
                        </div>
                      )}
                      </div>
                      
                      {/* Premium Badges Container */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        {(product.node.tags?.includes('Best Seller') || product.node.handle === 'triphala-churna' || product.node.handle === 'triphala-tablets') && (
                          <div className="bg-white/90 backdrop-blur-md border border-[#F2EDE4] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                            <Trophy className="h-3 w-3 text-[#C5A059]" />
                            <span className="text-[9px] font-bold text-[#1A2E35] uppercase tracking-wider">Best Seller</span>
                          </div>
                        )}
                        {(product.node.tags?.includes('Doctor Recommended') || product.node.handle === 'brahmi-hair-oil') && (
                          <div className="bg-[#5A7A5C]/90 backdrop-blur-md border border-[#5A7A5C]/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                            <ShieldCheck className="h-3 w-3 text-white" />
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Doctor Recommended</span>
                          </div>
                        )}
                        {(product.node.tags?.includes('New Launch') || product.node.handle === 'brahmi-hair-oil') && (
                          <div className="bg-[#1A2E35]/90 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                            <Sparkles className="h-3 w-3 text-[#C5A059]" />
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">New Launch</span>
                          </div>
                        )}
                        {(product.node.tags?.includes('100% Herbal') || product.node.handle === 'triphala-churna' || product.node.handle === 'triphala-tablets') && (
                          <div className="bg-white/90 backdrop-blur-md border border-[#F2EDE4] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                            <Leaf className="h-3 w-3 text-[#5A7A5C]" />
                            <span className="text-[9px] font-bold text-[#1A2E35] uppercase tracking-wider">100% Herbal</span>
                          </div>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <button 
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (variant) await toggleItem(product, variant.id);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all z-10 ${
                          variant && isInWishlist(variant.id) 
                            ? 'bg-red-500 border-red-500 text-white' 
                            : 'bg-white/80 border-[#F2EDE4] text-[#1A2E35] hover:bg-white'
                        }`}
                         aria-label={variant && isInWishlist(variant.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart className={`h-3.5 w-3.5 ${variant && isInWishlist(variant.id) ? 'fill-white' : ''}`} />
                      </button>

                      {/* Default Premium Badge if no specific tags */}
                      {(!product.node.tags || product.node.tags.length === 0) && (
                        <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md border border-[#F2EDE4] px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Star className="h-3 w-3 fill-[#C5A059] text-[#C5A059]" />
                          <span className="text-[9px] font-bold text-[#1A2E35] uppercase tracking-tighter">Premium</span>
                        </div>
                      )}
                    </Link>

                    <div className="px-2">
                      <Link to={`/product/${product.node.handle}`} className="block mb-1">
                        <h3 className="font-display font-medium text-[#1A2E35] text-lg hover:text-[#5A7A5C] transition-colors line-clamp-1">
                          {product.node.title}
                        </h3>
                      </Link>

                      <div className="flex justify-between items-center mb-3">
                        {/* Rating Display */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          {(() => {
                            const productReviews = reviewsMap[product.node.id] || [];
                            const hasReviews = productReviews.length > 0;
                            
                            const avgRating = hasReviews 
                              ? Number((productReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / productReviews.length).toFixed(1))
                              : 0;
                            const count = hasReviews ? productReviews.length : 0;

                            return (
                              <>
                                <div className="flex shrink-0">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-2.5 w-2.5 ${i < Math.round(avgRating) ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#F2EDE4]'}`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-[9px] font-bold text-[#1A2E35]/40 tracking-tighter truncate">
                                  {count > 0 ? `${avgRating} (${count})` : 'No reviews'}
                                </span>
                              </>
                            );
                          })()}
                        </div>

                        {price && (
                          <div className="flex items-baseline gap-1.5 whitespace-nowrap ml-2">
                            <span className="text-[#C5A059] font-sans-clean font-bold text-sm">
                              {price.currencyCode === 'INR' ? '₹' : price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                            </span>
                            {variant?.compareAtPrice && parseFloat(variant.compareAtPrice.amount) > parseFloat(price.amount) && (
                              <span className="text-[10px] text-[#1A2E35]/30 line-through">
                                {variant.compareAtPrice.currencyCode === 'INR' ? '₹' : variant.compareAtPrice.currencyCode} {parseFloat(variant.compareAtPrice.amount).toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="min-h-[60px] mb-4">
                        <p className="text-[#1A2E35]/60 font-sans-clean text-xs leading-relaxed line-clamp-2">
                          {product.node.description}
                        </p>
                        <Link 
                          to={`/product/${product.node.handle}`} 
                          className="text-[9px] font-bold uppercase tracking-widest text-[#5A7A5C] hover:underline mt-1 inline-block"
                        >
                          Read more +
                        </Link>
                      </div>
                      {!variant?.availableForSale ? (
                        <button
                          disabled
                          className="w-full bg-[#F2EDE4] text-[#1A2E35]/40 py-3 rounded-xl font-sans-clean text-[10px] font-bold uppercase tracking-widest flex items-center justify-center cursor-not-allowed"
                        >
                          Sold Out
                        </button>
                      ) : (                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={addingId === product.node.id}
                            className="flex-1 border border-[#1A2E35]/10 text-[#1A2E35] py-3 rounded-xl font-sans-clean text-[10px] font-bold uppercase tracking-widest hover:bg-[#FDFBF7] transition-all flex items-center justify-center gap-2 group/btn"
                          >
                            {addingId === product.node.id ? (
                              <Loader2 className="h-3 w-3 animate-spin text-[#5A7A5C]" />
                            ) : (
                              <ShoppingCart className="h-3 w-3 text-[#1A2E35]/40 group-hover/btn:text-[#5A7A5C] transition-colors" />
                            )}
                            {addingId === product.node.id ? "Adding..." : "Add to Cart"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleBuyNow(product);
                            }}
                            disabled={buyingId === product.node.id}
                            className="flex-1 bg-[#1A2E35] text-white py-3 rounded-xl font-sans-clean text-[10px] font-bold uppercase tracking-widest hover:bg-[#5A7A5C] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#1A2E35]/10"
                          >
                            {buyingId === product.node.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                            {buyingId === product.node.id ? "Redirecting..." : "Buy Now"}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      )}

      {/* <div className="mt-10 flex flex-col items-center">
        <Link 
          to="/shop" 
          className="bg-[#5A7A5C] text-white px-8 py-3.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-[#1A2E35] transition-all shadow-lg shadow-[#5A7A5C]/20"
        >
          View All Products
        </Link>
      </div> */}
      <div className="mt-10 flex flex-col items-center">
  <Link 
    to="/shop" 
    className="bg-[#5A7A5C] text-white 
    px-8 py-3.5 
    rounded-2xl   /* 👈 updated curve */

    font-bold uppercase tracking-widest text-[10px] 

    hover:bg-[#1A2E35] 
    transition-all duration-300 
    transform hover:scale-105 active:scale-95 

    shadow-lg shadow-[#5A7A5C]/20"
  >
    View All Products
  </Link>
</div>

      {/* Address Selection Modal */}
      {selectedProductForCheckout && (
        <AddressSelectionModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          customerId={getStoredSession()?.user?.id || ""}
          onSelect={onAddressSelect}
          isProcessing={!!buyingId}
        />
      )}
    </section>
  );
};

export default FeaturedProducts;
