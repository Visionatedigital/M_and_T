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
                const borrower = await api.borrowers.get(preselectedBorrowerId);
                // Map borrower data to form schema
                let firstName = "";
                let lastMiddleName = "";
                if (borrower.full_name) {
                    const parts = borrower.full_name.split(' ');
                    firstName = parts[0] || "";
                    lastMiddleName = parts.slice(1).join(' ') || "";
                }

                setInitialData({
                    borrower_id: borrower.id,
                    first_name: firstName,
                    last_middle_name: lastMiddleName,
                    business_name: borrower.business_name || "",
                    phone_number: borrower.phone_number || "",
                    id_number: borrower.id_number || "",
                    email: borrower.email || "",
                    address: borrower.address || "",
                    unique_number: borrower.unique_number || "",
                    // Default values for other required fields if any
                    loan_category: "Business",
                    country: "Uganda"
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
                                        <h1 className="text-lg font-bold font-mono tracking-tight sm:text-xl">New Loan Application</h1>
                                    </div>
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
