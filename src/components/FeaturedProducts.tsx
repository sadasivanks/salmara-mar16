import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ShoppingCart, Leaf, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchProducts, createShopifyCart, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

const FeaturedProducts = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const { addItem, isLoading: isCartStoreLoading } = useCartStore();

  useEffect(() => {
    fetchProducts(12)
      .then(setProducts)
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
    if (!variant) return;
    
    setBuyingId(product.node.id);
    try {
      const cartData = await createShopifyCart({
        variantId: variant.id,
        quantity: 1
      });
      console.log(cartData,'cartDatacartData')
      if (cartData?.checkoutUrl) {
        window.location.href = cartData.checkoutUrl;
      } else {
        toast.error("Checkout failed", { description: "Could not generate checkout link. Please try adding to cart." });
      }
    } catch (error) {
      console.error("Buy Now Error:", error);
      toast.error("Something went wrong", { description: "Please try again or use standard Add to Cart." });
    } finally {
      setBuyingId(null);
    }
  };
  const [showAll, setShowAll] = useState(false);
  const displayedProducts = showAll ? products : products.slice(0, 8);

  return (
    <section id="products" className="py-24 bg-secondary" ref={ref}>
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-accent font-sans-clean text-sm uppercase tracking-[0.2em] mb-3">Our Products</p>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            Our Best-Loved Formulations
          </h2>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Leaf className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-body text-lg">No products found</p>
            <p className="text-muted-foreground/70 font-sans-clean text-sm mt-2">Products will appear here once added to the store.</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto text-left">
              {displayedProducts.map((product, i) => {
                const variant = product.node.variants.edges[0]?.node;
                const image = product.node.images.edges[0]?.node;
                const price = variant?.price;

                return (
                  <motion.div
                    key={product.node.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group"
                  >
                    <Link to={`/product/${product.node.handle}`}>
                      <div className="relative aspect-square bg-gradient-to-br from-secondary to-sand-warm flex items-center justify-center overflow-hidden">
                        {image ? (
                          <img src={image.url} alt={image.altText || product.node.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <Leaf className="h-16 w-16 text-primary/20" />
                        )}
                      </div>
                    </Link>

                    <div className="p-5">
                      <Link to={`/product/${product.node.handle}`}>
                        <h3 className="font-display font-semibold text-foreground text-lg mb-1 hover:text-primary transition-colors">
                          {product.node.title}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground font-body text-sm mb-3 line-clamp-2">{product.node.description}</p>

                      {price && (
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-xl font-sans-clean font-bold text-foreground">
                            {price.currencyCode === 'INR' ? '₹' : price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!variant?.availableForSale || addingId === product.node.id || buyingId === product.node.id}
                            className="flex-1 bg-[#5A7A5C] hover:bg-[#4A634B] text-white py-2.5 rounded-lg font-sans-clean text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            {addingId === product.node.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><ShoppingCart className="h-3.5 w-3.5" /> Add to Cart</>}
                          </button>
                          <Link
                            to={`/product/${product.node.handle}`}
                            title="Opens the full product page"
                            className="px-4 py-2.5 rounded-lg border border-[#5A7A5C] text-[#5A7A5C] font-sans-clean text-xs font-semibold hover:bg-[#5A7A5C] hover:text-white transition-all flex items-center justify-center whitespace-nowrap"
                          >
                            Details
                          </Link>
                        </div>
                        <button
                          onClick={() => handleBuyNow(product)}
                          disabled={!variant?.availableForSale || addingId === product.node.id || buyingId === product.node.id}
                          className="w-full border-2 border-[#1A2E35] text-[#1A2E35] py-2.5 rounded-lg font-sans-clean text-[10px] font-bold uppercase tracking-wider hover:bg-[#1A2E35] hover:text-white transition-all disabled:opacity-50 flex items-center justify-center"
                        >
                          {buyingId === product.node.id ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                          {buyingId === product.node.id ? "Preparing..." : "Buy Now Direct"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {!showAll && products.length > 8 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-16 flex justify-center"
              >
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-16 flex justify-center"
              >
                <Link
                  to="/shop"
                  className="group flex flex-col items-center gap-4 text-[#5A7A5C] hover:text-[#4A634B] transition-colors"
                >
                  <span className="font-sans-clean font-bold text-xs uppercase tracking-[0.3em]">View All Products</span>
                  <div className="w-12 h-12 rounded-full border border-[#5A7A5C]/20 flex items-center justify-center group-hover:border-[#5A7A5C]/50 transition-all">
                    <motion.div
                      animate={{ y: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Leaf className="h-5 w-5" />
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
