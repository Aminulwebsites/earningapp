import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  History,
  Wallet,
  Eye
} from "lucide-react";
import Navigation from "@/components/navigation";
import { format } from "date-fns";

export default function Transactions() {
  const { user } = useContext(AuthContext);
  const savedUser = localStorage.getItem("user");
  const displayUser = user || (savedUser ? JSON.parse(savedUser) : null);

  const { data: withdrawals } = useQuery({
    queryKey: ["/api/withdrawals"],
    enabled: !!displayUser,
  });

  const { data: earnings } = useQuery({
    queryKey: ["/api/user/earnings"],
    enabled: !!displayUser,
  });

  if (!displayUser) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "processing":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Combine all transactions
  const allTransactions = [
    ...(Array.isArray(withdrawals) ? withdrawals.map((w: any) => ({
      ...w,
      type: "withdrawal",
      amount: `-₹${w.amount}`,
      description: `Withdrawal via ${w.paymentMethod.toUpperCase()}`,
      date: w.requestedAt,
    })) : []),
    ...(Array.isArray(earnings) ? earnings.map((e: any) => ({
      ...e,
      type: "earning",
      amount: `+₹${e.earnings}`,
      description: "Ad viewing reward",
      date: e.viewedAt,
      status: e.completed ? "completed" : "pending",
    })) : [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <History className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          </div>
          <p className="text-gray-600">
            View your complete transaction history including earnings and withdrawals
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <ArrowDownLeft className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500">Total Earnings</dt>
                  <dd className="text-lg font-semibold text-gray-900">₹{displayUser.totalEarnings || "0"}</dd>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500">Total Withdrawals</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    ₹{Array.isArray(withdrawals) 
                      ? withdrawals.reduce((sum: number, w: any) => sum + parseFloat(w.amount), 0).toFixed(2)
                      : "0.00"}
                  </dd>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500">Available Balance</dt>
                  <dd className="text-lg font-semibold text-gray-900">₹{displayUser.availableBalance || "0"}</dd>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTransactions.slice(0, 50).map((transaction: any, index: number) => (
                      <TableRow key={transaction.id || index}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {transaction.type === "withdrawal" ? (
                              <ArrowUpRight className="h-4 w-4 text-red-600" />
                            ) : (
                              <ArrowDownLeft className="h-4 w-4 text-green-600" />
                            )}
                            <span className="capitalize font-medium">
                              {transaction.type}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            {transaction.type === "withdrawal" && (
                              <p className="text-xs text-gray-500">
                                {transaction.paymentDetails}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${
                            transaction.type === "withdrawal" ? "text-red-600" : "text-green-600"
                          }`}>
                            {transaction.amount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(transaction.status)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(transaction.status)}
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">
                              {format(new Date(transaction.date), "MMM dd, yyyy")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(transaction.date), "hh:mm a")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No transactions found</p>
                <p className="text-sm">Your transaction history will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}