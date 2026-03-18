import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, Car, Home, Smartphone, Briefcase, Ruler, ShieldCheck } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AddCollateral = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [borrowers, setBorrowers] = useState<any[]>([]);
    const [loans, setLoans] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        borrower_id: "",
        loan_application_id: "",
        type: "Automobiles",
        description: "",
        make_model: "",
        serial_number: "",
        plate_number: "",
        chassis_number: "",
        location: "",
        area_size: "",
        condition: "Good",
        estimated_value: "",
        current_value: "",
        forced_sale_value: "",
        valuation_date: new Date().toISOString().split('T')[0],
        valuation_gwa: "",
        valuation_report_file: "",
        status: "Deposited into Branch",
        notes: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bData = await api.borrowers.getAll();
                setBorrowers(bData);
                const lData = await api.applications.getActive();
                setLoans(lData);
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        if (!formData.borrower_id || !formData.type || !formData.description) {
            toast({
                title: "Error",
                description: "Please fill in all required fields (Borrower, Category, Description)",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            await api.collateral.create({
                ...formData,
                estimated_value: parseFloat(formData.estimated_value) || 0,
                current_value: parseFloat(formData.current_value) || 0,
                forced_sale_value: parseFloat(formData.forced_sale_value) || 0,
                loan_application_id: formData.loan_application_id || null
            });
            toast({
                title: "Success",
                description: "Collateral asset registered successfully"
            });
            navigate("/staff-dashboard/collateral");
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to save collateral",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { name: "Automobiles", icon: Car },
        { name: "Real estate", icon: Home },
        { name: "Electronic Items", icon: Smartphone },
        { name: "Machinery and equipment", icon: Briefcase },
        { name: "Valuables and collectibles", icon: ShieldCheck },
        { name: "Investments", icon: Briefcase },
        { name: "Insurance policies", icon: ShieldCheck }
    ];

    const statuses = [
        "Deposited into Branch", "Collateral with Borrower", "Returned to Borrower",
        "Repossession Initiated", "Repossessed", "Under Auction", "Sold", "Lost"
    ];

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 p-4 md:p-8 bg-muted/20">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" onClick={() => navigate("/staff-dashboard/collateral")}>
                                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                                </Button>
                                <h1 className="text-3xl font-bold">Add Collateral Asset</h1>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Asset Information</CardTitle>
                                        <CardDescription>Enter detailed specifications for the collateral asset.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-blue-700 font-bold">Owner / Borrower *</Label>
                                                <Select
                                                    value={formData.borrower_id}
                                                    onValueChange={(val) => setFormData({ ...formData, borrower_id: val })}
                                                >
                                                    <SelectTrigger className="border-blue-200">
                                                        <SelectValue placeholder="Select asset owner" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {borrowers.map((b) => (
                                                            <SelectItem key={b.id} value={b.id}>{b.full_name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Linked Loan (Optional)</Label>
                                                <Select
                                                    value={formData.loan_application_id}
                                                    onValueChange={(val) => setFormData({ ...formData, loan_application_id: val })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select active loan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">Not Linked</SelectItem>
                                                        {loans.filter(l => l.borrower_id === formData.borrower_id).map((l) => (
                                                            <SelectItem key={l.id} value={l.id}>{l.loan_product} - {l.loan_amount.toLocaleString()}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Item Name / Brief Description *</Label>
                                            <Input
                                                placeholder="e.g. Toyota Premio, Plot 42 Entebbe, iPhone 15 Pro"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Category</Label>
                                                <Select
                                                    value={formData.type}
                                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((cat) => (
                                                            <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Asset Status</Label>
                                                <Select
                                                    value={formData.status}
                                                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statuses.map((s) => (
                                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Dynamic Fields based on Category */}
                                        <div className="p-4 bg-muted/30 rounded-lg border border-dashed space-y-4">
                                            <h4 className="text-sm font-bold flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4 text-primary" />
                                                Category Specific Details
                                            </h4>

                                            {formData.type === "Automobiles" && (
                                                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Make & Model</Label>
                                                        <Input value={formData.make_model} onChange={e => setFormData({ ...formData, make_model: e.target.value })} placeholder="Toyota Hilux 2020" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Plate Number</Label>
                                                        <Input value={formData.plate_number} onChange={e => setFormData({ ...formData, plate_number: e.target.value })} placeholder="UBB 123X" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Chassis Number</Label>
                                                        <Input value={formData.chassis_number} onChange={e => setFormData({ ...formData, chassis_number: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Condition</Label>
                                                        <Input value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })} />
                                                    </div>
                                                </div>
                                            )}

                                            {formData.type === "Real estate" && (
                                                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Location / Address</Label>
                                                        <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Kajansi, Wakiso" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Area / Size</Label>
                                                        <Input value={formData.area_size} onChange={e => setFormData({ ...formData, area_size: e.target.value })} placeholder="50x100ft" />
                                                    </div>
                                                    <div className="col-span-2 space-y-1">
                                                        <Label className="text-xs">Title Deed Number / Reference</Label>
                                                        <Input value={formData.serial_number} onChange={e => setFormData({ ...formData, serial_number: e.target.value })} />
                                                    </div>
                                                </div>
                                            )}

                                            {(formData.type === "Electronic Items" || formData.type === "Machinery and equipment") && (
                                                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Manufacturer / Brand</Label>
                                                        <Input value={formData.make_model} onChange={e => setFormData({ ...formData, make_model: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Serial Number / IMEI</Label>
                                                        <Input value={formData.serial_number} onChange={e => setFormData({ ...formData, serial_number: e.target.value })} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Detailed Notes</Label>
                                            <Textarea
                                                placeholder="Any extra details about the condition, accessories, or history..."
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Valuation</CardTitle>
                                        <CardDescription>Financial assessment of the asset.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Market Value (UGX)</Label>
                                            <Input
                                                type="number"
                                                value={formData.estimated_value}
                                                onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                                                className="font-bold text-blue-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Forced Sale Value (UGX)</Label>
                                            <Input
                                                type="number"
                                                value={formData.forced_sale_value}
                                                onChange={(e) => setFormData({ ...formData, forced_sale_value: e.target.value })}
                                                className="text-red-700 font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2 pt-2 border-t">
                                            <Label className="text-xs">Valuation Date</Label>
                                            <Input
                                                type="date"
                                                value={formData.valuation_date}
                                                onChange={(e) => setFormData({ ...formData, valuation_date: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">GWA Reference</Label>
                                            <Input
                                                placeholder="e.g. GWA-2024-01"
                                                value={formData.valuation_gwa}
                                                onChange={(e) => setFormData({ ...formData, valuation_gwa: e.target.value })}
                                            />
                                        </div>

                                        <Button
                                            className="w-full gap-2 mt-6 shadow-md bg-blue-700 hover:bg-blue-800"
                                            onClick={handleSave}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            {loading ? "Saving..." : "Register Asset"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default AddCollateral;
