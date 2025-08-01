import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar, Coins } from "lucide-react";
import { format, subDays, isToday, isYesterday } from "date-fns";

interface EarningsChartProps {
  earnings: any[];
}

export default function EarningsChart({ earnings }: EarningsChartProps) {
  // Group earnings by date for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return {
      date: format(date, "yyyy-MM-dd"),
      displayDate: isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM dd"),
      amount: 0,
      count: 0,
    };
  }).reverse();

  // Aggregate earnings by date
  earnings.forEach((earning) => {
    const earningDate = format(new Date(earning.viewedAt), "yyyy-MM-dd");
    const dayData = last7Days.find(day => day.date === earningDate);
    if (dayData) {
      dayData.amount += parseFloat(earning.earnings);
      dayData.count += 1;
    }
  });

  const totalEarnings = last7Days.reduce((sum, day) => sum + day.amount, 0);
  const totalAds = last7Days.reduce((sum, day) => sum + day.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            7-Day Earnings Overview
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-green-700 bg-green-100">
              <Coins className="h-3 w-3 mr-1" />
              ₹{totalEarnings.toFixed(2)}
            </Badge>
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              {totalAds} ads
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayDate" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                formatter={(value: any) => [`₹${value.toFixed(2)}`, "Earnings"]}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                }}
              />
              <Bar 
                dataKey="amount" 
                fill="#22c55e" 
                radius={[4, 4, 0, 0]}
                fillOpacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 font-medium">Daily Average</p>
            <p className="text-lg font-bold text-green-900">₹{(totalEarnings / 7).toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">Avg per Ad</p>
            <p className="text-lg font-bold text-blue-900">₹{totalAds > 0 ? (totalEarnings / totalAds).toFixed(2) : "0.00"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}