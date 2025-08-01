import { useContext, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { AuthContext } from "@/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { 
  Coins, 
  Play, 
  Users, 
  TrendingUp, 
  Shield,
  Eye,
  Clock,
  Wallet,
  Star,
  ArrowRight,
  CheckCircle,
  Smartphone,
  DollarSign,
  Gift
} from "lucide-react";

export default function Home() {
  const { user, sessionId } = useContext(AuthContext);
  const [, setLocation] = useLocation();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    console.log("Home page - checking auth for redirect:", { user: !!user, sessionId: !!sessionId });
    if (user && sessionId) {
      console.log("User is authenticated, redirecting to dashboard");
      setLocation("/dashboard");
    }
  }, [user, sessionId, setLocation]);

  // If user is logged in, show loading while redirecting
  if (user && sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Coins className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">EarnRupee</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Earn Real Money
            <span className="block text-primary">Watching Ads</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join thousands of users earning rupees daily by watching advertisements. 
            Simple, legitimate, and completely free to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="px-8 py-3">
                <Play className="h-5 w-5 mr-2" />
                Start Earning Now
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <div className="p-2 bg-green-100 rounded-lg w-fit">
                <Coins className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Real Money</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Earn actual rupees that you can withdraw to your bank account or digital wallet.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 bg-blue-100 rounded-lg w-fit">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Flexible Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Watch ads whenever you want. Work from home, during breaks, or in your free time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 bg-purple-100 rounded-lg w-fit">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Safe & Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your data is protected and all ads are from verified advertisers through Adsterra.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-xl text-gray-600">
              See what our users are achieving
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">₹2,500+</div>
              <p className="text-gray-600">Average Monthly Earnings</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <p className="text-gray-600">Payment Success Rate</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-primary rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Create your free account and start watching ads to earn real money today.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="px-8 py-3">
              <Coins className="h-5 w-5 mr-2" />
              Get Started for Free
            </Button>
          </Link>
        </div>
      </main>

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 EarnRupee. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}