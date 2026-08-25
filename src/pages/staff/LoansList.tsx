import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Download, Printer, Filter, Plus, Banknote } from "lucide-react";
import { RecordPaymentDialog, suggestInstallmentAmount } from "@/components/staff/RecordPaymentDialog";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";

interface Loan {
    id: string;
    released_date: string;
    borrower_name: string;
    loan_number: string;
    loan_product?: string;
    principal: number;
    interest_rate: string;
    total_due: number;
    paid: number;
    balance: number;
    last_payment_date: string;
    status: string;
    loan_duration_months?: number;
    group_id?: string | null;
}

interface LoansListProps {
    title: string;
    description: string;
    filterType: "all" | "due" | "missed" | "arrears" | "no-repayments" | "past-maturity" | "approve";
}

type AdvancedLoanFilters = {
    product: string;
    status: string;
    minPrincipal: string;
    maxPrincipal: string;
    releasedFrom: string;
    releasedTo: string;
};

const emptyLoanFilters: AdvancedLoanFilters = {
    product: "",
    status: "",
    minPrincipal: "",
    maxPrincipal: "",
    releasedFrom: "",
    releasedTo: "",
};

const LoansList = ({ title, description, filterType }: LoansListProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isLoanOfficer, loading: roleLoading } = useUserRole();
    const [isLoading, setIsLoading] = useState(true);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [draftFilters, setDraftFilters] = useState<AdvancedLoanFilters>(emptyLoanFilters);
    const [appliedFilters, setAppliedFilters] = useState<AdvancedLoanFilters>(emptyLoanFilters);
    const [payLoan, setPayLoan] = useState<Loan | null>(null);
    const [productOptions, setProductOptions] = useState<string[]>([]);

    useEffect(() => {
        loadLoans();
    }, [filterType]);

    const loadLoans = async () => {
        setIsLoading(true);
        try {
            const data = await api.applications.getActive();

            const transformed: Loan[] = data.map((l: any) => {
                const principal = parseFloat(l.loan_amount || 0);
                const paid = parseFloat(l.amount_paid || 0);
                const duration = parseInt(l.loan_duration_months || 4, 10) || 4;
                const released = l.disbursed_at || l.approved_at || l.created_at;
                const totalDue = principal * 1.3;
                const balance = Math.max(0, totalDue - paid);
                let status = l.status === "disbursed" || l.status === "approved" ? "Current" : String(l.status || "");
                if (balance <= 0) status = "Fully Paid";
                else if (released) {
                    const maturity = new Date(released);
                    maturity.setMonth(maturity.getMonth() + duration);
                    if (Date.now() > maturity.getTime() && balance > 0) status = "Past Maturity";
                }

                return {
                    id: l.id,
                    released_date: released,
                    borrower_name: l.full_name || "Unknown",
                    loan_number: l.loan_number || `L-${String(l.id).substring(0, 6)}`,
                    loan_product: l.loan_product || "",
                    principal,
                    interest_rate: "30% flat",
                    total_due: totalDue,
                    paid,
                    balance,
                    last_payment_date: l.last_repayment_date || "-",
                    status,
                    loan_duration_months: duration,
                    group_id: l.group_id || null,
                };
            });

            const products = Array.from(
                new Set(transformed.map((l) => l.loan_product).filter(Boolean) as string[])
            ).sort();
            setProductOptions(products);

            let filteredResults = transformed;
            if (filterType === "due") {
                filteredResults = transformed.filter((l) => l.balance > 0 && l.status === "Current");
            } else if (filterType === "missed") {
                filteredResults = transformed.filter((l) => /missed/i.test(l.status));
            } else if (filterType === "arrears") {
                filteredResults = transformed.filter((l) => /arrears/i.test(l.status));
            } else if (filterType === "approve") {
                filteredResults = transformed.filter((l) => /pending|under_review/i.test(l.status));
            } else if (filterType === "past-maturity") {
                filteredResults = transformed.filter((l) => l.status === "Past Maturity");
            } else if (filterType === "no-repayments") {
                filteredResults = transformed.filter((l) => l.balance > 0 && (l.paid || 0) <= 0);
            }

            setLoans(filteredResults);
        } catch (error: any) {
            console.error("Load loans error:", error);
            toast({
                title: "Error",
                description: "Failed to load loans.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const applyAdvancedFilters = () => {
        setAppliedFilters({ ...draftFilters });
    };

    const clearAdvancedFilters = () => {
        setDraftFilters(emptyLoanFilters);
        setAppliedFilters(emptyLoanFilters);
    };

    const filteredLoans = loans.filter((l) => {
        const q = searchTerm.trim().toLowerCase();
        if (
            q &&
            !(l.borrower_name || "").toLowerCase().includes(q) &&
            !(l.loan_number || "").toLowerCase().includes(q) &&
            !(l.loan_product || "").toLowerCase().includes(q)
        ) {
            return false;
        }
        if (appliedFilters.product && (l.loan_product || "") !== appliedFilters.product) return false;
        if (appliedFilters.status && (l.status || "") !== appliedFilters.status) return false;
        if (appliedFilters.minPrincipal && l.principal < Number(appliedFilters.minPrincipal)) return false;
        if (appliedFilters.maxPrincipal && l.principal > Number(appliedFilters.maxPrincipal)) return false;
        if (appliedFilters.releasedFrom) {
            if (!l.released_date) return false;
            if (new Date(l.released_date).getTime() < new Date(`${appliedFilters.releasedFrom}T00:00:00`).getTime()) {
                return false;
            }
        }
        if (appliedFilters.releasedTo) {
            if (!l.released_date) return false;
            if (new Date(l.released_date).getTime() > new Date(`${appliedFilters.releasedTo}T23:59:59`).getTime()) {
                return false;
            }
        }
        return true;
    });

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full min-w-0 overflow-x-hidden">
                <StaffSidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                    <StaffHeader />
                    <main className="min-w-0 flex-1 overflow-x-clip bg-muted/20 p-3 sm:p-4 md:p-8">
                        <div className="mx-auto w-full min-w-0 max-w-7xl space-y-4 sm:space-y-6">
                            <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
                                <div className="min-w-0 max-w-full">
                                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">{title}</h1>
                                    <p className="mt-1 break-words text-sm text-muted-foreground sm:text-base">{description}</p>
                                </div>
                                <div className="flex min-w-0 w-full flex-col gap-2 lg:flex-row lg:flex-wrap lg:justify-end lg:w-auto lg:max-w-none">
                                    {!roleLoading && !isLoanOfficer && (
                                        <>
                                            <Button variant="outline" size="sm" className="h-9 w-full shrink-0 gap-2 touch-manipulation lg:w-auto lg:min-w-0">
                                                <Download className="h-4 w-4 shrink-0" /> Export
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-9 w-full shrink-0 gap-2 touch-manipulation lg:w-auto lg:min-w-0">
                                                <Printer className="h-4 w-4 shrink-0" /> Print
                                            </Button>
                                        </>
                                    )}
                                    <Button onClick={() => navigate("/staff-dashboard/loans/add")} className="h-9 w-full gap-2 shadow-md touch-manipulation lg:w-auto">
                                        <Plus className="h-4 w-4 shrink-0" /> Add Loan
                                    </Button>
                                </div>
                            </div>

                            <Card className="min-w-0 max-w-full border-none shadow-sm">
                                <CardHeader className="min-w-0 space-y-4 pb-3 pt-4 sm:pt-6">
                                    <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
                                        <CardTitle className="text-base font-semibold sm:text-lg">Loans Database</CardTitle>
                                        <div className="flex min-w-0 w-full flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-2 lg:w-auto lg:max-w-xl">
                                            <div className="relative min-w-0 w-full flex-1 lg:max-w-md">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search by name, loan #..."
                                                    className="h-9 w-full min-w-0 pl-9 text-sm"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowAdvanced(!showAdvanced)}
                                                className="h-9 w-full shrink-0 gap-2 touch-manipulation lg:w-auto"
                                            >
                                                <Filter className="h-4 w-4 shrink-0" /> Advanced Filter
                                            </Button>
                                        </div>
                                    </div>
                                    {showAdvanced && (
                                        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Loan Product</label>
                                                    <select
                                                        value={draftFilters.product}
                                                        onChange={(e) => setDraftFilters((f) => ({ ...f, product: e.target.value }))}
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    >
                                                        <option value="">Any Product</option>
                                                        {productOptions.map((p) => (
                                                            <option key={p} value={p}>{p}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                                                    <select
                                                        value={draftFilters.status}
                                                        onChange={(e) => setDraftFilters((f) => ({ ...f, status: e.target.value }))}
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    >
                                                        <option value="">Any Status</option>
                                                        <option value="Current">Current</option>
                                                        <option value="Past Maturity">Past Maturity</option>
                                                        <option value="Fully Paid">Fully Paid</option>
                                                        <option value="Arrears">Arrears</option>
                                                    </select>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground mb-1 block">Min Principal</label>
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={draftFilters.minPrincipal}
                                                            onChange={(e) => setDraftFilters((f) => ({ ...f, minPrincipal: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground mb-1 block">Max Principal</label>
                                                        <Input
                                                            type="number"
                                                            placeholder="Any"
                                                            value={draftFilters.maxPrincipal}
                                                            onChange={(e) => setDraftFilters((f) => ({ ...f, maxPrincipal: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground mb-1 block">Released From</label>
                                                        <Input
                                                            type="date"
                                                            value={draftFilters.releasedFrom}
                                                            onChange={(e) => setDraftFilters((f) => ({ ...f, releasedFrom: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground mb-1 block">Released To</label>
                                                        <Input
                                                            type="date"
                                                            value={draftFilters.releasedTo}
                                                            onChange={(e) => setDraftFilters((f) => ({ ...f, releasedTo: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <p className="text-xs text-muted-foreground">
                                                    Showing {filteredLoans.length} of {loans.length} loans
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button type="button" variant="outline" onClick={clearAdvancedFilters}>
                                                        Clear
                                                    </Button>
                                                    <Button type="button" className="gap-2 px-8" onClick={applyAdvancedFilters}>
                                                        <Search className="h-4 w-4" /> Filter Results
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="min-w-0 px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
                                    {isLoading ? (
                                        <div className="flex h-28 items-center justify-center gap-2 text-sm text-muted-foreground">
                                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
                                            Loading loans...
                                        </div>
                                    ) : filteredLoans.length === 0 ? (
                                        <p className="min-w-0 break-words px-1 py-10 text-center text-sm text-muted-foreground">
                                            No loans found matching your criteria.
                                        </p>
                                    ) : (
                                        <>
                                            <div className="space-y-3 lg:hidden">
                                                {filteredLoans.map((loan) => (
                                                    <Card key={loan.id} className="min-w-0 overflow-hidden shadow-sm">
                                                        <CardContent className="min-w-0 space-y-3 p-4">
                                                            <div className="min-w-0">
                                                                <div className="font-medium leading-snug">{loan.borrower_name}</div>
                                                                <p className="mt-0.5 break-all font-mono text-xs text-muted-foreground">
                                                                    {loan.loan_number}
                                                                </p>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                                                                <div>
                                                                    <span className="block text-xs text-muted-foreground">Released</span>
                                                                    <span className="text-xs">
                                                                        {new Date(loan.released_date).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="block text-xs text-muted-foreground">Interest</span>
                                                                    <span className="text-xs">{loan.interest_rate}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="block text-xs text-muted-foreground">Principal</span>
                                                                    <span>UGX {loan.principal.toLocaleString()}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="block text-xs text-muted-foreground">Total due</span>
                                                                    <span>UGX {loan.total_due.toLocaleString()}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="block text-xs text-muted-foreground">Paid</span>
                                                                    <span className="text-green-700">UGX {loan.paid.toLocaleString()}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="block text-xs text-muted-foreground">Balance</span>
                                                                    <span className="font-semibold text-red-600">
                                                                        UGX {loan.balance.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <span className="block text-xs text-muted-foreground">Last payment</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {loan.last_payment_date}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <Badge
                                                                    variant={loan.status === "Current" ? "secondary" : "outline"}
                                                                    className={
                                                                        loan.status === "Current"
                                                                            ? "border-none bg-green-100 text-green-800"
                                                                            : ""
                                                                    }
                                                                >
                                                                    {loan.status}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 border-t pt-3">
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="min-h-10 touch-manipulation"
                                                                    onClick={() =>
                                                                        navigate(`/staff-dashboard/loans/details/${loan.id}`)
                                                                    }
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="min-h-10 touch-manipulation text-primary"
                                                                    onClick={() => setPayLoan(loan)}
                                                                >
                                                                    <Banknote className="mr-2 h-3.5 w-3.5" />
                                                                    Pay
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                            <div className="hidden min-w-0 lg:block">
                                                <div className="w-full max-w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-md border [-webkit-overflow-scrolling:touch]">
                                                    <Table className="min-w-[52rem] text-xs sm:text-sm">
                                                        <TableHeader className="bg-muted/50">
                                                            <TableRow>
                                                                <TableHead className="w-[128px] whitespace-nowrap sm:w-[140px]">
                                                                    Actions
                                                                </TableHead>
                                                                <TableHead>Released</TableHead>
                                                                <TableHead>Name</TableHead>
                                                                <TableHead>Loan#</TableHead>
                                                                <TableHead className="text-right">Principal</TableHead>
                                                                <TableHead>Interest Rate</TableHead>
                                                                <TableHead className="text-right">Total Due</TableHead>
                                                                <TableHead className="text-right">Paid</TableHead>
                                                                <TableHead className="text-right">Balance</TableHead>
                                                                <TableHead>Last Payment</TableHead>
                                                                <TableHead>Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {filteredLoans.map((loan) => (
                                                                <TableRow
                                                                    key={loan.id}
                                                                    className="transition-colors hover:bg-muted/30"
                                                                >
                                                                    <TableCell>
                                                                        <div className="flex items-center gap-1">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                title="View loan"
                                                                                onClick={() =>
                                                                                    navigate(
                                                                                        `/staff-dashboard/loans/details/${loan.id}`,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Eye className="h-4 w-4 text-primary" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-8 gap-1 text-primary"
                                                                                title="Record payment"
                                                                                onClick={() => setPayLoan(loan)}
                                                                            >
                                                                                <Banknote className="h-3.5 w-3.5" />
                                                                                Pay
                                                                            </Button>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-xs">
                                                                        {new Date(loan.released_date).toLocaleDateString()}
                                                                    </TableCell>
                                                                    <TableCell className="font-medium">
                                                                        {loan.borrower_name}
                                                                    </TableCell>
                                                                    <TableCell className="font-mono text-xs">
                                                                        {loan.loan_number}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        {loan.principal.toLocaleString()}
                                                                    </TableCell>
                                                                    <TableCell className="text-xs">
                                                                        {loan.interest_rate}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        {loan.total_due.toLocaleString()}
                                                                    </TableCell>
                                                                    <TableCell className="text-right text-green-600">
                                                                        {loan.paid.toLocaleString()}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-semibold text-red-600">
                                                                        {loan.balance.toLocaleString()}
                                                                    </TableCell>
                                                                    <TableCell className="text-xs text-muted-foreground">
                                                                        {loan.last_payment_date}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge
                                                                            variant={
                                                                                loan.status === "Current"
                                                                                    ? "secondary"
                                                                                    : "outline"
                                                                            }
                                                                            className={
                                                                                loan.status === "Current"
                                                                                    ? "border-none bg-green-100 text-green-800"
                                                                                    : ""
                                                                            }
                                                                        >
                                                                            {loan.status}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>

            <RecordPaymentDialog
                open={!!payLoan}
                onOpenChange={(open) => !open && setPayLoan(null)}
                loanApplicationId={payLoan?.id ?? null}
                borrowerLabel={payLoan ? `${payLoan.borrower_name} (${payLoan.loan_number})` : ""}
                defaultAmount={
                    payLoan
                        ? (() => {
                              const s = suggestInstallmentAmount({
                                  total_amount: payLoan.total_due,
                                  loan_amount: payLoan.principal,
                                  loan_duration_months: payLoan.loan_duration_months,
                                  group_id: payLoan.group_id,
                              });
                              const rem = payLoan.balance;
                              return rem > 0 ? Math.min(s, rem) : s;
                          })()
                        : undefined
                }
                amountHint={
                    payLoan ? `Remaining balance: UGX ${payLoan.balance.toLocaleString()}` : undefined
                }
                memberBreakdownName={payLoan?.borrower_name}
                onSuccess={loadLoans}
            />
        </SidebarProvider>
    );
};

export default LoansList;

// Simple wrapper components for each route
export const AllLoans = () => <LoansList title="View All Loans" description="Complete list of all loan applications and their status." filterType="all" />;
export const DueLoans = () => <LoansList title="Due Loans" description="Loans that have upcoming or past due repayments." filterType="due" />;
export const MissedRepayments = () => <LoansList title="Missed Repayments" description="Detailed list of missed loan repayments." filterType="missed" />;
export const ArrearsLoans = () => <LoansList title="Loans in Arrears" description="Loans with significantly overdue payments." filterType="arrears" />;
export const NoRepaymentsLoans = () => <LoansList title="No Repayments" description="Loans where no repayments have been made yet." filterType="no-repayments" />;
export const PastMaturityLoans = () => <LoansList title="Past Maturity Date" description="Loans that have exceeded their original repayment period." filterType="past-maturity" />;
export const ApproveLoans = () => <LoansList title="Approve Loans" description="Loan applications awaiting approval." filterType="approve" />;
