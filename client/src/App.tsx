import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AdminPanel from "@/pages/admin-new";
import Profile from "@/pages/profile";
import Transactions from "@/pages/transactions";
import { useState, useEffect } from "react";

// Simple auth context
export const AuthContext = React.createContext<{
  user: any | null;
  sessionId: string | null;
  login: (sessionId: string, user: any) => void;
  logout: () => void;
}>({
  user: null,
  sessionId: null,
  login: () => {},
  logout: () => {},
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/profile" component={Profile} />
      <Route path="/transactions" component={Transactions} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<any | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check for saved session immediately
    const savedSessionId = localStorage.getItem("sessionId");
    const savedUser = localStorage.getItem("user");
    console.log("App initializing - checking saved session:", { 
      savedSessionId: !!savedSessionId, 
      savedUser: !!savedUser,
      savedSessionValue: savedSessionId,
      savedUserValue: savedUser ? JSON.parse(savedUser).username : null
    });
    
    if (savedSessionId && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log("Restoring session for user:", parsedUser.username);
        setSessionId(savedSessionId);
        setUser(parsedUser);
        console.log("Authentication state restored successfully");
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem("sessionId");
        localStorage.removeItem("user");
      }
    } else {
      console.log("No saved session found");
    }
    
    setIsInitialized(true);
  }, []);

  const login = (newSessionId: string, newUser: any) => {
    console.log("Setting authentication state:", { sessionId: newSessionId, user: newUser.username });
    setSessionId(newSessionId);
    setUser(newUser);
    localStorage.setItem("sessionId", newSessionId);
    localStorage.setItem("user", JSON.stringify(newUser));
    console.log("Authentication state set successfully");
  };

  const logout = () => {
    setSessionId(null);
    setUser(null);
    localStorage.removeItem("sessionId");
    localStorage.removeItem("user");
  };

  // Show loading while app initializes
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading app...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, sessionId, login, logout }}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
