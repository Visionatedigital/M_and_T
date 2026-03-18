import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Download, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const ComprehensiveIncome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState("2025");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const user = await api.auth.getMe();
      if (!user) {
        navigate("/staff-login");
        return;
      }
      const from = `${selectedYear}-01-01`;
      const to = `${selectedYear}-12-31`;
      const res = await api.reports.getComprehensiveIncome({ from, to, year: parseInt(selectedYear) });
      setData(res);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed to load comprehensive income", description: error.message, variant: "destructive" });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, navigate, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const exportToCSV = () => {
    if (!data?.data?.length || !data?.columns?.length) return;
    const rows: any[] = [];
    const headerRow: any = { Category: "" };
    data.columns.forEach((col: any) => {
      headerRow[col.label] = "";
    });
    rows.push(headerRow);
    data.data.forEach((item: any) => {
      const row: any = { Category: item.category };
      data.columns.forEach((col: any) => {
        const key = `${col.year}-${col.month}`;
        row[col.label] = item.months?.[key] ?? 0;
      });
      rows.push(row);
    });
    const headers = Object.keys(rows[0]).map((h) => `"${h}"`).join(",");
    const csvRows = rows.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ).join("\n");
    const blob = new Blob([headers + "\n" + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Comprehensive_Income_${selectedYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Comprehensive income exported" });
  };

  let totalRevenue = 0;
  let totalExpense = 0;
  (data?.data ?? []).forEach((item: any) => {
    const vals = Object.values(item.months ?? {}) as number[];
    const sum = vals.reduce((a, b) => a + (b || 0), 0);
    if (item.type === "revenue") totalRevenue += sum;
    else totalExpense += sum;
  });
  const netIncome = totalRevenue - totalExpense;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StaffSidebar />
        <div className="flex-1 flex flex-col">
          <StaffHeader />
          <main className="flex-1 p-4 md:p-8 bg-muted/20">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">Statement of Comprehensive Income</h1>
                  <p className="text-muted-foreground">Revenue and expense breakdown by category (monthly matrix).</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-background border px-3 py-2 rounded-md shadow-sm">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm font-medium"
                    >
                      {[2023, 2024, 2025, 2026].map((y) => (
                        <option key={y} value={String(y)}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button variant="outline" className="gap-2" onClick={exportToCSV} disabled={!data?.data?.length}>
                    <Download className="h-4 w-4" /> Export CSV
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-800">Total Revenue ({selectedYear})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-900">
                      UGX {totalRevenue.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">Total Expenses ({selectedYear})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">
                      UGX {totalExpense.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-indigo-50 border-indigo-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-indigo-800">Net Comprehensive Income ({selectedYear})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-indigo-900">
                      UGX {netIncome.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Comprehensive Income - {selectedYear}</CardTitle>
                  <CardDescription>Monthly breakdown by category (values in UGX).</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex justify-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="min-w-[200px]">Category</TableHead>
                            {(data?.columns ?? []).map((col: any) => (
                              <TableHead key={col.key} className="text-right min-w-[90px]">
                                {col.label}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(data?.data ?? []).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={(data?.columns?.length ?? 0) + 1} className="text-center py-8 text-muted-foreground">
                                No data for this period.
                              </TableCell>
                            </TableRow>
                          ) : (
                            <>
                              {(data?.data ?? []).map((item: any) => (
                                <TableRow key={item.category}>
                                  <TableCell className={`font-medium ${item.type === "revenue" ? "text-emerald-800" : "text-slate-700"}`}>
                                    {item.category}
                                  </TableCell>
                                  {(data?.columns ?? []).map((col: any) => (
                                    <TableCell key={col.key} className="text-right">
                                      {(item.months?.[`${col.year}-${col.month}`] ?? 0).toLocaleString()}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                              <TableRow className="bg-muted/30 font-bold border-t-2">
                                <TableCell>NET COMPREHENSIVE INCOME</TableCell>
                                {(data?.columns ?? []).map((col: any) => {
                                  let total = 0;
                                  (data?.data ?? []).forEach((item: any) => {
                                    const val = item.months?.[`${col.year}-${col.month}`] ?? 0;
                                    if (item.type === "revenue") total += val;
                                    else total -= val;
                                  });
                                  return (
                                    <TableCell key={col.key} className="text-right text-indigo-800">
                                      {total.toLocaleString()}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            </>
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

export default ComprehensiveIncome;
