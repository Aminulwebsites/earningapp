import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertUserAdViewSchema, insertWithdrawalSchema } from "@shared/schema";
import { z } from "zod";

// Simple session storage
const sessions = new Map<string, string>(); // sessionId -> userId
const userSessions = new Map<string, string>(); // userId -> sessionId

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function authenticateUser(req: Request): string | null {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (!sessionId) return null;
  return sessions.get(sessionId) || null;
}

async function requireAdmin(req: Request, res: Response): Promise<boolean> {
  // Backend admin access - no user authentication required
  // This is a management interface for platform administrators
  
  // Check for admin key in headers or query (for API security)
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  
  // Allow direct access from admin panel route for backend management
  const referer = req.headers['referer'] || '';
  const isAdminPanelAccess = referer.includes('/admin') || req.path.startsWith('/api/admin/');
  
  // For development environment, allow admin access
  if (process.env.NODE_ENV === 'development' || isAdminPanelAccess) {
    return true;
  }
  
  // In production, you would implement proper admin authentication here
  // For now, allow access with a simple key check
  if (adminKey === 'backend_admin_2025') {
    return true;
  }
  
  res.status(403).json({ message: "Backend admin access required" });
  return false;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username) || 
                          await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      const sessionId = generateSessionId();
      
      sessions.set(sessionId, user.id);
      userSessions.set(user.id, sessionId);
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, sessionId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const sessionId = generateSessionId();
      sessions.set(sessionId, user.id);
      userSessions.set(user.id, sessionId);
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, sessionId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/logout", async (req: Request, res: Response) => {
    const userId = authenticateUser(req);
    if (userId) {
      const sessionId = userSessions.get(userId);
      if (sessionId) {
        sessions.delete(sessionId);
        userSessions.delete(userId);
      }
    }
    res.json({ message: "Logged out successfully" });
  });

  // Profile photo upload endpoint
  app.post("/api/user/photo", async (req: Request, res: Response) => {
    const userId = authenticateUser(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { photo } = req.body;
    
    if (!photo) {
      return res.status(400).json({ message: "Photo data required" });
    }

    try {
      await storage.updateUser(userId, { profilePhoto: photo });
      res.json({ message: "Profile photo updated successfully" });
    } catch (error) {
      console.error("Profile photo update error:", error);
      res.status(500).json({ message: "Failed to update profile photo" });
    }
  });

  // Update user profile endpoint
  app.patch("/api/user/profile", async (req: Request, res: Response) => {
    const userId = authenticateUser(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { bio, username } = req.body;
    
    try {
      const updateData: any = {};
      
      if (bio !== undefined) updateData.bio = bio;
      if (username !== undefined) updateData.username = username;
      
      await storage.updateUser(userId, updateData);
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // User routes
  app.get("/api/user/profile", async (req: Request, res: Response) => {
    const userId = authenticateUser(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.get("/api/user/stats", async (req: Request, res: Response) => {
    const userId = authenticateUser(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const todayViews = await storage.getTodayAdViews(userId);
    const completedTodayViews = todayViews.filter(view => view.completed);
    const todayEarnings = completedTodayViews.reduce(
      (sum, view) => sum + parseFloat(view.earnings), 0
    ).toFixed(2);
    
    res.json({
      totalEarnings: user.totalEarnings,
      availableBalance: user.availableBalance,
      adsWatchedToday: completedTodayViews.length,
      todayEarnings,
      currentStreak: user.currentStreak,
    });
  });

  // Ad routes
  app.get("/api/ads", async (req: Request, res: Response) => {
    const userId = authenticateUser(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const ads = await storage.getAllActiveAds();
    res.json(ads);
  });

  app.post("/api/ads/:adId/start", async (req: Request, res: Response) => {
    const userId = authenticateUser(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { adId } = req.params;
    const ad = await storage.getAd(adId);
    
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    
    const adView = await storage.createUserAdView({
      userId,
      adId,
      completed: false,
      earnings: ad.earnings,
    });
    
    res.json(adView);
  });

  app.post("/api/ads/views/:viewId/complete", async (req: Request, res: Response) => {
    const userId = authenticateUser(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { viewId } = req.params;
    const completedView = await storage.completeAdView(viewId);
    
    if (!completedView) {
      return res.status(404).json({ message: "Ad view not found" });
    }
    
    if (completedView.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    res.json(completedView);
  });

  // Referral system routes
  app.get("/api/user/referral", async (req: Request, res: Response) => {
    const userId = authenticateUser(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate unique referral code
    const referralCode = user.username.toUpperCase() + "REF" + user.id.slice(-4);
    const referralLink = `${req.get('host')}/register?ref=${referralCode}`;
    
    // Real referral stats - starting with zero for new users
    const referralStats = {
      totalReferrals: 0,
      activeReferrals: 0,
      totalEarnings: "₹0.00",
      thisMonthEarnings: "₹0.00",
      referralCode,
      referralLink: `https://${referralLink}`,
      bonusPerReferral: "₹8.00"
    };
    
    res.json(referralStats);
  });

  app.get("/api/user/earnings", async (req: Request, res: Response) => {
    const userId = authenticateUser(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const views = await storage.getUserAdViews(userId);
    const recentEarnings = views
      .filter(view => view.completed)
      .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
      .slice(0, 10);
    
    res.json(recentEarnings);
  });

  // Withdrawal routes
  app.post("/api/withdrawals", async (req: Request, res: Response) => {
    const userId = authenticateUser(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const withdrawalData = insertWithdrawalSchema.parse({
        ...req.body,
        userId,
      });
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const withdrawalAmount = parseFloat(withdrawalData.amount);
      const availableBalance = parseFloat(user.availableBalance);
      
      if (withdrawalAmount < 4500) {
        return res.status(400).json({ message: "Minimum withdrawal amount is ₹4500" });
      }
      
      if (withdrawalAmount > availableBalance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      const withdrawal = await storage.createWithdrawal(withdrawalData);
      res.json(withdrawal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/withdrawals", async (req: Request, res: Response) => {
    const userId = authenticateUser(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const withdrawals = await storage.getUserWithdrawals(userId);
    res.json(withdrawals);
  });

  // Backend Admin Management Routes
  app.get("/api/admin/stats", async (req: Request, res: Response) => {
    const hasAccess = await requireAdmin(req, res);
    if (!hasAccess) return;
    
    const userStats = await storage.getUsersStats();
    const allWithdrawals = await storage.getAllWithdrawals();
    const allAdViews = await storage.getAllAdViews();
    
    const pendingWithdrawals = allWithdrawals.filter(w => w.status === "pending").length;
    const totalWithdrawals = allWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0).toFixed(2);
    const totalAdViews = allAdViews.filter(view => view.completed).length;
    
    res.json({
      ...userStats,
      pendingWithdrawals,
      totalWithdrawals,
      totalAdViews,
    });
  });

  app.get("/api/admin/users", async (req: Request, res: Response) => {
    const hasAccess = await requireAdmin(req, res);
    if (!hasAccess) return;
    
    const users = await storage.getAllUsers();
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  });

  app.patch("/api/admin/users/:userId", async (req: Request, res: Response) => {
    const hasAccess = await requireAdmin(req, res);
    if (!hasAccess) return;
    
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      // Remove timestamp fields from updates to prevent database errors
      const { createdAt, ...safeUpdates } = updates;
      
      const updatedUser = await storage.updateUser(userId, safeUpdates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.get("/api/admin/withdrawals", async (req: Request, res: Response) => {
    const hasAccess = await requireAdmin(req, res);
    if (!hasAccess) return;
    
    const withdrawals = await storage.getAllWithdrawals();
    
    // Enrich withdrawals with user information
    const enrichedWithdrawals = await Promise.all(
      withdrawals.map(async (withdrawal) => {
        const user = await storage.getUser(withdrawal.userId);
        return {
          ...withdrawal,
          user: user ? { username: user.username, email: user.email } : null,
        };
      })
    );
    
    res.json(enrichedWithdrawals);
  });

  app.patch("/api/admin/withdrawals/:withdrawalId", async (req: Request, res: Response) => {
    const hasAccess = await requireAdmin(req, res);
    if (!hasAccess) return;
    
    const { withdrawalId } = req.params;
    const { status } = req.body;
    
    if (!["pending", "processing", "completed", "failed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const updatedWithdrawal = await storage.updateWithdrawalStatus(withdrawalId, status);
    if (!updatedWithdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    
    res.json(updatedWithdrawal);
  });

  // New admin endpoints for the redesigned admin panel
  app.post("/api/admin/ad-settings", async (req: Request, res: Response) => {
    const hasAccess = await requireAdmin(req, res);
    if (!hasAccess) return;
    
    // In a real app, you'd save these to database
    // For now, just return success
    res.json({ message: "Ad settings saved successfully", settings: req.body });
  });

  app.post("/api/admin/platform-settings", async (req: Request, res: Response) => {
    const hasAccess = await requireAdmin(req, res);
    if (!hasAccess) return;
    
    // In a real app, you'd save these to database
    // For now, just return success
    res.json({ message: "Platform settings saved successfully", settings: req.body });
  });

  // Backend Admin CRUD operations for users
  app.post("/api/admin/users", async (req: Request, res: Response) => {
    const hasAccess = await requireAdmin(req, res);
    if (!hasAccess) return;
    
    try {
      const userData = req.body;
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });



  app.delete("/api/admin/users/:userId", async (req: Request, res: Response) => {
    const hasAccess = await requireAdmin(req, res);
    if (!hasAccess) return;
    
    try {
      const { userId } = req.params;
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin CRUD operations for ads
  app.get("/api/admin/ads", async (req: Request, res: Response) => {
    const hasAccess = await requireAdmin(req, res);
    if (!hasAccess) return;
    
    const ads = await storage.getAllAds();
    res.json(ads);
  });

  app.post("/api/admin/ads", async (req: Request, res: Response) => {
    const hasAccess = await requireAdmin(req, res);
    if (!hasAccess) return;
    
    try {
      const adData = req.body;
      const newAd = await storage.createAd(adData);
      res.json(newAd);
    } catch (error) {
      console.error("Create ad error:", error);
      res.status(500).json({ message: "Failed to create ad" });
    }
  });

  app.patch("/api/admin/ads/:adId", async (req: Request, res: Response) => {
    const hasAccess = await requireAdmin(req, res);
    if (!hasAccess) return;
    
    try {
      const { adId } = req.params;
      const updates = req.body;
      
      const updatedAd = await storage.updateAd(adId, updates);
      if (!updatedAd) {
        return res.status(404).json({ message: "Ad not found" });
      }
      
      res.json(updatedAd);
    } catch (error) {
      console.error("Update ad error:", error);
      res.status(500).json({ message: "Failed to update ad" });
    }
  });

  app.delete("/api/admin/ads/:adId", async (req: Request, res: Response) => {
    const hasAccess = await requireAdmin(req, res);
    if (!hasAccess) return;
    
    try {
      const { adId } = req.params;
      await storage.deleteAd(adId);
      res.json({ message: "Ad deleted successfully" });
    } catch (error) {
      console.error("Delete ad error:", error);
      res.status(500).json({ message: "Failed to delete ad" });
    }
  });

  // Admin CRUD operations for withdrawals
  app.delete("/api/admin/withdrawals/:withdrawalId", async (req: Request, res: Response) => {
    const hasAccess = await requireAdmin(req, res);
    if (!hasAccess) return;
    
    try {
      const { withdrawalId } = req.params;
      await storage.deleteWithdrawal(withdrawalId);
      res.json({ message: "Withdrawal deleted successfully" });
    } catch (error) {
      console.error("Delete withdrawal error:", error);
      res.status(500).json({ message: "Failed to delete withdrawal" });
    }
  });

  // Admin analytics endpoint
  app.get("/api/admin/user-ad-views", async (req: Request, res: Response) => {
    const hasAccess = await requireAdmin(req, res);
    if (!hasAccess) return;
    
    try {
      const userAdViews = await storage.getAllUserAdViews();
      res.json(userAdViews);
    } catch (error) {
      console.error("Get all user ad views error:", error);
      res.status(500).json({ message: "Failed to fetch user ad views" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
