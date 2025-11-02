import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Users,
  MapPin,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Star,
  Loader2,
  AlertCircle,
  BarChart3,
  Calendar,
  UserCheck,
} from "lucide-react";
import { experiencesAPI, usersAPI, reviewsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not admin
    if (user?.role !== "admin") {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      return;
    }

    const fetchStats = async () => {
      try {
        const [
          experiencesResponse,
          usersResponse,
          reviewsResponse,
          experienceStatsResponse,
        ] = await Promise.all([
          experiencesAPI.getAll(),
          usersAPI.getAll(),
          reviewsAPI.getAll(),
          experiencesAPI.getExperienceStats(),
        ]);

        const experiences = experiencesResponse.data.data;
        const users = usersResponse.data.data;
        const reviews = reviewsResponse.data.data;
        const experienceStats = experienceStatsResponse.data.data;

        // Calculate additional stats
        const totalRevenue = experiences.reduce(
          (sum: number, experience: any) =>
            sum + experience.price * (experience.ratingsQuantity || 0),
          0
        );
        const averageRating =
          experiences.reduce(
            (sum: number, experience: any) => sum + (experience.ratingsAverage || 0),
            0
          ) / experiences.length;
        const activeUsers = users.filter(
          (user: any) => user.active !== false
        ).length;
        const recentReviews = reviews.slice(0, 5);

        setStats({
          totalExperiences: experiences.length,
          totalUsers: users.length,
          activeUsers,
          totalReviews: reviews.length,
          totalRevenue,
          averageRating: averageRating || 0,
          experienceStats,
          recentReviews,
          experiences: experiences.slice(0, 5), // Recent experiences
        });
      } catch (err: any) {
        console.error("Failed to fetch stats:", err);
        setError("Failed to load dashboard statistics");
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">Loading dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <Card className="border-2 border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-6 h-6" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        {/* Header */}
        <section className="relative bg-gradient-to-br from-primary via-primary-light to-earth py-24 text-primary-foreground">
          <div className="absolute inset-0 pattern-ethiopian opacity-10" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 flex items-center gap-4">
                <BarChart3 className="w-12 h-12" />
                Admin Dashboard
              </h1>
              <p className="text-lg text-primary-foreground/90">
                Welcome back, {user?.name}! Here's an overview of your
                platform's performance.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {/* Total Experiences */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-2 hover:border-primary/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Experiences
                        </p>
                        <p className="text-3xl font-bold text-primary">
                          {stats?.totalExperiences || 0}
                        </p>
                      </div>
                      <MapPin className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Total Users */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-2 hover:border-primary/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Users
                        </p>
                        <p className="text-3xl font-bold text-primary">
                          {stats?.totalUsers || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stats?.activeUsers || 0} active
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Total Reviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-2 hover:border-primary/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Reviews
                        </p>
                        <p className="text-3xl font-bold text-primary">
                          {stats?.totalReviews || 0}
                        </p>
                      </div>
                      <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Average Rating */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-2 hover:border-primary/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Avg Rating
                        </p>
                        <p className="text-3xl font-bold text-primary">
                          {stats?.averageRating?.toFixed(1) || "0.0"}
                        </p>
                      </div>
                      <Star className="w-8 h-8 text-primary fill-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Experience Management Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Button
                      variant="hero"
                      size="lg"
                      onClick={() => navigate("/admin/experiences")}
                      className="w-full"
                    >
                      Manage Experiences
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/admin/users")}
                      className="w-full"
                    >
                      Manage Users
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/admin/hosts")}
                      className="w-full"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Hosts
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/admin/host-applications")}
                      className="w-full"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Host Applications
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/my-reviews")}
                      className="w-full"
                    >
                      View All Reviews
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Experiences and Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Experiences */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Recent Experiences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.experiences?.map((experience: any) => (
                        <div
                          key={experience.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-semibold">{experience.title}</p>
                            <p className="text-sm text-muted-foreground">
                              ETB {experience.price}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-secondary fill-secondary" />
                            <span className="text-sm">
                              {experience.ratingsAverage?.toFixed(1) || "0.0"}
                            </span>
                          </div>
                        </div>
                      )) || (
                        <p className="text-muted-foreground text-center py-4">
                          No experiences available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Reviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Recent Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.recentReviews?.map((review: any) => (
                        <div key={review.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">
                              {review.user?.name || "Anonymous"}
                            </p>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-secondary fill-secondary" />
                              <span className="text-sm">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {review.review}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {review.tour?.name || "Tour"}
                          </p>
                        </div>
                      )) || (
                        <p className="text-muted-foreground text-center py-4">
                          No reviews available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
