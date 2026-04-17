import React from "react";
import { m, AnimatePresence } from "framer-motion";
import { Search, X, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/Image";
import type { ShopifyProduct } from "@/lib/shopifyAdmin";

interface SearchBarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  isSearching: boolean;
  searchResults: ShopifyProduct[];
  onResultClick: (handle: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  isOpen,
  onOpenChange,
  searchQuery,
  onSearchQueryChange,
  isSearching,
  searchResults,
  onResultClick,
}) => {
  return (
    <div className="relative flex items-center">
      <AnimatePresence>
        {isOpen && (
          <m.div
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
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full bg-[#F2EDE4]/50 border border-[#F2EDE4] rounded-full px-4 py-1.5 text-sm font-sans-clean outline-none focus:border-[#5A7A5C] transition-colors"
            />
          </m.div>
        )}
      </AnimatePresence>
      
      <button
        onClick={() => {
          onOpenChange(!isOpen);
          if (isOpen) onSearchQueryChange("");
        }}
        className={`p-2 transition-colors duration-300 ${isOpen ? 'text-[#5A7A5C]' : 'text-foreground/70 hover:text-primary'}`}
        aria-label={isOpen ? "Close search" : "Open search"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
      </button>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && searchQuery.trim().length > 0 && (
          <m.div
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
                      onClick={() => onResultClick(product.node.handle)}
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
                      onOpenChange(false);
                      onSearchQueryChange("");
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
                    onClick={() => onSearchQueryChange("")}
                    className="mt-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7A5C] hover:bg-[#5A7A5C]/5 border border-[#5A7A5C]/20 rounded-full transition-all"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
