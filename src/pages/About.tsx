import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Award, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <PageHeader
          title={
            <>
              Connect Through <span className="text-primary">Home Experiences</span>
            </>
          }
          description="We're passionate about creating authentic connections between travelers and local families through immersive cultural experiences in intimate home settings."
        />

        {/* Our Story */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="animate-fade-in">
                <h2 className="font-display text-4xl font-bold text-foreground mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Founded by a team passionate about authentic cultural exchange, 
                    Etxplore was born from a simple mission: to connect travelers with local families 
                    through meaningful home-based experiences.
                  </p>
                  <p>
                    From traditional coffee ceremonies in family living rooms to hands-on cooking workshops 
                    in local kitchens, from art & craft immersion in artisan studios to music & dance 
                    performances in intimate settings, we believe the most authentic cultural connections 
                    happen in the comfort of local homes.
                  </p>
                  <p>
                    With years of local expertise and a deep respect for Ethiopian culture, we carefully 
                    curate experiences that go beyond typical tourism. We partner with local families, 
                    support community-based tourism, and ensure every interaction creates lasting positive 
                    impact for both guests and hosts.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl animate-slide-in">
                <img 
                  src="/collages.jpg" 
                  alt="Ethiopian cultural experiences"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.endsWith('.jpg')) {
                      target.src = '/collages.png';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl font-bold text-foreground mb-4">
                Our Values
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                What drives us to create exceptional travel experiences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Heart,
                  title: "Authentic Connections",
                  description: "We prioritize genuine cultural exchange and meaningful personal interactions",
                  color: "text-accent"
                },
                {
                  icon: Users,
                  title: "Family Partnerships",
                  description: "Working directly with local families to create mutually beneficial experiences",
                  color: "text-primary"
                },
                {
                  icon: Award,
                  title: "Expert Hosts",
                  description: "Knowledgeable, passionate local hosts who share their culture and traditions",
                  color: "text-secondary"
                },
                {
                  icon: Globe,
                  title: "Community Impact",
                  description: "Supporting local families and communities through responsible home-based tourism",
                  color: "text-earth"
                }
              ].map((value, index) => (
                <Card key={index} className="text-center hover-lift border-2 hover:border-primary/20 transition-all">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-full bg-muted/50 mx-auto mb-4 flex items-center justify-center ${value.color}`}>
                      <value.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-3">
                      {value.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-br from-primary via-primary-light to-earth text-primary-foreground border-0 shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 pattern-ethiopian" />
              <CardContent className="p-12 md:p-16 text-center relative z-10">
                <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                  Ready to Connect Through Home Experiences?
                </h2>
                <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                  Join us for authentic cultural exchanges that create meaningful connections and lasting memories.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="hero" size="xl">
                    <Link to="/tours">
                      Browse Experiences
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="xl" className="bg-background/10 backdrop-blur-sm text-primary-foreground border-primary-foreground/30 hover:bg-background/20">
                    <a href="mailto:hello@etxplore.com">
                      Contact Us
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
