
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

interface GrowthData {
    month: string;
    portfolioValue: number;
    principalDisbursed: number;
    cashCollected: number;
}

export const GrowthChart = () => {
    const [data, setData] = useState<GrowthData[]>([]);

    useEffect(() => {
        const fetchGrowth = async () => {
            try {
                const stats = await api.reports.getGrowthStats();
                setData(stats);
            } catch (error) {
                console.error("Error fetching growth stats:", error);
            }
        };
        fetchGrowth();
    }, []);

    if (data.length === 0) return null;

    return (
        <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-default">
            <CardHeader>
                <CardTitle>Portfolio Growth</CardTitle>
                <CardDescription>
                    Monthly portfolio performance (Millions)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                            <XAxis dataKey="month" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                            <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" tickFormatter={(val) => `${val}M`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "6px",
                                }}
                                formatter={(value: number) => [`UGX ${value.toFixed(2)}M`, ""]}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="portfolioValue" name="Total Portfolio" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="principalDisbursed" name="Disbursed" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="cashCollected" name="Collected" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
