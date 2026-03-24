import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Download, Printer, Filter, Plus, Banknote } from "lucide-react";
import { RecordPaymentDialog, suggestInstallmentAmount } from "@/components/staff/RecordPaymentDialog";
import { useToast } from "@/hooks/use-toast";

interface Loan {
    id: string;
    released_date: string;
    borrower_name: string;
    loan_number: string;
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

const LoansList = ({ title, description, filterType }: LoansListProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [payLoan, setPayLoan] = useState<Loan | null>(null);

    useEffect(() => {
        loadLoans();
    }, [filterType]);

    const loadLoans = async () => {
        setIsLoading(true);
        try {
            // In a real app, the API would take the filterType
            // For now, we'll fetch all and filter client-side if needed, 
            // or assume a placeholder for the specialized routes
            const data = await api.applications.getActive();

            // Transform data to match requested table structure
            const transformed: Loan[] = data.map((l: any) => ({
                id: l.id,
                released_date: l.disbursed_at || l.approved_at || l.created_at,
                borrower_name: l.full_name || "Unknown",
                loan_number: l.loan_number || `L-${l.id.substring(0, 6)}`,
                principal: parseFloat(l.loan_amount || 0),
                interest_rate: "15%/Month", // Placeholder until product logic is refined
                total_due: parseFloat(l.loan_amount || 0) * 1.3, // 30% interest as per policy
                paid: parseFloat(l.amount_paid || 0),
                balance: (parseFloat(l.loan_amount || 0) * 1.3) - parseFloat(l.amount_paid || 0),
                last_payment_date: l.last_repayment_date || "-",
                status: l.status === 'disbursed' ? 'Current' : l.status,
            }));

            // Apply specialized filtering based on filterType
            let filteredResults = transformed;
            if (filterType === 'due') {
                // Mock: assume loans with balance > 0 are "due" for this view
                filteredResults = transformed.filter(l => l.balance > 0);
            } else if (filterType === 'missed') {
                filteredResults = transformed.filter(l => l.status === 'Missed');
            } else if (filterType === 'arrears') {
                filteredResults = transformed.filter(l => l.status === 'Arrears');
            } else if (filterType === 'approve') {
                filteredResults = transformed.filter(l => l.status === 'pending');
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

    const filteredLoans = loans.filter(l =>
        l.borrower_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.loan_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                    <h1 className="text-3xl font-bold">{title}</h1>
                                    <p className="text-muted-foreground">{description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Download className="h-4 w-4" /> Export
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Printer className="h-4 w-4" /> Print
                                    </Button>
                                    <Button onClick={() => navigate("/staff-dashboard/loans/add")} className="gap-2 shadow-md">
                                        <Plus className="h-4 w-4" /> Add Loan
                                    </Button>
                                </div>
                            </div>

                            <Card className="border-none shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                            Loans Database
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-full md:w-96">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search by name, loan #..."
                                                    className="pl-9 h-10 w-full"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className="gap-2 h-10">
                                                <Filter className="h-4 w-4" /> Advanced Filter
                                            </Button>
                                        </div>
                                    </div>
                                    {showAdvanced && (
                                        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Loan Product</label>
                                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                                        <option value="">Any Product</option>
                                                        <option value="business">Business Loan</option>
                                                        <option value="personal">Personal Loan</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                                        <option value="">Any Status</option>
                                                        <option value="Current">Current</option>
                                                        <option value="Past Maturity">Past Maturity</option>
                                                        <option value="Arrears">Arrears</option>
                                                    </select>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground mb-1 block">Min Principal</label>
                                                        <Input type="number" placeholder="0" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground mb-1 block">Max Principal</label>
                                                        <Input type="number" placeholder="Any" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground mb-1 block">Released From</label>
                                                        <Input type="date" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground mb-1 block">Released To</label>
                                                        <Input type="date" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <Button className="gap-2 px-8">
                                                    <Search className="h-4 w-4" /> Filter Loans
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader className="bg-muted/50">
                                                <TableRow>
                                                    <TableHead className="w-[140px]">Actions</TableHead>
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
                                                {isLoading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={11} className="h-24 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                                                Loading loans...
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : filteredLoans.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                                                            No loans found matching your criteria.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredLoans.map((loan) => (
                                                        <TableRow key={loan.id} className="hover:bg-muted/30 transition-colors">
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        title="View loan"
                                                                        onClick={() => navigate(`/staff-dashboard/loans/details/${loan.id}`)}
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
                                                            <TableCell className="font-medium">{loan.borrower_name}</TableCell>
                                                            <TableCell className="text-xs font-mono">{loan.loan_number}</TableCell>
                                                            <TableCell className="text-right">{loan.principal.toLocaleString()}</TableCell>
                                                            <TableCell className="text-xs">{loan.interest_rate}</TableCell>
                                                            <TableCell className="text-right">{loan.total_due.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right text-green-600">{loan.paid.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right font-semibold text-red-600">
                                                                {loan.balance.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell className="text-xs text-muted-foreground">
                                                                {loan.last_payment_date}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant={loan.status === 'Current' ? 'secondary' : 'outline'}
                                                                    className={loan.status === 'Current' ? 'bg-green-100 text-green-800 border-none' : ''}
                                                                >
                                                                    {loan.status}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
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
