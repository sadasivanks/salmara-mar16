import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Heart, ShoppingBag, Trash2, ArrowRight, Loader2, Star, Leaf } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Image } from "@/components/ui/Image";
import SEO from "@/components/SEO";
import { SectionHeading } from "@/components/ui/SectionHeading";

import { getStoredSession, fetchBulkReviews } from "@/lib/shopifyAdmin";
import { useNavigate } from "react-router-dom";

const WishlistPage = () => {
  const { items, removeItem, clearWishlist, syncWithShopify, isLoading } = useWishlistStore();
  const { addItem } = useCartStore();
  const navigate = useNavigate();
  const [reviewsMap, setReviewsMap] = useState<Record<string, any[]>>({});
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);

  useEffect(() => {
    const session = getStoredSession();
    if (!session?.user?.id) {
      toast.error("Please login to view your wishlist");
      navigate("/login?redirect=wishlist");
      return;
    }
    syncWithShopify();
  }, [syncWithShopify, navigate]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (items.length === 0) return;
      
      setIsReviewsLoading(true);
      try {
        const productIds = items
          .map(item => {
            const node = (item.product?.node || item.product) as any;
            return node?.id;
          })
          .filter(Boolean);

        if (productIds.length > 0) {
          const reviewsData = await fetchBulkReviews(productIds);
          const map: Record<string, any[]> = {};
          reviewsData.forEach((item: any) => {
            map[item.id] = item.reviews;
          });
          setReviewsMap(map);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist reviews:", error);
      } finally {
        setIsReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [items]);

  const handleAddToCart = async (item: any) => {
    const productNode = item.product?.node || item.product; // Support both structures
    const variant = productNode?.variants?.edges[0]?.node;
    if (!variant) return;

    try {
      await addItem({
        product: { node: productNode },
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions || [],
      });
      toast.success("Added to cart", { description: item.product.node.title });
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <SEO 
        title="My Wishlist | Favourite Ayurvedic Remedies" 
        description="Keep track of your preferred Ayurvedic formulations. Save your favorites and start your journey towards natural wellness."
      />
      <Header />
      
      <main className="container mx-auto px-4 py-6 md:py-8 lg:py-10 xl:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
            <SectionHeading 
              title={<>Saved <span>Formulations</span></>}
              eyebrow="Your Favorites"
              level="h1"
              centered={false}
              className="mb-0"
              animate={false}
            />
            </motion.div>

            {items.length > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => clearWishlist()}
                className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors border-b border-transparent hover:border-red-500 pb-1"
              >
                Clear All
              </motion.button>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="h-12 w-12 animate-spin text-[#5A7A5C] mb-4" />
                <p className="text-[#1A2E35]/40 font-body animate-pulse">Retrieving your favorites...</p>
              </div>
            ) : items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-[#F2EDE4] px-4"
              >
                <div className="w-20 h-20 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-8">
                  <Heart className="h-10 w-10 text-[#5A7A5C]/20" />
                </div>
                <SectionHeading 
                  title="Your wishlist is empty"
                  description="Explore our certified Ayurvedic formulations and save your favorites to compare and shop later."
                  animate={false}
                />
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-3 bg-[#1A2E35] text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#5A7A5C] transition-all shadow-xl shadow-[#1A2E35]/10"
                >
                  Start Exploring <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((item, idx) => {
                  const productNode = (item.product?.node || item.product) as any;
                  if (!productNode) return null;
                  
                  const image = productNode.images?.edges?.[0]?.node;
                  const variant = productNode.variants?.edges?.[0]?.node;

                  return (
                    <motion.div
                      key={item.variantId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="bg-white rounded-[2.5rem] p-5 border border-[#F2EDE4] shadow-sm hover:shadow-2xl hover:shadow-[#5A7A5C]/5 transition-all duration-700 group relative"
                    >
                      <button
                        onClick={async () => await removeItem(item.variantId)}
                        className="absolute top-8 right-8 z-20 p-3 bg-white/80 backdrop-blur-md rounded-full border border-[#F2EDE4] text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="Remove from favorites"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <Link to={`/product/${productNode.handle}`} className="block relative aspect-square rounded-[2rem] overflow-hidden bg-[#FDFBF7] mb-8 group-hover:shadow-lg transition-all duration-700">
                        {image ? (
                          <img src={image.url} alt={image.altText || productNode.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Leaf className="h-16 w-16 text-[#5A7A5C]/10" />
                          </div>
                        )}
                      </Link>

                      <div className="px-3">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <Link to={`/product/${productNode.handle}`}>
                              <h3 className="text-xl font-display font-medium text-[#1A2E35] hover:text-[#5A7A5C] transition-colors mb-1">
                                {productNode.title}
                              </h3>
                            </Link>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A7A5C] opacity-60">
                              {productNode.productType}
                            </p>
                          </div>
                        {variant && (
  <span className="text-lg font-medium text-[#1A2E35] font-[Inter]">
    ₹{parseInt(variant.price.amount)}
  </span>
)}
                        </div>

                        <div className="flex items-center gap-2 mb-8">
                          <div className="flex items-center gap-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => {
                                const reviews = reviewsMap[productNode.id] || [];
                                const avgRating = reviews.length > 0 
                                  ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length 
                                  : 4.9;
                                return (
                                  <Star 
                                    key={i} 
                                    className={`h-3 w-3 ${i < Math.floor(avgRating) ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#C5A059]/20'}`} 
                                  />
                                );
                              })}
                            </div>
                            <span className="text-[10px] font-bold text-[#1A2E35] font-[Inter]">
                              {(() => {
                                const reviews = reviewsMap[productNode.id] || [];
                                const avgRating = reviews.length > 0 
                                  ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
                                  : "4.9";
                                return avgRating;
                              })()}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-[#1A2E35]/30 uppercase tracking-widest leading-none">
                            {(() => {
                              const reviews = reviewsMap[productNode.id] || [];
                              const count = reviews.length > 0 ? reviews.length : 248;
                              return `(${count})`;
                            })()}
                          </span>
                        </div>

                        <div className="flex gap-3">
                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={!variant?.availableForSale}
                              className="flex-1 bg-[#1A2E35] text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#5A7A5C] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1A2E35]/5 disabled:opacity-50"
                            >
                              {!variant?.availableForSale ? "Sold Out" : <><ShoppingBag className="h-3.5 w-3.5" /> Move to Cart</>}
                            </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WishlistPage;
