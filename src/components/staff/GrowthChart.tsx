
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

interface GrowthData {
    month: string;
    portfolioValue: number;
    principalDisbursed: number;
    cashCollected: number;
}

export const GrowthChart = () => {
    const [data, setData] = useState<GrowthData[]>([]);
    const { role } = useUserRole();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stats = await api.reports.getGrowthStats();
                // Reverse if backend returns desc, but backend returns newest to oldest? 
                // Backend loop: i=11 down to 0 (Oldest to Newest).
                // Wait, loop `i` from 11 down to 0 means:
                // i=11 -> Month - 11 (Oldest)
                // i=0 -> Month - 0 (Current)
                // So data is already Oldest -> Newest.
                setData(stats);
            } catch (error) {
                console.error("Error fetching growth stats:", error);
            }
        };

        if (role) fetchData();
    }, [role]);

    if (data.length === 0) return null;

    const currentVal = data[data.length - 1]?.portfolioValue || 0;
    const initialCap = data[data.length - 1]?.principalDisbursed || 0;
    const multiplier = initialCap > 0 ? (currentVal / initialCap).toFixed(2) : "0.00";

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Portfolio Growth Tracking</CardTitle>
                        <CardDescription>
                            Total Portfolio Value (Principal + Interest) vs. Capital Injected
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Money Multiplier</p>
                        <p className="text-2xl font-bold text-green-600">{multiplier}x</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="principalGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                            <XAxis dataKey="month" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                            <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${value}M`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "6px",
                                }}
                                formatter={(value: number) => [`UGX ${value.toFixed(2)}M`, ""]}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="portfolioValue"
                                name="Total Portfolio Value"
                                stroke="#10b981"
                                fill="url(#valueGradient)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="principalDisbursed"
                                name="Capital Disbursed"
                                stroke="#6366f1"
                                fill="url(#principalGradient)"
                                strokeWidth={2}
                                fillOpacity={0.1}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
