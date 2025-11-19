import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  Users,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserCheck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { hostApplicationAPI, guidesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NO_GUIDE_VALUE = "__NO_GUIDE__";

export default function ManageHostApplications() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [guides, setGuides] = useState<any[]>([]);
  const [selectedGuideId, setSelectedGuideId] = useState<string>(""); // empty string means no guide
  const [isLoadingGuides, setIsLoadingGuides] = useState(false);
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

    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, navigate]);

  const fetchApplications = async () => {
    if (!isMountedRef.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await hostApplicationAPI.getPendingApplications();
      
      if (!isMountedRef.current) return;
      
      // Handle different response structures
      const applications = response?.data?.applications || response?.applications || [];
      setApplications(Array.isArray(applications) ? applications : []);
    } catch (err: any) {
      console.error("Failed to fetch applications:", err);
      
      if (!isMountedRef.current) return;
      
      setApplications([]); // Set empty array on error to prevent crashes
      const errorMessage = err.response?.data?.message || err.message || "Failed to load host applications";
      setError(errorMessage);
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

  const handleViewDetails = async (application: any) => {
    if (!application) {
      console.error("No application provided to handleViewDetails");
      return;
    }

    try {
      setSelectedApplication(application);
      setIsDetailsOpen(true);
      setSelectedGuideId("");
      setGuides([]); // Reset guides
      
      // Fetch guides filtered by host's location
      try {
        setIsLoadingGuides(true);
        const location = application?.personalInfo?.cityRegion;
        
        try {
          const response = await guidesAPI.getAll(location);
          
          if (!isMountedRef.current) return;
          
          // Backend returns: { status: 'success', data: { guides: [...] } }
          // guidesAPI.getAll returns response.data, so we get: { status: 'success', data: { guides: [...] } }
          let guides: any[] = [];
          
          try {
            if (response && typeof response === 'object') {
              // Try different response structures
              if (Array.isArray(response)) {
                guides = response;
              } else if (Array.isArray(response.data?.guides)) {
                guides = response.data.guides;
              } else if (Array.isArray(response.data?.data?.guides)) {
                guides = response.data.data.guides;
              } else if (Array.isArray(response.guides)) {
                guides = response.guides;
              }
            }
            
            // Filter and set guides safely
            if (isMountedRef.current) {
              const validGuides = Array.isArray(guides) 
                ? guides.filter(g => g && (g._id || g.id) && g.name)
                : [];
              setGuides(validGuides);
            }
          } catch (parseErr: any) {
            console.error("Error parsing guides response:", parseErr, response);
            if (isMountedRef.current) {
              setGuides([]);
            }
          }
        } catch (apiErr: any) {
          console.error("API error fetching guides:", apiErr);
          // Still show dialog even if guides fail to load
          if (isMountedRef.current) {
            setGuides([]);
          }
        }
      } catch (err: any) {
        console.error("Error in guides fetch:", err);
        // Still show dialog even if guides fail to load
        if (isMountedRef.current) {
          setGuides([]);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoadingGuides(false);
        }
      }
    } catch (err: any) {
      console.error("Error in handleViewDetails:", err);
      // Ensure dialog still opens even if there's an error
      if (isMountedRef.current) {
        setGuides([]);
      }
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      setIsProcessing(true);
      await hostApplicationAPI.approveApplication(applicationId, selectedGuideId || undefined);
      toast({
        title: "Application Approved",
        description: selectedGuideId ? "Host application has been approved and guide assigned successfully." : "Host application has been approved successfully.",
      });
      setIsDetailsOpen(false);
      setSelectedGuideId("");
      fetchApplications();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to approve application",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      await hostApplicationAPI.rejectApplication(applicationId, rejectionReason);
      toast({
        title: "Application Rejected",
        description: "Host application has been rejected.",
      });
      setIsDetailsOpen(false);
      setShowRejectDialog(false);
      setRejectionReason("");
      fetchApplications();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to reject application",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">{authLoading ? "Loading..." : "Loading applications..."}</p>
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
  if (error && applications.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <Card className="border-2 border-destructive max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-destructive mb-4">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Error Loading Applications</h3>
              </div>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchApplications} variant="outline" className="w-full">
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
                <UserCheck className="w-10 h-10 inline-block mr-3 text-primary" />
                Host Applications
              </>
            }
            description="Review and manage host applications"
          />
        </div>

        {/* Applications List */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Pending Applications</h3>
                  <p className="text-muted-foreground">
                    There are no host applications to review at this time.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.filter(app => app && app._id).map((application) => (
                  <motion.div
                    key={application._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="text-xl font-semibold">
                                {application.personalInfo?.fullName || "No Name"}
                              </h3>
                              {getStatusBadge(application.status)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {application.personalInfo?.email || "N/A"}
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {application.personalInfo?.phoneNumber || "N/A"}
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {application.personalInfo?.cityRegion || "N/A"}
                              </div>
                            </div>
                            {application.submittedAt && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                <Calendar className="w-4 h-4" />
                                Submitted: {(() => {
                                  try {
                                    return new Date(application.submittedAt).toLocaleDateString();
                                  } catch {
                                    return "Invalid date";
                                  }
                                })()}
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => handleViewDetails(application)}
                            variant="outline"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Application Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={(open) => {
        setIsDetailsOpen(open);
        if (!open) {
          // Reset state when dialog closes
          setSelectedApplication(null);
          setGuides([]);
          setSelectedGuideId("");
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Application Details</DialogTitle>
            <DialogDescription>
              Review the complete host application
            </DialogDescription>
          </DialogHeader>

          {isLoadingGuides && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading application details...</span>
            </div>
          )}

          {!isLoadingGuides && selectedApplication ? (
            <div className="space-y-6">
              {/* Personal Information */}
              {selectedApplication.personalInfo && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Full Name:</span>
                    <p className="text-muted-foreground">{selectedApplication.personalInfo?.fullName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-muted-foreground">{selectedApplication.personalInfo?.email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>
                    <p className="text-muted-foreground">{selectedApplication.personalInfo?.phoneNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium">City/Region:</span>
                    <p className="text-muted-foreground">{selectedApplication.personalInfo?.cityRegion}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Address:</span>
                    <p className="text-muted-foreground">{selectedApplication.personalInfo?.fullAddress || "Not provided"}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Languages Spoken:</span>
                    <p className="text-muted-foreground">
                      {Array.isArray(selectedApplication.personalInfo?.languagesSpoken) 
                        ? selectedApplication.personalInfo.languagesSpoken.filter((lang: any) => lang && typeof lang === 'string').join(", ") || "Not provided"
                        : "Not provided"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">About:</span>
                    <p className="text-muted-foreground">{selectedApplication.personalInfo?.aboutYou || "Not provided"}</p>
                  </div>
                </div>
              </div>
              )}

              {/* Experience Details */}
              {selectedApplication.experienceDetails?.previousExperience && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Experience Details
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.experienceDetails.previousExperience}
                  </p>
                </div>
              )}

              {/* Media/Documents */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Uploaded Media (Click to view full screen)
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedApplication.media?.nationalIdFront && (
                      <div>
                        <p className="font-medium text-sm mb-2">National ID - Front:</p>
                        <img
                          src={selectedApplication.media.nationalIdFront}
                          alt="National ID Front"
                          className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setFullscreenImage(selectedApplication.media.nationalIdFront)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {selectedApplication.media?.nationalIdBack && (
                      <div>
                        <p className="font-medium text-sm mb-2">National ID - Back:</p>
                        <img
                          src={selectedApplication.media.nationalIdBack}
                          alt="National ID Back"
                          className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setFullscreenImage(selectedApplication.media.nationalIdBack)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {selectedApplication.media?.personalPhoto && (
                    <div>
                      <p className="font-medium text-sm mb-2">Personal Photo:</p>
                      <img
                        src={selectedApplication.media.personalPhoto}
                        alt="Personal"
                        className="w-48 h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setFullscreenImage(selectedApplication.media.personalPhoto)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {Array.isArray(selectedApplication.media?.hostingEnvironmentPhotos) && 
                   selectedApplication.media.hostingEnvironmentPhotos.length > 0 && (
                    <div>
                      <p className="font-medium text-sm mb-2">Hosting Environment Photos:</p>
                      <div className="grid grid-cols-3 gap-4">
                        {selectedApplication.media.hostingEnvironmentPhotos
                          .filter((photo: any) => photo && typeof photo === 'string')
                          .map((photo: string, index: number) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Environment ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setFullscreenImage(photo)}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {!selectedApplication.media?.nationalIdFront && 
                   !selectedApplication.media?.nationalIdBack &&
                   !selectedApplication.media?.personalPhoto && 
                   (!selectedApplication.media?.hostingEnvironmentPhotos || 
                    selectedApplication.media.hostingEnvironmentPhotos.length === 0) && (
                    <p className="text-sm text-muted-foreground italic">No media uploaded</p>
                  )}
                </div>
              </div>

              {/* Guide Assignment */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-3">Assign Guide (Optional)</h3>
                <div className="space-y-2">
                  <Label htmlFor="guideSelect">Select a guide to assign to this host:</Label>
                  {isLoadingGuides ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading guides...
                    </div>
                  ) : guides.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No guides available. You can approve without assigning a guide.</p>
                  ) : (
                  <Select 
                    value={selectedGuideId || NO_GUIDE_VALUE} 
                    onValueChange={(value) => {
                      try {
                        if (value === NO_GUIDE_VALUE) {
                          setSelectedGuideId("");
                        } else {
                          setSelectedGuideId(value);
                        }
                      } catch (err) {
                        console.error("Error setting selected guide:", err);
                      }
                    }}
                  >
                      <SelectTrigger id="guideSelect">
                        <SelectValue placeholder="Select a guide (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value={NO_GUIDE_VALUE}>None (Approve without guide)</SelectItem>
                        {guides
                          .filter((guide) => {
                            if (!guide) return false;
                            const guideId = guide._id ?? guide.id;
                            const value = typeof guideId === "string" ? guideId.trim() : guideId;
                            return Boolean(value) && Boolean(guide.name);
                          })
                          .map((guide) => {
                            try {
                              const guideId = guide._id ?? guide.id;
                              if (!guideId) return null;
                              const value = String(guideId).trim();
                              if (!value) return null;
                              return (
                                <SelectItem key={value} value={value}>
                                  {String(guide.name || "Unknown")} - {String(guide.location || "No location")}
                                </SelectItem>
                              );
                            } catch (err) {
                              console.error("Error rendering guide item:", err, guide);
                              return null;
                            }
                          })}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedApplication.personalInfo?.cityRegion && (
                    <p className="text-xs text-muted-foreground">
                      Showing guides from: {selectedApplication.personalInfo.cityRegion}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedApplication && selectedApplication._id && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    try {
                      if (selectedApplication?._id) {
                        handleApprove(selectedApplication._id);
                      }
                    } catch (err) {
                      console.error("Error approving application:", err);
                    }
                  }}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Approve Application
                </Button>
                <Button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isProcessing}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Application
                </Button>
              </div>
              )}
            </div>
          ) : !isLoadingGuides ? (
            <div className="flex items-center justify-center py-8">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <span className="ml-3 text-muted-foreground">No application data available</span>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleReject(selectedApplication._id)}
                disabled={isProcessing || !rejectionReason.trim()}
                variant="destructive"
                className="flex-1"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Viewer */}
      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {fullscreenImage && (
              <img
                src={fullscreenImage}
                alt="Full screen view"
                className="max-w-full max-h-[90vh] object-contain"
                onClick={() => setFullscreenImage(null)}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white"
              onClick={() => setFullscreenImage(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

