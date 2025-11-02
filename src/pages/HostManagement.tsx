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
} from "lucide-react";
import { usersAPI, experiencesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";

export default function HostManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hosts, setHosts] = useState<any[]>([]);
  const [allExperiences, setAllExperiences] = useState<any[]>([]);
  const [hostApplications, setHostApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHost, setSelectedHost] = useState<any>(null);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

    fetchData();
  }, [user, navigate, toast]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all users and filter approved hosts
      const [usersResponse, experiencesResponse] = await Promise.all([
        usersAPI.getAll(),
        experiencesAPI.getAll(),
      ]);

      const allUsers = usersResponse.data.data;
      const approvedHosts = allUsers.filter(
        (u: any) => u.hostStatus === "approved"
      );
      
      setHosts(approvedHosts);
      setAllExperiences(experiencesResponse.data.data || []);

      // Fetch all host applications for approved hosts
      const applications: any[] = [];
      for (const host of approvedHosts) {
        try {
          const hostId = host._id || host.id;
          console.log(`Fetching application for host: ${host.name} (ID: ${hostId})`);
          const response = await api.get(`/host-applications/user/${hostId}`);
          if (response.data?.data?.application) {
            applications.push(response.data.data.application);
            console.log(`✓ Found application for ${host.name}`);
          } else {
            console.log(`✗ No application data for ${host.name}`);
          }
        } catch (error: any) {
          console.log(`✗ No application found for host: ${host.name}`, error.response?.status);
        }
      }
      
      setHostApplications(applications);
      console.log(`Loaded ${applications.length} applications out of ${approvedHosts.length} hosts`);

    } catch (err: any) {
      console.error("Failed to fetch hosts:", err);
      toast({
        title: "Error",
        description: "Failed to load host data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (host: any) => {
    setSelectedHost(host);
    
    const hostId = host._id || host.id;
    console.log("Looking for application for host:", hostId);
    console.log("Available applications:", hostApplications.map((app: any) => ({
      userId: app.user,
      userName: app.user?.name
    })));
    
    // Find the application for this host
    let application = hostApplications.find(
      (app: any) => {
        const appUserId = app.user?._id || app.user?.id || app.user;
        return String(appUserId) === String(hostId);
      }
    );
    
    console.log("Found application:", application ? "Yes" : "No");
    
    // If not found in cache, try to fetch directly
    if (!application) {
      try {
        console.log("Fetching application directly for:", hostId);
        const response = await api.get(`/host-applications/user/${hostId}`);
        if (response.data?.data?.application) {
          application = response.data.data.application;
          console.log("Successfully fetched application");
        }
      } catch (error) {
        console.error("Failed to fetch application:", error);
      }
    }
    
    setSelectedApplication(application || null);
    setIsDialogOpen(true);
  };

  const getHostExperiences = (hostId: string) => {
    return allExperiences.filter(
      (exp: any) => String(exp.host?._id ?? exp.host) === String(hostId)
    );
  };

  const getHostStats = (hostId: string) => {
    const hostExperiences = getHostExperiences(hostId);
    const totalExperiences = hostExperiences.length;
    const totalReviews = hostExperiences.reduce(
      (sum: number, exp: any) => sum + (exp.ratingsQuantity || 0),
      0
    );
    const avgRating = hostExperiences.length > 0
      ? hostExperiences.reduce(
          (sum: number, exp: any) => sum + (exp.ratingsAverage || 0),
          0
        ) / hostExperiences.length
      : 0;
    const totalRevenue = hostExperiences.reduce(
      (sum: number, exp: any) => sum + exp.price * (exp.ratingsQuantity || 0),
      0
    );

    return { totalExperiences, totalReviews, avgRating, totalRevenue };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">Loading hosts...</p>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/dashboard")}
                className="mb-4 text-primary-foreground hover:text-primary-foreground/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 flex items-center gap-4">
                <Users className="w-12 h-12" />
                Host Management
              </h1>
              <p className="text-lg text-primary-foreground/90">
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
                {hosts.map((host: any) => {
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
                              {host.photo ? (
                                <img
                                  src={host.photo}
                                  alt={host.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="w-6 h-6 text-primary" />
                                </div>
                              )}
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
                                  {new Date(host.hostApplicationDate).toLocaleDateString()}
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              {selectedHost?.photo ? (
                <img
                  src={selectedHost.photo}
                  alt={selectedHost.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              )}
              {selectedHost?.name}
            </DialogTitle>
            <DialogDescription>
              Complete host application details, uploaded documents, and experiences
            </DialogDescription>
          </DialogHeader>

          {selectedHost && (
            <div className="space-y-6">
              {!selectedApplication && (
                <Card className="border-2 border-yellow-500/50 bg-yellow-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 text-yellow-700">
                      <AlertCircle className="w-6 h-6 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Host application data not available</p>
                        <p className="text-sm text-muted-foreground">
                          This host was approved but their application details are not accessible. 
                          This could happen if the application was created before the current system 
                          or if the data is incomplete. You can still view their experiences below.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedApplication && (
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

                  {selectedApplication.personalInfo?.languagesSpoken && selectedApplication.personalInfo.languagesSpoken.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-start gap-2">
                        <Languages className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">Languages:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedApplication.personalInfo.languagesSpoken.map((lang: string) => (
                              <Badge key={lang} variant="outline">
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
                        <span className="text-sm">{new Date(selectedHost.hostApplicationDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Experience Details */}
              {(selectedApplication.experienceDetails?.experienceTypes?.length > 0 || 
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
                    {selectedApplication.experienceDetails.experienceTypes && selectedApplication.experienceDetails.experienceTypes.length > 0 && (
                      <div>
                        <span className="font-medium">Experience Types:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedApplication.experienceDetails.experienceTypes.map((type: string) => (
                            <Badge key={type} className="bg-primary">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedApplication.experienceDetails.specialties && selectedApplication.experienceDetails.specialties.length > 0 && (
                      <div>
                        <span className="font-medium">Specialties:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedApplication.experienceDetails.specialties.map((specialty: string) => (
                            <Badge key={specialty} variant="secondary">
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
              {selectedApplication.media && (
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
                        />
                      </div>
                    )}

                    {/* Hosting Environment Photos */}
                    {selectedApplication.media.hostingEnvironmentPhotos && selectedApplication.media.hostingEnvironmentPhotos.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Hosting Environment Photos ({selectedApplication.media.hostingEnvironmentPhotos.length})</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedApplication.media.hostingEnvironmentPhotos.map((photo: string, index: number) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Hosting Environment ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border-2 hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => window.open(photo, '_blank')}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Host Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(() => {
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
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Host Experiences */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Host Experiences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const hostExperiences = getHostExperiences(
                      selectedHost._id || selectedHost.id
                    );
                    return hostExperiences.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No experiences created yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {hostExperiences.map((exp: any) => (
                          <div
                            key={exp._id || exp.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-semibold">{exp.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {exp.location}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm font-medium text-primary">
                                  ETB {exp.price}
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
                                  {exp.status}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigate(`/experiences/${exp._id || exp.id}`);
                                setIsDialogOpen(false);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    );
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
                        <span className="text-sm">{new Date(selectedHost.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      {selectedHost.hostApplicationDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Became Host:</span>
                          <span className="text-sm">{new Date(selectedHost.hostApplicationDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

