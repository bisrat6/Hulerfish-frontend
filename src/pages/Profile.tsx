import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { User, Mail, LogOut, Edit, Save, X, BarChart3, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usersAPI } from "@/lib/api";

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  const handleSave = async () => {
    if (!name || !email) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await usersAPI.updateMe({ name, email });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      setIsEditing(false);
      // Update local storage with new user data
      const updatedUser = { ...(user as any), name, email };
      updateUser(updatedUser as any);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description:
          error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        <section className="relative bg-gradient-to-br from-primary via-primary-light to-earth py-24 text-primary-foreground">
          <div className="absolute inset-0 pattern-ethiopian opacity-10" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl md:text-6xl font-bold text-center"
            >
              My Profile
            </motion.h1>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">
                      Account Information
                    </CardTitle>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <User className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Name</p>
                      {isEditing ? (
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={isLoading}
                        />
                      ) : (
                        <p className="font-semibold">{user?.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                        />
                      ) : (
                        <p className="font-semibold">{user?.email}</p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="hero"
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}

                  <div className="pt-4 border-t space-y-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/my-bookings")}
                      className="w-full"
                    >
                      My Bookings
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/my-reviews")}
                      className="w-full"
                    >
                      {user?.role === "admin" ? "All Reviews" : "My Reviews"}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/update-password")}
                      className="w-full"
                    >
                      Change Password
                    </Button>

                    {/* Admin Only Links */}
                    {user?.role === "admin" && (
                      <>
                        <div className="pt-4 border-t">
                          <p className="text-sm font-medium text-muted-foreground mb-3">
                            Admin Panel
                          </p>
                        </div>
                        <Button
                          variant="hero"
                          size="lg"
                          onClick={() => navigate("/admin/dashboard")}
                          className="w-full"
                        >
                          Admin Dashboard
                        </Button>
                      </>
                    )}

                    {/* Host Application */}
                    {user?.hostStatus !== "approved" && user?.role !== "admin" && (
                      <>
                        <div className="pt-4 border-t">
                          <p className="text-sm font-medium text-muted-foreground mb-3">
                            Become a Host
                          </p>
                        </div>
                        <Button
                          variant="hero"
                          size="lg"
                          onClick={() => navigate("/host-application")}
                          className="w-full"
                          disabled={user?.hostStatus === "pending"}
                        >
                          {user?.hostStatus === "pending"
                            ? "Application Pending Review"
                            : "Apply to Become a Host"}
                        </Button>
                      </>
                    )}

                    {/* Host Panel - For Approved Hosts */}
                    {user?.hostStatus === "approved" && user?.role !== "admin" && (
                      <>
                        <div className="pt-4 border-t">
                          <p className="text-sm font-medium text-muted-foreground mb-3">
                            Host Panel
                          </p>
                        </div>
                        <Button
                          variant="hero"
                          size="lg"
                          onClick={() => navigate("/admin/experiences")}
                          className="w-full"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          Manage My Experiences
                        </Button>
                      </>
                    )}

                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={handleLogout}
                      className="w-full"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
