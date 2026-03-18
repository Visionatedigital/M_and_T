import React, { useState } from "react";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, RefreshCw, Download, FileText, Info, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ScheduleRow {
    period: number;
    principal: number;
    interest: number;
    total: number;
    balance: number;
}

interface Results {
    periodicRepayment: number;
    totalInterest: number;
    totalRepayment: number;
    effectiveAnnualRate: number;
    schedule: ScheduleRow[];
}

const LoanCalculator = () => {
    const [principal, setPrincipal] = useState<string>("");
    const [interestRate, setInterestRate] = useState<string>("");
    const [duration, setDuration] = useState<string>("");
    const [period, setPeriod] = useState<string>("Months");
    const [method, setMethod] = useState<string>("Flat Rate");
    const [results, setResults] = useState<Results | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Convert duration to months for EAR calculation
    const toMonths = (d: number, p: string) => {
        if (p === "Years") return d * 12;
        if (p === "Weeks") return d / 4.33;
        if (p === "Days") return d / 30.44;
        return d; // Months
    };

    const periodLabel = (p: string) => {
        if (p === "Months") return "Month";
        if (p === "Years") return "Year";
        if (p === "Weeks") return "Week";
        return "Day";
    };

    const calculateLoan = () => {
        setError(null);

        const P = parseFloat(principal);
        const r = parseFloat(interestRate);
        const D = parseInt(duration);

        if (!P || P <= 0) return setError("Please enter a valid principal amount.");
        if (!r || r <= 0) return setError("Please enter a valid interest rate.");
        if (!D || D <= 0) return setError("Please enter a valid duration.");

        const ratePerPeriod = r / 100; // e.g. 15% → 0.15 per period
        let periodicRepayment = 0;
        let totalInterest = 0;
        let totalRepayment = 0;
        const schedule: ScheduleRow[] = [];

        if (method === "Flat Rate") {
            // Flat rate: interest calculated on original principal for every period
            const interestPerPeriod = P * ratePerPeriod;
            const principalPerPeriod = P / D;
            periodicRepayment = principalPerPeriod + interestPerPeriod;
            totalInterest = interestPerPeriod * D;
            totalRepayment = P + totalInterest;

            let balance = P;
            for (let i = 1; i <= D; i++) {
                balance -= principalPerPeriod;
                schedule.push({
                    period: i,
                    principal: principalPerPeriod,
                    interest: interestPerPeriod,
                    total: periodicRepayment,
                    balance: Math.max(0, balance)
                });
            }
        } else if (method === "Reducing Balance") {
            // Reducing balance (amortizing): fixed payment, interest on remaining balance
            if (ratePerPeriod === 0) {
                periodicRepayment = P / D;
                totalRepayment = P;
                totalInterest = 0;
                let balance = P;
                for (let i = 1; i <= D; i++) {
                    balance -= periodicRepayment;
                    schedule.push({ period: i, principal: periodicRepayment, interest: 0, total: periodicRepayment, balance: Math.max(0, balance) });
                }
            } else {
                // Standard amortization formula: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
                periodicRepayment = (P * ratePerPeriod * Math.pow(1 + ratePerPeriod, D)) / (Math.pow(1 + ratePerPeriod, D) - 1);
                let balance = P;
                for (let i = 1; i <= D; i++) {
                    const interestAmt = balance * ratePerPeriod;
                    const principalAmt = periodicRepayment - interestAmt;
                    balance -= principalAmt;
                    totalInterest += interestAmt;
                    schedule.push({
                        period: i,
                        principal: principalAmt,
                        interest: interestAmt,
                        total: periodicRepayment,
                        balance: Math.max(0, balance)
                    });
                }
                totalRepayment = periodicRepayment * D;
            }
        } else if (method === "Interest Only") {
            // Interest-only: pay only interest each period, full principal at end
            const interestPerPeriod = P * ratePerPeriod;
            periodicRepayment = interestPerPeriod;
            totalInterest = interestPerPeriod * D;
            totalRepayment = P + totalInterest;

            for (let i = 1; i <= D; i++) {
                const isLast = i === D;
                schedule.push({
                    period: i,
                    principal: isLast ? P : 0,
                    interest: interestPerPeriod,
                    total: isLast ? P + interestPerPeriod : interestPerPeriod,
                    balance: isLast ? 0 : P
                });
            }
        }

        // Effective Annual Rate for reference
        const monthlyEquiv = ratePerPeriod / (period === "Years" ? 12 : period === "Weeks" ? 0.25 : period === "Days" ? (1 / 30.44) : 1);
        const ear = (Math.pow(1 + monthlyEquiv, 12) - 1) * 100;

        setResults({ periodicRepayment, totalInterest, totalRepayment, effectiveAnnualRate: ear, schedule });
    };

    const exportCSV = () => {
        if (!results) return;
        const header = `Period,Principal (UGX),Interest (UGX),Total Payment (UGX),Remaining Balance (UGX)`;
        const rows = results.schedule.map(r =>
            `${r.period},${Math.round(r.principal)},${Math.round(r.interest)},${Math.round(r.total)},${Math.round(r.balance)}`
        ).join("\n");
        const summary = `\n\nSummary\nPrincipal,${principal}\nMethod,${method}\nRate per ${periodLabel(period)},${interestRate}%\nDuration,${duration} ${period}\nTotal Interest,${Math.round(results.totalInterest)}\nTotal Repayment,${Math.round(results.totalRepayment)}\nRepayment per ${periodLabel(period)},${Math.round(results.periodicRepayment)}`;
        const csv = `${header}\n${rows}${summary}`;
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `loan_schedule_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const fmt = (num: number) => `UGX ${Math.round(num).toLocaleString()}`;

    const hasResults = results && results.schedule.length > 0;

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-slate-50/50">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 p-4 md:p-8">
                        <div className="max-w-6xl mx-auto space-y-6">

                            {/* Header */}
                            <div className="flex justify-between items-end">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">Loan Calculator</h1>
                                    <p className="text-muted-foreground mt-1">Estimate repayments and interest for different loan scenarios.</p>
                                </div>
                                {hasResults && (
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={exportCSV} className="gap-2">
                                            <Download className="h-4 w-4" /> Export CSV
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* Inputs Panel */}
                                <Card className="lg:col-span-1 border-none shadow-xl rounded-2xl overflow-hidden">
                                    <CardHeader className="bg-slate-900 text-white pb-4">
                                        <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Calculator className="h-4 w-4" /> Calculation Inputs
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-5 pt-6 bg-white">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Principal Amount (UGX)</Label>
                                            <Input
                                                type="number"
                                                value={principal}
                                                onChange={(e) => setPrincipal(e.target.value)}
                                                placeholder="e.g. 5,000,000"
                                                className="text-lg font-bold border-slate-200 focus:border-indigo-400"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Interest Method</Label>
                                            <Select value={method} onValueChange={setMethod}>
                                                <SelectTrigger className="border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Flat Rate">Flat Rate</SelectItem>
                                                    <SelectItem value="Reducing Balance">Reducing Balance</SelectItem>
                                                    <SelectItem value="Interest Only">Interest Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-slate-400 leading-tight">
                                                {method === "Flat Rate" && "Interest charged on original principal every period."}
                                                {method === "Reducing Balance" && "Interest charged on outstanding balance; fixed repayment."}
                                                {method === "Interest Only" && "Pay interest each period; full principal due at end."}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Interest Rate (% per {periodLabel(period)})</Label>
                                            <Input
                                                type="number"
                                                value={interestRate}
                                                onChange={(e) => setInterestRate(e.target.value)}
                                                placeholder="e.g. 15"
                                                className="border-slate-200"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Duration</Label>
                                                <Input
                                                    type="number"
                                                    value={duration}
                                                    onChange={(e) => setDuration(e.target.value)}
                                                    placeholder="e.g. 12"
                                                    className="border-slate-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Period</Label>
                                                <Select value={period} onValueChange={setPeriod}>
                                                    <SelectTrigger className="border-slate-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Days">Days</SelectItem>
                                                        <SelectItem value="Weeks">Weeks</SelectItem>
                                                        <SelectItem value="Months">Months</SelectItem>
                                                        <SelectItem value="Years">Years</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                                <AlertCircle className="h-4 w-4 shrink-0" />
                                                {error}
                                            </div>
                                        )}

                                        <Button onClick={calculateLoan} className="w-full gap-2 bg-slate-900 hover:bg-slate-800 font-bold text-white shadow-md">
                                            <RefreshCw className="h-4 w-4" /> Calculate Now
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Results Panel */}
                                <div className="lg:col-span-2 space-y-6">
                                    {!hasResults ? (
                                        <Card className="border-none shadow-xl rounded-2xl h-full min-h-[220px] flex items-center justify-center bg-white">
                                            <div className="text-center space-y-3 p-12">
                                                <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                                                    <Calculator className="h-8 w-8 text-slate-400" />
                                                </div>
                                                <p className="text-slate-500 font-bold">Enter your loan details and click <span className="text-slate-800">Calculate Now</span> to see the repayment schedule.</p>
                                            </div>
                                        </Card>
                                    ) : (
                                        <>
                                            {/* Summary Cards */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <Card className="border-none shadow-lg rounded-2xl bg-white overflow-hidden col-span-2">
                                                    <CardContent className="p-5">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Repayment Per {periodLabel(period)}</p>
                                                        <p className="text-3xl font-black text-slate-900 tabular-nums">{fmt(results!.periodicRepayment)}</p>
                                                    </CardContent>
                                                </Card>
                                                <Card className="border-none shadow-lg rounded-2xl bg-amber-50 overflow-hidden">
                                                    <CardContent className="p-5">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/70 mb-1">Total Interest</p>
                                                        <p className="text-xl font-black text-amber-700 tabular-nums">{fmt(results!.totalInterest)}</p>
                                                    </CardContent>
                                                </Card>
                                                <Card className="border-none shadow-lg rounded-2xl bg-slate-900 text-white overflow-hidden">
                                                    <CardContent className="p-5">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Total Repayment</p>
                                                        <p className="text-xl font-black tabular-nums">{fmt(results!.totalRepayment)}</p>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            {/* EAR badge */}
                                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white rounded-xl px-4 py-2 shadow-sm border border-slate-100 w-fit">
                                                <Info className="h-3 w-3" />
                                                Effective Annual Rate (EAR): <span className="font-black text-indigo-600">{results!.effectiveAnnualRate.toFixed(2)}%</span>
                                                <Badge variant="outline" className="ml-2">{method}</Badge>
                                            </div>

                                            {/* Amortization Schedule */}
                                            <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                                                <CardHeader className="bg-white border-b py-4">
                                                    <CardTitle className="text-base flex items-center justify-between">
                                                        <span>Repayment Schedule</span>
                                                        <span className="text-xs font-normal text-slate-400">{results!.schedule.length} {period}</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-0">
                                                    <div className="max-h-[420px] overflow-auto">
                                                        <Table>
                                                            <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                                                <TableRow>
                                                                    <TableHead className="w-14 text-center font-bold">{periodLabel(period)}</TableHead>
                                                                    <TableHead className="text-right font-bold">Principal</TableHead>
                                                                    <TableHead className="text-right font-bold">Interest</TableHead>
                                                                    <TableHead className="text-right font-bold text-indigo-700">Total Payment</TableHead>
                                                                    <TableHead className="text-right font-bold">Balance</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {results!.schedule.map((row) => (
                                                                    <TableRow key={row.period} className="hover:bg-indigo-50/30 transition-colors">
                                                                        <TableCell className="text-center text-slate-500 font-bold">{row.period}</TableCell>
                                                                        <TableCell className="text-right font-mono text-sm tabular-nums">{Math.round(row.principal).toLocaleString()}</TableCell>
                                                                        <TableCell className="text-right font-mono text-sm tabular-nums text-amber-600">{Math.round(row.interest).toLocaleString()}</TableCell>
                                                                        <TableCell className="text-right font-black text-indigo-700 tabular-nums">{Math.round(row.total).toLocaleString()}</TableCell>
                                                                        <TableCell className="text-right font-mono text-xs text-slate-500 tabular-nums">{Math.round(row.balance).toLocaleString()}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default LoanCalculator;
