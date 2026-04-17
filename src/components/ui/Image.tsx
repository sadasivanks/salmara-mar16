import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
  quality?: number;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  displayWidth?: number; // Hint: actual rendered width in pixels
}

const optimizeShopifyUrl = (url: string, width?: number | string, quality: number = 80) => {
  if (!url || !url.includes('cdn.shopify.com')) return url;
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('format', 'webp');
    urlObj.searchParams.set('quality', quality.toString());
    if (width) urlObj.searchParams.set('width', width.toString());
    return urlObj.toString();
  } catch (e) {
    return url;
  }
};

const Image = ({ 
  src, 
  alt, 
  className, 
  fill, 
  quality = 80,
  width,
  height,
  loading = "lazy",
  onLoad,
  objectFit = "cover",
  displayWidth,
  sizes: sizesProp,
  ...props 
}: ImageProps) => {
  const [loaded, setLoaded] = useState(false);
  
  const optimizedSrc = src ? optimizeShopifyUrl(src, width, quality) : src;
  
  // Generate srcset for common widths if it's a Shopify URL
  const srcSet = src?.includes('cdn.shopify.com') 
    ? [375, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]
        .map(w => `${optimizeShopifyUrl(src, w, quality)} ${w}w`)
        .join(', ')
    : undefined;

  // Build sizes attribute: use explicit prop, or derive from displayWidth hint, or fallback
  const sizes = sizesProp 
    || (displayWidth ? `${displayWidth}px` : undefined)
    || (fill ? "100vw" : undefined);

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setLoaded(true);
    if (onLoad) (onLoad as any)(event);
  };

  return (
    <div className={cn("relative overflow-hidden shrink-0", fill ? "absolute inset-0" : "inline-block", className)}>
      {!loaded && <Skeleton className="absolute inset-0 z-10 bg-muted/20" />}
      <img
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        onLoad={handleLoad}
        className={cn(
          "transition-opacity duration-500 w-full h-full",
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
          fill ? "absolute inset-0" : "block",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          objectFit === "none" && "object-none",
          objectFit === "scale-down" && "object-scale-down"
        )}
        {...props}
      />
    </div>
  );
};

export { Image };
