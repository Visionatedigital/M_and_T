import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Mock data - replace with real data from your backend
const data = [
  { month: "Jan", disbursed: 12.4, repayments: 8.2 },
  { month: "Feb", disbursed: 29.4, repayments: 15.6 },
  { month: "Mar", disbursed: 18.2, repayments: 22.1 },
  { month: "Apr", disbursed: 24.8, repayments: 19.4 },
  { month: "May", disbursed: 35.1, repayments: 28.3 },
  { month: "Jun", disbursed: 38.6, repayments: 32.8 },
  { month: "Jul", disbursed: 45.2, repayments: 38.5 },
];

export const DisbursementChart = () => {
  const [showDisbursed, setShowDisbursed] = useState(true);
  const [showRepayments, setShowRepayments] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Analytics</CardTitle>
        <CardDescription>
          Loan disbursements and repayments over time (UGX Millions)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="disbursementGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="repaymentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `${value}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              {showDisbursed && (
                <Area
                  type="monotone"
                  dataKey="disbursed"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#disbursementGradient)"
                  animationDuration={1500}
                  name="Disbursed"
                />
              )}
              {showRepayments && (
                <Area
                  type="monotone"
                  dataKey="repayments"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fill="url(#repaymentGradient)"
                  animationDuration={1500}
                  name="Repayments"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center gap-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="disbursed"
              checked={showDisbursed}
              onCheckedChange={(checked) => setShowDisbursed(checked === true)}
            />
            <Label 
              htmlFor="disbursed" 
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-3 h-3 rounded-full bg-primary" />
              Disbursed
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox 
              id="repayments"
              checked={showRepayments}
              onCheckedChange={(checked) => setShowRepayments(checked === true)}
            />
            <Label 
              htmlFor="repayments" 
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-3 h-3 rounded-full bg-accent" />
              Repayments
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
