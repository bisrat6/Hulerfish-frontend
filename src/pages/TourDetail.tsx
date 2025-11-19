import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Calendar,
  Users,
  TrendingUp,
  MapPin,
  Star,
  Clock,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Check,
  Plus,
  Minus,
} from "lucide-react";
import { experiencesAPI, reviewsAPI, bookingsAPI, API_ORIGIN } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const TourDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [experience, setExperience] = useState<any | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(
    null
  );
  const [reviews, setReviews] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewLimit, setReviewLimit] = useState(10); // Reduced from 50 to 10 for faster loading
  const [reviewSort, setReviewSort] = useState("-createdAt");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const [numGuests, setNumGuests] = useState<number>(1);
  const [availability, setAvailability] = useState<{available: number; booked: number; maxGuests: number} | null>(null);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [hasBooked, setHasBooked] = useState<boolean>(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchExperience = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const response = await experiencesAPI.getById(id);
          const t = response.data.data;
          setExperience(t);
          setSelectedStartDate(null);
        } catch (err: unknown) {
          console.error("Failed to fetch experience:", err);
          toast({
            title: "Error",
            description: "Failed to load experience from server.",
            variant: "destructive",
          });
          setExperience(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchExperience();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, toast]);

  // Check if current user has a booking for this experience
  useEffect(() => {
    const checkBooking = async () => {
      if (!isAuthenticated || !experience) return setHasBooked(false);
      try {
        const resp = await bookingsAPI.getMyBookings();
        // normalize response to array of bookings
        let bookingsList: any[] = [];
        if (Array.isArray(resp)) bookingsList = resp;
        else if (Array.isArray((resp as any).data))
          bookingsList = (resp as any).data;
        else if (Array.isArray((resp as any).data?.data))
          bookingsList = (resp as any).data.data;

        const experienceId = experience._id ?? experience.id ?? experience;
        const found = bookingsList.find((b: any) => {
          const bExperienceId = b.experience?._id ?? b.experience?.id ?? b.experience;
          return String(bExperienceId) === String(experienceId);
        });
        setHasBooked(!!found);
      } catch (err) {
        // ignore silently
        setHasBooked(false);
      }
    };
    checkBooking();
  }, [experience, isAuthenticated, user]);

  const fetchReviews = async (append = false) => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const response = await reviewsAPI.getReviewsForExperience(id, {
        page: reviewPage,
        limit: reviewLimit,
        sort: reviewSort,
      });
      
      // Store total count if available
      if (response?.results !== undefined) {
        setTotalReviews(response.results);
      } else if (response?.data?.results !== undefined) {
        setTotalReviews(response.data.results);
      }
      
      const newReviews = response.data?.data || response.data || [];
      
      // Append reviews if loading more, otherwise replace
      if (append && reviewPage > 1) {
        setReviews((prev) => [...prev, ...newReviews]);
      } else {
        setReviews(newReviews);
      }

      // Check if current user has already reviewed this experience
      if (user && isAuthenticated) {
        const userReview = newReviews.find((review: any) => {
          // Handle both populated and non-populated user references
          const reviewUserId =
            review.user?._id ?? review.user?.id ?? review.user;
          const currentUserId = (user as any)._id ?? (user as any).id;
          return String(reviewUserId) === String(currentUserId);
        });
        setHasUserReviewed(!!userReview);
      } else {
        setHasUserReviewed(false);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch reviews:", err);
      toast({
        title: "Error",
        description: "Failed to load reviews.",
        variant: "destructive",
      });
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 and fetch when id or filters change
    setReviewPage(1);
    fetchReviews(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reviewLimit, reviewSort]);

  useEffect(() => {
    // Fetch more reviews when page changes (for pagination)
    if (reviewPage > 1) {
      fetchReviews(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewPage]);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!id) return;
      try {
        const resp = await bookingsAPI.getAvailability(id);
        const data = resp.data || resp;
        const a = data.data || data;
        setAvailability(a);
        // Adjust max for selector
        if (a && a.available > 0) {
          setNumGuests((g) => Math.min(g, a.available));
        }
      } catch {
        // ignore
      }
    };
    loadAvailability();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">Loading experience...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Experience Not Found</h1>
            <Button asChild variant="adventure">
              <Link to="/experiences">Back to Experiences</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to write a review",
        variant: "destructive",
      });
      return;
    }

    if (!newReview || newRating === 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in review and rating",
        variant: "destructive",
      });
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewsAPI.createReviewForExperience(id!, {
        review: newReview,
        rating: newRating,
      });
      // Refetch reviews so newly created review is returned in the same format as others
      await fetchReviews();
      setNewReview("");
      setNewRating(0);
      setHasUserReviewed(true);
      setReviewModalOpen(false);
      toast({
        title: "Success",
        description: "Review submitted successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-secondary fill-secondary" : "text-muted"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        {/* Title & Quick Info */}
        <section className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Button
              asChild
              variant="outline"
              size="sm"
            >
              <Link to="/experiences">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Experiences
              </Link>
            </Button>
          </div>
          <div className="bg-gradient-to-br from-background via-background to-primary/10 rounded-lg p-6 shadow-md border">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge
                variant="outline"
                className="bg-background/80 backdrop-blur-sm"
              >
                {experience.duration}
              </Badge>
              <div className="flex items-center gap-1 text-secondary bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-secondary" />
                <span className="font-semibold">{experience.ratingsAverage}</span>
                <span className="text-muted-foreground text-sm">
                  ({experience.ratingsQuantity} reviews)
                </span>
              </div>
              {availability && availability.available === 0 && (
                <Badge variant="destructive">Sold out</Badge>
              )}
              {availability && availability.available > 0 && (
                <Badge variant="secondary">{availability.available} left</Badge>
              )}
            </div>

            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-0">
              {experience.title}
            </h1>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Overview */}
                <div className="animate-fade-in">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Overview
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                    {experience.summary}
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {experience.description}
                  </p>
                </div>

                {/* Quick Facts */}
                <Card className="border-2">
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-6">
                      Quick Facts
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <Clock className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">
                            Duration
                          </p>
                          <p className="text-muted-foreground">
                            {experience.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">
                            Max Guests
                          </p>
                          <p className="text-muted-foreground">
                            Max {experience.maxGuests} guests
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">
                            Location
                          </p>
                          <p className="text-muted-foreground">
                            {experience.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Star className="w-6 h-6 text-secondary fill-secondary mt-1" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">
                            Rating
                          </p>
                          <p className="text-muted-foreground">
                            {experience.ratingsAverage} / 5
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Images Grid */}
                <div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-6">
                    Gallery
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {experience.images?.map((image: string, index: number) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden group"
                      >
                        <img
                          src={
                            image && String(image).startsWith("/")
                              ? `${API_ORIGIN}${image}`
                              : image ||
                                `https://placehold.co/400x400/2d5a3d/ffd700?text=Image+${
                                  index + 1
                                }`
                          }
                          alt={`${experience.title} ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )) || (
                      <div className="col-span-3 text-center py-8 text-muted-foreground">
                        No images available
                      </div>
                    )}
                  </div>
                </div>

                {/* Reviews Section */}
                <div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
                    Reviews {totalReviews > 0 && `(${totalReviews})`}
                  </h3>

                  {/* Rate & Review Button */}
                  {isAuthenticated && !hasUserReviewed && (
                    <div className="mb-6">
                      <Button
                        variant="hero"
                        size="lg"
                        onClick={() => setReviewModalOpen(true)}
                        className="w-full sm:w-auto"
                      >
                        <Star className="w-5 h-5 mr-2" />
                        Rate & Review
                      </Button>
                    </div>
                  )}

                  {/* Already Reviewed Message */}
                  {isAuthenticated && hasUserReviewed && (
                    <Card className="mb-6 border-2 border-secondary/20">
                      <CardContent className="p-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-secondary">
                          <Star className="w-5 h-5 fill-secondary" />
                          <p className="font-medium">
                            You have already reviewed this experience
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Reviews List */}
                  {reviewsLoading && reviews.length === 0 ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : reviews.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">
                          No reviews yet. Be the first to review this experience!
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {reviews.map((review: any) => (
                          <Card
                            key={review._id ?? review.id ?? Math.random()}
                            className="border-2"
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold">
                                    {review.user?.name || "Anonymous"}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    {renderStars(Number(review.rating) || 0)}
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(
                                        String(review.createdAt)
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-muted-foreground">
                                {String(review.review || "")}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {/* Load More Button */}
                      {totalReviews > reviews.length && (
                        <div className="mt-6 text-center">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setReviewPage((prev) => prev + 1)}
                            disabled={reviewsLoading}
                            className="w-full sm:w-auto"
                          >
                            {reviewsLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                Load More ({reviews.length} of {totalReviews})
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 border-2 shadow-xl">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <p className="text-xs md:text-sm text-muted-foreground mb-2">
                        Price per person
                      </p>
                      <p className="text-3xl md:text-5xl font-bold text-primary">
                        ETB {experience.price}
                      </p>
                    </div>

                    <div className="mb-6">
                      <label className="text-sm font-medium mb-3 block">Number of Guests</label>
                      <div className="flex items-center gap-3 mb-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 shrink-0"
                          onClick={() => {
                            const maxAvailable = (availability?.available ?? Number(experience.maxGuests)) || 1;
                            const maxAllowed = Math.min(Number(experience.maxGuests) || 1, maxAvailable);
                            setNumGuests(Math.max(1, numGuests - 1));
                          }}
                          disabled={numGuests <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="flex-1 flex items-center justify-center border border-border rounded-md bg-background/50">
                          <input
                            type="number"
                            min={1}
                            max={Math.max(1, Number(experience.maxGuests) || 1)}
                            value={numGuests}
                            onChange={(e) => {
                              const value = Number(e.target.value) || 1;
                              const maxAvailable = (availability?.available ?? Number(experience.maxGuests)) || 1;
                              const maxAllowed = Math.min(Number(experience.maxGuests) || 1, maxAvailable);
                              setNumGuests(Math.max(1, Math.min(value, maxAllowed)));
                            }}
                            className="w-full h-10 text-center text-lg font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-primary rounded-md bg-transparent"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 shrink-0"
                          onClick={() => {
                            const maxAvailable = (availability?.available ?? Number(experience.maxGuests)) || 1;
                            const maxAllowed = Math.min(Number(experience.maxGuests) || 1, maxAvailable);
                            setNumGuests(Math.min(maxAllowed, numGuests + 1));
                          }}
                          disabled={(() => {
                            const maxAvailable = (availability?.available ?? Number(experience.maxGuests)) || 1;
                            const maxAllowed = Math.min(Number(experience.maxGuests) || 1, maxAvailable);
                            return numGuests >= maxAllowed;
                          })()}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-center text-xs text-muted-foreground mb-2">
                        Max {experience.maxGuests} guests • {availability?.available ?? experience.maxGuests} spots available
                      </div>
                      <div className="text-center text-base font-semibold text-primary">
                        Total: ETB {Number(experience.price) * (numGuests || 1)}
                      </div>
                      {availability && availability.available > 0 && numGuests >= availability.available && (
                        <div className="mt-2 text-center text-xs text-amber-700">
                          Maximum available is {availability.available}.
                        </div>
                      )}
                    </div>

                    {/* Host */}
                    {experience.host && (
                      <div className="mb-6">
                        <h4 className="text-base md:text-lg font-semibold mb-3">
                          Your Host
                        </h4>
                        <div className="flex items-center gap-3">
                          {typeof experience.host === 'object' ? (
                            <>
                              {experience.host.photo ? (
                                <Avatar className="w-12 h-12">
                                  <AvatarImage
                                    src={
                                      String(experience.host.photo).startsWith('/')
                                        ? `${API_ORIGIN}${experience.host.photo}`
                                        : experience.host.photo
                                    }
                                    alt={experience.host.name}
                                  />
                                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                    {(() => {
                                      const name = experience.host.name || experience.host.email || 'Guest';
                                      const parts = name.trim().split(/\s+/);
                                      if (parts.length >= 2) {
                                        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                                      }
                                      return name.substring(0, 2).toUpperCase();
                                    })()}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                  {(() => {
                                    const name = experience.host.name || experience.host.email || 'Guest';
                                    const parts = name.trim().split(/\s+/);
                                    if (parts.length >= 2) {
                                      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                                    }
                                    return name.substring(0, 2).toUpperCase();
                                  })()}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold">{experience.host.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {experience.host.email}
                                </div>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    )}

                    {/* Map */}
                    {experience.startLocation?.coordinates && (
                      <div className="mb-6">
                        <h4 className="text-base md:text-lg font-semibold mb-3">Location</h4>
                        <iframe
                          title="location-map"
                          src={`https://www.google.com/maps?q=${experience.startLocation.coordinates[1]},${experience.startLocation.coordinates[0]}&z=12&output=embed`}
                          width="100%"
                          height="200"
                          style={{ border: 0, borderRadius: '8px' }}
                        />
                      </div>
                    )}

                    {hasBooked ? (
                      <Button
                        variant="secondary"
                        size="xl"
                        className="w-full mb-3"
                        disabled
                      >
                        <Check className="w-4 h-4 mr-2 inline-block" /> Booked
                      </Button>
                    ) : (
                      <Button
                        variant="hero"
                        size="xl"
                        className="w-full mb-3"
                        disabled={((availability?.available ?? 1) < 1) || (numGuests > (availability?.available ?? (Number(experience.maxGuests) || 1)))}
                        onClick={async () => {
                          if (!isAuthenticated) {
                            toast({
                              title: "Login Required",
                              description: "Please login to book this experience",
                              variant: "destructive",
                            });
                            navigate("/login");
                            return;
                          }

                          try {
                            toast({
                              title: "Redirecting to payment...",
                              description:
                                "You will be redirected to complete payment",
                            });
                            const resp = await bookingsAPI.create(id as string, numGuests);
                            const checkoutUrl =
                              resp.checkout_url || resp.data?.checkout_url;
                            if (checkoutUrl) {
                              // redirect browser to checkout
                              // include qty in return so we can show it on MyBookings immediately if needed
                              window.location.href = checkoutUrl;
                            } else {
                              throw new Error(
                                "No checkout URL returned from server"
                              );
                            }
                          } catch (err: any) {
                            console.error("Booking init failed:", err);
                            toast({
                              title: "Error",
                              description:
                                err.response?.data?.message ||
                                err.message ||
                                "Failed to initiate booking",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Join Experience
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        const experienceTitle = experience?.title ? String(experience.title) : "";
                        navigate(
                          `/contact?experience=${id ?? ""}&name=${encodeURIComponent(
                            experienceTitle
                          )}`
                        );
                      }}
                    >
                      Contact Us
                    </Button>

                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <p>Experiences hosted in local homes across Ethiopia</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience and help others discover this amazing adventure
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div>
              <label className="text-sm font-medium mb-3 block">Your Rating</label>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-8 h-8 cursor-pointer transition-all ${
                      i < newRating
                        ? "text-secondary fill-secondary scale-110"
                        : "text-muted hover:text-secondary/50"
                    }`}
                    onClick={() => setNewRating(i + 1)}
                  />
                ))}
              </div>
              {newRating > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {newRating === 1 && "Poor"}
                  {newRating === 2 && "Fair"}
                  {newRating === 3 && "Good"}
                  {newRating === 4 && "Very Good"}
                  {newRating === 5 && "Excellent"}
                </p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Your Review</label>
              <Textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Tell us about your experience... What did you enjoy? What could be improved?"
                className="min-h-[150px]"
                rows={6}
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setReviewModalOpen(false);
                  setNewReview("");
                  setNewRating(0);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={submittingReview || !newReview || newRating === 0}
                variant="hero"
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default TourDetail;
