import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCartSync } from "@/hooks/useCartSync";
const Index = lazy(() => import("@/pages/Index"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const AboutUsPage = lazy(() => import("@/pages/AboutUsPage"));
const ClinicsPage = lazy(() => import("@/pages/ClinicsPage"));
const ShopPage = lazy(() => import("@/pages/ShopPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const WishlistPage = lazy(() => import("@/pages/WishlistPage"));
const AffiliatePage = lazy(() => import("@/pages/AffiliatePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminTestimonials = lazy(() => import("@/pages/AdminTestimonials"));
const AdminSubscribers = lazy(() => import("@/pages/AdminSubscribers"));
const AdminLoginPage = lazy(() => import("@/pages/AdminLoginPage"));

import ScrollToTop from "@/components/ScrollToTop";
import AdminLayout from "@/components/AdminLayout";
import { getStoredAdminSession } from "@/lib/shopifyAdmin";
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const admin = getStoredAdminSession();
  if (!admin) {
    return <Navigate to="/admin-login" replace />;
  }
  return <>{children}</>;
};

const queryClient = new QueryClient();

const CartSyncProvider = ({ children }: { children: React.ReactNode }) => {
  useCartSync();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <CartSyncProvider>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen bg-[#FDFBF7]">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-10 w-10 border-4 border-[#5A7A5C]/20 border-t-[#5A7A5C] rounded-full animate-spin" />
                  <p className="text-[#5A7A5C] font-display text-sm animate-pulse tracking-widest uppercase font-bold">Salmara Ayurveda</p>
                </div>
              </div>
            }>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/clinics" element={<ClinicsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/product/:handle" element={<ProductDetail />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/affiliate" element={<AffiliatePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />
              {/* Admin Salmara Routes */}
              <Route path="/admin-salmara" element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="subscribers" element={<AdminSubscribers />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </CartSyncProvider>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
