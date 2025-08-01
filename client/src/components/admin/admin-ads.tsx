import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Video, Image, Gamepad2, Coins, Clock, Edit } from "lucide-react";

interface AdminAdsProps {
  sessionId: string;
}

export default function AdminAds({ sessionId }: AdminAdsProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [newAd, setNewAd] = useState({
    title: "",
    type: "video",
    category: "",
    duration: 30,
    earnings: "4.00",
    adsterraCode: "",
    isActive: true,
  });

  const { data: ads, isLoading } = useQuery({
    queryKey: ["/api/admin/ads"],
    enabled: !!sessionId,
    queryFn: async () => {
      const response = await fetch("/api/admin/ads", {
        headers: { Authorization: `Bearer ${sessionId}` },
      });
      if (!response.ok) throw new Error("Failed to fetch ads");
      return response.json();
    },
  });

  const createAdMutation = useMutation({
    mutationFn: async (adData: any) => {
      const response = await apiRequest("POST", "/api/admin/ads", adData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      setIsCreateModalOpen(false);
      setNewAd({
        title: "",
        type: "video",
        category: "",
        duration: 30,
        earnings: "4.00",
        adsterraCode: "",
        isActive: true,
      });
      toast({
        title: "Success",
        description: "Ad created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create ad",
        variant: "destructive",
      });
    },
  });

  const updateAdMutation = useMutation({
    mutationFn: async ({ adId, updates }: { adId: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/ads/${adId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      toast({
        title: "Success",
        description: "Ad updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update ad",
        variant: "destructive",
      });
    },
  });

  const handleCreateAd = () => {
    createAdMutation.mutate(newAd);
  };

  const handleToggleAdStatus = (adId: string, isActive: boolean) => {
    updateAdMutation.mutate({
      adId,
      updates: { isActive: !isActive },
    });
  };

  const getAdTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-600" />;
      case "banner":
        return <Image className="h-4 w-4 text-green-600" />;
      case "interactive":
        return <Gamepad2 className="h-4 w-4 text-purple-600" />;
      default:
        return <Video className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredAds = ads?.filter((ad: any) =>
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ad Management</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage advertisements and their settings
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search ads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Ad
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Ad</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newAd.title}
                    onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                    placeholder="Enter ad title"
                  />
                </div>
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
                    placeholder="Enter category"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newAd.duration}
                    onChange={(e) => setNewAd({ ...newAd, duration: parseInt(e.target.value) })}
                    min="5"
                    max="120"
                  />
                </div>
                <div>
                  <Label htmlFor="earnings">Earnings (₹)</Label>
                  <Input
                    id="earnings"
                    type="number"
                    step="0.01"
                    value={newAd.earnings}
                    onChange={(e) => setNewAd({ ...newAd, earnings: e.target.value })}
                    min="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="adsterraCode">Adsterra Code</Label>
                  <Input
                    id="adsterraCode"
                    value={newAd.adsterraCode}
                    onChange={(e) => setNewAd({ ...newAd, adsterraCode: e.target.value })}
                    placeholder="Enter Adsterra ad code"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newAd.isActive}
                    onCheckedChange={(checked) => setNewAd({ ...newAd, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateAd}
                    disabled={createAdMutation.isPending}
                    className="flex-1"
                  >
                    {createAdMutation.isPending ? "Creating..." : "Create Ad"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Earnings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAds.map((ad: any) => (
              <TableRow key={ad.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getAdTypeIcon(ad.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{ad.title}</p>
                      <p className="text-sm text-gray-500 font-mono">{ad.adsterraCode}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {ad.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">{ad.category}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <Clock className="h-3 w-3 mr-1 text-gray-400" />
                    {ad.duration}s
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center font-semibold text-primary">
                    <Coins className="h-3 w-3 mr-1" />
                    ₹{ad.earnings}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Badge variant={ad.isActive ? "default" : "secondary"}>
                      {ad.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Switch
                      checked={ad.isActive}
                      onCheckedChange={() => handleToggleAdStatus(ad.id, ad.isActive)}
                      disabled={updateAdMutation.isPending}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updateAdMutation.isPending}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredAds.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? "No ads found matching your search." : "No ads found."}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>Showing {filteredAds.length} of {ads?.length || 0} ads</p>
        <div className="flex space-x-4">
          <span>Active: {ads?.filter((ad: any) => ad.isActive).length || 0}</span>
          <span>Inactive: {ads?.filter((ad: any) => !ad.isActive).length || 0}</span>
        </div>
      </div>
    </div>
  );
}