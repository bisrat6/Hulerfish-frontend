import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { hostApplicationAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Loader2, User, Coffee, Upload, CheckCircle, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";

const steps = [
  { id: 1, name: "Personal Info", icon: User },
  { id: 2, name: "Experience Details", icon: Coffee },
  { id: 3, name: "Media Upload", icon: Upload },
  { id: 4, name: "Review & Submit", icon: CheckCircle },
];

const languages = ["Amharic", "English", "Oromiffa", "Tigrinya", "French", "Arabic"];

export default function HostApplication() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: user?.email || "",
    phoneNumber: "",
    cityRegion: "",
    fullAddress: "",
    languagesSpoken: [] as string[],
    aboutYou: "",
  });

  const [experienceDetails, setExperienceDetails] = useState({
    experienceTypes: [] as string[],
    specialties: [] as string[],
    previousExperience: "",
  });

  const [media, setMedia] = useState({
    nationalIdFront: "",
    nationalIdBack: "",
    personalPhoto: "",
    hostingEnvironmentPhotos: [] as string[],
  });

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<{
    nationalIdFront: File | null;
    nationalIdBack: File | null;
    personalPhoto: File | null;
    hostingEnvironmentPhotos: File[];
  }>({
    nationalIdFront: null,
    nationalIdBack: null,
    personalPhoto: null,
    hostingEnvironmentPhotos: [],
  });

  const [filePreviews, setFilePreviews] = useState<{
    nationalIdFront: string | null;
    nationalIdBack: string | null;
    personalPhoto: string | null;
    hostingEnvironmentPhotos: string[];
  }>({
    nationalIdFront: null,
    nationalIdBack: null,
    personalPhoto: null,
    hostingEnvironmentPhotos: [],
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.hostStatus === "approved") {
      navigate("/profile");
      toast({
        title: "Already a host",
        description: "You are already an approved host.",
      });
      return;
    }

    fetchApplication();
  }, [isAuthenticated, user, navigate, toast]);

  const fetchApplication = async () => {
    try {
      setIsLoading(true);
      const response = await hostApplicationAPI.getMyApplication();
      if (response.data?.application) {
        const app = response.data.application;
        setApplicationStatus(app.status);
        
        if (app.personalInfo) setPersonalInfo({ ...personalInfo, ...app.personalInfo });
        if (app.experienceDetails) setExperienceDetails({ ...experienceDetails, ...app.experienceDetails });
        if (app.media) setMedia({ ...media, ...app.media });
        
        // If application is pending, show final step (review) in read-only mode
        if (app.status === "pending") {
          setCurrentStep(4);
        }
      }
    } catch (error: any) {
      console.error("Error fetching application:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate personal info
      if (!personalInfo.fullName || !personalInfo.email || !personalInfo.phoneNumber || 
          !personalInfo.cityRegion || !personalInfo.aboutYou || personalInfo.languagesSpoken.length === 0) {
        toast({
          title: "Missing fields",
          description: "Please fill out all required fields.",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);
        await hostApplicationAPI.createOrUpdate(personalInfo);
        setCurrentStep(2);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to save personal information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 2) {
      try {
        setIsLoading(true);
        await hostApplicationAPI.updateExperienceDetails(experienceDetails);
        setCurrentStep(3);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to save experience details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 3) {
      // Media step - user can skip or upload files directly
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (fieldName === 'nationalIdFront' || fieldName === 'nationalIdBack' || fieldName === 'personalPhoto') {
      const file = files[0];
      setSelectedFiles({ ...selectedFiles, [fieldName]: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews({ ...filePreviews, [fieldName]: reader.result as string });
      };
      reader.readAsDataURL(file);
    } else if (fieldName === 'hostingEnvironmentPhotos') {
      const fileArray = Array.from(files).slice(0, 5); // Max 5 files
      setSelectedFiles({ ...selectedFiles, hostingEnvironmentPhotos: fileArray });
      
      // Create previews
      const previews: string[] = [];
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          if (previews.length === fileArray.length) {
            setFilePreviews({ ...filePreviews, hostingEnvironmentPhotos: previews });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Upload files to server
  const handleUploadFiles = async () => {
    const formData = new FormData();
    
    if (selectedFiles.nationalIdFront) {
      formData.append('nationalIdFront', selectedFiles.nationalIdFront);
    }
    if (selectedFiles.nationalIdBack) {
      formData.append('nationalIdBack', selectedFiles.nationalIdBack);
    }
    if (selectedFiles.personalPhoto) {
      formData.append('personalPhoto', selectedFiles.personalPhoto);
    }
    selectedFiles.hostingEnvironmentPhotos.forEach((file) => {
      formData.append('hostingEnvironmentPhotos', file);
    });

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const response = await hostApplicationAPI.uploadMedia(formData);
      
      setUploadProgress(100);
      
      // Update media state with uploaded URLs
      const uploadedFiles = response.data.uploadedFiles;
      setMedia({
        nationalIdFront: uploadedFiles.nationalIdFront || media.nationalIdFront,
        nationalIdBack: uploadedFiles.nationalIdBack || media.nationalIdBack,
        personalPhoto: uploadedFiles.personalPhoto || media.personalPhoto,
        hostingEnvironmentPhotos: [...media.hostingEnvironmentPhotos, ...uploadedFiles.hostingEnvironmentPhotos],
      });
      
      toast({
        title: "Upload successful!",
        description: "Your files have been uploaded successfully.",
      });
      
      // Clear selected files and previews
      setSelectedFiles({
        nationalIdFront: null,
        nationalIdBack: null,
        personalPhoto: null,
        hostingEnvironmentPhotos: [],
      });
      setFilePreviews({
        nationalIdFront: null,
        nationalIdBack: null,
        personalPhoto: null,
        hostingEnvironmentPhotos: [],
      });
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.response?.data?.message || "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await hostApplicationAPI.submitApplication();
      toast({
        title: "Application submitted!",
        description: "Your host application has been submitted for review.",
      });
      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLanguage = (language: string) => {
    setPersonalInfo({
      ...personalInfo,
      languagesSpoken: personalInfo.languagesSpoken.includes(language)
        ? personalInfo.languagesSpoken.filter((l) => l !== language)
        : [...personalInfo.languagesSpoken, language],
    });
  };

  if (isLoading && !personalInfo.fullName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary via-primary-light to-earth">
      <Navigation />
      <main className="flex-1 pt-16 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        currentStep >= step.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-muted"
                      }`}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>
                    <p className={`mt-2 text-sm ${currentStep >= step.id ? "font-semibold" : "text-muted-foreground"}`}>
                      {step.name}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Application Status Banner */}
          {applicationStatus === "pending" && (
            <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Application Under Review</h3>
                  <p className="text-sm text-yellow-800">
                    Your host application has been submitted and is currently being reviewed by our team. 
                    We'll notify you once a decision is made.
                  </p>
                </div>
              </div>
            </div>
          )}

          {applicationStatus === "rejected" && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">Application Rejected</h3>
                  <p className="text-sm text-red-800 mb-3">
                    Unfortunately, your host application was not approved at this time. 
                    You can update your information and reapply.
                  </p>
                  <Button
                    onClick={async () => {
                      try {
                        await hostApplicationAPI.reapplyApplication();
                        toast({
                          title: "Ready to Reapply",
                          description: "You can now update your application and submit again.",
                        });
                        setApplicationStatus("draft");
                        setCurrentStep(1);
                        
                        // Clear media state (user needs to re-upload)
                        setMedia({
                          nationalIdFront: "",
                          nationalIdBack: "",
                          personalPhoto: "",
                          hostingEnvironmentPhotos: [],
                        });
                        setSelectedFiles({
                          nationalIdFront: null,
                          nationalIdBack: null,
                          personalPhoto: null,
                          hostingEnvironmentPhotos: [],
                        });
                        setFilePreviews({
                          nationalIdFront: null,
                          nationalIdBack: null,
                          personalPhoto: null,
                          hostingEnvironmentPhotos: [],
                        });
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.response?.data?.message || "Failed to reset application",
                          variant: "destructive",
                        });
                      }
                    }}
                    variant="destructive"
                    size="sm"
                  >
                    Reapply Now
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Form Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {currentStep === 1 && <><User className="w-5 h-5" /> Personal Information</>}
                    {currentStep === 2 && <><Coffee className="w-5 h-5" /> Experience Details</>}
                    {currentStep === 3 && <><Upload className="w-5 h-5" /> Media Upload</>}
                    {currentStep === 4 && <><CheckCircle className="w-5 h-5" /> Review & Submit</>}
                  </CardTitle>
                  <CardDescription>
                    {currentStep === 1 && "Please provide your personal information"}
                    {currentStep === 2 && "Tell us about your experience"}
                    {currentStep === 3 && "Upload photos and documents"}
                    {currentStep === 4 && applicationStatus === "pending" ? "Application submitted and under review" : "Review your application before submitting"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={personalInfo.fullName}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                        <Input
                          id="phoneNumber"
                          value={personalInfo.phoneNumber}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })}
                          placeholder="+251 xxx xxx xxx"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cityRegion">City/Region *</Label>
                        <Input
                          id="cityRegion"
                          value={personalInfo.cityRegion}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, cityRegion: e.target.value })}
                          placeholder="Addis Ababa, Ethiopia"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="fullAddress">Full Address</Label>
                        <Textarea
                          id="fullAddress"
                          value={personalInfo.fullAddress}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, fullAddress: e.target.value })}
                          placeholder="Your full address where the experience will take place"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Languages Spoken *</Label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          {languages.map((lang) => (
                            <div key={lang} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={lang}
                                checked={personalInfo.languagesSpoken.includes(lang)}
                                onChange={() => toggleLanguage(lang)}
                                className="w-4 h-4"
                              />
                              <Label htmlFor={lang} className="cursor-pointer">{lang}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="aboutYou">About You *</Label>
                        <Textarea
                          id="aboutYou"
                          value={personalInfo.aboutYou}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, aboutYou: e.target.value })}
                          placeholder="Tell us about yourself, your background, and why you want to become a host..."
                          rows={5}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Experience Details */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="previousExperience">Previous Experience</Label>
                        <Textarea
                          id="previousExperience"
                          value={experienceDetails.previousExperience}
                          onChange={(e) => setExperienceDetails({ ...experienceDetails, previousExperience: e.target.value })}
                          placeholder="Tell us about your previous experience as a host or in the tourism industry..."
                          rows={5}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Media Upload */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                          Upload required documents: front and back of your National ID, a personal photo, and photos of your hosting environment (max 5MB per file).
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nationalIdFront">National ID - Front Side *</Label>
                          <Input
                            id="nationalIdFront"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'nationalIdFront')}
                            className="cursor-pointer"
                          />
                          {filePreviews.nationalIdFront && (
                            <div className="mt-2">
                              <img 
                                src={filePreviews.nationalIdFront} 
                                alt="National ID Front preview" 
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                            </div>
                          )}
                          {media.nationalIdFront && !filePreviews.nationalIdFront && (
                            <div className="mt-2 text-sm text-green-600">
                              ✓ Front uploaded
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="nationalIdBack">National ID - Back Side *</Label>
                          <Input
                            id="nationalIdBack"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'nationalIdBack')}
                            className="cursor-pointer"
                          />
                          {filePreviews.nationalIdBack && (
                            <div className="mt-2">
                              <img 
                                src={filePreviews.nationalIdBack} 
                                alt="National ID Back preview" 
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                            </div>
                          )}
                          {media.nationalIdBack && !filePreviews.nationalIdBack && (
                            <div className="mt-2 text-sm text-green-600">
                              ✓ Back uploaded
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="personalPhoto">Personal Photo *</Label>
                        <Input
                          id="personalPhoto"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'personalPhoto')}
                          className="cursor-pointer"
                        />
                        {filePreviews.personalPhoto && (
                          <div className="mt-2">
                            <img 
                              src={filePreviews.personalPhoto} 
                              alt="Personal photo preview" 
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                        {media.personalPhoto && !filePreviews.personalPhoto && (
                          <div className="mt-2 text-sm text-green-600">
                            ✓ Personal photo uploaded
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="hostingEnvironmentPhotos">Hosting Environment Photos (max 5) *</Label>
                        <Input
                          id="hostingEnvironmentPhotos"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileChange(e, 'hostingEnvironmentPhotos')}
                          className="cursor-pointer"
                        />
                        {filePreviews.hostingEnvironmentPhotos.length > 0 && (
                          <div className="mt-2 grid grid-cols-4 gap-2">
                            {filePreviews.hostingEnvironmentPhotos.map((preview, index) => (
                              <img 
                                key={index}
                                src={preview} 
                                alt={`Environment ${index + 1}`} 
                                className="w-20 h-20 object-cover rounded-lg border"
                              />
                            ))}
                          </div>
                        )}
                        {media.hostingEnvironmentPhotos.length > 0 && filePreviews.hostingEnvironmentPhotos.length === 0 && (
                          <div className="mt-2 text-sm text-green-600">
                            ✓ {media.hostingEnvironmentPhotos.length} environment photos uploaded
                          </div>
                        )}
                      </div>

                      {(selectedFiles.nationalIdFront || selectedFiles.nationalIdBack || selectedFiles.personalPhoto || 
                        selectedFiles.hostingEnvironmentPhotos.length > 0) && (
                        <div className="pt-4">
                          <Button
                            onClick={handleUploadFiles}
                            disabled={isUploading}
                            className="w-full"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading... {uploadProgress}%
                              </>
                            ) : (
                              "Upload Files"
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4: Review & Submit */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Personal Information</h3>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p><strong>Name:</strong> {personalInfo.fullName}</p>
                          <p><strong>Email:</strong> {personalInfo.email}</p>
                          <p><strong>Phone:</strong> {personalInfo.phoneNumber}</p>
                          <p><strong>City/Region:</strong> {personalInfo.cityRegion}</p>
                          <p><strong>Languages:</strong> {personalInfo.languagesSpoken.join(", ")}</p>
                        </div>
                      </div>
                      
                      {experienceDetails.previousExperience && (
                        <div>
                          <h3 className="font-semibold mb-2">Experience Details</h3>
                          <p className="text-sm text-muted-foreground">{experienceDetails.previousExperience}</p>
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold mb-2">Uploaded Documents</h3>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          {media.nationalIdFront ? (
                            <p className="text-green-600">✓ National ID (Front) uploaded</p>
                          ) : (
                            <p className="text-red-600">✗ National ID (Front) required</p>
                          )}
                          {media.nationalIdBack ? (
                            <p className="text-green-600">✓ National ID (Back) uploaded</p>
                          ) : (
                            <p className="text-red-600">✗ National ID (Back) required</p>
                          )}
                          {media.personalPhoto ? (
                            <p className="text-green-600">✓ Personal photo uploaded</p>
                          ) : (
                            <p className="text-red-600">✗ Personal photo required</p>
                          )}
                          {media.hostingEnvironmentPhotos.length > 0 ? (
                            <p className="text-green-600">✓ {media.hostingEnvironmentPhotos.length} environment photos uploaded</p>
                          ) : (
                            <p className="text-red-600">✗ At least 1 environment photo required</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-6">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1 || isLoading}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    {currentStep < 4 ? (
                      <Button
                        onClick={handleNext}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : applicationStatus === "pending" ? (
                      <Button
                        onClick={() => navigate("/profile")}
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        Back to Profile
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !media.nationalIdFront || !media.nationalIdBack || !media.personalPhoto || media.hostingEnvironmentPhotos.length === 0}
                        className="w-full sm:w-auto"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Submit Application
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
