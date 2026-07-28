import { useEffect, useMemo, useState } from "react";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/services/api";
import { Loader2, Search, Users, Wallet, TrendingUp } from "lucide-react";

type OfficerPortfolio = {
    id: string;
    full_name: string;
    email: string;
    phone_number?: string | null;
    borrower_count: number;
    active_loan_count: number;
    total_principal: number | string;
    total_paid: number | string;
    total_remaining: number | string;
    created_at: string;
};

type OfficerPortfolioDetails = {
    officer: {
        id: string;
        full_name: string;
        email: string;
        phone_number?: string | null;
        created_at: string;
    };
    borrowers: {
        id: string;
        full_name: string;
        phone_number?: string | null;
        email?: string | null;
        active_loan_count: number | string;
        total_principal: number | string;
        total_remaining: number | string;
    }[];
    active_loans: {
        id: string;
        borrower_name: string;
        loan_product: string;
        status: string;
        principal: number | string;
        amount_paid: number | string;
        remaining_balance: number | string;
        created_at: string;
        approved_at?: string | null;
    }[];
};

const toNumber = (value: number | string | null | undefined) => Number(value || 0);
const isPlaceholderOfficer = (row: OfficerPortfolio) =>
    String(row.email || "").toLowerCase().includes("@mandt.placeholder");

