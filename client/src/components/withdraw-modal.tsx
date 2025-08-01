import { useState, useContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/App";
import { Wallet, AlertCircle, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const { user, sessionId } = useContext(AuthContext);
  
  // Get sessionId from localStorage if not in context
  const activeSessionId = sessionId || localStorage.getItem('sessionId');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [withdrawData, setWithdrawData] = useState({
    amount: "",
    method: "",
    accountDetails: "",
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/withdrawals", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request has been submitted successfully. We'll process it within 2-3 business days.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      onClose();
      setWithdrawData({ amount: "", method: "", accountDetails: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "There was an error processing your withdrawal request.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(withdrawData.amount);
    const availableBalance = parseFloat(displayUser?.availableBalance || "0");
    
    if (amount < 4500) {
      toast({
        title: "Minimum Withdrawal Amount",
        description: "Minimum withdrawal amount is ₹4500.",
        variant: "destructive",
      });
      return;
    }
    
    if (amount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal.",
        variant: "destructive",
      });
      return;
    }
    
    if (!withdrawData.method || !withdrawData.accountDetails) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Additional validation for bank accounts
    if (withdrawData.method === "bank") {
      const parts = withdrawData.accountDetails.split('|');
      if (parts.length < 4 || parts.some(part => !part.trim())) {
        toast({
          title: "Incomplete Bank Details",
          description: "Please fill in all bank account fields: Account Holder Name, Account Number, IFSC Code, and Bank Name.",
          variant: "destructive",
        });
        return;
      }
      
      // Basic IFSC validation
      const ifscCode = parts[2].trim();
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
        toast({
          title: "Invalid IFSC Code",
          description: "Please enter a valid IFSC code (e.g., SBIN0001234).",
          variant: "destructive",
        });
        return;
      }
    }

    withdrawMutation.mutate({
      amount: amount.toString(),
      paymentMethod: withdrawData.method,
      paymentDetails: withdrawData.accountDetails,
    });
  };

  const paymentMethods = [
    { value: "upi", label: "UPI (GPay/PhonePe/Paytm)" },
    { value: "bank", label: "Indian Bank Account (NEFT/RTGS)" },
    { value: "paytm", label: "Paytm Wallet" },
    { value: "paypal", label: "PayPal" },
  ];

  // Use saved user data if context is missing
  const savedUser = localStorage.getItem("user");
  const displayUser = user || (savedUser ? JSON.parse(savedUser) : null);
  
  if (!displayUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-600" />
            Withdraw Earnings
          </DialogTitle>
          <DialogDescription>
            Request a withdrawal from your available balance of ₹{displayUser.availableBalance}
            <br />
            <span className="text-sm text-amber-600 font-medium">
              Minimum withdrawal: ₹4500
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Withdrawal Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="4500"
              min="4500"
              step="1"
              value={withdrawData.amount}
              onChange={(e) =>
                setWithdrawData({ ...withdrawData, amount: e.target.value })
              }
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum withdrawal: ₹4500
            </p>
          </div>

          <div>
            <Label htmlFor="method">Payment Method</Label>
            <Select
              value={withdrawData.method}
              onValueChange={(value) =>
                setWithdrawData({ ...withdrawData, method: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="accountDetails">Account Details</Label>
            {withdrawData.method === "bank" ? (
              <div className="space-y-3">
                <Input
                  placeholder="Account Holder Name"
                  value={withdrawData.accountDetails.split('|')[0] || ''}
                  onChange={(e) => {
                    const parts = withdrawData.accountDetails.split('|');
                    parts[0] = e.target.value;
                    setWithdrawData({ ...withdrawData, accountDetails: parts.join('|') });
                  }}
                  required
                />
                <Input
                  placeholder="Bank Account Number"
                  value={withdrawData.accountDetails.split('|')[1] || ''}
                  onChange={(e) => {
                    const parts = withdrawData.accountDetails.split('|');
                    parts[1] = e.target.value;
                    setWithdrawData({ ...withdrawData, accountDetails: parts.join('|') });
                  }}
                  required
                />
                <Input
                  placeholder="IFSC Code (e.g., SBIN0001234)"
                  value={withdrawData.accountDetails.split('|')[2] || ''}
                  onChange={(e) => {
                    const parts = withdrawData.accountDetails.split('|');
                    parts[2] = e.target.value.toUpperCase();
                    setWithdrawData({ ...withdrawData, accountDetails: parts.join('|') });
                  }}
                  required
                />
                <Input
                  placeholder="Bank Name"
                  value={withdrawData.accountDetails.split('|')[3] || ''}
                  onChange={(e) => {
                    const parts = withdrawData.accountDetails.split('|');
                    parts[3] = e.target.value;
                    setWithdrawData({ ...withdrawData, accountDetails: parts.join('|') });
                  }}
                  required
                />
              </div>
            ) : (
              <Input
                id="accountDetails"
                placeholder={
                  withdrawData.method === "paypal"
                    ? "PayPal email address"
                    : withdrawData.method === "upi"
                    ? "UPI ID (example@okaxis)"
                    : withdrawData.method === "paytm"
                    ? "Paytm registered mobile number"
                    : "Account details"
                }
                value={withdrawData.accountDetails}
                onChange={(e) =>
                  setWithdrawData({ ...withdrawData, accountDetails: e.target.value })
                }
                required
              />
            )}
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Processing Information:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Withdrawals are processed within 2-3 business days</li>
                  <li>• A processing fee of 2% may apply</li>
                  <li>• Minimum withdrawal amount is ₹4500</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={withdrawMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {withdrawMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Withdrawal
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}