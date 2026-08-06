import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Eye,
  Loader2,
  Phone,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { staffTabButtonClass, staffTabRowClass } from "@/lib/staffNavClasses";
import { cn } from "@/lib/utils";

type TabKey = "processed" | "manual_review" | "duplicates";

interface MobileMoneyPayment {
  id: string;
  transaction_id: string;
  received_at: string;
  loan_reference: string | null;
  borrower_full_name: string | null;
  sender_phone: string;
  amount: number;
  previous_balance: number | null;
  outstanding_balance: number | null;
  processing_status: string;
  match_confidence: number | null;
  payment_method: string;
  assigned_officer_name: string;
  assigned_officer_id: string | null;
  matched_loan_application_id: string | null;
  repayment_id: string | null;
  accounting_entry_id: string | null;
  parsing_status: string | null;
  matching_notes: string | null;
  raw_message: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  is_manual_review: boolean;
  is_duplicate: boolean;
  is_posted: boolean;
}

const TAB_LABELS: Record<TabKey, string> = {
  processed: "Processed",
  manual_review: "Manual Review",
  duplicates: "Duplicates",
};

const REFRESH_MS = 30_000;

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatAmount(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return `UGX ${Math.round(value).toLocaleString()}`;
}

function statusBadge(payment: MobileMoneyPayment) {
  const status = payment.processing_status;
  if (payment.is_duplicate) {
    return <Badge variant="secondary">Duplicate</Badge>;
  }
  if (payment.is_manual_review || !payment.is_posted) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        {status.replace(/_/g, " ")}
      </Badge>
    );
  }
  return (
    <Badge variant="default" className="gap-1 bg-emerald-600 hover:bg-emerald-600">
      <CheckCircle2 className="h-3 w-3" />
      Posted
    </Badge>
  );
}

