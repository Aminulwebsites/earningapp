import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Target,
  Award,
  Zap,
  DollarSign,
  Eye
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

interface UserAnalyticsProps {
  userStats: any;
  recentEarnings: any[];
  user: any;
}

export default function UserAnalytics({ userStats, recentEarnings, user }: UserAnalyticsProps) {
  // Calculate monthly stats
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const monthlyEarnings = recentEarnings?.filter(earning => {
    const earningDate = new Date(earning.viewedAt);
    return earningDate >= monthStart && earningDate <= monthEnd;
  }) || [];
  
  const monthlyTotal = monthlyEarnings.reduce((sum, earning) => sum + parseFloat(earning.earnings), 0);
  const monthlyAdsCount = monthlyEarnings.length;
  
  // Calculate weekly stats
  const weeklyEarnings = recentEarnings?.filter(earning => {
    const earningDate = new Date(earning.viewedAt);
    const weekAgo = subDays(new Date(), 7);
    return earningDate >= weekAgo;
  }) || [];
  
  const weeklyTotal = weeklyEarnings.reduce((sum, earning) => sum + parseFloat(earning.earnings), 0);
  
  // Performance metrics
  const averagePerAd = monthlyAdsCount > 0 ? (monthlyTotal / monthlyAdsCount).toFixed(2) : "0.00";
  const dailyAverage = (monthlyTotal / new Date().getDate()).toFixed(2);
  
  // Goals and achievements
  const monthlyGoal = 1000; // ₹1000 monthly goal
  const progressPercent = Math.min((monthlyTotal / monthlyGoal) * 100, 100);
  
  const achievements = [
    {
      title: "First Earnings",
      description: "Earned your first rupee",
      completed: parseFloat(user.totalEarnings) > 0,
      icon: DollarSign,
      color: "text-green-600 bg-green-100"
    },
    {
      title: "Streak Master",
      description: "Maintain a 7-day streak",
      completed: user.currentStreak >= 7,
      icon: Zap,
      color: "text-yellow-600 bg-yellow-100"
    },
    {
      title: "Ad Explorer",
      description: "Watch 50 ads",
      completed: monthlyAdsCount >= 50,
      icon: Eye,
      color: "text-blue-600 bg-blue-100"
    },
    {
      title: "High Earner",
      description: "Earn ₹500 in a month",
      completed: monthlyTotal >= 500,
      icon: Award,
      color: "text-purple-600 bg-purple-100"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-green-600">₹{monthlyTotal.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-blue-600">₹{weeklyTotal.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Daily Avg</p>
                <p className="text-2xl font-bold text-purple-600">₹{dailyAverage}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Per Ad Avg</p>
                <p className="text-2xl font-bold text-orange-600">₹{averagePerAd}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Monthly Goal Progress
            </div>
            <Badge variant={progressPercent >= 100 ? "default" : "secondary"}>
              {progressPercent.toFixed(1)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercent} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                ₹{monthlyTotal.toFixed(2)} earned
              </span>
              <span className="text-gray-600">
                Goal: ₹{monthlyGoal}
              </span>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {progressPercent >= 100 
                  ? `🎉 Goal achieved! You've earned ₹${(monthlyTotal - monthlyGoal).toFixed(2)} extra this month!`
                  : `₹${(monthlyGoal - monthlyTotal).toFixed(2)} remaining to reach your monthly goal`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Best Performing Day</h4>
              <p className="text-sm text-blue-700">
                {format(new Date(), 'EEEE')} - Average ₹{dailyAverage} per day
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Streak Status</h4>
              <p className="text-sm text-green-700">
                {user.currentStreak} day streak - Keep it up!
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Monthly Activity</h4>
              <p className="text-sm text-purple-700">
                {monthlyAdsCount} ads completed this month
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Efficiency</h4>
              <p className="text-sm text-orange-700">
                ₹{averagePerAd} average earnings per ad
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    achievement.completed 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      achievement.completed ? achievement.color : 'text-gray-400 bg-gray-100'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold ${
                          achievement.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {achievement.title}
                        </h4>
                        {achievement.completed && (
                          <Badge className="text-xs bg-green-600">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${
                        achievement.completed ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}