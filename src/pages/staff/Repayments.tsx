import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Search, Plus, DollarSign, Calendar, FileSpreadsheet, History, Pencil, Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";

const Repayments = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [loans, setLoans] = useState<any[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [memberBreakdown, setMemberBreakdown] = useState<any[]>([]);
  const [selectedMemberName, setSelectedMemberName] = useState<string>("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [recordTypeFilter, setRecordTypeFilter] = useState<string>("all");

  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isReallocateDialogOpen, setIsReallocateDialogOpen] = useState(false);
  const [reallocateAmount, setReallocateAmount] = useState("");
  const [reallocateTarget, setReallocateTarget] = useState<{ loanId: string; memberName: string } | null>(null);
  const [selectedMemberOutstanding, setSelectedMemberOutstanding] = useState<number | null>(null);

  const [bulkRepaymentRows, setBulkRepaymentRows] = useState<{ loanId: string; name: string; amount: string }[]>([]);
  const [bulkRepaymentDate, setBulkRepaymentDate] = useState("");
  const [bulkRepaymentMethod, setBulkRepaymentMethod] = useState("cash");
  const [bulkSaving, setBulkSaving] = useState(false);

  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<{
    name: string;
    isGroup: boolean;
    groupId?: string;
    loanApplicationId?: string;
  } | null>(null);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editMethod, setEditMethod] = useState("cash");
  const [editNotes, setEditNotes] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editMemberBreakdown, setEditMemberBreakdown] = useState<{ name: string; amount: string }[]>([]);

  const [collectorSummary, setCollectorSummary] = useState<{
    date_from: string;
    date_to: string;
    rows: { officer_label: string; repayment_count: number; total_amount_ugx: number | string }[];
  } | null>(null);
  const [collectorSummaryLoading, setCollectorSummaryLoading] = useState(false);
  const defaultSummaryRange = () => {
    const d = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 90);
    return {
      from: from.toISOString().slice(0, 10),
      to: d.toISOString().slice(0, 10),
    };
  };
  const [summaryDateFrom, setSummaryDateFrom] = useState(() => defaultSummaryRange().from);
  const [summaryDateTo, setSummaryDateTo] = useState(() => defaultSummaryRange().to);
  const [collectorSummaryDialogOpen, setCollectorSummaryDialogOpen] = useState(false);

  useEffect(() => {
    if (selectedMemberName) return;

    if (selectedLoanId) {
      const loan = loans.find(l => l.id === selectedLoanId);
      if (loan) {
        if (loan.member_schedules && loan.member_schedules.length > 0) {
          setMemberBreakdown(loan.member_schedules.map((m: any) => ({
            id: m.name,
            name: m.name,
            amount: Math.round(m.weekly || 0).toString()
          })));
        } else {
          const numInst = loan.group_id ? Math.ceil((loan.loan_duration_months || 4) * 4.33) : (loan.loan_duration_months || 4);
          const instAmt = (loan.loan_amount * 1.30) / numInst;
          setMemberBreakdown([{
            id: loan.id,
            name: loan.full_name,
            amount: Math.round(instAmt).toString()
          }]);
        }
      }
    } else {
      setMemberBreakdown([]);
    }
  }, [selectedLoanId, loans, selectedMemberName]);

  useEffect(() => {
    if (selectedMemberName) return;

    if (memberBreakdown.length > 0) {
      const total = memberBreakdown.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
      setAmount(total.toFixed(0));
    }
  }, [memberBreakdown, selectedMemberName]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await api.auth.getMe();
      loadRepayments();
    } catch (err) {
      navigate("/staff-login");
    }
  };

  const loadRepayments = async () => {
    try {
      const data = await api.repayments.getAll();

      // The backend returns already processed loans with status and calculations
      setLoans(data);
      setRepayments(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  useEffect(() => {
    if (roleLoading) return;
    if (!isAdmin) {
      setCollectorSummary(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setCollectorSummaryLoading(true);
      try {
        const data = await api.repayments.collectorSummary({
          date_from: summaryDateFrom,
          date_to: summaryDateTo,
        });
        if (!cancelled) setCollectorSummary(data);
      } catch (err: unknown) {
        if (!cancelled) {
          toast({
            title: "Could not load collector summary",
            description: err instanceof Error ? err.message : "Try again.",
            variant: "destructive",
          });
          setCollectorSummary(null);
        }
      } finally {
        if (!cancelled) setCollectorSummaryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roleLoading, isAdmin, summaryDateFrom, summaryDateTo, toast]);

  useEffect(() => {
    if (!isGroupDialogOpen || !selectedGroup?.members?.length) return;
    setBulkRepaymentRows(
      selectedGroup.members.map((m: any) => ({
        loanId: m.id,
        name: m.name || "Member",
        amount: "",
      }))
    );
    setBulkRepaymentDate(new Date().toISOString().slice(0, 10));
    setBulkRepaymentMethod("cash");
  }, [isGroupDialogOpen, selectedGroup?.id, selectedGroup?.members?.length]);

  const groupedRepayments = Object.values(
    repayments
      .filter(r => {
        const matchesSearch = !searchTerm ||
          r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ((r.group_name || r.groups?.group_name) && (r.group_name || r.groups?.group_name || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
          (r.phone_number && r.phone_number.includes(searchTerm));

        const matchesStatus = statusFilter === "all" || r.status === statusFilter;

        const isGroup = !!r.group_id;
        const matchesType = typeFilter === "all" ||
          (typeFilter === "group" && isGroup) ||
          (typeFilter === "individual" && !isGroup);

        return matchesSearch && matchesStatus && matchesType;
      })
      .reduce((acc: any, curr) => {
        const key = curr.group_id || curr.id;

        if (!acc[key]) {
          acc[key] = {
            id: key,
            name: curr.group_id ? (curr.group_name || curr.groups?.group_name || 'Unknown Group') : curr.full_name,
            isGroup: !!curr.group_id,
            members: [],
            totalCollection: 0,
            totalBalance: 0,
            installmentAmount: 0,
            date: curr.nextDueDate,
            lastPaymentDate: null as string | null,
            status: "Fully Paid"
          };
        }

        if (curr.last_payment_date) {
          const cand = curr.last_payment_date;
          const existing = acc[key].lastPaymentDate;
          const candMs = new Date(cand).getTime();
          const existingMs = existing ? new Date(existing).getTime() : -Infinity;
          if (candMs > existingMs) acc[key].lastPaymentDate = cand;
        }

        // If this loan has member_schedules (group_members JSONB) with multiple members, add each
        const schedules = curr.member_schedules;
        if (schedules && Array.isArray(schedules) && schedules.length > 0) {
          const numInst = curr.group_id ? Math.ceil((curr.loan_duration_months || 4) * 4.33) : (curr.loan_duration_months || 4);
          const memberPaidMap = curr.member_paid_map || {};
          const hasMemberPaidMap = Object.keys(memberPaidMap).length > 0;
          schedules.forEach((m: any) => {
            const mPrincipal = parseFloat(m.amount) || 0;
            const mTotal = mPrincipal * 1.30;
            const mInstallment = m.weekly ?? mTotal / numInst;
            const nameKey = (m.name || '').toString().trim().toLowerCase();
            const memberPaid = hasMemberPaidMap
              ? parseFloat(memberPaidMap[nameKey] || 0)
              : (curr.paidAmount / schedules.length);
            const memberBalance = Math.max(0, mTotal - memberPaid);
            acc[key].members.push({
              id: curr.id,
              name: m.name || 'Member',
              amount: mPrincipal,
              installment: mInstallment,
              paidAmount: memberPaid,
              balance: memberBalance,
              status: curr.status,
              nin: (m as any).id_number || (m as any).nin
            });
          });
        } else {
          const numInst = curr.group_id ? Math.ceil((curr.loan_duration_months || 4) * 4.33) : (curr.loan_duration_months || 4);
          const instAmt = (curr.loan_amount * 1.30) / numInst;
          acc[key].members.push({
            id: curr.id,
            name: curr.full_name,
            amount: curr.loan_amount,
            installment: instAmt,
            paidAmount: curr.paidAmount,
            balance: curr.balance,
            status: curr.status,
            nin: curr.id_number
          });
        }

        acc[key].totalCollection += curr.paidAmount;
        acc[key].totalBalance += curr.balance;
        acc[key].installmentAmount += curr.installmentAmount;

        // Group status is the "worst" status among members
        const statusPriority: Record<string, number> = {
          "Past Maturity": 5,
          "Due Today": 4,
          "Missed Repayment": 3,
          "Active": 2,
          "Fully Paid": 1
        };

        if (statusPriority[curr.status] > statusPriority[acc[key].status]) {
          acc[key].status = curr.status;
        }

        // Use earliest due date for group
        if (new Date(curr.nextDueDate) < new Date(acc[key].date)) {
          acc[key].date = curr.nextDueDate;
        }

        return acc;
      }, {})
  );

  const handleRecordPayment = async () => {
    if (!selectedLoanId) {
      toast({
        title: "Error",
        description: "Please select a loan.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await api.repayments.create({
        loan_application_id: selectedLoanId,
        amount: parseFloat(amount),
        payment_date: date,
        payment_method: paymentMethod,
        member_breakdown: selectedMemberName
          ? [{ name: selectedMemberName, amount: parseFloat(amount) }]
          : undefined,
        notes: selectedMemberName ? `Member payment: ${selectedMemberName}` : undefined,
      });

      toast({
        title: "Success",
        description: result?.message || "Payment recorded successfully.",
      });

      setIsDialogOpen(false);
      setIsGroupDialogOpen(false);
      setAmount("");
      setSelectedLoanId("");
      setPaymentMethod("cash");
      setSelectedMemberName("");
      setSelectedMemberOutstanding(null);
      loadRepayments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMemberRecord = (memberId: string, memberAmount: number, memberBalance: number, memberName?: string) => {
    setSelectedLoanId(memberId);
    const suggestedAmount = Math.max(0, Math.min(memberAmount || 0, memberBalance || 0));
    setAmount(suggestedAmount.toFixed(0));
    setSelectedMemberName(memberName || "");
    setSelectedMemberOutstanding(Math.max(0, memberBalance || 0));
    setIsDialogOpen(true);
  };

  const openReallocateDialog = (loanId: string, memberName: string) => {
    setReallocateTarget({ loanId, memberName });
    setReallocateAmount("");
    setIsReallocateDialogOpen(true);
  };

  const loadHistoryFor = async (target: {
    name: string;
    isGroup: boolean;
    groupId?: string;
    loanApplicationId?: string;
  }) => {
    setHistoryLoading(true);
    try {
      let items: unknown;
      if (target.isGroup && target.groupId) {
        items = await api.repayments.getHistoryByGroup(target.groupId);
      } else if (!target.isGroup && target.loanApplicationId) {
        items = await api.repayments.getHistory(target.loanApplicationId);
      } else {
        items = [];
      }
      setHistoryItems(Array.isArray(items) ? items : []);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load payments",
        variant: "destructive",
      });
      setHistoryItems([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openHistoryDialog = async (record: { id: string; name: string; isGroup: boolean }) => {
    const target = {
      name: record.name,
      isGroup: record.isGroup,
      groupId: record.isGroup ? record.id : undefined,
      loanApplicationId: record.isGroup ? undefined : record.id,
    };
    setHistoryTarget(target);
    setIsHistoryDialogOpen(true);
    await loadHistoryFor(target);
  };

  const refreshHistory = async () => {
    if (!historyTarget) return;
    await loadHistoryFor(historyTarget);
  };

  const openEditPayment = (payment: any) => {
    setEditTarget(payment);
    const total = parseFloat(payment.amount || 0);
    setEditAmount(String(total));
    setEditDate((payment.payment_date || "").toString().slice(0, 10));
    setEditMethod(payment.payment_method || "cash");
    setEditNotes(payment.notes || "");
    const rawBd = Array.isArray(payment.member_breakdown) ? payment.member_breakdown : [];
    setEditMemberBreakdown(
      rawBd.map((m: any) => ({
        name: String(m?.name ?? "").trim(),
        amount: String(Number(m?.amount) || ""),
      })).filter((row: { name: string }) => row.name)
    );
    setIsEditPaymentOpen(true);
  };

  const saveEditPayment = async () => {
    if (!editTarget) return;
    const amt = parseFloat(editAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({ title: "Invalid amount", description: "Enter an amount greater than 0.", variant: "destructive" });
      return;
    }
    setEditSaving(true);
    try {
      const hasBreakdownRows = editMemberBreakdown.length > 0;
      let payload: {
        amount: number;
        payment_date?: string;
        payment_method?: string;
        notes?: string;
        member_breakdown?: { name: string; amount: number }[];
      } = {
        amount: amt,
        payment_date: editDate || undefined,
        payment_method: editMethod || undefined,
        notes: editNotes || undefined,
      };

      if (hasBreakdownRows) {
        const normalized = editMemberBreakdown
          .map((m) => ({
            name: m.name.trim(),
            amount: parseFloat(String(m.amount).replace(/,/g, "")) || 0,
          }))
          .filter((m) => m.name && m.amount > 0);
        if (normalized.length === 0) {
          toast({
            title: "Invalid member split",
            description: "Enter at least one member name with an amount greater than 0.",
            variant: "destructive",
          });
          setEditSaving(false);
          return;
        }
        const sum = normalized.reduce((s, m) => s + m.amount, 0);
        if (Math.abs(sum - amt) > 0.02) {
          toast({
            title: "Amount mismatch",
            description: "Total payment must equal the sum of member amounts.",
            variant: "destructive",
          });
          setEditSaving(false);
          return;
        }
        payload = {
          ...payload,
          amount: sum,
          member_breakdown: normalized,
        };
      }

      const result = await api.repayments.update(editTarget.id, payload);
      toast({ title: "Updated", description: result?.message || "Repayment updated." });
      setIsEditPaymentOpen(false);
      setEditTarget(null);
      setEditMemberBreakdown([]);
      await refreshHistory();
      await loadRepayments();
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } finally {
      setEditSaving(false);
    }
  };

  const bulkRepaymentTotal = bulkRepaymentRows.reduce((s, r) => {
    const n = parseFloat(String(r.amount).replace(/,/g, "")) || 0;
    return s + n;
  }, 0);

  const submitBulkRepayment = async () => {
    if (!selectedGroup?.name) return;
    const byLoan = new Map<string, { name: string; amount: number }[]>();
    for (const row of bulkRepaymentRows) {
      const amt = parseFloat(String(row.amount).replace(/,/g, "")) || 0;
      if (!(amt > 0)) continue;
      if (!byLoan.has(row.loanId)) byLoan.set(row.loanId, []);
      byLoan.get(row.loanId)!.push({ name: row.name, amount: amt });
    }
    if (byLoan.size === 0) {
      toast({
        title: "No amounts entered",
        description: "Enter at least one amount greater than 0.",
        variant: "destructive",
      });
      return;
    }
    let grandTotal = 0;
    for (const [, br] of byLoan) grandTotal += br.reduce((s, b) => s + b.amount, 0);

    setBulkSaving(true);
    try {
      const note = `Bulk group repayment (${selectedGroup.name})`;
      for (const [loanId, breakdown] of byLoan) {
        const total = breakdown.reduce((s, b) => s + b.amount, 0);
        await api.repayments.create({
          loan_application_id: loanId,
          amount: total,
          payment_date: bulkRepaymentDate,
          payment_method: bulkRepaymentMethod,
          member_breakdown: breakdown,
          notes: note,
        });
      }
      toast({
        title: "Bulk repayment saved",
        description: `${byLoan.size} transaction(s). Total UGX ${grandTotal.toLocaleString()}.`,
      });
      setIsGroupDialogOpen(false);
      await loadRepayments();
    } catch (error: any) {
      toast({
        title: "Could not save bulk repayment",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBulkSaving(false);
    }
  };

  const handleReallocateHistory = async () => {
    if (!reallocateTarget) return;
    const amountToAllocate = parseFloat(reallocateAmount.replace(/,/g, ""));
    if (!amountToAllocate || amountToAllocate <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await api.repayments.reallocateHistory({
        loan_application_id: reallocateTarget.loanId,
        member_name: reallocateTarget.memberName,
        amount: amountToAllocate,
      });
      toast({
        title: "Reallocated",
        description: result?.message || `UGX ${amountToAllocate.toLocaleString()} reallocated to ${reallocateTarget.memberName}.`,
      });
      loadRepayments();
      setIsReallocateDialogOpen(false);
      setReallocateTarget(null);
    } catch (error: any) {
      toast({
        title: "Reallocation failed",
        description: error.message || "Could not reallocate historical payments.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredRepayments = repayments.filter(r => {
    const matchesSearch = !searchTerm ||
      r.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.group_name && r.group_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.phone_number && r.phone_number.includes(searchTerm)) ||
      (r.id_number && r.id_number.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === "all" ||
      (typeFilter === "group" && r.isGroup) ||
      (typeFilter === "individual" && !r.isGroup);

    return matchesSearch && matchesType;
  });

  const totalBalance = filteredRepayments.reduce((sum, r) => sum + r.balance, 0);
  const totalPaid = filteredRepayments.reduce((sum, r) => sum + r.paid_amount, 0);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full min-w-0 overflow-x-hidden">
        <StaffSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <StaffHeader />
          <main className="min-w-0 flex-1 overflow-x-clip bg-gradient-to-b from-background to-muted/20 p-3 sm:p-4 md:p-8">
            <div className="mx-auto w-full min-w-0 max-w-7xl space-y-4 sm:space-y-6">
              <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
                <div className="min-w-0 flex-1 max-w-full">
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Repayments</h1>
                  <p className="mt-1 break-words text-sm text-muted-foreground sm:text-base">
                    Monitor and record loan repayments
                  </p>
                </div>
                <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:justify-end lg:w-auto">
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-full gap-2 touch-manipulation sm:w-auto"
                      onClick={() => setCollectorSummaryDialogOpen(true)}
                    >
                      <Users className="h-4 w-4 shrink-0" />
                      Officer collections
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setSelectedMemberName("");
                      setSelectedMemberOutstanding(null);
                      setIsDialogOpen(true);
                    }}
                    className="h-10 w-full gap-2 touch-manipulation sm:w-auto"
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    Record Payment
                  </Button>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Expected Today</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      UGX {repayments
                        .filter(r => new Date(r.nextDueDate).toDateString() === new Date().toDateString())
                        .reduce((sum, r) => sum + r.installmentAmount, 0)
                        .toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      UGX {repayments.reduce((sum, r) => sum + r.paidAmount, 0).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      UGX {repayments.reduce((sum, r) => sum + r.balance, 0).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {isAdmin && (
                <Dialog open={collectorSummaryDialogOpen} onOpenChange={setCollectorSummaryDialogOpen}>
                  <DialogContent className="flex max-h-[90vh] max-w-[min(100vw-1rem,44rem)] flex-col gap-0 overflow-hidden p-0 sm:rounded-lg">
                    <DialogHeader className="shrink-0 space-y-1 border-b px-4 py-4 text-left sm:px-6">
                      <DialogTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                        <Users className="h-5 w-5 shrink-0 text-muted-foreground" />
                        Collections by loan officer
                      </DialogTitle>
                      <DialogDescription className="text-xs sm:text-sm">
                        Payments are attributed to whoever was logged in when the repayment was recorded. Change the period to compare performance.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex shrink-0 flex-wrap items-end gap-3 border-b bg-muted/20 px-4 py-3 sm:px-6">
                      <div className="grid min-w-[9rem] flex-1 gap-1">
                        <Label className="text-xs">From</Label>
                        <Input
                          type="date"
                          className="h-9"
                          max={summaryDateTo}
                          value={summaryDateFrom}
                          onChange={(e) => setSummaryDateFrom(e.target.value)}
                          disabled={collectorSummaryLoading}
                        />
                      </div>
                      <div className="grid min-w-[9rem] flex-1 gap-1">
                        <Label className="text-xs">To</Label>
                        <Input
                          type="date"
                          className="h-9"
                          min={summaryDateFrom}
                          value={summaryDateTo}
                          onChange={(e) => setSummaryDateTo(e.target.value)}
                          disabled={collectorSummaryLoading}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9 shrink-0"
                        disabled={collectorSummaryLoading}
                        onClick={() => {
                          const x = defaultSummaryRange();
                          setSummaryDateFrom(x.from);
                          setSummaryDateTo(x.to);
                        }}
                      >
                        Last 90 days
                      </Button>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6">
                      {collectorSummaryLoading ? (
                        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                          Loading…
                        </div>
                      ) : !collectorSummary?.rows?.length ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">
                          No repayments in this period.
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded-md border">
                          <Table className="min-w-[20rem] text-sm">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[44%]">Officer</TableHead>
                                <TableHead className="text-right">Repayments logged</TableHead>
                                <TableHead className="text-right">Total collected (UGX)</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {collectorSummary.rows.map((row, idx) => (
                                <TableRow key={`${row.officer_label}-${idx}`}>
                                  <TableCell className="font-medium">{row.officer_label}</TableCell>
                                  <TableCell className="tabular-nums text-right">
                                    {Number(row.repayment_count).toLocaleString()}
                                  </TableCell>
                                  <TableCell className="tabular-nums text-right font-medium">
                                    {Number(row.total_amount_ugx || 0).toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                    <DialogFooter className="shrink-0 border-t px-4 py-3 sm:px-6">
                      <Button type="button" variant="outline" onClick={() => setCollectorSummaryDialogOpen(false)}>
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* Filters */}
              <Card className="min-w-0 max-w-full">
                <CardContent className="min-w-0 p-4">
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
                    <div className="min-w-0 w-full flex-1 sm:min-w-[200px]">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <Input
                          placeholder="Search clients or groups..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="min-h-10 w-full min-w-0 pl-8"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-10 w-full min-w-0 sm:w-[160px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Past Maturity">Past Maturity</SelectItem>
                        <SelectItem value="Due Today">Due Today</SelectItem>
                        <SelectItem value="Missed Repayment">Missed</SelectItem>
                        <SelectItem value="Fully Paid">Fully Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="h-10 w-full min-w-0 sm:w-[160px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="group">Group</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Main List */}
              <Card className="min-w-0 max-w-full border shadow-sm">
                <CardHeader className="min-w-0">
                  <CardTitle className="text-base sm:text-lg">Repayment Schedule</CardTitle>
                </CardHeader>
                <CardContent className="min-w-0 px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
                  {groupedRepayments.length === 0 ? (
                    <p className="min-w-0 break-words px-1 py-10 text-center text-sm text-muted-foreground">
                      No repayments found matching filters.
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3 lg:hidden">
                        {groupedRepayments.map((record: any) => (
                          <Card
                            key={record.id}
                            className={
                              record.isGroup
                                ? "min-w-0 cursor-pointer overflow-hidden shadow-sm active:bg-muted/40"
                                : "min-w-0 overflow-hidden shadow-sm"
                            }
                            onClick={() => {
                              if (record.isGroup) {
                                setSelectedGroup(record);
                                setIsGroupDialogOpen(true);
                              }
                            }}
                          >
                            <CardContent className="space-y-3 p-4">
                              <div className="flex min-w-0 flex-wrap items-center gap-2 font-medium">
                                <span className="min-w-0 break-words">
                                  {record.name || (record.isGroup ? "Unknown Group" : "-")}
                                </span>
                                {record.isGroup && (
                                  <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                                    GROUP
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                                <div>
                                  <span className="block text-xs text-muted-foreground">Installment</span>
                                  <span>UGX {record.installmentAmount.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="block text-xs text-muted-foreground">Collected</span>
                                  <span>UGX {record.totalCollection.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="block text-xs text-muted-foreground">Balance</span>
                                  <span>UGX {record.totalBalance.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="block text-xs text-muted-foreground">Next due</span>
                                  <span className="text-xs">{new Date(record.date).toLocaleDateString()}</span>
                                </div>
                                <div>
                                  <span className="block text-xs text-muted-foreground">Last payment</span>
                                  <span className="text-xs">
                                    {record.lastPaymentDate
                                      ? new Date(record.lastPaymentDate).toLocaleDateString()
                                      : "—"}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <span
                                  className={`inline-flex rounded px-2 py-1 text-xs whitespace-nowrap ${record.status === "Fully Paid" ? "bg-green-100 text-green-800" : record.status === "Past Maturity" ? "bg-red-100 text-red-800" : record.status === "Missed Repayment" ? "bg-orange-100 text-orange-800" : record.status === "Due Today" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}
                                >
                                  {record.status}
                                </span>
                              </div>
                              <div
                                className="flex flex-wrap gap-2 border-t pt-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {record.isGroup ? (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="min-h-10 touch-manipulation"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedGroup(record);
                                      setIsGroupDialogOpen(true);
                                    }}
                                  >
                                    View
                                  </Button>
                                ) : (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="min-h-10 touch-manipulation"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedLoanId(record.id);
                                      setSelectedMemberName("");
                                      setSelectedMemberOutstanding(null);
                                      setAmount(record.installmentAmount.toString());
                                      setIsDialogOpen(true);
                                    }}
                                  >
                                    Record
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="min-h-10 touch-manipulation gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openHistoryDialog({ id: record.id, name: record.name, isGroup: record.isGroup });
                                  }}
                                >
                                  <History className="h-4 w-4" />
                                  Payments
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <div className="hidden min-w-0 lg:block">
                        <div className="w-full max-w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-md border [-webkit-overflow-scrolling:touch]">
                          <Table className="min-w-[56rem] w-full text-xs sm:text-sm">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Client / Group</TableHead>
                                <TableHead>Installment</TableHead>
                                <TableHead>Collected</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead>Next Due</TableHead>
                                <TableHead>Last payment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {groupedRepayments.map((record: any) => (
                                <TableRow
                                  key={record.id}
                                  className={
                                    record.isGroup ? "cursor-pointer bg-muted/30 hover:bg-muted/50" : ""
                                  }
                                  onClick={() => {
                                    if (record.isGroup) {
                                      setSelectedGroup(record);
                                      setIsGroupDialogOpen(true);
                                    }
                                  }}
                                >
                                  <TableCell className="flex items-center gap-2 font-medium">
                                    {record.name || (record.isGroup ? "Unknown Group" : "-")}
                                    {record.isGroup && (
                                      <span className="ml-1 whitespace-nowrap rounded bg-primary/10 px-1 text-[10px] font-bold text-primary">
                                        GROUP
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>UGX {record.installmentAmount.toLocaleString()}</TableCell>
                                  <TableCell>UGX {record.totalCollection.toLocaleString()}</TableCell>
                                  <TableCell>UGX {record.totalBalance.toLocaleString()}</TableCell>
                                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                  <TableCell className="whitespace-nowrap text-muted-foreground">
                                    {record.lastPaymentDate
                                      ? new Date(record.lastPaymentDate).toLocaleDateString()
                                      : "—"}
                                  </TableCell>
                                  <TableCell>
                                    <span
                                      className={`whitespace-nowrap rounded px-2 py-1 text-xs ${record.status === "Fully Paid" ? "bg-green-100 text-green-800" : record.status === "Past Maturity" ? "bg-red-100 text-red-800" : record.status === "Missed Repayment" ? "bg-orange-100 text-orange-800" : record.status === "Due Today" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}
                                    >
                                      {record.status}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                      {record.isGroup ? (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedGroup(record);
                                            setIsGroupDialogOpen(true);
                                          }}
                                        >
                                          View
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedLoanId(record.id);
                                            setSelectedMemberName("");
                                            setSelectedMemberOutstanding(null);
                                            setAmount(record.installmentAmount.toString());
                                            setIsDialogOpen(true);
                                          }}
                                        >
                                          Record
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openHistoryDialog({ id: record.id, name: record.name, isGroup: record.isGroup });
                                        }}
                                      >
                                        <History className="h-4 w-4" />
                                        Payments
                                      </Button>
                                    </div>
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

              {/* Group Dialog */}
              <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                <DialogContent className="flex h-[min(92vh,900px)] w-[96vw] max-w-5xl flex-col gap-0 overflow-hidden p-4 sm:p-6">
                  <DialogHeader className="shrink-0 pb-2">
                    <DialogTitle>{selectedGroup?.name} Members</DialogTitle>
                    <DialogDescription>
                      Last recorded payment for this group:{" "}
                      <span className="font-medium text-foreground">
                        {selectedGroup?.lastPaymentDate
                          ? new Date(selectedGroup.lastPaymentDate).toLocaleDateString()
                          : "—"}
                      </span>
                      . Enter payment amounts for every member — scroll the list if the group is large.
                    </DialogDescription>
                  </DialogHeader>
                  {selectedGroup && (
                    <div className="flex flex-wrap justify-end gap-2 pb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          setIsGroupDialogOpen(false);
                          openHistoryDialog({ id: selectedGroup.id, name: selectedGroup.name, isGroup: true });
                        }}
                      >
                        <History className="h-4 w-4" />
                        View all payments
                      </Button>
                    </div>
                  )}

                  {selectedGroup?.members?.length ? (
                    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
                      <div className="shrink-0 space-y-3 rounded-lg border bg-muted/20 p-3 sm:p-4">
                      <div>
                        <h3 className="text-sm font-semibold leading-none tracking-tight">Bulk repayment</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {bulkRepaymentRows.length} member{bulkRepaymentRows.length === 1 ? "" : "s"} — scroll the list below to enter amounts for the whole group.
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                        <div className="grid gap-1.5">
                          <Label htmlFor="bulk-pay-date">Repayment date</Label>
                          <Input
                            id="bulk-pay-date"
                            type="date"
                            className="w-full sm:w-[11rem]"
                            max={new Date().toISOString().slice(0, 10)}
                            value={bulkRepaymentDate}
                            onChange={(e) => setBulkRepaymentDate(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label>Payment method</Label>
                          <Select value={bulkRepaymentMethod} onValueChange={setBulkRepaymentMethod}>
                            <SelectTrigger className="w-full sm:w-[11rem]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                              <SelectItem value="mobile_money">Mobile money</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      </div>
                      <div className="min-h-0 flex-1 overflow-y-auto rounded-md border bg-background">
                      <Table className="min-w-[min(100%,560px)] text-sm">
                        <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                          <TableRow>
                            <TableHead className="w-10 bg-background">#</TableHead>
                            <TableHead className="bg-background">Member</TableHead>
                            <TableHead className="w-[140px] bg-background sm:w-[180px]">Amount (UGX)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bulkRepaymentRows.map((row, idx) => (
                            <TableRow key={`${row.loanId}-${row.name}-${idx}`}>
                              <TableCell className="text-muted-foreground tabular-nums">{idx + 1}</TableCell>
                              <TableCell className="font-medium">{row.name}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min={0}
                                  step={1000}
                                  placeholder="0"
                                  className="h-9 min-w-0"
                                  value={row.amount}
                                  onChange={(e) =>
                                    setBulkRepaymentRows((prev) =>
                                      prev.map((r, i) =>
                                        i === idx ? { ...r, amount: e.target.value } : r
                                      )
                                    )
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      </div>
                      <div className="flex shrink-0 flex-col gap-3 border-t bg-background pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm">
                          Bulk total:{" "}
                          <span className="font-semibold tabular-nums">UGX {bulkRepaymentTotal.toLocaleString()}</span>
                          <span className="ml-2 text-muted-foreground">
                            ({bulkRepaymentRows.filter((r) => parseFloat(String(r.amount)) > 0).length} paying)
                          </span>
                        </p>
                        <Button
                          type="button"
                          className="w-full sm:w-auto"
                          disabled={bulkSaving || bulkRepaymentTotal <= 0}
                          onClick={submitBulkRepayment}
                        >
                          {bulkSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving…
                            </>
                          ) : (
                            "Record bulk repayment"
                          )}
                        </Button>
                      </div>

                      <Collapsible className="shrink-0 border-t pt-2">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full justify-between">
                            Member balances &amp; individual actions
                            <span className="text-xs text-muted-foreground">
                              {(selectedGroup?.members ?? []).length} members
                            </span>
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2">
                          <div className="max-h-[28vh] overflow-y-auto rounded-md border pr-1">
                    <Table className="min-w-[760px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Installment</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(selectedGroup?.members ?? []).map((m: any, idx: number) => (
                          <TableRow key={m.id + '-' + idx}>
                            <TableCell className="font-medium">{m.name}</TableCell>
                            <TableCell>UGX {(m.installment ?? (m.amount * 1.3 / 17)).toLocaleString()}</TableCell>
                            <TableCell>UGX {m.balance.toLocaleString()}</TableCell>
                            <TableCell><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${m.status === 'Fully Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{m.status}</span></TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                {m.balance > 0 && (
                                  <Button size="sm" variant="outline" onClick={() => handleMemberRecord(m.id, m.installment ?? (m.amount * 1.3 / 17), m.balance, m.name)}>
                                    Record
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" onClick={() => openReallocateDialog(m.id, m.name)}>
                                  Reallocate Past
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  ) : null}
                </DialogContent>
              </Dialog>

              {/* Reallocate Past Payment Dialog */}
              <Dialog open={isReallocateDialogOpen} onOpenChange={setIsReallocateDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Reallocate Past Payment</DialogTitle>
                    <DialogDescription>
                      Assign historical unallocated payment to <span className="font-medium">{reallocateTarget?.memberName || "member"}</span>.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <Label htmlFor="reallocate_amount">Amount (UGX)</Label>
                    <Input
                      id="reallocate_amount"
                      type="number"
                      min="1"
                      placeholder="e.g. 59000"
                      value={reallocateAmount}
                      onChange={(e) => setReallocateAmount(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsReallocateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleReallocateHistory}>Reallocate</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Payment History Dialog */}
              <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
                <DialogContent className="w-[96vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>
                      Payments — {historyTarget?.name}
                      {historyTarget?.isGroup ? " (Group)" : ""}
                    </DialogTitle>
                    <DialogDescription>
                      {historyTarget?.isGroup
                        ? "All repayments for every loan linked to this group, newest first. Edit still updates a single payment record."
                        : "All recorded repayments for this loan. You can edit an amount if it was entered incorrectly."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center justify-between pb-2 text-sm text-muted-foreground">
                    <span>
                      {historyItems.length} payment{historyItems.length === 1 ? "" : "s"}
                      {historyItems.length > 0 && (
                        <>
                          {" "}
                          · Total UGX {historyItems
                            .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
                            .toLocaleString()}
                        </>
                      )}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refreshHistory()}
                      disabled={historyLoading}
                    >
                      Refresh
                    </Button>
                  </div>
                  <div className="overflow-auto pr-1">
                    {historyLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : historyItems.length === 0 ? (
                      <p className="py-10 text-center text-sm text-muted-foreground">No payments recorded yet.</p>
                    ) : (
                      <Table className={historyTarget?.isGroup ? "min-w-[960px]" : "min-w-[860px]"}>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            {historyTarget?.isGroup ? (
                              <TableHead className="min-w-[120px]">Loan / borrower</TableHead>
                            ) : null}
                            <TableHead>Amount (UGX)</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Collected by</TableHead>
                            <TableHead>Member(s)</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historyItems.map((p: any) => {
                            const breakdown = Array.isArray(p.member_breakdown) ? p.member_breakdown : [];
                            const membersLabel = breakdown.length
                              ? breakdown.map((m: any) => `${m.name} (${Number(m.amount || 0).toLocaleString()})`).join(", ")
                              : "—";
                            const collector =
                              typeof p.recorded_by_name === "string" && p.recorded_by_name.trim()
                                ? p.recorded_by_name.trim()
                                : "—";
                            const loanLabel =
                              typeof p.loan_borrower_name === "string" && p.loan_borrower_name.trim()
                                ? p.loan_borrower_name.trim()
                                : "—";
                            return (
                              <TableRow key={p.id}>
                                <TableCell className="whitespace-nowrap">
                                  {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "-"}
                                </TableCell>
                                {historyTarget?.isGroup ? (
                                  <TableCell className="max-w-[160px] truncate text-muted-foreground" title={loanLabel}>
                                    {loanLabel}
                                  </TableCell>
                                ) : null}
                                <TableCell className="font-medium">
                                  {Number(p.amount || 0).toLocaleString()}
                                </TableCell>
                                <TableCell className="capitalize">
                                  {(p.payment_method || "cash").replace(/_/g, " ")}
                                </TableCell>
                                <TableCell className="max-w-[140px] truncate text-muted-foreground" title={collector}>
                                  {collector}
                                </TableCell>
                                <TableCell className="max-w-[180px] truncate" title={membersLabel}>
                                  {membersLabel}
                                </TableCell>
                                <TableCell className="max-w-[180px] truncate" title={p.notes || ""}>
                                  {p.notes || "—"}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => openEditPayment(p)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Payment Dialog */}
              <Dialog
                open={isEditPaymentOpen}
                onOpenChange={(open) => {
                  setIsEditPaymentOpen(open);
                  if (!open) setEditMemberBreakdown([]);
                }}
              >
                <DialogContent className={editMemberBreakdown.length > 0 ? "max-h-[90vh] max-w-lg overflow-y-auto" : "max-w-md"}>
                  <DialogHeader>
                    <DialogTitle>
                      Edit repayment
                      {editMemberBreakdown.length > 0 ? " (group split)" : ""}
                    </DialogTitle>
                    <DialogDescription>
                      {editMemberBreakdown.length > 0
                        ? "Adjust per-member amounts; the total must match the sum of member rows."
                        : "Update the recorded amount or details for this payment."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    {editTarget &&
                      (typeof editTarget.recorded_by_name === "string" && editTarget.recorded_by_name.trim() ? (
                        <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                          Collected by:{" "}
                          <span className="font-medium text-foreground">{editTarget.recorded_by_name.trim()}</span>
                        </p>
                      ) : null)}
                    {editMemberBreakdown.length > 0 ? (
                      <div className="space-y-2">
                        <Label>Member amounts (UGX)</Label>
                        <div className="max-h-[40vh] space-y-2 overflow-y-auto rounded-md border p-2">
                          {editMemberBreakdown.map((row, idx) => (
                            <div key={`${row.name}-${idx}`} className="grid grid-cols-[1fr_minmax(6rem,8rem)] gap-2 text-sm">
                              <Input
                                className="h-9"
                                value={row.name}
                                readOnly
                                title="Member name from original payment"
                              />
                              <Input
                                className="h-9 tabular-nums"
                                type="number"
                                min={0}
                                step={1000}
                                value={row.amount}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setEditMemberBreakdown((prev) => {
                                    const next = prev.map((r, i) => (i === idx ? { ...r, amount: v } : r));
                                    const sum = next.reduce((s, m) => s + (parseFloat(String(m.amount).replace(/,/g, "")) || 0), 0);
                                    setEditAmount(Number.isFinite(sum) && sum > 0 ? String(Math.round(sum)) : "");
                                    return next;
                                  });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total payment (UGX):{" "}
                          <span className="font-semibold text-foreground">
                            {(parseFloat(editAmount) || 0).toLocaleString()}
                          </span>
                          — must equal the combined member amounts.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Label htmlFor="edit_amount">Amount (UGX)</Label>
                        <Input
                          id="edit_amount"
                          type="number"
                          min="1"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label htmlFor="edit_date">Payment Date</Label>
                      <Input
                        id="edit_date"
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Payment Method</Label>
                      <Select value={editMethod} onValueChange={setEditMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank_transfer">Bank</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit_notes">Notes</Label>
                      <Input
                        id="edit_notes"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Reason for edit (optional)"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditPaymentOpen(false)} disabled={editSaving}>
                      Cancel
                    </Button>
                    <Button onClick={saveEditPayment} disabled={editSaving}>
                      {editSaving ? "Saving..." : "Save changes"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Recording Dialog */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Repayment</DialogTitle>
                    <DialogDescription>Enter payment details for the selected client.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {selectedMemberName && (
                      <p className="text-xs text-muted-foreground">
                        Member outstanding: UGX {(selectedMemberOutstanding || 0).toLocaleString()}
                      </p>
                    )}
                    {selectedMemberName && (
                      <div className="rounded-md bg-muted/50 p-2 text-sm">
                        Recording for member: <span className="font-semibold">{selectedMemberName}</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Select Client</Label>
                      <Select value={selectedLoanId} onValueChange={(v) => { setSelectedLoanId(v); setSelectedMemberName(""); setSelectedMemberOutstanding(null); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Search client..." />
                        </SelectTrigger>
                        <SelectContent>
                          {loans.map(l => (
                            <SelectItem key={l.id} value={l.id}>{l.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (UGX)</Label>
                      <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Date</Label>
                      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank_transfer">Bank</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleRecordPayment}>Record</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Repayments;

