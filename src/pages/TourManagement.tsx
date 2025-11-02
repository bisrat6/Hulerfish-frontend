import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Loader2,
  AlertCircle,
  Save,
  X,
  Search,
} from "lucide-react";
import { experiencesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TourManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [experiences, setExperiences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    summary: "",
    price: "",
    duration: "",
    maxGuests: "",
    location: "",
    imageCover: "",
    images: "",
  });

  useEffect(() => {
    // Redirect if not admin or approved host
    if (!["admin"].includes(user?.role || "") && (user as any)?.hostStatus !== "approved") {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "Admin or approved host access required",
        variant: "destructive",
      });
      return;
    }

    fetchExperiences();
  }, [user, navigate, toast]);

  const fetchExperiences = async () => {
    try {
      setIsLoading(true);
      const response = await experiencesAPI.getAll();
      // If current user is a host (not admin), only show experiences they created
      let experiencesList = response.data.data || [];
      if (user?.role !== "admin") {
        const userId = (user as any)._id ?? (user as any).id;
        experiencesList = experiencesList.filter((exp: any) =>
          String(exp.host?._id ?? exp.host ?? exp.hostId) === String(userId)
        );
      }
      setExperiences(experiencesList);
    } catch (err: any) {
      console.error("Failed to fetch experiences:", err);
      setError("Failed to load experiences");
      toast({
        title: "Error",
        description: "Failed to load experiences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingExperience(null);
    setFormData({
      title: "",
      description: "",
      summary: "",
      price: "",
      duration: "",
      maxGuests: "",
      location: "",
      imageCover: "",
      images: "",
    });
    setShowForm(true);
  };

  const handleEdit = (experience: any) => {
    setEditingExperience(experience);
    setFormData({
      title: experience.title || "",
      description: experience.description || "",
      summary: experience.summary || "",
      price: experience.price?.toString() || "",
      duration: experience.duration?.toString() || "",
      maxGuests: experience.maxGuests?.toString() || "",
      location: experience.location || "",
      imageCover: experience.imageCover || "",
      images: experience.images?.join(", ") || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.duration ||
      !formData.maxGuests ||
      !formData.location ||
      !formData.imageCover
    ) {
      toast({
        title: "Missing fields",
        description:
          "Please fill in title, description, price, duration, max guests, location, and cover image",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const experienceData = {
        title: formData.title,
        description: formData.description,
        summary: formData.summary,
        price: parseFloat(formData.price),
        duration: formData.duration,
        maxGuests: parseInt(formData.maxGuests) || 10,
        location: formData.location,
        imageCover: formData.imageCover,
        images: formData.images
          ? formData.images
              .split(",")
              .map((img) => img.trim())
              .filter((img) => img)
          : [],
      };

      if (editingExperience) {
        await experiencesAPI.update(editingExperience._id || editingExperience.id, experienceData);
        toast({
          title: "Success",
          description: "Experience updated successfully",
        });
      } else {
        await experiencesAPI.create(experienceData);
        toast({
          title: "Success",
          description: "Experience created successfully",
        });
      }

      setShowForm(false);
      setEditingExperience(null);
      fetchExperiences();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to save experience",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await experiencesAPI.delete(id);
      toast({
        title: "Success",
        description: "Experience deleted successfully",
      });
      setExperiences(experiences.filter((exp) => (exp._id || exp.id) !== id));
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete experience",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  const filteredExperiences = experiences.filter((exp) => {
    const matchesSearch =
      exp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">Loading experiences...</p>
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
                <MapPin className="w-12 h-12" />
                Experience Management
              </h1>
              <p className="text-lg text-primary-foreground/90">
                Create, update, and manage all experiences on the platform.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search experiences..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                {(user?.role === "admin" || (user as any)?.hostStatus === "approved") && (
                  <Button onClick={handleCreate} variant="hero">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Experience
                  </Button>
                )}
              </div>
            </div>

            {/* Experience Form */}
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>
                      {editingExperience ? "Edit Experience" : "Create New Experience"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="title">Experience Title *</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({ ...formData, title: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Price (ETB) *</Label>
                          <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                price: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration">Duration *</Label>
                          <Input
                            id="duration"
                            value={formData.duration}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                duration: e.target.value,
                              })
                            }
                            placeholder="e.g., 2 hours, 1 day"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxGuests">Max Guests *</Label>
                          <Input
                            id="maxGuests"
                            type="number"
                            value={formData.maxGuests}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                maxGuests: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="location">Location *</Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                location: e.target.value,
                              })
                            }
                            placeholder="e.g., Addis Ababa, Ethiopia"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="summary">Summary</Label>
                        <Textarea
                          id="summary"
                          value={formData.summary}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              summary: e.target.value,
                            })
                          }
                          rows={2}
                          placeholder="Brief description..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          rows={5}
                          placeholder="Full description of the experience..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="imageCover">Cover Image URL *</Label>
                          <Input
                            id="imageCover"
                            value={formData.imageCover}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                imageCover: e.target.value,
                              })
                            }
                            placeholder="https://example.com/cover.jpg"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="images">
                            Additional Image URLs (comma separated)
                          </Label>
                          <Input
                            id="images"
                            value={formData.images}
                            onChange={(e) =>
                              setFormData({ ...formData, images: e.target.value })
                            }
                            placeholder="url1, url2, url3"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          disabled={submitting}
                          variant="hero"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              {editingExperience ? "Update Experience" : "Create Experience"}
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowForm(false);
                            setEditingExperience(null);
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Experiences List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiences.map((experience, index) => (
                <motion.div
                  key={experience._id || experience.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 hover:border-primary/20 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">
                            {experience.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {experience.summary || experience.description}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {(() => {
                            const userId =
                              (user as any)?._id ?? (user as any)?.id;
                            const canModify =
                              user?.role === "admin" ||
                              ((user as any)?.hostStatus === "approved" &&
                                String(experience.host?._id ?? experience.host) === String(userId));
                            if (!canModify) return null;
                            return (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(experience)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeleteId(experience._id || experience.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-semibold text-primary">
                            ETB {experience.price}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Duration:
                          </span>
                          <span>{experience.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Max Guests:
                          </span>
                          <span>{experience.maxGuests} people</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Location:
                          </span>
                          <span className="text-right">{experience.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredExperiences.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">
                  {searchTerm
                    ? "No experiences match your search"
                    : "No experiences available. Create your first experience!"}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Experience</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this experience? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default TourManagement;
