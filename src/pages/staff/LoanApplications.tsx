import { LoanApplicationForm } from "@/components/loans/LoanApplicationForm";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Users, Plus, Search, CheckCircle, XCircle, Clock, Eye, DollarSign, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { staffTabButtonClass, staffTabRowClass } from "@/lib/staffNavClasses";

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
  const [isDisbursementDialogOpen, setIsDisbursementDialogOpen] = useState(false);
  const [pendingApprovalId, setPendingApprovalId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LoanApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [disbursementMethod, setDisbursementMethod] = useState("cash");
  const [approvalEffectiveDate, setApprovalEffectiveDate] = useState(() => new Date().toISOString().slice(0, 10));
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
        setUserRole(
          String(user.role || "")
            .toLowerCase()
            .trim()
            .replace(/[\s-]+/g, "_")
        );
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
        // Align with /applications/active API — include closed book statuses
        filtered = filtered.filter((app) =>
          ["approved", "disbursed", "completed", "settled"].includes(app.status)
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
    setApprovalEffectiveDate(new Date().toISOString().slice(0, 10));
    setIsDisbursementDialogOpen(true);
  };

  const confirmApproveWithMethod = async () => {
    if (!pendingApprovalId) return;
    await handleStatusChange(
      pendingApprovalId,
      "approved",
      undefined,
      {
        disbursement_method: disbursementMethod,
        approved_at: approvalEffectiveDate,
        disbursement_entry_date: approvalEffectiveDate,
      }
    );
    setIsDisbursementDialogOpen(false);
    setPendingApprovalId(null);
  };

  const handleDeleteApplication = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.applications.delete(deleteTarget.id);
      toast({
        title: "Application deleted",
        description: "The loan application and related repayments were removed.",
      });
      setDeleteTarget(null);
      loadApplications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete application",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
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
      <StaffSidebar />
      <SidebarInset className="flex min-h-svh min-w-0 flex-col">
        <StaffHeader />
        <div
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-8 bg-gradient-to-b from-background to-muted/20"
          role="main"
        >
          <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">Loan Applications</h1>
                  <p className="text-muted-foreground text-sm sm:text-base">Manage and review loan applications</p>
                </div>
                <Button className="min-h-11 touch-manipulation w-full sm:w-auto shrink-0" onClick={() => navigate("/staff-dashboard/loans/add")}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Loan
                </Button>
              </div>

              {/* Status Tabs */}
              <div className={staffTabRowClass}>
                <Button
                  variant={statusFilter === "all" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/applications")}
                  className={staffTabButtonClass}
                >
                  All Applications
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/applications/pending")}
                  className={staffTabButtonClass}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Pending
                </Button>
                <Button
                  variant={statusFilter === "approved" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/applications/approved")}
                  className={staffTabButtonClass}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approved
                </Button>
                <Button
                  variant={statusFilter === "rejected" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/applications/rejected")}
                  className={staffTabButtonClass}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejected
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <CardTitle>Applications</CardTitle>
                      <CardDescription>View and manage loan applications</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto min-w-0">
                      <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search applications..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 w-full min-h-10"
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
                        <SelectTrigger className="w-full sm:w-40 min-h-10">
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
                <CardContent className="min-w-0">
                  {filteredApplications.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No applications found</p>
                  ) : (
                    <>
                      <div className="md:hidden space-y-3">
                        {filteredApplications.map((app) => (
                          <Card key={app.id} className="shadow-sm">
                            <CardContent className="p-4 space-y-3">
                              <div className="font-medium text-base leading-snug">{getPrimaryApplicantName(app)}</div>
                              {isGroupApplication(app) && app.full_name && (
                                <p className="text-xs text-muted-foreground">Leader: {app.full_name}</p>
                              )}
                              {app.group_name && (
                                <p className="text-xs font-semibold text-primary flex items-center gap-1">
                                  <Users className="h-3 w-3 shrink-0" />
                                  Group: {app.group_name}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground break-all">{app.email}</p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground block text-xs">Product</span>
                                  <span className="font-medium">{getLoanTitle(app)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-xs">Amount</span>
                                  <span>UGX {app.loan_amount.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-xs">Duration</span>
                                  <span>{app.loan_duration_months} months</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-xs">Applied</span>
                                  <span>{new Date(app.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {getStatusBadge(app.status)}
                              </div>
                              <div className="flex flex-wrap gap-2 pt-1">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="min-h-10 touch-manipulation"
                                  onClick={() => navigate(`/staff-dashboard/applications/${app.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                {app.status === "pending" && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="min-h-10 touch-manipulation"
                                      onClick={() => {
                                        setSelectedApplication(app);
                                        setIsEditDialogOpen(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2 text-blue-600" />
                                      Edit
                                    </Button>
                                    {userRole === "admin" && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="min-h-10 touch-manipulation"
                                          onClick={() => openDisbursementDialog(app.id)}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                          Approve
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="min-h-10 touch-manipulation"
                                          onClick={() => handleStatusChange(app.id, "rejected")}
                                        >
                                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                  </>
                                )}
                                {userRole === "admin" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="min-h-10 touch-manipulation text-destructive border-destructive/40 hover:bg-destructive/10"
                                    onClick={() => setDeleteTarget(app)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <div className="hidden md:block overflow-x-auto -mx-1 px-1">
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
                            {filteredApplications.map((app) => (
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
                                    {userRole === "admin" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeleteTarget(app)}
                                        title="Delete application"
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
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
                    <div className="space-y-2">
                      <Label htmlFor="list-approval-effective-date">Approval / disbursement date</Label>
                      <Input
                        id="list-approval-effective-date"
                        type="date"
                        max={new Date().toISOString().slice(0, 10)}
                        value={approvalEffectiveDate}
                        onChange={(e) => setApprovalEffectiveDate(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Sets approval time and accounting entry. Use a past date for historical loans.
                      </p>
                    </div>
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

              <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                  if (!open && !isDeleting) setDeleteTarget(null);
                }}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this application?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes the loan
                      {deleteTarget ? ` for ${deleteTarget.full_name}` : ""}
                      {deleteTarget?.status ? ` (status: ${deleteTarget.status})` : ""}
                      , plus any repayments and related accounting entries. Use this to clear duplicate or double entries, including approved loans. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteApplication();
                      }}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting…
                        </>
                      ) : (
                        "Delete Application"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default LoanApplications;

