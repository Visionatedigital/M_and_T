import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

const Repayments = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/staff-login");
      return;
    }
    loadRepayments();
  };

  const loadRepayments = async () => {
    try {
      const { data: loans, error } = await supabase
        .from("loan_applications")
        .select("*")
        .in("status", ["approved", "disbursed"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Generate repayment schedule from loans
      const repaymentRecords = (loans || []).flatMap((loan: any) => {
        const principal = loan.loan_amount;
        const interest = principal * 0.30;
        const totalAmount = principal + interest;
        const monthlyPayment = totalAmount / loan.loan_duration_months;
        const approvedDate = new Date(loan.approved_at || loan.created_at);
        
        const records = [];
        for (let i = 0; i < loan.loan_duration_months; i++) {
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
                            <Input placeholder="Search for loan..." />
                          </div>
                          <div>
                            <Label>Payment Amount</Label>
                            <Input type="number" placeholder="Enter amount" />
                          </div>
                          <div>
                            <Label>Payment Date</Label>
                            <Input type="date" />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button>Record Payment</Button>
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
                                        <span className={`px-2 py-1 rounded text-xs ${
                                          payment.status === "paid" 
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
                              <span className={`px-2 py-1 rounded text-xs ${
                                repayment.status === "paid" 
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

