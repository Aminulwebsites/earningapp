import { useState, useContext } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/App";
import { apiRequest } from "@/lib/queryClient";
import { Coins, X } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useContext(AuthContext);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/login", formData);
      const data = await response.json();
      
      console.log("Login response:", data);
      if (data.sessionId && data.user) {
        // Set localStorage first
        localStorage.setItem("sessionId", data.sessionId);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Set state
        login(data.sessionId, data.user);
        
        toast({
          title: "Success",
          description: `Welcome back, ${data.user.username}!`,
        });
        
        // Force page navigation
        window.location.href = '/dashboard';
      } else {
        throw new Error("Invalid login response");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-8 w-8 z-10 hover:bg-gray-100"
          onClick={(e) => {
            e.preventDefault();
            console.log("Cross button clicked - navigating to home");
            setLocation("/");
          }}
          type="button"
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Coins className="h-8 w-8 text-primary mr-2" />
            <CardTitle className="text-2xl font-bold">EarnRupee</CardTitle>
          </div>
          <p className="text-gray-600">Sign in to start earning</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-800 mb-1">Admin Access</p>
            <p className="text-xs text-blue-600">Username: admin | Password: admin123</p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => setLocation("/register")}
                className="text-primary hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
