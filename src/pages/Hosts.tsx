import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  Users,
  MapPin,
  Loader2,
  Eye,
  Star,
  Calendar,
  Mail,
  Languages,
  Briefcase,
} from "lucide-react";
import { hostsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Hosts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hosts, setHosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHost, setSelectedHost] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    try {
      setIsLoading(true);
      const response = await hostsAPI.getAll();
      setHosts(response.data.hosts || []);
    } catch (err: any) {
      console.error("Failed to fetch hosts:", err);
      toast({
        title: "Error",
        description: "Failed to load hosts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (host: any) => {
    setSelectedHost(host);
    setIsDetailsOpen(true);
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
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
                Meet Our <span className="text-secondary">Hosts</span>
              </h1>
              <p className="text-lg text-primary-foreground/90">
                Discover authentic Ethiopian experiences from local hosts who are passionate 
                about sharing their culture, traditions, and homes.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Hosts Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {hosts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Hosts Yet</h3>
                  <p className="text-muted-foreground">
                    Check back soon to meet our Ethiopian hosts!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hosts.map((host, index) => (
                  <motion.div
                    key={host._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary to-earth rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {host.name?.charAt(0) || "H"}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">
                              {host.name}
                            </h3>
                            {host.personalInfo?.cityRegion && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {host.personalInfo.cityRegion}
                              </p>
                            )}
                          </div>
                        </div>

                        {host.personalInfo?.aboutYou && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {host.personalInfo.aboutYou}
                          </p>
                        )}

                        {host.personalInfo?.languagesSpoken && host.personalInfo.languagesSpoken.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <Languages className="w-3 h-3" />
                              Languages:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {host.personalInfo.languagesSpoken.slice(0, 3).map((lang: string) => (
                                <Badge key={lang} variant="outline" className="text-xs">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-sm">
                            <span className="font-semibold text-primary">
                              {host.totalExperiences}
                            </span>
                            <span className="text-muted-foreground ml-1">
                              {host.totalExperiences === 1 ? "Experience" : "Experiences"}
                            </span>
                          </div>
                          <Button
                            onClick={() => handleViewDetails(host)}
                            variant="outline"
                            size="sm"
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

      {/* Host Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-earth rounded-full flex items-center justify-center text-white font-bold text-lg">
                {selectedHost?.name?.charAt(0) || "H"}
              </div>
              {selectedHost?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedHost && (
            <div className="space-y-6">
              {/* Host Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  About the Host
                </h3>
                <div className="space-y-3 text-sm">
                  {selectedHost.personalInfo?.cityRegion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Location:</span>
                      <span className="text-muted-foreground">{selectedHost.personalInfo.cityRegion}</span>
                    </div>
                  )}
                  
                  {selectedHost.personalInfo?.languagesSpoken && selectedHost.personalInfo.languagesSpoken.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Languages className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="font-medium">Languages:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedHost.personalInfo.languagesSpoken.map((lang: string) => (
                          <Badge key={lang} variant="outline">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedHost.personalInfo?.aboutYou && (
                    <div className="pt-2">
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedHost.personalInfo.aboutYou}
                      </p>
                    </div>
                  )}

                  {selectedHost.experienceDetails?.previousExperience && (
                    <div className="pt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Experience:</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed pl-6">
                        {selectedHost.experienceDetails.previousExperience}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Host's Experiences */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Experiences ({selectedHost.experiences?.length || 0})
                </h3>
                {selectedHost.experiences && selectedHost.experiences.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedHost.experiences.map((experience: any) => (
                      <Card
                        key={experience._id || experience.id}
                        className="hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setIsDetailsOpen(false);
                          navigate(`/experiences/${experience._id || experience.id}`);
                        }}
                      >
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">{experience.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {experience.summary || experience.description}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {experience.location}
                            </span>
                            <span className="font-semibold text-primary">
                              ETB {experience.price}
                            </span>
                          </div>
                          {experience.duration && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                              <Calendar className="w-3 h-3" />
                              {experience.duration}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic text-center py-8">
                    This host hasn't created any experiences yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

