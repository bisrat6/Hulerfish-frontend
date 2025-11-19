import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { User, Mail, LogOut, Edit, Save, X, MapPin, Wallet as WalletIcon, Banknote, CreditCard } from "lucide-react";
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

  // Bank info local state
  const [bankEditing, setBankEditing] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  useEffect(() => {
    // Prefill from user if available
    if ((user as any)?.cbeAccountName) setAccountName((user as any).cbeAccountName);
    if ((user as any)?.cbeAccountNumber) setAccountNumber((user as any).cbeAccountNumber);
  }, []);

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

  const saveBankInfo = async () => {
    try {
      await usersAPI.updateMe({ cbeAccountName: accountName || undefined, cbeAccountNumber: accountNumber || undefined });
      // Update auth context so other pages (Wallet) see fresh values immediately
      const updatedUser = { ...(user as any), cbeAccountName: accountName || undefined, cbeAccountNumber: accountNumber || undefined };
      (updateUser as any)(updatedUser);
      toast({ title: "CBE account saved", description: "Used for withdrawals." });
      setBankEditing(false);
    } catch (e) {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  const mask = (val: string) => (val ? `****${String(val).slice(-4)}` : "—");

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        <PageHeader
          title="My Profile"
          className="text-center"
        />

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

                  {/* Bank Info - CBE only, visible to approved hosts (not admin) */}
                  {user?.hostStatus === "approved" && user?.role !== "admin" && (
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium text-muted-foreground">CBE Account (used for withdrawals)</p>
                    </div>
                    {!bankEditing ? (
                      <>
                        <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                          <div>Bank: <span className="text-foreground">CBE</span></div>
                          <div>Account Name: <span className="text-foreground">{accountName || '—'}</span></div>
                          <div>Account Number: <span className="text-foreground">{mask(accountNumber)}</span></div>
                        </div>
                        <Button variant="outline" onClick={() => setBankEditing(true)} className="w-full">Edit Bank Info</Button>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <Label>Account Name</Label>
                          <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                        </div>
                        <div>
                          <Label>Account Number</Label>
                          <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))} />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="hero" onClick={saveBankInfo} className="flex-1">Save</Button>
                          <Button variant="outline" onClick={() => setBankEditing(false)} className="flex-1">Cancel</Button>
                        </div>
                      </div>
                    )}
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
                    {user?.role !== "admin" && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate("/my-reviews")}
                        className="w-full"
                      >
                        My Reviews
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/update-password")}
                      className="w-full"
                    >
                      Change Password
                    </Button>

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
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => navigate("/admin/payouts")}
                          className="w-full mt-3"
                        >
                          Payouts
                        </Button>
                      </>
                    )}

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

                    {user?.guideStatus !== "approved" && user?.role !== "admin" && (
                      <>
                        <div className="pt-4 border-t">
                          <p className="text-sm font-medium text-muted-foreground mb-3">
                            Become a Guide
                          </p>
                        </div>
                        <Button
                          variant="hero"
                          size="lg"
                          onClick={() => navigate("/guide-application")}
                          className="w-full"
                          disabled={user?.guideStatus === "pending"}
                        >
                          {user?.guideStatus === "pending"
                            ? "Application Pending Review"
                            : "Apply to Become a Guide"}
                        </Button>
                      </>
                    )}

                    {user?.guideStatus === "approved" && user?.role !== "admin" && (
                      <>
                        <div className="pt-4 border-t">
                          <p className="text-sm font-medium text-muted-foreground mb-3">
                            Guide Panel
                          </p>
                        </div>
                        <Button
                          variant="hero"
                          size="lg"
                          onClick={() => navigate("/guide/dashboard")}
                          className="w-full"
                        >
                          Guide Dashboard
                        </Button>
                      </>
                    )}

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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => navigate("/host/wallet")}
                            className="w-full"
                          >
                            <WalletIcon className="w-4 h-4 mr-2" />
                            Wallet
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => navigate("/host/withdrawals")}
                            className="w-full"
                          >
                            <Banknote className="w-4 h-4 mr-2" />
                            Withdrawals
                          </Button>
                        </div>
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
