import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SectionVariant = "default" | "muted" | "contrast" | "gradient";

interface PageSectionProps extends HTMLAttributes<HTMLElement> {
  innerClassName?: string;
  variant?: SectionVariant;
  fullWidth?: boolean;
}

const variantStyles: Record<SectionVariant, string> = {
  default: "",
  muted: "bg-muted/40",
  contrast: "bg-card shadow-soft",
  gradient: "bg-hero-gradient text-primary-foreground",
};

export const PageSection = forwardRef<HTMLElement, PageSectionProps>(
  (
    {
      className,
      innerClassName,
      variant = "default",
      children,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          "relative page-section",
          variantStyles[variant],
          variant === "gradient" && "text-primary-foreground",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "relative z-10",
            !fullWidth && "page-container px-4 sm:px-6",
            fullWidth && "w-full",
            innerClassName
          )}
        >
          {children}
        </div>
        {variant === "gradient" && (
          <div className="pointer-events-none absolute inset-0 opacity-10 pattern-ethiopian" />
        )}
      </section>
    );
  }
);

PageSection.displayName = "PageSection";


