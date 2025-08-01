import { type User, type InsertUser, type Ad, type InsertAd, type UserAdView, type InsertUserAdView, type Withdrawal, type InsertWithdrawal, users, ads, userAdViews, withdrawals } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersStats(): Promise<{totalUsers: number; activeUsers: number; totalEarnings: string}>;

  // Ad operations
  getAllActiveAds(): Promise<Ad[]>;
  getAllAds(): Promise<Ad[]>;
  getAd(id: string): Promise<Ad | undefined>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: string, updates: Partial<Ad>): Promise<Ad | undefined>;

  // User ad view operations
  createUserAdView(view: InsertUserAdView): Promise<UserAdView>;
  getUserAdViews(userId: string): Promise<UserAdView[]>;
  getAllAdViews(): Promise<UserAdView[]>;
  getTodayAdViews(userId: string): Promise<UserAdView[]>;
  completeAdView(id: string): Promise<UserAdView | undefined>;

  // Withdrawal operations
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getUserWithdrawals(userId: string): Promise<Withdrawal[]>;
  getAllWithdrawals(): Promise<Withdrawal[]>;
  updateWithdrawalStatus(id: string, status: string): Promise<Withdrawal | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private ads: Map<string, Ad>;
  private userAdViews: Map<string, UserAdView>;
  private withdrawals: Map<string, Withdrawal>;

  constructor() {
    this.users = new Map();
    this.ads = new Map();
    this.userAdViews = new Map();
    this.withdrawals = new Map();
    
    // Initialize with some sample ads and admin user
    this.initializeSampleAds();
    this.initializeAdminUser();
  }

  private initializeSampleAds() {
    const sampleAds: InsertAd[] = [
      {
        title: "Video Ad - 30 seconds",
        type: "video",
        category: "Entertainment",
        duration: 30,
        earnings: "4.00",
        adsterraCode: "adsterra_video_001",
        isActive: true,
      },
      {
        title: "Banner Ad - 15 seconds",
        type: "banner",
        category: "Shopping",
        duration: 15,
        earnings: "2.50",
        adsterraCode: "adsterra_banner_001",
        isActive: true,
      },
      {
        title: "Interactive Ad - 45 seconds",
        type: "interactive",
        category: "Gaming",
        duration: 45,
        earnings: "6.00",
        adsterraCode: "adsterra_interactive_001",
        isActive: true,
      },
    ];

    sampleAds.forEach(ad => {
      const id = randomUUID();
      this.ads.set(id, { ...ad, id, isActive: ad.isActive ?? true });
    });
  }

  private initializeAdminUser() {
    const adminId = randomUUID();
    const adminUser: User = {
      id: adminId,
      username: "admin",
      email: "admin@earnrupee.com",
      password: "admin123", // In production, this should be hashed
      totalEarnings: "0",
      availableBalance: "0",
      adsWatchedToday: 0,
      currentStreak: 0,
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      profilePhoto: null,
      bio: null,
    };
    this.users.set(adminId, adminUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      totalEarnings: "0",
      availableBalance: "0",
      adsWatchedToday: 0,
      currentStreak: 0,
      role: "user",
      isActive: true,
      createdAt: new Date(),
      profilePhoto: null,
      bio: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersStats(): Promise<{totalUsers: number; activeUsers: number; totalEarnings: string}> {
    const users = Array.from(this.users.values());
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const totalEarnings = users.reduce((sum, user) => sum + parseFloat(user.totalEarnings), 0).toFixed(2);
    
    return { totalUsers, activeUsers, totalEarnings };
  }

  async getAllActiveAds(): Promise<Ad[]> {
    return Array.from(this.ads.values()).filter(ad => ad.isActive);
  }

  async getAllAds(): Promise<Ad[]> {
    return Array.from(this.ads.values());
  }

  async getAd(id: string): Promise<Ad | undefined> {
    return this.ads.get(id);
  }

  async createAd(insertAd: InsertAd): Promise<Ad> {
    const id = randomUUID();
    const ad: Ad = { ...insertAd, id, isActive: insertAd.isActive ?? true };
    this.ads.set(id, ad);
    return ad;
  }

  async updateAd(id: string, updates: Partial<Ad>): Promise<Ad | undefined> {
    const ad = this.ads.get(id);
    if (!ad) return undefined;
    
    const updatedAd = { ...ad, ...updates };
    this.ads.set(id, updatedAd);
    return updatedAd;
  }

  async createUserAdView(insertView: InsertUserAdView): Promise<UserAdView> {
    const id = randomUUID();
    const view: UserAdView = {
      ...insertView,
      id,
      completed: false,
      viewedAt: new Date(),
    };
    this.userAdViews.set(id, view);
    return view;
  }

  async getUserAdViews(userId: string): Promise<UserAdView[]> {
    return Array.from(this.userAdViews.values()).filter(
      view => view.userId === userId
    );
  }

  async getAllAdViews(): Promise<UserAdView[]> {
    return Array.from(this.userAdViews.values());
  }

  async getTodayAdViews(userId: string): Promise<UserAdView[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.userAdViews.values()).filter(
      view => view.userId === userId && view.viewedAt >= today
    );
  }

  async completeAdView(id: string): Promise<UserAdView | undefined> {
    const view = this.userAdViews.get(id);
    if (!view) return undefined;
    
    const completedView = { ...view, completed: true };
    this.userAdViews.set(id, completedView);
    
    // Update user earnings
    const user = await this.getUser(view.userId);
    if (user) {
      const newTotalEarnings = (parseFloat(user.totalEarnings) + parseFloat(view.earnings)).toFixed(2);
      const newAvailableBalance = (parseFloat(user.availableBalance) + parseFloat(view.earnings)).toFixed(2);
      const newAdsWatchedToday = user.adsWatchedToday + 1;
      
      await this.updateUser(user.id, {
        totalEarnings: newTotalEarnings,
        availableBalance: newAvailableBalance,
        adsWatchedToday: newAdsWatchedToday,
      });
    }
    
    return completedView;
  }

  async createWithdrawal(insertWithdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const id = randomUUID();
    const withdrawal: Withdrawal = {
      ...insertWithdrawal,
      id,
      status: "pending",
      requestedAt: new Date(),
    };
    this.withdrawals.set(id, withdrawal);
    
    // Deduct from available balance
    const user = await this.getUser(withdrawal.userId);
    if (user) {
      const newAvailableBalance = (parseFloat(user.availableBalance) - parseFloat(withdrawal.amount)).toFixed(2);
      await this.updateUser(user.id, { availableBalance: newAvailableBalance });
    }
    
    return withdrawal;
  }

  async getUserWithdrawals(userId: string): Promise<Withdrawal[]> {
    return Array.from(this.withdrawals.values()).filter(
      withdrawal => withdrawal.userId === userId
    );
  }

  async getAllWithdrawals(): Promise<Withdrawal[]> {
    return Array.from(this.withdrawals.values());
  }

  async updateWithdrawalStatus(id: string, status: string): Promise<Withdrawal | undefined> {
    const withdrawal = this.withdrawals.get(id);
    if (!withdrawal) return undefined;
    
    const updatedWithdrawal = { ...withdrawal, status };
    this.withdrawals.set(id, updatedWithdrawal);
    return updatedWithdrawal;
  }
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: "user",
        isActive: true,
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    // Filter out timestamp fields from updates to prevent type issues
    const { createdAt, ...safeUpdates } = updates;
    
    const [user] = await db
      .update(users)
      .set(safeUpdates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersStats(): Promise<{totalUsers: number; activeUsers: number; totalEarnings: string}> {
    const allUsers = await db.select().from(users);
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(user => user.isActive).length;
    const totalEarnings = allUsers.reduce((sum, user) => sum + parseFloat(user.totalEarnings), 0).toFixed(2);
    
    return { totalUsers, activeUsers, totalEarnings };
  }

  async getAllActiveAds(): Promise<Ad[]> {
    return await db.select().from(ads).where(eq(ads.isActive, true));
  }

  async getAllAds(): Promise<Ad[]> {
    return await db.select().from(ads);
  }

  async getAd(id: string): Promise<Ad | undefined> {
    const [ad] = await db.select().from(ads).where(eq(ads.id, id));
    return ad || undefined;
  }

  async createAd(insertAd: InsertAd): Promise<Ad> {
    const [ad] = await db
      .insert(ads)
      .values(insertAd)
      .returning();
    return ad;
  }

  async updateAd(id: string, updates: Partial<Ad>): Promise<Ad | undefined> {
    // Ensure proper data types for ad updates
    const cleanUpdates = { ...updates };
    
    // Convert string numbers to proper types if needed
    if (cleanUpdates.duration && typeof cleanUpdates.duration === 'string') {
      cleanUpdates.duration = parseInt(cleanUpdates.duration);
    }
    
    const [ad] = await db
      .update(ads)
      .set(cleanUpdates)
      .where(eq(ads.id, id))
      .returning();
    return ad || undefined;
  }

  async createUserAdView(insertView: InsertUserAdView): Promise<UserAdView> {
    const [view] = await db
      .insert(userAdViews)
      .values({
        ...insertView,
        completed: false,
      })
      .returning();
    return view;
  }

  async getUserAdViews(userId: string): Promise<UserAdView[]> {
    return await db
      .select()
      .from(userAdViews)
      .where(eq(userAdViews.userId, userId))
      .orderBy(desc(userAdViews.viewedAt));
  }

  async getAllAdViews(): Promise<UserAdView[]> {
    return await db.select().from(userAdViews);
  }

  async getTodayAdViews(userId: string): Promise<UserAdView[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await db
      .select()
      .from(userAdViews)
      .where(
        and(
          eq(userAdViews.userId, userId),
          gte(userAdViews.viewedAt, today)
        )
      );
  }

  async completeAdView(id: string): Promise<UserAdView | undefined> {
    const [view] = await db
      .update(userAdViews)
      .set({ completed: true })
      .where(eq(userAdViews.id, id))
      .returning();
    
    if (!view) return undefined;
    
    // Update user earnings
    const user = await this.getUser(view.userId);
    if (user) {
      const newTotalEarnings = (parseFloat(user.totalEarnings) + parseFloat(view.earnings)).toFixed(2);
      const newAvailableBalance = (parseFloat(user.availableBalance) + parseFloat(view.earnings)).toFixed(2);
      const newAdsWatchedToday = user.adsWatchedToday + 1;
      
      await this.updateUser(user.id, {
        totalEarnings: newTotalEarnings,
        availableBalance: newAvailableBalance,
        adsWatchedToday: newAdsWatchedToday,
      });
    }
    
    return view;
  }

  async createWithdrawal(insertWithdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const [withdrawal] = await db
      .insert(withdrawals)
      .values({
        ...insertWithdrawal,
        status: "pending",
      })
      .returning();
    
    // Deduct from available balance
    const user = await this.getUser(withdrawal.userId);
    if (user) {
      const newAvailableBalance = (parseFloat(user.availableBalance) - parseFloat(withdrawal.amount)).toFixed(2);
      await this.updateUser(user.id, { availableBalance: newAvailableBalance });
    }
    
    return withdrawal;
  }

  async getUserWithdrawals(userId: string): Promise<Withdrawal[]> {
    return await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, userId))
      .orderBy(desc(withdrawals.requestedAt));
  }

  async getAllWithdrawals(): Promise<Withdrawal[]> {
    return await db
      .select()
      .from(withdrawals)
      .orderBy(desc(withdrawals.requestedAt));
  }

  async updateWithdrawalStatus(id: string, status: string): Promise<Withdrawal | undefined> {
    const [withdrawal] = await db
      .update(withdrawals)
      .set({ status })
      .where(eq(withdrawals.id, id))
      .returning();
    return withdrawal || undefined;
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async deleteAd(adId: string): Promise<void> {
    await db.delete(ads).where(eq(ads.id, adId));
  }

  async deleteWithdrawal(withdrawalId: string): Promise<void> {
    await db.delete(withdrawals).where(eq(withdrawals.id, withdrawalId));
  }

  async getAllUserAdViews(): Promise<any[]> {
    const adViews = await db
      .select({
        id: userAdViews.id,
        userId: userAdViews.userId,
        adId: userAdViews.adId,
        completed: userAdViews.completed,
        earnings: userAdViews.earnings,
        viewedAt: userAdViews.viewedAt,
        user: {
          username: users.username,
          email: users.email
        },
        ad: {
          title: ads.title,
          type: ads.type,
          category: ads.category
        }
      })
      .from(userAdViews)
      .leftJoin(users, eq(userAdViews.userId, users.id))
      .leftJoin(ads, eq(userAdViews.adId, ads.id))
      .orderBy(desc(userAdViews.viewedAt));
    
    return adViews;
  }
}

