import React, { useState, useEffect, useCallback } from "react";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AgingReport = () => {
    const { toast } = useToast();
    const [selectedMonth, setSelectedMonth] = useState("2025-01");
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Format month for display
    const monthLabel = new Date(selectedMonth + "-01").toLocaleString('default', { month: 'short', year: 'numeric' }).toUpperCase();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [year, month] = selectedMonth.split('-').map(Number);
            // Get the actual last day of the month (handles Feb, 30-day months, etc.)
            const lastDay = new Date(year, month, 0).getDate();
            const from = `${selectedMonth}-01`;
            const to = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;
            const res = await api.reports.getAgingReport({ from, to });
            setData(res.data || []);
        } catch (error: any) {
            console.error(error);
            toast({ title: "Failed to load aging report", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [selectedMonth, toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const exportToCSV = (tableData: any[], filename: string) => {
        if (!tableData || !tableData.length) return;
        const headers = Object.keys(tableData[0]).map(h => `"${h}"`).join(",");
        const rows = tableData.map(row =>
            Object.values(row).map(val => {
                const strVal = String(val !== null && val !== undefined ? val : '');
                return `"${strVal.replace(/"/g, '""')}"`;
            }).join(",")
        ).join("\n");

        const csvContent = headers + "\n" + rows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExport = () => {
        if (!data || data.length === 0) return;
        const rows = data.map((row: any) => ({
            "#": row.index,
            "Name": row.name,
            "Loan Issue Date": row.issue_date,
            "Rate": row.rate,
            "Loan ID": row.loan_id,
            "Days of Month": row.days_of_month,
            "Days in Period": row.days_in_period,
            "Original Loan": row.original_amount || 0,
            "Principal Outstanding": row.principal_outstanding || 0,
            "Interest for Month": row.interest_monthly || 0,
            "Interest Due": row.interest_due || 0,
            "Payments": row.payments || 0,
            "Interest Income": row.interest_income || 0,
            "Total Balance": row.total_balance || 0
        }));
        exportToCSV(rows, `Aging_Report_${selectedMonth}`);
    };

    const totalOriginalAmount = data.reduce((s, r) => s + (r.original_amount || 0), 0);
    const totalPrincipalOutstanding = data.reduce((s, r) => s + (r.principal_outstanding || 0), 0);
    const totalInterestMonthly = data.reduce((s, r) => s + (r.interest_monthly || 0), 0);
    const totalInterestDue = data.reduce((s, r) => s + (r.interest_due || 0), 0);
    const totalPayments = data.reduce((s, r) => s + (r.payments || 0), 0);
    const totalInterestIncome = data.reduce((s, r) => s + (r.interest_income || 0), 0);
    const finalTotalBalance = data.reduce((s, r) => s + (r.total_balance || 0), 0);

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 p-4 md:p-8 bg-muted/20">
                        <div className="max-w-[1600px] mx-auto space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold">Aging Report</h1>
                                    <p className="text-muted-foreground">Detailed portfolio aging and monthly interest income analysis.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-background border px-3 py-2 rounded-md shadow-sm">
                                        <CalendarIcon className="h-4 w-4 text-primary" />
                                        <input
                                            type="month"
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                            className="bg-transparent border-none outline-none text-sm font-medium"
                                        />
                                    </div>
                                    <Button variant="outline" className="gap-2" onClick={handleExport}>
                                        <FileSpreadsheet className="h-4 w-4 text-green-600" /> Export Excel
                                    </Button>
                                </div>
                            </div>

                            <Card className="border-none shadow-lg overflow-hidden">
                                <CardHeader className="bg-primary/5 pb-6">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl">Portfolio Aging - {monthLabel}</CardTitle>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="bg-white/50">Total Principal: UGX {totalOriginalAmount.toLocaleString()}</Badge>
                                            <Badge variant="outline" className="bg-white/50">Interest Due: UGX {totalInterestDue.toLocaleString()}</Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {loading ? (
                                        <div className="flex justify-center items-center py-24">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-muted/80">
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableHead className="whitespace-nowrap border-r">#</TableHead>
                                                        <TableHead className="whitespace-nowrap border-r min-w-[200px]">Name</TableHead>
                                                        <TableHead className="whitespace-nowrap border-r">Issue Date</TableHead>
                                                        <TableHead className="whitespace-nowrap border-r text-center">Int. Rate</TableHead>
                                                        <TableHead className="whitespace-nowrap border-r">Loan ID</TableHead>
                                                        <TableHead className="whitespace-nowrap border-r text-center">Days/Mo</TableHead>
                                                        <TableHead className="whitespace-nowrap border-r text-center">Days in {monthLabel}</TableHead>
                                                        <TableHead className="whitespace-nowrap border-r text-right">Original Amt</TableHead>
                                                        <TableHead className="whitespace-nowrap border-r text-right">Prin. Oustanding</TableHead>
                                                        <TableHead className="whitespace-nowrap border-r text-right">Int. Due (Mo)</TableHead>
                                                        <TableHead className="whitespace-nowrap border-r text-right">Payments {monthLabel}</TableHead>
                                                        <TableHead className="whitespace-nowrap border-r text-right underline decoration-primary/50">Interest Income</TableHead>
                                                        <TableHead className="whitespace-nowrap border-r text-right font-bold text-primary">TOTAL BALANCE</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {data.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                                                                No aging data available for this period.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        data.map((row) => (
                                                            <TableRow key={row.loan_id + row.index} className="hover:bg-primary/5 transition-colors">
                                                                <TableCell className="border-r">{row.index}</TableCell>
                                                                <TableCell className="font-semibold border-r">{row.name}</TableCell>
                                                                <TableCell className="border-r text-xs">{row.issue_date}</TableCell>
                                                                <TableCell className="border-r text-xs text-center">{row.rate}</TableCell>
                                                                <TableCell className="border-r text-xs font-mono">{row.loan_id}</TableCell>
                                                                <TableCell className="border-r text-center">{row.days_of_month}</TableCell>
                                                                <TableCell className="border-r text-center">{row.days_in_period}</TableCell>
                                                                <TableCell className="border-r text-right">{(row.original_amount || 0).toLocaleString()}</TableCell>
                                                                <TableCell className="border-r text-right">{(row.principal_outstanding || 0).toLocaleString()}</TableCell>
                                                                <TableCell className="border-r text-right text-blue-700">{(row.interest_due || 0).toLocaleString()}</TableCell>
                                                                <TableCell className="border-r text-right text-green-600">{(row.payments || 0).toLocaleString()}</TableCell>
                                                                <TableCell className="border-r text-right font-medium">{(row.interest_income || 0).toLocaleString()}</TableCell>
                                                                <TableCell className="border-r text-right font-bold text-primary">{(row.total_balance || 0).toLocaleString()}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                    {/* Total Row */}
                                                    {data.length > 0 && (
                                                        <TableRow className="bg-muted/30 font-bold border-t-2">
                                                            <TableCell colSpan={7} className="text-right border-r">TOTALS:</TableCell>
                                                            <TableCell className="border-r text-right">{totalOriginalAmount.toLocaleString()}</TableCell>
                                                            <TableCell className="border-r text-right">{totalPrincipalOutstanding.toLocaleString()}</TableCell>
                                                            <TableCell className="border-r text-right text-blue-700">{totalInterestDue.toLocaleString()}</TableCell>
                                                            <TableCell className="border-r text-right text-green-600">{totalPayments.toLocaleString()}</TableCell>
                                                            <TableCell className="border-r text-right underline decoration-primary/50">{totalInterestIncome.toLocaleString()}</TableCell>
                                                            <TableCell className="border-r text-right text-primary">{finalTotalBalance.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default AgingReport;
