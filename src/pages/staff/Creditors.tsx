import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Plus, DollarSign, PieChart, Landmark, TrendingUp, MoreHorizontal, Filter, Pencil } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Creditor {
    id: string;
    name: string;
    type: string;
    amount_borrowed: number;
    interest_rate: number;
    balance: number;
    due_date: string;
    start_date?: string;
    maturity_date?: string;
    status: string;
}

const Creditors = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [creditors, setCreditors] = useState<Creditor[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newCreditor, setNewCreditor] = useState({
        name: "",
        amount_borrowed: "",
        interest_rate: "",
        start_date: new Date().toISOString().split('T')[0],
        maturity_date: "",
        payment_method: "bank_transfer"
    });

    const fetchCreditors = async () => {
        setLoading(true);
        try {
            const data = await api.creditors.getAll();
            setCreditors(data.map((c: any) => {
                const amount = parseFloat(c.amount_borrowed);
                const rate = parseFloat(c.interest_rate || 0);
                const calculatedInterest = amount * (rate / 100);
                const initialTotal = amount + calculatedInterest;
                const totalRepaid = parseFloat(c.total_repaid || 0);
                
                // Subtract what has been paid from the total expected initially
                const remainingBalance = initialTotal - totalRepaid;

                return {
                    id: c.id,
                    name: c.name,
                    type: 'Business Loan',
                    amount_borrowed: amount,
                    interest_rate: rate,
                    calculated_interest: calculatedInterest, // Added field to use in UI
                    balance: remainingBalance,
                    due_date: c.maturity_date || c.start_date,
                    start_date: c.start_date,
                    maturity_date: c.maturity_date,
                    status: 'Active'
                };
            }));
        } catch (err) {
            console.error('Failed to fetch creditors:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCreditors();
    }, []);

    const handleAddCreditor = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.creditors.create({
                ...newCreditor,
                amount_borrowed: parseFloat(newCreditor.amount_borrowed),
                interest_rate: parseFloat(newCreditor.interest_rate)
            });
            toast({ title: "Funding Source Added", description: "The new funding source has been registered." });
            setIsAddDialogOpen(false);
            fetchCreditors();
            setNewCreditor({
                name: "",
                amount_borrowed: "",
                interest_rate: "",
                start_date: new Date().toISOString().split('T')[0],
                maturity_date: "",
                payment_method: "bank_transfer"
            });
        } catch (err) {
            toast({ title: "Error", description: "Failed to add funding source.", variant: "destructive" });
        }
    };

    const [selectedCreditorForPay, setSelectedCreditorForPay] = useState<Creditor | null>(null);
    const [selectedCreditorForEdit, setSelectedCreditorForEdit] = useState<Creditor | null>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        amount_borrowed: "",
        interest_rate: "",
        start_date: "",
        maturity_date: ""
    });
    const [repaymentForm, setRepaymentForm] = useState({
        amount: "",
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: "bank_transfer",
        reference: ""
    });

    const handleEditCreditor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCreditorForEdit) return;
        try {
            await api.creditors.update(selectedCreditorForEdit.id, {
                name: editForm.name,
                amount_borrowed: parseFloat(editForm.amount_borrowed),
                interest_rate: parseFloat(editForm.interest_rate),
                start_date: editForm.start_date || undefined,
                maturity_date: editForm.maturity_date || undefined
            });
            toast({ title: "Loan Updated", description: "The funding source details have been updated." });
            setSelectedCreditorForEdit(null);
            fetchCreditors();
        } catch (err) {
            toast({ title: "Error", description: "Failed to update loan details.", variant: "destructive" });
        }
    };

    const openEditDialog = (c: Creditor) => {
        setSelectedCreditorForEdit(c);
        setEditForm({
            name: c.name,
            amount_borrowed: String(c.amount_borrowed),
            interest_rate: String(c.interest_rate),
            start_date: c.start_date ? new Date(c.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            maturity_date: c.maturity_date ? new Date(c.maturity_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
    };

    const handleRecordRepayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCreditorForPay) return;
        try {
            await api.creditors.recordRepayment(selectedCreditorForPay.id, {
                ...repaymentForm,
                amount: parseFloat(repaymentForm.amount)
            });
            toast({ title: "Repayment Recorded", description: "The payment has been logged successfully." });
            setSelectedCreditorForPay(null);
            fetchCreditors();
            setRepaymentForm({
                amount: "",
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: "bank_transfer",
                reference: ""
            });
        } catch (err) {
            toast({ title: "Error", description: "Failed to record repayment.", variant: "destructive" });
        }
    };

    const totalLiabilities = creditors.reduce((sum, c) => sum + (c.balance || 0), 0);
    const avgInterest = creditors.filter(c => (c.balance || 0) > 0).reduce((sum, c, _, arr) => sum + c.interest_rate / arr.length, 0);

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
                                    <h1 className="text-3xl font-bold italic tracking-tight text-slate-900">Business Creditors</h1>
                                    <p className="text-muted-foreground font-medium">Manage and track company liabilities and funding sources.</p>
                                </div>
                                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2 shadow-lg bg-indigo-700 hover:bg-indigo-800 transition-all font-bold px-6">
                                            <Plus className="h-4 w-4" /> Add Funding Source
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Add Funding Source</DialogTitle>
                                            <CardDescription>Enter details for a new business loan or credit line.</CardDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleAddCreditor} className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label>Creditor Name</Label>
                                                <Input required placeholder="e.g. Commercial Bank A" value={newCreditor.name} onChange={e => setNewCreditor({ ...newCreditor, name: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Borrowed Amount (UGX)</Label>
                                                    <Input type="number" required placeholder="0" value={newCreditor.amount_borrowed} onChange={e => setNewCreditor({ ...newCreditor, amount_borrowed: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Interest Rate (%)</Label>
                                                    <Input type="number" step="0.1" required placeholder="12" value={newCreditor.interest_rate} onChange={e => setNewCreditor({ ...newCreditor, interest_rate: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Start Date</Label>
                                                    <Input type="date" required value={newCreditor.start_date} onChange={e => setNewCreditor({ ...newCreditor, start_date: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Maturity Date</Label>
                                                    <Input type="date" required value={newCreditor.maturity_date} onChange={e => setNewCreditor({ ...newCreditor, maturity_date: e.target.value })} />
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <Label>Funding Received Via</Label>
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                        value={newCreditor.payment_method}
                                                        onChange={e => setNewCreditor({ ...newCreditor, payment_method: e.target.value })}
                                                    >
                                                        <option value="bank_transfer">Bank</option>
                                                        <option value="cash">Cash</option>
                                                        <option value="mobile_money">Mobile Money</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3 pt-4">
                                                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                                <Button type="submit">Add Source</Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="border-none shadow-md bg-white overflow-hidden">
                                    <div className="h-1 bg-indigo-600" />
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                            <Landmark className="h-3.5 w-3.5" /> Total Liability
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-black text-slate-900">UGX {totalLiabilities.toLocaleString()}</div>
                                        <div className="flex items-center gap-1.5 mt-2 text-emerald-600 text-xs font-bold bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
                                            <TrendingUp className="h-3 w-3" /> Portfolio Funding
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-none shadow-md bg-white overflow-hidden">
                                    <div className="h-1 bg-amber-500" />
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                            <PieChart className="h-3.5 w-3.5" /> Cost of Capital (Avg)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-black text-slate-900">{avgInterest.toFixed(1)}% <span className="text-sm font-medium text-slate-400">APR</span></div>
                                        <p className="text-xs text-slate-500 mt-2 font-medium italic">Weighted by funding volume</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-none shadow-md bg-white overflow-hidden">
                                    <div className="h-1 bg-emerald-500" />
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                            <DollarSign className="h-3.5 w-3.5" /> Settled This Month
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-black text-slate-900">UGX {creditors.reduce((sum, c: any) => sum + (parseFloat(c.total_repaid) || 0), 0).toLocaleString()}</div>
                                        <p className="text-xs text-slate-500 mt-2 font-medium">Repayments made to creditors</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="shadow-lg border-none bg-white">
                                <CardHeader className="pb-3 border-b bg-slate-50/50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-slate-800">Funding Registry</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-80">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="Filter by creditor or type..."
                                                    className="pl-10 h-10 w-full bg-white border-slate-200 focus:ring-indigo-500/20 shadow-sm"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className="gap-2 h-10">
                                                <Filter className="h-4 w-4" /> Advanced Filter
                                            </Button>
                                        </div>
                                    </div>
                                    {showAdvanced && (
                                        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Creditor Type</label>
                                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                                        <option value="">Any Type</option>
                                                        <option value="Bank">Bank</option>
                                                        <option value="Individual">Individual</option>
                                                        <option value="Institution">Institution</option>
                                                        <option value="Microfinance">Microfinance</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                                        <option value="">Any Status</option>
                                                        <option value="Active">Active</option>
                                                        <option value="Settled">Settled</option>
                                                    </select>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground mb-1 block">Min Balance</label>
                                                        <Input type="number" placeholder="0" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground mb-1 block">Max Balance</label>
                                                        <Input type="number" placeholder="Any" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground mb-1 block">Due From</label>
                                                        <Input type="date" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground mb-1 block">Due To</label>
                                                        <Input type="date" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <Button className="gap-2 px-8">
                                                    <Search className="h-4 w-4" /> Filter Results
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-slate-50/80">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="font-bold text-[10px] uppercase text-slate-500 tracking-wider h-12">Creditor Name</TableHead>
                                                    <TableHead className="font-bold text-[10px] uppercase text-slate-500 tracking-wider h-12">Type</TableHead>
                                                    <TableHead className="font-bold text-[10px] uppercase text-slate-500 tracking-wider h-12 text-right">Borrowed Amount</TableHead>
                                                    <TableHead className="font-bold text-[10px] uppercase text-slate-500 tracking-wider h-12 text-center">Interest</TableHead>
                                                    <TableHead className="font-bold text-[10px] uppercase text-slate-500 tracking-wider h-12 text-right">Current Balance</TableHead>
                                                    <TableHead className="font-bold text-[10px] uppercase text-slate-500 tracking-wider h-12">Due Date</TableHead>
                                                    <TableHead className="font-bold text-[10px] uppercase text-slate-500 tracking-wider h-12">Status</TableHead>
                                                    <TableHead className="text-right h-12"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {creditors.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={8} className="h-32 text-center text-slate-400 italic">
                                                            No active creditors found.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    creditors.map((c: any) => (
                                                        <TableRow key={c.id} className="hover:bg-indigo-50/30 transition-colors group border-b border-slate-100">
                                                            <TableCell className="font-bold text-slate-900 py-4">{c.name}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="text-[10px] font-bold border-slate-200 bg-white text-slate-600">
                                                                    {c.type}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium text-slate-600 italic">UGX {parseFloat(c.amount_borrowed).toLocaleString()}</TableCell>
                                                            <TableCell className="text-center font-black text-amber-600">
                                                                <div className="flex flex-col items-center">
                                                                    <span>UGX {c.calculated_interest ? c.calculated_interest.toLocaleString() : '0'}</span>
                                                                    <span className="text-[10px] text-slate-400 font-medium">({c.interest_rate}%)</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right font-black text-indigo-700">UGX {parseFloat(c.current_balance || c.balance || c.amount_borrowed).toLocaleString()}</TableCell>
                                                            <TableCell className="text-slate-500 text-xs font-mono">{new Date(c.due_date).toLocaleDateString('en-GB')}</TableCell>
                                                            <TableCell>
                                                                <Badge className={`
                                                                    px-2.5 py-0.5 rounded-full text-[10px] font-black border-none shadow-sm
                                                                    ${parseFloat(c.current_balance || c.balance) > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}
                                                                `}>
                                                                    {parseFloat(c.current_balance || c.balance) > 0 ? 'ACTIVE' : 'SETTLED'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    {parseFloat(c.current_balance || c.balance) > 0 && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-8 text-[10px] font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                                                            onClick={() => {
                                                                                setSelectedCreditorForPay(c);
                                                                                setRepaymentForm(prev => ({ ...prev, amount: (c.current_balance || c.balance).toString() }));
                                                                            }}
                                                                        >
                                                                            RECORD PAYMENT
                                                                        </Button>
                                                                    )}
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-40 group-hover:opacity-100">
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem onClick={() => openEditDialog(c)}>
                                                                                <Pencil className="h-4 w-4 mr-2" />
                                                                                Edit Loan Details
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </TableCell>
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

                    {/* Repayment Dialog */}
                    <Dialog open={!!selectedCreditorForPay} onOpenChange={(open) => !open && setSelectedCreditorForPay(null)}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Record Repayment</DialogTitle>
                                <CardDescription>Record a payment made to {selectedCreditorForPay?.name}</CardDescription>
                            </DialogHeader>
                            <form onSubmit={handleRecordRepayment} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Payment Amount (UGX)</Label>
                                    <Input
                                        type="number"
                                        required
                                        value={repaymentForm.amount}
                                        onChange={e => setRepaymentForm({ ...repaymentForm, amount: e.target.value })}
                                        placeholder="Enter amount"
                                    />
                                    <p className="text-[10px] text-slate-500 italic">Current Balance: UGX {(selectedCreditorForPay?.balance || 0).toLocaleString()}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Payment Date</Label>
                                        <Input
                                            type="date"
                                            required
                                            value={repaymentForm.payment_date}
                                            onChange={e => setRepaymentForm({ ...repaymentForm, payment_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Method</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={repaymentForm.payment_method}
                                            onChange={e => setRepaymentForm({ ...repaymentForm, payment_method: e.target.value })}
                                        >
                                            <option value="bank_transfer">Bank</option>
                                            <option value="cash">Cash</option>
                                            <option value="mobile_money">Mobile Money</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Reference / Notes</Label>
                                    <Input
                                        placeholder="e.g. Transaction ID or Cheque #"
                                        value={repaymentForm.reference}
                                        onChange={e => setRepaymentForm({ ...repaymentForm, reference: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setSelectedCreditorForPay(null)}>Cancel</Button>
                                    <Button type="submit" className="bg-indigo-700 font-bold">Post Payment</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Loan Dialog */}
                    <Dialog open={!!selectedCreditorForEdit} onOpenChange={(open) => !open && setSelectedCreditorForEdit(null)}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Edit Loan Details</DialogTitle>
                                <CardDescription>Update the funding source details for {selectedCreditorForEdit?.name}</CardDescription>
                            </DialogHeader>
                            <form onSubmit={handleEditCreditor} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Creditor Name</Label>
                                    <Input
                                        required
                                        placeholder="e.g. Commercial Bank A"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Borrowed Amount (UGX)</Label>
                                        <Input
                                            type="number"
                                            required
                                            placeholder="0"
                                            value={editForm.amount_borrowed}
                                            onChange={e => setEditForm({ ...editForm, amount_borrowed: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Interest Rate (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            required
                                            placeholder="12"
                                            value={editForm.interest_rate}
                                            onChange={e => setEditForm({ ...editForm, interest_rate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input
                                            type="date"
                                            required
                                            value={editForm.start_date}
                                            onChange={e => setEditForm({ ...editForm, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Maturity Date</Label>
                                        <Input
                                            type="date"
                                            required
                                            value={editForm.maturity_date}
                                            onChange={e => setEditForm({ ...editForm, maturity_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setSelectedCreditorForEdit(null)}>Cancel</Button>
                                    <Button type="submit" className="bg-indigo-700 font-bold">Save Changes</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Creditors;
