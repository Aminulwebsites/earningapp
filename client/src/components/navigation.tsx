import { useContext } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuthContext } from "@/App";
import { 
  Home, 
  BarChart3, 
  User, 
  Coins,
  Bell,
  Shield,
  History
} from "lucide-react";
import NotificationSystem from "./notification-system";

export default function Navigation() {
  const { user, sessionId } = useContext(AuthContext);
  const [location] = useLocation();

  if (!user || !sessionId) return null;

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/transactions", label: "Transactions", icon: History },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0 flex items-center">
              <Coins className="h-6 w-6 text-primary mr-2" />
              <h1 className="text-xl font-bold text-gray-900">EarnRupee</h1>
            </div>
            
            <nav className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              ₹{user.totalEarnings}
            </Badge>
            
            {user?.role === "admin" && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="text-xs">
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Button>
              </Link>
            )}
            
            <NotificationSystem />
            
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="rounded-full p-1">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {user.profilePhoto ? (
                    <img 
                      src={user.profilePhoto} 
                      alt="Profile" 
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4 text-primary" />
                  )}
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}