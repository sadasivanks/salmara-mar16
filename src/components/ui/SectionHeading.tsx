import { m } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: React.ReactNode;
  eyebrow?: string;
  description?: React.ReactNode;
  centered?: boolean;
  className?: string;
  titleClassName?: string;
  eyebrowClassName?: string;
  descriptionClassName?: string;
  animate?: boolean;
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const SectionHeading = ({
  title,
  eyebrow,
  description,
  centered = true,
  className,
  titleClassName,
  eyebrowClassName,
  descriptionClassName,
  animate = true,
  level = "h2",
}: SectionHeadingProps) => {
  const TitleTag = level;

  const content = (
    <div className={cn(
      "mb-2 md:mb-4 lg:mb-6",
      centered && "text-center mx-auto",
      className
    )}>
      {eyebrow && (
        <p className={cn(
          "text-[#C5A059] font-sans-clean text-xs sm:text-sm uppercase tracking-[0.3em] font-bold mb-2",
          eyebrowClassName
        )}>
          {eyebrow}
        </p>
      )}
      <TitleTag className={cn(
        "text-3xl md:text-4xl lg:text-5xl font-display font-medium text-[#1A2E35] leading-tight",
        description ? "mb-4" : "",
        titleClassName
      )}>
        {title}
      </TitleTag>
      {description && (
        <p className={cn(
          "text-[#1A2E35]/40 text-sm md:text-md lg:text-lg font-sans-clean max-w-2xl",
          centered && "mx-auto",
          descriptionClassName
        )}>
          {description}
        </p>
      )}
    </div>
  );

  if (!animate) return content;

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      {content}
    </m.div>
  );
};
