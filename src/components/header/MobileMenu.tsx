import React from "react";
import { Link } from "react-router-dom";
import { m } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Leaf, ChevronRight, UserCircle, X } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  navItems: Array<{ label: string; href: string; external?: boolean }>;
  shopByConcern: string[];
  user: any;
  onLogout: () => void;
  onAuthClick: () => void;
  locationPathname: string;
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement> | null, href: string) => void;
  searchOpen: boolean;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onOpenChange,
  navItems,
  shopByConcern,
  user,
  onLogout,
  onAuthClick,
  locationPathname,
  scrollToSection,
  searchOpen,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
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
              <m.div
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
                        onOpenChange(false);
                      }
                    }}
                    className={`flex items-center justify-between px-4 py-3.5 text-base font-sans-clean rounded-2xl transition-all group ${
                      locationPathname === item.href
                        ? "text-[#5A7A5C] bg-white font-bold shadow-sm"
                        : "text-[#1A2E35]/80 hover:text-[#5A7A5C] hover:bg-white"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className={`h-4 w-4 transition-all ${
                      locationPathname === item.href ? "opacity-100" : "opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                    }`} />
                  </Link>
                )}
              </m.div>
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
                  onClick={() => onOpenChange(false)}
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
                onClick={() => onOpenChange(false)}
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
                  onLogout();
                  onOpenChange(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-red-600/60 hover:text-red-600 transition-colors uppercase tracking-[0.3em]"
              >
                <X className="h-3.5 w-3.5" /> Logout Session
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                onOpenChange(false);
                onAuthClick();
              }}
              className="w-full h-14 bg-[#1A2E35] text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#5A7A5C] transition-all shadow-xl shadow-[#1A2E35]/10"
            >
              <UserCircle className="h-5 w-5" /> Login / Register
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
