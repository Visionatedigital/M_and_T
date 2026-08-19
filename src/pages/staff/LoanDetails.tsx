import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  DollarSign,
  Calendar,
  TrendingUp,
  FileText,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Pencil } from "lucide-react";
import { LoanApplicationForm } from "@/components/loans/LoanApplicationForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoanDetails {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  id_number: string;
  date_of_birth: string;
  address: string;
  loan_product: string;
  loan_amount: number;
  loan_duration_months: number;
  loan_purpose: string;
  employment_status: string;
  employer_name: string | null;
  monthly_income: number | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  reviewed_at: string | null;
  assigned_officer_id: string | null;
  rejection_reason: string | null;
  loan_reference?: string | null;
  // Calculated fields
  principal: number;
  total_amount: number;
  amount_paid: number;
  remaining_balance: number;
  growth_rate: number;
  months_elapsed: number;
  months_remaining: number;
  monthly_payment: number;
  group_members?: Array<{ name: string; amount?: number; borrower_id?: string }>;
  group_id?: string;
  loan_product?: string;
}

const LoanDetails = () => {
  const { id: routeId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get("id");
  const id = routeId || queryId;

  const [isLoading, setIsLoading] = useState(true);
  const [loan, setLoan] = useState<LoanDetails | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      checkAuth();
    } else {
      toast({
        title: "Error",
        description: "Loan ID is required",
        variant: "destructive",
      });
      navigate("/staff-dashboard/loans");
    }
  }, [id, navigate]);

  const checkAuth = async () => {
    try {
      await api.auth.getMe();
      loadLoanDetails();
    } catch (err) {
      navigate("/staff-login");
    }
  };

  const loadLoanDetails = async () => {
    try {
      if (!id) return;
      const data = await api.applications.getById(id);
      setLoan(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/staff-dashboard/loans");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "outline", label: "Pending" },
      under_review: { variant: "secondary", label: "Under Review" },
      approved: { variant: "default", label: "Approved" },
      disbursed: { variant: "default", label: "Disbursed" },
      rejected: { variant: "destructive", label: "Rejected" },
    };

    const config = statusConfig[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isGroupLoan = loan?.loan_product === "Group Loan" || !!loan?.group_id;
  const loanTitle = (isGroupLoan && (loan as any)?.group_name) ? (loan as any).group_name : loan?.loan_product;
  const groupMembersWithAmounts = (loan?.group_members || []).filter((m: any) => (m.amount ?? 0) > 0);

  const generateRepaymentSchedule = (memberPrincipal?: number) => {
    if (!loan) return [];
    const principal = memberPrincipal ?? loan.principal;
    const interestRate = 0.30;
    const totalAmount = principal * (1 + interestRate);
    const approvedDate = new Date(loan.approved_at || loan.created_at);
    const months = loan.loan_duration_months || 4;

    const schedule = [];
    const numInstallments = isGroupLoan ? Math.ceil(months * 4.33) : months;
    const installmentAmount = totalAmount / numInstallments;
    const cycleDays = isGroupLoan ? 7 : 30;

    for (let i = 0; i < numInstallments; i++) {
      const dueDate = new Date(approvedDate);
      if (isGroupLoan) {
        dueDate.setDate(dueDate.getDate() + (i + 1) * 7);
      } else {
        dueDate.setMonth(dueDate.getMonth() + i + 1);
      }

      const isPast = dueDate < new Date();
      const now = new Date();
      const isCurrent = !isPast && dueDate.getTime() - now.getTime() < cycleDays * 24 * 60 * 60 * 1000;

      schedule.push({
        installment: i + 1,
        dueDate: dueDate.toLocaleDateString(),
        amount: Math.round(installmentAmount),
        totalAmount,
        status: isPast ? "paid" : isCurrent ? "due" : "upcoming",
      });
    }

    return schedule;
  };

  const memberSchedules = groupMembersWithAmounts.length > 0
    ? groupMembersWithAmounts.map((m: any, idx: number) => ({
        id: `member-${idx}`,
        name: m.name || "Member",
        amount: m.amount ?? 0,
        total: (m.amount ?? 0) * 1.30,
        schedule: generateRepaymentSchedule(m.amount ?? 0),
      }))
    : [];

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <StaffSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!loan) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <StaffSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Loan not found</p>
                <Button onClick={() => navigate("/staff-dashboard/loans")} className="mt-4">
                  Back to Loans
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const progress = (loan.amount_paid / loan.total_amount) * 100;
  const repaymentSchedule = groupMembersWithAmounts.length > 0 ? [] : generateRepaymentSchedule();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StaffSidebar />
        <div className="flex-1 flex flex-col">
          <StaffHeader />
          <main className="flex-1 p-4 md:p-8 bg-gradient-to-b from-background to-muted/20">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/staff-dashboard/loans")}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold">Loan Details</h1>
                    <p className="text-muted-foreground">
                      {loanTitle}
                      {loan.loan_reference && (
                        <>
                          {" "}
                          • Loan ID:{" "}
                          <span className="font-mono font-medium text-primary">{loan.loan_reference}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Loan
                  </Button>
                  {getStatusBadge(loan.status)}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Principal Amount</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">UGX {loan.principal.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Original loan amount</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">UGX {loan.total_amount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Including 30% interest</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      UGX {loan.amount_paid.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">{progress.toFixed(1)}% completed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">UGX {loan.remaining_balance.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{loan.months_remaining} months remaining</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Client Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Client Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Full Name:</span>
                        <span>{loan.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Email:</span>
                        <span>{loan.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Phone:</span>
                        <span>{loan.phone_number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">ID Number:</span>
                        <span>{loan.id_number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Date of Birth:</span>
                        <span>{new Date(loan.date_of_birth).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">Address:</span>
                          <p className="text-muted-foreground">{loan.address}</p>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Employment:</span>
                        <span>{loan.employment_status}</span>
                      </div>
                      {loan.employer_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Employer:</span>
                          <span>{loan.employer_name}</span>
                        </div>
                      )}
                      {loan.monthly_income && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Monthly Income:</span>
                          <span>UGX {loan.monthly_income.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Loan Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Loan Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Loan Title:</span>
                        <span className="font-medium">{loanTitle}</span>
                      </div>
                      {loan.loan_reference && (
                        <div className="flex justify-between text-sm items-center">
                          <span className="text-muted-foreground">Loan ID:</span>
                          <span className="font-mono font-semibold text-primary">{loan.loan_reference}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Loan Amount:</span>
                        <span className="font-medium">UGX {loan.loan_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{loan.loan_duration_months} months</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Monthly Payment:</span>
                        <span className="font-medium">UGX {loan.monthly_payment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Interest Rate:</span>
                        <span className="font-medium">30% (flat)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Growth Rate:</span>
                        <Badge variant="default" className="bg-green-600">
                          {loan.growth_rate.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Loan Purpose:</span>
                        <span className="font-medium">{loan.loan_purpose}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">
                          {new Date(loan.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {loan.approved_at && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Approved:</span>
                          <span className="font-medium">
                            {new Date(loan.approved_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time Elapsed:</span>
                        <span className="font-medium">{loan.months_elapsed} months</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time Remaining:</span>
                        <span className="font-medium">{loan.months_remaining} months</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Progress</CardTitle>
                  <CardDescription>Track loan repayment progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        UGX {loan.amount_paid.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Paid</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        UGX {loan.remaining_balance.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        UGX {loan.total_amount.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Repayment Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Repayment Schedule
                  </CardTitle>
                  <CardDescription>
                    {memberSchedules.length > 0
                      ? "Weekly payment schedule per member (30% interest)"
                      : isGroupLoan
                        ? "Weekly payment schedule for this group loan"
                        : "Monthly payment schedule for this loan"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {memberSchedules.length > 0 ? (
                    <Tabs defaultValue={memberSchedules[0]?.id} className="w-full">
                      <TabsList className="flex-wrap h-auto gap-1">
                        {memberSchedules.map((ms) => (
                          <TabsTrigger key={ms.id} value={ms.id} className="gap-1">
                            <Users className="h-4 w-4" />
                            {ms.name} (UGX {(ms.amount).toLocaleString()})
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {memberSchedules.map((ms) => (
                        <TabsContent key={ms.id} value={ms.id} className="mt-4">
                          <div className="mb-4 p-3 rounded-lg bg-muted/50 text-sm">
                            <span className="font-medium">Principal: </span>
                            <span>UGX {(ms.amount).toLocaleString()}</span>
                            <span className="mx-2">|</span>
                            <span className="font-medium">Total (30%): </span>
                            <span>UGX {(ms.total).toLocaleString()}</span>
                            <span className="mx-2">|</span>
                            <span className="font-medium">Weekly: </span>
                            <span>UGX {(ms.schedule[0]?.amount ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Week</TableHead>
                                  <TableHead>Due Date</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {ms.schedule.map((payment) => (
                                  <TableRow key={payment.installment}>
                                    <TableCell className="font-medium">{payment.installment}</TableCell>
                                    <TableCell>{payment.dueDate}</TableCell>
                                    <TableCell>UGX {payment.amount.toLocaleString()}</TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          payment.status === "paid"
                                            ? "default"
                                            : payment.status === "due"
                                              ? "destructive"
                                              : "outline"
                                        }
                                      >
                                        {payment.status === "paid"
                                          ? "Paid"
                                          : payment.status === "due"
                                            ? "Due"
                                            : "Upcoming"}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{isGroupLoan ? "Week" : "Installment"}</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {repaymentSchedule.map((payment) => (
                            <TableRow key={payment.installment}>
                              <TableCell className="font-medium">{payment.installment}</TableCell>
                              <TableCell>{payment.dueDate}</TableCell>
                              <TableCell>UGX {payment.amount.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    payment.status === "paid"
                                      ? "default"
                                      : payment.status === "due"
                                        ? "destructive"
                                        : "outline"
                                  }
                                >
                                  {payment.status === "paid"
                                    ? "Paid"
                                    : payment.status === "due"
                                      ? "Due"
                                      : "Upcoming"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Loan Details</DialogTitle>
            <DialogDescription>
              Update client or loan information. Saving recalculates totals and the repayment schedule.
            </DialogDescription>
          </DialogHeader>
          {loan && (
            <LoanApplicationForm
              initialData={loan}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                loadLoanDetails();
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default LoanDetails;
