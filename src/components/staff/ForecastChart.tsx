
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, ReferenceLine } from "recharts";

interface ForecastData {
    month: string;
    value: number;
    type: 'historical' | 'projected';
}

export const ForecastChart = () => {
    const [data, setData] = useState<ForecastData[]>([]);
    const [growthRate, setGrowthRate] = useState<string>("0.0");

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                const stats = await api.reports.getForecast();
                // Combine historical and projection
                const combined = [...stats.historical, ...stats.projection];
                setData(combined);
                setGrowthRate(stats.avgGrowthRate);
            } catch (error) {
                console.error("Error fetching forecast:", error);
            }
        };
        fetchForecast();
    }, []);

    if (data.length === 0) return null;

    // Custom Dot to distinguish types
    const CustomizedDot = (props: any) => {
        const { cx, cy, payload } = props;
        if (payload.type === 'projected') {
            return (
                <svg x={cx - 4} y={cy - 4} width={8} height={8} fill="white" viewBox="0 0 1024 1024">
                    <circle cx="512" cy="512" r="512" fill="#f59e0b" stroke="none" />
                </svg>
            );
        }
        return (
            <svg x={cx - 4} y={cy - 4} width={8} height={8} fill="white" viewBox="0 0 1024 1024">
                <circle cx="512" cy="512" r="512" fill="#10b981" stroke="none" />
            </svg>
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Portfolio Forecasting (12 Months)</CardTitle>
                        <CardDescription>
                            Projected growth based on {growthRate}% Avg Monthly Growth
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Projected Value (1 Yr)</p>
                        <p className="text-2xl font-bold text-amber-500">UGX {data[data.length - 1].value.toFixed(1)}M</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                            <XAxis dataKey="month" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                            <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" tickFormatter={(val) => `${val.toFixed(0)}M`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "6px",
                                }}
                                formatter={(value: number) => [`UGX ${value.toFixed(2)}M`, "Portfolio Value"]}
                            />
                            <Legend />
                            {/* Reference line to separate history/future */}
                            <ReferenceLine x={data.find(d => d.type === 'projected')?.month} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label="Today" />

                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={<CustomizedDot />}
                                activeDot={{ r: 6 }}
                                name="Portfolio Value"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
