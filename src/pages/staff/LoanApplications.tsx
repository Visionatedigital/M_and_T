import { LoanApplicationForm } from "@/components/loans/LoanApplicationForm";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Users, Plus, Search, CheckCircle, XCircle, Clock, Eye, DollarSign, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoanApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  loan_product: string;
  loan_amount: number;
  loan_duration_months: number;
  status: string;
  created_at: string;
  group_id?: string;
  group_name?: string;
  group_members?: any; // changed to any to support jsonb
  loan_category?: string;
  district?: string;
  village?: string;
  business_location?: string;
  guarantors?: any[];
  employment_status?: string;
  employer_name?: string;
  monthly_income?: number;
  interest_method?: "flat_rate" | "reducing_balance" | "interest_only" | "fixed_fee";
  interest_rate?: number;
  interest_fixed_amount?: number;
}

const LoanApplications = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<LoanApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Determine status filter from URL path
  const getStatusFromPath = () => {
    const path = location.pathname;
    if (path.includes("/pending")) return "pending";
    if (path.includes("/approved")) return "approved";
    if (path.includes("/rejected")) return "rejected";
    return "all";
  };

  const [statusFilter, setStatusFilter] = useState<string>(getStatusFromPath());
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isDisbursementDialogOpen, setIsDisbursementDialogOpen] = useState(false);
  const [pendingApprovalId, setPendingApprovalId] = useState<string | null>(null);
  const [disbursementMethod, setDisbursementMethod] = useState("cash");
  const [userRole, setUserRole] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Group loan form state
  const [groupForm, setGroupForm] = useState({
    group_name: "",
    group_leader_name: "",
    group_leader_email: "",
    group_leader_phone: "",
    group_leader_id: "",
    loan_amount: "",
    loan_duration_months: "",
    loan_purpose: "",
    group_members: [{ name: "", nin: "", dob: "", amount: "" }],
  });

  useEffect(() => {
    checkAuth();
  }, []);

  // Update status filter when route changes
  useEffect(() => {
    const newStatus = getStatusFromPath();
    setStatusFilter(newStatus);
  }, [location.pathname]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const checkAuth = async () => {
    try {
      const user = await api.auth.getMe();
      if (user) {
        setUserRole(user.role);
        loadApplications();
      }
    } catch (err) {
      navigate("/staff-login");
    }
  };

  const loadApplications = async () => {
    try {
      const data = await api.applications.getAll();
      setApplications(data);
      setFilteredApplications(data);
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

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (app.group_name && app.group_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          app.phone_number.includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "approved") {
        // Include both approved and disbursed loans
        filtered = filtered.filter((app) =>
          app.status === "approved" || app.status === "disbursed"
        );
      } else {
        filtered = filtered.filter((app) => app.status === statusFilter);
      }
    }

    setFilteredApplications(filtered);
  };

  const handleStatusChange = async (applicationId: string, newStatus: string, rejectionReason?: string, extraData?: any) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === "approved") {
        updateData.approved_at = new Date().toISOString();
        updateData.reviewed_at = new Date().toISOString();
      } else if (newStatus === "rejected") {
        updateData.rejection_reason = rejectionReason || "Application rejected";
        updateData.reviewed_at = new Date().toISOString();
      } else if (newStatus === "under_review") {
        updateData.reviewed_at = new Date().toISOString();
      }

      await api.applications.updateStatus(applicationId, newStatus, extraData);

      toast({
        title: "Success",
        description: `Application ${newStatus} successfully`,
      });

      loadApplications();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openDisbursementDialog = (applicationId: string) => {
    setPendingApprovalId(applicationId);
    setDisbursementMethod("cash");
    setIsDisbursementDialogOpen(true);
  };

  const confirmApproveWithMethod = async () => {
    if (!pendingApprovalId) return;
    await handleStatusChange(
      pendingApprovalId,
      "approved",
      undefined,
      { disbursement_method: disbursementMethod }
    );
    setIsDisbursementDialogOpen(false);
    setPendingApprovalId(null);
  };

  const calculateGroupLoanDetails = (application: LoanApplication) => {
    const principal = parseFloat(application.loan_amount.toString()) || 0;
    const duration = Math.max(1, parseFloat(application.loan_duration_months.toString()) || 1);
    const interestMethod = application.interest_method || "flat_rate";
    const interestRatePercent = Number(application.interest_rate ?? 30);
    const fixedFeeAmount = Number(application.interest_fixed_amount ?? 0);

    const totalInterest = interestMethod === "fixed_fee"
      ? Math.max(0, fixedFeeAmount)
      : Math.max(0, principal * (interestRatePercent / 100));
    const totalAmount = principal + totalInterest;

    // Group loans have weekly payments (16 weeks for 4 months)
    const numberOfWeeks = duration * 4; // 4 weeks per month
    const weeklyPayment = totalAmount / numberOfWeeks;
    const monthlyPayment = totalAmount / duration;

    const growthRate = ((totalAmount - principal) / principal) * 100;

    return {
      principal,
      interestMethod,
      interestRatePercent,
      fixedFeeAmount,
      interestLabel: interestMethod === "fixed_fee" ? `Fixed Fee (${fixedFeeAmount.toLocaleString()} UGX)` : `${interestRatePercent}%`,
      totalInterest,
      totalAmount,
      weeklyPayment,
      monthlyPayment,
      growthRate,
    };
  };

  const handleGroupLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const duration = parseInt(groupForm.loan_duration_months);

      if (!duration) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Validate that all members have amounts
      const hasInvalidMembers = groupForm.group_members.some(m => !m.name || !m.amount || parseFloat(m.amount) <= 0);
      if (hasInvalidMembers) {
        toast({
          title: "Error",
          description: "Please provide name and loan amount for all members",
          variant: "destructive",
        });
        return;
      }

      // Calculate total loan amount from member amounts
      const totalLoanAmount = groupForm.group_members.reduce((sum, m) => sum + parseFloat(m.amount), 0);

      // Prepare member data for loan_purpose
      const membersData = groupForm.group_members.map(m => ({
        name: m.name,
        nin: m.nin || "",
        dob: m.dob || "",
        amount: parseFloat(m.amount)
      }));

      // Prepare application data
      const applicationData = {
        full_name: groupForm.group_name || groupForm.group_leader_name,
        email: groupForm.group_leader_email,
        phone_number: groupForm.group_leader_phone,
        id_number: groupForm.group_leader_id,
        loan_product: "Group Loan",
        loan_amount: totalLoanAmount,
        loan_duration_months: duration,
        loan_purpose: JSON.stringify(membersData),
        status: "pending",
        employment_status: "Group Member",
      };

      await api.applications.create(applicationData);

      toast({
        title: "Success",
        description: "Group loan application created successfully",
      });

      setIsGroupDialogOpen(false);
      loadApplications();
      setGroupForm({
        group_name: "",
        group_leader_name: "",
        group_leader_email: "",
        group_leader_phone: "",
        group_leader_id: "",
        loan_amount: "",
        loan_duration_months: "",
        loan_purpose: "",
        group_members: [{ name: "", nin: "", dob: "", amount: "" }],
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "outline", label: "Pending" },
      under_review: { variant: "secondary", label: "Under Review" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
      disbursed: { variant: "default", label: "Disbursed" },
    };

    const config = statusConfig[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getLoanTitle = (app: LoanApplication) => {
    const isGroupLoan = app.loan_product === "Group Loan" || !!app.group_id;
    if (isGroupLoan && app.group_name) return app.group_name;
    return app.loan_product;
  };

  const isGroupApplication = (app: LoanApplication) =>
    app.loan_product === "Group Loan" || !!app.group_id || !!app.group_name;

  const getPrimaryApplicantName = (app: LoanApplication) =>
    isGroupApplication(app) && app.group_name ? app.group_name : app.full_name;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const loanDetails = selectedApplication
    ? calculateGroupLoanDetails(selectedApplication)
    : null;

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
                  <h1 className="text-3xl font-bold mb-2">Loan Applications</h1>
                  <p className="text-muted-foreground">Manage and review loan applications</p>
                </div>
                <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Loan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Loan Application</DialogTitle>
                      <DialogDescription>
                        Create a new loan application.
                      </DialogDescription>
                    </DialogHeader>
                    <LoanApplicationForm
                      onSuccess={() => {
                        setIsGroupDialogOpen(false);
                        loadApplications();
                      }}
                      onCancel={() => setIsGroupDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Status Tabs */}
              <div className="flex gap-2 border-b pb-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/applications")}
                  className="rounded-b-none"
                >
                  All Applications
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/applications/pending")}
                  className="rounded-b-none"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Pending
                </Button>
                <Button
                  variant={statusFilter === "approved" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/applications/approved")}
                  className="rounded-b-none"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approved
                </Button>
                <Button
                  variant={statusFilter === "rejected" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/applications/rejected")}
                  className="rounded-b-none"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejected
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Applications</CardTitle>
                      <CardDescription>View and manage loan applications</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search applications..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 w-64"
                        />
                      </div>
                      <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                          setStatusFilter(value);
                          // Navigate to the appropriate route
                          if (value === "pending") {
                            navigate("/staff-dashboard/applications/pending");
                          } else if (value === "approved") {
                            navigate("/staff-dashboard/applications/approved");
                          } else if (value === "rejected") {
                            navigate("/staff-dashboard/applications/rejected");
                          } else {
                            navigate("/staff-dashboard/applications");
                          }
                        }}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="disbursed">Disbursed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No applications found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredApplications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{getPrimaryApplicantName(app)}</div>
                                {isGroupApplication(app) && app.full_name && (
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    Leader: {app.full_name}
                                  </div>
                                )}
                                {app.group_name && (
                                  <div className="text-xs font-bold text-primary mt-0.5 flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    Group: {app.group_name}
                                  </div>
                                )}
                                <div className="text-sm text-muted-foreground">{app.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{getLoanTitle(app)}</div>
                              {app.group_name && (
                                <div className="text-xs text-muted-foreground">Group Loan</div>
                              )}
                            </TableCell>
                            <TableCell>UGX {app.loan_amount.toLocaleString()}</TableCell>
                            <TableCell>{app.loan_duration_months} months</TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigate(`/staff-dashboard/applications/${app.id}`);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {app.status === "pending" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedApplication(app);
                                        setIsEditDialogOpen(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    {userRole === "admin" && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => openDisbursementDialog(app.id)}
                                        >
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleStatusChange(app.id, "rejected")}
                                        >
                                          <XCircle className="h-4 w-4 text-red-600" />
                                        </Button>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Application Details</DialogTitle>
                  </DialogHeader>
                  {selectedApplication && loanDetails && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Applicant Name</Label>
                          <p className="font-medium">{selectedApplication.full_name}</p>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <p className="font-medium">{selectedApplication.email}</p>
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <p className="font-medium">{selectedApplication.phone_number}</p>
                        </div>
                        <div>
                          <Label>Loan Title</Label>
                          <p className="font-medium">{getLoanTitle(selectedApplication)}</p>
                        </div>
                        {selectedApplication.loan_category && (
                          <div>
                            <Label>Category</Label>
                            <p className="font-medium">{selectedApplication.loan_category}</p>
                          </div>
                        )}
                        {selectedApplication.district && (
                          <div>
                            <Label>Location</Label>
                            <p className="font-medium">{selectedApplication.village}, {selectedApplication.district}</p>
                          </div>
                        )}
                        {selectedApplication.group_name && (
                          <div>
                            <Label>Group Name</Label>
                            <p className="font-medium text-primary flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {selectedApplication.group_name}
                            </p>
                          </div>
                        )}
                        {selectedApplication.business_location && (
                          <div>
                            <Label>Business Location</Label>
                            <p className="font-medium">{selectedApplication.business_location}</p>
                          </div>
                        )}
                        <div>
                          <Label>Date Applied</Label>
                          <p className="font-medium">{new Date(selectedApplication.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label>Employment Status</Label>
                          <p className="font-medium capitalize">{selectedApplication.employment_status || "N/A"}</p>
                        </div>
                        {selectedApplication.employer_name && (
                          <div>
                            <Label>Employer Name</Label>
                            <p className="font-medium">{selectedApplication.employer_name}</p>
                          </div>
                        )}
                        {selectedApplication.monthly_income && (
                          <div>
                            <Label>Monthly Income</Label>
                            <p className="font-medium">UGX {selectedApplication.monthly_income.toLocaleString()}</p>
                          </div>
                        )}
                      </div>

                      {selectedApplication.guarantors && selectedApplication.guarantors.length > 0 && (
                        <div className="border-t pt-4">
                          <h3 className="font-semibold mb-2">Guarantors</h3>
                          <div className="space-y-2">
                            {selectedApplication.guarantors.map((g: any, i: number) => (
                              <div key={i} className="text-sm border p-2 rounded bg-muted/20">
                                <span className="font-bold">{g.name}</span> - {g.phone} ({g.address})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Loan Calculation ({loanDetails.interestLabel})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-sm text-muted-foreground">Principal Amount</div>
                              <div className="text-2xl font-bold">UGX {loanDetails.principal.toLocaleString()}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-sm text-muted-foreground">{loanDetails.interestMethod === "fixed_fee" ? "Fixed Fee" : `Total Interest (${loanDetails.interestRatePercent}%)`}</div>
                              <div className="text-2xl font-bold">UGX {loanDetails.totalInterest.toLocaleString()}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-sm text-muted-foreground">Total Amount</div>
                              <div className="text-2xl font-bold text-primary">UGX {loanDetails.totalAmount.toLocaleString()}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-sm text-muted-foreground">
                                {selectedApplication.loan_product?.includes("Group") ? "Weekly Payment" : "Monthly Payment"}
                              </div>
                              <div className="text-2xl font-bold">
                                UGX {(selectedApplication.loan_product?.includes("Group")
                                  ? loanDetails.weeklyPayment
                                  : loanDetails.monthlyPayment).toLocaleString()}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        <Card className="mt-4 bg-primary/10">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm text-muted-foreground">Money Growth Rate</div>
                                <div className="text-2xl font-bold text-primary">{loanDetails.growthRate.toFixed(2)}%</div>
                              </div>
                              <DollarSign className="h-8 w-8 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Your money grows by {loanDetails.growthRate.toFixed(2)}% over {selectedApplication.loan_duration_months} months
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Close
                        </Button>
                        {selectedApplication.status === "pending" && userRole === "admin" && (
                          <>
                            <Button onClick={() => openDisbursementDialog(selectedApplication.id)}>
                              Approve
                            </Button>
                            <Button variant="destructive" onClick={() => handleStatusChange(selectedApplication.id, "rejected")}>
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Loan Application</DialogTitle>
                    <DialogDescription>
                      Make changes to the application details below.
                    </DialogDescription>
                  </DialogHeader>
                  {selectedApplication && (
                    <LoanApplicationForm
                      initialData={selectedApplication}
                      onSuccess={() => {
                        setIsEditDialogOpen(false);
                        loadApplications();
                      }}
                      onCancel={() => setIsEditDialogOpen(false)}
                    />
                  )}
                </DialogContent>
              </Dialog>

              <Dialog open={isDisbursementDialogOpen} onOpenChange={setIsDisbursementDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Select Disbursement Method</DialogTitle>
                    <DialogDescription>How was this loan disbursed?</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <Label htmlFor="disbursement_method">Method</Label>
                    <Select value={disbursementMethod} onValueChange={setDisbursementMethod}>
                      <SelectTrigger id="disbursement_method">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDisbursementDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmApproveWithMethod}>Confirm & Approve</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default LoanApplications;

