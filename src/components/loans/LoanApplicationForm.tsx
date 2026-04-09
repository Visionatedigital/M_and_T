import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, UserPlus, Plus, User, Users, ChevronsUpDown, Crown, Search, Shield, Save, Check } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import {
    deleteLoanApplicationDraft,
    formatDraftAge,
    loadLoanApplicationDraftList,
    type LoanApplicationDraftPayload as StoredDraftPayload,
    type LoanApplicationStoredDraft,
    upsertLoanApplicationDraft,
} from "@/lib/formDrafts";

// Schema for Guarantor
const guarantorSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone number is required"),
    nin: z.string().optional(),
    address: z.string().optional(),
});

// Schema for Loan Application
const formSchema = z.object({
    // Borrower selection (individual) - details come from selected borrower
    borrower_id: z.string().optional(),

    // Application Type (Individual vs Group)
    application_type: z.enum(["individual", "group"]),

    // Loan Details
    loan_product: z.string().min(1, "Select a loan category (Individual or Group)"),
    loan_category: z.string().min(1, "Select a product (purpose)"),
    loan_amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
    }),
    loan_duration: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Duration must be a positive number",
    }),
    duration_unit: z.enum(["weeks", "months", "years"]).optional(),
    repayment_frequency: z.enum(["weekly", "biweekly", "monthly"]).optional(),
    interest_method: z.enum(["flat_rate", "reducing_balance", "interest_only", "fixed_fee"]).optional(),
    interest_rate: z.string().optional(),
    interest_fixed_amount: z.string().optional(),
    loan_purpose: z.string().min(2, "Purpose is required"),
    business_location: z.string().optional(),
    group_name: z.string().optional(),

    // Legacy fields (populated from selected borrower when submitting)
    full_name: z.string().optional(),
    email: z.union([z.string().email("Invalid email"), z.literal("")]).optional(),
    phone_number: z.string().optional(),
    id_number: z.string().optional(),
    date_of_birth: z.string().optional(),
    district: z.string().optional(),
    division: z.string().optional(),
    county: z.string().optional(),
    sub_county: z.string().optional(),
    parish: z.string().optional(),
    village: z.string().optional(),

    // Security & Collateral (for secured loans)
    security_type: z.string().optional(),
    security_value: z.string().optional(),
    insurance_status: z.string().optional(), // Added insurance status

    // Document Attachments (optional but recommended)
    attachment_national_id: z.any().optional(),
    attachment_lc1_letter: z.any().optional(),
    attachment_recommendation_letter: z.any().optional(),
    attachment_passport_photo: z.any().optional(),
    attachment_income_statement: z.any().optional(),

    // Guarantors
    guarantors: z.array(guarantorSchema).optional(),

    // Group Members
    group_members: z.array(z.object({
        name: z.string().min(1, "Name is required"),
        phone: z.string().min(10, "Valid phone number is required"),
        id_number: z.string().optional(),
        email: z.string().email("Invalid email").optional().or(z.literal("")),
        date_of_birth: z.string().optional(),
        district: z.string().optional(),
        county: z.string().optional(),
        sub_county: z.string().optional(),
        parish: z.string().optional(),
        village: z.string().optional(),
    })).optional(),

    /** YYYY-MM-DD — application filed / created in DB (backdating for migration) */
    application_date: z.string().optional(),
    /** When editing as admin — historical approval date */
    approved_at: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type LoanFormDraftPayload = {
    formValues: Partial<FormValues>;
    guarantors?: any[];
    groupMembers?: any[];
    groupLeaderAmount?: number;
    selectedBorrowerId?: string;
    selectedGroupLeaderId?: string;
    selectedCollateralId?: string;
};

function toStoredPayload(p: LoanFormDraftPayload): StoredDraftPayload {
    return {
        formValues: p.formValues as Record<string, unknown>,
        guarantors: p.guarantors,
        groupMembers: p.groupMembers,
        groupLeaderAmount: p.groupLeaderAmount,
        selectedBorrowerId: p.selectedBorrowerId,
        selectedGroupLeaderId: p.selectedGroupLeaderId,
        selectedCollateralId: p.selectedCollateralId,
    };
}

function getEmptyLoanFormDefaults(): FormValues {
    return {
        borrower_id: "",
        application_type: "individual",
        loan_product: "",
        loan_category: "Business",
        loan_amount: "",
        loan_duration: "",
        duration_unit: "months",
        repayment_frequency: "monthly",
        interest_method: "flat_rate",
        interest_rate: "30",
        interest_fixed_amount: "",
        loan_purpose: "",
        full_name: "",
        email: "",
        phone_number: "",
        id_number: "",
        date_of_birth: "",
        district: "",
        division: "",
        county: "",
        sub_county: "",
        parish: "",
        village: "",
        business_location: "",
        security_type: "",
        security_value: "",
        insurance_status: "",
        attachment_national_id: null,
        attachment_lc1_letter: null,
        attachment_recommendation_letter: null,
        attachment_passport_photo: null,
        attachment_income_statement: null,
        guarantors: [],
        group_name: "",
        group_members: [],
        application_date: new Date().toISOString().slice(0, 10),
        approved_at: "",
    };
}

function sanitizeLoanFormValuesForDraft(v: FormValues): Partial<FormValues> {
    const o: Record<string, unknown> = { ...v };
    for (const key of Object.keys(o)) {
        const val = o[key];
        if (val instanceof File) delete o[key];
    }
    return o as Partial<FormValues>;
}

interface LoanApplicationFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: any; // Add initialData prop
}

