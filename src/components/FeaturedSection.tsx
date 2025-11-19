import { Card, CardContent } from '@/components/ui/card';
import { Mountain, Coffee, Flame, Palette, Music } from 'lucide-react';
import { API_ORIGIN } from '@/lib/api';

const features = [
  {
    icon: Coffee,
    title: 'Coffee Ceremonies',
    description:
      'Join traditional coffee ceremonies in local homes and learn the art of Ethiopian coffee culture',
    image: `${API_ORIGIN}/img/tours/coffee1.jpg`,
    color: 'text-earth'
  },
  {
    icon: Flame,
    title: 'Cooking Workshops',
    description:
      'Learn authentic recipes and cooking techniques directly from local chefs in their kitchens',
    image: `${API_ORIGIN}/img/tours/injera4cover.jpg`,
    color: 'text-accent'
  },
  {
    icon: Palette,
    title: 'Art & Craft Immersion',
    description:
      'Create pottery, weaving, and traditional crafts with skilled local artisans in their studios',
    image: `${API_ORIGIN}/img/tours/basket1.jpg`,
    color: 'text-primary'
  },
  {
    icon: Music,
    title: 'Music & Dance',
    description:
      'Experience traditional music and dance performances with local families in intimate settings',
    image: `${API_ORIGIN}/img/tours/dance3.jpg`,
    color: 'text-secondary'
  }
];

const FeaturedSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose <span className="text-primary">Home Experiences</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect authentically with local families through immersive cultural
            experiences that create meaningful memories and lasting friendships.
          </p>
        </div>

        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4 md:pb-0 scrollbar-hide md:overflow-x-visible">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group overflow-hidden hover-lift border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 flex-shrink-0 w-[280px] md:w-auto"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
                <div
                  className={`absolute bottom-4 left-4 w-10 h-10 rounded-full bg-background/95 backdrop-blur-sm shadow-sm flex items-center justify-center border border-border/50 ${
                    feature.color
                  }`}
                >
                  <feature.icon className="w-5 h-5" />
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
