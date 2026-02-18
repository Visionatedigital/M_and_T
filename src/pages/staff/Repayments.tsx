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
  const [memberBreakdown, setMemberBreakdown] = useState<any[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [recordTypeFilter, setRecordTypeFilter] = useState<string>("all");

  useEffect(() => {
    if (selectedLoanId) {
      const loan = loans.find(l => l.id === selectedLoanId);
      if (loan) {
        // Individual loan member breakdown is now simpler: just the one member
        setMemberBreakdown([{
          id: loan.id,
          name: loan.full_name,
          amount: (loan.loan_amount / 4).toString() // Default estimate
        }]);
      }
    } else {
      setMemberBreakdown([]);
    }
  }, [selectedLoanId, loans]);

  useEffect(() => {
    if (memberBreakdown.length > 0) {
      const total = memberBreakdown.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
      setAmount(total.toFixed(0));
    }
  }, [memberBreakdown]);

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

  const groupedRepayments = Object.values(
    repayments
      .filter(r => {
        const matchesSearch = !searchTerm ||
          r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.groups?.group_name && r.groups.group_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
            name: curr.group_id ? curr.groups?.group_name : curr.full_name,
            isGroup: !!curr.group_id,
            members: [],
            totalCollection: 0,
            totalBalance: 0,
            installmentAmount: 0,
            date: curr.nextDueDate,
            status: "Fully Paid"
          };
        }

        acc[key].members.push({
          id: curr.id,
          name: curr.full_name,
          amount: curr.loan_amount,
          paidAmount: curr.paidAmount,
          balance: curr.balance,
          status: curr.status,
          nin: curr.id_number
        });

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
      await api.repayments.create({
        loan_application_id: selectedLoanId,
        amount: parseFloat(amount),
        payment_date: date,
      });

      toast({
        title: "Success",
        description: "Payment recorded successfully.",
      });

      setIsDialogOpen(false);
      setIsGroupDialogOpen(false);
      setAmount("");
      setSelectedLoanId("");
      loadRepayments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMemberRecord = (memberId: string, memberAmount: number) => {
    setSelectedLoanId(memberId);
    setAmount(memberAmount.toString());
    setIsDialogOpen(true);
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
      <div className="min-h-screen flex w-full">
        <StaffSidebar />
        <div className="flex-1 flex flex-col">
          <StaffHeader />
          <main className="flex-1 p-4 md:p-8 bg-gradient-to-b from-background to-muted/20">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Repayments</h1>
                  <p className="text-muted-foreground">Monitor and record loan repayments</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Record Payment
                </Button>
              </div>

              {/* Statistics */}
              <div className="grid gap-4 md:grid-cols-3">
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
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search clients or groups..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]">
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
                      <SelectTrigger className="w-[150px]">
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
              <Card>
                <CardHeader>
                  <CardTitle>Repayment Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
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
                      {groupedRepayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No repayments found matching filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        groupedRepayments.map((record: any) => (
                          <TableRow
                            key={record.id}
                            className={record.isGroup ? "bg-muted/30 cursor-pointer hover:bg-muted/50" : ""}
                            onClick={() => {
                              if (record.isGroup) {
                                setSelectedGroup(record);
                                setIsGroupDialogOpen(true);
                              }
                            }}
                          >
                            <TableCell className="font-medium flex items-center gap-2">
                              {record.name} {record.isGroup && <span className="text-[10px] bg-primary/10 text-primary px-1 rounded ml-1 font-bold whitespace-nowrap">GROUP</span>}
                            </TableCell>
                            <TableCell>UGX {record.installmentAmount.toLocaleString()}</TableCell>
                            <TableCell>UGX {record.totalCollection.toLocaleString()}</TableCell>
                            <TableCell>UGX {record.totalBalance.toLocaleString()}</TableCell>
                            <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${record.status === "Fully Paid" ? "bg-green-100 text-green-800" :
                                record.status === "Past Maturity" ? "bg-red-100 text-red-800" :
                                  record.status === "Missed Repayment" ? "bg-orange-100 text-orange-800" :
                                    record.status === "Due Today" ? "bg-yellow-100 text-yellow-800" :
                                      "bg-blue-100 text-blue-800"
                                }`}>
                                {record.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {record.isGroup ? (
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedGroup(record); setIsGroupDialogOpen(true); }}>
                                  View
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm" onClick={() => { setSelectedLoanId(record.id); setAmount(record.installmentAmount.toString()); setIsDialogOpen(true); }}>
                                  Record
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Group Dialog */}
              <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>{selectedGroup?.name} Members</DialogTitle>
                    <DialogDescription>Individual breakdown for group loans</DialogDescription>
                  </DialogHeader>
                  <Table>
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
                      {selectedGroup?.members.map((m: any) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">{m.name}</TableCell>
                          <TableCell>UGX {(m.amount / 16).toLocaleString()}</TableCell> {/* Assuming weekly installments for groups */}
                          <TableCell>UGX {m.balance.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${m.status === 'Fully Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {m.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {m.balance > 0 && (
                              <Button size="sm" variant="outline" onClick={() => handleMemberRecord(m.id, m.amount / 16)}>
                                Record
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </DialogContent>
              </Dialog>

              {/* Recording Dialog */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Repayment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Select Client</Label>
                      <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
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

