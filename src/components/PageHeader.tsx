import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string | ReactNode;
  description?: string;
  className?: string;
}

const PageHeader = ({ title, description, className = "" }: PageHeaderProps) => {
  const isCentered = className.includes("text-center");
  
  return (
    <section className={`relative bg-gradient-to-br from-primary/10 via-primary-light/10 to-earth/10 py-16 md:py-20 border-b border-border/50 ${className}`}>
      {/* Hero-style gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/15 to-background/30" />
      <div className="absolute inset-0 bg-muted/10" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`max-w-3xl ${isCentered ? "mx-auto" : ""}`}
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default PageHeader;

