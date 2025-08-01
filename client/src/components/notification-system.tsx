import { useState, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/App";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  User
} from "lucide-react";
import { format } from "date-fns";

interface Notification {
  id: string;
  type: "withdrawal_status" | "earning" | "system";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  data?: any;
}

export default function NotificationSystem() {
  const { user, sessionId } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Use saved user data if context is missing
  const savedUser = localStorage.getItem("user");
  const displayUser = user || (savedUser ? JSON.parse(savedUser) : null);
  const activeSessionId = sessionId || localStorage.getItem('sessionId');

  // Get user withdrawals to generate notifications
  const { data: withdrawals } = useQuery({
    queryKey: ["/api/withdrawals"],
    enabled: !!displayUser && !!activeSessionId,
  });

  // Get user earnings for notifications
  const { data: earnings } = useQuery({
    queryKey: ["/api/user/earnings"],
    enabled: !!displayUser && !!activeSessionId,
  });

  // Generate notifications from transaction data
  useEffect(() => {
    if (!withdrawals && !earnings) return;

    const newNotifications: Notification[] = [];

    // Add withdrawal notifications - show all withdrawals as transaction history
    if (Array.isArray(withdrawals)) {
      withdrawals.forEach((withdrawal: any) => {
        const statusMessages = {
          pending: "Withdrawal request submitted and under review",
          processing: "Payment is being processed by our team",
          completed: "Payment completed successfully to your account",
          failed: "Withdrawal request was declined - contact support"
        };

        const statusIcons = {
          pending: "🕐",
          processing: "💳", 
          completed: "✅",
          failed: "❌"
        };

        // Show detailed transaction info in notifications
        newNotifications.push({
          id: `withdrawal_${withdrawal.id}`,
          type: "withdrawal_status",
          title: `${statusIcons[withdrawal.status as keyof typeof statusIcons]} Withdrawal Request - ${withdrawal.status.toUpperCase()}`,
          message: `Amount: ₹${withdrawal.amount} | Method: ${withdrawal.paymentMethod.toUpperCase()} | ${withdrawal.paymentDetails}`,
          createdAt: withdrawal.requestedAt,
          read: false,
          data: withdrawal
        });
      });
    }

    // Add earning notifications - show all recent earnings as transaction history
    if (Array.isArray(earnings)) {
      earnings.slice(0, 8).forEach((earning: any) => {
        newNotifications.push({
          id: `earning_${earning.id}`,
          type: "earning",
          title: "💰 Ad Viewing Reward",
          message: `Earned ₹${earning.earnings} from watching advertisement | Status: ${earning.completed ? 'Completed' : 'In Progress'}`,
          createdAt: earning.viewedAt,
          read: false,
          data: earning
        });
      });
    }

    // Sort by date (most recent first)
    newNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setNotifications(newNotifications.slice(0, 10)); // Keep only recent 10
    setUnreadCount(newNotifications.length);
  }, [withdrawals, earnings]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string, data?: any) => {
    switch (type) {
      case "withdrawal_status":
        if (data?.status === "completed") return <CheckCircle className="h-4 w-4 text-green-600" />;
        if (data?.status === "failed") return <XCircle className="h-4 w-4 text-red-600" />;
        if (data?.status === "processing") return <AlertCircle className="h-4 w-4 text-blue-600" />;
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "earning":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!displayUser || !activeSessionId) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative bg-blue-50 hover:bg-blue-100 text-blue-600">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-red-500 text-white rounded-full"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" side="bottom">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Transaction History</h3>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">All your earnings and withdrawals</p>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y max-h-80 overflow-y-auto">
              <div className="px-4 py-2 bg-gray-100 text-xs font-medium text-gray-700 sticky top-0">
                Recent Transaction History ({notifications.length})
              </div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                    notification.type === "withdrawal_status" 
                      ? notification.data?.status === "completed" 
                        ? "border-green-400 bg-green-50" 
                        : notification.data?.status === "failed" 
                          ? "border-red-400 bg-red-50" 
                          : "border-amber-400 bg-amber-50"
                      : "border-blue-400 bg-blue-50"
                  } ${!notification.read ? "" : "opacity-70"}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.data)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-2">
                          {notification.type === "withdrawal_status" && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              notification.data?.status === "completed" ? "bg-green-100 text-green-800" :
                              notification.data?.status === "failed" ? "bg-red-100 text-red-800" :
                              notification.data?.status === "processing" ? "bg-blue-100 text-blue-800" :
                              "bg-amber-100 text-amber-800"
                            }`}>
                              {notification.data?.status}
                            </span>
                          )}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 mt-1 font-medium">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(notification.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Bell className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-sm font-medium">No transaction history yet</p>
              <p className="text-xs mt-1 text-gray-400">Your earnings and withdrawals will appear here</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 text-xs"
                onClick={() => window.location.href = '/dashboard'}
              >
                Start watching ads to earn
              </Button>
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="p-4 border-t bg-gradient-to-r from-green-50 to-blue-50">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Coins className="h-4 w-4 text-green-600" />
                Account Summary
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <div className="text-gray-600">Total Earnings</div>
                  <div className="font-bold text-green-600 text-sm">₹{displayUser?.totalEarnings || "0"}</div>
                </div>
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <div className="text-gray-600">Available</div>
                  <div className="font-bold text-blue-600 text-sm">₹{displayUser?.availableBalance || "0"}</div>
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs">Pending Withdrawals</span>
                  <span className="font-bold text-amber-600 text-sm">
                    {Array.isArray(withdrawals) ? withdrawals.filter((w: any) => w.status === 'pending').length : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}