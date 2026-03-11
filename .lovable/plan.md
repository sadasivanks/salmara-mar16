

# Shopify eCommerce Integration Plan

Your Shopify store is live (store: `salveo-aya-forge-rt8fh`, 1 product exists). Here's the plan to integrate it with your Salmara Herbals site.

## What will be built

### 1. Shopify API Layer (`src/lib/shopify.ts`)
- Storefront API helper with the store domain and token
- GraphQL queries for fetching products and single product by handle
- Cart mutations (create, add line, update line, remove line, query)
- All checkout URLs formatted with `channel=online_store` and opened in new tab

### 2. Cart State Management (`src/stores/cartStore.ts`)
- Install **zustand** for persistent cart state
- Full cart store: addItem, updateQuantity, removeItem, clearCart, syncCart
- Persisted to localStorage so cart survives page refresh
- Real-time sync with Shopify Storefront API cart

### 3. Cart Sync Hook (`src/hooks/useCartSync.ts`)
- Syncs cart on page load and when user returns from checkout tab
- Used in App.tsx to auto-clear completed orders

### 4. Updated FeaturedProducts Section
- Replace the current 6 hardcoded mock products with **real Shopify products** fetched via Storefront API
- Display product image, title, description, price from Shopify
- "Add to Cart" button wired to the Zustand cart store
- Product cards link to `/product/[handle]` detail page
- Show "No products found" with a message if no products exist

### 5. Product Detail Page (`src/pages/ProductDetail.tsx`)
- Route: `/product/:handle`
- Fetches single product by handle from Storefront API
- Shows images, title, description, price, variant selection, Add to Cart
- No fake reviews

### 6. Cart Drawer Component (`src/components/CartDrawer.tsx`)
- Slide-out sheet showing cart items with quantity controls
- "Checkout with Shopify" button that opens Storefront API checkout URL in new tab
- Replaces the static cart icon badge in the Header

### 7. Header Update
- Replace static cart icon with the CartDrawer component showing live item count

### 8. App.tsx Update
- Add `/product/:handle` route
- Add `useCartSync` hook

## Technical details

- **Store domain**: `salveo-aya-forge-rt8fh.myshopify.com`
- **Storefront token**: `90998efe73886b30801f7074707bc883`
- **API version**: `2025-07`
- **New dependency**: `zustand` (for cart state)
- **No mock products** — all products come from Shopify API
- **Checkout**: Storefront API cart → checkoutUrl with `channel=online_store` → `window.open(url, '_blank')`

