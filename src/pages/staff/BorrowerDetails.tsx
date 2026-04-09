import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Phone, Mail, MapPin, TrendingUp, Pencil, Save, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { useUserRole } from "@/hooks/useUserRole";

interface BorrowerDetails {
    id: string;
    full_name: string;
    first_name?: string | null;
    last_middle_name?: string | null;
    email: string;
    phone_number: string;
    address?: string | null;
    photo_url?: string;
    borrower_photo?: string | null;
    borrower_files?: string[] | null;
    business_name?: string | null;
    unique_number?: string | null;
    country?: string | null;
    id_number?: string | null;
    credit_score: number;
    district?: string;
    village?: string;
    city?: string | null;
    province_state?: string | null;
    zipcode?: string | null;
    landline_phone?: string | null;
    gender?: string | null;
    title?: string | null;
    working_status?: string | null;
    description?: string | null;
    date_of_birth?: string | null;
    assigned_officer_id?: string | null;
    total_loans: number;
    active_loans: number;
    total_borrowed: number;
    total_repaid: number;
    created_at: string;
}

type ClientType = "personal" | "business";

type EditDraft = {
    first_name: string;
    last_middle_name: string;
    business_name: string;
    unique_number: string;
    gender: string;
    title: string;
    email: string;
    phone_number: string;
    landline_phone: string;
    dob: string;
    district: string;
    village: string;
    address: string;
    city: string;
    province_state: string;
    zipcode: string;
    country: string;
    id_number: string;
    working_status: string;
    description: string;
    credit_score: string;
    assigned_officer_id: string;
    /** Maps to borrower.created_at ("Borrower since") */
    registered_on: string;
};

function splitFullName(full: string) {
    const parts = (full || "").trim().split(/\s+/);
    if (parts.length === 0) return { first: "", rest: "" };
    return { first: parts[0], rest: parts.slice(1).join(" ") };
}

/** Local calendar YYYY-MM-DD — matches `type="date"` and server `todayYyyyMmDdLocal()`. */
function localTodayYyyyMmDd() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function emptyDraft(): EditDraft {
    return {
        first_name: "",
        last_middle_name: "",
        business_name: "",
        unique_number: "",
        gender: "",
        title: "",
        email: "",
        phone_number: "",
        landline_phone: "",
        dob: "",
        district: "",
        village: "",
        address: "",
        city: "",
        province_state: "",
        zipcode: "",
        country: "Uganda",
        id_number: "",
        working_status: "",
        description: "",
        credit_score: "500",
        assigned_officer_id: "",
        registered_on: "",
    };
}

