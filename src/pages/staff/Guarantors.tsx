import { useEffect, useState, useRef } from "react";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/services/api";
import { Loader2, UserPlus, Search, Edit2, Trash2, ShieldCheck, Users, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { clearFormDraft, DRAFT_KEYS, formatDraftAge, loadFormDraft, saveFormDraft } from "@/lib/formDrafts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
interface Guarantor {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    id_number: string;
    address: string;
    created_at: string;
}

export function Guarantors() {
    const { toast } = useToast();
    const [guarantors, setGuarantors] = useState<Guarantor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingGuarantor, setEditingGuarantor] = useState<Guarantor | null>(null);
    const [activeTab, setActiveTab] = useState("view");

    const emptyForm = {
        full_name: "",
        email: "",
        phone_number: "",
        id_number: "",
        address: ""
    };
    const [formData, setFormData] = useState(emptyForm);

    const suppressDraftSaveRef = useRef(false);

    useEffect(() => {
        if (activeTab !== "add" || editingGuarantor) return;
        if (suppressDraftSaveRef.current) return;
        const id = window.setTimeout(() => {
            saveFormDraft(DRAFT_KEYS.GUARANTOR_ADD, { formData });
        }, 2000);
        return () => clearTimeout(id);
    }, [formData, activeTab, editingGuarantor]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.guarantors.getAll();
            setGuarantors(data);
        } catch (err: any) {
            toast({ title: "Error", description: err.message || "Failed to load guarantors", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resetForm = () => {
        setFormData(emptyForm);
        setEditingGuarantor(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...formData
            };

            if (editingGuarantor) {
                await api.guarantors.update(editingGuarantor.id, data);
                toast({ title: "Success", description: "Guarantor updated successfully." });
                setIsAddDialogOpen(false);
            } else {
                await api.guarantors.create(data);
                toast({ title: "Success", description: "Guarantor registered successfully." });
                clearFormDraft(DRAFT_KEYS.GUARANTOR_ADD);
                setActiveTab("view");
            }
            resetForm();
            fetchData();
        } catch (err) {
            toast({ title: "Error", description: "Failed to save guarantor.", variant: "destructive" });
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await api.guarantors.delete(id);
                toast({ title: "Deleted", description: "Guarantor has been removed." });
                fetchData();
            } catch (err) {
                toast({ title: "Error", description: "Failed to delete guarantor.", variant: "destructive" });
            }
        }
    };

    const filteredGuarantors = guarantors.filter(g => 
        g.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        g.phone_number?.includes(searchTerm) ||
        g.id_number?.includes(searchTerm)
    );

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 p-8 bg-muted/30">
                        <div className="space-y-6 max-w-7xl mx-auto">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">Guarantors</h2>
                                <p className="text-muted-foreground">
                                    Register and manage official guarantors for loan security.
                                </p>
                            </div>

                            <Tabs
                                value={activeTab}
                                onValueChange={(v) => {
                                    setActiveTab(v);
                                    if (v === "add" && !editingGuarantor) {
                                        const d = loadFormDraft<{ formData: typeof formData }>(DRAFT_KEYS.GUARANTOR_ADD);
                                        if (
                                            d?.formData &&
                                            (d.formData.full_name?.trim() || d.formData.phone_number?.trim())
                                        ) {
                                            suppressDraftSaveRef.current = true;
                                            setFormData(d.formData);
                                            toast({
                                                title: "Draft restored",
                                                description: `Continued from ${formatDraftAge(d._savedAt)}.`,
                                            });
                                            window.setTimeout(() => {
                                                suppressDraftSaveRef.current = false;
                                            }, 600);
                                        } else {
                                            resetForm();
                                        }
                                    }
                                }}
                                className="space-y-4"
                            >
                                <TabsList className="h-11 p-1 bg-muted/50">
                                    <TabsTrigger value="view" className="gap-2">
                                        <Users className="h-4 w-4" /> View Guarantors
                                    </TabsTrigger>
                                    <TabsTrigger value="add" className="gap-2">
                                        <UserPlus className="h-4 w-4" /> Add Guarantor
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="view" className="space-y-4">
                                    <div className="flex justify-end">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search by name, ID, or phone..."
                                                className="pl-10 w-[300px] bg-white border-slate-200"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                                        <CardContent className="p-0">
                                            {loading ? (
                                                <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                                            ) : filteredGuarantors.length === 0 ? (
                                                <div className="p-16 text-center text-slate-400">
                                                    <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                                    <p className="font-medium italic">No guarantors found.</p>
                                                </div>
                                            ) : (
                                                <Table>
                                                    <TableHeader className="bg-slate-50">
                                                        <TableRow>
                                                            <TableHead className="py-4 px-6 font-bold">Guarantor Name</TableHead>
                                                            <TableHead className="py-4 px-6 font-bold">Contact Info</TableHead>
                                                            <TableHead className="py-4 px-6 font-bold">ID / NIN</TableHead>
                                                            <TableHead className="py-4 px-6 font-bold text-right">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {filteredGuarantors.map((guarantor) => (
                                                            <TableRow key={guarantor.id} className="hover:bg-slate-50/50">
                                                                <TableCell className="px-6 font-bold text-slate-800">
                                                                    <div>{guarantor.full_name}</div>
                                                                    <div className="text-[10px] text-muted-foreground font-normal">{guarantor.address}</div>
                                                                </TableCell>
                                                                <TableCell className="px-6">
                                                                    <div className="text-sm font-medium">{guarantor.phone_number}</div>
                                                                    <div className="text-xs text-slate-400">{guarantor.email}</div>
                                                                </TableCell>
                                                                <TableCell className="px-6 font-mono text-xs">{guarantor.id_number || '---'}</TableCell>
                                                                <TableCell className="px-6 text-right">
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                setEditingGuarantor(guarantor);
                                                                                setFormData({
                                                                                    full_name: guarantor.full_name || "",
                                                                                    email: guarantor.email || "",
                                                                                    phone_number: guarantor.phone_number || "",
                                                                                    id_number: guarantor.id_number || "",
                                                                                    address: guarantor.address || ""
                                                                                });
                                                                                setIsAddDialogOpen(true);
                                                                            }}
                                                                            className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                                        >
                                                                            <Edit2 className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleDelete(guarantor.id, guarantor.full_name)}
                                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                                        setIsAddDialogOpen(open);
                                        if (!open) resetForm();
                                    }}>
                                        <DialogContent className="sm:max-w-[500px]">
                                            <DialogHeader>
                                                <DialogTitle>Edit Guarantor</DialogTitle>
                                                <CardDescription>Update the guarantor details.</CardDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_full_name">Full Name *</Label>
                                                    <Input id="edit_full_name" required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit_phone_number">Phone Number</Label>
                                                        <Input id="edit_phone_number" value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit_id_number">ID Number (NIN)</Label>
                                                        <Input id="edit_id_number" value={formData.id_number} onChange={e => setFormData({ ...formData, id_number: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_email">Email Address</Label>
                                                    <Input id="edit_email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_address">Residential Address</Label>
                                                    <Input id="edit_address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                                </div>
                                                <DialogFooter className="pt-4">
                                                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                                    <Button type="submit" className="bg-slate-900 font-bold">Update Guarantor</Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </TabsContent>

                                <TabsContent value="add" className="space-y-4">
                                    <Card className="border-none shadow-xl rounded-2xl max-w-xl">
                                        <CardHeader>
                                            <CardTitle>Register New Guarantor</CardTitle>
                                            <CardDescription>Enter the personal and contact details of the guarantor.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Alert className="mb-4 border-primary/30 bg-muted/40">
                                                <Save className="h-4 w-4" />
                                                <AlertTitle>Draft auto-save</AlertTitle>
                                                <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <span>Progress is saved while you are on this tab.</span>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="shrink-0"
                                                        onClick={() => {
                                                            clearFormDraft(DRAFT_KEYS.GUARANTOR_ADD);
                                                            setFormData(emptyForm);
                                                            toast({ title: "Draft discarded" });
                                                        }}
                                                    >
                                                        Discard draft
                                                    </Button>
                                                </AlertDescription>
                                            </Alert>
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="add_full_name">Full Name *</Label>
                                                    <Input id="add_full_name" required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="add_phone_number">Phone Number</Label>
                                                        <Input id="add_phone_number" value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="add_id_number">ID Number (NIN)</Label>
                                                        <Input id="add_id_number" value={formData.id_number} onChange={e => setFormData({ ...formData, id_number: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="add_email">Email Address</Label>
                                                    <Input id="add_email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="add_address">Residential Address</Label>
                                                    <Input id="add_address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                                </div>
                                                <Button type="submit" className="bg-slate-900 font-bold">
                                                    Register Guarantor
                                                </Button>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
