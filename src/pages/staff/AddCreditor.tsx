import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AddCreditor = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        amount_borrowed: "",
        interest_rate: "",
        start_date: "",
        maturity_date: ""
    });

    const handleSave = async () => {
        if (!formData.name || !formData.amount_borrowed) {
            toast({
                title: "Error",
                description: "Creditor name and amount are required",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            await api.creditors.create({
                ...formData,
                amount_borrowed: parseFloat(formData.amount_borrowed),
                interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null
            });
            toast({
                title: "Success",
                description: "Creditor saved successfully"
            });
            navigate("/staff-dashboard/creditors");
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to save creditor",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 p-4 md:p-8 bg-muted/20">
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" onClick={() => navigate("/staff-dashboard/creditors")}>
                                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                                </Button>
                                <h1 className="text-3xl font-bold">Add Creditor</h1>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Creditor Details</CardTitle>
                                    <CardDescription>Enter details of the entity the business is borrowing from.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Creditor Name</Label>
                                        <Input
                                            placeholder="e.g. Bank Name or Investor"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Amount Borrowed</Label>
                                            <Input
                                                type="number"
                                                placeholder="Enter amount"
                                                value={formData.amount_borrowed}
                                                onChange={(e) => setFormData({ ...formData, amount_borrowed: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Interest Rate (%)</Label>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 10"
                                                value={formData.interest_rate}
                                                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Loan Start Date</Label>
                                            <Input
                                                type="date"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Maturity Date</Label>
                                            <Input
                                                type="date"
                                                value={formData.maturity_date}
                                                onChange={(e) => setFormData({ ...formData, maturity_date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-4">
                                        <Button
                                            className="w-full gap-2 shadow-lg"
                                            onClick={handleSave}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            {loading ? "Saving..." : "Save Creditor"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default AddCreditor;
