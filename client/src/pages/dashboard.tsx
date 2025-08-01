import { useContext, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Eye, 
  TrendingUp, 
  Trophy, 
  Bell, 
  Coins,
  Play,
  Clock,
  Video,
  Image,
  Gamepad2,
  ChevronRight,
  History,
  Share2,
  Home,
  BarChart3,
  User,
  MoreHorizontal,
  Plus
} from "lucide-react";
import AdViewer from "@/components/ad-viewer";
import WithdrawModal from "@/components/withdraw-modal";

import Navigation from "@/components/navigation";
import NotificationSystem from "@/components/notification-system";
import { useState } from "react";
import { ensureAuthentication } from "@/utils/auth";

export default function Dashboard() {
  const { user, sessionId } = useContext(AuthContext);
  const [, setLocation] = useLocation();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);


  // Check localStorage as fallback first
  const savedSessionId = localStorage.getItem("sessionId");
  const savedUser = localStorage.getItem("user");
  
  // Use saved user data if context is missing
  const displayUser = user || (savedUser ? JSON.parse(savedUser) : null);
  const activeSessionId = sessionId || savedSessionId;

  useEffect(() => {
    const initAuth = async () => {
      console.log("Dashboard mounted - checking auth:", { 
        user: !!user, 
        sessionId: !!sessionId,
        savedSessionId: !!savedSessionId,
        savedUser: !!savedUser
      });
      
      // Only redirect if BOTH context and localStorage are empty
      if ((!user || !sessionId) && (!savedSessionId || !savedUser)) {
        console.log("No authentication anywhere, attempting auto-login");
        await ensureAuthentication();
        // Refresh the page to load with new auth data
        window.location.reload();
      } else {
        console.log("Authentication found, staying on dashboard");
      }
    };
    
    initAuth();
  }, [user, sessionId, setLocation]);

  // If no authentication anywhere, don't render
  if ((!user || !sessionId) && (!savedSessionId || !savedUser)) {
    return null;
  }

  const { data: userStats, refetch: refetchStats } = useQuery({
    queryKey: ["/api", "user", "stats"],
    enabled: !!displayUser && !!activeSessionId,
  });

  const { data: ads } = useQuery({
    queryKey: ["/api", "ads"],
    enabled: !!displayUser && !!activeSessionId,
  });

  const { data: recentEarnings } = useQuery({
    queryKey: ["/api", "user", "earnings"],
    enabled: !!displayUser && !!activeSessionId,
  });

  const dailyProgress = userStats ? Math.min(((userStats as any).adsWatchedToday / 10) * 100, 100) : 0;
  const dailyTarget = 50;
  const achieved = parseFloat((userStats as any)?.todayEarnings || "0");
  const remaining = Math.max(dailyTarget - achieved, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* User Profile Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {displayUser?.profilePhoto ? (
                  <img 
                    src={displayUser.profilePhoto} 
                    alt="Profile" 
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-lg font-bold text-primary">
                    {displayUser?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {displayUser?.username || 'User'}!
                </h1>
                <p className="text-gray-600">
                  {displayUser?.role === 'admin' ? 'Administrator' : 'Member'} • Available Balance: ₹{(userStats as any)?.availableBalance || displayUser?.availableBalance || "0"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setLocation("/profile")}
                variant="outline"
                size="sm"
              >
                <User className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <Button 
                onClick={() => setIsWithdrawModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
              <div className="flex items-center">
                <NotificationSystem />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500">Total Earnings</dt>
                  <dd className="text-lg font-semibold text-gray-900">₹{(userStats as any)?.totalEarnings || "0"}</dd>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500">Ads Watched Today</dt>
                  <dd className="text-lg font-semibold text-gray-900">{(userStats as any)?.adsWatchedToday || 0}</dd>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500">Today's Earnings</dt>
                  <dd className="text-lg font-semibold text-gray-900">₹{(userStats as any)?.todayEarnings || "0"}</dd>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500">Current Streak</dt>
                  <dd className="text-lg font-semibold text-gray-900">{(userStats as any)?.currentStreak || 0} days</dd>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Ad Viewing Section */}
          <div className="lg:col-span-2 space-y-6">
            <AdViewer 
              ads={Array.isArray(ads) ? ads : []} 
              sessionId={activeSessionId || ""} 
              onAdComplete={() => {
                refetchStats();
              }} 
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Withdraw Earnings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => setLocation("/profile")}
                >
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => setLocation("/profile?tab=referrals")}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Referral Program
                </Button>
              </CardContent>
            </Card>

            {/* Daily Progress Card */}
            <Card className="border-0 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Daily Progress</h3>
              </div>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="transform -rotate-90 w-20 h-20">
                      <circle cx="40" cy="40" r="36" stroke="#E5E7EB" strokeWidth="8" fill="transparent"></circle>
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="36" 
                        stroke="#10B981" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray="226.2" 
                        strokeDashoffset={226.2 - (226.2 * dailyProgress) / 100}
                        strokeLinecap="round"
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-900">{Math.round(dailyProgress)}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{(userStats as any)?.adsWatchedToday || 0} of 10 daily ads watched</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Target</span>
                    <span className="font-medium">₹{dailyTarget.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Achieved</span>
                    <span className="font-medium text-primary">₹{achieved.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining</span>
                    <span className="font-medium text-gray-500">₹{remaining.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* Recent Earnings */}
            <Card className="border-0 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Earnings</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {Array.isArray(recentEarnings) ? recentEarnings.slice(0, 3).map((earning: any, index: number) => (
                    <div key={earning.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Plus className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Ad Completed</p>
                          <p className="text-xs text-gray-500">
                            {new Date(earning.viewedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-green-600">+₹{earning.earnings}</span>
                    </div>
                  )) : []}
                  {(!Array.isArray(recentEarnings) || recentEarnings.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">No recent earnings</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-4 h-16">
          <Button variant="ghost" className="flex flex-col items-center justify-center space-y-1 text-primary">
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center justify-center space-y-1 text-gray-400">
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">Earnings</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center justify-center space-y-1 text-gray-400"
            onClick={() => setLocation("/profile")}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center justify-center space-y-1 text-gray-400">
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-xs">More</span>
          </Button>
        </div>
      </nav>

      {/* Withdraw Modal */}
      <WithdrawModal 
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
    </div>
  );
}
