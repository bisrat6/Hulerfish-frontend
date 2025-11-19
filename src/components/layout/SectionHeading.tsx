import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  ...props
}: SectionHeadingProps) => {
  return (
    <div
      className={cn(
        "max-w-3xl space-y-4",
        align === "center" ? "text-center mx-auto" : "",
        className
      )}
      {...props}
    >
      {eyebrow && (
        <p className="text-eyebrow uppercase tracking-[0.3em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
        {title}
      </h2>
      {description && (
        <p className="text-muted text-muted-foreground">{description}</p>
      )}
      {align === "center" && <div className="section-divider" />}
    </div>
  );
};


