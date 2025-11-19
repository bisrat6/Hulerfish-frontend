import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Users,
  Loader2,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  Briefcase,
} from "lucide-react";
import { guidesAPI, experiencesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function GuideDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hosts, setHosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hostExperiences, setHostExperiences] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const guideStatus = (user as any)?.guideStatus;
    if (guideStatus !== "approved") {
      navigate("/profile");
      toast({
        title: "Access Denied",
        description: "You must be an approved guide to access this page.",
        variant: "destructive",
      });
      return;
    }

    fetchAssignedHosts();
  }, [user, isAuthenticated, navigate, toast]);

  const fetchAssignedHosts = async () => {
    try {
      setIsLoading(true);
      const guideId = (user as any)?._id || user?.id;
      if (!guideId) {
        toast({
          title: "Error",
          description: "Unable to identify guide",
          variant: "destructive",
        });
        return;
      }

      const response = await guidesAPI.getAssignedHosts(guideId);
      const hostsData = response.data.hosts || [];
      setHosts(hostsData);

      // Fetch experiences for each host
      const experiencesMap: Record<string, any[]> = {};
      for (const host of hostsData) {
        try {
          const hostId = host._id || host.id;
          const expResponse = await experiencesAPI.getAll({ host: hostId });
          experiencesMap[hostId] = expResponse.data.data || [];
        } catch (err) {
          console.error(`Failed to fetch experiences for host ${host._id}:`, err);
          experiencesMap[host._id || host.id] = [];
        }
      }
      setHostExperiences(experiencesMap);
    } catch (err: any) {
      console.error("Failed to fetch assigned hosts:", err);
      toast({
        title: "Error",
        description: "Failed to load assigned hosts",
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
        <PageHeader
          title={
            <>
              <User className="w-10 h-10 inline-block mr-3 text-primary" />
              Guide Dashboard
            </>
          }
          description="View and manage your assigned hosts"
        />

        {/* Hosts List */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {hosts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Assigned Hosts</h3>
                  <p className="text-muted-foreground">
                    You don't have any hosts assigned to you yet. Hosts will appear here once they are assigned by an admin.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2">Assigned Hosts ({hosts.length})</h2>
                  <p className="text-muted-foreground">
                    Contact information and details for all hosts assigned to you
                  </p>
                </div>

                {hosts.map((host) => {
                  const hostId = host._id || host.id;
                  const experiences = hostExperiences[hostId] || [];
                  const personalInfo =
                    host.hostApplicationData?.personalInfo ||
                    host.hostApplicationData ||
                    {};
                  const phoneNumber =
                    personalInfo.phoneNumber ||
                    host.hostApplicationData?.phoneNumber ||
                    host.phoneNumber;
                  const email =
                    personalInfo.email ||
                    host.hostApplicationData?.email ||
                    host.email;
                  const cityRegion =
                    personalInfo.cityRegion ||
                    host.hostApplicationData?.cityRegion;
                  const fullAddress =
                    personalInfo.fullAddress ||
                    host.hostApplicationData?.fullAddress;
                  const languages =
                    personalInfo.languagesSpoken ||
                    host.hostApplicationData?.languagesSpoken ||
                    [];
                  const about =
                    personalInfo.aboutYou ||
                    host.hostApplicationData?.aboutYou;

                  return (
                    <motion.div
                      key={hostId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl flex items-center gap-3">
                              <User className="w-6 h-6" />
                              {host.name || host.hostApplicationData?.fullName || "Unknown Host"}
                            </CardTitle>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {experiences.length} Experience{experiences.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Contact Information */}
                            <div>
                              <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Contact Information
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">Email:</span>
                                  {email ? (
                                    <a
                                      href={`mailto:${email}`}
                                      className="text-primary hover:underline"
                                    >
                                      {email}
                                    </a>
                                  ) : (
                                    <span className="text-muted-foreground">Not provided</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">Phone:</span>
                                  {phoneNumber ? (
                                    <a
                                      href={`tel:${phoneNumber}`}
                                      className="text-primary hover:underline"
                                    >
                                      {phoneNumber}
                                    </a>
                                  ) : (
                                    <span className="text-muted-foreground">Not provided</span>
                                  )}
                                </div>
                                {cityRegion && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">Location:</span>
                                    <span>{cityRegion}</span>
                                  </div>
                                )}
                                {fullAddress && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">Address:</span>
                                    <span>{fullAddress}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Languages */}
                            {Array.isArray(languages) && languages.length > 0 && (
                              <div>
                                <h3 className="font-semibold mb-2 text-sm">Languages Spoken:</h3>
                                <div className="flex flex-wrap gap-2">
                                  {languages.map((lang: string, idx: number) => (
                                    <Badge key={idx} variant="outline">
                                      {lang}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* About */}
                            {about && (
                              <div>
                                <h3 className="font-semibold mb-2 text-sm">About:</h3>
                                <p className="text-sm text-muted-foreground">
                                  {about}
                                </p>
                              </div>
                            )}

                            {/* Experiences */}
                            {experiences.length > 0 && (
                              <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                  <Briefcase className="w-4 h-4" />
                                  Experiences ({experiences.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {experiences.map((exp: any) => {
                                    const meetingPoint =
                                      exp.startLocation?.description ||
                                      exp.startLocation?.address ||
                                      exp.address ||
                                      "Not specified";
                                    const nextStartDate =
                                      Array.isArray(exp.startDates) && exp.startDates.length > 0
                                        ? new Date(exp.startDates[0]).toLocaleDateString()
                                        : null;
                                    return (
                                      <Card key={exp._id || exp.id} className="bg-muted/50">
                                        <CardContent className="p-4 space-y-2">
                                          <div className="flex items-center justify-between">
                                            <h4 className="font-semibold">{exp.title}</h4>
                                            <Badge variant="outline">{exp.status || "active"}</Badge>
                                          </div>
                                          <div className="text-sm text-muted-foreground space-y-1">
                                            <p>
                                              <strong>Location:</strong> {exp.location || exp.city || "Location pending"}
                                            </p>
                                            <p>
                                              <strong>Meeting Point:</strong> {meetingPoint}
                                            </p>
                                            <p>
                                              <strong>Duration:</strong>{" "}
                                              {exp.duration
                                                ? `${exp.duration} day${exp.duration > 1 ? "s" : ""}`
                                                : "Flexible"}
                                            </p>
                                            {nextStartDate && (
                                              <p>
                                                <strong>Next Tour Date:</strong> {nextStartDate}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex items-center justify-between text-sm border-t pt-2">
                                            <span className="font-medium text-primary">
                                              ETB {exp.price}
                                            </span>
                                            <span className="text-muted-foreground">
                                              {exp.ratingsAverage?.toFixed(1) || "0.0"} (
                                              {exp.ratingsQuantity || 0})
                                            </span>
                                          </div>
                                          {(exp.summary || exp.description) && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                              {exp.summary || exp.description}
                                            </p>
                                          )}
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