const MobileMoneyPayments = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();

  const initialTab = (searchParams.get("tab") as TabKey) || "processed";
  const [activeTab, setActiveTab] = useState<TabKey>(
    TAB_LABELS[initialTab] ? initialTab : "processed"
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [payments, setPayments] = useState<MobileMoneyPayment[]>([]);
  const [stats, setStats] = useState({ processed: 0, manual_review: 0, duplicates: 0 });
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [officers, setOfficers] = useState<{ id: string; full_name: string }[]>([]);

  const range = defaultDateRange();
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") || range.from);
  const [dateTo, setDateTo] = useState(searchParams.get("to") || range.to);
  const [loanReference, setLoanReference] = useState(searchParams.get("loan_reference") || "");
  const [transactionId, setTransactionId] = useState(searchParams.get("transaction_id") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [officerFilter, setOfficerFilter] = useState(searchParams.get("officer_id") || "all");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<MobileMoneyPayment | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadFilters = useCallback(async () => {
    try {
      const [statuses, staff] = await Promise.all([
        api.airtelPayments.getStatuses(),
        isAdmin ? api.users.getAll() : Promise.resolve([]),
      ]);
      setStatusOptions(statuses);
      if (isAdmin) {
        setOfficers(
          (staff || [])
            .filter((u: { role?: string }) => u.role === "loan_officer" || u.role === "admin")
            .map((u: { id: string; full_name?: string; email?: string }) => ({
              id: u.id,
              full_name: u.full_name || u.email || "Staff",
            }))
        );
      }
    } catch {
      /* optional metadata */
    }
  }, [isAdmin]);

  const buildQuery = useCallback(() => {
    const q: Record<string, string> = { tab: activeTab };
    if (dateFrom) q.date_from = dateFrom;
    if (dateTo) q.date_to = dateTo;
    if (loanReference.trim()) q.loan_reference = loanReference.trim();
    if (transactionId.trim()) q.transaction_id = transactionId.trim();
    if (statusFilter !== "all") q.processing_status = statusFilter;
    if (officerFilter !== "all") q.officer_id = officerFilter;
    return q;
  }, [activeTab, dateFrom, dateTo, loanReference, transactionId, statusFilter, officerFilter]);

  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      try {
        const query = buildQuery();
        const [rows, tabStats] = await Promise.all([
          api.airtelPayments.getAll(query),
          api.airtelPayments.getStats(),
        ]);
        setPayments(rows);
        setStats(tabStats);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load payments";
        toast({ title: "Error", description: message, variant: "destructive" });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [buildQuery, toast]
  );

  useEffect(() => {
    (async () => {
      try {
        await api.auth.getMe();
        await loadFilters();
      } catch {
        navigate("/staff-login");
      }
    })();
  }, [navigate, loadFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    if (loanReference.trim()) params.set("loan_reference", loanReference.trim());
    if (transactionId.trim()) params.set("transaction_id", transactionId.trim());
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (officerFilter !== "all") params.set("officer_id", officerFilter);
    setSearchParams(params, { replace: true });
  }, [activeTab, dateFrom, dateTo, loanReference, transactionId, statusFilter, officerFilter, setSearchParams]);

  useEffect(() => {
    const timer = setInterval(() => loadData(true), REFRESH_MS);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setStatusFilter("all");
  };

  const openDetails = async (payment: MobileMoneyPayment) => {
    setSelectedPayment(payment);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const full = await api.airtelPayments.getById(payment.id);
      setSelectedPayment(full);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load details";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  };

  const copyReference = (ref: string | null) => {
    if (!ref) return;
    navigator.clipboard.writeText(ref);
    toast({ title: "Copied", description: "Loan reference copied to clipboard" });
  };

  const tabCount = useMemo(
    () => ({
      processed: stats.processed,
      manual_review: stats.manual_review,
      duplicates: stats.duplicates,
    }),
    [stats]
  );

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StaffSidebar />
        <div className="flex-1 flex flex-col">
          <StaffHeader />
          <main className="flex-1 p-4 md:p-8 bg-gradient-to-b from-background to-muted/20">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                    <Smartphone className="h-7 w-7 text-primary" />
                    Automated Mobile Money Payments
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Airtel Money SMS payments matched and posted automatically
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadData(true)}
                  disabled={isRefreshing}
                  className="gap-2 self-start"
                >
                  <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                  Refresh
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {(Object.keys(TAB_LABELS) as TabKey[]).map((tab) => (
                  <Card
                    key={tab}
                    className={cn(
                      "cursor-pointer transition-colors",
                      activeTab === tab && "ring-2 ring-primary",
                      tab === "manual_review" && tabCount.manual_review > 0 && "border-amber-500/50"
                    )}
                    onClick={() => handleTabChange(tab)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{TAB_LABELS[tab]}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{tabCount[tab]}</div>
                      {tab === "manual_review" && tabCount.manual_review > 0 && (
                        <p className="text-xs text-amber-600 mt-1">Needs staff attention</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                  <CardDescription>Narrow by date, reference, transaction or officer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <div className="space-y-2">
                      <Label htmlFor="date-from">From</Label>
                      <Input
                        id="date-from"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date-to">To</Label>
                      <Input
                        id="date-to"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loan-ref">Loan reference</Label>
                      <Input
                        id="loan-ref"
                        placeholder="MNT000001"
                        value={loanReference}
                        onChange={(e) => setLoanReference(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="txn-id">Transaction ID</Label>
                      <Input
                        id="txn-id"
                        placeholder="Search ID"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Processing status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          {statusOptions.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {isAdmin && (
                      <div className="space-y-2">
                        <Label>Assigned officer</Label>
                        <Select value={officerFilter} onValueChange={setOfficerFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All officers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All officers</SelectItem>
                            {officers.map((o) => (
                              <SelectItem key={o.id} value={o.id}>
                                {o.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className={staffTabRowClass}>
                {(Object.keys(TAB_LABELS) as TabKey[]).map((tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? "default" : "ghost"}
                    className={staffTabButtonClass}
                    onClick={() => handleTabChange(tab)}
                  >
                    {TAB_LABELS[tab]}
                    {tabCount[tab] > 0 && (
                      <span className="ml-1.5 text-[10px] opacity-80">({tabCount[tab]})</span>
                    )}
                  </Button>
                ))}
              </div>

              {activeTab === "manual_review" && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
                  <strong>Manual review items are not posted payments.</strong> These require staff
                  action — unknown references, inactive or fully paid loans, or overpayments.
                </div>
              )}

              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      No payments found for this tab and filter set.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Received</TableHead>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Loan ref</TableHead>
                            <TableHead>Borrower</TableHead>
                            <TableHead>Sender phone</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Prev. balance</TableHead>
                            <TableHead className="text-right">Outstanding</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Confidence</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Officer</TableHead>
                            <TableHead className="w-[80px]" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.map((payment) => (
                            <TableRow
                              key={payment.id}
                              className={cn(
                                payment.is_manual_review &&
                                  "bg-amber-50/80 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30",
                                payment.is_duplicate && "opacity-75"
                              )}
                            >
                              <TableCell className="whitespace-nowrap text-sm">
                                {formatDateTime(payment.received_at)}
                              </TableCell>
                              <TableCell className="font-mono text-xs max-w-[120px] truncate">
                                {payment.transaction_id}
                              </TableCell>
                              <TableCell>
                                {payment.loan_reference ? (
                                  <button
                                    type="button"
                                    className="font-mono text-sm text-primary hover:underline inline-flex items-center gap-1"
                                    onClick={() => copyReference(payment.loan_reference)}
                                  >
                                    {payment.loan_reference}
                                    <Copy className="h-3 w-3" />
                                  </button>
                                ) : (
                                  "—"
                                )}
                              </TableCell>
                              <TableCell>{payment.borrower_full_name || "—"}</TableCell>
                              <TableCell>
                                <span className="inline-flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  {payment.sender_phone}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatAmount(payment.amount)}
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {formatAmount(payment.previous_balance)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatAmount(payment.outstanding_balance)}
                              </TableCell>
                              <TableCell>{statusBadge(payment)}</TableCell>
                              <TableCell>
                                {payment.match_confidence != null
                                  ? `${Math.round(payment.match_confidence)}%`
                                  : "—"}
                              </TableCell>
                              <TableCell>{payment.payment_method}</TableCell>
                              <TableCell className="text-sm">{payment.assigned_officer_name}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDetails(payment)}
                                  aria-label="View details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <p className="text-xs text-muted-foreground text-center">
                Dashboard refreshes every 30 seconds. New SMS payments appear automatically.
              </p>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment details</DialogTitle>
            <DialogDescription>
              Transaction {selectedPayment?.transaction_id || "—"}
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : selectedPayment ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                {statusBadge(selectedPayment)}
              </div>

              {selectedPayment.is_manual_review && (
                <div className="rounded-md border border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 p-3 text-amber-900 dark:text-amber-100">
                  This payment was <strong>not posted</strong> automatically. Review matching notes
                  below and record manually if appropriate.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Received</p>
                  <p>{formatDateTime(selectedPayment.received_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Processed</p>
                  <p>{formatDateTime(selectedPayment.processed_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatAmount(selectedPayment.amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Loan reference</p>
                  <p className="font-mono">{selectedPayment.loan_reference || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Parsing status</p>
                  <p>{selectedPayment.parsing_status || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Match confidence</p>
                  <p>
                    {selectedPayment.match_confidence != null
                      ? `${Math.round(selectedPayment.match_confidence)}%`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Repayment ID</p>
                  <p className="font-mono text-xs break-all">
                    {selectedPayment.repayment_id || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Accounting entry ID</p>
                  <p className="font-mono text-xs break-all">
                    {selectedPayment.accounting_entry_id || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>{formatDateTime(selectedPayment.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Updated</p>
                  <p>{formatDateTime(selectedPayment.updated_at)}</p>
                </div>
              </div>

              {selectedPayment.matching_notes && (
                <div>
                  <p className="text-muted-foreground mb-1">Matching notes</p>
                  <p className="rounded-md bg-muted p-3 whitespace-pre-wrap">
                    {selectedPayment.matching_notes}
                  </p>
                </div>
              )}

              <div>
                <p className="text-muted-foreground mb-1">Raw SMS</p>
                <pre className="rounded-md bg-muted p-3 text-xs whitespace-pre-wrap break-words font-mono max-h-48 overflow-y-auto">
                  {selectedPayment.raw_message || "No message stored"}
                </pre>
              </div>

              {selectedPayment.matched_loan_application_id && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setDetailOpen(false);
                    navigate(
                      `/staff-dashboard/loans/details/${selectedPayment.matched_loan_application_id}`
                    );
                  }}
                >
                  View matched loan
                </Button>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default MobileMoneyPayments;
