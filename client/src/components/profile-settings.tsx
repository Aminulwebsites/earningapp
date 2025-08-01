import { useState, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/App";
import ProfilePhotoUpload from "./profile-photo-upload";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Edit2, 
  Save, 
  X,
  Camera,
  Wallet,
  Trophy,
  Target,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";

interface ProfileSettingsProps {
  userStats: any;
  user: any;
}

export default function ProfileSettings({ userStats, user: propUser }: ProfileSettingsProps) {
  const { logout } = useContext(AuthContext);
  const user = propUser;
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    bio: "",
  });

  const handleSave = async () => {
    try {
      // This would typically make an API call to update user profile
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.profilePhoto || ""} alt={user.username} />
                <AvatarFallback className="text-xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <ProfilePhotoUpload 
                  currentPhoto={user?.profilePhoto || undefined}
                  onUploadSuccess={() => {
                    toast({
                      title: "Success", 
                      description: "Profile photo updated! Refresh to see changes."
                    });
                  }}
                />
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{user.username}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role}
                  </Badge>
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    Member since {format(new Date(user.createdAt), "MMM yyyy")}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Wallet className="h-5 w-5 mx-auto text-green-600 mb-1" />
                  <p className="text-sm text-green-700">Total Earned</p>
                  <p className="text-lg font-bold text-green-900">₹{user.totalEarnings}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Trophy className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-sm text-blue-700">Current Streak</p>
                  <p className="text-lg font-bold text-blue-900">{user.currentStreak} days</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Target className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                  <p className="text-sm text-purple-700">Today's Ads</p>
                  <p className="text-lg font-bold text-purple-900">{userStats?.adsWatchedToday || 0}</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <DollarSign className="h-5 w-5 mx-auto text-orange-600 mb-1" />
                  <p className="text-sm text-orange-700">Available Balance</p>
                  <p className="text-lg font-bold text-orange-900">₹{user.availableBalance}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Profile Settings
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Sign Out</h3>
              <p className="text-sm text-gray-600">Sign out of your account on this device</p>
            </div>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}