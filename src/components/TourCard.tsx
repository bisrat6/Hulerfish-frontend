import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { API_ORIGIN, bookingsAPI } from "@/lib/api";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TourCardProps {
  tour: {
    _id?: string;
    id?: string | number;
    title: string;
    duration: string;
    maxGuests: number;
    ratingsAverage: number;
    ratingsQuantity: number;
    price: number;
    summary: string;
    imageCover: string;
  };
}

const TourCard = ({ tour }: TourCardProps) => {
  const [available, setAvailable] = useState<number | null>(null);
  useEffect(() => {
    const load = async () => {
      try {
        const resp = await bookingsAPI.getAvailability(String(tour._id ?? tour.id));
        const data = resp.data || resp;
        const a = data.data || data;
        setAvailable(typeof a.available === 'number' ? a.available : null);
      } catch {
        setAvailable(null);
      }
    };
    load();
  }, [tour._id, tour.id]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/experiences/${tour._id ?? tour.id}`}>
        <Card className="group overflow-hidden cursor-pointer hover-lift shadow-sm hover:shadow-md transition-all duration-300 border border-border/50 hover:border-primary/30">
          {/* Experience Image */}
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <img
              src={
                tour.imageCover && String(tour.imageCover).startsWith("/")
                  ? `${API_ORIGIN}${tour.imageCover}`
                  : tour.imageCover ||
                    `https://placehold.co/600x400/2d5a3d/ffd700?text=${encodeURIComponent(
                      tour.title
                    )}`
              }
              alt={tour.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {available !== null && (
              <div className="absolute top-2 right-2 z-20">
                {available < 1 ? (
                  <Badge variant="destructive" className="text-xs">Sold out</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs bg-background/90 backdrop-blur-sm">
                    {available} left
                  </Badge>
                )}
              </div>
            )}
          </div>

          <CardContent className="p-4">
            {/* Title and Rating */}
            <div className="mb-2">
              <h3 className="font-semibold text-base text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {tour.title}
              </h3>
              <div className="flex items-center gap-1.5 text-sm">
                <Star className="w-3.5 h-3.5 text-secondary fill-secondary flex-shrink-0" />
                <span className="font-medium text-foreground">
                  {tour.ratingsAverage.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({tour.ratingsQuantity})
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground text-xs">
                  {tour.duration}
                </span>
              </div>
            </div>

            {/* Summary */}
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3 leading-relaxed">
              {tour.summary}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-semibold text-foreground">
                ETB {tour.price}
              </span>
              <span className="text-xs text-muted-foreground">/guest</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default TourCard;
