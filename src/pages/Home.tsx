import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedSection from "@/components/FeaturedSection";
import TourCard from "@/components/TourCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, UserCheck, Home as HomeIcon, Coffee } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import toursData from "@/data/tours-simple.json";

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Get first 3 tours for featured section
  const featuredTours = toursData.slice(0, 3);
  
  // Show "Become a Host" section only if user is logged in and not already a host
  const showBecomeHost = isAuthenticated && 
    (user as any)?.hostStatus !== "approved" && 
    (user as any)?.hostStatus !== "pending";

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <Hero />

      <FeaturedSection />

      {/* Compact CTA to view all tours */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0 grid grid-cols-2">
          <div className="relative">
            <img
              src="/collage1.jpg"
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if .jpg doesn't exist, try .png
                const target = e.target as HTMLImageElement;
                if (target.src.endsWith('.jpg')) {
                  target.src = '/collage1.png';
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent" />
          </div>
          <div className="relative">
            <img
              src="/collage2.jpg"
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if .jpg doesn't exist, try .png
                const target = e.target as HTMLImageElement;
                if (target.src.endsWith('.jpg')) {
                  target.src = '/collage2.png';
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-primary/60 to-transparent" />
          </div>
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 container mx-auto px-4 text-center mt-10">
          <h3 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-2 ">
            Looking for authentic experiences?
          </h3>
          <p className="text-lg text-primary-foreground mb-3 max-w-2xl mx-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] [text-shadow:_2px_2px_4px_rgb(0_0_0_/_90%)] font-medium">
            Discover meaningful cultural connections through immersive home experiences
          </p>
          <div className="flex justify-center">
            <Button asChild variant="hero" size="lg" className="shadow-lg">
              <Link to="/tours">
                View All Experiences
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Become a Host Section */}
      {showBecomeHost && (
        <section className="py-24 bg-gradient-to-br from-primary/5 via-primary-light/5 to-earth/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                    Share Your <span className="text-primary">Ethiopian Culture</span>
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Become a host and share authentic experiences with travelers from around the world. 
                    Showcase your home, traditions, and skills while earning income.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/5 p-2.5 rounded-lg border border-primary/10 flex-shrink-0">
                        <HomeIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 text-sm">Host from Your Home</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Share your space and create memorable experiences
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/5 p-2.5 rounded-lg border border-primary/10 flex-shrink-0">
                        <Coffee className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 text-sm">Share Your Skills</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Teach cooking, crafts, ceremonies, or cultural traditions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/5 p-2.5 rounded-lg border border-primary/10 flex-shrink-0">
                        <UserCheck className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 text-sm">Earn Income</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Set your own prices and manage your availability
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="hero" size="lg" className="w-full md:w-auto">
                    <Link to="/host-application">
                      <UserCheck className="w-5 h-5 mr-2" />
                      Become a Host
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
                <div className="relative">
                  <div className="aspect-square rounded-2xl overflow-hidden border border-primary/10 shadow-lg">
                    <img
                      src="/localhome.jpg"
                      alt="Local home experience"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if .jpg doesn't exist, try .png
                        const target = e.target as HTMLImageElement;
                        if (target.src.endsWith('.jpg')) {
                          target.src = '/localhome.png';
                        }
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-card p-5 rounded-xl shadow-md border border-primary/20 backdrop-blur-sm">
                    <p className="text-2xl font-bold text-primary">Join 100+</p>
                    <p className="text-sm text-muted-foreground">Ethiopian Hosts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Guest <span className="text-primary">Stories</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear what our guests have to say about their authentic home experiences 
              and meaningful cultural connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Johnson",
                location: "United States",
                text: "The coffee ceremony experience was absolutely magical. Our host welcomed us into her home and shared stories that made us feel like family. Truly authentic!",
                rating: 5,
                initials: "SJ",
              },
              {
                name: "James Chen",
                location: "Singapore",
                text: "The cooking workshop was incredible! Learning traditional recipes directly from a local chef in their kitchen was an experience I'll never forget.",
                rating: 5,
                initials: "JC",
              },
              {
                name: "Emma Wilson",
                location: "United Kingdom",
                text: "The art & craft immersion was perfect! Creating pottery with a local artisan in their studio felt so personal and meaningful. Highly recommend!",
                rating: 5,
                initials: "EW",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-2xl shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-5">
                  <Avatar className="w-10 h-10 ring-2 ring-primary/10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-secondary text-base">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