export function LoanApplicationForm({ onSuccess, onCancel, initialData }: LoanApplicationFormProps) {
    const { toast } = useToast();
    const { isAdmin } = useUserRole();
    const navigate = useNavigate();
    const [loanProducts, setLoanProducts] = useState<any[]>([]);
    // Use a simplified local state for guarantors since useFieldArray can be complex with shadcn form sometimes
    const [guarantors, setGuarantors] = useState<any[]>(
        (initialData?.guarantors || []).filter((g: any) => g?.name || g?.phone)
    );
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({
        national_id: null,
        lc1_letter: null,
        recommendation_letter: null,
        passport_photo: null,
        income_statement: null,
    });

    const [groupMembers, setGroupMembers] = useState<any[]>(() => {
        const raw = initialData?.group_members || [];
        const leaderId = initialData?.borrower_id;
        return raw
            .filter((m: any) => m.borrower_id !== leaderId)
            .map((m: any) => m.id ? m : {
                id: m.borrower_id,
                full_name: m.name,
                phone_number: m.phone,
                id_number: m.id_number,
                email: m.email,
                date_of_birth: m.date_of_birth,
                district: m.district,
                province_state: m.county,
                county: m.county,
                address: m.village,
                village: m.village,
                parish: m.parish,
                sub_county: m.sub_county,
                amount: m.amount ?? 0,
                ...m,
            });
    });
    const [groupLeaderAmount, setGroupLeaderAmount] = useState<number>(() => {
        const raw = initialData?.group_members || [];
        const leaderId = initialData?.borrower_id;
        const leader = raw.find((m: any) => m.borrower_id === leaderId);
        return leader?.amount ?? 0;
    });
    const [borrowers, setBorrowers] = useState<any[]>([]);
    const [selectedBorrowerForIndividual, setSelectedBorrowerForIndividual] = useState<any>(null);
    const [selectedGroupLeader, setSelectedGroupLeader] = useState<any>(null);
    const [groupLeaderOpen, setGroupLeaderOpen] = useState(false);
    const [individualBorrowerOpen, setIndividualBorrowerOpen] = useState(false);
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [availableCollateral, setAvailableCollateral] = useState<any[]>([]);
    const [selectedCollateral, setSelectedCollateral] = useState<any>(null);
    const [collateralOpen, setCollateralOpen] = useState(false);
    const collateralSearchRef = useRef<HTMLInputElement>(null);
    const [guarantorsDirectory, setGuarantorsDirectory] = useState<any[]>([]);
    const [addGuarantorOpen, setAddGuarantorOpen] = useState(false);

    const loanDraftRef = useRef<(LoanFormDraftPayload & { _savedAt?: number }) | null>(null);
    /** Active row in localStorage draft list; null = blank new until first autosave creates an id */
    const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
    const suppressDraftSaveRef = useRef(false);
    const [savedDrafts, setSavedDrafts] = useState<LoanApplicationStoredDraft[]>([]);
    const refreshSavedDrafts = () => setSavedDrafts(loadLoanApplicationDraftList());

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            borrower_id: initialData?.borrower_id || "",
            application_type: (initialData?.application_type as "individual" | "group") || "individual",
            loan_product: initialData?.loan_product || "",
            loan_category: initialData?.loan_category || "Business",
            loan_amount: initialData?.loan_amount?.toString() || "",
            loan_duration: initialData?.loan_duration_months?.toString() || initialData?.loan_duration?.toString() || "",
            duration_unit: (initialData?.duration_unit as "weeks" | "months" | "years") || "months",
            repayment_frequency: (initialData?.repayment_frequency as "weekly" | "biweekly" | "monthly") || "monthly",
            interest_method: (initialData?.interest_method as "flat_rate" | "reducing_balance" | "interest_only" | "fixed_fee") || "flat_rate",
            interest_rate: initialData?.interest_rate?.toString() || "30",
            interest_fixed_amount: initialData?.interest_fixed_amount?.toString() || "",
            loan_purpose: initialData?.loan_purpose || "",
            full_name: initialData?.full_name || "",
            email: initialData?.email || "",
            phone_number: initialData?.phone_number || "",
            id_number: initialData?.id_number || "",
            date_of_birth: initialData?.date_of_birth?.split('T')[0] || "",
            district: initialData?.address?.split(', ')[3] || "",
            division: "",
            county: initialData?.address?.split(', ')[2] || "",
            sub_county: initialData?.address?.split(', ')[2] || "",
            parish: initialData?.address?.split(', ')[1] || "",
            village: initialData?.address?.split(', ')[0] || "",
            business_location: initialData?.business_location || "",
            security_type: initialData?.security_type || "",
            security_value: initialData?.security_value?.toString() || "",
            insurance_status: initialData?.insurance_status || "",
            attachment_national_id: initialData?.attachment_national_id || null,
            attachment_lc1_letter: initialData?.attachment_lc1_letter || null,
            attachment_recommendation_letter: initialData?.attachment_recommendation_letter || null,
            attachment_passport_photo: initialData?.attachment_passport_photo || null,
            attachment_income_statement: initialData?.attachment_income_statement || null,
            guarantors: initialData?.guarantors || [],
            group_name: initialData?.group_name || "",
            group_members: initialData?.group_members || [],
            application_date: initialData?.created_at
                ? String(initialData.created_at).slice(0, 10)
                : new Date().toISOString().slice(0, 10),
            approved_at: initialData?.approved_at ? String(initialData.approved_at).slice(0, 10) : "",
        },
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await api.products.getAll();
                if (data) setLoanProducts(data.filter((p: any) => p.status === 'active'));
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    const watchProduct = form.watch("loan_product");
    const watchAppType = form.watch("application_type");
    const watchLoanAmount = useWatch({ control: form.control, name: "loan_amount", defaultValue: "" });
    const watchLoanDuration = useWatch({ control: form.control, name: "loan_duration", defaultValue: "" });
    const watchedAll = useWatch({ control: form.control });
    useEffect(() => {
        if (watchProduct) {
            const product = loanProducts.find(p => p.name === watchProduct);
            setSelectedProduct(product);
        }
    }, [watchProduct, loanProducts]);

    // When application type changes: auto-set Group Loan for group, clear for individual
    useEffect(() => {
        const currentProduct = form.getValues("loan_product");
        const isGroup = watchAppType === "group";
        const groupLoan = loanProducts.find(p => p.name === "Group Loan");
        if (isGroup && groupLoan) {
            form.setValue("loan_product", "Group Loan");
        } else if (!isGroup && currentProduct === "Group Loan") {
            form.setValue("loan_product", "");
            setSelectedGroupLeader(null);
            setGroupLeaderAmount(0);
        }
    }, [watchAppType, loanProducts]);

    const addGuarantorFromDirectory = (g: any) => {
        if (guarantors.length >= 2) return;
        const alreadySelected = guarantors.some(
            (x) => (x.id && x.id === g.id) || (x.phone === g.phone_number && x.name === g.full_name)
        );
        if (alreadySelected) return;
        setGuarantors([
            ...guarantors.filter((x) => x.name || x.phone),
            {
                name: g.full_name || "",
                phone: g.phone_number || "",
                nin: g.id_number || "",
                address: g.address || "",
                id: g.id,
            },
        ]);
    };

    const removeGuarantor = (index: number) => {
        const newGuarantors = [...guarantors];
        newGuarantors.splice(index, 1);
        setGuarantors(newGuarantors.length ? newGuarantors : []);
    };

    const handleFileChange = (fileType: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFiles((prev) => ({ ...prev, [fileType]: file }));
        }
    };

    const getExistingFileUrl = (fileType: string) => {
        if (!initialData) return null;
        switch (fileType) {
            case 'national_id': return initialData.attachment_national_id;
            case 'lc1_letter': return initialData.attachment_lc1_letter;
            case 'recommendation_letter': return initialData.attachment_recommendation_letter;
            case 'passport_photo': return initialData.attachment_passport_photo;
            case 'income_statement': return initialData.attachment_income_statement;
            default: return null;
        }
    };

    useEffect(() => {
        if (form.watch("application_type") === "individual") {
            api.guarantors.getAll().then(setGuarantorsDirectory).catch(() => setGuarantorsDirectory([]));
        }
    }, [form.watch("application_type")]);

    useEffect(() => {
        api.borrowers.getAll(false).then(setBorrowers).catch(() => api.clients.getAll(false).then(setBorrowers).catch(() => setBorrowers([])));
    }, []);

    useEffect(() => {
        api.collateral.getAll(true).then(setAvailableCollateral).catch(() => setAvailableCollateral([]));
    }, []);

    useEffect(() => {
        if (!collateralOpen) return;
        const id = requestAnimationFrame(() => collateralSearchRef.current?.focus());
        return () => cancelAnimationFrame(id);
    }, [collateralOpen]);

    const memberBorrowerIds = useMemo(() => {
        const appType = form.watch("application_type");
        if (appType === "group") {
            const ids = [selectedGroupLeader?.id, ...groupMembers.map((m: any) => m.id)].filter(Boolean);
            return ids;
        }
        if (appType === "individual") {
            // Include whoever is selected in the UI, not only URL-prefill (initialData)
            const bid = selectedBorrowerForIndividual?.id || initialData?.borrower_id;
            return bid ? [bid] : [];
        }
        return [];
    }, [form.watch("application_type"), selectedGroupLeader?.id, groupMembers, selectedBorrowerForIndividual?.id, initialData?.borrower_id]);

    /** Show collateral block once we know which borrower(s) the loan is for */
    const showCollateralSection = useMemo(() => {
        const appType = form.watch("application_type");
        if (appType === "group") return memberBorrowerIds.length > 0;
        return !!(selectedBorrowerForIndividual?.id || initialData?.borrower_id);
    }, [form.watch("application_type"), memberBorrowerIds.length, selectedBorrowerForIndividual?.id, initialData?.borrower_id]);

    const memberOwnedCollateral = useMemo(() => {
        if (memberBorrowerIds.length === 0) return [];
        return availableCollateral.filter((c: any) => c.borrower_id && memberBorrowerIds.includes(c.borrower_id));
    }, [availableCollateral, memberBorrowerIds]);

    useEffect(() => {
        if (selectedCollateral && !memberOwnedCollateral.some((c: any) => c.id === selectedCollateral.id)) {
            setSelectedCollateral(null);
            form.setValue("security_type", "");
            form.setValue("security_value", "");
        }
    }, [memberOwnedCollateral, selectedCollateral]);

    useEffect(() => {
        if (initialData?.application_type === "group" && initialData?.borrower_id) {
            api.borrowers.get(initialData.borrower_id).then(setSelectedGroupLeader).catch(() => {});
        }
        if (initialData?.application_type === "individual" && initialData?.borrower_id) {
            api.borrowers.get(initialData.borrower_id).then(setSelectedBorrowerForIndividual).catch(() => {});
        }
    }, [initialData?.application_type, initialData?.borrower_id]);

    useEffect(() => {
        if (initialData) return;
        refreshSavedDrafts();
    }, [initialData]);

    useEffect(() => {
        if (initialData) return;
        const d = loanDraftRef.current;
        if (!d?.selectedBorrowerId && !d?.selectedGroupLeaderId) return;
        if (!borrowers.length) return;
        if (d.selectedBorrowerId) {
            const b = borrowers.find((x: any) => x.id === d.selectedBorrowerId);
            if (b) setSelectedBorrowerForIndividual(b);
        }
        if (d.selectedGroupLeaderId) {
            const b = borrowers.find((x: any) => x.id === d.selectedGroupLeaderId);
            if (b) setSelectedGroupLeader(b);
        }
    }, [borrowers, initialData]);

    useEffect(() => {
        if (initialData) return;
        const d = loanDraftRef.current;
        if (!d?.selectedCollateralId || !availableCollateral.length) return;
        const c = availableCollateral.find((x: any) => x.id === d.selectedCollateralId);
        if (c) {
            setSelectedCollateral(c);
            form.setValue("security_type", c.type || "");
            form.setValue("security_value", String(c.estimated_value || c.current_value || ""));
        }
    }, [availableCollateral, initialData, form]);

    useEffect(() => {
        if (initialData) return;
        if (suppressDraftSaveRef.current) return;
        const timer = window.setTimeout(() => {
            const raw = form.getValues();
            const formValues = sanitizeLoanFormValuesForDraft(raw);
            const payload: LoanFormDraftPayload = {
                formValues,
                guarantors,
                groupMembers,
                groupLeaderAmount,
                selectedBorrowerId: selectedBorrowerForIndividual?.id,
                selectedGroupLeaderId: selectedGroupLeader?.id,
                selectedCollateralId: selectedCollateral?.id,
            };
            const newId = upsertLoanApplicationDraft(activeDraftId, toStoredPayload(payload));
            setActiveDraftId(newId);
            loanDraftRef.current = { ...payload, _savedAt: Date.now() };
            refreshSavedDrafts();
        }, 2000);
        return () => clearTimeout(timer);
    }, [
        watchedAll,
        guarantors,
        groupMembers,
        groupLeaderAmount,
        selectedBorrowerForIndividual?.id,
        selectedGroupLeader?.id,
        selectedCollateral?.id,
        initialData,
        form,
        activeDraftId,
    ]);

    const handleSelectCollateral = (collateral: any) => {
        setSelectedCollateral(collateral);
        if (collateral) {
            form.setValue("security_type", collateral.type || "");
            form.setValue("security_value", String(collateral.estimated_value || collateral.current_value || ""));
        } else {
            form.setValue("security_type", "");
            form.setValue("security_value", "");
        }
    };

    const [borrowerAttachments, setBorrowerAttachments] = useState<Record<string, string> | null>(null);

    const handleSelectGroupLeader = (borrower: any) => {
        setSelectedGroupLeader(borrower);
        setBorrowerAttachments(null);
        if (borrower) {
            const addr = (borrower.address || "").split(", ");
            form.setValue("full_name", borrower.full_name || "");
            form.setValue("email", borrower.email || "");
            form.setValue("phone_number", borrower.phone_number || "");
            form.setValue("id_number", borrower.id_number || "");
            form.setValue("date_of_birth", borrower.date_of_birth ? String(borrower.date_of_birth).split("T")[0] : "");
            form.setValue("district", borrower.district || addr[addr.length - 1] || "");
            form.setValue("village", addr[0] || "");
            form.setValue("parish", addr[1] || "");
            form.setValue("county", borrower.province_state || borrower.county || "");
            api.borrowers.getAttachments(borrower.id).then((att) => {
                if (att && Object.keys(att).length > 0) setBorrowerAttachments(att);
            }).catch(() => {});
        }
    };

    const addGroupMember = (borrower: any) => {
        if (!borrower?.id) return;
        const alreadySelected = selectedGroupLeader?.id === borrower.id || groupMembers.some((m: any) => m.id === borrower.id);
        if (alreadySelected) return;
        setGroupMembers([...groupMembers, { ...borrower, amount: 0 }]);
    };

    const removeGroupMember = (index: number) => {
        setGroupMembers(groupMembers.filter((_, i) => i !== index));
    };

    const updateGroupMemberAmount = (index: number, amount: number) => {
        setGroupMembers(prev => prev.map((m, i) => i === index ? { ...m, amount } : m));
    };

    const distributeEqually = () => {
        const total = Number(form.getValues("loan_amount")) || 0;
        const count = (selectedGroupLeader ? 1 : 0) + groupMembers.length;
        if (count === 0 || total <= 0) return;
        const each = Math.floor(total / count);
        const remainder = total - each * count;
        if (selectedGroupLeader) setGroupLeaderAmount(each + remainder);
        setGroupMembers(prev => prev.map(m => ({ ...m, amount: each })));
    };

    const onSubmit = async (values: FormValues) => {
        try {
            const user = await api.auth.getMe();

            if (!user) {
                toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
                return;
            }

            // Individual applications require a selected borrower
            if (values.application_type === "individual") {
                if (!selectedBorrowerForIndividual?.id) {
                    toast({ title: "Validation Error", description: "Please select a borrower from the directory.", variant: "destructive" });
                    return;
                }
            }

            // Group applications require group name, group leader, and member amounts
            if (values.application_type === "group") {
                if (!values.group_name?.trim()) {
                    toast({
                        title: "Group Name Required",
                        description: "Please enter the group name for group applications.",
                        variant: "destructive"
                    });
                    return;
                }
                if (!selectedGroupLeader?.id) {
                    toast({
                        title: "Group Leader Required",
                        description: "Please select an existing borrower to be the group leader.",
                        variant: "destructive"
                    });
                    return;
                }
                const totalAmount = Number(values.loan_amount) || 0;
                const allocatedTotal = groupLeaderAmount + groupMembers.reduce((sum, m) => sum + (m.amount ?? 0), 0);
                if (Math.abs(allocatedTotal - totalAmount) > 1) {
                    toast({
                        title: "Amount Mismatch",
                        description: `Member amounts (${allocatedTotal.toLocaleString()} UGX) must equal the total loan amount (${totalAmount.toLocaleString()} UGX). Use "Distribute equally" or adjust each member's share.`,
                        variant: "destructive"
                    });
                    return;
                }
            }

            // Check product limits
            if (selectedProduct) {
                const amount = Number(values.loan_amount);
                if (amount < selectedProduct.min_amount || amount > selectedProduct.max_amount) {
                    toast({
                        title: "Invalid Amount",
                        description: `Amount must be between ${selectedProduct.min_amount} and ${selectedProduct.max_amount}`,
                        variant: "destructive"
                    });
                    return;
                }
            }

            // Upload files to Local Backend
            const uploadedUrls: Record<string, string | null> = {
                national_id: null,
                lc1_letter: null,
                recommendation_letter: null,
                passport_photo: null,
                income_statement: null,
            };

            toast({ title: "Uploading documents...", description: "Please wait while we upload your files." });

            for (const [key, file] of Object.entries(uploadedFiles)) {
                if (file) {
                    try {
                        const response = await api.upload(file);
                        uploadedUrls[key] = response.url;
                    } catch (uploadError) {
                        console.error(`Error uploading ${key}:`, uploadError);
                        toast({
                            title: "Upload Error",
                            description: `Failed to upload ${key.replace('_', ' ')}`,
                            variant: "destructive"
                        });
                    }
                }
            }

            const durationVal = Number(values.loan_duration) || 1;
            const durationUnit = values.duration_unit || "months";
            const loanDurationMonths = durationUnit === "weeks" ? durationVal / 4.33 : durationUnit === "years" ? durationVal * 12 : durationVal;

            const borrowerData = values.application_type === "individual" ? selectedBorrowerForIndividual : selectedGroupLeader;
            const addr = (borrowerData?.address || "").split(", ");
            const fullName = borrowerData?.full_name || values.full_name || "";
            const emailVal = (borrowerData?.email || values.email || "").trim();
            const phoneVal = borrowerData?.phone_number || values.phone_number || "";
            const idNum = borrowerData?.id_number || values.id_number || "";
            const dob = borrowerData?.date_of_birth ? String(borrowerData.date_of_birth).split("T")[0] : values.date_of_birth || "1990-01-01";
            const districtVal = borrowerData?.district || addr[addr.length - 1] || values.district || "";
            const villageVal = addr[0] || values.village || "";
            const parishVal = addr[1] || values.parish || "";
            const countyVal = borrowerData?.province_state || borrowerData?.county || values.county || "";
            const addressVal = [villageVal, parishVal, values.sub_county, districtVal].filter(Boolean).join(", ") || "N/A";

            const applicationData = {
                user_id: user.id,
                borrower_id: values.application_type === "group" ? selectedGroupLeader?.id : selectedBorrowerForIndividual?.id,
                full_name: fullName,
                email: emailVal,
                phone_number: phoneVal,
                id_number: idNum,
                date_of_birth: dob,
                district: districtVal,
                division: values.division,
                county: countyVal,
                sub_county: values.sub_county,
                parish: parishVal,
                village: villageVal,
                address: addressVal,
                application_type: values.application_type,
                loan_product: values.loan_product,
                loan_category: values.loan_category,
                loan_amount: Number(values.loan_amount),
                loan_duration_months: Math.ceil(loanDurationMonths),
                loan_duration: durationVal,
                duration_unit: durationUnit,
                repayment_frequency: values.repayment_frequency || "monthly",
                interest_method: values.interest_method || "flat_rate",
                interest_rate: values.interest_rate ? parseFloat(values.interest_rate) : null,
                interest_fixed_amount: values.interest_fixed_amount ? parseFloat(values.interest_fixed_amount) : null,
                loan_purpose: values.loan_purpose,
                business_location: values.loan_category === "Business" ? (values.business_location || null) : null,
                employment_status: "Self-Employed",

                // Security & Collateral
                security_type: values.security_type || null,
                security_value: values.security_value ? Number(values.security_value) : null,
                insurance_status: values.insurance_status || "Not Insured",

                // Document Attachments - new upload, borrower's from previous loan, or existing
                attachment_national_id: uploadedUrls.national_id || borrowerAttachments?.attachment_national_id || initialData?.attachment_national_id || null,
                attachment_lc1_letter: uploadedUrls.lc1_letter || borrowerAttachments?.attachment_lc1_letter || initialData?.attachment_lc1_letter || null,
                attachment_recommendation_letter: uploadedUrls.recommendation_letter || borrowerAttachments?.attachment_recommendation_letter || initialData?.attachment_recommendation_letter || null,
                attachment_passport_photo: uploadedUrls.passport_photo || borrowerAttachments?.attachment_passport_photo || initialData?.attachment_passport_photo || null,
                attachment_income_statement: uploadedUrls.income_statement || borrowerAttachments?.attachment_income_statement || initialData?.attachment_income_statement || null,
                attachment_uploaded_at: uploadedUrls.national_id ? new Date().toISOString() : null,

                // JSON Fields
                guarantors: guarantors,
                group_name: values.group_name || null,
                group_leader_amount: values.application_type === "group" ? groupLeaderAmount : undefined,
                group_members: values.application_type === "group"
                    ? initialData
                        ? [
                            ...(selectedGroupLeader ? [{
                                borrower_id: selectedGroupLeader.id,
                                name: fullName,
                                phone: phoneVal,
                                id_number: idNum,
                                email: emailVal,
                                date_of_birth: dob,
                                district: districtVal,
                                county: countyVal,
                                village: villageVal,
                                amount: groupLeaderAmount,
                            }] : []),
                            ...groupMembers.map((b: any) => ({
                                borrower_id: b.id,
                                name: b.full_name,
                                phone: b.phone_number,
                                id_number: b.id_number,
                                email: b.email,
                                date_of_birth: b.date_of_birth,
                                district: b.district,
                                county: b.province_state || b.county,
                                village: b.address || b.village,
                                parish: b.parish,
                                sub_county: b.sub_county,
                                amount: b.amount ?? 0,
                            })),
                        ]
                        : groupMembers.map((b: any) => ({
                            borrower_id: b.id,
                            name: b.full_name,
                            phone: b.phone_number,
                            id_number: b.id_number,
                            email: b.email,
                            date_of_birth: b.date_of_birth,
                            district: b.district,
                            county: b.province_state || b.county,
                            village: b.address || b.village,
                            parish: b.parish,
                            sub_county: b.sub_county,
                            amount: b.amount ?? 0,
                        }))
                    : [],
                status: initialData ? initialData.status : "pending"
            };

            if (values.application_date) {
                applicationData.application_date = values.application_date;
            }
            if (initialData && isAdmin && values.approved_at) {
                applicationData.approved_at = values.approved_at;
            }

            if (initialData) {
                // Update existing application
                await api.applications.update(initialData.id, applicationData);
                toast({ title: "Success", description: "Loan application updated successfully" });
            } else {
                // Create new application
                const loanData = await api.applications.create(applicationData);

                // Link collateral from register (no manual entry)
                if (selectedCollateral?.id) {
                    try {
                        await api.collateral.update(selectedCollateral.id, { loan_application_id: loanData.id });
                    } catch (collateralError) {
                        console.error("Error linking collateral:", collateralError);
                    }
                }
                toast({ title: "Success", description: "Loan application submitted successfully" });
            }

            if (!initialData) {
                if (activeDraftId) {
                    deleteLoanApplicationDraft(activeDraftId);
                }
                setActiveDraftId(null);
                loanDraftRef.current = null;
                refreshSavedDrafts();
            }
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const resetFormWithoutDraft = () => {
        suppressDraftSaveRef.current = true;
        setActiveDraftId(null);
        loanDraftRef.current = null;
        form.reset(getEmptyLoanFormDefaults());
        setGuarantors([]);
        setGroupMembers([]);
        setGroupLeaderAmount(0);
        setSelectedBorrowerForIndividual(null);
        setSelectedGroupLeader(null);
        setSelectedCollateral(null);
        setBorrowerAttachments(null);
        window.setTimeout(() => {
            suppressDraftSaveRef.current = false;
        }, 400);
    };

    const applyDraftFromRecord = (draft: LoanApplicationStoredDraft) => {
        const p = draft.payload;
        const fv = p.formValues as Partial<FormValues>;
        loanDraftRef.current = {
            formValues: fv,
            guarantors: p.guarantors as any[],
            groupMembers: p.groupMembers as any[],
            groupLeaderAmount: p.groupLeaderAmount,
            selectedBorrowerId: p.selectedBorrowerId,
            selectedGroupLeaderId: p.selectedGroupLeaderId,
            selectedCollateralId: p.selectedCollateralId,
            _savedAt: draft.savedAt,
        };
        setActiveDraftId(draft.id);
        suppressDraftSaveRef.current = true;
        form.reset({ ...getEmptyLoanFormDefaults(), ...fv } as FormValues);
        if (Array.isArray(p.guarantors)) setGuarantors(p.guarantors as any[]);
        if (Array.isArray(p.groupMembers)) setGroupMembers(p.groupMembers as any[]);
        if (typeof p.groupLeaderAmount === "number") setGroupLeaderAmount(p.groupLeaderAmount);
        toast({
            title: "Draft opened",
            description: `${draft.label} (${formatDraftAge(draft.savedAt)}). Re-attach files if needed.`,
        });
        window.setTimeout(() => {
            suppressDraftSaveRef.current = false;
        }, 600);
    };

    const removeDraftEntry = (id: string) => {
        deleteLoanApplicationDraft(id);
        if (activeDraftId === id) {
            resetFormWithoutDraft();
        }
        refreshSavedDrafts();
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                    const firstError = errors && typeof errors === "object" && Object.keys(errors).length > 0
                        ? Object.entries(errors).map(([k, v]) => (v as { message?: string })?.message || `${k} is invalid`).join(". ")
                        : "Please check the form for missing or invalid fields.";
                    toast({
                        title: "Validation Error",
                        description: firstError,
                        variant: "destructive"
                    });
                })}
                className="w-full min-w-0 max-w-full space-y-4 overflow-x-clip text-sm leading-snug [&_label]:text-xs [&_label]:font-medium"
            >
                {!initialData && (
                    <div className="space-y-4">
                        <Card className="w-full min-w-0 max-w-full overflow-hidden border-primary/25 bg-muted/30">
                            <CardHeader className="min-w-0 pb-2">
                                <CardTitle className="flex min-w-0 items-center gap-2 text-sm">
                                    <Save className="h-3.5 w-3.5 shrink-0" />
                                    <span className="min-w-0 truncate">Saved drafts ({savedDrafts.length})</span>
                                </CardTitle>
                                <CardDescription className="break-words">
                                    Stored in this browser only. Continue a draft below, or fill the form to add another (it saves automatically).
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="min-w-0 space-y-2">
                                {savedDrafts.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No drafts yet—fill the form and it will appear here automatically.</p>
                                ) : (
                                    <ul className="max-h-56 space-y-2 overflow-y-auto overflow-x-hidden pr-1">
                                        {savedDrafts.map((d) => (
                                            <li
                                                key={d.id}
                                                className="flex min-w-0 flex-col gap-2 rounded-md border bg-background/80 px-2 py-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-3"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium">{d.label}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDraftAge(d.savedAt)}
                                                        {activeDraftId === d.id ? " · editing" : ""}
                                                    </p>
                                                </div>
                                                <div className="flex min-w-0 w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        className="min-w-0 flex-1 sm:flex-initial"
                                                        onClick={() => applyDraftFromRecord(d)}
                                                    >
                                                        Continue
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="min-w-0 flex-1 text-destructive sm:flex-initial"
                                                        onClick={() => {
                                                            removeDraftEntry(d.id);
                                                            toast({ title: "Draft removed" });
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
                {/* Application Type - Individual vs Group */}
                <Card className="w-full min-w-0 max-w-full overflow-hidden border-2 border-primary/20">
                    <CardHeader className="min-w-0 space-y-1 pb-3">
                        <CardTitle className="text-sm">Application Type</CardTitle>
                        <FormDescription className="break-words text-xs leading-snug">
                            Select whether this is an individual or group loan application. The requirements differ for each.
                        </FormDescription>
                    </CardHeader>
                    <CardContent className="min-w-0">
                        <FormField
                            control={form.control}
                            name="application_type"
                            render={({ field }) => (
                                <FormItem className="min-w-0">
                                    <FormControl>
                                        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                                            <button
                                                type="button"
                                                onClick={() => field.onChange("individual")}
                                                className={`flex min-h-[40px] min-w-0 w-full max-w-full flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 transition-all touch-manipulation sm:gap-2 sm:p-4 ${
                                                    field.value === "individual"
                                                        ? "border-primary bg-primary/10"
                                                        : "border-muted hover:border-muted-foreground/30"
                                                }`}
                                            >
                                                <User className="h-6 w-6 shrink-0 text-muted-foreground sm:h-7 sm:w-7" />
                                                <span className="text-sm font-semibold">Individual</span>
                                                <span className="text-center text-[11px] text-muted-foreground leading-tight sm:text-xs">Single borrower application</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => field.onChange("group")}
                                                className={`flex min-h-[40px] min-w-0 w-full max-w-full flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 transition-all touch-manipulation sm:gap-2 sm:p-4 ${
                                                    field.value === "group"
                                                        ? "border-primary bg-primary/10"
                                                        : "border-muted hover:border-muted-foreground/30"
                                                }`}
                                            >
                                                <Users className="h-6 w-6 shrink-0 text-muted-foreground sm:h-7 sm:w-7" />
                                                <span className="text-sm font-semibold">Group</span>
                                                <span className="text-center text-[11px] text-muted-foreground leading-tight sm:text-xs">Group loan with multiple members</span>
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Loan Details */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Loan Details</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                        <FormField
                            control={form.control}
                            name="loan_category"
                            render={({ field }) => (
                                <FormItem className="min-w-0">
                                    <FormLabel>Product</FormLabel>
                                    <FormDescription className="text-xs">Purpose of the loan</FormDescription>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-8 min-h-8 w-full px-2 text-xs">
                                                <SelectValue placeholder="Select product" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Business">Business</SelectItem>
                                            <SelectItem value="Agricultural">Agricultural</SelectItem>
                                            <SelectItem value="School Fees">School Fees</SelectItem>
                                            <SelectItem value="Emergency">Emergency</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="loan_product"
                            render={({ field }) => (
                                <FormItem className="min-w-0">
                                    <FormLabel>Loan category</FormLabel>
                                    <FormDescription className="text-xs">Individual or Group lending</FormDescription>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-8 min-h-8 w-full px-2 text-xs">
                                                <SelectValue placeholder="Select loan category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {loanProducts
                                                .filter((p) => {
                                                    const isGroup = form.watch("application_type") === "group";
                                                    if (p.name === "Group Loan") return isGroup;
                                                    if (isGroup) return false;
                                                    return true;
                                                })
                                                .map((product) => (
                                                    <SelectItem key={product.id} value={product.name}>
                                                        {product.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="loan_amount"
                            render={({ field }) => (
                                <FormItem className="min-w-0">
                                    <FormLabel>Amount (UGX)</FormLabel>
                                    <FormControl>
                                        <Input type="number" className="h-8 min-h-8 w-full px-2 text-xs" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="loan_duration"
                            render={({ field }) => (
                                <FormItem className="min-w-0">
                                    <FormLabel>Duration</FormLabel>
                                    <FormControl>
                                        <Input type="number" className="h-8 min-h-8 w-full px-2 text-xs" {...field} placeholder="e.g. 12" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="duration_unit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duration Unit</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-8 min-h-8 w-full px-2 text-xs">
                                                <SelectValue placeholder="Unit" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="weeks">Weeks</SelectItem>
                                            <SelectItem value="months">Months</SelectItem>
                                            <SelectItem value="years">Years</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="repayment_frequency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Repayment Frequency</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-8 min-h-8 w-full px-2 text-xs">
                                                <SelectValue placeholder="Frequency" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="interest_method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Interest Method</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-8 min-h-8 w-full px-2 text-xs">
                                                <SelectValue placeholder="Method" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="flat_rate">Flat Rate</SelectItem>
                                            <SelectItem value="reducing_balance">Reducing Balance</SelectItem>
                                            <SelectItem value="interest_only">Interest Only</SelectItem>
                                            <SelectItem value="fixed_fee">Fixed Fee (UGX)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        {form.watch("interest_method") === "fixed_fee" ? (
                            <FormField
                                control={form.control}
                                name="interest_fixed_amount"
                                render={({ field }) => (
                                    <FormItem className="min-w-0">
                                        <FormLabel>Fixed Fee (UGX)</FormLabel>
                                        <FormControl>
                                            <Input type="number" className="h-8 min-h-8 w-full px-2 text-xs" {...field} placeholder="e.g. 50000" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <FormField
                                control={form.control}
                                name="interest_rate"
                                render={({ field }) => (
                                    <FormItem className="min-w-0">
                                        <FormLabel>Interest Rate (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" className="h-8 min-h-8 w-full px-2 text-xs" {...field} placeholder="e.g. 30" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                        <FormField
                            control={form.control}
                            name="application_date"
                            render={({ field }) => (
                                <FormItem className="min-w-0">
                                    <FormLabel>Application date</FormLabel>
                                    <FormDescription className="text-xs">
                                        When the application was filed (defaults to today). Use a past date for historical data.
                                    </FormDescription>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            className="h-8 min-h-8 w-full px-2 text-xs"
                                            max={new Date().toISOString().slice(0, 10)}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {initialData && isAdmin && (
                            <FormField
                                control={form.control}
                                name="approved_at"
                                render={({ field }) => (
                                    <FormItem className="min-w-0">
                                        <FormLabel>Approval date</FormLabel>
                                        <FormDescription className="text-xs">
                                            Admin only — set when correcting approval/disbursement history.
                                        </FormDescription>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                className="h-8 min-h-8 w-full px-2 text-xs"
                                                max={new Date().toISOString().slice(0, 10)}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>

                    {/* Loan metrics summary - shows when amount is entered */}
                    {(() => {
                        const principal = Number(watchLoanAmount) || 0;
                        const durationVal = Math.max(1, Number(watchLoanDuration) || 1);
                        const durationUnit = form.watch("duration_unit") || "months";
                        const repaymentFreq = form.watch("repayment_frequency") || "monthly";
                        const interestMethod = form.watch("interest_method") || "flat_rate";
                        const interestRateVal = parseFloat(form.watch("interest_rate") || "0") || (selectedProduct?.base_interest_rate ?? 30);
                        const interestFixedVal = parseFloat(form.watch("interest_fixed_amount") || "0") || 0;

                        const showMetrics = principal > 0;
                        if (!showMetrics) return null;

                        const periodsPerMonth = repaymentFreq === "weekly" ? 4.33 : repaymentFreq === "biweekly" ? 2.17 : 1;
                        const durationInMonths = durationUnit === "weeks" ? durationVal / 4.33 : durationUnit === "years" ? durationVal * 12 : durationVal;
                        const numInstallments = Math.max(1, Math.ceil(durationInMonths * periodsPerMonth));

                        let totalInterest = 0;
                        const ratePerPeriod = interestMethod === "fixed_fee" ? 0 : (interestRateVal / 100) / (repaymentFreq === "weekly" ? 4.33 : repaymentFreq === "biweekly" ? 2.17 : 1);
                        if (interestMethod === "fixed_fee") {
                            totalInterest = interestFixedVal;
                        } else if (interestMethod === "flat_rate") {
                            totalInterest = principal * ratePerPeriod * numInstallments;
                        } else if (interestMethod === "interest_only") {
                            totalInterest = principal * ratePerPeriod * numInstallments;
                        } else if (interestMethod === "reducing_balance" && ratePerPeriod > 0) {
                            const r = ratePerPeriod;
                            const n = numInstallments;
                            const pmt = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                            totalInterest = pmt * numInstallments - principal;
                        }
                        const totalRepayment = principal + totalInterest;
                        const installmentAmount = totalRepayment / numInstallments;

                        const cycleLabel = repaymentFreq === "weekly" ? "Weekly" : repaymentFreq === "biweekly" ? "Bi-weekly" : "Monthly";
                        const startDate = new Date();
                        const maturityDate = new Date(startDate);
                        const daysToAdd = repaymentFreq === "weekly" ? numInstallments * 7 : repaymentFreq === "biweekly" ? numInstallments * 14 : Math.ceil(durationInMonths * 30.44);
                        maturityDate.setDate(maturityDate.getDate() + daysToAdd);

                        return (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Loan Summary</p>
                                <div className="grid grid-cols-1 gap-3 rounded-lg border bg-primary/5 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Principal</p>
                                        <p className="font-semibold">{principal.toLocaleString()} UGX</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Interest</p>
                                        <p className="font-semibold">{interestMethod === "fixed_fee" ? `${interestFixedVal.toLocaleString()} UGX (fixed)` : `${interestRateVal}%`}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total interest</p>
                                        <p className="font-semibold">{totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })} UGX</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total repayment</p>
                                        <p className="font-semibold text-primary">{totalRepayment.toLocaleString(undefined, { maximumFractionDigits: 0 })} UGX</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">No. of installments</p>
                                        <p className="font-semibold">{numInstallments}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Repayment cycle</p>
                                        <p className="font-semibold">{cycleLabel}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Installment amount</p>
                                        <p className="font-semibold">{installmentAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} UGX</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Term</p>
                                        <p className="font-semibold">{numInstallments} {repaymentFreq === "weekly" ? "weeks" : repaymentFreq === "biweekly" ? "fortnights" : "months"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Maturity date</p>
                                        <p className="font-semibold">{maturityDate.toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="loan_purpose"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Purpose of Loan</FormLabel>
                                    <FormControl><Textarea {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {form.watch("application_type") === "group" && (
                            <FormField
                                control={form.control}
                                name="group_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Group Name</FormLabel>
                                        <FormControl><Input {...field} placeholder="Enter name of the group" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        {form.watch("loan_category") === "Business" && (
                            <FormField
                                control={form.control}
                                name="business_location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Business location</FormLabel>
                                        <FormDescription className="text-xs">Where the business operates (shown only for Business products)</FormDescription>
                                        <FormControl><Input {...field} placeholder="e.g. Kampala — Nakasero Market" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>

                    {/* Fee Breakdown Calculation Display */}
                    {selectedProduct && form.watch("loan_amount") && (
                        <Card className="bg-muted/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Fee Breakdown (M&T Microfinance 2026)</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-4">
                                {/* Application Stage Fees */}
                                <div>
                                    <p className="font-semibold text-xs text-muted-foreground mb-2">A. Application Stage (Payable Regardless of Approval)</p>
                                    <div className="space-y-1">
                                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                                            <span>Application Fee:</span>
                                            <span className="font-semibold">5,000 UGX</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                                            <span>Processing Fee:</span>
                                            <span className="font-semibold">5,000 UGX</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Upon Approval Fees */}
                                <div>
                                    <p className="font-semibold text-xs text-muted-foreground mb-2">B. Upon Approval (Before Disbursement)</p>
                                    <div className="space-y-1">
                                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                                            <span>Admission Fee:</span>
                                            <span className="font-semibold">5,000 UGX</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                                            <span>Passbook Fee:</span>
                                            <span className="font-semibold">5,000 UGX</span>
                                        </div>
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                            <span className="min-w-0 pr-2">Insurance (1% of principal):</span>
                                            <span className="shrink-0 font-semibold">
                                                {(Number(form.watch("loan_amount")) * 0.01).toLocaleString()} UGX
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                            <span className="min-w-0 pr-2">Security Deposit - 10% (Refundable):</span>
                                            <span className="shrink-0 font-semibold">
                                                {(Number(form.watch("loan_amount")) * 0.10).toLocaleString()} UGX
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Upfront Fees */}
                                <div className="pt-2 border-t">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between font-bold">
                                        <span>Total Upfront Fees:</span>
                                        <span className="break-all sm:break-normal">
                                            {(
                                                5000 + 5000 + 5000 + 5000 + 5000 +
                                                (Number(form.watch("loan_amount")) * 0.01) +
                                                (Number(form.watch("loan_amount")) * 0.10)
                                            ).toLocaleString()} UGX
                                        </span>
                                    </div>
                                    {form.watch("application_type") === "group" && (groupMembers.length + 1) > 0 && (
                                        <div className="mt-1 flex flex-col gap-1 text-blue-600 sm:flex-row sm:items-center sm:justify-between font-semibold">
                                            <span className="min-w-0">Per Member (Total Members: {groupMembers.length + 1}):</span>
                                            <span className="shrink-0">
                                                {(
                                                    (5000 + 5000 + 5000 + 5000 + 5000 +
                                                        (Number(form.watch("loan_amount")) * 0.01) +
                                                        (Number(form.watch("loan_amount")) * 0.10)) / (groupMembers.length + 1)
                                                ).toLocaleString(undefined, { maximumFractionDigits: 0 })} UGX
                                            </span>
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Net disbursement: {(
                                            Number(form.watch("loan_amount")) -
                                            (5000 + 5000 + 5000 + 5000 + 5000 + (Number(form.watch("loan_amount")) * 0.01))
                                        ).toLocaleString()} UGX (excl. refundable security deposit)
                                    </p>
                                </div>

                                {/* Conditional Fees */}
                                <div className="pt-2 border-t">
                                    <p className="font-semibold text-xs text-muted-foreground mb-2">C. Conditional Fees (If Applicable)</p>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
                                            <span className="min-w-0 pr-2">Late Payment Penalty (per missed installment):</span>
                                            <span className="shrink-0 font-medium">5,000 UGX</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
                                            <span className="min-w-0 pr-2">Loan Restructuring (≤ 600,000 UGX):</span>
                                            <span className="shrink-0 font-medium">30,000 UGX</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
                                            <span className="min-w-0 pr-2">Loan Restructuring (&gt; 600,000 UGX):</span>
                                            <span className="shrink-0 font-medium">60,000 UGX</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Separator />

                <div className="space-y-6">
                    {/* Group: Select Group Leader (existing borrower) | Individual: Borrower Information */}
                    {form.watch("application_type") === "group" ? (
                        <Card className="border-2 border-primary/10">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
                                        <Crown className="h-4 w-4" />
                                    </div>
                                    Group Leader
                                </CardTitle>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Select the borrower who will lead this group loan.
                                </p>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <Popover open={groupLeaderOpen} onOpenChange={setGroupLeaderOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={groupLeaderOpen}
                                            className="h-10 w-full justify-between px-3 text-sm font-normal hover:bg-muted/50"
                                        >
                                            {selectedGroupLeader ? (
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                        <User className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="flex flex-col items-start text-left min-w-0">
                                                        <span className="font-medium truncate">{selectedGroupLeader.full_name}</span>
                                                        <span className="text-xs text-muted-foreground truncate">{selectedGroupLeader.phone_number}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 text-muted-foreground">
                                                    <Search className="h-4 w-4 shrink-0" />
                                                    <span>Search borrower to be group leader...</span>
                                                </div>
                                            )}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-[520px] max-w-[calc(100vw-2rem)] p-0"
                                        align="start"
                                        side="bottom"
                                        sideOffset={8}
                                        avoidCollisions={false}
                                    >
                                        <Command className="rounded-lg border-0">
                                            <CommandInput placeholder="Search by name, phone, or email..." />
                                            <CommandList className="max-h-[280px]">
                                                <CommandEmpty>No borrower found.</CommandEmpty>
                                                <CommandGroup>
                                                    {borrowers.map((b) => (
                                                        <CommandItem
                                                            key={b.id}
                                                            value={`${b.full_name} ${b.phone_number} ${b.email || ""}`}
                                                            onSelect={() => {
                                                                handleSelectGroupLeader(b);
                                                                setGroupLeaderOpen(false);
                                                            }}
                                                            className="py-3"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                                </div>
                                                                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                                    <span className="font-medium">{b.full_name}</span>
                                                                    <span className="text-xs text-muted-foreground">{b.phone_number}{b.email ? ` · ${b.email}` : ""}</span>
                                                                </div>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {selectedGroupLeader && form.watch("loan_amount") && (
                                    <div className="mt-4 space-y-2">
                                        <Label className="text-sm">Group Leader&apos;s Share (UGX)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={groupLeaderAmount || ""}
                                            onChange={(e) => setGroupLeaderAmount(Number(e.target.value) || 0)}
                                            placeholder="Amount for group leader"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-2 border-primary/10">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                                        <User className="h-3.5 w-3.5" />
                                    </div>
                                    Select Borrower
                                </CardTitle>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Select a registered borrower from the directory. Borrowers are registered first, then attached to loans.
                                </p>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <Popover open={individualBorrowerOpen} onOpenChange={setIndividualBorrowerOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={individualBorrowerOpen}
                                            className="h-10 w-full justify-between px-3 text-sm font-normal hover:bg-muted/50"
                                        >
                                            {selectedBorrowerForIndividual ? (
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                        <User className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="flex flex-col items-start text-left min-w-0">
                                                        <span className="font-medium truncate">{selectedBorrowerForIndividual.full_name}</span>
                                                        <span className="text-xs text-muted-foreground truncate">{selectedBorrowerForIndividual.phone_number}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 text-muted-foreground">
                                                    <Search className="h-4 w-4 shrink-0" />
                                                    <span>Search borrower to attach to this loan...</span>
                                                </div>
                                            )}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-[520px] max-w-[calc(100vw-2rem)] p-0"
                                        align="start"
                                        side="bottom"
                                        sideOffset={8}
                                        avoidCollisions={false}
                                    >
                                        <Command className="rounded-lg border-0">
                                            <CommandInput placeholder="Search by name, phone, or email..." />
                                            <CommandList className="max-h-[280px]">
                                                <CommandEmpty>No borrower found.</CommandEmpty>
                                                <CommandGroup>
                                                    {borrowers.map((b) => (
                                                        <CommandItem
                                                            key={b.id}
                                                            value={`${b.full_name} ${b.phone_number} ${b.email || ""}`}
                                                            onSelect={() => {
                                                                setSelectedBorrowerForIndividual(b);
                                                                form.setValue("borrower_id", b.id);
                                                                setIndividualBorrowerOpen(false);
                                                            }}
                                                            className="py-3"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                                </div>
                                                                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                                    <span className="font-medium">{b.full_name}</span>
                                                                    <span className="text-xs text-muted-foreground">{b.phone_number}{b.email ? ` · ${b.email}` : ""}</span>
                                                                </div>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {selectedBorrowerForIndividual && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Borrower: {selectedBorrowerForIndividual.full_name} · {selectedBorrowerForIndividual.phone_number}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Group Members Section - select existing borrowers */}
                    {form.watch("application_type") === "group" && (
                        <Card className="border-2 border-primary/10">
                            <CardHeader className="pb-3">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Users className="h-4 w-4 shrink-0 text-primary" />
                                            Other Group Members
                                        </CardTitle>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Select existing borrowers. All members serve as co-guarantors for the group&apos;s total loan liability.
                                        </p>
                                    </div>
                                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:shrink-0">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-9 min-h-9 w-full touch-manipulation text-xs sm:w-auto"
                                            onClick={distributeEqually}
                                            disabled={!form.watch("loan_amount") || (groupMembers.length === 0 && !selectedGroupLeader)}
                                        >
                                            Distribute equally
                                        </Button>
                                        <Popover open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                                            <PopoverTrigger asChild>
                                                <Button type="button" size="sm" className="h-9 min-h-9 w-full touch-manipulation text-xs sm:w-auto">
                                                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Member
                                                </Button>
                                            </PopoverTrigger>
                                        <PopoverContent
                                            className="w-[520px] max-w-[calc(100vw-2rem)] p-0"
                                            align="center"
                                            side="bottom"
                                            sideOffset={8}
                                            avoidCollisions={false}
                                        >
                                            <Command className="rounded-lg border-0">
                                                <CommandInput placeholder="Search by name, phone, or email..." />
                                                <CommandList className="max-h-[280px]">
                                                    <CommandEmpty>No borrower found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {borrowers
                                                            .filter((b) => b.id !== selectedGroupLeader?.id && !groupMembers.some((m: any) => m.id === b.id))
                                                            .map((b) => (
                                                                <CommandItem
                                                                    key={b.id}
                                                                    value={`${b.full_name} ${b.phone_number} ${b.email || ""}`}
                                                                    onSelect={() => {
                                                                        addGroupMember(b);
                                                                        setAddMemberOpen(false);
                                                                    }}
                                                                    className="py-3"
                                                                >
                                                                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                                        <span className="font-medium">{b.full_name}</span>
                                                                        <span className="text-xs text-muted-foreground">{b.phone_number}{b.email ? ` · ${b.email}` : ""}</span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                    </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {form.watch("loan_amount") && (selectedGroupLeader || groupMembers.length > 0) && (
                                    <div className="mb-4 p-3 rounded-lg bg-muted/50 text-sm">
                                        <span className="font-medium">Total allocated: </span>
                                        <span className={Math.abs((groupLeaderAmount + groupMembers.reduce((s, m) => s + (m.amount ?? 0), 0)) - Number(form.watch("loan_amount") || 0)) <= 1 ? "text-green-600" : "text-amber-600"}>
                                            {(groupLeaderAmount + groupMembers.reduce((s, m) => s + (m.amount ?? 0), 0)).toLocaleString()} UGX
                                        </span>
                                        <span className="text-muted-foreground"> / {Number(form.watch("loan_amount")).toLocaleString()} UGX</span>
                                    </div>
                                )}
                                {groupMembers.length > 0 ? (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {groupMembers.map((member, index) => (
                                            <div
                                                key={member.id || index}
                                                className="flex flex-col gap-3 rounded-lg border bg-muted/40 px-3 py-3 shadow-sm transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between sm:px-4"
                                            >
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                        <User className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium truncate">{member.full_name || member.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{member.phone_number || member.phone}</p>
                                                        {form.watch("loan_amount") && (
                                                            <div className="mt-2">
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    placeholder="Amount (UGX)"
                                                                    className="h-7 text-xs"
                                                                    value={member.amount ?? ""}
                                                                    onChange={(e) => updateGroupMemberAmount(index, Number(e.target.value) || 0)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 min-h-8 shrink-0 self-end px-2 text-muted-foreground hover:text-destructive sm:self-auto"
                                                    onClick={() => removeGroupMember(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 py-12 px-6 text-center">
                                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                            <UserPlus className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <p className="font-medium text-muted-foreground">No members added yet</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Click &quot;Add Member&quot; to select from existing borrowers in the system.
                                        </p>
                                    </div>
                                )}
                                {form.watch("application_type") === "group" &&
                                    form.watch("loan_amount") &&
                                    form.watch("loan_duration") &&
                                    Math.abs((groupLeaderAmount + groupMembers.reduce((s, m) => s + (m.amount ?? 0), 0)) - Number(form.watch("loan_amount") || 0)) <= 1 && (
                                    <div className="mt-4 rounded-lg border bg-primary/5 p-4">
                                        <p className="text-sm font-semibold mb-3">Per-member repayment schedule</p>
                                        <div className="space-y-2 text-sm">
                                            {selectedGroupLeader && groupLeaderAmount > 0 && (
                                                <div className="flex justify-between items-center py-2 border-b">
                                                    <span className="font-medium">{selectedGroupLeader.full_name} (Leader)</span>
                                                    <span>UGX {(() => {
                                                        const d = Number(form.watch("loan_duration")) || 1;
                                                        const du = form.watch("duration_unit") || "months";
                                                        const rf = form.watch("repayment_frequency") || "monthly";
                                                        const months = du === "weeks" ? d / 4.33 : du === "years" ? d * 12 : d;
                                                        const periodsPerMonth = rf === "weekly" ? 4.33 : rf === "biweekly" ? 2.17 : 1;
                                                        const numPeriods = Math.ceil(months * periodsPerMonth);
                                                        const rate = parseFloat(form.watch("interest_rate") || "30") / 100 || 0.30;
                                                        const totalPerLeader = groupLeaderAmount * (1 + rate);
                                                        return `${(totalPerLeader / numPeriods).toLocaleString(undefined, { maximumFractionDigits: 0 })}/${rf === "weekly" ? "week" : rf === "biweekly" ? "fortnight" : "month"} × ${numPeriods} ${rf === "weekly" ? "weeks" : rf === "biweekly" ? "fortnights" : "months"}`;
                                                    })()}</span>
                                                </div>
                                            )}
                                            {groupMembers.filter((m: any) => (m.amount ?? 0) > 0).map((m: any, i: number) => {
                                                const amt = m.amount ?? 0;
                                                const d = Number(form.watch("loan_duration")) || 1;
                                                const du = form.watch("duration_unit") || "months";
                                                const rf = form.watch("repayment_frequency") || "monthly";
                                                const months = du === "weeks" ? d / 4.33 : du === "years" ? d * 12 : d;
                                                const periodsPerMonth = rf === "weekly" ? 4.33 : rf === "biweekly" ? 2.17 : 1;
                                                const numPeriods = Math.ceil(months * periodsPerMonth);
                                                const rate = parseFloat(form.watch("interest_rate") || "30") / 100 || 0.30;
                                                const totalPerMember = amt * (1 + rate);
                                                const periodLabel = rf === "weekly" ? "week" : rf === "biweekly" ? "fortnight" : "month";
                                                const termLabel = rf === "weekly" ? "weeks" : rf === "biweekly" ? "fortnights" : "months";
                                                return (
                                                    <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                                                        <span className="font-medium">{m.full_name || m.name}</span>
                                                        <span>UGX {(totalPerMember / numPeriods).toLocaleString(undefined, { maximumFractionDigits: 0 })}/{periodLabel} × {numPeriods} {termLabel}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Separator />

                {/* Security & Collateral — list what’s available for the selected borrower(s), then optionally attach */}
                {showCollateralSection && (
                    <>
                        <Card className="border-2 border-primary/10">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                                        <Shield className="h-4 w-4" />
                                    </div>
                                    Security & Collateral (Secured Loans Only)
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {form.watch("application_type") === "individual" && selectedBorrowerForIndividual?.full_name
                                        ? `Collateral in the register for ${selectedBorrowerForIndividual.full_name} (not already linked to another loan).`
                                        : form.watch("application_type") === "group"
                                            ? "Collateral owned by the group leader or members (not already linked to another loan)."
                                            : "Collateral in the register for the selected borrower (not already linked to another loan)."}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg border bg-muted/20 p-3">
                                    <p className="text-sm font-medium mb-1">Available collateral</p>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Click <span className="font-medium text-foreground">Attach</span> on an item to link it to this application (saved when you submit). You can also use the selector below.
                                    </p>
                                    {memberOwnedCollateral.length === 0 ? (
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">
                                                No unlinked collateral items found for this borrower in the register. You can register assets first, then return to this application.
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="w-full sm:w-auto"
                                                onClick={() => {
                                                    const bid = selectedBorrowerForIndividual?.id || initialData?.borrower_id;
                                                    navigate(bid ? `/staff-dashboard/collateral/add?borrower=${encodeURIComponent(bid)}` : "/staff-dashboard/collateral/add");
                                                }}
                                            >
                                                Open collateral register / add asset
                                            </Button>
                                        </div>
                                    ) : (
                                        <ul className="max-h-[280px] overflow-y-auto space-y-2 text-sm divide-y divide-border/60">
                                            {memberOwnedCollateral.map((c: any) => {
                                                const isAttached = selectedCollateral?.id === c.id;
                                                return (
                                                <li key={c.id} className="pt-2 first:pt-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                                                <span className="font-medium">{c.type || "Collateral"}</span>
                                                                <span className="text-primary font-semibold tabular-nums shrink-0">
                                                                    UGX {(c.estimated_value ?? c.current_value ?? 0).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <span className="text-muted-foreground">{c.description || "—"}</span>
                                                            {(c.make_model || c.serial_number || c.plate_number) && (
                                                                <span className="text-xs text-muted-foreground font-mono">
                                                                    {[c.make_model, c.serial_number, c.plate_number].filter(Boolean).join(" · ")}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant={isAttached ? "default" : "outline"}
                                                            className="shrink-0 w-full sm:w-auto"
                                                            onClick={() => handleSelectCollateral(isAttached ? null : c)}
                                                        >
                                                            {isAttached ? (
                                                                <>
                                                                    <Check className="h-3.5 w-3.5 mr-1.5" />
                                                                    Attached
                                                                </>
                                                            ) : (
                                                                "Attach"
                                                            )}
                                                        </Button>
                                                    </div>
                                                </li>
                                            );})}
                                        </ul>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">
                                        {memberOwnedCollateral.length > 0
                                            ? "Confirm selection (optional — or use buttons above)"
                                            : "Attach from register (optional)"}
                                    </Label>
                                    {memberOwnedCollateral.length === 0 ? (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Once collateral exists for this borrower, select it here to link it when you submit.
                                        </p>
                                    ) : (
                                    <>
                                    <Popover modal open={collateralOpen} onOpenChange={setCollateralOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={collateralOpen}
                                                className="mt-2 h-10 w-full justify-between px-3 text-sm font-normal hover:bg-muted/50"
                                            >
                                                {selectedCollateral ? (
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                            <Shield className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex flex-col items-start text-left min-w-0">
                                                            <span className="font-medium truncate">{selectedCollateral.type} — {selectedCollateral.description?.slice(0, 40)}{selectedCollateral.description?.length > 40 ? "…" : ""}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {selectedCollateral.client_name ? `Owner: ${selectedCollateral.client_name} · ` : ""}UGX {(selectedCollateral.estimated_value || selectedCollateral.current_value || 0).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3 text-muted-foreground">
                                                        <Search className="h-4 w-4 shrink-0" />
                                                        <span>Open list to search or pick collateral…</span>
                                                    </div>
                                                )}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-[520px] max-w-[calc(100vw-2rem)] p-0"
                                            align="start"
                                            side="bottom"
                                            sideOffset={8}
                                            avoidCollisions={false}
                                            onOpenAutoFocus={(e) => e.preventDefault()}
                                        >
                                            <Command className="rounded-lg border-0">
                                                <CommandInput
                                                    ref={collateralSearchRef}
                                                    placeholder="Search by type, description or owner..."
                                                />
                                                <CommandList className="max-h-[280px]">
                                                    <CommandEmpty>No collateral owned by members.</CommandEmpty>
                                                    <CommandGroup>
                                                        <CommandItem
                                                            value="clear selection"
                                                            onSelect={() => {
                                                                handleSelectCollateral(null);
                                                                setCollateralOpen(false);
                                                            }}
                                                        >
                                                            <span className="text-muted-foreground italic">Clear selection</span>
                                                        </CommandItem>
                                                        {memberOwnedCollateral.map((c) => (
                                                            <CommandItem
                                                                key={c.id}
                                                                value={`${c.type} ${c.description || ""} ${c.client_name || ""} ${c.estimated_value || c.current_value || ""}`}
                                                                onSelect={() => {
                                                                    handleSelectCollateral(c);
                                                                    setCollateralOpen(false);
                                                                }}
                                                                className="py-3"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                                                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                                                    </div>
                                                                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                                        <span className="font-medium">{c.type}</span>
                                                                        <span className="text-xs text-muted-foreground truncate">{c.description || "No description"}</span>
                                                                        <span className="text-xs text-muted-foreground">{c.client_name ? `Owner: ${c.client_name}` : ""}</span>
                                                                        <span className="text-xs font-medium text-primary">UGX {(c.estimated_value || c.current_value || 0).toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription className="text-xs mt-1">
                                        Same list as above — use if you prefer search. Submitting the application links the selected item to this loan.
                                    </FormDescription>
                                    </>
                                    )}
                                </div>

                                {memberOwnedCollateral.length > 0 && (
                                    <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md border">
                                        <p className="font-medium mb-1">Security Confirmation:</p>
                                        <p>✓ The Borrower confirms lawful ownership of pledged security</p>
                                        <p>✓ Security is free from third-party claims</p>
                                        <p>✓ The Borrower grants peaceful access to pledged security in the event of default</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}

                <Separator />

                {/* Guarantors (Only for Individual Loans) - Search and select from directory */}
                {form.watch("application_type") === "individual" && (
                    <Card className="border-2 border-primary/10">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-primary" />
                                        Guarantors
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Search and add guarantors from the guarantors directory (max 2).
                                    </p>
                                </div>
                                <Popover open={addGuarantorOpen} onOpenChange={setAddGuarantorOpen}>
                                    <PopoverTrigger asChild>
                                        <Button type="button" size="sm" disabled={guarantors.length >= 2}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Guarantor
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-[520px] max-w-[calc(100vw-2rem)] p-0"
                                        align="center"
                                        side="bottom"
                                        sideOffset={8}
                                        avoidCollisions={false}
                                    >
                                        <Command className="rounded-lg border-0">
                                            <CommandInput placeholder="Search by name, phone, or ID number..." />
                                            <CommandList className="max-h-[280px]">
                                                <CommandEmpty>No guarantor found.</CommandEmpty>
                                                <CommandGroup>
                                                    {guarantorsDirectory
                                                        .filter((g) => !guarantors.some((x) => (x.id && x.id === g.id) || (x.phone === g.phone_number && x.name === g.full_name)))
                                                        .map((g) => (
                                                            <CommandItem
                                                                key={g.id}
                                                                value={`${g.full_name} ${g.phone_number} ${g.id_number || ""} ${g.address || ""}`}
                                                                onSelect={() => {
                                                                    addGuarantorFromDirectory(g);
                                                                    setAddGuarantorOpen(false);
                                                                }}
                                                                className="py-3"
                                                            >
                                                                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                                    <span className="font-medium">{g.full_name}</span>
                                                                    <span className="text-xs text-muted-foreground">{g.phone_number}{g.id_number ? ` · NIN: ${g.id_number}` : ""}</span>
                                                                    {g.address && <span className="text-xs text-muted-foreground truncate">{g.address}</span>}
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {guarantors.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {guarantors.map((guarantor, index) => (
                                        <div
                                            key={guarantor.id || index}
                                            className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3 shadow-sm transition-colors hover:bg-muted/60"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <Shield className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate">{guarantor.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{guarantor.phone}</p>
                                                    {(guarantor.nin || guarantor.id_number) && (
                                                        <p className="text-xs text-muted-foreground font-mono">NIN: {guarantor.nin || guarantor.id_number}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="shrink-0 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeGuarantor(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic py-2">No guarantors added. Use &quot;Add Guarantor&quot; to search and select from the directory.</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" size="sm" onClick={onCancel} className="h-9 min-h-9 w-full text-xs touch-manipulation sm:w-auto">
                        Cancel
                    </Button>
                    <Button type="submit" size="sm" className="h-9 min-h-9 w-full text-xs touch-manipulation sm:w-auto">
                        Submit Application
                    </Button>
                </div>
            </form>
        </Form >
    );
}
