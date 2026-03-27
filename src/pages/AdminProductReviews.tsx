import React, { useEffect, useState, useMemo } from "react";
import { Star, Trash2, Search, Filter, RefreshCw, Package, ChevronDown, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { fetchAllProductReviewsViaAdmin, deleteProductReviewViaAdmin } from "@/lib/shopifyAdmin";

interface Review {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  customer_id?: string;
  customer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

interface DeleteConfirm {
  reviewId: string;
  productId: string;
  customerName: string;
}

const StarDisplay = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        style={{ width: size, height: size }}
        className={star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-[#1A2E35]/10 text-[#1A2E35]/10"}
      />
    ))}
  </div>
);

const AdminProductReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchAllProductReviewsViaAdmin();
      setReviews(data);
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
      toast.error("Failed to load reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const uniqueProducts = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; image: string }>();
    reviews.forEach((r) => {
      if (!seen.has(r.product_id)) {
        seen.set(r.product_id, { id: r.product_id, name: r.product_name, image: r.product_image });
      }
    });
    return Array.from(seen.values());
  }, [reviews]);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const matchProduct = selectedProductId ? r.product_id === selectedProductId : true;
      const matchRating = ratingFilter !== null ? r.rating === ratingFilter : true;
      const matchSearch = search
        ? r.product_name.toLowerCase().includes(search.toLowerCase()) ||
          r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
          r.review_text.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchProduct && matchRating && matchSearch;
    });
  }, [reviews, selectedProductId, ratingFilter, search]);

  const handleDeleteClick = (review: Review) => {
    setDeleteConfirm({
      reviewId: review.id,
      productId: review.product_id,
      customerName: review.customer_name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteProductReviewViaAdmin(deleteConfirm.productId, deleteConfirm.reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== deleteConfirm.reviewId));
      toast.success("Review deleted successfully.");
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete review.");
    } finally {
      setDeleting(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl text-[#1A2E35] tracking-tight">Product Reviews</h1>
            <p className="text-[#1A2E35]/50 text-sm font-sans-clean mt-1 uppercase tracking-widest">
              Manage all customer reviews
            </p>
          </div>
          <button
            onClick={fetchReviews}
            className="flex items-center gap-2 px-4 py-2 bg-[#5A7A5C] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#4a6a4c] transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Total Reviews", value: reviews.length },
            { label: "Products Reviewed", value: uniqueProducts.length },
            { label: "Avg. Rating", value: avgRating },
            { label: "Showing Now", value: filtered.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#F2EDE4] p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#1A2E35]/40 font-bold">{label}</p>
              <p className="text-2xl font-display text-[#1A2E35] mt-1">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl border border-[#F2EDE4] p-5 mb-6 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1A2E35]/30" />
          <input
            type="text"
            placeholder="Search product, customer, or review…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#FDFBF7] border border-[#F2EDE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A7A5C]/20 text-[#1A2E35] placeholder:text-[#1A2E35]/30"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A2E35]/30 hover:text-[#1A2E35]">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Rating Filter */}
        <div className="relative">
          <select
            value={ratingFilter ?? ""}
            onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
            className="appearance-none pl-3 pr-8 py-2.5 text-xs font-bold uppercase tracking-widest bg-[#FDFBF7] border border-[#F2EDE4] rounded-xl text-[#1A2E35] focus:outline-none focus:ring-2 focus:ring-[#5A7A5C]/20"
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Star
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#1A2E35]/30 pointer-events-none" />
        </div>

        {/* Active Filters */}
        {(selectedProductId || ratingFilter !== null || search) && (
          <button
            onClick={() => {
              setSelectedProductId(null);
              setRatingFilter(null);
              setSearch("");
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-red-500 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Product Filter Pills */}
      {uniqueProducts.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setSelectedProductId(null)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all ${
              !selectedProductId
                ? "bg-[#1A2E35] text-white border-[#1A2E35]"
                : "bg-white text-[#1A2E35]/60 border-[#F2EDE4] hover:border-[#1A2E35]/20"
            }`}
          >
            All Products
          </button>
          {uniqueProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProductId(selectedProductId === p.id ? null : p.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all ${
                selectedProductId === p.id
                  ? "bg-[#5A7A5C] text-white border-[#5A7A5C]"
                  : "bg-white text-[#1A2E35]/60 border-[#F2EDE4] hover:border-[#5A7A5C]/30"
              }`}
            >
              {p.image && (
                <img src={p.image} alt={p.name} className="h-4 w-4 rounded-full object-cover" />
              )}
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#F2EDE4] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-10 w-10 border-4 border-[#5A7A5C]/20 border-t-[#5A7A5C] rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-[#1A2E35]/40 font-bold">
              Fetching reviews from Shopify…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="h-14 w-14 rounded-full bg-[#F2EDE4] flex items-center justify-center">
              <Package className="h-7 w-7 text-[#1A2E35]/30" />
            </div>
            <p className="text-sm font-bold text-[#1A2E35]/60 uppercase tracking-widest">No reviews available</p>
            <p className="text-xs text-[#1A2E35]/30">
              {reviews.length > 0
                ? "No reviews match the current filters."
                : "No customer reviews have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-[#FDFBF7]/50 border-b border-[#F2EDE4]">
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 text-left">Product</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 text-left">Customer</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 text-left">Rating</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 text-left">Review</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 text-left">Date</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EDE4]">
                {filtered.map((review) => (
                  <tr key={review.id} className="hover:bg-[#FDFBF7]/70 transition-colors group">
                    {/* Product */}
                    <td className="px-6 py-5">
                      <button
                        onClick={() => setSelectedProductId(
                          selectedProductId === review.product_id ? null : review.product_id
                        )}
                        className="flex items-center gap-3 text-left group/prod"
                      >
                        {review.product_image ? (
                          <img
                            src={review.product_image}
                            alt={review.product_name}
                            className="h-10 w-10 rounded-xl object-cover border border-[#F2EDE4] group-hover/prod:border-[#5A7A5C]/30 transition-colors flex-shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-[#F2EDE4] flex items-center justify-center flex-shrink-0">
                            <Package className="h-5 w-5 text-[#1A2E35]/20" />
                          </div>
                        )}
                        <span className="text-xs font-bold text-[#1A2E35] group-hover/prod:text-[#5A7A5C] transition-colors line-clamp-2 max-w-[150px]">
                          {review.product_name}
                        </span>
                      </button>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-5">
                      <div className="h-8 w-8 rounded-full bg-[#5A7A5C]/10 flex items-center justify-center mb-1">
                        <span className="text-xs font-bold text-[#5A7A5C] uppercase">
                          {review.customer_name?.[0] || "?"}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#1A2E35]">{review.customer_name}</p>
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-5">
                      <StarDisplay rating={review.rating} />
                      <p className="text-[10px] text-[#1A2E35]/40 mt-1 font-bold">{review.rating}.0 / 5</p>
                    </td>

                    {/* Review Text */}
                    <td className="px-6 py-5 max-w-[260px]">
                      <p className="text-sm text-[#1A2E35]/70 line-clamp-3 leading-relaxed">
                        {review.review_text || <span className="italic text-[#1A2E35]/30">No review text</span>}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-5">
                      <p className="text-xs text-[#1A2E35]/50 font-bold">
                        {new Date(review.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[10px] text-[#1A2E35]/30 mt-0.5">
                        {new Date(review.created_at).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => handleDeleteClick(review)}
                        className="inline-flex items-center justify-center p-2 text-red-400 bg-red-50 border border-red-100 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                      title="Delete review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-[#F2EDE4] bg-[#FDFBF7]/50 text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#1A2E35]/30 font-bold">
              Showing {filtered.length} of {reviews.length} reviews
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#F2EDE4] shadow-2xl p-8 max-w-md w-full">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-14 w-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-red-400" />
              </div>
              <div>
                <h2 className="font-display text-xl text-[#1A2E35]">Delete Review?</h2>
                <p className="text-sm text-[#1A2E35]/60 mt-2 leading-relaxed">
                  You are about to permanently delete the review from{" "}
                  <span className="font-bold text-[#1A2E35]">{deleteConfirm.customerName}</span>.
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="flex-1 py-3 text-sm font-bold uppercase tracking-widest text-[#1A2E35] bg-[#F2EDE4] rounded-2xl hover:bg-[#E8E2D9] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 py-3 text-sm font-bold uppercase tracking-widest text-white bg-red-500 rounded-2xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductReviews;
