import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Landmark, Phone, Search, Filter, Download, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const fmt = (n: number) =>
  n >= 1_000_000 ? `UGX ${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `UGX ${(n / 1_000).toFixed(0)}K`
      : `UGX ${n.toLocaleString()}`;

const CashBooks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState("2025-01-01");
  const [dateTo, setDateTo] = useState("2025-12-31");
  const [activeTab, setActiveTab] = useState<"cash" | "bank" | "mobile_money">("cash");
  const [cashBookData, setCashBookData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const accountMap = {
    cash: "cash",
    bank: "bank_transfer",
    mobile_money: "mobile_money",
  } as const;

  const loadCashBook = useCallback(async () => {
    setLoading(true);
    try {
      const user = await api.auth.getMe();
      if (!user) {
        navigate("/staff-login");
        return;
      }
      const account = accountMap[activeTab];
      const data = await api.accounting.getCashBook({
        from: dateFrom,
        to: dateTo,
        account,
      });
      setCashBookData(data);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed to load cash book", description: error.message, variant: "destructive" });
      setCashBookData(null);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, activeTab, navigate, toast]);

    useEffect(() => {
    loadCashBook();
  }, [loadCashBook]);

  const exportToCSV = () => {
    if (!cashBookData?.transactions?.length) return;
    const rows = cashBookData.transactions.map((t: any) => ({
      Date: t.date,
      Description: t.description,
      Category: t.category,
      Account: (t.payment_method || "").replace("_", " ").toUpperCase(),
      Type: t.entry_type === "revenue" ? "IN" : "OUT",
      Amount: t.amount,
    }));
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
    link.download = `Cash_Book_${dateFrom}_${dateTo}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Cash book exported" });
  };

  const opening = cashBookData?.summaries?.[accountMap[activeTab]]?.opening ?? 0;
  const closing = cashBookData?.summaries?.[accountMap[activeTab]]?.closing ?? 0;
  let transactions = cashBookData?.transactions ?? [];
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    transactions = transactions.filter(
      (t: any) =>
        (t.description || "").toLowerCase().includes(term) ||
        (t.category || "").toLowerCase().includes(term)
    );
  }
  const sorted = [...transactions].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 p-4 md:p-8 bg-muted/20">
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                                <div>
                                    <h1 className="text-3xl font-bold flex items-center gap-2">
                                        <Wallet className="h-8 w-8 text-primary" />
                                        Cash Books
                                    </h1>
                                    <p className="text-muted-foreground">Detailed transaction logs for all payment channels.</p>
                                </div>
                <div className="flex flex-wrap gap-2 items-center">
                                <div className="flex gap-2">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-36"
                    />
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-36"
                    />
                  </div>
                  <Button variant="outline" className="gap-2" onClick={exportToCSV} disabled={!cashBookData?.transactions?.length}>
                    <Download className="h-4 w-4" /> Export CSV
                                    </Button>
                                </div>
                            </div>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 max-w-md h-12 p-1 bg-muted/50">
                                    <TabsTrigger value="cash" className="gap-2 data-[state=active]:bg-background shadow-none border-none">
                                        <Wallet className="h-4 w-4" /> Cash Account
                                    </TabsTrigger>
                                    <TabsTrigger value="bank" className="gap-2 data-[state=active]:bg-background shadow-none border-none">
                                        <Landmark className="h-4 w-4" /> Bank Account
                                    </TabsTrigger>
                                    <TabsTrigger value="mobile_money" className="gap-2 data-[state=active]:bg-background shadow-none border-none">
                                        <Phone className="h-4 w-4" /> Mobile Money
                                    </TabsTrigger>
                                </TabsList>

                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-64">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search transactions..."
                          className="pl-9"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                                            </div>
                      <span className="text-sm text-muted-foreground">
                        {dateFrom} to {dateTo}
                      </span>
                                        </div>
                                    </div>

                                    <TabsContent value="cash" className="mt-0">
                                        <Card className="border-none shadow-sm">
                                            <CardHeader className="bg-muted/10 border-b">
                                                <CardTitle className="text-lg">Petty Cash Register</CardTitle>
                                                <CardDescription>Main branch cash box transactions.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-0">
                        {loading ? (
                          <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : (
                          <div className="rounded-md border bg-background overflow-hidden shadow-sm">
                            <Table>
                              <TableHeader className="bg-muted/50">
                                <TableRow>
                                  <TableHead className="w-[120px]">Date</TableHead>
                                  <TableHead className="min-w-[200px]">Details</TableHead>
                                  <TableHead className="text-right">Debit (+)</TableHead>
                                  <TableHead className="text-right">Credit (-)</TableHead>
                                  <TableHead className="text-right font-bold">Balance</TableHead>
                                  <TableHead>Narration</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow className="bg-muted/30 font-bold">
                                  <TableCell>{new Date(dateFrom).toLocaleDateString("en-GB")}</TableCell>
                                  <TableCell>OPENING BALANCE B/F</TableCell>
                                  <TableCell colSpan={2} className="text-right"></TableCell>
                                  <TableCell className="text-right font-bold">{fmt(opening)}</TableCell>
                                  <TableCell className="text-muted-foreground">Balance brought forward</TableCell>
                                </TableRow>
                                {sorted.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                      No transactions found for this period.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  (() => {
                                    let runningBalance = opening;
                                    return sorted.map((t: any) => {
                                      const isDebit = t.entry_type === "revenue" || t.source === "repayment";
                                      const amount = parseFloat(t.amount);
                                      runningBalance += isDebit ? amount : -amount;
                                      return (
                                        <TableRow key={t.id} className="hover:bg-muted/30">
                                          <TableCell className="text-sm">{new Date(t.date).toLocaleDateString("en-GB")}</TableCell>
                                          <TableCell className="font-medium">{t.description}</TableCell>
                                          <TableCell className="text-right text-green-600">
                                            {isDebit ? amount.toLocaleString() : "-"}
                                          </TableCell>
                                          <TableCell className="text-right text-red-600">
                                            {!isDebit ? amount.toLocaleString() : "-"}
                                          </TableCell>
                                          <TableCell className="text-right font-bold">UGX {runningBalance.toLocaleString()}</TableCell>
                                          <TableCell className="text-xs text-muted-foreground">{t.category}</TableCell>
                                        </TableRow>
                                      );
                                    });
                                  })()
                                )}
                                <TableRow className="bg-muted/20 font-bold border-t-2">
                                  <TableCell colSpan={4} className="text-right py-4">CLOSING BALANCE:</TableCell>
                                  <TableCell className="text-right py-4 text-primary text-lg">{fmt(closing)}</TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="bank" className="mt-0">
                                        <Card className="border-none shadow-sm">
                                            <CardHeader className="bg-muted/10 border-b">
                                                <CardTitle className="text-lg">Bank Statement (Corporate)</CardTitle>
                                                <CardDescription>Company bank account reconciliation.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-0">
                        {loading ? (
                          <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : (
                          <div className="rounded-md border bg-background overflow-hidden shadow-sm">
                            <Table>
                              <TableHeader className="bg-muted/50">
                                <TableRow>
                                  <TableHead className="w-[120px]">Date</TableHead>
                                  <TableHead className="min-w-[200px]">Details</TableHead>
                                  <TableHead className="text-right">Debit (+)</TableHead>
                                  <TableHead className="text-right">Credit (-)</TableHead>
                                  <TableHead className="text-right font-bold">Balance</TableHead>
                                  <TableHead>Narration</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow className="bg-muted/30 font-bold">
                                  <TableCell>{new Date(dateFrom).toLocaleDateString("en-GB")}</TableCell>
                                  <TableCell>OPENING BALANCE B/F</TableCell>
                                  <TableCell colSpan={2} className="text-right"></TableCell>
                                  <TableCell className="text-right font-bold">{fmt(opening)}</TableCell>
                                  <TableCell className="text-muted-foreground">Balance brought forward</TableCell>
                                </TableRow>
                                {sorted.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                      No transactions found for this period.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  (() => {
                                    let runningBalance = opening;
                                    return sorted.map((t: any) => {
                                      const isDebit = t.entry_type === "revenue" || t.source === "repayment";
                                      const amount = parseFloat(t.amount);
                                      runningBalance += isDebit ? amount : -amount;
                                      return (
                                        <TableRow key={t.id} className="hover:bg-muted/30">
                                          <TableCell className="text-sm">{new Date(t.date).toLocaleDateString("en-GB")}</TableCell>
                                          <TableCell className="font-medium">{t.description}</TableCell>
                                          <TableCell className="text-right text-green-600">
                                            {isDebit ? amount.toLocaleString() : "-"}
                                          </TableCell>
                                          <TableCell className="text-right text-red-600">
                                            {!isDebit ? amount.toLocaleString() : "-"}
                                          </TableCell>
                                          <TableCell className="text-right font-bold">UGX {runningBalance.toLocaleString()}</TableCell>
                                          <TableCell className="text-xs text-muted-foreground">{t.category}</TableCell>
                                        </TableRow>
                                      );
                                    });
                                  })()
                                )}
                                <TableRow className="bg-muted/20 font-bold border-t-2">
                                  <TableCell colSpan={4} className="text-right py-4">CLOSING BALANCE:</TableCell>
                                  <TableCell className="text-right py-4 text-primary text-lg">{fmt(closing)}</TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="mobile_money" className="mt-0">
                                        <Card className="border-none shadow-sm">
                                            <CardHeader className="bg-muted/10 border-b">
                                                <CardTitle className="text-lg">Mobile Money (Collections)</CardTitle>
                                                <CardDescription>MTN/Airtel collection wallet logs.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-0">
                        {loading ? (
                          <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : (
                          <div className="rounded-md border bg-background overflow-hidden shadow-sm">
                            <Table>
                              <TableHeader className="bg-muted/50">
                                <TableRow>
                                  <TableHead className="w-[120px]">Date</TableHead>
                                  <TableHead className="min-w-[200px]">Details</TableHead>
                                  <TableHead className="text-right">Debit (+)</TableHead>
                                  <TableHead className="text-right">Credit (-)</TableHead>
                                  <TableHead className="text-right font-bold">Balance</TableHead>
                                  <TableHead>Narration</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow className="bg-muted/30 font-bold">
                                  <TableCell>{new Date(dateFrom).toLocaleDateString("en-GB")}</TableCell>
                                  <TableCell>OPENING BALANCE B/F</TableCell>
                                  <TableCell colSpan={2} className="text-right"></TableCell>
                                  <TableCell className="text-right font-bold">{fmt(opening)}</TableCell>
                                  <TableCell className="text-muted-foreground">Balance brought forward</TableCell>
                                </TableRow>
                                {sorted.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                      No transactions found for this period.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  (() => {
                                    let runningBalance = opening;
                                    return sorted.map((t: any) => {
                                      const isDebit = t.entry_type === "revenue" || t.source === "repayment";
                                      const amount = parseFloat(t.amount);
                                      runningBalance += isDebit ? amount : -amount;
                                      return (
                                        <TableRow key={t.id} className="hover:bg-muted/30">
                                          <TableCell className="text-sm">{new Date(t.date).toLocaleDateString("en-GB")}</TableCell>
                                          <TableCell className="font-medium">{t.description}</TableCell>
                                          <TableCell className="text-right text-green-600">
                                            {isDebit ? amount.toLocaleString() : "-"}
                                          </TableCell>
                                          <TableCell className="text-right text-red-600">
                                            {!isDebit ? amount.toLocaleString() : "-"}
                                          </TableCell>
                                          <TableCell className="text-right font-bold">UGX {runningBalance.toLocaleString()}</TableCell>
                                          <TableCell className="text-xs text-muted-foreground">{t.category}</TableCell>
                                        </TableRow>
                                      );
                                    });
                                  })()
                                )}
                                <TableRow className="bg-muted/20 font-bold border-t-2">
                                  <TableCell colSpan={4} className="text-right py-4">CLOSING BALANCE:</TableCell>
                                  <TableCell className="text-right py-4 text-primary text-lg">{fmt(closing)}</TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default CashBooks;
