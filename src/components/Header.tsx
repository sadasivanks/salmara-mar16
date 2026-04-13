import { useState, useEffect, lazy, Suspense } from "react";
import { Search, User, Menu, X, Phone, Leaf, Package, UserCircle, Heart, ChevronRight, Loader2, Plus } from "lucide-react";
const CartDrawer = lazy(() => import("@/components/CartDrawer").then(m => ({ default: m.CartDrawer })));
const AuthModal = lazy(() => import("@/components/AuthModal").then(m => ({ default: m.AuthModal })));
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProductsViaAdmin, getStoredSession, logoutViaAdmin, type ShopifyProduct } from "@/lib/shopifyAdmin";
import { Image } from "@/components/ui/Image";
import { siteConfig } from "@/config/site.config";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const logo = "/images/brand/salamara_icon.webp";

const navItems = [
  { label: "About Us", href: "/about" },
  { label: "Shop Now", href: "/shop" },
  { label: "Clinics", href: "/clinics" },
  { label: "Book Appointment", href: `https://wa.me/${siteConfig.contact.whatsapp}?text=Hello%20Salmara%20Team,%20I%20would%20like%20to%20book%20an%20Ayurvedic%20consultation.`, external: true },
  { label: "Contact Us", href: "/contact" },
];

const shopByConcern = [
  "Pain Relief",
  "Liver Detox",
  "Women's Wellness",
  "Immunity",
  "Skin Care",
  "Digestion",
];

