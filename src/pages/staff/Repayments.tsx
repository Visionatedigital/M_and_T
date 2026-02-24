import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase, isSupabaseOffline } from "@/integrations/supabase/client";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Receipt, Search, Plus, DollarSign, Calendar, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Repayments = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [repaymentForm, setRepaymentForm] = useState({
    loan_application_id: "",
    amount: "",
    payment_method: "cash",
    notes: "",
  });
  const [activeLoans, setActiveLoans] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 1. If offline mode, prioritize local check
      if (isSupabaseOffline) {
        try {
          const user = await api.auth.getMe();
          if (user) {
            loadRepayments();
            return;
          }
        } catch (e) {
          console.warn("No local session found");
        }
        navigate("/staff-login");
        return;
      }

      // 2. Online mode: Try Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        loadRepayments();
        return;
      }

      navigate("/staff-login");
    } catch (error) {
      console.error("Auth check failed:", error);
      // Fallback for offline mode if Supabase fails
      if (isSupabaseOffline) {
        try {
          const user = await api.auth.getMe();
          if (user) {
            loadRepayments();
            return;
          }
        } catch (e) { }
      }
      navigate("/staff-login");
    }
  };

  const loadRepayments = async () => {
    try {
      let loans = [];

      if (isSupabaseOffline) {
        console.log("🛠️ Loading loans for repayments from local API...");
        loans = await api.applications.getAll();
      } else {
        const { data, error } = await supabase
          .from("loan_applications")
          .select("*")
          .in("status", ["approved", "disbursed"])
          .order("created_at", { ascending: false });

        if (error) throw error;
        loans = data || [];
      }

      // Generate repayment schedule from loans
      const repaymentRecords = loans.flatMap((loan: any) => {
        const principal = Number(loan.loan_amount) || 0;
        const interest = principal * 0.20;
        const totalAmount = principal + interest;
        const duration = Number(loan.loan_duration_months) || 12;
        const monthlyPayment = totalAmount / duration;
        const approvedDate = new Date(loan.approved_at || loan.created_at);

        const records = [];
        for (let i = 0; i < duration; i++) {
          const dueDate = new Date(approvedDate);
          dueDate.setMonth(dueDate.getMonth() + i + 1);
          const isPaid = new Date() > dueDate;

          records.push({
            id: `${loan.id}-${i}`,
            loan_id: loan.id,
            client_name: loan.full_name,
            amount: monthlyPayment,
            due_date: dueDate.toISOString(),
            status: isPaid ? "paid" : "pending",
            payment_date: isPaid ? dueDate.toISOString() : null,
          });
        }
        return records;
      });

      setRepayments(repaymentRecords);

      // Load active loans for the dropdown
      setActiveLoans(loans);
    } catch (error: any) {
      console.error("Load repayments error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepaymentSubmit = async () => {
    try {
      if (!repaymentForm.loan_application_id || !repaymentForm.amount) {
        toast({ title: "Error", description: "Please select a loan and amount", variant: "destructive" });
        return;
      }

      const data = {
        loan_application_id: repaymentForm.loan_application_id,
        amount: parseFloat(repaymentForm.amount),
        payment_method: repaymentForm.payment_method,
        notes: repaymentForm.notes,
      };

      if (isSupabaseOffline) {
        await api.repayments.create(data);
      } else {
        const { error } = await supabase.from("repayments").insert(data);
        if (error) throw error;
      }

      toast({ title: "Success", description: "Repayment recorded successfully" });
      setIsDialogOpen(false);
      loadRepayments();
      setRepaymentForm({ loan_application_id: "", amount: "", payment_method: "cash", notes: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalDue = repayments.filter(r => r.status === "pending").reduce((sum, r) => sum + r.amount, 0);
  const totalPaid = repayments.filter(r => r.status === "paid").reduce((sum, r) => sum + r.amount, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StaffSidebar />
        <div className="flex-1 flex flex-col">
          <StaffHeader />
          <main className="flex-1 p-4 md:p-8 bg-gradient-to-b from-background to-muted/20">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Repayments</h1>
                <p className="text-muted-foreground">Track and manage loan repayments</p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 border-b pb-2">
                <Button
                  variant={!location.pathname.includes("/add") && !location.pathname.includes("/schedule") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/repayments")}
                  className="rounded-b-none"
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  View Repayments
                </Button>
                <Button
                  variant={location.pathname.includes("/add") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/repayments/add")}
                  className="rounded-b-none"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Repayment
                </Button>
                <Button
                  variant={location.pathname.includes("/schedule") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/repayments/schedule")}
                  className="rounded-b-none"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Repayment Schedule
                </Button>
              </div>

              {/* Add Repayment View */}
              {location.pathname.includes("/add") ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Record New Repayment</CardTitle>
                    <CardDescription>Record a payment for a loan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Record Payment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Record Payment</DialogTitle>
                          <DialogDescription>
                            Record a new repayment for a loan
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Select Loan</Label>
                            <Select
                              value={repaymentForm.loan_application_id}
                              onValueChange={(val) => setRepaymentForm({ ...repaymentForm, loan_application_id: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a loan" />
                              </SelectTrigger>
                              <SelectContent>
                                {activeLoans.map(loan => (
                                  <SelectItem key={loan.id} value={loan.id}>
                                    {loan.full_name} - {loan.loan_product} (UGX {loan.loan_amount?.toLocaleString()})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Payment Amount</Label>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              value={repaymentForm.amount}
                              onChange={(e) => setRepaymentForm({ ...repaymentForm, amount: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Payment Method</Label>
                            <Select
                              value={repaymentForm.payment_method}
                              onValueChange={(val) => setRepaymentForm({ ...repaymentForm, payment_method: val })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Notes (Optional)</Label>
                            <Input
                              placeholder="e.g. Month 2 installment"
                              value={repaymentForm.notes}
                              onChange={(e) => setRepaymentForm({ ...repaymentForm, notes: e.target.value })}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleRepaymentSubmit}>Record Payment</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ) : location.pathname.includes("/schedule") ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Repayment Schedule Overview</CardTitle>
                    <CardDescription>View all repayment schedules grouped by loan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {repayments
                        .filter(r => !searchTerm || r.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .reduce((acc: any, repayment: any) => {
                          const existing = acc.find((item: any) => item.loan_id === repayment.loan_id);
                          if (existing) {
                            existing.payments.push(repayment);
                          } else {
                            acc.push({
                              loan_id: repayment.loan_id,
                              client_name: repayment.client_name,
                              payments: [repayment],
                            });
                          }
                          return acc;
                        }, [])
                        .map((group: any) => (
                          <Card key={group.loan_id}>
                            <CardHeader>
                              <CardTitle className="text-lg">{group.client_name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {group.payments.map((payment: any) => (
                                    <TableRow key={payment.id}>
                                      <TableCell>{new Date(payment.due_date).toLocaleDateString()}</TableCell>
                                      <TableCell>UGX {payment.amount.toLocaleString()}</TableCell>
                                      <TableCell>
                                        <span className={`px-2 py-1 rounded text-xs ${payment.status === "paid"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                          }`}>
                                          {payment.status}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        ))}
                      {repayments.length === 0 && (
                        <p className="text-center py-8 text-muted-foreground">No repayment schedules found</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Due</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">UGX {totalDue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Pending repayments</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">UGX {totalPaid.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Collected repayments</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {totalDue + totalPaid > 0
                            ? ((totalPaid / (totalDue + totalPaid)) * 100).toFixed(1)
                            : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Payment collection rate</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Repayment Schedule</CardTitle>
                          <CardDescription>View all repayment records</CardDescription>
                        </div>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search repayments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-64"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {repayments
                            .filter(r =>
                              !searchTerm ||
                              r.client_name.toLowerCase().includes(searchTerm.toLowerCase())
                            ).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                {searchTerm ? "No repayments found matching your search" : "No repayments found"}
                              </TableCell>
                            </TableRow>
                          ) : (
                            repayments
                              .filter(r =>
                                !searchTerm ||
                                r.client_name.toLowerCase().includes(searchTerm.toLowerCase())
                              )
                              .map((repayment) => (
                                <TableRow key={repayment.id}>
                                  <TableCell className="font-medium">{repayment.client_name}</TableCell>
                                  <TableCell>UGX {repayment.amount.toLocaleString()}</TableCell>
                                  <TableCell>{new Date(repayment.due_date).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 rounded text-xs ${repayment.status === "paid"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                      }`}>
                                      {repayment.status}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {repayment.payment_date
                                      ? new Date(repayment.payment_date).toLocaleDateString()
                                      : "-"
                                    }
                                  </TableCell>
                                  <TableCell>
                                    {repayment.status === "pending" && (
                                      <Button variant="outline" size="sm">Record Payment</Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Repayments;

