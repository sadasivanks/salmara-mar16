import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const SEO = ({ 
  title, 
  description = "Authentic Ayurvedic formulations rooted in tradition. Salmara Ayurveda offers clinically-backed herbal remedies for holistic wellness.",
  image = "/images/brand/salamara_icon.jpg", 
  url,
  type = "website",
  keywords = "Ayurveda, herbal remedies, natural wellness, Salmara, clinics, holistic healing, certified ayurveda",
  jsonLd
}: SEOProps) => {
  const baseUrl = "https://salmara.com";
  const siteTitle = "Salmara Ayurveda";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : baseUrl);
  const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return (
    <Helmet>
      {/* Performance Optimization: Preconnect to Font Servers */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Canonical Link */}
      <link rel="canonical" href={currentUrl} />

      {/* Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
