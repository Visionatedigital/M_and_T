import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, LayoutGrid, Loader2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { BorrowerCombobox } from "@/components/staff/BorrowerCombobox";

const CollateralRegister = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [collaterals, setCollaterals] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingCollateral, setEditingCollateral] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        borrower_id: "",
        type: "",
        description: "",
        estimated_value: "",
        current_value: "",
        status: "",
        location: "",
        registration_number: "",
        notes: ""
    });
    const [borrowers, setBorrowers] = useState<any[]>([]);

    const fetchCollaterals = async () => {
        try {
            const data = await api.collateral.getAll();
            setCollaterals(data || []);
        } catch (error) {
            console.error("Failed to fetch collateral register", error);
            toast({
                title: "Error",
                description: "Could not load collateral data.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollaterals();
    }, []);

    useEffect(() => {
        const loadBorrowers = async () => {
            try {
                const data = await api.borrowers.getAll(false);
                setBorrowers(data || []);
            } catch {
                setBorrowers([]);
            }
        };
        if (editDialogOpen) loadBorrowers();
    }, [editDialogOpen]);

    const openEditDialog = (c: any) => {
        setEditingCollateral(c);
        setEditForm({
            borrower_id: c.borrower_id || "",
            type: c.type || "",
            description: c.description || "",
            estimated_value: c.estimated_value != null ? String(c.estimated_value) : "",
            current_value: c.current_value != null ? String(c.current_value) : "",
            status: c.status || "active",
            location: c.location || "",
            registration_number: c.registration_number || "",
            notes: c.notes || ""
        });
        setEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingCollateral) return;
        if (!editForm.description?.trim()) {
            toast({ title: "Error", description: "Description is required.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            await api.collateral.update(editingCollateral.id, {
                borrower_id: editForm.borrower_id || null,
                type: editForm.type || undefined,
                description: editForm.description.trim(),
                estimated_value: editForm.estimated_value ? parseFloat(editForm.estimated_value) : undefined,
                current_value: editForm.current_value ? parseFloat(editForm.current_value) : null,
                status: editForm.status || undefined,
                location: editForm.location || null,
                registration_number: editForm.registration_number || null,
                notes: editForm.notes || null
            });
            toast({ title: "Success", description: "Collateral updated successfully." });
            setEditDialogOpen(false);
            setEditingCollateral(null);
            fetchCollaterals();
        } catch (err: any) {
            toast({ title: "Error", description: err.message || "Failed to update collateral.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const filteredCollaterals = collaterals.filter(c => 
        c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusFilters = [
        "Processing", "Open", "Current", "Due Today", "Missed Repayment", "Arrears", "Past Maturity", "Restructured", "Fully Paid", "Defaulted", "Credit Counseling", "Collection Agency", "Sequestrate", "Debt Review", "Fraud", "Investigation", "Legal", "Write-Off", "Collateral Up for sale", "Denied", "Not Taken Up", "Deposited into Branch", "Collateral with Borrower", "Returned to Borrower", "Repossession Initiated", "Repossessed", "Under Auction", "Sold", "Lost"
    ];

    const categoryFilters = [
        "Automobiles", "Electronic Items", "Insurance policies", "Investments",
        "Machinery and equipment", "Real estate", "Valuables and collectibles"
    ];

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 p-4 md:p-8 bg-muted/20">
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-3xl font-bold">Collateral Register</h1>
                                    <p className="text-muted-foreground">Manage and track borrower collateral assets.</p>
                                </div>
                                <Button className="gap-2 shadow-md" onClick={() => navigate("/staff-dashboard/collateral/add")}>
                                    <Plus className="h-4 w-4" /> Add Collateral
                                </Button>
                            </div>

                            <Card>
                                <CardHeader className="pb-3 border-b">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Filter className="h-5 w-5 text-primary" />
                                            Advanced Search:
                                            <Button
                                                variant="link"
                                                className="p-0 h-auto font-bold"
                                                onClick={() => setShowAdvanced(!showAdvanced)}
                                            >
                                                Click here to {showAdvanced ? "Hide" : "Show"}
                                            </Button>
                                        </CardTitle>
                                    </div>
                                    {showAdvanced && (
                                        <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                                        <option value="">Any Status</option>
                                                        {statusFilters.map(status => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                                        <option value="">Any Category</option>
                                                        {categoryFilters.map(cat => (
                                                            <option key={cat} value={cat}>{cat}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <Input placeholder="Borrower Name" />
                                                <Input placeholder="Loan#" />
                                                <Input placeholder="Serial#" />
                                                <div className="flex gap-2 w-full md:col-span-4 lg:col-span-1">
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground mb-1 block">Register From Date</label>
                                                        <Input type="date" placeholder="dd/mm/yyyy" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground mb-1 block">Register To Date</label>
                                                        <Input type="date" placeholder="dd/mm/yyyy" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <Button className="gap-2 px-8">
                                                    <Search className="h-4 w-4" /> Search Collateral
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            Show
                                            <select className="border rounded px-1 py-0.5">
                                                <option>100</option>
                                                <option>50</option>
                                                <option>25</option>
                                            </select>
                                            entries
                                        </div>
                                        <div className="relative w-64">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                placeholder="Search table..." 
                                                className="pl-9 h-9" 
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-md border overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-muted/50">
                                                <TableRow>
                                                    <TableHead className="w-[80px]">View</TableHead>
                                                    <TableHead>Borrower</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Model</TableHead>
                                                    <TableHead>Serial Number</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Condition</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center py-20">
                                                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                                                            <p className="text-muted-foreground text-xs">Loading collateral assets...</p>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : filteredCollaterals.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center py-20">
                                                            <p className="text-muted-foreground">No collateral assets found.</p>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredCollaterals.map(c => (
                                                        <TableRow key={c.id}>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => openEditDialog(c)}
                                                                    title="View / Edit"
                                                                >
                                                                    <LayoutGrid className="h-4 w-4 text-primary" />
                                                                </Button>
                                                            </TableCell>
                                                            <TableCell className="font-medium text-blue-700">{c.client_name || 'N/A'}</TableCell>
                                                            <TableCell>{c.description}</TableCell>
                                                            <TableCell>{c.make_model || c.type}</TableCell>
                                                            <TableCell className="font-mono text-xs">{c.serial_number || c.plate_number || '---'}</TableCell>
                                                            <TableCell>
                                                                <Badge className={(c.status || "").includes("Branch") ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                                                                    {c.status || 'Active'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>{c.condition || '---'}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>

            <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditingCollateral(null); }}>
                <DialogContent className="max-w-lg max-h-[90vh] flex flex-col gap-3 p-4 overflow-hidden">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle>Edit Collateral</DialogTitle>
                    </DialogHeader>
                    {editingCollateral && (
                        <div className="space-y-4 py-2 overflow-y-auto flex-1 min-h-0">
                            <div className="space-y-2">
                                <Label>Owner / Borrower</Label>
                                <BorrowerCombobox
                                    borrowers={borrowers}
                                    value={editForm.borrower_id}
                                    onChange={(id) => setEditForm({ ...editForm, borrower_id: id })}
                                    placeholder="Search by name, phone, or email…"
                                    allowNone
                                    noneLabel="None (unassigned)"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category / Type</Label>
                                <Select value={editForm.type} onValueChange={(v) => setEditForm({ ...editForm, type: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryFilters.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Name / Description *</Label>
                                <Input
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    placeholder="e.g. Toyota Premio, Plot 42"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Estimated Value (UGX)</Label>
                                    <Input
                                        type="number"
                                        value={editForm.estimated_value}
                                        onChange={(e) => setEditForm({ ...editForm, estimated_value: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Current Value (UGX)</Label>
                                    <Input
                                        type="number"
                                        value={editForm.current_value}
                                        onChange={(e) => setEditForm({ ...editForm, current_value: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="Deposited into Branch">Deposited into Branch</SelectItem>
                                        <SelectItem value="Collateral with Borrower">Collateral with Borrower</SelectItem>
                                        <SelectItem value="Returned to Borrower">Returned to Borrower</SelectItem>
                                        <SelectItem value="Repossession Initiated">Repossession Initiated</SelectItem>
                                        <SelectItem value="Repossessed">Repossessed</SelectItem>
                                        <SelectItem value="Under Auction">Under Auction</SelectItem>
                                        <SelectItem value="Sold">Sold</SelectItem>
                                        <SelectItem value="Lost">Lost</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input
                                    value={editForm.location}
                                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                    placeholder="e.g. Kajansi, Wakiso"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Registration / Serial Number</Label>
                                <Input
                                    value={editForm.registration_number}
                                    onChange={(e) => setEditForm({ ...editForm, registration_number: e.target.value })}
                                    placeholder="Plate, title deed, or serial"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                    placeholder="Additional details..."
                                    className="min-h-[60px]"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="flex-shrink-0 pt-4 border-t">
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveEdit} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
};

export default CollateralRegister;