const BorrowerDetails = () => {
    const [searchParams] = useSearchParams();
    const borrowerId = searchParams.get("id");
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAdmin, isLoanOfficer, loading: roleLoading } = useUserRole();
    const [borrower, setBorrower] = useState<BorrowerDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [draft, setDraft] = useState<EditDraft>(emptyDraft());
    const [clientType, setClientType] = useState<ClientType>("personal");
    const [staffList, setStaffList] = useState<{ id: string; full_name: string; role: string }[]>([]);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [docsFile, setDocsFile] = useState<File | null>(null);

    useEffect(() => {
        if (!photoFile) {
            setPhotoPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(photoFile);
        setPhotoPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [photoFile]);

    const loadBorrowerDetails = useCallback(async (id: string) => {
        try {
            const data = await api.borrowers.get(id);
            setBorrower({
                ...data,
                credit_score: data.credit_score ?? 300,
                total_repaid: data.total_repaid ?? data.total_paid ?? 0,
            } as BorrowerDetails);
        } catch {
            toast({
                title: "Error",
                description: "Failed to load borrower details",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (borrowerId) loadBorrowerDetails(borrowerId);
        else {
            toast({ title: "Error", description: "No borrower selected", variant: "destructive" });
            navigate("/staff-dashboard/borrowers");
        }
    }, [borrowerId, navigate, toast, loadBorrowerDetails]);

    useEffect(() => {
        if (!isAdmin) return;
        (async () => {
            try {
                const staff = await api.users.getAll();
                setStaffList(staff);
            } catch {
                setStaffList([]);
            }
        })();
    }, [isAdmin]);

    const beginEdit = () => {
        if (!borrower) return;
        const { first, rest } = splitFullName(borrower.full_name || "");
        const isBiz = !!(borrower.business_name && String(borrower.business_name).trim());
        setClientType(isBiz ? "business" : "personal");
        setDraft({
            first_name: borrower.first_name || first,
            last_middle_name: borrower.last_middle_name || rest,
            business_name: borrower.business_name || "",
            unique_number: borrower.unique_number || "",
            gender: borrower.gender || "",
            title: borrower.title || "",
            email: borrower.email || "",
            phone_number: borrower.phone_number || "",
            landline_phone: borrower.landline_phone || "",
            dob: borrower.date_of_birth ? String(borrower.date_of_birth).slice(0, 10) : "",
            district: borrower.district || "",
            village: borrower.village || "",
            address: borrower.address || "",
            city: borrower.city || "",
            province_state: borrower.province_state || "",
            zipcode: borrower.zipcode || "",
            country: borrower.country || "Uganda",
            id_number: borrower.id_number || "",
            working_status: borrower.working_status || "",
            description: borrower.description || "",
            credit_score: String(borrower.credit_score ?? 500),
            assigned_officer_id: borrower.assigned_officer_id || "",
            registered_on: borrower.created_at ? String(borrower.created_at).slice(0, 10) : "",
        });
        setPhotoFile(null);
        setDocsFile(null);
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setDraft(emptyDraft());
        setPhotoFile(null);
        setDocsFile(null);
    };

    const saveEdit = async () => {
        if (!borrowerId || !borrower) return;
        const personalName = `${draft.first_name} ${draft.last_middle_name}`.trim();
        if (clientType === "business") {
            if (!draft.business_name?.trim() && !draft.first_name?.trim()) {
                toast({ title: "Validation", description: "Enter a business name or first name.", variant: "destructive" });
                return;
            }
        } else if (!draft.first_name?.trim()) {
            toast({ title: "Validation", description: "First name is required.", variant: "destructive" });
            return;
        }

        const regTrim = draft.registered_on?.trim();
        if (regTrim && regTrim > localTodayYyyyMmDd()) {
            toast({
                title: "Invalid registration date",
                description: "Borrower since cannot be in the future. Choose today or an earlier date.",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);
        try {
            let photoUrl: string | undefined = borrower.borrower_photo || undefined;
            if (photoFile) {
                const up = await api.upload(photoFile);
                photoUrl = up.url || undefined;
            }
            let filesPayload: string | string[] | undefined;
            if (docsFile) {
                const up = await api.upload(docsFile);
                const url = up.url;
                if (url) {
                    const prev = Array.isArray(borrower.borrower_files) ? borrower.borrower_files : [];
                    filesPayload = [...prev.filter(Boolean), url];
                }
            }

            const isBusiness = clientType === "business";
            const addressForDb = isBusiness
                ? (draft.address || "").trim()
                : [draft.village, draft.district].filter(Boolean).join(", ");

            const full_name = isBusiness
                ? (personalName || draft.business_name.trim())
                : personalName;

            const payload: Record<string, unknown> = {
                full_name,
                first_name: draft.first_name.trim() || null,
                last_middle_name: draft.last_middle_name.trim() || null,
                business_name: isBusiness ? draft.business_name.trim() || null : null,
                unique_number: draft.unique_number.trim() || null,
                email: draft.email.trim(),
                phone_number: draft.phone_number.trim(),
                landline_phone: draft.landline_phone.trim() || null,
                gender: draft.gender || null,
                title: draft.title || null,
                country: draft.country.trim() || "Uganda",
                id_number: draft.id_number.trim() || null,
                working_status: draft.working_status || null,
                description: draft.description.trim() || null,
                date_of_birth: draft.dob || null,
                district: isBusiness ? null : draft.district.trim() || null,
                village: isBusiness ? null : draft.village.trim() || null,
                address: addressForDb || null,
                city: isBusiness ? draft.city.trim() || null : null,
                province_state: isBusiness ? draft.province_state.trim() || null : null,
                zipcode: isBusiness ? draft.zipcode.trim() || null : null,
            };

            if (photoUrl !== undefined) payload.borrower_photo = photoUrl;
            if (filesPayload !== undefined) payload.borrower_files = filesPayload;

            if (isAdmin) {
                payload.credit_score = draft.credit_score ? Number(draft.credit_score) : null;
                payload.assigned_officer_id = draft.assigned_officer_id || null;
            }

            if (regTrim) payload.registered_on = regTrim;

            await api.borrowers.update(borrowerId, payload);
            toast({ title: "Saved", description: "Borrower details updated." });
            cancelEdit();
            setIsLoading(true);
            await loadBorrowerDetails(borrowerId);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Update failed";
            toast({ title: "Could not save", description: msg, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const canEdit = !roleLoading && (isAdmin || isLoanOfficer);

    const getScoreColor = (score: number) => {
        if (score >= 750) return "text-green-600";
        if (score >= 650) return "text-blue-600";
        if (score >= 500) return "text-orange-600";
        return "text-red-600";
    };

    const getScoreBadge = (score: number) => {
        if (score >= 750) return "Excellent";
        if (score >= 650) return "Good";
        if (score >= 500) return "Fair";
        return "Poor";
    };

    const selectClass =
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (!borrower) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-muted-foreground">Borrower not found</p>
                    <Button variant="link" onClick={() => navigate("/staff-dashboard/borrowers")}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const photoSrc = resolveMediaUrl(borrower.borrower_photo || borrower.photo_url);

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 overflow-x-hidden p-3 sm:p-4 md:p-8 bg-muted/20">
                        <div className="max-w-5xl mx-auto min-w-0 space-y-6">
                            <Button variant="ghost" className="mb-4 max-w-full" onClick={() => navigate("/staff-dashboard/borrowers")}>
                                <ArrowLeft className="mr-2 h-4 w-4 shrink-0" /> Back to Borrowers
                            </Button>

                            <div className="grid gap-6 md:grid-cols-3 min-w-0">
                                <Card className="md:col-span-2 min-w-0 overflow-hidden">
                                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start">
                                            <div className="relative shrink-0">
                                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-muted">
                                                    {isEditing && photoPreviewUrl ? (
                                                        <img src={photoPreviewUrl} alt="" className="h-full w-full object-cover" />
                                                    ) : photoSrc ? (
                                                        <img src={photoSrc} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <User className="h-10 w-10 text-primary" />
                                                    )}
                                                </div>
                                                {isEditing && (
                                                    <label className="mt-2 flex items-center gap-1 text-xs text-primary cursor-pointer">
                                                        <Upload className="h-3 w-3" />
                                                        <span>Change photo</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="sr-only"
                                                            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1 w-full">
                                                {isEditing ? (
                                                    <div className="space-y-3">
                                                        <div className="flex flex-wrap gap-2 w-full">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant={clientType === "personal" ? "default" : "outline"}
                                                                className="touch-manipulation"
                                                                onClick={() => setClientType("personal")}
                                                            >
                                                                Personal
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant={clientType === "business" ? "default" : "outline"}
                                                                className="touch-manipulation"
                                                                onClick={() => setClientType("business")}
                                                            >
                                                                Business
                                                            </Button>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            <div>
                                                                <Label htmlFor="bd-first">First name</Label>
                                                                <Input
                                                                    id="bd-first"
                                                                    value={draft.first_name}
                                                                    onChange={(e) => setDraft((d) => ({ ...d, first_name: e.target.value }))}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="bd-last">Middle / last name</Label>
                                                                <Input
                                                                    id="bd-last"
                                                                    value={draft.last_middle_name}
                                                                    onChange={(e) => setDraft((d) => ({ ...d, last_middle_name: e.target.value }))}
                                                                />
                                                            </div>
                                                            {clientType === "business" && (
                                                                <div className="sm:col-span-2">
                                                                    <Label htmlFor="bd-biz">Business name</Label>
                                                                    <Input
                                                                        id="bd-biz"
                                                                        value={draft.business_name}
                                                                        onChange={(e) => setDraft((d) => ({ ...d, business_name: e.target.value }))}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <CardTitle className="text-2xl">{borrower.full_name}</CardTitle>
                                                        {borrower.business_name ? (
                                                            <p className="text-sm text-muted-foreground font-medium">{borrower.business_name}</p>
                                                        ) : null}
                                                    </>
                                                )}
                                                {isEditing ? (
                                                    <div className="mt-2 space-y-1.5 max-w-xs">
                                                        <Label htmlFor="bd-borrower-since" className="text-xs font-normal text-muted-foreground">
                                                            Borrower since
                                                        </Label>
                                                        <Input
                                                            id="bd-borrower-since"
                                                            type="date"
                                                            max={localTodayYyyyMmDd()}
                                                            value={draft.registered_on}
                                                            onChange={(e) => setDraft((d) => ({ ...d, registered_on: e.target.value }))}
                                                            className="h-9"
                                                        />
                                                        <p className="text-[10px] text-muted-foreground leading-snug">
                                                            When this client became a borrower (saved with Save). Past dates allowed for historical records.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <CardDescription>
                                                        Borrower since {new Date(borrower.created_at).toLocaleDateString()}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                        {canEdit && (
                                            <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto sm:justify-end">
                                                {isEditing ? (
                                                    <>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="min-h-9 flex-1 sm:flex-initial touch-manipulation"
                                                            onClick={cancelEdit}
                                                            disabled={saving}
                                                        >
                                                            <X className="h-4 w-4 mr-1 shrink-0" /> Cancel
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            className="min-h-9 flex-1 sm:flex-initial touch-manipulation"
                                                            onClick={saveEdit}
                                                            disabled={saving}
                                                        >
                                                            <Save className="h-4 w-4 mr-1 shrink-0" /> {saving ? "Saving…" : "Save"}
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        className="min-h-9 w-full sm:w-auto touch-manipulation"
                                                        onClick={beginEdit}
                                                    >
                                                        <Pencil className="h-4 w-4 mr-1 shrink-0" /> Edit
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-4 min-w-0">
                                        {isEditing ? (
                                            <div className="space-y-6 max-h-[min(70vh,65dvh)] overflow-y-auto overflow-x-hidden pr-1 sm:max-h-[70vh]">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="bd-unique">Unique number</Label>
                                                        <Input
                                                            id="bd-unique"
                                                            value={draft.unique_number}
                                                            onChange={(e) => setDraft((d) => ({ ...d, unique_number: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="bd-idn">ID / NIN</Label>
                                                        <Input
                                                            id="bd-idn"
                                                            value={draft.id_number}
                                                            onChange={(e) => setDraft((d) => ({ ...d, id_number: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="bd-gender">Gender</Label>
                                                        <select
                                                            id="bd-gender"
                                                            className={selectClass}
                                                            value={draft.gender}
                                                            onChange={(e) => setDraft((d) => ({ ...d, gender: e.target.value }))}
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="bd-title">Title</Label>
                                                        <select
                                                            id="bd-title"
                                                            className={selectClass}
                                                            value={draft.title}
                                                            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="Mr.">Mr.</option>
                                                            <option value="Mrs.">Mrs.</option>
                                                            <option value="Ms.">Ms.</option>
                                                            <option value="Dr.">Dr.</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="bd-phone">Mobile</Label>
                                                        <Input
                                                            id="bd-phone"
                                                            value={draft.phone_number}
                                                            onChange={(e) => setDraft((d) => ({ ...d, phone_number: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="bd-email">Email</Label>
                                                        <Input
                                                            id="bd-email"
                                                            type="email"
                                                            value={draft.email}
                                                            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="bd-land">Landline</Label>
                                                        <Input
                                                            id="bd-land"
                                                            value={draft.landline_phone}
                                                            onChange={(e) => setDraft((d) => ({ ...d, landline_phone: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="bd-dob">Date of birth</Label>
                                                        <Input
                                                            id="bd-dob"
                                                            type="date"
                                                            value={draft.dob}
                                                            onChange={(e) => setDraft((d) => ({ ...d, dob: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="bd-country">Country</Label>
                                                        <Input
                                                            id="bd-country"
                                                            value={draft.country}
                                                            onChange={(e) => setDraft((d) => ({ ...d, country: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="bd-work">Working status</Label>
                                                        <select
                                                            id="bd-work"
                                                            className={selectClass}
                                                            value={draft.working_status}
                                                            onChange={(e) => setDraft((d) => ({ ...d, working_status: e.target.value }))}
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="Employed">Employed</option>
                                                            <option value="Self-Employed">Self-Employed</option>
                                                            <option value="Unemployed">Unemployed</option>
                                                            <option value="Student">Student</option>
                                                            <option value="Retired">Retired</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {clientType === "personal" ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="bd-dist">District</Label>
                                                            <Input
                                                                id="bd-dist"
                                                                value={draft.district}
                                                                onChange={(e) => setDraft((d) => ({ ...d, district: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="bd-vill">Village / parish</Label>
                                                            <Input
                                                                id="bd-vill"
                                                                value={draft.village}
                                                                onChange={(e) => setDraft((d) => ({ ...d, village: e.target.value }))}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div>
                                                            <Label htmlFor="bd-addr">Street address</Label>
                                                            <Input
                                                                id="bd-addr"
                                                                value={draft.address}
                                                                onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                            <div>
                                                                <Label htmlFor="bd-city">City</Label>
                                                                <Input
                                                                    id="bd-city"
                                                                    value={draft.city}
                                                                    onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="bd-prov">Province / state</Label>
                                                                <Input
                                                                    id="bd-prov"
                                                                    value={draft.province_state}
                                                                    onChange={(e) => setDraft((d) => ({ ...d, province_state: e.target.value }))}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="bd-zip">Zip / postal</Label>
                                                                <Input
                                                                    id="bd-zip"
                                                                    value={draft.zipcode}
                                                                    onChange={(e) => setDraft((d) => ({ ...d, zipcode: e.target.value }))}
                                                                />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                <div>
                                                    <Label htmlFor="bd-desc">Description</Label>
                                                    <textarea
                                                        id="bd-desc"
                                                        rows={3}
                                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                        value={draft.description}
                                                        onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="bd-docs">Attach / replace document (optional)</Label>
                                                        <Input
                                                            id="bd-docs"
                                                            type="file"
                                                            onChange={(e) => setDocsFile(e.target.files?.[0] || null)}
                                                            className="cursor-pointer"
                                                        />
                                                        {docsFile && (
                                                            <p className="text-xs text-muted-foreground mt-1">Selected: {docsFile.name}</p>
                                                        )}
                                                    </div>
                                                    {isAdmin && (
                                                        <>
                                                            <div>
                                                                <Label htmlFor="bd-cs">Credit score</Label>
                                                                <Input
                                                                    id="bd-cs"
                                                                    type="number"
                                                                    value={draft.credit_score}
                                                                    onChange={(e) => setDraft((d) => ({ ...d, credit_score: e.target.value }))}
                                                                />
                                                            </div>
                                                            <div className="sm:col-span-2">
                                                                <Label htmlFor="bd-off">Assigned loan officer</Label>
                                                                <select
                                                                    id="bd-off"
                                                                    className={selectClass}
                                                                    value={draft.assigned_officer_id}
                                                                    onChange={(e) => setDraft((d) => ({ ...d, assigned_officer_id: e.target.value }))}
                                                                >
                                                                    <option value="">None</option>
                                                                    {staffList.map((s) => (
                                                                        <option key={s.id} value={s.id}>
                                                                            {s.full_name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <div className="flex items-center text-muted-foreground">
                                                            <Phone className="mr-2 h-4 w-4" /> Phone
                                                        </div>
                                                        <p>{borrower.phone_number || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center text-muted-foreground">
                                                            <Mail className="mr-2 h-4 w-4" /> Email
                                                        </div>
                                                        <p>{borrower.email || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground">ID / NIN</div>
                                                        <p>{borrower.id_number || "—"}</p>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground">Unique #</div>
                                                        <p>{borrower.unique_number || "—"}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <div className="flex items-center text-muted-foreground">
                                                            <MapPin className="mr-2 h-4 w-4" /> Location
                                                        </div>
                                                        <p>
                                                            {[borrower.village, borrower.district].filter(Boolean).join(", ") ||
                                                                borrower.address ||
                                                                "N/A"}
                                                        </p>
                                                    </div>
                                                    {borrower.description ? (
                                                        <div className="col-span-2">
                                                            <div className="text-muted-foreground">Notes</div>
                                                            <p className="whitespace-pre-wrap">{borrower.description}</p>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-white to-slate-50 border-primary/20 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-primary" />
                                            Credit Score
                                        </CardTitle>
                                        <CardDescription>Based on repayment history</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center justify-center py-6">
                                        <div
                                            className={`relative flex items-center justify-center h-32 w-32 rounded-full border-8 ${
                                                borrower.credit_score >= 750
                                                    ? "border-green-500"
                                                    : borrower.credit_score >= 650
                                                      ? "border-blue-500"
                                                      : borrower.credit_score >= 500
                                                        ? "border-orange-500"
                                                        : "border-red-500"
                                            }`}
                                        >
                                            <div className="text-center">
                                                <span className={`text-3xl font-bold ${getScoreColor(borrower.credit_score)}`}>{borrower.credit_score}</span>
                                                <p className="text-xs uppercase font-semibold text-muted-foreground mt-1">{getScoreBadge(borrower.credit_score)}</p>
                                            </div>
                                        </div>
                                        <div className="mt-6 w-full space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Base Score</span>
                                                <span className="font-medium">300</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Longevity</span>
                                                <span className="text-green-600 font-medium">+ Longevity and History</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Performance</span>
                                                <span className={borrower.credit_score > 500 ? "text-green-600 font-medium" : "text-red-500"}>
                                                    {borrower.credit_score > 500 ? "Good" : "Needs Imp."}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Financial Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-4 bg-muted/30 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Total Loans</p>
                                            <p className="text-2xl font-bold">{borrower.total_loans || 0}</p>
                                        </div>
                                        <div className="p-4 bg-muted/30 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Active Loans</p>
                                            <p className="text-2xl font-bold">{borrower.active_loans || 0}</p>
                                        </div>
                                        <div className="p-4 bg-muted/30 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Total Borrowed</p>
                                            <p className="text-lg font-bold">UGX {(borrower.total_borrowed || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-muted/30 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Total Repaid</p>
                                            <p className="text-lg font-bold text-green-600">UGX {(borrower.total_repaid || 0).toLocaleString()}</p>
                                        </div>
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

export default BorrowerDetails;
