import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, UserPlus, Plus } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Schema for Guarantor
const guarantorSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone number is required"),
    nin: z.string().optional(),
    address: z.string().optional(),
});

// Schema for Loan Application
const formSchema = z.object({
    // Applicant Details
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    phone_number: z.string().min(10, "Phone number must be valid"),
    id_number: z.string().min(5, "ID Number is required"),
    date_of_birth: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', { message: "Valid date is required" }),

    // Address
    district: z.string().min(1, "District is required"),
    division: z.string().optional(),
    county: z.string().optional(),
    sub_county: z.string().optional(),
    parish: z.string().optional(),
    village: z.string().min(1, "Village is required"),

    // Loan Details
    loan_product: z.string().min(1, "Select a loan product"),
    loan_category: z.string().min(1, "Select a loan category"), // Business, School Fees, etc.
    loan_amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
    }),
    loan_duration_months: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Duration must be a positive number",
    }),
    loan_purpose: z.string().min(5, "Purpose is required"),
    business_location: z.string().optional(),
    group_name: z.string().optional(),

    // Security & Collateral (for secured loans)
    security_type: z.string().optional(),
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
});

type FormValues = z.infer<typeof formSchema>;

interface LoanApplicationFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: any; // Add initialData prop
}

export function LoanApplicationForm({ onSuccess, onCancel, initialData }: LoanApplicationFormProps) {
    const { toast } = useToast();
    const [loanProducts, setLoanProducts] = useState<any[]>([]);
    // Use a simplified local state for guarantors since useFieldArray can be complex with shadcn form sometimes
    const [guarantors, setGuarantors] = useState<any[]>(initialData?.guarantors || [{ name: "", phone: "", nin: "", address: "" }]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({
        national_id: null,
        lc1_letter: null,
        recommendation_letter: null,
        passport_photo: null,
        income_statement: null,
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            full_name: initialData?.full_name || "",
            email: initialData?.email || "",
            phone_number: initialData?.phone_number || "",
            id_number: initialData?.id_number || "",
            date_of_birth: initialData?.date_of_birth?.split('T')[0] || "",
            district: initialData?.address?.split(', ')[3] || "", // Basic parsing, can be improved
            division: "",
            county: initialData?.address?.split(', ')[2] || "",
            sub_county: initialData?.address?.split(', ')[2] || "",
            parish: initialData?.address?.split(', ')[1] || "",
            village: initialData?.address?.split(', ')[0] || "",
            loan_product: initialData?.loan_product || "",
            loan_category: initialData?.loan_category || "Business",
            loan_amount: initialData?.loan_amount?.toString() || "",
            loan_duration_months: initialData?.loan_duration_months?.toString() || "",
            loan_purpose: initialData?.loan_purpose || "",
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
    useEffect(() => {
        if (watchProduct) {
            const product = loanProducts.find(p => p.name === watchProduct);
            setSelectedProduct(product);
        }
    }, [watchProduct, loanProducts]);

    const addGuarantor = () => {
        if (guarantors.length < 2) { // Max 2 guarantors usually
            setGuarantors([...guarantors, { name: "", phone: "", nin: "", address: "" }]);
        }
    };

    const removeGuarantor = (index: number) => {
        const newGuarantors = [...guarantors];
        newGuarantors.splice(index, 1);
        setGuarantors(newGuarantors);
    };

    const updateGuarantor = (index: number, field: string, value: string) => {
        const newGuarantors = [...guarantors];
        newGuarantors[index] = { ...newGuarantors[index], [field]: value };
        setGuarantors(newGuarantors);
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

    const [groupMembers, setGroupMembers] = useState<any[]>(initialData?.group_members || []);

    const addGroupMember = () => {
        setGroupMembers([...groupMembers, {
            name: "",
            phone: "",
            id_number: "",
            email: "",
            date_of_birth: "",
            district: "",
            county: "",
            sub_county: "",
            parish: "",
            village: ""
        }]);
    };

    const removeGroupMember = (index: number) => {
        const newMembers = [...groupMembers];
        newMembers.splice(index, 1);
        setGroupMembers(newMembers);
    };

    const updateGroupMember = (index: number, field: string, value: string) => {
        const newMembers = [...groupMembers];
        newMembers[index] = { ...newMembers[index], [field]: value };
        setGroupMembers(newMembers);
    };

    const onSubmit = async (values: FormValues) => {
        try {
            const user = await api.auth.getMe();

            if (!user) {
                toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
                return;
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

            const applicationData = {
                user_id: user.id, // Loan Officer ID
                full_name: values.full_name,
                email: values.email || `${values.full_name.replace(/\s+/g, '').toLowerCase()}@placeholder.com`,
                phone_number: values.phone_number,
                id_number: values.id_number,
                date_of_birth: values.date_of_birth,

                // Address
                district: values.district,
                division: values.division,
                county: values.county,
                sub_county: values.sub_county,
                parish: values.parish,
                village: values.village,
                address: `${values.village}, ${values.parish}, ${values.sub_county}, ${values.district}`,

                // Loan Info
                loan_product: values.loan_product,
                loan_category: values.loan_category,
                loan_amount: Number(values.loan_amount),
                loan_duration_months: Number(values.loan_duration_months),
                loan_purpose: values.loan_purpose,
                business_location: values.business_location,
                employment_status: "Self-Employed",

                // Security & Collateral
                security_type: values.security_type || null,
                security_value: values.security_value ? Number(values.security_value) : null,
                insurance_status: values.insurance_status || "Not Insured",

                // Document Attachments
                // Document Attachments - Use new upload URL or fallback to existing URL
                attachment_national_id: uploadedUrls.national_id || initialData?.attachment_national_id || null,
                attachment_lc1_letter: uploadedUrls.lc1_letter || initialData?.attachment_lc1_letter || null,
                attachment_recommendation_letter: uploadedUrls.recommendation_letter || initialData?.attachment_recommendation_letter || null,
                attachment_passport_photo: uploadedUrls.passport_photo || initialData?.attachment_passport_photo || null,
                attachment_income_statement: uploadedUrls.income_statement || initialData?.attachment_income_statement || null,
                attachment_uploaded_at: uploadedUrls.national_id ? new Date().toISOString() : null,

                // JSON Fields
                guarantors: guarantors,
                group_name: values.group_name || null,
                group_members: form.watch("loan_product") === "Group Loan" ? groupMembers : [],
                status: initialData ? initialData.status : "pending"
            };

            if (initialData) {
                // Update existing application
                await api.applications.update(initialData.id, applicationData);
                toast({ title: "Success", description: "Loan application updated successfully" });
            } else {
                // Create new application
                const loanData = await api.applications.create(applicationData);

                // Automatically Register Collateral in the register if available (only on create for now)
                if (values.security_type && values.security_value) {
                    try {
                        await api.collateral.create({
                            loan_application_id: loanData.id,
                            type: values.security_type,
                            description: `Pledged for loan application: ${values.loan_purpose.substring(0, 50)}...`,
                            estimated_value: Number(values.security_value),
                            current_value: Number(values.security_value),
                            status: 'active',
                            notes: `Automatically registered from loan application on ${new Date().toLocaleDateString()}`
                        });
                    } catch (collateralError) {
                        console.error("Error registering collateral:", collateralError);
                    }
                }
                toast({ title: "Success", description: "Loan application submitted successfully" });
            }

            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.error("Form Validation Errors:", errors);
                toast({
                    title: "Validation Error",
                    description: "Please check the form for missing or invalid fields.",
                    variant: "destructive"
                });
            })} className="space-y-6">
                {/* Loan Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Loan Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField
                            control={form.control}
                            name="loan_product"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Loan Product</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Product" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {loanProducts.map((product) => (
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
                            name="loan_category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Loan Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Category" />
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
                            name="loan_amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount (UGX)</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="loan_duration_months"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duration (Months)</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
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
                        {form.watch("loan_product") === "Group Loan" && (
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
                                    <div className="flex justify-between">
                                        <span>Loan Processing Fee (Non-refundable):</span>
                                        <span className="font-semibold">15,000 UGX</span>
                                    </div>
                                </div>

                                {/* Upon Approval Fees */}
                                <div>
                                    <p className="font-semibold text-xs text-muted-foreground mb-2">B. Upon Approval (Before Disbursement)</p>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span>Admission & Passbook Fee:</span>
                                            <span className="font-semibold">10,000 UGX</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Monitoring Fee (3%):</span>
                                            <span className="font-semibold">
                                                {(Number(form.watch("loan_amount")) * 0.03).toLocaleString()} UGX
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Security Deposit - 10% (Refundable):</span>
                                            <span className="font-semibold">
                                                {(Number(form.watch("loan_amount")) * 0.10).toLocaleString()} UGX
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Upfront Fees */}
                                <div className="pt-2 border-t">
                                    <div className="flex justify-between font-bold">
                                        <span>Total Upfront Fees:</span>
                                        <span>
                                            {(
                                                15000 + 10000 +
                                                (Number(form.watch("loan_amount")) * 0.03) +
                                                (Number(form.watch("loan_amount")) * 0.10)
                                            ).toLocaleString()} UGX
                                        </span>
                                    </div>
                                    {form.watch("loan_product") === "Group Loan" && (
                                        <div className="flex justify-between text-blue-600 font-semibold mt-1">
                                            <span>Per Member (Total Members: {groupMembers.length + 1}):</span>
                                            <span>
                                                {(
                                                    (15000 + 10000 +
                                                        (Number(form.watch("loan_amount")) * 0.03) +
                                                        (Number(form.watch("loan_amount")) * 0.10)) / (groupMembers.length + 1)
                                                ).toLocaleString(undefined, { maximumFractionDigits: 0 })} UGX
                                            </span>
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Net disbursement: {(
                                            Number(form.watch("loan_amount")) -
                                            (15000 + 10000 + (Number(form.watch("loan_amount")) * 0.03))
                                        ).toLocaleString()} UGX
                                    </p>
                                </div>

                                {/* Conditional Fees */}
                                <div className="pt-2 border-t">
                                    <p className="font-semibold text-xs text-muted-foreground mb-2">C. Conditional Fees (If Applicable)</p>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span>Late Payment Penalty (per missed installment):</span>
                                            <span className="font-medium">10,000 UGX</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Loan Restructuring (≤ 600,000 UGX):</span>
                                            <span className="font-medium">30,000 UGX</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Loan Restructuring (&gt; 600,000 UGX):</span>
                                            <span className="font-medium">60,000 UGX</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Separator />

                <div className="space-y-6">
                    {/* Member 1 (Group Leader) Section */}
                    <Card className="border-2 border-primary/20">
                        <CardHeader className="bg-primary/5 pb-3">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                {form.watch("loan_product") === "Group Loan" && (
                                    <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs">MEMBER 1</span>
                                )}
                                {form.watch("loan_product") === "Group Loan" ? "Group Leader Information" : "Borrower Information"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground border-b pb-1">Personal Details</h4>
                                <FormField
                                    control={form.control}
                                    name="full_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl><Input {...field} placeholder="Full legal name" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="phone_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="id_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>National ID (NIN)</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email (Optional)</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="date_of_birth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date of Birth</FormLabel>
                                                <FormControl><Input type="date" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground border-b pb-1">Address & Business</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="district"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>District</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="county"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>County</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="sub_county"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sub-County/Division</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="parish"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Parish</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="village"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Village</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="business_location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business Location</FormLabel>
                                            <FormControl><Input {...field} placeholder="Where the business is located" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Group Members Section */}
                    {form.watch("loan_product") === "Group Loan" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Other Group Members</h3>
                                <Button type="button" variant="outline" size="sm" onClick={addGroupMember}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Member
                                </Button>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-md mb-4 flex items-start gap-2 border border-blue-100">
                                <div className="bg-blue-500 text-white rounded-full p-1 mt-0.5">
                                    <Plus className="h-3 w-3" />
                                </div>
                                <p className="text-xs text-blue-700 leading-tight">
                                    <strong>Co-Guarantee Notice:</strong> All group members serve as co-guarantors for the group's total loan liability.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {groupMembers.map((member, index) => (
                                    <Card key={index} className="border-2 border-muted shadow-sm">
                                        <CardHeader className="bg-muted/30 py-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-muted-foreground text-white px-2 py-0.5 rounded text-[10px] font-bold">MEMBER {index + 2}</span>
                                                    <span className="text-sm font-semibold uppercase tracking-wider">Group Member</span>
                                                </div>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeGroupMember(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <h5 className="text-[10px] font-bold uppercase text-muted-foreground border-b pb-1">Personal Details</h5>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] text-muted-foreground uppercase font-semibold">Full Name</label>
                                                            <Input
                                                                placeholder="Member Name"
                                                                value={member.name}
                                                                onChange={(e) => updateGroupMember(index, 'name', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] text-muted-foreground uppercase font-semibold">Phone Number</label>
                                                            <Input
                                                                placeholder="Phone"
                                                                value={member.phone}
                                                                onChange={(e) => updateGroupMember(index, 'phone', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] text-muted-foreground uppercase font-semibold">National ID / NIN</label>
                                                            <Input
                                                                placeholder="NIN"
                                                                value={member.id_number}
                                                                onChange={(e) => updateGroupMember(index, 'id_number', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] text-muted-foreground uppercase font-semibold">Email (Optional)</label>
                                                            <Input
                                                                placeholder="Email"
                                                                value={member.email}
                                                                onChange={(e) => updateGroupMember(index, 'email', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] text-muted-foreground uppercase font-semibold">Date of Birth</label>
                                                            <Input
                                                                type="date"
                                                                value={member.date_of_birth}
                                                                onChange={(e) => updateGroupMember(index, 'date_of_birth', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h5 className="text-[10px] font-bold uppercase text-muted-foreground border-b pb-1">Address Details</h5>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] text-muted-foreground uppercase font-semibold">District</label>
                                                            <Input
                                                                placeholder="District"
                                                                value={member.district}
                                                                onChange={(e) => updateGroupMember(index, 'district', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] text-muted-foreground uppercase font-semibold">County</label>
                                                            <Input
                                                                placeholder="County"
                                                                value={member.county}
                                                                onChange={(e) => updateGroupMember(index, 'county', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] text-muted-foreground uppercase font-semibold">Sub-County</label>
                                                            <Input
                                                                placeholder="Sub-County"
                                                                value={member.sub_county}
                                                                onChange={(e) => updateGroupMember(index, 'sub_county', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] text-muted-foreground uppercase font-semibold">Parish</label>
                                                            <Input
                                                                placeholder="Parish"
                                                                value={member.parish}
                                                                onChange={(e) => updateGroupMember(index, 'parish', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1 col-span-2">
                                                            <label className="text-[10px] text-muted-foreground uppercase font-semibold">Village / Residence</label>
                                                            <Input
                                                                placeholder="Village"
                                                                value={member.village}
                                                                onChange={(e) => updateGroupMember(index, 'village', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Security & Collateral (Secured Loans Only) */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Security & Collateral (Secured Loans Only)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="security_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type of Security</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="e.g., Land Title, Vehicle, Equipment" />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Leave blank if not applicable (unsecured loan)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="security_value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estimated Value (UGX)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} placeholder="e.g., 5000000" />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Approximate value of the pledged security
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md border">
                        <p className="font-medium mb-1">Security Confirmation:</p>
                        <p>✓ The Borrower confirms lawful ownership of pledged security</p>
                        <p>✓ Security is free from third-party claims</p>
                        <p>✓ The Borrower grants peaceful access to pledged security in the event of default</p>
                    </div>
                </div>

                <Separator />

                {/* Guarantors (Only for Individual Loans) */}
                {form.watch("loan_product") !== "Group Loan" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Guarantors Information</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addGuarantor}>
                                <Plus className="mr-2 h-4 w-4" /> Add Guarantor
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {guarantors.map((guarantor, index) => (
                                <Card key={index}>
                                    <CardContent className="pt-6 space-y-3">
                                        <div className="flex justify-between">
                                            <h4 className="font-medium">Guarantor {index + 1}</h4>
                                            {index > 0 && (
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeGuarantor(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>
                                        <Input
                                            placeholder="Full Name"
                                            value={guarantor.name}
                                            onChange={(e) => updateGuarantor(index, 'name', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Phone Number"
                                            value={guarantor.phone}
                                            onChange={(e) => updateGuarantor(index, 'phone', e.target.value)}
                                        />
                                        <Input
                                            placeholder="National ID / NIN"
                                            value={guarantor.nin}
                                            onChange={(e) => updateGuarantor(index, 'nin', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Address / Residence"
                                            value={guarantor.address}
                                            onChange={(e) => updateGuarantor(index, 'address', e.target.value)}
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                <Separator />

                {/* Document Attachments */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold">Required Attachments</h3>
                        <p className="text-sm text-muted-foreground">Please upload the following documents (PDF, JPG, or PNG, max 5MB each)</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* National ID */}
                        <div className="space-y-2">
                            <FormLabel className="flex items-center gap-2">
                                <span className="text-destructive">*</span>
                                1. National Identity Card (Photocopy)
                            </FormLabel>
                            <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange('national_id', e)}
                                className="cursor-pointer"
                            />
                            {uploadedFiles.national_id && (
                                <p className="text-xs text-green-600">✓ {uploadedFiles.national_id.name}</p>
                            )}
                        </div>

                        {/* LC1 Letter */}
                        <div className="space-y-2">
                            <FormLabel className="flex items-center gap-2">
                                <span className="text-destructive">*</span>
                                2. LC1 Recommendation Letter
                            </FormLabel>
                            <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange('lc1_letter', e)}
                                className="cursor-pointer"
                            />
                            {uploadedFiles.lc1_letter && (
                                <p className="text-xs text-green-600">✓ {uploadedFiles.lc1_letter.name}</p>
                            )}
                        </div>

                        {/* Other Recommendation Letter */}
                        <div className="space-y-2">
                            <FormLabel className="flex items-center gap-2">
                                <span className="text-destructive">*</span>
                                3. Recommendation Letter
                            </FormLabel>
                            <FormDescription className="text-xs">
                                (e.g., Market Chairperson, Boda stage Chairman)
                            </FormDescription>
                            <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange('recommendation_letter', e)}
                                className="cursor-pointer"
                            />
                            {uploadedFiles.recommendation_letter && (
                                <p className="text-xs text-green-600">✓ {uploadedFiles.recommendation_letter.name}</p>
                            )}
                        </div>

                        {/* Passport Photo */}
                        <div className="space-y-2">
                            <FormLabel className="flex items-center gap-2">
                                <span className="text-destructive">*</span>
                                4. Passport Size Photo
                            </FormLabel>
                            <FormDescription className="text-xs">
                                (Recently taken, for applicant and group leaders)
                            </FormDescription>
                            <Input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange('passport_photo', e)}
                                className="cursor-pointer"
                            />
                            {uploadedFiles.passport_photo && (
                                <p className="text-xs text-green-600">✓ {uploadedFiles.passport_photo.name}</p>
                            )}
                        </div>

                        {/* Income Statement */}
                        <div className="space-y-2 md:col-span-2">
                            <FormLabel className="flex items-center gap-2">
                                <span className="text-destructive">*</span>
                                5. Detailed Monthly Income and Expenditure Statement
                            </FormLabel>
                            <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                                onChange={(e) => handleFileChange('income_statement', e)}
                                className="cursor-pointer"
                            />
                            {uploadedFiles.income_statement && (
                                <p className="text-xs text-green-600">✓ {uploadedFiles.income_statement.name}</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                        <p className="text-xs text-amber-800">
                            <strong>Note:</strong> All marked documents (*) are required for loan processing.
                            Files will be uploaded securely when you submit the application.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Submit Application</Button>
                </div>
            </form>
        </Form >
    );
}
