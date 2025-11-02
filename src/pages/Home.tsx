import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedSection from "@/components/FeaturedSection";
import TourCard from "@/components/TourCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
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
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-semibold mb-4">Looking for authentic experiences?</h3>
          <div className="flex justify-center">
            <Button asChild variant="adventure" size="lg">
              <Link to="/tours">View All Experiences</Link>
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
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <HomeIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Host from Your Home</h4>
                        <p className="text-sm text-muted-foreground">
                          Share your space and create memorable experiences
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Coffee className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Share Your Skills</h4>
                        <p className="text-sm text-muted-foreground">
                          Teach cooking, crafts, ceremonies, or cultural traditions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <UserCheck className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Earn Income</h4>
                        <p className="text-sm text-muted-foreground">
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
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-earth/20 rounded-2xl flex items-center justify-center">
                    <Coffee className="w-32 h-32 text-primary/40" />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-xl shadow-lg border-2 border-primary/20">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Johnson",
                location: "United States",
                text: "The coffee ceremony experience was absolutely magical. Our host welcomed us into her home and shared stories that made us feel like family. Truly authentic!",
                rating: 5,
              },
              {
                name: "James Chen",
                location: "Singapore",
                text: "The cooking workshop was incredible! Learning traditional recipes directly from a local chef in their kitchen was an experience I'll never forget.",
                rating: 5,
              },
              {
                name: "Emma Wilson",
                location: "United Kingdom",
                text: "The art & craft immersion was perfect! Creating pottery with a local artisan in their studio felt so personal and meaningful. Highly recommend!",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-card p-8 rounded-xl shadow-lg border-2 hover:border-primary/20 transition-all hover-lift"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-secondary text-xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-bold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.location}
                  </p>
                </div>
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
