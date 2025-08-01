import { useState } from "react";
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
import { Save, Users, Code, Settings, DollarSign, TrendingUp, Copy, CheckCircle, Edit, Trash2, Plus, Database, Eye, UserCheck, Ban } from "lucide-react";

export default function AdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Queries
  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });
  
  const { data: withdrawals = [] } = useQuery({
    queryKey: ["/api/admin/withdrawals"],
  });
  
  const { data: ads = [] } = useQuery({
    queryKey: ["/api/admin/ads"],
  });
  
  const { data: userAdViews = [] } = useQuery({
    queryKey: ["/api/admin/user-ad-views"],
  });
  
  const { data: stats = {} } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  // Edit states
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateAdOpen, setIsCreateAdOpen] = useState(false);
  
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

  // Ad Code Management State
  const [adSettings, setAdSettings] = useState({
    publisherId: "ca-pub-3367275049693713",
    appId: "earnrupeeca-app-pub-3367275049693713~2891916242",
    adUnitId: "1ca-app-pub-3367275049693713/9201840585",
    adFormat: "fluid",
    layoutKey: "-fb+5w+4e-db+86",
    enableAds: true,
    adRefreshRate: 30,
    customAdCode: ""
  });

  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({
    minWithdrawal: "10.00",
    maxWithdrawal: "10000.00",
    earningsPerAd: "2.00",
    adDuration: 30,
    dailyAdLimit: 50,
    referralBonus: "5.00"
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (userData: any) =>
      apiRequest("POST", "/api/admin/users", userData).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User created successfully" });
      setIsCreateUserOpen(false);
      setNewUser({ username: "", email: "", password: "", role: "user", totalEarnings: "0.00", availableBalance: "0.00" });
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
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/users/${id}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted successfully" });
    },
  });

  const createAdMutation = useMutation({
    mutationFn: (adData: any) =>
      apiRequest("POST", "/api/admin/ads", adData).then(res => res.json()),
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
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/ads/${id}`).then(res => res.json()),
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
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/withdrawals/${id}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({ title: "Withdrawal deleted successfully" });
    },
  });

  const saveAdSettingsMutation = useMutation({
    mutationFn: (settings: any) => 
      apiRequest("POST", "/api/admin/ad-settings", settings).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Ad settings saved successfully" });
    },
  });

  const savePlatformSettingsMutation = useMutation({
    mutationFn: (settings: any) => 
      apiRequest("POST", "/api/admin/platform-settings", settings).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Platform settings saved successfully" });
    },
  });

  const handleSaveAdSettings = () => {
    saveAdSettingsMutation.mutate(adSettings);
  };

  const handleSavePlatformSettings = () => {
    savePlatformSettingsMutation.mutate(platformSettings);
  };

  const handleUpdateWithdrawal = (id: string, status: string) => {
    updateWithdrawalMutation.mutate({ id, status });
  };

  const handleUpdateUser = (id: string, data: any) => {
    updateUserMutation.mutate({ id, data });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: `${label} copied to clipboard` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Control Panel</h1>
          <p className="text-gray-600 mt-2">Manage ad codes, users, and platform settings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{Array.isArray(users) ? users.length : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{(stats as any)?.totalPlatformEarnings || "0.00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Withdrawals</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(withdrawals) ? withdrawals.filter((w: any) => w.status === 'pending').length : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Code className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ad Integration</p>
                  <p className="text-lg font-bold text-green-600">
                    {adSettings.enableAds ? "Active" : "Disabled"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="ads" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ads">Ad Code Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="settings">Platform Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="ads">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Advertisement Code Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Google AdSense Settings */}
                <div className="border rounded-lg p-6 bg-blue-50">
                  <h3 className="font-semibold text-blue-800 mb-4">Google AdSense Integration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="publisherId">Publisher ID</Label>
                      <div className="flex gap-2">
                        <Input
                          id="publisherId"
                          value={adSettings.publisherId}
                          onChange={(e) => setAdSettings({ ...adSettings, publisherId: e.target.value })}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(adSettings.publisherId, "Publisher ID")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="appId">App ID</Label>
                      <div className="flex gap-2">
                        <Input
                          id="appId"
                          value={adSettings.appId}
                          onChange={(e) => setAdSettings({ ...adSettings, appId: e.target.value })}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(adSettings.appId, "App ID")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="adUnitId">Ad Unit ID</Label>
                      <div className="flex gap-2">
                        <Input
                          id="adUnitId"
                          value={adSettings.adUnitId}
                          onChange={(e) => setAdSettings({ ...adSettings, adUnitId: e.target.value })}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(adSettings.adUnitId, "Ad Unit ID")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="adFormat">Ad Format</Label>
                      <Input
                        id="adFormat"
                        value={adSettings.adFormat}
                        onChange={(e) => setAdSettings({ ...adSettings, adFormat: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="layoutKey">Layout Key</Label>
                      <Input
                        id="layoutKey"
                        value={adSettings.layoutKey}
                        onChange={(e) => setAdSettings({ ...adSettings, layoutKey: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="adRefreshRate">Ad Refresh Rate (seconds)</Label>
                      <Input
                        id="adRefreshRate"
                        type="number"
                        value={adSettings.adRefreshRate}
                        onChange={(e) => setAdSettings({ ...adSettings, adRefreshRate: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="enableAds"
                      checked={adSettings.enableAds}
                      onChange={(e) => setAdSettings({ ...adSettings, enableAds: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="enableAds">Enable Ad Integration</Label>
                  </div>
                </div>

                {/* Custom Ad Code */}
                <div className="border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Custom Ad Code</h3>
                  <div>
                    <Label htmlFor="customAdCode">Custom HTML/JavaScript Ad Code</Label>
                    <Textarea
                      id="customAdCode"
                      rows={8}
                      value={adSettings.customAdCode}
                      onChange={(e) => setAdSettings({ ...adSettings, customAdCode: e.target.value })}
                      placeholder="Enter custom ad code here..."
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveAdSettings} disabled={saveAdSettingsMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Ad Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(users) && users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{user.username}</h4>
                        <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                          <span>Balance: ₹{user.balance}</span>
                          <span>Total Earnings: ₹{user.totalEarnings}</span>
                          <span>Ads Watched: {user.adsWatched || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateUser(user.id, { 
                            isActive: !user.isActive 
                          })}
                        >
                          {user.isActive ? "Disable" : "Enable"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const amount = prompt("Add balance amount:");
                            if (amount) {
                              handleUpdateUser(user.id, { 
                                balance: (parseFloat(user.balance) + parseFloat(amount)).toFixed(2)
                              });
                            }
                          }}
                        >
                          Add Balance
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(withdrawals) && withdrawals.map((withdrawal: any) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">₹{withdrawal.amount}</h4>
                        <p className="text-sm text-gray-600">User: {withdrawal.username}</p>
                        <p className="text-sm text-gray-600">{withdrawal.paymentMethod}: {withdrawal.paymentDetails}</p>
                        <p className="text-xs text-gray-500">
                          Requested: {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge variant={
                          withdrawal.status === 'completed' ? 'default' :
                          withdrawal.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {withdrawal.status}
                        </Badge>
                        {withdrawal.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateWithdrawal(withdrawal.id, 'completed')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleUpdateWithdrawal(withdrawal.id, 'failed')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Platform Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="minWithdrawal">Minimum Withdrawal (₹)</Label>
                    <Input
                      id="minWithdrawal"
                      value={platformSettings.minWithdrawal}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, minWithdrawal: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxWithdrawal">Maximum Withdrawal (₹)</Label>
                    <Input
                      id="maxWithdrawal"
                      value={platformSettings.maxWithdrawal}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, maxWithdrawal: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="earningsPerAd">Earnings Per Ad (₹)</Label>
                    <Input
                      id="earningsPerAd"
                      value={platformSettings.earningsPerAd}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, earningsPerAd: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="adDuration">Default Ad Duration (seconds)</Label>
                    <Input
                      id="adDuration"
                      type="number"
                      value={platformSettings.adDuration}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, adDuration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dailyAdLimit">Daily Ad Limit per User</Label>
                    <Input
                      id="dailyAdLimit"
                      type="number"
                      value={platformSettings.dailyAdLimit}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, dailyAdLimit: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="referralBonus">Referral Bonus (₹)</Label>
                    <Input
                      id="referralBonus"
                      value={platformSettings.referralBonus}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, referralBonus: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleSavePlatformSettings} disabled={savePlatformSettingsMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Platform Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}