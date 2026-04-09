import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Save, ArrowLeft } from "lucide-react";
import { clearFormDraft, DRAFT_KEYS, formatDraftAge, loadFormDraft, saveFormDraft } from "@/lib/formDrafts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUserRole } from "@/hooks/useUserRole";

const AddBorrower = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAdmin, isLoanOfficer, userId, loading: roleLoading } = useUserRole();
    const generateUniqueId = () => {
        return `MNT-${Math.floor(100000 + Math.random() * 900000)}`;
    };

    const [isLoading, setIsLoading] = useState(false);
    /** Personal = individual; Business = show business name + full street address + zip */
    const [clientType, setClientType] = useState<"personal" | "business">("personal");
    const [formData, setFormData] = useState({
        first_name: "",
        last_middle_name: "",
        business_name: "",
        unique_number: generateUniqueId(),
        gender: "",
        title: "",
        phone_number: "",
        email: "",
        dob: "",
        /** Business clients only (street-style) */
        address: "",
        city: "",
        province_state: "",
        zipcode: "",
        /** Personal clients: district + village (Uganda-style) */
        district: "",
        village: "",
        landline_phone: "",
        working_status: "",
        credit_score: "500",
        description: "",
        assigned_officer_id: "",
        /** When the client became a borrower (sets DB created_at); defaults to today, can be backdated */
        registered_on: new Date().toISOString().slice(0, 10),
    });

    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        borrower_photo: null,
        borrower_files: null,
    });

    const [staffList, setStaffList] = useState<any[]>([]);

    const draftLoadedRef = useRef(false);
    const suppressDraftSaveRef = useRef(false);

    useEffect(() => {
        if (draftLoadedRef.current) return;
        draftLoadedRef.current = true;
        const d = loadFormDraft<{ formData: typeof formData; clientType?: "personal" | "business" }>(DRAFT_KEYS.ADD_BORROWER);
        if (!d?.formData) return;
        suppressDraftSaveRef.current = true;
        setFormData({
            ...d.formData,
            registered_on: d.formData.registered_on || new Date().toISOString().slice(0, 10),
        });
        if (d.clientType) setClientType(d.clientType);
        toast({
            title: "Draft restored",
            description: `Continued from ${formatDraftAge(d._savedAt)}. File attachments are not saved in drafts.`,
        });
        window.setTimeout(() => {
            suppressDraftSaveRef.current = false;
        }, 600);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- restore once on mount
    }, []);

    useEffect(() => {
        if (suppressDraftSaveRef.current) return;
        const id = window.setTimeout(() => {
            saveFormDraft(DRAFT_KEYS.ADD_BORROWER, { formData, clientType });
        }, 2500);
        return () => clearTimeout(id);
    }, [formData, clientType]);

    useEffect(() => {
        if (roleLoading || !isAdmin) return;
        const loadStaff = async () => {
            try {
                const staff = await api.users.getAll();
                setStaffList(staff);
            } catch (err) {
                console.error("Failed to fetch staff:", err);
            }
        };
        loadStaff();
    }, [isAdmin, roleLoading]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles.length > 0) {
            setFiles(prev => ({ ...prev, [id]: selectedFiles[0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (clientType === "business") {
            if (!formData.business_name?.trim() && !formData.first_name?.trim()) {
                toast({
                    title: "Error",
                    description: "Enter a business name or the borrower’s first name.",
                    variant: "destructive",
                });
                return;
            }
        } else if (!formData.first_name?.trim()) {
            toast({
                title: "Error",
                description: "First name is required for personal borrowers.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            let resolvedOfficerId = "";
            if (isLoanOfficer) {
                const uid = userId || (await api.auth.getMe()).id;
                if (!uid) {
                    toast({
                        title: "Error",
                        description: "Could not resolve your account. Please refresh and try again.",
                        variant: "destructive",
                    });
                    setIsLoading(false);
                    return;
                }
                resolvedOfficerId = typeof uid === "string" ? uid : String(uid);
            }

            let photoUrl: string | null = null;
            if (files.borrower_photo) {
                const up = await api.upload(files.borrower_photo);
                photoUrl = up.url || null;
            }

            let filesUrl: string | null = null;
            if (files.borrower_files) {
                const up = await api.upload(files.borrower_files);
                filesUrl = up.url || null;
            }

            const personalName = `${formData.first_name || ""} ${formData.last_middle_name || ""}`.trim();
            const isBusiness = clientType === "business";

            const addressForDb = isBusiness
                ? (formData.address || "").trim()
                : [formData.village, formData.district].filter(Boolean).join(", ");

            const officerId = isLoanOfficer
                ? resolvedOfficerId
                : formData.assigned_officer_id || "";

            const submissionData = {
                ...formData,
                assigned_officer_id: officerId,
                business_name: isBusiness ? formData.business_name : "",
                address: addressForDb || (isBusiness ? "" : ""),
                city: isBusiness ? formData.city : "",
                province_state: isBusiness ? formData.province_state : "",
                zipcode: isBusiness ? formData.zipcode : "",
                district: isBusiness ? "" : formData.district,
                village: isBusiness ? "" : formData.village,
                full_name: isBusiness
                    ? (personalName || formData.business_name.trim())
                    : personalName,
                unique_number: formData.unique_number || generateUniqueId(),
                borrower_photo: photoUrl,
                borrower_files: filesUrl,
                registered_on: formData.registered_on || undefined,
            };

            const result = await api.borrowers.create(submissionData);

            toast({
                title: "Success",
                description: "Borrower added successfully",
            });

            clearFormDraft(DRAFT_KEYS.ADD_BORROWER);
            navigate(`/staff-dashboard/borrowers/history?id=${result.id}`);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to add borrower",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 p-4 md:p-8 bg-muted/20">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" onClick={() => navigate("/staff-dashboard/borrowers")}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to List
                                </Button>
                                <h1 className="text-3xl font-bold">Add New Borrower</h1>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserPlus className="h-5 w-5 text-primary" />
                                        Borrower Registration Form
                                    </CardTitle>
                                    <CardDescription>
                                        Choose <strong>Personal</strong> or <strong>Business</strong>. Business name and full address (including zip) are only for business clients.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Alert className="mb-6 border-primary/30 bg-muted/40">
                                        <Save className="h-4 w-4" />
                                        <AlertTitle>Draft auto-save</AlertTitle>
                                        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <span>Progress is saved in this browser every few seconds. Files must be re-selected after refresh.</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="shrink-0"
                                                onClick={() => {
                                                    clearFormDraft(DRAFT_KEYS.ADD_BORROWER);
                                                    setClientType("personal");
                                                    setFormData({
                                                        first_name: "",
                                                        last_middle_name: "",
                                                        business_name: "",
                                                        unique_number: generateUniqueId(),
                                                        gender: "",
                                                        title: "",
                                                        phone_number: "",
                                                        email: "",
                                                        dob: "",
                                                        address: "",
                                                        city: "",
                                                        province_state: "",
                                                        zipcode: "",
                                                        district: "",
                                                        village: "",
                                                        landline_phone: "",
                                                        working_status: "",
                                                        credit_score: "500",
                                                        description: "",
                                                        assigned_officer_id: "",
                                                        registered_on: new Date().toISOString().slice(0, 10),
                                                    });
                                                    toast({ title: "Draft discarded" });
                                                }}
                                            >
                                                Discard draft
                                            </Button>
                                        </AlertDescription>
                                    </Alert>
                                    <form onSubmit={handleSubmit} className="space-y-8">

                                        <div className="flex flex-wrap gap-4 items-center p-4 bg-muted/30 rounded-lg">
                                            <span className="text-sm font-medium">Borrower type</span>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant={clientType === "personal" ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setClientType("personal")}
                                                >
                                                    Personal
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={clientType === "business" ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setClientType("business")}
                                                >
                                                    Business
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Section: Personal / Business Names */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted/30 rounded-lg">
                                            <div className="space-y-2">
                                                <Label htmlFor="first_name">First Name</Label>
                                                <Input id="first_name" value={formData.first_name} onChange={handleChange} placeholder="Enter First Name Only" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="last_middle_name">Middle / Last Name</Label>
                                                <Input id="last_middle_name" value={formData.last_middle_name} onChange={handleChange} placeholder="Middle and Last Name" />
                                            </div>
                                            {clientType === "business" && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="business_name">Business Name</Label>
                                                    <Input id="business_name" value={formData.business_name} onChange={handleChange} placeholder="Registered business name" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Section: Unique Info & Gender */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="registered_on">Client registration date</Label>
                                                <Input
                                                    id="registered_on"
                                                    type="date"
                                                    max={new Date().toISOString().slice(0, 10)}
                                                    value={formData.registered_on}
                                                    onChange={handleChange}
                                                    className="max-w-56"
                                                />
                                                <p className="text-[10px] text-muted-foreground">
                                                    Defaults to today. Set a past date when adding historical borrowers (shows as “Borrower since” on the profile).
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="unique_number">Unique Number</Label>
                                                <Input id="unique_number" value={formData.unique_number} onChange={handleChange} placeholder="D001YV0" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="gender">Gender</Label>
                                                <select
                                                    id="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Title</Label>
                                                <select
                                                    id="title"
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Select Title</option>
                                                    <option value="Mr.">Mr.</option>
                                                    <option value="Mrs.">Mrs.</option>
                                                    <option value="Ms.">Ms.</option>
                                                    <option value="Dr.">Dr.</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Section: Contact Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone_number">Mobile (Numbers Only)</Label>
                                                <Input id="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="+256..." />
                                                <p className="text-[10px] text-muted-foreground">No country code, spaces, or characters for SMS compatibility.</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
                                            </div>
                                        </div>

                                        {/* Section: DOB & Address */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="dob">Date of Birth</Label>
                                                <Input id="dob" type="date" value={formData.dob} onChange={handleChange} />
                                            </div>
                                            {clientType === "personal" ? (
                                                <div className="space-y-2 md:col-span-1">
                                                    <p className="text-sm font-medium">Location (District &amp; Village)</p>
                                                    <p className="text-xs text-muted-foreground mb-2">Street address and zip are hidden for personal borrowers.</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="district">District</Label>
                                                            <Input id="district" value={formData.district} onChange={handleChange} placeholder="District" />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="village">Village / Parish</Label>
                                                            <Input id="village" value={formData.village} onChange={handleChange} placeholder="Village or parish" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Label htmlFor="address">Street address</Label>
                                                    <Input id="address" value={formData.address} onChange={handleChange} placeholder="Plot, street, building" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Section: Location Details — business only */}
                                        {clientType === "business" && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="city">City</Label>
                                                    <Input id="city" value={formData.city} onChange={handleChange} placeholder="City" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="province_state">Province / State</Label>
                                                    <Input id="province_state" value={formData.province_state} onChange={handleChange} placeholder="Province or State" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="zipcode">Zip / Postal code</Label>
                                                    <Input id="zipcode" value={formData.zipcode} onChange={handleChange} placeholder="Zipcode" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Section: Financial / Work */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="landline_phone">Landline Phone</Label>
                                                <Input id="landline_phone" value={formData.landline_phone} onChange={handleChange} placeholder="Landline Phone" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="working_status">Working Status</Label>
                                                <select
                                                    id="working_status"
                                                    value={formData.working_status}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Select Status</option>
                                                    <option value="Employed">Employed</option>
                                                    <option value="Self-Employed">Self-Employed</option>
                                                    <option value="Unemployed">Unemployed</option>
                                                    <option value="Student">Student</option>
                                                    <option value="Retired">Retired</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                             <div className="space-y-2">
                                                 <Label htmlFor="credit_score" className="flex items-center justify-between">
                                                     Credit Score
                                                     <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">SYSTEM</span>
                                                 </Label>
                                                 <Input id="credit_score" type="number" value={formData.credit_score} disabled className="bg-muted/50" placeholder="System Generated" />
                                             </div>
                                        </div>

                                        {/* Section: Files & Description */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="borrower_photo">Borrower Photo</Label>
                                                <Input id="borrower_photo" type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
                                                {files.borrower_photo && (
                                                    <p className="text-xs text-muted-foreground">Selected: {files.borrower_photo.name} (uploads on save)</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="borrower_files">Borrower Files</Label>
                                                <Input id="borrower_files" type="file" onChange={handleFileChange} className="cursor-pointer" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description (Optional)</Label>
                                            <textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={3}
                                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Enter borrower description..."
                                            ></textarea>
                                        </div>

                                        {isAdmin && (
                                            <div className="space-y-2">
                                                <Label htmlFor="assigned_officer_id">Assign Loan Officer</Label>
                                                <select
                                                    id="assigned_officer_id"
                                                    value={formData.assigned_officer_id}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Select a Loan Officer (Optional)</option>
                                                    {staffList.map((staff: any) => (
                                                        <option key={staff.id} value={staff.id}>
                                                            {staff.full_name} ({staff.role === 'admin' ? 'Administrator' : 'Loan Officer'})
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Assign a loan officer. They will see this borrower in their dashboard.
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-4 border-t pt-6">
                                            <Button type="button" variant="outline" onClick={() => navigate("/staff-dashboard/borrowers")} disabled={isLoading}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isLoading} className="px-8 shadow-lg">
                                                {isLoading ? "Saving..." : "Save Borrower"}
                                                {!isLoading && <Save className="ml-2 h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default AddBorrower;
