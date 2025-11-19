import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Edit,
  Save,
  X,
  UserCheck,
  Mail,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { usersAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    active: true,
  });

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

    fetchUsers();
  }, [user, navigate, toast]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.data);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users");
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (userData: any) => {
    setEditingUser(userData);
    setFormData({
      name: userData.name || "",
      email: userData.email || "",
      role: userData.role || "user",
      active: userData.active !== false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast({
        title: "Missing fields",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await usersAPI.update(editingUser._id ?? editingUser.id, formData);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((userData) => {
    const matchesSearch =
      userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || userData.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">Loading users...</p>
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
                <Users className="w-10 h-10 inline-block mr-3 text-primary" />
                User Management
              </>
            }
            description="Manage all users on the platform."
          />
        </div>

        <section className="py-16">
          <div className="container mx-auto px-4">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Edit User Form */}
            {editingUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Edit User: {editingUser.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={formData.role}
                            onValueChange={(value) =>
                              setFormData({ ...formData, role: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="active">Status</Label>
                          <Select
                            value={formData.active ? "active" : "inactive"}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                active: value === "active",
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
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
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Update User
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditingUser(null)}
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

            {/* Users List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((userData, index) => (
                <motion.div
                  key={userData._id ?? userData.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 hover:border-primary/20 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <UserCheck className="w-5 h-5" />
                            {userData.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Mail className="w-4 h-4" />
                            {userData.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(userData.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(userData)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Role:</span>
                          <span
                            className={`font-semibold capitalize ${
                              userData.role === "admin"
                                ? "text-red-600"
                                : userData.role === "lead-guide"
                                ? "text-blue-600"
                                : userData.role === "guide"
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            {userData.role}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span
                            className={`font-semibold ${
                              userData.active !== false
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {userData.active !== false ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {userData.hostStatus && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Host Status:</span>
                            <span
                              className={`font-semibold capitalize ${
                                userData.hostStatus === "approved"
                                  ? "text-green-600"
                                  : userData.hostStatus === "pending"
                                  ? "text-yellow-600"
                                  : userData.hostStatus === "rejected"
                                  ? "text-red-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {userData.hostStatus}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">
                  {searchTerm || roleFilter !== "all"
                    ? "No users match your filters"
                    : "No users available"}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default UserManagement;
