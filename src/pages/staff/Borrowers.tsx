import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase, isSupabaseOffline } from "@/integrations/supabase/client";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, User, Search, Plus, Eye, Phone, Mail, MapPin, UserPlus, FileText, DollarSign, Filter } from "lucide-react";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

interface Borrower {
    id: string;
    full_name: string;
    business_name?: string;
    unique_number?: string;
    email?: string;
    phone_number?: string;
    created_at: string;
    total_loans: number;
    active_loans: number;
    total_borrowed: number;
    total_paid: number;
    open_loans_balance: number;
    status: string;
    // other optional fields for completeness
    group_id?: string | null;
    /** True when Borrower List is in "group totals" mode (aggregated groups) */
    is_group?: boolean;
    district?: string;
    latitude?: number;
    longitude?: number;
    credit_score?: number;
    village?: string;
    borrower_photo?: string | null;
}

const getScoreColor = (score: number) => {
    if (score >= 750) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 650) return "bg-blue-100 text-blue-800 border-blue-200";
    if (score >= 500) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
};

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Borrowers = () => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [borrowers, setBorrowers] = useState<Borrower[]>([]);
    const [filteredBorrowers, setFilteredBorrowers] = useState<Borrower[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    /** Separate search for "Find My Borrower" tab */
    const [findSearchTerm, setFindSearchTerm] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isGroupView, setIsGroupView] = useState(false);
    const [editLocationDialogOpen, setEditLocationDialogOpen] = useState(false);
    const [selectedBorrowerForLocation, setSelectedBorrowerForLocation] = useState<Borrower | null>(null);
    const [locationForm, setLocationForm] = useState({
        district: "",
        county: "",
        sub_county: "",
        parish: "",
        village: "",
        latitude: "",
        longitude: "",
    });
    const navigate = useNavigate();
    const { toast } = useToast();
    const [borrowerForm, setBorrowerForm] = useState({
        full_name: "",
        email: "",
        phone_number: "",
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        loadBorrowers();
    }, [isGroupView]);

    useEffect(() => {
        filterBorrowers();
    }, [borrowers, searchTerm, location.pathname]);

    const checkAuth = async () => {
        try {
            const user = await api.auth.getMe();
            if (user) {
                loadBorrowers();
                return;
            }
            navigate("/staff-login");
        } catch (error) {
            console.error("Auth check failed:", error);
            navigate("/staff-login");
        }
    };

    const loadBorrowers = async () => {
        try {
            const data = await api.borrowers.getAll(isGroupView);
            setBorrowers(data || []);
        } catch (error: any) {
            console.error("Load borrowers error:", error);
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBorrowerSubmit = async () => {
        try {
            if (!borrowerForm.full_name || !borrowerForm.email) {
                toast({ title: "Error", description: "Full name and email are required", variant: "destructive" });
                return;
            }

            const data = {
                full_name: borrowerForm.full_name,
                email: borrowerForm.email,
                phone_number: borrowerForm.phone_number,
            };

            if (isSupabaseOffline) {
                await api.borrowers.create(data);
            } else {
                const { error } = await supabase.auth.admin.createUser({
                    email: borrowerForm.email,
                    email_confirm: true,
                    user_metadata: { full_name: borrowerForm.full_name, phone_number: borrowerForm.phone_number }
                });
                if (error && error.message !== "User already registered") throw error;
            }

            toast({ title: "Success", description: "Borrower created successfully" });
            setIsDialogOpen(false);
            loadBorrowers();
            setBorrowerForm({ full_name: "", email: "", phone_number: "" });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const filterBorrowers = () => {
        let filtered = borrowers;

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (b) =>
                    (b.full_name?.toLowerCase() || "").includes(lowerSearchTerm) ||
                    (b.business_name?.toLowerCase() || "").includes(lowerSearchTerm) ||
                    (b.unique_number?.toLowerCase() || "").includes(lowerSearchTerm) ||
                    (b.email?.toLowerCase() || "").includes(lowerSearchTerm) ||
                    (b.phone_number && b.phone_number.includes(searchTerm))
            );
        }

        setFilteredBorrowers(filtered);
    };

    const findMatches = useMemo(() => {
        const q = findSearchTerm.trim().toLowerCase();
        if (!q) return borrowers;
        return borrowers.filter(
            (b) =>
                (b.full_name?.toLowerCase() || "").includes(q) ||
                (b.business_name?.toLowerCase() || "").includes(q) ||
                (b.unique_number?.toLowerCase() || "").includes(q) ||
                (b.email?.toLowerCase() || "").includes(q) ||
                (b.phone_number || "").replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
                (b.district?.toLowerCase() || "").includes(q) ||
                (b.village?.toLowerCase() || "").includes(q)
        );
    }, [borrowers, findSearchTerm]);

    const handleEditLocation = async (borrower: Borrower) => {
        setSelectedBorrowerForLocation(borrower);
        setLocationForm({
            district: borrower.district || "",
            county: "",
            sub_county: "",
            parish: "",
            village: borrower.village || "",
            latitude: borrower.latitude?.toString() || "",
            longitude: borrower.longitude?.toString() || "",
        });
        setEditLocationDialogOpen(true);
    };

    const handleSaveLocation = async () => {
        if (!selectedBorrowerForLocation) return;

        try {
            await api.borrowers.updateLocation(selectedBorrowerForLocation.id, {
                district: locationForm.district || null,
                county: locationForm.county || null,
                sub_county: locationForm.sub_county || null,
                parish: locationForm.parish || null,
                village: locationForm.village || null,
                latitude: locationForm.latitude ? parseFloat(locationForm.latitude) : null,
                longitude: locationForm.longitude ? parseFloat(locationForm.longitude) : null,
            });

            toast({
                title: "Success",
                description: "Borrower location updated successfully",
            });

            setEditLocationDialogOpen(false);
            loadBorrowers();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 p-4 md:p-8 bg-gradient-to-b from-background to-muted/20">
                        <div className="w-full max-w-full space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">Borrowers</h1>
                                    <p className="text-muted-foreground">Manage branch borrowers and their loan performance</p>
                                </div>
                            </div>

                            <Tabs defaultValue="list" className="space-y-4">
                                <TabsList>
                                    <TabsTrigger value="list">Borrower List</TabsTrigger>
                                    <TabsTrigger value="find">Find My Borrower</TabsTrigger>
                                    <TabsTrigger value="map">Borrower Locations</TabsTrigger>
                                </TabsList>

                                <TabsContent value="list" className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle>Borrower List</CardTitle>
                                                    <CardDescription>View and manage all borrowers</CardDescription>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Label htmlFor="view-mode">Show Group Totals</Label>
                                                    <Switch
                                                        id="view-mode"
                                                        checked={isGroupView}
                                                        onCheckedChange={setIsGroupView}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Search borrowers..."
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            className="pl-8 w-64"
                                                        />
                                                    </div>
                                                    <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className="gap-2">
                                                        <Filter className="h-4 w-4" /> Advanced Filter
                                                    </Button>
                                                </div>
                                            </div>
                                            {showAdvanced && (
                                                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                        <div>
                                                            <label className="text-xs text-muted-foreground mb-1 block">Borrower Status</label>
                                                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                                                <option value="">Any Status</option>
                                                                <option value="Current">Current</option>
                                                                <option value="Past Maturity">Past Maturity</option>
                                                                <option value="Fully Paid">Fully Paid</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-muted-foreground mb-1 block">Assigned Officer</label>
                                                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                                                <option value="">Any Officer</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-muted-foreground mb-1 block">Location / Village</label>
                                                            <Input placeholder="Village" />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <div className="flex-1">
                                                                <label className="text-xs text-muted-foreground mb-1 block">Added From</label>
                                                                <Input type="date" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <label className="text-xs text-muted-foreground mb-1 block">Added To</label>
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
                                        <CardContent className="overflow-x-auto">
                                            <Table className="w-full text-sm">
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-10 py-2">View</TableHead>
                                                        <TableHead className="py-2">Full Name</TableHead>
                                                        <TableHead className="py-2">Business</TableHead>
                                                        <TableHead className="py-2">Unique#</TableHead>
                                                        <TableHead className="py-2">Mobile</TableHead>
                                                        <TableHead className="py-2">Email</TableHead>
                                                        <TableHead className="text-right py-2">Paid</TableHead>
                                                        <TableHead className="text-right py-2">Balance</TableHead>
                                                        <TableHead className="py-2">Status</TableHead>
                                                        <TableHead className="text-right py-2">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredBorrowers.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                                                No borrowers found
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        filteredBorrowers.map((borrower) => (
                                                            <TableRow key={borrower.id}>
                                                                <TableCell className="py-2">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 shrink-0"
                                                                        onClick={() => navigate(`/staff-dashboard/borrowers/history?id=${borrower.id}`)}
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </TableCell>
                                                                <TableCell className="font-medium py-2">
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <div className="h-8 w-8 rounded-full bg-muted overflow-hidden shrink-0 flex items-center justify-center border border-border">
                                                                            {resolveMediaUrl(borrower.borrower_photo) ? (
                                                                                <img src={resolveMediaUrl(borrower.borrower_photo)!} alt="" className="h-full w-full object-cover" />
                                                                            ) : (
                                                                                <User className="h-4 w-4 text-muted-foreground" />
                                                                            )}
                                                                        </div>
                                                                        <span className="block truncate max-w-[120px]" title={borrower.full_name}>{borrower.full_name}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="py-2"><span className="block truncate max-w-[90px]" title={borrower.business_name || undefined}>{borrower.business_name || "-"}</span></TableCell>
                                                                <TableCell className="py-2">{borrower.unique_number || "-"}</TableCell>
                                                                <TableCell className="py-2"><span className="block truncate max-w-[90px]" title={borrower.phone_number || undefined}>{borrower.phone_number || "-"}</span></TableCell>
                                                                <TableCell className="py-2"><span className="block truncate max-w-[100px]" title={borrower.email || undefined}>{borrower.email || "-"}</span></TableCell>
                                                                <TableCell className="text-right py-2 whitespace-nowrap">{(borrower.total_paid || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                                                                <TableCell className="text-right py-2 whitespace-nowrap">{(borrower.open_loans_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                                                                <TableCell className="py-2">
                                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${borrower.status === 'Current' ? 'bg-green-100 text-green-800' :
                                                                        borrower.status === 'Fully Paid' ? 'bg-blue-100 text-blue-800' :
                                                                            borrower.status === 'Past Maturity' ? 'bg-red-100 text-red-800' :
                                                                                'bg-gray-100 text-gray-800'
                                                                        }`}>
                                                                        {borrower.status || "No Active Loans"}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="text-right shrink-0">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-xs h-8"
                                                                        onClick={() => navigate(`/staff-dashboard/loans/add?borrower=${borrower.id}`)}
                                                                    >
                                                                        Loans
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="find" className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Find My Borrower</CardTitle>
                                            <CardDescription>
                                                Search clients in your portfolio by name, phone, email, ID, or location. Loan officers only see borrowers assigned to them; admins see everyone.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="relative w-full max-w-xl">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                                                <Input
                                                    type="search"
                                                    placeholder="Type to search — name, phone, email, unique #, district, village…"
                                                    className="pl-9 h-11"
                                                    value={findSearchTerm}
                                                    onChange={(e) => setFindSearchTerm(e.target.value)}
                                                    aria-label="Find borrower"
                                                />
                                            </div>
                                            {borrowers.length === 0 ? (
                                                <div className="rounded-lg border border-dashed bg-muted/30 p-10 text-center text-muted-foreground">
                                                    <p className="font-medium text-foreground">No borrowers yet</p>
                                                    <p className="text-sm mt-2">Add borrowers from the Borrower List tab or create loan applications that link to clients.</p>
                                                </div>
                                            ) : findMatches.length === 0 ? (
                                                <div className="rounded-lg border border-dashed bg-muted/30 p-10 text-center text-muted-foreground">
                                                    <p className="font-medium text-foreground">No matches</p>
                                                    <p className="text-sm mt-2">Nothing matches &quot;{findSearchTerm.trim()}&quot;. Try another name, phone number, or area.</p>
                                                </div>
                                            ) : (
                                                <div className="rounded-md border divide-y max-h-[min(70vh,520px)] overflow-y-auto">
                                                    {findMatches.map((b) => (
                                                        <div
                                                            key={b.id}
                                                            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/40 transition-colors"
                                                        >
                                                            <div className="min-w-0 space-y-1 flex gap-3 sm:items-start">
                                                                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden shrink-0 flex items-center justify-center border border-border">
                                                                    {resolveMediaUrl(b.borrower_photo) ? (
                                                                        <img src={resolveMediaUrl(b.borrower_photo)!} alt="" className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        <User className="h-5 w-5 text-muted-foreground" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 flex-1 space-y-1">
                                                                <div className="font-semibold text-foreground truncate">{b.full_name}</div>
                                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                                    {b.phone_number && (
                                                                        <a href={`tel:${b.phone_number}`} className="text-primary hover:underline inline-flex items-center gap-1">
                                                                            <Phone className="h-3.5 w-3.5 shrink-0" />
                                                                            {b.phone_number}
                                                                        </a>
                                                                    )}
                                                                    {b.email && (
                                                                        <span className="inline-flex items-center gap-1 truncate max-w-[200px]" title={b.email}>
                                                                            <Mail className="h-3.5 w-3.5 shrink-0" />
                                                                            {b.email}
                                                                        </span>
                                                                    )}
                                                                    {b.unique_number && <span>ID: {b.unique_number}</span>}
                                                                </div>
                                                                {(b.business_name || b.district || b.village) && (
                                                                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3">
                                                                        {b.business_name && <span>{b.business_name}</span>}
                                                                        {(b.district || b.village) && (
                                                                            <span className="inline-flex items-center gap-1">
                                                                                <MapPin className="h-3 w-3" />
                                                                                {[b.village, b.district].filter(Boolean).join(", ")}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <div className="text-xs pt-1">
                                                                    <span className="text-muted-foreground">Balance: </span>
                                                                    <span className="font-medium">{(b.open_loans_balance || 0).toLocaleString()} UGX</span>
                                                                    <span className="text-muted-foreground mx-2">·</span>
                                                                    <span className="text-muted-foreground">Status: </span>
                                                                    <span>{b.status || "—"}</span>
                                                                </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 shrink-0">
                                                                <Button
                                                                    size="sm"
                                                                    variant="default"
                                                                    onClick={() => navigate(`/staff-dashboard/borrowers/history?id=${b.id}`)}
                                                                >
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => navigate(`/staff-dashboard/loans/add?borrower=${b.id}`)}
                                                                >
                                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                                    Loans
                                                                </Button>
                                                                {!b.is_group && (
                                                                    <Button size="sm" variant="outline" onClick={() => handleEditLocation(b)}>
                                                                        <MapPin className="h-4 w-4 mr-1" />
                                                                        Set location
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {borrowers.length > 0 && (
                                                <p className="text-xs text-muted-foreground">
                                                    Showing {findMatches.length} of {borrowers.length} borrower{borrowers.length === 1 ? "" : "s"}
                                                    {findSearchTerm.trim() ? " matching your search" : ""}.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="map" className="h-[600px]">
                                    <Card className="h-full">
                                        <CardHeader>
                                            <CardTitle>Borrower Locations</CardTitle>
                                            <CardDescription>
                                                Pins appear when a borrower has GPS saved (latitude & longitude). Use <strong>Find My Borrower</strong> → <strong>Set location</strong> to add coordinates.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="h-[500px] p-0 overflow-hidden rounded-b-lg relative">
                                            {borrowers.filter((b) => b.latitude != null && b.longitude != null && !Number.isNaN(Number(b.latitude)) && !Number.isNaN(Number(b.longitude))).length === 0 && (
                                                <div className="absolute inset-0 z-[500] flex items-center justify-center p-4 bg-background/85">
                                                    <div className="bg-card border rounded-lg shadow-lg p-6 max-w-md text-center space-y-2">
                                                        <MapPin className="h-10 w-10 mx-auto text-muted-foreground" />
                                                        <p className="font-semibold">No map pins yet</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Open <strong>Find My Borrower</strong>, choose a client, and tap <strong>Set location</strong> to enter latitude and longitude (you can copy from Google Maps). Village and district alone do not place a pin.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <MapContainer center={[0.3476, 32.5825]} zoom={8} style={{ height: '100%', width: '100%' }}>
                                                <TileLayer
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                {borrowers
                                                    .filter((b) => b.latitude != null && b.longitude != null)
                                                    .map((b) => (
                                                        <Marker key={b.id} position={[Number(b.latitude), Number(b.longitude)]}>
                                                            <Popup>
                                                                <div className="p-2">
                                                                    <h3 className="font-bold">{b.full_name}</h3>
                                                                    <p className="text-sm text-muted-foreground">{b.village}, {b.district}</p>
                                                                    <p className="text-sm mt-1">Active Loans: {b.active_loans}</p>
                                                                    <Button
                                                                        size="sm"
                                                                        className="mt-2"
                                                                        onClick={() => navigate(`/staff-dashboard/borrowers/history?id=${b.id}`)}
                                                                    >
                                                                        View Profile
                                                                    </Button>
                                                                </div>
                                                            </Popup>
                                                        </Marker>
                                                    ))}
                                            </MapContainer>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </main>
                </div>
            </div>

            {/* Edit Location Dialog */}
            <Dialog open={editLocationDialogOpen} onOpenChange={setEditLocationDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Borrower Location</DialogTitle>
                        <DialogDescription>
                            Update location information for {selectedBorrowerForLocation?.full_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="district">District *</Label>
                                <Input
                                    id="district"
                                    placeholder="Enter district"
                                    value={locationForm.district}
                                    onChange={(e) => setLocationForm({ ...locationForm, district: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="county">County</Label>
                                <Input
                                    id="county"
                                    placeholder="Enter county"
                                    value={locationForm.county}
                                    onChange={(e) => setLocationForm({ ...locationForm, county: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sub_county">Sub-County</Label>
                                <Input
                                    id="sub_county"
                                    placeholder="Enter sub-county"
                                    value={locationForm.sub_county}
                                    onChange={(e) => setLocationForm({ ...locationForm, sub_county: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parish">Parish</Label>
                                <Input
                                    id="parish"
                                    placeholder="Enter parish"
                                    value={locationForm.parish}
                                    onChange={(e) => setLocationForm({ ...locationForm, parish: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="village">Village *</Label>
                            <Input
                                id="village"
                                placeholder="Enter village"
                                value={locationForm.village}
                                onChange={(e) => setLocationForm({ ...locationForm, village: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude (GPS)</Label>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="any"
                                    placeholder="e.g., 0.3476"
                                    value={locationForm.latitude}
                                    onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude (GPS)</Label>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="any"
                                    placeholder="e.g., 32.5825"
                                    value={locationForm.longitude}
                                    onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                            <p>* Required fields. GPS coordinates are optional but helpful for mapping.</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setEditLocationDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveLocation}
                            disabled={!locationForm.district || !locationForm.village}
                        >
                            Save Location
                        </Button>
                    </div>
                </DialogContent>
            </Dialog >
        </SidebarProvider >
    );
};

export default Borrowers;