const Header = () => {
  const { clearCart } = useCartStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
  const [searchResults, setSearchResults] = useState<ShopifyProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { items: wishlistItems, syncWithShopify, clearWishlist } = useWishlistStore();
  const wishlistCount = wishlistItems.length;
  const location = useLocation();

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement> | null, href: string) => {
    const hash = href.includes("#") ? `#${href.split("#")[1]}` : href;
    if (hash.startsWith("#") && hash.length > 1) {
      if (e) e.preventDefault();
      const element = document.querySelector(hash);
      if (element) {
        const offset = 80; // Account for sticky header height
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
      setMobileOpen(false);
    }
  };

  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          scrollToSection(null, hash);
        }, 100);
      }
    };

    handleHashScroll();
    window.addEventListener('hashchange', handleHashScroll);
    return () => window.removeEventListener('hashchange', handleHashScroll);
  }, []);

  useEffect(() => {
    const checkSession = () => {
      const session = getStoredSession();
      if (session?.user) {
        setUser(session.user);
        syncWithShopify(); // Sync wishlist on session check
      } else {
        setUser(null);
      }
    };

    checkSession();
    window.addEventListener('auth-status-change', checkSession);

    return () => {
      window.removeEventListener('auth-status-change', checkSession);
    };
  }, []);

  const handleLogout = async () => {
    await logoutViaAdmin();
    clearCart();
    clearWishlist();
    toast.success("Logged out successfully");
    setUser(null);
    navigate("/");
  };

  // Fetch products for search cache
  useEffect(() => {
    if (searchOpen && allProducts.length === 0) {
      fetchProductsViaAdmin(50).then(setAllProducts).catch(console.error);
    }
  }, [searchOpen, allProducts]);

  // Handle live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    const filtered = allProducts.filter((product) => {
      const titleMatch = product.node.title.toLowerCase().includes(query);

      return titleMatch;
    }).slice(0, 5); // Limit to top 5 results

    setSearchResults(filtered);
    setIsSearching(false);
  }, [searchQuery, allProducts]);

  const handleResultClick = (handle: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(`/product/${handle}`);
  };

  return (
    <>
      {/* Promo Bar */}
      <div className="bg-[#5A7A5C] text-[#F2EDE4] text-center py-2 text-[10px] md:text-xs font-sans-clean tracking-[0.3em] uppercase font-bold">
        Free Shipping on all orders
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border/40 shadow-sm">
        <div className="w-full px-4 md:px-8 flex items-center justify-between h-16 lg:h-20">          {/* Logo & Tagline */}
          <Link 
            to="/" 
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-4 shrink-0 group py-1"
          >
            <div className="relative flex items-center justify-center">
              <img 
                src={siteConfig.logo} 
                alt={`${siteConfig.name} Logo`} 
                className="h-10 md:h-12 lg:h-14 w-auto mix-blend-multiply drop-shadow-sm transition-transform duration-300 group-hover:scale-105" 
              />
            </div>
            <div className="hidden lg:flex flex-col border-l border-[#F2EDE4] pl-5 py-0.5">
              <span className="text-[10px] md:text-xs font-display font-medium text-[#1A2E35] leading-tight tracking-wide">
                Rediscover Wellness Through
              </span>
              <span className="text-[10px] md:text-xs font-display font-medium text-[#5A7A5C] leading-tight tracking-wide italic">
                Authentic Ayurveda.
              </span>
            </div>
          </Link>

          {/* Desktop Nav - centered */}
          <nav className="hidden xl:flex items-center gap-6">
            {navItems.map((item) => (
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-[15px] font-sans-clean text-foreground/80 hover:text-primary transition-colors duration-200 relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 rounded-full" />
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={(e) => {
                    const isHomePage = window.location.pathname === "/";
                    const hrefHasHash = item.href.includes("#");
                    const targetIsHomeHash = item.href.startsWith("/#");
                    
                    if (hrefHasHash && (isHomePage || !targetIsHomeHash)) {
                      const hash = item.href.split("#")[1];
                      scrollToSection(e as any, `#${hash}`);
                    }
                  }}
                  className={`px-3 py-2 text-[15px] font-sans-clean transition-colors duration-200 relative group ${
                    location.pathname === item.href 
                      ? "text-primary font-bold" 
                      : "text-foreground/80 hover:text-primary"
                  }`}
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary transition-all duration-300 rounded-full ${
                    location.pathname === item.href ? "w-3/4" : "w-0 group-hover:w-3/4"
                  }`} />
                </Link>
              )
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-1 sm:gap-3 px-1 sm:px-0">
            <div className="relative flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: window.innerWidth < 640 ? 140 : 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="overflow-hidden mr-1 sm:mr-2"
                  >
                    <input
                      type="text"
                      placeholder="Search..."
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#F2EDE4]/50 border border-[#F2EDE4] rounded-full px-4 py-1.5 text-sm font-sans-clean outline-none focus:border-[#5A7A5C] transition-colors"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  if (searchOpen) setSearchQuery("");
                }}
                className={`p-2 transition-colors duration-300 ${searchOpen ? 'text-[#5A7A5C]' : 'text-foreground/70 hover:text-primary'}`}
                aria-label={searchOpen ? "Close search" : "Open search"}
              >
                {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </button>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchOpen && searchQuery.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] max-h-[60vh] overflow-y-auto bg-white border border-[#F2EDE4] rounded-2xl shadow-2xl z-[60]"
                  >
                    <div className="p-2">
                      {isSearching ? (
                        <div className="p-8 text-center flex flex-col items-center gap-2">
                          <div className="h-5 w-5 border-2 border-[#5A7A5C] border-t-transparent rounded-full animate-spin" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40">Searching...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="space-y-1">
                          <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 border-b border-[#F2EDE4] mb-1">
                            Results
                          </p>
                          {searchResults.map((product) => (
                            <button
                              key={product.node.id}
                              onClick={() => handleResultClick(product.node.handle)}
                              className="w-full flex items-center gap-3 p-2 hover:bg-[#F2EDE4]/30 rounded-xl transition-colors text-left group"
                            >
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F2EDE4]/50 shrink-0">
                                {product.node.images.edges[0]?.node?.url ? (
                                  <Image src={product.node.images.edges[0].node.url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Leaf className="w-5 h-5 m-2.5 text-[#5A7A5C]/30" />
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-[#1A2E35] truncate group-hover:text-[#5A7A5C] transition-colors">
                                  {product.node.title}
                                </span>
                                <span className="text-[10px] text-[#1A2E35]/40 truncate">
                                  {product.node.productType || "Ayurvedic Formulation"}
                                </span>
                              </div>
                            </button>
                          ))}
                          <Link 
                            to={`/shop?search=${searchQuery}`}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="block text-center py-2 text-[10px] font-bold uppercase tracking-widest text-[#5A7A5C] hover:bg-[#5A7A5C]/5 transition-colors"
                          >
                            View All Results
                          </Link>
                        </div>
                      ) : (
                        <div className="p-8 text-center flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#F2EDE4]/50 flex items-center justify-center">
                            <Search className="h-5 w-5 text-[#1A2E35]/20" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-[#1A2E35]">No matches found</p>
                            <p className="text-[11px] text-[#1A2E35]/40 max-w-[180px] mx-auto leading-relaxed">
                              We couldn't find any products matching "{searchQuery}"
                            </p>
                          </div>
                          <button 
                            onClick={() => setSearchQuery("")}
                            className="mt-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7A5C] hover:bg-[#5A7A5C]/5 border border-[#5A7A5C]/20 rounded-full transition-all"
                          >
                            Clear Search
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link 
              to="/wishlist" 
              className={`p-2 text-foreground/70 hover:text-red-500 transition-colors relative group ${searchOpen ? 'hidden sm:block' : ''}`}
              aria-label={`Wishlist ${wishlistCount > 0 ? `(${wishlistCount} items)` : ''}`}
            >
              <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {user && wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-sans-clean font-bold rounded-full h-4 w-4 flex items-center justify-center animate-in zoom-in duration-300">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Suspense fallback={<div className="h-9 w-9" />}>
              <CartDrawer />
            </Suspense>
            
            {user ? (
              <div className={`hidden sm:flex items-center gap-4 ${searchOpen ? 'md:flex' : ''}`}>
                <Link 
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#FDFBF7] rounded-full border border-[#F2EDE4] hover:bg-[#5A7A5C]/5 transition-colors group"
                >
                  <User className="h-4 w-4 text-[#5A7A5C] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-sans-clean font-medium text-[#1A2E35]">
                  {(user.name ?.split('@')[0])?.slice(0, 15)}
                  </span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-xs font-sans-clean font-bold text-[#1A2E35]/60 hover:text-red-600 transition-colors uppercase tracking-widest"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setAuthView("login");
                  setAuthOpen(true);
                }}
                className={`hidden sm:flex items-center gap-1.5 p-2 text-foreground/70 hover:text-primary transition-colors ${searchOpen ? 'md:flex' : ''}`} 
                aria-label="Login"
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-sans-clean">Login</span>
              </button>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className={`p-2 text-foreground/70 hover:text-primary transition-colors xl:hidden ${searchOpen ? 'hidden' : ''}`}
                  aria-label="Open main menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-sm p-0 bg-[#FDFBF7] border-none shadow-2xl flex flex-col h-full overflow-hidden">
                <SheetHeader className="p-6 border-b border-[#F2EDE4] bg-white shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-[#5A7A5C]/10 rounded-xl flex items-center justify-center">
                        <Leaf className="h-4 w-4 text-[#5A7A5C]" />
                      </div>
                      <SheetTitle className="font-display text-xl font-medium text-[#1A2E35]">Menu</SheetTitle>
                    </div>
                  </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <nav className="p-6 space-y-1">
                    {navItems.map((item, idx) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        {item.external ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between px-4 py-3.5 text-base font-sans-clean text-[#1A2E35]/80 hover:text-[#5A7A5C] hover:bg-white rounded-2xl transition-all group"
                          >
                            <span>{item.label}</span>
                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                          </a>
                        ) : (
                          <Link
                            to={item.href}
                            onClick={(e) => {
                              const isHomePage = window.location.pathname === "/";
                              const hrefHasHash = item.href.includes("#");
                              const targetIsHomeHash = item.href.startsWith("/#");

                              if (hrefHasHash && (isHomePage || !targetIsHomeHash)) {
                                const hash = item.href.split("#")[1];
                                scrollToSection(e as any, `#${hash}`);
                              } else {
                                setMobileOpen(false);
                              }
                            }}
                            className={`flex items-center justify-between px-4 py-3.5 text-base font-sans-clean rounded-2xl transition-all group ${
                              location.pathname === item.href
                                ? "text-[#5A7A5C] bg-white font-bold shadow-sm"
                                : "text-[#1A2E35]/80 hover:text-[#5A7A5C] hover:bg-white"
                            }`}
                          >
                            <span>{item.label}</span>
                            <ChevronRight className={`h-4 w-4 transition-all ${
                              location.pathname === item.href ? "opacity-100" : "opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                            }`} />
                          </Link>
                        )}
                      </motion.div>
                    ))}
                  </nav>
                  
                  <div className="px-6 py-8 border-t border-[#F2EDE4]/50">
                    <p className="text-[10px] font-bold text-[#1A2E35]/30 uppercase tracking-[0.2em] mb-5 px-1">
                      Shop by Concern
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {shopByConcern.map((concern) => (
                        <Link
                          key={concern}
                          to="/shop"
                          onClick={() => setMobileOpen(false)}
                          className="px-4 py-2.5 text-[11px] font-bold text-[#1A2E35] bg-white border border-[#F2EDE4] rounded-xl hover:bg-[#5A7A5C] hover:text-white hover:border-[#5A7A5C] transition-all text-center uppercase tracking-wider"
                        >
                          {concern}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-[#F2EDE4] bg-white shrink-0">
                  {user ? (
                    <div className="space-y-4">
                      <Link 
                        to="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-4 p-4 bg-[#FDFBF7] rounded-[1.5rem] border border-[#F2EDE4] hover:bg-[#5A7A5C]/5 transition-all group"
                      >
                        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-[#F2EDE4] group-hover:border-[#5A7A5C]/30 transition-colors">
                          <UserCircle className="h-6 w-6 text-[#5A7A5C]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-sans-clean font-bold text-[#1A2E35] truncate">{user.name || 'User Account'}</span>
                          <span className="text-[10px] text-[#1A2E35]/40 truncate">{user.email}</span>
                        </div>
                      </Link>
                      <button 
                        onClick={() => {
                          handleLogout();
                          setMobileOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-red-600/60 hover:text-red-600 transition-colors uppercase tracking-[0.3em]"
                      >
                        <X className="h-3.5 w-3.5" /> Logout Session
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setMobileOpen(false);
                        setAuthView("login");
                        setAuthOpen(true);
                      }}
                      className="w-full h-14 bg-[#1A2E35] text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#5A7A5C] transition-all shadow-xl shadow-[#1A2E35]/10"
                    >
                      <UserCircle className="h-5 w-5" /> Login / Register
                    </button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>


      </header>

      {/* Auth Modal */}
      <Suspense fallback={null}>
        <AuthModal 
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          initialView={authView}
        />
      </Suspense>

    </>
  );
};

export default Header;
