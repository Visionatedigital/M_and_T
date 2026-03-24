import React, { useState, useEffect, useMemo } from "react";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Plus, MapPin, Tablet, Laptop, Car, Monitor, MoreVertical, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AssetManagement = () => {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newAsset, setNewAsset] = useState({
        name: "",
        category: "IT Equipment",
        serial_number: "",
        purchase_date: new Date().toISOString().split('T')[0],
        value: "",
        location: "Main Office",
        status: "Active"
    });

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const data = await api.assets.getAll();
            setAssets(data.map((a: any) => ({
                id: a.id,
                name: a.name,
                category: a.category,
                serial: a.serial_number,
                date: a.purchase_date,
                value: parseFloat(a.value),
                status: a.status,
                location: a.location
            })));
        } catch (err) {
            console.error('Failed to fetch assets:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const handleAddAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.assets.create({
                ...newAsset,
                value: parseFloat(newAsset.value)
            });
            toast({ title: "Asset Added", description: "The asset has been successfully registered." });
            setIsAddDialogOpen(false);
            fetchAssets();
            setNewAsset({
                name: "",
                category: "IT Equipment",
                serial_number: "",
                purchase_date: new Date().toISOString().split('T')[0],
                value: "",
                location: "Main Office",
                status: "Active"
            });
        } catch (err) {
            toast({ title: "Error", description: "Failed to add asset.", variant: "destructive" });
        }
    };

    const getIcon = (cat: string) => {
        if (cat.includes("Vehicle")) return <Car className="h-4 w-4" />;
        if (cat.includes("IT")) return <Laptop className="h-4 w-4" />;
        if (cat.includes("Mobile")) return <Tablet className="h-4 w-4" />;
        return <Package className="h-4 w-4" />;
    };

    const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
    const maintenanceCount = assets.filter(a => a.status === "Maintenance").length;

    const filteredAssets = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return assets;
        return assets.filter(
            (a) =>
                String(a.name || "")
                    .toLowerCase()
                    .includes(q) ||
                String(a.category || "")
                    .toLowerCase()
                    .includes(q) ||
                String(a.serial || "")
                    .toLowerCase()
                    .includes(q) ||
                String(a.location || "")
                    .toLowerCase()
                    .includes(q) ||
                String(a.status || "")
                    .toLowerCase()
                    .includes(q)
        );
    }, [assets, searchTerm]);

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 p-4 md:p-8 bg-muted/20">
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">Asset Management</h1>
                                    <p className="text-muted-foreground font-medium">Track and manage company assets and equipment.</p>
                                </div>
                                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2 shadow-lg bg-primary hover:bg-primary/90 transition-all font-bold px-6">
                                            <Plus className="h-4 w-4" /> Add Asset
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Register New Asset</DialogTitle>
                                            <CardDescription>Enter the details of the new company property.</CardDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleAddAsset} className="space-y-4 pt-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2 col-span-2">
                                                    <Label>Asset Name</Label>
                                                    <Input required placeholder="e.g. Isuzu D-Max" value={newAsset.name} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Category</Label>
                                                    <Select value={newAsset.category} onValueChange={v => setNewAsset({ ...newAsset, category: v })}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Motor Vehicle">Motor Vehicle</SelectItem>
                                                            <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                                                            <SelectItem value="Furniture">Furniture</SelectItem>
                                                            <SelectItem value="Mobile Device">Mobile Device</SelectItem>
                                                            <SelectItem value="Other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Serial Number</Label>
                                                    <Input placeholder="SN-12345" value={newAsset.serial_number} onChange={e => setNewAsset({ ...newAsset, serial_number: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Purchase Date</Label>
                                                    <Input type="date" value={newAsset.purchase_date} onChange={e => setNewAsset({ ...newAsset, purchase_date: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Value (UGX)</Label>
                                                    <Input type="number" required placeholder="0" value={newAsset.value} onChange={e => setNewAsset({ ...newAsset, value: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Location</Label>
                                                    <Input placeholder="e.g. Branch A" value={newAsset.location} onChange={e => setNewAsset({ ...newAsset, location: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Status</Label>
                                                    <Select value={newAsset.status} onValueChange={v => setNewAsset({ ...newAsset, status: v })}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Active">Active</SelectItem>
                                                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                                                            <SelectItem value="Disposed">Disposed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3 pt-4">
                                                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                                <Button type="submit">Register Asset</Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="relative w-full max-w-xl">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                                <Input
                                    type="search"
                                    placeholder="Search by name, serial, category, location, or status…"
                                    className="pl-9 h-10 w-full bg-background border-slate-200 shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    aria-label="Search assets"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="bg-blue-50 border-blue-200 shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-blue-700">Total Assets</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-black text-blue-900">{assets.length}</div>
                                        <p className="text-xs text-blue-600/70 mt-1 font-medium">Items registered in inventory</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-emerald-50 border-emerald-200 shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-emerald-700">Total Book Value</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-black text-emerald-900">UGX {totalValue.toLocaleString()}</div>
                                        <p className="text-xs text-emerald-600/70 mt-1 font-medium">Estimated asset worth</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-amber-50 border-amber-200 shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-amber-700">In Maintenance</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-black text-amber-900">{maintenanceCount}</div>
                                        <p className="text-xs text-amber-600/70 mt-1 font-medium">Assets currently unavailable</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="shadow-sm border-muted">
                                <CardHeader className="pb-3 border-b bg-muted/10">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" />
                                        Asset Register
                                    </CardTitle>
                                    <CardDescription>
                                        {searchTerm.trim()
                                            ? `Showing ${filteredAssets.length} of ${assets.length} assets`
                                            : `${assets.length} asset${assets.length === 1 ? "" : "s"} in the register`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="rounded-md overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-muted/30">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="font-bold text-xs uppercase text-slate-500">Asset Name</TableHead>
                                                    <TableHead className="font-bold text-xs uppercase text-slate-500">Category</TableHead>
                                                    <TableHead className="font-bold text-xs uppercase text-slate-500">Serial Number</TableHead>
                                                    <TableHead className="font-bold text-xs uppercase text-slate-500">Value (UGX)</TableHead>
                                                    <TableHead className="font-bold text-xs uppercase text-slate-500">Location</TableHead>
                                                    <TableHead className="font-bold text-xs uppercase text-slate-500">Status</TableHead>
                                                    <TableHead className="text-right font-bold text-xs uppercase text-slate-500">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {assets.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                                                            No assets registered in the registry.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : filteredAssets.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                                                            No assets match &quot;{searchTerm.trim()}&quot;. Try a different search.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredAssets.map((asset) => (
                                                        <TableRow key={asset.id} className="hover:bg-slate-50 transition-colors group">
                                                            <TableCell>
                                                                <div className="font-bold text-slate-900">{asset.name}</div>
                                                                <div className="text-[10px] text-slate-400 mt-0.5">Purchased: {new Date(asset.date).toLocaleDateString()}</div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2 text-slate-600">
                                                                    <div className="p-1.5 bg-slate-100 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all">
                                                                        {getIcon(asset.category)}
                                                                    </div>
                                                                    <span className="text-sm">{asset.category}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs text-slate-500">{asset.serial}</TableCell>
                                                            <TableCell className="font-bold text-slate-800">{asset.value.toLocaleString()}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                                    <MapPin className="h-3 w-3 text-slate-400" />
                                                                    {asset.location}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={`
                                                                    px-2 py-0.5 rounded-full text-[10px] font-bold border-none
                                                                    ${asset.status === 'Active' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' :
                                                                        asset.status === 'Maintenance' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                                                                            'bg-slate-100 text-slate-800'}
                                                                `}>
                                                                    {asset.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-40 group-hover:opacity-100 transition-opacity">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
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
                </div>
            </div>
        </SidebarProvider>
    );
};

export default AssetManagement;
