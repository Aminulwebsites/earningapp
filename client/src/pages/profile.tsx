import { useContext, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/App";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettings from "@/components/profile-settings";
import EarningsChart from "@/components/earnings-chart";
import ReferralSystem from "@/components/referral-system";
import UserAnalytics from "@/components/user-analytics";
import { 
  ArrowLeft,
  Settings,
  BarChart3,
  History,
  Trophy,
  Share2,
  Camera
} from "lucide-react";
import ProfilePhotoUpload from "@/components/profile-photo-upload";

export default function Profile() {
  const { user, sessionId } = useContext(AuthContext);
  const [, setLocation] = useLocation();

  // Check localStorage as fallback first
  const savedSessionId = localStorage.getItem("sessionId");
  const savedUser = localStorage.getItem("user");
  
  // Use saved user data if context is missing
  const displayUser = user || (savedUser ? JSON.parse(savedUser) : null);
  const activeSessionId = sessionId || savedSessionId;

  useEffect(() => {
    console.log("Profile mounted - checking auth:", { 
      user: !!user, 
      sessionId: !!sessionId,
      savedSessionId: !!savedSessionId,
      savedUser: !!savedUser
    });
    
    // Only redirect if BOTH context and localStorage are empty
    if ((!user || !sessionId) && (!savedSessionId || !savedUser)) {
      console.log("No authentication anywhere, redirecting to login");
      window.location.href = '/login';
    } else {
      console.log("Authentication found, staying on profile");
    }
  }, [user, sessionId, setLocation]);

  // If no authentication anywhere, don't render
  if ((!user || !sessionId) && (!savedSessionId || !savedUser)) {
    return null;
  }

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!activeSessionId,
    queryFn: async () => {
      const response = await fetch("/api/user/stats", {
        headers: { Authorization: `Bearer ${activeSessionId}` },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: recentEarnings, isLoading: earningsLoading } = useQuery({
    queryKey: ["/api/user/earnings"],
    enabled: !!activeSessionId,
    queryFn: async () => {
      const response = await fetch("/api/user/earnings", {
        headers: { Authorization: `Bearer ${activeSessionId}` },
      });
      if (!response.ok) throw new Error("Failed to fetch earnings");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600">Manage your account and view your stats</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <ProfileSettings userStats={userStats} user={displayUser} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {statsLoading || earningsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading analytics...</p>
                </div>
              </div>
            ) : recentEarnings && userStats ? (
              <>
                <UserAnalytics 
                  userStats={userStats} 
                  recentEarnings={recentEarnings} 
                  user={displayUser} 
                />
                <EarningsChart earnings={recentEarnings} />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No analytics data available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="referrals" className="space-y-4">
            <ReferralSystem user={displayUser} />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Achievements Coming Soon</h3>
              <p className="text-gray-600 mt-2">
                We're working on an achievements system to reward your activity!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}