import { useState, useContext, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/App";
import { 
  Share2, 
  Copy, 
  Users, 
  Gift,
  ExternalLink,
  TrendingUp,
  Award,
  Target,
  IndianRupee
} from "lucide-react";

interface ReferralSystemProps {
  user: any;
}

export default function ReferralSystem({ user: propUser }: ReferralSystemProps) {
  const user = propUser;
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch referral data from API
  const { data: referralData, isLoading } = useQuery({
    queryKey: ['/api/user/referral'],
    enabled: !!user
  });

  if (!user) return null;

  const referralCode = referralData?.referralCode || (user.username.toUpperCase() + "REF");
  const referralLink = referralData?.referralLink || `${window.location.origin}/register?ref=${referralCode}`;
  
  // Use API data or fallback to defaults
  const referralStats = referralData || {
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: "₹0.00",
    thisMonthEarnings: "₹0.00",
    bonusPerReferral: "₹8.00"
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      url: `https://wa.me/?text=${encodeURIComponent(`🎉 Join AdViewer and start earning money by watching ads! 💰 Earn ${referralStats.bonusPerReferral} per referral! Use my link: ${referralLink}`)}`,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      name: "Telegram",
      url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`🎉 Join AdViewer and start earning money! 💰 Earn ${referralStats.bonusPerReferral} per referral!`)}`,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      color: "bg-blue-600 hover:bg-blue-700",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading referral system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Overview */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <IndianRupee className="h-5 w-5" />
            Referral Earnings Program
          </CardTitle>
          <p className="text-sm text-green-600">
            Earn <span className="font-bold text-lg">{referralStats.bonusPerReferral}</span> for each friend who joins and completes their first ad!
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{referralStats.totalReferrals}</p>
              <p className="text-sm text-gray-600">Total Referrals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{referralStats.activeReferrals}</p>
              <p className="text-sm text-gray-600">Active This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{referralStats.totalEarnings}</p>
              <p className="text-sm text-gray-600">Total Earned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{referralStats.thisMonthEarnings}</p>
              <p className="text-sm text-gray-600">This Month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Your Referral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            Share Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Your Referral Code
            </label>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                readOnly
                className="font-mono bg-gray-50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(referralCode, "Referral code")}
              >
                {copiedField === "Referral code" ? "Copied!" : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Your Referral Link
            </label>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="font-mono bg-gray-50 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(referralLink, "Referral link")}
              >
                {copiedField === "Referral link" ? "Copied!" : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Share on Social Media
            </label>
            <div className="flex gap-3">
              {shareOptions.map((option) => (
                <Button
                  key={option.name}
                  className={`${option.color} text-white flex items-center gap-2`}
                  size="sm"
                  onClick={() => window.open(option.url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  {option.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Referrals Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Share your referral link</p>
                <p className="text-sm text-gray-600">Send your unique referral link to friends and family</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-green-600">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">They sign up and start earning</p>
                <p className="text-sm text-gray-600">Your friends create an account and watch their first ad</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-purple-600">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">You both get rewarded</p>
                <p className="text-sm text-gray-600">You earn ₹20 and they get a ₹10 bonus for joining</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Bonus:</strong> Earn an additional 5% of your referrals' earnings for their first 30 days!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}