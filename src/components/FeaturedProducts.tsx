import { m, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ShoppingCart, Leaf, Loader2, Star, Trophy, ShieldCheck, Sparkles, Heart } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { type ShopifyProduct, fetchProductsViaAdmin, createHybridCheckout, getStoredSession, type Address, fetchBulkReviews } from "@/lib/shopifyAdmin";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { toast } from "sonner";
import { lazy, Suspense } from "react";
const AddressSelectionModal = lazy(() => import("@/components/AddressSelectionModal"));
import { Image } from "@/components/ui/Image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import ProductCard from "@/components/ProductCard";


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
            <m.div 
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
              {marqueeProducts.map((product, idx) => (
                <ProductCard
                  key={`${product.node.id}-${idx}`}
                  product={product}
                  idx={idx}
                  reviewsMap={reviewsMap}
                  addingId={addingId}
                  buyingId={buyingId}
                  isInWishlist={isInWishlist}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onToggleWishlist={toggleItem}
                />
              ))}

            </m.div>
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
    </section>
  );
};

export default FeaturedProducts;
