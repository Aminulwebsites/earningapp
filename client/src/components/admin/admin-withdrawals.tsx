import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, User, Coins, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

interface AdminWithdrawalsProps {
  sessionId: string;
}

export default function AdminWithdrawals({ sessionId }: AdminWithdrawalsProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ["/api/admin/withdrawals"],
    enabled: !!sessionId,
    queryFn: async () => {
      const response = await fetch("/api/admin/withdrawals", {
        headers: { Authorization: `Bearer ${sessionId}` },
      });
      if (!response.ok) throw new Error("Failed to fetch withdrawals");
      return response.json();
    },
  });

  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, status }: { withdrawalId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/withdrawals/${withdrawalId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({
        title: "Success",
        description: "Withdrawal status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update withdrawal",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (withdrawalId: string, status: string) => {
    updateWithdrawalMutation.mutate({ withdrawalId, status });
  };

  const getStatusHistory = (withdrawal: any) => {
    const history = [];
    history.push({ status: "pending", date: withdrawal.requestedAt, label: "Request Submitted" });
    
    if (withdrawal.status === "processing" || withdrawal.status === "completed" || withdrawal.status === "failed") {
      history.push({ status: "processing", date: new Date().toISOString(), label: "Under Review" });
    }
    
    if (withdrawal.status === "completed") {
      history.push({ status: "completed", date: new Date().toISOString(), label: "Payment Processed" });
    } else if (withdrawal.status === "failed") {
      history.push({ status: "failed", date: new Date().toISOString(), label: "Payment Failed" });
    }
    
    return history;
  };

  const filteredWithdrawals = withdrawals?.filter((withdrawal: any) => {
    const matchesSearch = withdrawal.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         withdrawal.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         withdrawal.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || withdrawal.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "processing":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Withdrawal Management</h3>
          <p className="text-sm text-gray-500 mt-1">
            Review and process user withdrawal requests
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search withdrawals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Payment Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWithdrawals.map((withdrawal: any) => (
              <TableRow key={withdrawal.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{withdrawal.user?.username || "Unknown"}</p>
                      <p className="text-sm text-gray-500">{withdrawal.user?.email || "No email"}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center font-semibold text-lg">
                    <Coins className="h-4 w-4 mr-1 text-green-600" />
                    ₹{withdrawal.amount}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {withdrawal.paymentMethod.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {withdrawal.paymentDetails}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(withdrawal.status)}
                    <Badge variant={getStatusVariant(withdrawal.status)}>
                      {withdrawal.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(withdrawal.requestedAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    {withdrawal.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                          onClick={() => handleStatusUpdate(withdrawal.id, "processing")}
                          disabled={updateWithdrawalMutation.isPending}
                        >
                          Process
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          onClick={() => handleStatusUpdate(withdrawal.id, "completed")}
                          disabled={updateWithdrawalMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          onClick={() => handleStatusUpdate(withdrawal.id, "failed")}
                          disabled={updateWithdrawalMutation.isPending}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {withdrawal.status === "processing" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          onClick={() => handleStatusUpdate(withdrawal.id, "completed")}
                          disabled={updateWithdrawalMutation.isPending}
                        >
                          Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          onClick={() => handleStatusUpdate(withdrawal.id, "failed")}
                          disabled={updateWithdrawalMutation.isPending}
                        >
                          Fail
                        </Button>
                      </>
                    )}
                    {(withdrawal.status === "completed" || withdrawal.status === "failed") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(withdrawal.id, "pending")}
                        disabled={updateWithdrawalMutation.isPending}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredWithdrawals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || statusFilter !== "all" ? "No withdrawals found matching your filters." : "No withdrawals found."}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>Showing {filteredWithdrawals.length} of {withdrawals?.length || 0} withdrawals</p>
        <div className="flex space-x-4">
          <span>Total Amount: ₹{withdrawals?.reduce((sum: number, w: any) => sum + parseFloat(w.amount), 0).toFixed(2) || "0.00"}</span>
        </div>
      </div>
    </div>
  );
}