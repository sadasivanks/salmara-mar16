import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
  quality?: number;
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

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setLoaded(true);
    if (onLoad) (onLoad as any)(event);
  };

  return (
    <div className={cn("relative overflow-hidden", fill ? "absolute inset-0" : "inline-block", className)}>
      {!loaded && <Skeleton className="absolute inset-0 z-10 bg-muted/20" />}
      <img
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={props.sizes || (fill ? "100vw" : undefined)}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async" // Added decoding="async"
        onLoad={handleLoad}
        className={cn(
          "transition-opacity duration-500",
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
          fill ? "absolute inset-0 w-full h-full object-cover" : "max-w-full h-auto block"
        )}
        {...props}
      />
    </div>
  );
};

export { Image };
