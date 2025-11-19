import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero.jpg" 
          alt="Ethiopian Cultural Experience" 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to other common hero image names
            const target = e.target as HTMLImageElement;
            if (target.src.includes('hero.jpg')) {
              target.src = '/hero-image.jpg';
            } else if (target.src.includes('hero-image.jpg')) {
              target.src = '/hero-section.jpg';
            } else {
              target.src = '/coffee-ceremony.jpg';
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-background/90" />
        
        {/* Ethiopian Pattern Overlay */}
        <div className="absolute inset-0 pattern-ethiopian" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-4 md:mb-6 border border-secondary/30"
          >
            <MapPin className="w-3 h-3 md:w-4 md:h-4 text-secondary" />
            <span className="text-primary-foreground font-medium text-xs md:text-sm">Discover Authentic Home Experiences</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-display text-2xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 md:mb-6 leading-tight"
          >
            Authentic Experiences
            <span className="block text-secondary">In Local Homes</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-sm md:text-lg lg:text-xl text-primary-foreground/90 mb-6 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2"
          >
            Join local hosts in their homes for immersive cultural experiences. From traditional coffee ceremonies 
            to hands-on cooking workshops, discover authentic connections through meaningful interactions.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button asChild variant="hero" className="group h-11 md:h-14 px-6 md:px-10 text-sm md:text-base">
              <Link to="/tours">
                Discover Experiences
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-background/10 backdrop-blur-sm text-primary-foreground border-primary-foreground/30 hover:bg-background/20 h-11 md:h-14 px-6 md:px-10 text-sm md:text-base">
              <Link to="/about">
                Learn More
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-secondary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
