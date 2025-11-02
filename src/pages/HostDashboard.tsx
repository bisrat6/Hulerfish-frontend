import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  DollarSign,
  Users,
  MapPin,
  Calendar,
  TrendingUp,
  Loader2,
  Eye,
  Edit,
  Plus,
  BarChart3,
  Mail,
  Phone,
} from "lucide-react";
import { experiencesAPI, bookingsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function HostDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [experiences, setExperiences] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    // Redirect if not approved host
    if ((user as any)?.hostStatus !== "approved") {
      navigate("/profile");
      toast({
        title: "Access Denied",
        description: "You must be an approved host to access this page",
        variant: "destructive",
      });
      return;
    }

    fetchData();
  }, [user, navigate, toast]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch host's experiences
      const expResponse = await experiencesAPI.getAll();
      const userId = (user as any)?._id ?? (user as any)?.id;
      const hostExperiences = (expResponse.data.data || []).filter((exp: any) =>
        String(exp.host?._id ?? exp.host) === String(userId)
      );
      setExperiences(hostExperiences);

      // Fetch bookings for host's experiences
      const bookingsResponse = await bookingsAPI.getHostBookings();
      setBookings(bookingsResponse.data || []);
      setTotalEarnings(bookingsResponse.totalEarnings || 0);

    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                Host Dashboard
              </h1>
              <p className="text-lg text-primary-foreground/90">
                Welcome, {user?.name}! Manage your experiences and track your bookings.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Total Experiences */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          My Experiences
                        </p>
                        <p className="text-3xl font-bold text-primary">
                          {experiences.length}
                        </p>
                      </div>
                      <MapPin className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Total Bookings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Bookings
                        </p>
                        <p className="text-3xl font-bold text-primary">
                          {bookings.length}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Total Earnings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Earnings
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          ETB {totalEarnings.toLocaleString()}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="hero"
                      size="lg"
                      onClick={() => navigate("/admin/experiences")}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Experience
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/admin/experiences")}
                      className="w-full"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Manage My Experiences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* My Experiences and Recent Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* My Experiences */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      My Experiences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {experiences.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          No experiences yet. Create your first experience!
                        </p>
                      ) : (
                        experiences.slice(0, 5).map((experience: any) => (
                          <div
                            key={experience._id || experience.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-semibold">{experience.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {experience.location}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-primary">
                                ETB {experience.price}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/experiences/${experience._id || experience.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Bookings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Recent Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bookings.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          No bookings yet
                        </p>
                      ) : (
                        bookings.slice(0, 5).map((booking: any) => (
                          <div
                            key={booking._id || booking.id}
                            className="p-3 border rounded-lg"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-semibold">
                                  {booking.experience?.title || "Experience"}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {booking.user?.name || "Guest"}
                                </p>
                                {booking.user?.email && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Mail className="w-3 h-3" />
                                    {booking.user.email}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <Badge className="bg-green-600">
                                  ETB {booking.price}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(booking.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {bookings.length > 5 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          Showing 5 of {bookings.length} total bookings
                        </p>
                      </div>
                    )}
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
}