export default function LoanOfficerPortfolios() {
    const [rows, setRows] = useState<OfficerPortfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [selectedOfficer, setSelectedOfficer] = useState<OfficerPortfolio | null>(null);
    const [details, setDetails] = useState<OfficerPortfolioDetails | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await api.users.getLoanOfficerPortfolios();
                setRows(data);
            } catch (err: any) {
                setError(err.message || "Failed to load loan officer portfolios");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const visibleRows = useMemo(
        () => rows.filter((row) => !isPlaceholderOfficer(row)),
        [rows]
    );

    const filteredRows = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return visibleRows;
        return visibleRows.filter((row) =>
            [row.full_name, row.email, row.phone_number || ""].some((v) =>
                String(v).toLowerCase().includes(q)
            )
        );
    }, [visibleRows, search]);

    const totals = useMemo(() => ({
        officers: filteredRows.length,
        borrowers: filteredRows.reduce((sum, row) => sum + toNumber(row.borrower_count), 0),
        loans: filteredRows.reduce((sum, row) => sum + toNumber(row.active_loan_count), 0),
        principal: filteredRows.reduce((sum, row) => sum + toNumber(row.total_principal), 0),
        paid: filteredRows.reduce((sum, row) => sum + toNumber(row.total_paid), 0),
        remaining: filteredRows.reduce((sum, row) => sum + toNumber(row.total_remaining), 0),
    }), [filteredRows]);

    const openOfficerDetails = async (row: OfficerPortfolio) => {
        setSelectedOfficer(row);
        setDetails(null);
        setDetailsLoading(true);
        try {
            const data = await api.users.getLoanOfficerPortfolioDetails(row.id);
            setDetails(data);
        } catch {
            setDetails(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 p-4 md:p-8 bg-muted/30">
                        <div className="space-y-6 max-w-7xl mx-auto">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">Loan Officer Portfolios</h2>
                                <p className="text-muted-foreground">
                                    Admin view of each loan officer's assigned borrowers and active loan book.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Loan Officers</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{totals.officers}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Assigned Borrowers</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{totals.borrowers}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                                        <Wallet className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{totals.loans}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Principal</CardTitle>
                                        <Wallet className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">UGX {totals.principal.toLocaleString()}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Collected</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">UGX {totals.paid.toLocaleString()}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Outstanding Portfolio</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">UGX {totals.remaining.toLocaleString()}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <CardTitle>Portfolio by Officer</CardTitle>
                                        <CardDescription>
                                            Compare each officer's borrower count, active loans, collections, and remaining book.
                                        </CardDescription>
                                    </div>
                                    <div className="relative w-full sm:w-80">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search officer name, email, phone..."
                                            className="pl-9"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="flex justify-center p-8">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        </div>
                                    ) : error ? (
                                        <div className="rounded-md bg-red-50 p-4 text-red-600">{error}</div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Officer</TableHead>
                                                    <TableHead>Borrowers</TableHead>
                                                    <TableHead>Active Loans</TableHead>
                                                    <TableHead>Total Principal</TableHead>
                                                    <TableHead>Collected</TableHead>
                                                    <TableHead>Remaining</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredRows.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                                                            No loan officer portfolios found.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredRows.map((row) => (
                                                        <TableRow
                                                            key={row.id}
                                                            className="cursor-pointer hover:bg-muted/40"
                                                            onClick={() => openOfficerDetails(row)}
                                                        >
                                                            <TableCell>
                                                                <div className="font-medium">{row.full_name}</div>
                                                                <div className="text-xs text-muted-foreground">{row.email}</div>
                                                            </TableCell>
                                                            <TableCell>{toNumber(row.borrower_count).toLocaleString()}</TableCell>
                                                            <TableCell>{toNumber(row.active_loan_count).toLocaleString()}</TableCell>
                                                            <TableCell>UGX {toNumber(row.total_principal).toLocaleString()}</TableCell>
                                                            <TableCell className="text-green-600 font-medium">
                                                                UGX {toNumber(row.total_paid).toLocaleString()}
                                                            </TableCell>
                                                            <TableCell>UGX {toNumber(row.total_remaining).toLocaleString()}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={toNumber(row.active_loan_count) > 0 ? "default" : "secondary"}>
                                                                    {toNumber(row.active_loan_count) > 0 ? "Has Portfolio" : "No Active Loans"}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>

            <Dialog open={!!selectedOfficer} onOpenChange={(open) => !open && setSelectedOfficer(null)}>
                <DialogContent className="flex max-h-[90vh] max-w-6xl flex-col overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>{selectedOfficer?.full_name || "Officer Portfolio"}</DialogTitle>
                        <DialogDescription>
                            Admin breakdown of assigned borrowers, active loans, collections, and remaining balances.
                        </DialogDescription>
                    </DialogHeader>

                    {detailsLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : !details ? (
                        <div className="rounded-md bg-red-50 p-4 text-red-600">
                            Failed to load officer details.
                        </div>
                    ) : (
                        <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
                            <div className="grid gap-4 md:grid-cols-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Assigned Borrowers</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-2xl font-bold">
                                        {details.borrowers.length}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-2xl font-bold">
                                        {details.active_loans.length}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Collected</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-2xl font-bold text-green-600">
                                        UGX {details.active_loans.reduce((sum, loan) => sum + toNumber(loan.amount_paid), 0).toLocaleString()}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-2xl font-bold">
                                        UGX {details.active_loans.reduce((sum, loan) => sum + toNumber(loan.remaining_balance), 0).toLocaleString()}
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Assigned Borrowers</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Borrower</TableHead>
                                                <TableHead>Phone</TableHead>
                                                <TableHead>Active Loans</TableHead>
                                                <TableHead>Total Principal</TableHead>
                                                <TableHead>Remaining</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {details.borrowers.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                                        No assigned borrowers.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                details.borrowers.map((borrower) => (
                                                    <TableRow key={borrower.id}>
                                                        <TableCell>
                                                            <div className="font-medium">{borrower.full_name}</div>
                                                            <div className="text-xs text-muted-foreground">{borrower.email || "—"}</div>
                                                        </TableCell>
                                                        <TableCell>{borrower.phone_number || "—"}</TableCell>
                                                        <TableCell>{toNumber(borrower.active_loan_count).toLocaleString()}</TableCell>
                                                        <TableCell>UGX {toNumber(borrower.total_principal).toLocaleString()}</TableCell>
                                                        <TableCell>UGX {toNumber(borrower.total_remaining).toLocaleString()}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Active Loans</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Borrower</TableHead>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Principal</TableHead>
                                                <TableHead>Collected</TableHead>
                                                <TableHead>Remaining</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {details.active_loans.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                                        No active loans for this officer.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                details.active_loans.map((loan) => (
                                                    <TableRow key={loan.id}>
                                                        <TableCell className="font-medium">{loan.borrower_name}</TableCell>
                                                        <TableCell>{loan.loan_product}</TableCell>
                                                        <TableCell>UGX {toNumber(loan.principal).toLocaleString()}</TableCell>
                                                        <TableCell className="text-green-600">UGX {toNumber(loan.amount_paid).toLocaleString()}</TableCell>
                                                        <TableCell>UGX {toNumber(loan.remaining_balance).toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{loan.status}</Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}
