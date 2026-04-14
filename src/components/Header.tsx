import { useState, useEffect, lazy, Suspense } from "react";
import { User, Leaf, UserCircle, Heart, ChevronRight } from "lucide-react";
const CartDrawer = lazy(() => import("@/components/CartDrawer").then(m => ({ default: m.CartDrawer })));
const AuthModal = lazy(() => import("@/components/AuthModal").then(m => ({ default: m.AuthModal })));
const SearchBar = lazy(() => import("./header/SearchBar").then(m => ({ default: m.SearchBar })));
const MobileMenu = lazy(() => import("./header/MobileMenu").then(m => ({ default: m.MobileMenu })));

import { m } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProductsViaAdmin, getStoredSession, logoutViaAdmin, type ShopifyProduct } from "@/lib/shopifyAdmin";
import { siteConfig } from "@/config/site.config";

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
        syncWithShopify();
      } else {
        setUser(null);
      }
    };

    checkSession();
    window.addEventListener('auth-status-change', checkSession);
    window.addEventListener('app-restored-from-cache', checkSession);

    return () => {
      window.removeEventListener('auth-status-change', checkSession);
      window.removeEventListener('app-restored-from-cache', checkSession);
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

  useEffect(() => {
    if (searchOpen && allProducts.length === 0) {
      fetchProductsViaAdmin(50).then(setAllProducts).catch(console.error);
    }
  }, [searchOpen, allProducts]);

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
    }).slice(0, 5);

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
        <div className="w-full px-4 md:px-8 flex items-center justify-between h-16 lg:h-20">
          {/* Logo & Tagline */}
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
                width="56"
                height="56"
                fetchPriority="high"
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
            {(searchOpen || searchQuery) && (
              <Suspense fallback={<div className="h-9 w-9" />}>
                <SearchBar 
                  isOpen={searchOpen}
                  onOpenChange={setSearchOpen}
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  isSearching={isSearching}
                  searchResults={searchResults}
                  onResultClick={handleResultClick}
                />
              </Suspense>
            )}

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

            {mobileOpen && (
              <Suspense fallback={<div className="h-9 w-9" />}>
                <MobileMenu 
                  isOpen={mobileOpen}
                  onOpenChange={setMobileOpen}
                  navItems={navItems}
                  shopByConcern={shopByConcern}
                  user={user}
                  onLogout={handleLogout}
                  onAuthClick={() => {
                    setAuthView("login");
                    setAuthOpen(true);
                  }}
                  locationPathname={location.pathname}
                  scrollToSection={scrollToSection}
                  searchOpen={searchOpen}
                />
              </Suspense>
            )}
          </div>
        </div>
      </header>

      {authOpen && (
        <Suspense fallback={null}>
          <AuthModal 
            isOpen={authOpen}
            onClose={() => setAuthOpen(false)}
            initialView={authView}
          />
        </Suspense>
      )}
    </>
  );
};

export default Header;
