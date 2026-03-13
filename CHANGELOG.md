# Salmara Ayurveda - Changelog

All notable changes to the Salmara Ayurveda project are documented here.

## [Current Version] - 2026-03-13

### Added
- **Shopify Customer Accounts**: Replaced legacy Supabase authentication with native Shopify Storefront API customer accounts.
- **Premium Auth UI**: Implemented a modern, trust-focused login and registration modal in `AuthModal.tsx`.
- **Shopify Profile Sync**: The `Dashboard.tsx` now fetches and updates user profiles (First Name, Last Name, Phone) directly via Shopify.
- **'Buy Now' Direct Checkout**: Added a direct-to-checkout flow on the Product Detail Page and Shop Page, bypassing the local cart for instant purchases.
- **Shopify Environment Variables**: Moved all Shopify configuration (Domain, Token, API Version) to `.env` for easier management and security.
- **Enhanced Shop Filters**: Added dynamic filtering by Category and Product Type to the Shop Page.
- **Improved PDP**: Standardized the Product Detail Page with localized loading states, buy buttons, and trust-focused microcopy.

### Changed
- **Header Navigation**: Updated the Header to monitor Shopify sessions and provide login/logout functionality correctly.
- **API Architecture**: Centralized all Shopify logic in `src/lib/shopify.ts`, including error handling for permission-related (ACCESS_DENIED) issues.
- **Shop Grid**: Optimized the empty state messaging and "Clear Filters" logic for a better user experience.

### Fixed
- **Shopify API Permissions**: Added explicit guidance for `unauthenticated_write_customers` scope errors.
- **Dashboard Profile Saving**: Fixed an issue where profile changes weren't syncing with the authentication provider.
- **Local Storage Sessions**: Standardized the `salmara_session` object to include Shopify access tokens and expiry dates.
