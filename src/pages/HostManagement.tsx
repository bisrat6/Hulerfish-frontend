import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  Users,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Loader2,
  AlertCircle,
  Eye,
  Star,
  MessageSquare,
  DollarSign,
  ArrowLeft,
  Image as ImageIcon,
  Languages,
  Briefcase,
  Home,
  IdCard,
  User,
} from "lucide-react";
import { usersAPI, experiencesAPI, guidesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";

const NO_GUIDE_VALUE = "__NO_GUIDE__";

export default function HostManagement() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hosts, setHosts] = useState<any[]>([]);
  const [allExperiences, setAllExperiences] = useState<any[]>([]);
  const [hostApplications, setHostApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHost, setSelectedHost] = useState<any>(null);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [guides, setGuides] = useState<any[]>([]);
  const [selectedGuideId, setSelectedGuideId] = useState<string>(""); // empty string = no guide
  const [isLoadingGuides, setIsLoadingGuides] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) {
      return;
    }

    // Redirect if not admin
    if (!user || user.role !== "admin") {
      navigate("/");
      // Delay toast to avoid state update on unmounted component
      setTimeout(() => {
        if (isMountedRef.current) {
          toast({
            title: "Access Denied",
            description: "Admin access required",
            variant: "destructive",
          });
        }
      }, 100);
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    if (!isMountedRef.current) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all users and filter approved hosts
      const [usersResponse, experiencesResponse] = await Promise.all([
        usersAPI.getAll(),
        experiencesAPI.getAll(),
      ]);

      if (!isMountedRef.current) return;

      const allUsers = usersResponse?.data?.data || usersResponse?.data || [];
      const approvedHosts = Array.isArray(allUsers) 
        ? allUsers.filter((u: any) => u.hostStatus === "approved")
        : [];
      
      setHosts(approvedHosts);
      setAllExperiences(experiencesResponse?.data?.data || experiencesResponse?.data || []);

      // Don't fetch applications on initial load - fetch them lazily when needed
      // This reduces the number of queries significantly
      setHostApplications([]);

    } catch (err: any) {
      console.error("Failed to fetch hosts:", err);
      
      if (!isMountedRef.current) return;
      
      const errorMessage = err.response?.data?.message || err.message || "Failed to load host data";
      setError(errorMessage);
      setHosts([]);
      setAllExperiences([]);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleViewDetails = async (host: any) => {
    if (!host) {
      console.error("No host provided to handleViewDetails");
      return;
    }

    try {
      setSelectedHost(host);
      setSelectedApplication(null); // Reset application
      setGuides([]); // Reset guides
      setIsLoadingGuides(true);
      setIsDialogOpen(true); // Open dialog immediately
      
      // Handle both populated and unpopulated assignedGuide
      const guideId = typeof host.assignedGuide === 'object' 
        ? (host.assignedGuide._id || host.assignedGuide.id)
        : host.assignedGuide;
      setSelectedGuideId(guideId || "");
      
      const hostId = host._id || host.id;
      if (!hostId) {
        console.error("Host ID is missing");
        setIsLoadingGuides(false);
        return;
      }
      
      // Fetch guides and application in parallel with better error handling
      try {
        const [guidesResponse, applicationResponse] = await Promise.allSettled([
          guidesAPI.getAll().catch(err => {
            console.error("Guides API error:", err);
            return { data: { guides: [] } };
          }),
          api.get(`/host-applications/user/${hostId}`).catch(err => {
            // 404 is expected for hosts without applications
            if (err.response?.status === 404) {
              return { data: { data: { application: null } } };
            }
            console.error("Application API error:", err);
            return { data: { data: { application: null } } };
          })
        ]);
        
        // Handle guides response safely
        try {
          if (!isMountedRef.current) return;
          
          if (guidesResponse.status === 'fulfilled') {
            const response = guidesResponse.value;
            // Handle different response structures
            const guides = response?.data?.guides || response?.data?.data?.guides || response?.guides || [];
            if (isMountedRef.current) {
              setGuides(Array.isArray(guides) ? guides.filter(g => g && (g._id || g.id)) : []);
            }
          } else {
            console.error("Failed to fetch guides:", guidesResponse.reason);
            if (isMountedRef.current) {
              setGuides([]);
            }
          }
        } catch (err) {
          console.error("Error processing guides response:", err);
          if (isMountedRef.current) {
            setGuides([]);
          }
        }
        
        // Handle application response safely
        try {
          if (!isMountedRef.current) return;
          
          if (applicationResponse.status === 'fulfilled') {
            const response: any = applicationResponse.value;
            // Handle different response structures
            const application = response?.data?.data?.application || 
                               response?.data?.application || 
                               (response?.data && typeof response.data === 'object' && 'application' in response.data ? response.data.application : null) ||
                               null;
            if (isMountedRef.current) {
              setSelectedApplication(application);
            }
          } else {
            // Application not found is not an error - some hosts might not have applications
            console.log("No application found for host:", hostId);
            if (isMountedRef.current) {
              setSelectedApplication(null);
            }
          }
        } catch (err) {
          console.error("Error processing application response:", err);
          if (isMountedRef.current) {
            setSelectedApplication(null);
          }
        }
      } catch (err) {
        console.error("Error in Promise.allSettled:", err);
        if (isMountedRef.current && isDialogOpen) {
          setGuides([]);
          setSelectedApplication(null);
        }
      }
    } catch (err: any) {
      console.error("Error in handleViewDetails:", err);
      // Still show the dialog with basic host info even if fetching fails
      if (isMountedRef.current && isDialogOpen) {
        setGuides([]);
        setSelectedApplication(null);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingGuides(false);
      }
    }
  };

  const getHostExperiences = (hostId: string) => {
    if (!hostId || !Array.isArray(allExperiences)) {
      return [];
    }
    try {
      return allExperiences.filter(
        (exp: any) => {
          if (!exp) return false;
          const expHostId = exp.host?._id ?? exp.host;
          return String(expHostId) === String(hostId);
        }
      );
    } catch (err) {
      console.error("Error filtering host experiences:", err);
      return [];
    }
  };

  const getHostStats = (hostId: string) => {
    try {
      const hostExperiences = getHostExperiences(hostId);
      const totalExperiences = hostExperiences.length;
      const totalReviews = hostExperiences.reduce(
        (sum: number, exp: any) => {
          const quantity = exp?.ratingsQuantity;
          return sum + (typeof quantity === 'number' ? quantity : 0);
        },
        0
      );
      const avgRating = hostExperiences.length > 0
        ? hostExperiences.reduce(
            (sum: number, exp: any) => {
              const avg = exp?.ratingsAverage;
              return sum + (typeof avg === 'number' ? avg : 0);
            },
            0
          ) / hostExperiences.length
        : 0;
      const totalRevenue = hostExperiences.reduce(
        (sum: number, exp: any) => {
          const price = exp?.price;
          const quantity = exp?.ratingsQuantity;
          const priceNum = typeof price === 'number' ? price : 0;
          const quantityNum = typeof quantity === 'number' ? quantity : 0;
          return sum + (priceNum * quantityNum);
        },
        0
      );

      return { totalExperiences, totalReviews, avgRating: isNaN(avgRating) ? 0 : avgRating, totalRevenue: isNaN(totalRevenue) ? 0 : totalRevenue };
    } catch (err) {
      console.error("Error calculating host stats:", err);
      return { totalExperiences: 0, totalReviews: 0, avgRating: 0, totalRevenue: 0 };
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">{authLoading ? "Loading..." : "Loading hosts..."}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show nothing if user is not admin (will redirect)
  if (!user || user.role !== "admin") {
    return null;
  }

  // Show error state if there's an error
  if (error && hosts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <Card className="border-2 border-destructive max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-destructive mb-4">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Error Loading Hosts</h3>
              </div>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchData} variant="outline" className="w-full">
                Try Again
              </Button>
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
        <section className="relative bg-gradient-to-br from-primary/5 via-primary-light/5 to-earth/5 py-16 md:py-20 border-b border-border/50">
          <div className="absolute inset-0 bg-muted/30" />
          <div className="absolute top-6 left-4 z-20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/dashboard")}
              className="bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-border/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 flex items-center gap-4">
                <Users className="w-10 h-10 text-primary" />
                Host Management
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Manage all approved hosts and their experiences on the platform.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Hosts List */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                All Approved Hosts ({hosts.length})
              </h2>
              <p className="text-muted-foreground">
                Click on "View Details" to see host information and their experiences
              </p>
            </div>

            {hosts.length === 0 ? (
              <Card className="border-2">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
                    No approved hosts found
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hosts.filter(host => host && (host._id || host.id)).map((host: any) => {
                  const stats = getHostStats(host._id || host.id);
                  return (
                    <motion.div
                      key={host._id || host.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-2 hover:border-primary/50 transition-all">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12">
                                {host.photo && (
                                  <AvatarImage
                                    src={host.photo}
                                    alt={host.name}
                                  />
                                )}
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                  {(() => {
                                    const name = host.name || host.email || 'Host';
                                    const parts = name.trim().split(/\s+/);
                                    if (parts.length >= 2) {
                                      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                                    }
                                    return name.substring(0, 2).toUpperCase();
                                  })()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-lg">
                                  {host.name}
                                </CardTitle>
                                <Badge className="mt-1 bg-green-600">Host</Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{host.email}</span>
                            </div>
                            {host.hostApplicationDate && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Joined:{" "}
                                  {(() => {
                                    try {
                                      return new Date(host.hostApplicationDate).toLocaleDateString();
                                    } catch {
                                      return "Invalid date";
                                    }
                                  })()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Host Stats */}
                          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Experiences</p>
                              <p className="text-lg font-bold text-primary">
                                {stats.totalExperiences}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Avg Rating</p>
                              <p className="text-lg font-bold text-primary">
                                {stats.avgRating.toFixed(1)}
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="hero"
                            size="sm"
                            onClick={() => handleViewDetails(host)}
                            className="w-full"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
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

      {/* Host Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          // Reset state when dialog closes
          setSelectedApplication(null);
          setGuides([]);
          setSelectedGuideId("");
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <Avatar className="w-12 h-12">
                {selectedHost?.photo && (
                  <AvatarImage
                    src={selectedHost.photo}
                    alt={selectedHost.name || "Host"}
                  />
                )}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {(() => {
                    const name = selectedHost?.name || selectedHost?.email || 'Host';
                    const parts = name.trim().split(/\s+/);
                    if (parts.length >= 2) {
                      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                    }
                    return name.substring(0, 2).toUpperCase();
                  })()}
                </AvatarFallback>
              </Avatar>
              {selectedHost?.name || "Host Details"}
            </DialogTitle>
            <DialogDescription>
              Complete host application details, uploaded documents, and experiences
            </DialogDescription>
          </DialogHeader>

          {selectedHost ? (
            <div className="space-y-6">
              {isLoadingGuides && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Loading host details...</span>
                </div>
              )}
              
              {!isLoadingGuides && !selectedApplication && (
                <Card className="border-2 border-yellow-500/50 bg-yellow-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 text-yellow-700">
                      <AlertCircle className="w-6 h-6 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Host application data not available</p>
                        <p className="text-sm text-muted-foreground">
                          This host was approved but their application details are not accessible. 
                          This could happen if the application was created before the current system 
                          or if the data is incomplete. You can still view their basic information and experiences below.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!isLoadingGuides && selectedApplication && selectedApplication.personalInfo && (
                <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Full Name:</span>
                      <span>{selectedApplication.personalInfo?.fullName || selectedHost.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                      <span>{selectedApplication.personalInfo?.email || selectedHost.email}</span>
                    </div>
                    {selectedApplication.personalInfo?.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Phone:</span>
                        <span>{selectedApplication.personalInfo.phoneNumber}</span>
                      </div>
                    )}
                    {selectedApplication.personalInfo?.cityRegion && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">City/Region:</span>
                        <span>{selectedApplication.personalInfo.cityRegion}</span>
                      </div>
                    )}
                  </div>
                  
                  {selectedApplication.personalInfo?.fullAddress && (
                    <div className="pt-2">
                      <div className="flex items-start gap-2">
                        <Home className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">Address:</span>
                          <p className="text-muted-foreground">{selectedApplication.personalInfo.fullAddress}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedApplication.personalInfo?.languagesSpoken && 
                   Array.isArray(selectedApplication.personalInfo.languagesSpoken) && 
                   selectedApplication.personalInfo.languagesSpoken.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-start gap-2">
                        <Languages className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">Languages:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedApplication.personalInfo.languagesSpoken
                              .filter((lang: any) => lang && typeof lang === 'string')
                              .map((lang: string, idx: number) => (
                              <Badge key={lang || idx} variant="outline">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedApplication.personalInfo?.aboutYou && (
                    <div className="pt-2">
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">About:</span>
                          <p className="text-muted-foreground leading-relaxed mt-1">
                            {selectedApplication.personalInfo.aboutYou}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Member Since:</span>
                      <span className="text-sm">{new Date(selectedHost.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    {selectedHost.hostApplicationDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Became Host:</span>
                          <span className="text-sm">{(() => {
                            try {
                              return new Date(selectedHost.hostApplicationDate).toLocaleDateString();
                            } catch {
                              return "Invalid date";
                            }
                          })()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Guide Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Assigned Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedHost.assignedGuide ? (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        {typeof selectedHost.assignedGuide === 'object' ? (
                          <>
                            <p className="font-medium">
                              {selectedHost.assignedGuide.name || "Unknown Guide"}
                            </p>
                            {selectedHost.assignedGuide.location && (
                              <p className="text-sm text-muted-foreground">
                                Location: {selectedHost.assignedGuide.location}
                              </p>
                            )}
                            {selectedHost.assignedGuide.email && (
                              <p className="text-sm text-muted-foreground">
                                Email: {selectedHost.assignedGuide.email}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Guide ID: {selectedHost.assignedGuide}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No guide assigned</p>
                  )}
                  
                  <div className="pt-2 border-t">
                    <Label htmlFor="guideReassign" className="mb-2 block">Reassign Guide:</Label>
                    {isLoadingGuides ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading guides...
                      </div>
                    ) : guides.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No guides available</p>
                    ) : (
                      <div className="flex gap-2">
                        <Select 
                          value={selectedGuideId || NO_GUIDE_VALUE} 
                          onValueChange={(value) => {
                            if (value === NO_GUIDE_VALUE) {
                              setSelectedGuideId("");
                            } else {
                              setSelectedGuideId(value);
                            }
                          }}
                        >
                          <SelectTrigger id="guideReassign" className="flex-1">
                            <SelectValue placeholder="Select a guide" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NO_GUIDE_VALUE}>None (Remove guide)</SelectItem>
                            {guides
                              .filter(guide => {
                                if (!guide) return false;
                                const guideId = guide._id ?? guide.id;
                                const value = typeof guideId === "string" ? guideId.trim() : guideId;
                                return Boolean(value) && Boolean(guide.name);
                              })
                              .map((guide) => {
                                const guideId = guide._id ?? guide.id;
                                if (!guideId) return null;
                                const value = String(guideId).trim();
                                if (!value) return null;
                                return (
                                  <SelectItem key={value} value={value}>
                                    {guide.name || "Unknown"} - {guide.location || "No location"}
                                  </SelectItem>
                                );
                              })}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={async () => {
                            try {
                              setIsReassigning(true);
                              const hostId = selectedHost._id || selectedHost.id;
                              if (selectedGuideId) {
                                await guidesAPI.reassignToHost(hostId, selectedGuideId);
                                toast({
                                  title: "Guide Reassigned",
                                  description: "Host has been reassigned to the selected guide.",
                                });
                              } else {
                                // Remove guide assignment
                                await guidesAPI.reassignToHost(hostId, "");
                                toast({
                                  title: "Guide Removed",
                                  description: "Guide assignment has been removed.",
                                });
                              }
                              fetchData();
                              setIsDialogOpen(false);
                            } catch (err: any) {
                              toast({
                                title: "Error",
                                description: err.response?.data?.message || "Failed to reassign guide",
                                variant: "destructive",
                              });
                            } finally {
                              setIsReassigning(false);
                            }
                          }}
                          disabled={isReassigning}
                          size="sm"
                        >
                          {isReassigning ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : null}
                          {selectedGuideId ? "Reassign" : "Remove Guide"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Experience Details */}
              {selectedApplication?.experienceDetails && 
               (selectedApplication.experienceDetails?.experienceTypes?.length > 0 || 
                selectedApplication.experienceDetails?.specialties?.length > 0 || 
                selectedApplication.experienceDetails?.previousExperience) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Experience & Specialties
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Array.isArray(selectedApplication.experienceDetails.experienceTypes) && 
                     selectedApplication.experienceDetails.experienceTypes.length > 0 && (
                      <div>
                        <span className="font-medium">Experience Types:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedApplication.experienceDetails.experienceTypes
                            .filter((type: any) => type && typeof type === 'string')
                            .map((type: string, idx: number) => (
                            <Badge key={type || idx} className="bg-primary">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {Array.isArray(selectedApplication.experienceDetails.specialties) && 
                     selectedApplication.experienceDetails.specialties.length > 0 && (
                      <div>
                        <span className="font-medium">Specialties:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedApplication.experienceDetails.specialties
                            .filter((specialty: any) => specialty && typeof specialty === 'string')
                            .map((specialty: string, idx: number) => (
                            <Badge key={specialty || idx} variant="secondary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedApplication.experienceDetails.previousExperience && (
                      <div className="pt-2">
                        <span className="font-medium">Previous Experience:</span>
                        <p className="text-muted-foreground leading-relaxed mt-1">
                          {selectedApplication.experienceDetails.previousExperience}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Uploaded Documents & Images */}
              {selectedApplication?.media && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <IdCard className="w-5 h-5" />
                      Uploaded Documents & Photos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* National ID */}
                    <div>
                      <h4 className="font-medium mb-2">National ID</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedApplication.media.nationalIdFront && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Front Side</p>
                            <img
                              src={selectedApplication.media.nationalIdFront}
                              alt="National ID Front"
                              className="w-full h-48 object-cover rounded-lg border-2"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        {selectedApplication.media.nationalIdBack && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Back Side</p>
                            <img
                              src={selectedApplication.media.nationalIdBack}
                              alt="National ID Back"
                              className="w-full h-48 object-cover rounded-lg border-2"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Personal Photo */}
                    {selectedApplication.media.personalPhoto && (
                      <div>
                        <h4 className="font-medium mb-2">Personal Photo</h4>
                        <img
                          src={selectedApplication.media.personalPhoto}
                          alt="Personal Photo"
                          className="w-64 h-64 object-cover rounded-lg border-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Hosting Environment Photos */}
                    {Array.isArray(selectedApplication.media.hostingEnvironmentPhotos) && 
                     selectedApplication.media.hostingEnvironmentPhotos.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Hosting Environment Photos ({selectedApplication.media.hostingEnvironmentPhotos.length})</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedApplication.media.hostingEnvironmentPhotos
                            .filter((photo: any) => photo && typeof photo === 'string')
                            .map((photo: string, index: number) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Hosting Environment ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border-2 hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => window.open(photo, '_blank')}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Host Statistics - Always show */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(() => {
                      try {
                        const stats = getHostStats(selectedHost._id || selectedHost.id);
                        return (
                          <>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
                              <p className="text-2xl font-bold text-primary">
                                {stats.totalExperiences}
                              </p>
                              <p className="text-xs text-muted-foreground">Experiences</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <MessageSquare className="w-6 h-6 text-primary mx-auto mb-2" />
                              <p className="text-2xl font-bold text-primary">
                                {stats.totalReviews}
                              </p>
                              <p className="text-xs text-muted-foreground">Reviews</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <Star className="w-6 h-6 text-secondary mx-auto mb-2 fill-secondary" />
                              <p className="text-2xl font-bold text-primary">
                                {stats.avgRating.toFixed(1)}
                              </p>
                              <p className="text-xs text-muted-foreground">Avg Rating</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                              <p className="text-2xl font-bold text-green-600">
                                {stats.totalRevenue.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">Revenue (ETB)</p>
                            </div>
                          </>
                        );
                      } catch (err) {
                        console.error("Error calculating stats:", err);
                        return <p className="text-muted-foreground">Error loading statistics</p>;
                      }
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Host Experiences - Always show */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Host Experiences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    try {
                      const hostExperiences = getHostExperiences(
                        selectedHost._id || selectedHost.id
                      );
                      return hostExperiences.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No experiences created yet
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {hostExperiences.filter(exp => exp && (exp._id || exp.id)).map((exp: any) => (
                            <div
                              key={exp._id || exp.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="font-semibold">{exp.title || "Untitled Experience"}</p>
                                <p className="text-sm text-muted-foreground">
                                  {exp.location || "No location"}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-sm font-medium text-primary">
                                    ETB {exp.price || 0}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-secondary fill-secondary" />
                                    <span className="text-sm">
                                      {exp.ratingsAverage?.toFixed(1) || "0.0"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      ({exp.ratingsQuantity || 0})
                                    </span>
                                  </div>
                                  <Badge
                                    variant={
                                      exp.status === "approved"
                                        ? "default"
                                        : exp.status === "pending"
                                        ? "secondary"
                                        : "destructive"
                                    }
                                  >
                                    {exp.status || "unknown"}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const expId = exp._id || exp.id;
                                  if (expId) {
                                    navigate(`/experiences/${expId}`);
                                    setIsDialogOpen(false);
                                  }
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      );
                    } catch (err) {
                      console.error("Error loading experiences:", err);
                      return <p className="text-center text-muted-foreground py-8">Error loading experiences</p>;
                    }
                  })()}
                </CardContent>
              </Card>
              </div>
              )}

              {/* Basic Host Info (always shown) */}
              {!selectedApplication && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Email:</span>
                        <span>{selectedHost.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Member Since:</span>
                        <span className="text-sm">{(() => {
                          try {
                            return new Date(selectedHost.createdAt || Date.now()).toLocaleDateString();
                          } catch {
                            return "Invalid date";
                          }
                        })()}</span>
                      </div>
                      {selectedHost.hostApplicationDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Became Host:</span>
                          <span className="text-sm">{(() => {
                            try {
                              return new Date(selectedHost.hostApplicationDate).toLocaleDateString();
                            } catch {
                              return "Invalid date";
                            }
                          })()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <span className="ml-3 text-muted-foreground">No host selected</span>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

