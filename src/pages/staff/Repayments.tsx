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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Search, Plus, DollarSign, Calendar, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Repayments = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isReallocateDialogOpen, setIsReallocateDialogOpen] = useState(false);
  const [reallocateAmount, setReallocateAmount] = useState("");
  const [reallocateTarget, setReallocateTarget] = useState<{ loanId: string; memberName: string } | null>(null);
  const [selectedMemberOutstanding, setSelectedMemberOutstanding] = useState<number | null>(null);

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
            status: "Fully Paid"
          };
        }

        // If this loan has member_schedules (group_members JSONB) with multiple members, add each
        const schedules = curr.member_schedules;
        if (schedules && Array.isArray(schedules) && schedules.length > 1) {
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

  // ... (rest of the component state and handlers)

  // Update groupedRepayments to the final table rendering section

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                <div className="min-w-0 max-w-full">
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Repayments</h1>
                  <p className="mt-1 break-words text-sm text-muted-foreground sm:text-base">
                    Monitor and record loan repayments
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setSelectedMemberName("");
                    setSelectedMemberOutstanding(null);
                    setIsDialogOpen(true);
                  }}
                  className="h-10 w-full gap-2 touch-manipulation lg:w-auto"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  Record Payment
                </Button>
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
                                  <TableCell>
                                    <span
                                      className={`whitespace-nowrap rounded px-2 py-1 text-xs ${record.status === "Fully Paid" ? "bg-green-100 text-green-800" : record.status === "Past Maturity" ? "bg-red-100 text-red-800" : record.status === "Missed Repayment" ? "bg-orange-100 text-orange-800" : record.status === "Due Today" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}
                                    >
                                      {record.status}
                                    </span>
                                  </TableCell>
                                  <TableCell>
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
                <DialogContent className="w-[96vw] max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>{selectedGroup?.name} Members</DialogTitle>
                    <DialogDescription>Individual breakdown for group loans</DialogDescription>
                  </DialogHeader>
                  <div className="overflow-auto pr-1">
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

