
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from "recharts";

interface RoiData {
    product: string;
    principal: number;
    revenue: number;
    repaymentRate: number;
}

export const RoiChart = () => {
    const [data, setData] = useState<RoiData[]>([]);

    useEffect(() => {
        const fetchRoi = async () => {
            try {
                const stats = await api.reports.getRoiStats();
                setData(stats);
            } catch (error) {
                console.error("Error fetching ROI stats:", error);
            }
        };
        fetchRoi();
    }, []);

    if (data.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Product Performance (ROI)</CardTitle>
                <CardDescription>
                    Revenue & Principal per Product (Millions)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                            <XAxis dataKey="product" className="text-xs" stroke="hsl(var(--muted-foreground))" />
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
                            <Bar dataKey="principal" name="Principal Disbursed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="revenue" name="Net Revenue (Interest)" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
