import { useState, useEffect, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AuthContext } from "@/App";
import { useLocation } from "wouter";
import { 
  Save, Users, Code, Settings, DollarSign, TrendingUp, 
  Edit, Trash2, Plus, Database, Eye, UserCheck, Ban,
  Activity, BarChart3, Monitor
} from "lucide-react";

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, sessionId } = useContext(AuthContext);
  const [, setLocation] = useLocation();

  // No authentication required - this is a backend management interface
  useEffect(() => {
    console.log("Admin Panel: Backend management interface loaded");
    toast({
      title: "Backend Admin Panel",
      description: "Backend management interface for platform administration",
    });
  }, [toast]);
  
  // Data queries
  const { data: users = [] } = useQuery({ queryKey: ["/api/admin/users"] });
  const { data: ads = [] } = useQuery({ queryKey: ["/api/admin/ads"] });
  const { data: withdrawals = [] } = useQuery({ queryKey: ["/api/admin/withdrawals"] });
  const { data: userAdViews = [] } = useQuery({ queryKey: ["/api/admin/user-ad-views"] });
  const { data: stats = {} } = useQuery({ queryKey: ["/api/admin/stats"] });

  // Type-safe data arrays
  const usersArray = Array.isArray(users) ? users : [];
  const adsArray = Array.isArray(ads) ? ads : [];
  const withdrawalsArray = Array.isArray(withdrawals) ? withdrawals : [];
  const userAdViewsArray = Array.isArray(userAdViews) ? userAdViews : [];

  // Dialog states
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateAdOpen, setIsCreateAdOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingAd, setEditingAd] = useState<any>(null);

  // Form states
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
    totalEarnings: "0.00",
    availableBalance: "0.00"
  });
  
  const [newAd, setNewAd] = useState({
    title: "",
    type: "video",
    category: "general",
    duration: 30,
    earnings: "2.00",
    adsterraCode: "",
    isActive: true
  });

  // This is now a backend management interface - no user auth required

  // CRUD Mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      console.log("Creating user with data:", userData);
      console.log("Current sessionId:", sessionId);
      const response = await apiRequest("POST", "/api/admin/users", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User created successfully" });
      setIsCreateUserOpen(false);
      setNewUser({ username: "", email: "", password: "", role: "user", totalEarnings: "0.00", availableBalance: "0.00" });
    },
    onError: (error: any) => {
      console.error("Create user error:", error);
      toast({ 
        title: "Failed to create user", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PATCH", `/api/admin/users/${id}`, data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
      setEditingUser(null);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/users/${id}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted successfully" });
    },
  });

  const createAdMutation = useMutation({
    mutationFn: (adData: any) => apiRequest("POST", "/api/admin/ads", adData).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      toast({ title: "Ad created successfully" });
      setIsCreateAdOpen(false);
      setNewAd({ title: "", type: "video", category: "general", duration: 30, earnings: "2.00", adsterraCode: "", isActive: true });
    },
  });

  const updateAdMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PATCH", `/api/admin/ads/${id}`, data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      toast({ title: "Ad updated successfully" });
      setEditingAd(null);
    },
  });

  const deleteAdMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/ads/${id}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      toast({ title: "Ad deleted successfully" });
    },
  });

  const updateWithdrawalMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/admin/withdrawals/${id}`, { status }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({ title: "Withdrawal status updated" });
    },
  });

  const deleteWithdrawalMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/withdrawals/${id}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({ title: "Withdrawal deleted successfully" });
    },
  });

  // Stats calculations
  const totalUsers = usersArray.length;
  const activeUsers = usersArray.filter((u: any) => u.isActive).length;
  const totalEarnings = usersArray.reduce((sum: number, u: any) => sum + parseFloat(u.totalEarnings || "0"), 0);
  const pendingWithdrawals = withdrawalsArray.filter((w: any) => w.status === "pending").length;
  const activeAds = adsArray.filter((a: any) => a.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Control Panel</h1>
          <p className="text-gray-600 mt-2">Complete database management and platform administration</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Withdrawals</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingWithdrawals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Code className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Ads</p>
                  <p className="text-2xl font-bold text-gray-900">{activeAds}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Ad Management
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Withdrawals
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="totalEarnings">Total Earnings</Label>
                          <Input
                            id="totalEarnings"
                            value={newUser.totalEarnings}
                            onChange={(e) => setNewUser({ ...newUser, totalEarnings: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="availableBalance">Available Balance</Label>
                          <Input
                            id="availableBalance"
                            value={newUser.availableBalance}
                            onChange={(e) => setNewUser({ ...newUser, availableBalance: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={() => createUserMutation.mutate(newUser)}
                        disabled={createUserMutation.isPending}
                      >
                        {createUserMutation.isPending ? "Creating..." : "Create User"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Total Earnings</TableHead>
                      <TableHead>Available Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersArray.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{user.totalEarnings}</TableCell>
                        <TableCell>₹{user.availableBalance}</TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "destructive"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteUserMutation.mutate(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ad Management Tab */}
          <TabsContent value="ads">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Advertisement Management</CardTitle>
                <Dialog open={isCreateAdOpen} onOpenChange={setIsCreateAdOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create Ad
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Advertisement</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newAd.title}
                          onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <Select value={newAd.type} onValueChange={(value) => setNewAd({ ...newAd, type: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="banner">Banner</SelectItem>
                              <SelectItem value="interactive">Interactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            value={newAd.category}
                            onChange={(e) => setNewAd({ ...newAd, category: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="duration">Duration (seconds)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={newAd.duration}
                            onChange={(e) => setNewAd({ ...newAd, duration: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="earnings">Earnings (₹)</Label>
                          <Input
                            id="earnings"
                            value={newAd.earnings}
                            onChange={(e) => setNewAd({ ...newAd, earnings: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="adsterraCode">AdSterra Code</Label>
                        <Textarea
                          id="adsterraCode"
                          value={newAd.adsterraCode}
                          onChange={(e) => setNewAd({ ...newAd, adsterraCode: e.target.value })}
                        />
                      </div>
                      <Button 
                        onClick={() => createAdMutation.mutate(newAd)}
                        disabled={createAdMutation.isPending}
                      >
                        {createAdMutation.isPending ? "Creating..." : "Create Ad"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adsArray.map((ad: any) => (
                      <TableRow key={ad.id}>
                        <TableCell className="font-medium">{ad.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ad.type}</Badge>
                        </TableCell>
                        <TableCell>{ad.category}</TableCell>
                        <TableCell>{ad.duration}s</TableCell>
                        <TableCell>₹{ad.earnings}</TableCell>
                        <TableCell>
                          <Badge variant={ad.isActive ? "default" : "destructive"}>
                            {ad.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingAd(ad)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteAdMutation.mutate(ad.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Payment Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawalsArray.map((withdrawal: any) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="font-medium">
                          {withdrawal.user?.username || "Unknown"}
                        </TableCell>
                        <TableCell>₹{withdrawal.amount}</TableCell>
                        <TableCell>{withdrawal.paymentMethod}</TableCell>
                        <TableCell className="max-w-xs truncate">{withdrawal.paymentDetails}</TableCell>
                        <TableCell>
                          <Select
                            value={withdrawal.status}
                            onValueChange={(value) => updateWithdrawalMutation.mutate({ id: withdrawal.id, status: value })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{new Date(withdrawal.requestedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteWithdrawalMutation.mutate(withdrawal.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Ad Views Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Ad Title</TableHead>
                        <TableHead>Ad Type</TableHead>
                        <TableHead>Earnings</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Viewed At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userAdViewsArray.slice(0, 20).map((view: any) => (
                        <TableRow key={view.id}>
                          <TableCell>{view.user?.username || "Unknown"}</TableCell>
                          <TableCell>{view.ad?.title || "Unknown Ad"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{view.ad?.type || "Unknown"}</Badge>
                          </TableCell>
                          <TableCell>₹{view.earnings}</TableCell>
                          <TableCell>
                            <Badge variant={view.completed ? "default" : "destructive"}>
                              {view.completed ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(view.viewedAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Database Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold">Users Table</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{usersArray.length}</p>
                      <p className="text-sm text-gray-600">Total records</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-green-600" />
                        <span className="font-semibold">Ads Table</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{adsArray.length}</p>
                      <p className="text-sm text-gray-600">Total records</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold">Withdrawals Table</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{withdrawalsArray.length}</p>
                      <p className="text-sm text-gray-600">Total records</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-orange-600" />
                        <span className="font-semibold">Ad Views Table</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">{userAdViewsArray.length}</p>
                      <p className="text-sm text-gray-600">Total records</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        {editingUser && (
          <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User: {editingUser.username}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-username">Username</Label>
                    <Input
                      id="edit-username"
                      value={editingUser.username}
                      onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-role">Role</Label>
                    <Select value={editingUser.role} onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}>
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
                    <Label htmlFor="edit-status">Status</Label>
                    <Select value={editingUser.isActive.toString()} onValueChange={(value) => setEditingUser({ ...editingUser, isActive: value === "true" })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-earnings">Total Earnings</Label>
                    <Input
                      id="edit-earnings"
                      value={editingUser.totalEarnings}
                      onChange={(e) => setEditingUser({ ...editingUser, totalEarnings: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-balance">Available Balance</Label>
                    <Input
                      id="edit-balance"
                      value={editingUser.availableBalance}
                      onChange={(e) => setEditingUser({ ...editingUser, availableBalance: e.target.value })}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => updateUserMutation.mutate({ id: editingUser.id, data: editingUser })}
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Ad Dialog */}
        {editingAd && (
          <Dialog open={!!editingAd} onOpenChange={() => setEditingAd(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Ad: {editingAd.title}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="edit-ad-title">Title</Label>
                  <Input
                    id="edit-ad-title"
                    value={editingAd.title}
                    onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-ad-type">Type</Label>
                    <Select value={editingAd.type} onValueChange={(value) => setEditingAd({ ...editingAd, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="interactive">Interactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-ad-category">Category</Label>
                    <Input
                      id="edit-ad-category"
                      value={editingAd.category}
                      onChange={(e) => setEditingAd({ ...editingAd, category: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-ad-duration">Duration (seconds)</Label>
                    <Input
                      id="edit-ad-duration"
                      type="number"
                      value={editingAd.duration}
                      onChange={(e) => setEditingAd({ ...editingAd, duration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-ad-earnings">Earnings (₹)</Label>
                    <Input
                      id="edit-ad-earnings"
                      value={editingAd.earnings}
                      onChange={(e) => setEditingAd({ ...editingAd, earnings: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-ad-status">Status</Label>
                    <Select value={editingAd.isActive.toString()} onValueChange={(value) => setEditingAd({ ...editingAd, isActive: value === "true" })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-ad-code">AdSterra Code</Label>
                  <Textarea
                    id="edit-ad-code"
                    value={editingAd.adsterraCode}
                    onChange={(e) => setEditingAd({ ...editingAd, adsterraCode: e.target.value })}
                  />
                </div>
                <Button 
                  onClick={() => updateAdMutation.mutate({ id: editingAd.id, data: editingAd })}
                  disabled={updateAdMutation.isPending}
                >
                  {updateAdMutation.isPending ? "Updating..." : "Update Ad"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}