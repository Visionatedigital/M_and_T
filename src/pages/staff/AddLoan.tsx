import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LoanApplicationForm } from "@/components/loans/LoanApplicationForm";
import { ArrowLeft, Calculator } from "lucide-react";

const AddLoan = () => {
    const navigate = useNavigate();
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
            <div className="min-h-screen flex w-full">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 p-4 md:p-8 bg-muted/20">
                        <div className="max-w-5xl mx-auto space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Button variant="ghost" onClick={() => navigate("/staff-dashboard/loans")}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                    <h1 className="text-3xl font-bold font-mono tracking-tighter">New Loan Application</h1>
                                </div>
                                <Button variant="outline" className="gap-2" onClick={() => navigate("/staff-dashboard/loans/calculator")}>
                                    <Calculator className="h-4 w-4" />
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
