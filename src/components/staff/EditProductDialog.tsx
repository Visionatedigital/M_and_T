import { Fragment, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface EditProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** null when mode is "create" */
    product: any | null;
    mode?: "create" | "edit";
    onSuccess: () => void;
}

const emptyForm = {
    name: "",
    code: "",
    description: "",
    min_amount: "",
    max_amount: "",
    min_duration_months: "",
    max_duration_months: "",
    base_interest_rate: "",
    status: "active",
    processing_fee_percentage: "",
    late_payment_penalty_rate: "",
    application_fee: "",
    admission_fee: "",
    processing_fee: "",
    passbook_fee: "",
    insurance_rate: "",
    security_deposit_rate: "",
    monitoring_fee_rate: "",
    late_payment_penalty: "",
    restructuring_fee_low: "",
    restructuring_fee_high: "",
    restructuring_threshold: "",
};

export type CustomFeeRow = { id: string; label: string; amount: string };

function newFeeId() {
    return typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `fee-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseCustomFeesFromProduct(product: any): CustomFeeRow[] {
    const raw = product?.custom_fees;
    let arr: any[] = [];
    if (Array.isArray(raw)) arr = raw;
    else if (typeof raw === "string" && raw.trim()) {
        try {
            const j = JSON.parse(raw);
            arr = Array.isArray(j) ? j : [];
        } catch {
            arr = [];
        }
    }
    return arr.map((x) => ({
        id: String(x?.id || newFeeId()),
        label: String(x?.label ?? ""),
        amount: x?.amount != null && x.amount !== "" ? String(x.amount) : "",
    }));
}

function buildPayload(formData: typeof emptyForm, customFees: CustomFeeRow[]) {
    const custom_fees = customFees
        .filter((f) => f.label.trim())
        .map((f) => ({
            id: f.id,
            label: f.label.trim(),
            amount: parseFloat(f.amount || "0") || 0,
        }));
    return {
        ...formData,
        min_amount: parseFloat(formData.min_amount),
        max_amount: parseFloat(formData.max_amount),
        min_duration_months: parseInt(formData.min_duration_months, 10),
        max_duration_months: parseInt(formData.max_duration_months, 10),
        base_interest_rate: parseFloat(formData.base_interest_rate),
        processing_fee_percentage: parseFloat(formData.processing_fee_percentage || "0"),
        late_payment_penalty_rate: parseFloat(formData.late_payment_penalty_rate || "0"),
        application_fee: parseFloat(formData.application_fee || "0"),
        admission_fee: parseFloat(formData.admission_fee || "0"),
        processing_fee: parseFloat(formData.processing_fee || "0"),
        passbook_fee: parseFloat(formData.passbook_fee || "0"),
        insurance_rate: parseFloat(formData.insurance_rate || "0"),
        security_deposit_rate: parseFloat(formData.security_deposit_rate || "0"),
        monitoring_fee_rate: parseFloat(formData.monitoring_fee_rate || "0"),
        late_payment_penalty: parseFloat(formData.late_payment_penalty || "0"),
        restructuring_fee_low: parseFloat(formData.restructuring_fee_low || "0"),
        restructuring_fee_high: parseFloat(formData.restructuring_fee_high || "0"),
        restructuring_threshold: parseFloat(formData.restructuring_threshold || "0"),
        custom_fees,
    };
}

export function EditProductDialog({ open, onOpenChange, product, mode = "edit", onSuccess }: EditProductDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [customFees, setCustomFees] = useState<CustomFeeRow[]>([]);

    useEffect(() => {
        if (!open) {
            setConfirmDeleteOpen(false);
            return;
        }
        if (mode === "create") {
            setFormData({
                ...emptyForm,
                min_duration_months: "1",
                max_duration_months: "60",
                base_interest_rate: "30",
                monitoring_fee_rate: "3",
                min_amount: "150000",
                max_amount: "2000000",
            });
            setCustomFees([]);
            return;
        }
        if (!product) return;
        setFormData({
            name: product.name ?? "",
            code: product.code ?? "",
            description: product.description ?? "",
            min_amount: product.min_amount != null ? String(product.min_amount) : "",
            max_amount: product.max_amount != null ? String(product.max_amount) : "",
            min_duration_months: product.min_duration_months != null ? String(product.min_duration_months) : "1",
            max_duration_months: product.max_duration_months != null ? String(product.max_duration_months) : "60",
            base_interest_rate: product.base_interest_rate != null ? String(product.base_interest_rate) : "0",
            status: product.status ?? "active",
            processing_fee_percentage:
                product.processing_fee_percentage != null ? String(product.processing_fee_percentage) : "0",
            late_payment_penalty_rate:
                product.late_payment_penalty_rate != null ? String(product.late_payment_penalty_rate) : "0",
            application_fee: product.application_fee != null ? String(product.application_fee) : "0",
            admission_fee: product.admission_fee != null ? String(product.admission_fee) : "0",
            processing_fee: product.processing_fee != null ? String(product.processing_fee) : "0",
            passbook_fee: product.passbook_fee != null ? String(product.passbook_fee) : "0",
            insurance_rate: product.insurance_rate != null ? String(product.insurance_rate) : "0",
            security_deposit_rate: product.security_deposit_rate != null ? String(product.security_deposit_rate) : "0",
            monitoring_fee_rate: product.monitoring_fee_rate != null ? String(product.monitoring_fee_rate) : "3",
            late_payment_penalty: product.late_payment_penalty != null ? String(product.late_payment_penalty) : "0",
            restructuring_fee_low: product.restructuring_fee_low != null ? String(product.restructuring_fee_low) : "0",
            restructuring_fee_high: product.restructuring_fee_high != null ? String(product.restructuring_fee_high) : "0",
            restructuring_threshold: product.restructuring_threshold != null ? String(product.restructuring_threshold) : "0",
        });
        setCustomFees(parseCustomFeesFromProduct(product));
    }, [open, mode, product]);

    const handleChange = (field: keyof typeof emptyForm, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "edit" && !product?.id) return;
        if (!formData.name?.trim() || !formData.code?.trim()) {
            toast({
                title: "Required",
                description: "Enter a product name and a unique code.",
                variant: "destructive",
            });
            return;
        }
        setLoading(true);

        try {
            const payload = buildPayload(formData, customFees);
            if (mode === "create") {
                await api.products.create(payload);
                toast({
                    title: "Product added",
                    description: "This loan product has its own fee and rate settings.",
                });
            } else {
                await api.products.update(product!.id, payload);
                toast({ title: "Saved", description: "Loan product and fee settings updated." });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: unknown) {
            console.error(error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save product",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (!product?.id) return;
        setLoading(true);
        try {
            await api.products.delete(product.id);
            toast({
                title: "Product deleted",
                description: `"${formData.name || "Product"}" was removed from the catalog.`,
            });
            setConfirmDeleteOpen(false);
            onSuccess();
            onOpenChange(false);
        } catch (error: unknown) {
            console.error(error);
            toast({
                title: "Could not delete",
                description: error instanceof Error ? error.message : "Delete failed",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const ugx = (id: keyof typeof emptyForm, label: string, hint?: string) => (
        <div className="grid gap-1.5">
            <Label htmlFor={id} className="text-xs font-medium">
                {label}
            </Label>
            {hint && <p className="text-[10px] text-muted-foreground -mt-0.5">{hint}</p>}
            <Input
                id={id}
                type="number"
                min={0}
                step="1000"
                value={formData[id]}
                onChange={(e) => handleChange(id, e.target.value)}
            />
        </div>
    );

    const pct = (id: keyof typeof emptyForm, label: string, hint?: string) => (
        <div className="grid gap-1.5">
            <Label htmlFor={id} className="text-xs font-medium">
                {label}
            </Label>
            {hint && <p className="text-[10px] text-muted-foreground -mt-0.5">{hint}</p>}
            <Input
                id={id}
                type="number"
                min={0}
                step="0.1"
                value={formData[id]}
                onChange={(e) => handleChange(id, e.target.value)}
            />
        </div>
    );

    return (
        <Fragment>
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[540px] max-h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle>{mode === "create" ? "Add loan product" : "Edit loan product"}</DialogTitle>
                    <DialogDescription asChild>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>
                                Use the <strong className="text-foreground">Terms</strong> tab to change the{" "}
                                <strong className="text-foreground">name</strong>, <strong className="text-foreground">code</strong>
                                , description, loan amounts, interest, and status. Use{" "}
                                <strong className="text-foreground">Fees</strong>, <strong className="text-foreground">Rates %</strong>
                                , and <strong className="text-foreground">Restructure</strong> for all charges specific to this
                                product.
                            </p>
                            {mode === "edit" ? (
                                <p>
                                    Editing{" "}
                                    <span className="font-medium text-foreground">{formData.name || "this product"}</span>
                                    {" "}({formData.code || "—"}).
                                </p>
                            ) : (
                                <p>Choose a unique code (e.g. GRP-01) so reports and forms stay clear.</p>
                            )}
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <Tabs
                        key={mode === "create" ? "new" : product?.id ?? "edit"}
                        defaultValue="terms"
                        className="flex-1 flex flex-col min-h-0 px-6"
                    >
                        <TabsList className="mb-2 grid w-full grid-cols-2 gap-1 sm:grid-cols-4">
                            <TabsTrigger value="terms" className="text-xs">
                                Terms
                            </TabsTrigger>
                            <TabsTrigger value="fees" className="text-xs">
                                Fees (UGX)
                            </TabsTrigger>
                            <TabsTrigger value="rates" className="text-xs">
                                Rates %
                            </TabsTrigger>
                            <TabsTrigger value="other" className="text-xs">
                                Restructure
                            </TabsTrigger>
                        </TabsList>
                        <ScrollArea className="h-[min(420px,55vh)] pr-3">
                            <TabsContent value="terms" className="mt-0 space-y-3 pb-4">
                                <p className="text-xs text-muted-foreground rounded-md border bg-muted/40 px-3 py-2">
                                    <span className="font-medium text-foreground">Name &amp; code</span> appear on applications
                                    and reports. Changing them does not rename past loans automatically—only new applications
                                    use the new labels.
                                </p>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Code</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => handleChange("code", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        rows={2}
                                        value={formData.description}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        placeholder="Optional notes for staff"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="min_amount">Min amount (UGX)</Label>
                                        <Input
                                            id="min_amount"
                                            type="number"
                                            value={formData.min_amount}
                                            onChange={(e) => handleChange("min_amount", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="max_amount">Max amount (UGX)</Label>
                                        <Input
                                            id="max_amount"
                                            type="number"
                                            value={formData.max_amount}
                                            onChange={(e) => handleChange("max_amount", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="min_duration_months">Min term (months)</Label>
                                        <Input
                                            id="min_duration_months"
                                            type="number"
                                            min={1}
                                            value={formData.min_duration_months}
                                            onChange={(e) => handleChange("min_duration_months", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="max_duration_months">Max term (months)</Label>
                                        <Input
                                            id="max_duration_months"
                                            type="number"
                                            min={1}
                                            value={formData.max_duration_months}
                                            onChange={(e) => handleChange("max_duration_months", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="base_interest_rate">Base interest (%)</Label>
                                        <Input
                                            id="base_interest_rate"
                                            type="number"
                                            step="0.1"
                                            value={formData.base_interest_rate}
                                            onChange={(e) => handleChange("base_interest_rate", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => handleChange("status", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="fees" className="mt-0 space-y-3 pb-4">
                                <p className="text-xs text-muted-foreground mb-2">
                                    Fixed charges in UGX for <strong className="text-foreground">this product only</strong> (each
                                    loan product can differ).
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {ugx("application_fee", "Application fee", "Paid at application")}
                                    {ugx("admission_fee", "Admission / membership")}
                                    {ugx("processing_fee", "Loan processing fee", "Non-refundable processing")}
                                    {ugx("passbook_fee", "Passbook fee")}
                                    {ugx("late_payment_penalty", "Late payment penalty (fixed)", "Per missed installment")}
                                </div>

                                <div className="rounded-lg border bg-muted/20 p-3 space-y-3 mt-4">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-foreground">Additional fees (custom)</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                Add any other one-off charges for this product (name + amount in UGX).
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="shrink-0"
                                            onClick={() =>
                                                setCustomFees((prev) => [
                                                    ...prev,
                                                    { id: newFeeId(), label: "", amount: "" },
                                                ])
                                            }
                                        >
                                            <Plus className="mr-1 h-3.5 w-3.5" />
                                            Add fee type
                                        </Button>
                                    </div>
                                    {customFees.length === 0 ? (
                                        <p className="text-[11px] text-muted-foreground italic py-1">
                                            No custom fees yet. Use &quot;Add fee type&quot; for charges not listed above.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {customFees.map((row, index) => (
                                                <div
                                                    key={row.id}
                                                    className="grid grid-cols-1 sm:grid-cols-[1fr_120px_auto] gap-2 items-end"
                                                >
                                                    <div className="grid gap-1.5">
                                                        <Label className="text-xs font-medium">Fee name</Label>
                                                        <Input
                                                            placeholder="e.g. Insurance levy, Vehicle inspection"
                                                            value={row.label}
                                                            onChange={(e) => {
                                                                const v = e.target.value;
                                                                setCustomFees((prev) =>
                                                                    prev.map((r, i) => (i === index ? { ...r, label: v } : r)),
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="grid gap-1.5">
                                                        <Label className="text-xs font-medium">Amount (UGX)</Label>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            step={1000}
                                                            placeholder="0"
                                                            value={row.amount}
                                                            onChange={(e) => {
                                                                const v = e.target.value;
                                                                setCustomFees((prev) =>
                                                                    prev.map((r, i) => (i === index ? { ...r, amount: v } : r)),
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive shrink-0"
                                                        onClick={() =>
                                                            setCustomFees((prev) => prev.filter((_, i) => i !== index))
                                                        }
                                                        aria-label="Remove fee"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="rates" className="mt-0 space-y-3 pb-4">
                                <p className="text-xs text-muted-foreground mb-2">
                                    Percentage-based fees (rates on principal or as configured in your policy).
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {pct("processing_fee_percentage", "Processing fee (% of principal)")}
                                    {pct("late_payment_penalty_rate", "Late penalty rate (%)")}
                                    {pct("insurance_rate", "Insurance rate (%)")}
                                    {pct("security_deposit_rate", "Security deposit rate (%)")}
                                    {pct("monitoring_fee_rate", "Monitoring fee rate (%)")}
                                </div>
                            </TabsContent>

                            <TabsContent value="other" className="mt-0 space-y-3 pb-4">
                                <p className="text-xs text-muted-foreground mb-2">
                                    Restructuring fees when a loan is rescheduled (UGX).
                                </p>
                                <div className="grid grid-cols-1 gap-3">
                                    {ugx("restructuring_threshold", "Threshold amount (UGX)", "Balances at or below use low fee")}
                                    <div className="grid grid-cols-2 gap-3">
                                        {ugx("restructuring_fee_low", "Restructuring fee ≤ threshold")}
                                        {ugx("restructuring_fee_high", "Restructuring fee &gt; threshold")}
                                    </div>
                                </div>
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                    <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="order-2 sm:order-1">
                            {mode === "edit" && product?.id && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    disabled={loading}
                                    onClick={() => setConfirmDeleteOpen(true)}
                                    className="w-full sm:w-auto"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete product
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2 justify-end order-1 sm:order-2 w-full sm:w-auto">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Saving…" : mode === "create" ? "Create product" : "Save all settings"}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete this loan product?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This removes <strong>{formData.name || "this product"}</strong> from the catalog. Related settings
                        rows are cleaned up where the database allows. Existing applications keep their stored product name as
                        recorded. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={(e) => {
                            e.preventDefault();
                            handleDeleteProduct();
                        }}
                        disabled={loading}
                    >
                        {loading ? "Deleting…" : "Delete permanently"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </Fragment>
    );
}
