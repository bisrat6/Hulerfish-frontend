import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Loader2,
  MapPin,
  Mail,
  Phone,
  User,
  Globe,
  Briefcase,
  AlertCircle,
  UserCheck,
  ArrowLeftRight,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { guidesAPI, experiencesAPI, API_ORIGIN } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Image as ImageIcon, FileText, Camera, IdCard, X } from "lucide-react";

const NO_GUIDE_VALUE = "__NO_GUIDE__";

export default function GuideManagement() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [guides, setGuides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [assignedHosts, setAssignedHosts] = useState<any[]>([]);
  const [hostExperiences, setHostExperiences] = useState<Record<string, any[]>>({});
  const [hostSelections, setHostSelections] = useState<Record<string, string>>({});
  const [isLoadingHosts, setIsLoadingHosts] = useState(false);
  const [isReassigningHostId, setIsReassigningHostId] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || user.role !== "admin") {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      return;
    }

    fetchGuides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchGuides = async (location?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await guidesAPI.getAll(location);
      const guideList =
        (response?.data && Array.isArray(response.data.guides)
          ? response.data.guides
          : Array.isArray(response?.guides)
          ? response.guides
          : Array.isArray(response)
          ? response
          : []) || [];
      if (isMountedRef.current) {
        setGuides(guideList);
      }
    } catch (err: any) {
      console.error("Failed to fetch guides:", err);
      if (isMountedRef.current) {
        setGuides([]);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load guides"
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchGuides(locationFilter.trim() || undefined);
  };

  const handleClearFilter = () => {
    setLocationFilter("");
    fetchGuides();
  };

  const handleViewDetails = async (guide: any) => {
    if (!guide) return;
    setSelectedGuide(guide);
    setIsDetailsOpen(true);
    await fetchAssignedHosts(guide);
  };

  const fetchAssignedHosts = async (guide: any) => {
    const guideId = guide?._id || guide?.id;
    if (!guideId) {
      toast({
        title: "Error",
        description: "Guide identifier missing",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsLoadingHosts(true);
      const response = await guidesAPI.getAssignedHosts(guideId);
      const hostList =
        response?.data?.hosts ||
        response?.hosts ||
        response ||
        [];

      if (!Array.isArray(hostList)) {
        setAssignedHosts([]);
        setHostExperiences({});
        setHostSelections({});
        return;
      }

      setAssignedHosts(hostList);
      const experienceEntries = await Promise.all(
        hostList.map(async (host) => {
          const hostId = host._id || host.id;
          if (!hostId) return [hostId, []];
          try {
            const expResponse = await experiencesAPI.getAll({ host: hostId });
            const expList =
              (expResponse?.data && Array.isArray(expResponse.data.data)
                ? expResponse.data.data
                : Array.isArray(expResponse?.data)
                ? expResponse.data
                : []) || [];
            return [hostId, expList];
          } catch (expErr) {
            console.error(`Failed to fetch experiences for host ${hostId}`, expErr);
            return [hostId, []];
          }
        })
      );
      setHostExperiences(Object.fromEntries(experienceEntries));

      const defaultSelections: Record<string, string> = {};
      hostList.forEach((host) => {
        const hostId = host._id || host.id;
        if (hostId) {
          defaultSelections[hostId] = guideId;
        }
      });
      setHostSelections(defaultSelections);
    } catch (err: any) {
      console.error("Failed to fetch assigned hosts:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load assigned hosts",
        variant: "destructive",
      });
      setAssignedHosts([]);
      setHostExperiences({});
      setHostSelections({});
    } finally {
      setIsLoadingHosts(false);
    }
  };

  const handleReassign = async (hostId: string) => {
    const targetGuide = hostSelections[hostId];
    if (typeof targetGuide === "undefined") {
      toast({
        title: "Select a guide",
        description: "Please choose a guide to reassign this host.",
        variant: "destructive",
      });
      return;
    }

    setIsReassigningHostId(hostId);
    try {
      const payloadGuideId =
        targetGuide === NO_GUIDE_VALUE ? "" : targetGuide;
      await guidesAPI.reassignToHost(hostId, payloadGuideId);
      toast({
        title: "Success",
        description:
          payloadGuideId === ""
            ? "Guide assignment removed."
            : "Host reassigned successfully.",
      });
      if (selectedGuide) {
        fetchAssignedHosts(selectedGuide);
        // Refresh top-level guides to reflect counts/metadata
        fetchGuides(locationFilter.trim() || undefined);
      }
    } catch (err: any) {
      console.error("Failed to reassign host:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to reassign host.",
        variant: "destructive",
      });
    } finally {
      setIsReassigningHostId(null);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDetailsOpen(open);
    if (!open) {
      setSelectedGuide(null);
      setAssignedHosts([]);
      setHostExperiences({});
      setHostSelections({});
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">{authLoading ? "Loading..." : "Loading guides..."}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  if (error && guides.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <Card className="border-2 border-destructive max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-destructive mb-4">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Error Loading Guides</h3>
              </div>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => fetchGuides(locationFilter.trim() || undefined)} variant="outline" className="w-full">
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
        <div className="relative">
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
          <PageHeader
            title={
              <>
                <Globe className="w-10 h-10 inline-block mr-3 text-primary" />
                Guide Management
              </>
            }
            description="Oversee all guides, review their assignments, and help them stay connected with hosts."
          />
        </div>

        {/* Filter + guides list */}
        <section className="py-16">
          <div className="container mx-auto px-4 space-y-10">
            <form className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4" onSubmit={handleFilterSubmit}>
              <Input
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Filter guides by city/region..."
              />
              <Button type="submit" variant="hero">
                Search
              </Button>
              <Button type="button" variant="outline" onClick={handleClearFilter}>
                Clear
              </Button>
            </form>

            {guides.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Guides Found</h3>
                  <p className="text-muted-foreground">
                    {locationFilter
                      ? "No guides match this location. Try adjusting the filter."
                      : "There are no approved guides yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide) => {
                  const guideId = guide._id || guide.id;
                  const location = guide.location || guide.guideApplicationData?.personalInfo?.cityRegion;
                  const languages =
                    guide.guideApplicationData?.personalInfo?.languagesSpoken ||
                    guide.guideApplicationData?.languagesSpoken ||
                    [];

                  return (
                    <Card key={guideId} className="border-2 hover:border-primary/30 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <User className="w-5 h-5" />
                          {guide.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {guide.email}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{location || "No location"}</span>
                        </div>
                        {Array.isArray(languages) && languages.length > 0 && (
                          <div className="flex flex-wrap gap-1 text-xs">
                            {languages.map((lang: string, idx: number) => (
                              <Badge key={idx} variant="outline">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleViewDetails(guide)}
                        >
                          View Assigned Hosts
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Guide details dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <UserCheck className="w-6 h-6" />
              {selectedGuide?.name || "Guide Details"}
            </DialogTitle>
            <DialogDescription>
              Complete guide information, uploaded documents, and assigned hosts.
            </DialogDescription>
          </DialogHeader>

          {/* Guide Information Section */}
          {selectedGuide && (
            <div className="space-y-6 mb-8">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Full Name:</span>
                        <p className="text-foreground">
                          {selectedGuide.guideApplicationData?.personalInfo?.fullName ||
                            selectedGuide.guideApplicationData?.fullName ||
                            selectedGuide.name ||
                            "Not provided"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Email:</span>
                        <p className="text-foreground">
                          {selectedGuide.guideApplicationData?.personalInfo?.email ||
                            selectedGuide.guideApplicationData?.email ||
                            selectedGuide.email ||
                            "Not provided"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                        <p className="text-foreground">
                          {selectedGuide.guideApplicationData?.personalInfo?.phoneNumber ||
                            selectedGuide.guideApplicationData?.phoneNumber ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Location:</span>
                        <p className="text-foreground">
                          {selectedGuide.guideApplicationData?.personalInfo?.cityRegion ||
                            selectedGuide.guideApplicationData?.cityRegion ||
                            selectedGuide.location ||
                            "Not provided"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Address:</span>
                        <p className="text-foreground">
                          {selectedGuide.guideApplicationData?.personalInfo?.fullAddress ||
                            selectedGuide.guideApplicationData?.fullAddress ||
                            "Not provided"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Languages:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(selectedGuide.guideApplicationData?.personalInfo?.languagesSpoken ||
                            selectedGuide.guideApplicationData?.languagesSpoken ||
                            []).length > 0 ? (
                            (selectedGuide.guideApplicationData?.personalInfo?.languagesSpoken ||
                              selectedGuide.guideApplicationData?.languagesSpoken ||
                              []).map((lang: string, idx: number) => (
                              <Badge key={idx} variant="outline">
                                {lang}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">Not provided</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {(selectedGuide.guideApplicationData?.personalInfo?.aboutYou ||
                    selectedGuide.guideApplicationData?.aboutYou) && (
                    <div className="mt-4 pt-4 border-t">
                      <span className="text-sm font-medium text-muted-foreground">About:</span>
                      <p className="text-foreground mt-1 leading-relaxed">
                        {selectedGuide.guideApplicationData?.personalInfo?.aboutYou ||
                          selectedGuide.guideApplicationData?.aboutYou}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Uploaded Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Uploaded Documents & Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Personal Photo */}
                    {(selectedGuide.guideApplicationData?.media?.personalPhoto ||
                      selectedGuide.guideApplicationData?.mediaUrls?.find((url: string) =>
                        url.includes("personalPhoto")
                      )) && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          Personal Photo
                        </h4>
                        <div
                          className="relative rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors"
                          onClick={() => {
                            const photoUrl =
                              selectedGuide.guideApplicationData?.media?.personalPhoto ||
                              selectedGuide.guideApplicationData?.mediaUrls?.find((url: string) =>
                                url.includes("personalPhoto")
                              );
                            if (photoUrl) {
                              const fullUrl =
                                photoUrl && String(photoUrl).startsWith("/")
                                  ? `${API_ORIGIN}${photoUrl}`
                                  : photoUrl;
                              setFullscreenImage(fullUrl);
                            }
                          }}
                        >
                          <img
                            src={
                              (() => {
                                const photoUrl =
                                  selectedGuide.guideApplicationData?.media?.personalPhoto ||
                                  selectedGuide.guideApplicationData?.mediaUrls?.find((url: string) =>
                                    url.includes("personalPhoto")
                                  );
                                if (!photoUrl) return "";
                                return photoUrl && String(photoUrl).startsWith("/")
                                  ? `${API_ORIGIN}${photoUrl}`
                                  : photoUrl;
                              })()
                            }
                            alt="Personal Photo"
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="text-white opacity-0 hover:opacity-100 text-sm font-medium">
                              Click to view full screen
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* National ID Front */}
                    {(selectedGuide.guideApplicationData?.media?.nationalIdFront ||
                      selectedGuide.guideApplicationData?.mediaUrls?.find((url: string) =>
                        url.includes("nationalIdFront")
                      )) && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <IdCard className="w-4 h-4" />
                          National ID (Front)
                        </h4>
                        <div
                          className="relative rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors"
                          onClick={() => {
                            const idUrl =
                              selectedGuide.guideApplicationData?.media?.nationalIdFront ||
                              selectedGuide.guideApplicationData?.mediaUrls?.find((url: string) =>
                                url.includes("nationalIdFront")
                              );
                            if (idUrl) {
                              const fullUrl =
                                idUrl && String(idUrl).startsWith("/")
                                  ? `${API_ORIGIN}${idUrl}`
                                  : idUrl;
                              setFullscreenImage(fullUrl);
                            }
                          }}
                        >
                          <img
                            src={
                              (() => {
                                const idUrl =
                                  selectedGuide.guideApplicationData?.media?.nationalIdFront ||
                                  selectedGuide.guideApplicationData?.mediaUrls?.find((url: string) =>
                                    url.includes("nationalIdFront")
                                  );
                                if (!idUrl) return "";
                                return idUrl && String(idUrl).startsWith("/")
                                  ? `${API_ORIGIN}${idUrl}`
                                  : idUrl;
                              })()
                            }
                            alt="National ID Front"
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="text-white opacity-0 hover:opacity-100 text-sm font-medium">
                              Click to view full screen
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* National ID Back */}
                    {(selectedGuide.guideApplicationData?.media?.nationalIdBack ||
                      selectedGuide.guideApplicationData?.mediaUrls?.find((url: string) =>
                        url.includes("nationalIdBack")
                      )) && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <IdCard className="w-4 h-4" />
                          National ID (Back)
                        </h4>
                        <div
                          className="relative rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors"
                          onClick={() => {
                            const idUrl =
                              selectedGuide.guideApplicationData?.media?.nationalIdBack ||
                              selectedGuide.guideApplicationData?.mediaUrls?.find((url: string) =>
                                url.includes("nationalIdBack")
                              );
                            if (idUrl) {
                              const fullUrl =
                                idUrl && String(idUrl).startsWith("/")
                                  ? `${API_ORIGIN}${idUrl}`
                                  : idUrl;
                              setFullscreenImage(fullUrl);
                            }
                          }}
                        >
                          <img
                            src={
                              (() => {
                                const idUrl =
                                  selectedGuide.guideApplicationData?.media?.nationalIdBack ||
                                  selectedGuide.guideApplicationData?.mediaUrls?.find((url: string) =>
                                    url.includes("nationalIdBack")
                                  );
                                if (!idUrl) return "";
                                return idUrl && String(idUrl).startsWith("/")
                                  ? `${API_ORIGIN}${idUrl}`
                                  : idUrl;
                              })()
                            }
                            alt="National ID Back"
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="text-white opacity-0 hover:opacity-100 text-sm font-medium">
                              Click to view full screen
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tour Guide Certificate */}
                    {(selectedGuide.guideApplicationData?.media?.tourGuideCertificate ||
                      selectedGuide.guideApplicationData?.mediaUrls?.find((url: string) =>
                        url.includes("tourGuideCertificate") || url.includes("certificate")
                      )) && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Tour Guide Certificate
                        </h4>
                        <div
                          className="relative rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors"
                          onClick={() => {
                            const certUrl =
                              selectedGuide.guideApplicationData?.media?.tourGuideCertificate ||
                              selectedGuide.guideApplicationData?.mediaUrls?.find((url: string) =>
                                url.includes("tourGuideCertificate") || url.includes("certificate")
                              );
                            if (certUrl) {
                              const fullUrl =
                                certUrl && String(certUrl).startsWith("/")
                                  ? `${API_ORIGIN}${certUrl}`
                                  : certUrl;
                              setFullscreenImage(fullUrl);
                            }
                          }}
                        >
                          <img
                            src={
                              (() => {
                                const certUrl =
                                  selectedGuide.guideApplicationData?.media?.tourGuideCertificate ||
                                  selectedGuide.guideApplicationData?.mediaUrls?.find((url: string) =>
                                    url.includes("tourGuideCertificate") || url.includes("certificate")
                                  );
                                if (!certUrl) return "";
                                return certUrl && String(certUrl).startsWith("/")
                                  ? `${API_ORIGIN}${certUrl}`
                                  : certUrl;
                              })()
                            }
                            alt="Tour Guide Certificate"
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="text-white opacity-0 hover:opacity-100 text-sm font-medium">
                              Click to view full screen
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {!selectedGuide.guideApplicationData?.media?.personalPhoto &&
                    !selectedGuide.guideApplicationData?.media?.nationalIdFront &&
                    !selectedGuide.guideApplicationData?.media?.nationalIdBack &&
                    !selectedGuide.guideApplicationData?.media?.tourGuideCertificate &&
                    (!selectedGuide.guideApplicationData?.mediaUrls ||
                      selectedGuide.guideApplicationData?.mediaUrls.length === 0) && (
                    <p className="text-sm text-muted-foreground italic text-center py-4">
                      No media uploaded
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Experience Details */}
              {(selectedGuide.guideApplicationData?.experienceDetails ||
                selectedGuide.guideApplicationData?.experienceTypes ||
                selectedGuide.guideApplicationData?.specialties) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Experience Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedGuide.guideApplicationData?.experienceDetails?.experienceTypes && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Experience Types:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedGuide.guideApplicationData.experienceDetails.experienceTypes.map(
                              (type: string, idx: number) => (
                                <Badge key={idx} variant="outline">
                                  {type}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                      {selectedGuide.guideApplicationData?.experienceDetails?.specialties && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Specialties:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedGuide.guideApplicationData.experienceDetails.specialties.map(
                              (spec: string, idx: number) => (
                                <Badge key={idx} variant="secondary">
                                  {spec}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                      {selectedGuide.guideApplicationData?.experienceDetails?.previousExperience && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Previous Experience:</span>
                          <p className="text-foreground mt-1 leading-relaxed">
                            {selectedGuide.guideApplicationData.experienceDetails.previousExperience}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Assigned Hosts Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Assigned Hosts
            </h3>
            {isLoadingHosts ? (
            <div className="py-10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
              <span>Loading assigned hosts...</span>
            </div>
          ) : assignedHosts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No hosts assigned to this guide yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {assignedHosts.map((host) => {
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

                return (
                  <Card key={hostId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {host.name || personalInfo.fullName || "Host"}
                        </CardTitle>
                        <Badge variant="outline">
                          {experiences.length} Experience{experiences.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Email:</span>
                          {email ? (
                            <a href={`mailto:${email}`} className="text-primary hover:underline">
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
                            <a href={`tel:${phoneNumber}`} className="text-primary hover:underline">
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

                      {/* Reassign control */}
                      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-center border rounded-lg p-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <ArrowLeftRight className="w-4 h-4" />
                            Reassign guide
                          </label>
                          <Select
                            value={hostSelections[hostId] || NO_GUIDE_VALUE}
                            onValueChange={(value) =>
                              setHostSelections((prev) => ({
                                ...prev,
                                [hostId]:
                                  value === NO_GUIDE_VALUE ? NO_GUIDE_VALUE : value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select guide" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={NO_GUIDE_VALUE}>Remove guide</SelectItem>
                              {guides
                                .filter((g) => g && (g._id || g.id))
                                .map((g) => {
                                  const gId = String(g._id || g.id).trim();
                                  if (!gId) return null;
                                  return (
                                    <SelectItem key={gId} value={gId}>
                                      {g.name} {selectedGuide?._id === g._id ? "(current)" : ""}
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleReassign(hostId)}
                          disabled={isReassigningHostId === hostId}
                        >
                          {isReassigningHostId === hostId ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <ArrowLeftRight className="w-4 h-4 mr-2" />
                          )}
                          Apply
                        </Button>
                      </div>

                      {/* Experiences */}
                      {experiences.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Experiences
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {experiences.map((exp: any) => (
                              <Card key={exp._id || exp.id} className="bg-muted/50">
                                <CardContent className="p-4 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="font-semibold">{exp.title}</p>
                                    <Badge variant="outline">{exp.status || "active"}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {exp.location || "No location"} · {exp.duration || "Flexible"}
                                  </p>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-primary">ETB {exp.price}</span>
                                    <span className="text-muted-foreground">
                                      {exp.ratingsAverage?.toFixed(1) || "0.0"} ({exp.ratingsQuantity || 0})
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
          <DialogContent className="max-w-7xl max-h-[95vh] p-0">
            <div className="relative">
              <img
                src={fullscreenImage}
                alt="Fullscreen view"
                className="w-full h-auto max-h-[95vh] object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                onClick={() => setFullscreenImage(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
