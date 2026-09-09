import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LoanApplicationForm } from "@/components/loans/LoanApplicationForm";
import { ArrowLeft, Calculator, Info } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { Alert, AlertDescription } from "@/components/ui/alert";

function mapGuarantorsFromLoan(raw: any): Array<{ name: string; phone: string; nin?: string; address?: string; id?: string }> {
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : [];
    return list
        .map((g: any) => ({
            name: g.name || g.full_name || "",
            phone: g.phone || g.phone_number || "",
            nin: g.nin || g.id_number || "",
            address: g.address || "",
            id: g.id,
        }))
        .filter((g) => g.name || g.phone)
        .slice(0, 2);
}

const AddLoan = () => {
    const navigate = useNavigate();
    const { isLoanOfficer, loading: roleLoading } = useUserRole();
    const [searchParams] = useSearchParams();
    const preselectedBorrowerId = searchParams.get("borrower");
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(!!preselectedBorrowerId);

    useEffect(() => {
        const fetchBorrower = async () => {
            if (!preselectedBorrowerId) return;
            try {
                const [borrower, priorLoans, availableCollateral] = await Promise.all([
                    api.borrowers.get(preselectedBorrowerId),
                    api.applications.getByBorrower(preselectedBorrowerId).catch(() => []),
                    api.collateral.getAll(true).catch(() => []),
                ]);

                let firstName = "";
                let lastMiddleName = "";
                if (borrower.full_name) {
                    const parts = String(borrower.full_name).split(" ");
                    firstName = parts[0] || "";
                    lastMiddleName = parts.slice(1).join(" ") || "";
                }

                const loans = Array.isArray(priorLoans) ? [...priorLoans] : [];
                loans.sort((a: any, b: any) => {
                    const ta = new Date(a.approved_at || a.created_at || 0).getTime();
                    const tb = new Date(b.approved_at || b.created_at || 0).getTime();
                    return tb - ta;
                });

                // Prefer most recent loan that has guarantors
                const loanWithGuarantors = loans.find((l: any) => mapGuarantorsFromLoan(l.guarantors).length > 0);
                const guarantors = mapGuarantorsFromLoan(loanWithGuarantors?.guarantors);

                const ownedCollateral = (Array.isArray(availableCollateral) ? availableCollateral : []).filter(
                    (c: any) => c.borrower_id === borrower.id
                );
                // Prefer collateral matching last loan security type, else first available
                const lastSecurityType = loans[0]?.security_type;
                const preferredCollateral =
                    (lastSecurityType && ownedCollateral.find((c: any) => c.type === lastSecurityType)) ||
                    ownedCollateral[0] ||
                    null;

                setInitialData({
                    borrower_id: borrower.id,
                    application_type: "individual",
                    first_name: firstName,
                    last_middle_name: lastMiddleName,
                    full_name: borrower.full_name || "",
                    business_name: borrower.business_name || "",
                    phone_number: borrower.phone_number || "",
                    id_number: borrower.id_number || "",
                    email: borrower.email || "",
                    address: borrower.address || "",
                    date_of_birth: borrower.date_of_birth || "",
                    unique_number: borrower.unique_number || "",
                    loan_category: "Business",
                    loan_purpose: "Working capital",
                    country: "Uganda",
                    guarantors,
                    security_type: preferredCollateral?.type || loans[0]?.security_type || "",
                    security_value:
                        preferredCollateral?.estimated_value ??
                        preferredCollateral?.current_value ??
                        loans[0]?.security_value ??
                        "",
                    // Internal hints for LoanApplicationForm hydration
                    _borrower: borrower,
                    _prefillCollateralId: preferredCollateral?.id || null,
                    _prefillFromExistingClient: true,
                });
            } catch (error) {
                console.error("Failed to fetch preselected borrower", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBorrower();
    }, [preselectedBorrowerId]);

    const handleSuccess = () => {
        navigate("/staff-dashboard/loans");
    };

    const handleCancel = () => {
        navigate("/staff-dashboard/loans");
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full min-w-0 overflow-x-hidden">
                <StaffSidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                    <StaffHeader />
                    <main className="min-w-0 flex-1 overflow-x-clip bg-muted/20 p-3 sm:p-6 md:p-8">
                        <div className="mx-auto w-full min-w-0 max-w-5xl space-y-6">
                            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 w-full max-w-full flex-col gap-2">
                                    <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                                        <Button variant="ghost" size="sm" className="h-9 min-h-9 shrink-0 touch-manipulation text-xs" onClick={() => navigate("/staff-dashboard/loans")}>
                                            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                                            Back
                                        </Button>
                                        <h1 className="text-lg font-bold font-mono tracking-tight sm:text-xl">
                                            {preselectedBorrowerId ? "Add Loan for Client" : "New Loan Application"}
                                        </h1>
                                    </div>
                                    {preselectedBorrowerId && initialData?.full_name && (
                                        <p className="text-sm text-muted-foreground">
                                            Prefilling for <span className="font-medium text-foreground">{initialData.full_name}</span>
                                            {" "}(individual). Guarantors and collateral from prior loans are loaded when available.
                                        </p>
                                    )}
                                    {!roleLoading && isLoanOfficer && (
                                        <Alert className="max-w-full min-w-0 py-2">
                                            <Info className="h-3.5 w-3.5 shrink-0" />
                                            <AlertDescription className="break-words text-xs leading-snug">
                                                Submit the application when complete. An administrator will review and approve or reject it.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                                <Button variant="outline" size="sm" className="h-9 min-h-9 w-full max-w-full shrink-0 gap-1.5 text-xs touch-manipulation sm:w-auto sm:max-w-none" onClick={() => navigate("/staff-dashboard/loans/calculator")}>
                                    <Calculator className="h-3.5 w-3.5" />
                                    Loan Calculator
                                </Button>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center p-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <LoanApplicationForm
                                    onSuccess={handleSuccess}
                                    onCancel={handleCancel}
                                    initialData={initialData}
                                />
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default AddLoan;