// Initialize sample data for database
async function initializeSampleData() {
  try {
    // Check if admin user already exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, "admin"));
    
    if (existingAdmin.length === 0) {
      // Create admin user
      await db.insert(users).values({
        username: "admin",
        email: "admin@earnrupee.com",
        password: "admin123", // In production, this should be hashed
        role: "admin",
        isActive: true,
      });
      
      console.log("✓ Admin user created");
    }

    // Check if sample ads exist
    const existingAds = await db.select().from(ads);
    
    if (existingAds.length === 0) {
      const sampleAds = [
        {
          title: "Video Ad - 30 seconds",
          type: "video",
          category: "Entertainment",
          duration: 30,
          earnings: "4.00",
          adsterraCode: "adsterra_video_001",
          isActive: true,
        },
        {
          title: "Banner Ad - 15 seconds",
          type: "banner",
          category: "Shopping",
          duration: 15,
          earnings: "2.50",
          adsterraCode: "adsterra_banner_001",
          isActive: true,
        },
        {
          title: "Interactive Ad - 45 seconds",
          type: "interactive",
          category: "Gaming",
          duration: 45,
          earnings: "6.00",
          adsterraCode: "adsterra_interactive_001",
          isActive: true,
        },
      ];

      await db.insert(ads).values(sampleAds);
      console.log("✓ Sample ads created");
    }
  } catch (error) {
    console.error("Error initializing sample data:", error);
  }
}

export const storage = new DatabaseStorage();

// Initialize sample data when the module loads
initializeSampleData();
