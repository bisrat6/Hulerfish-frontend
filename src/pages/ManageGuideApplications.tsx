import { useState, useEffect } from "react";
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
import { guideApplicationAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ManageGuideApplications() {
  const { user } = useAuth();
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

    fetchApplications();
  }, [user, navigate, toast]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const response = await guideApplicationAPI.getPendingApplications();
      setApplications(response.data.applications || []);
    } catch (err: any) {
      console.error("Failed to fetch applications:", err);
      toast({
        title: "Error",
        description: "Failed to load guide applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application);
    setIsDetailsOpen(true);
  };

  const handleApprove = async (applicationId: string) => {
    try {
      setIsProcessing(true);
      await guideApplicationAPI.approveApplication(applicationId);
      toast({
        title: "Application Approved",
        description: "Guide application has been approved successfully.",
      });
      setIsDetailsOpen(false);
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
      await guideApplicationAPI.rejectApplication(applicationId, rejectionReason);
      toast({
        title: "Application Rejected",
        description: "Guide application has been rejected.",
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">Loading applications...</p>
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
                Guide Applications
              </>
            }
            description="Review and manage guide applications"
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
                    There are no guide applications to review at this time.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
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
                                Submitted: {new Date(application.submittedAt).toLocaleDateString()}
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
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Application Details</DialogTitle>
            <DialogDescription>
              Review the complete guide application
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Personal Information */}
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
                      {selectedApplication.personalInfo?.languagesSpoken?.join(", ") || "Not provided"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">About:</span>
                    <p className="text-muted-foreground">{selectedApplication.personalInfo?.aboutYou || "Not provided"}</p>
                  </div>
                </div>
              </div>

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
                      />
                    </div>
                  )}

                  {selectedApplication.media?.tourGuideCertificate && (
                    <div>
                      <p className="font-medium text-sm mb-2">Tour Guide Certificate:</p>
                      {selectedApplication.media.tourGuideCertificate.endsWith('.pdf') || selectedApplication.media.tourGuideCertificate.includes('pdf') ? (
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <a
                            href={selectedApplication.media.tourGuideCertificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View PDF Certificate
                          </a>
                        </div>
                      ) : (
                        <img
                          src={selectedApplication.media.tourGuideCertificate}
                          alt="Tour Guide Certificate"
                          className="w-full h-64 object-contain rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setFullscreenImage(selectedApplication.media.tourGuideCertificate)}
                        />
                      )}
                    </div>
                  )}

                  {!selectedApplication.media?.nationalIdFront && 
                   !selectedApplication.media?.nationalIdBack &&
                   !selectedApplication.media?.personalPhoto && 
                   !selectedApplication.media?.tourGuideCertificate && (
                    <p className="text-sm text-muted-foreground italic">No media uploaded</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => handleApprove(selectedApplication._id)}
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
            </div>
          )}
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

