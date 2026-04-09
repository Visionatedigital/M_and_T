import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export type RecordPaymentDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    loanApplicationId: string | null;
    borrowerLabel: string;
    /** Pre-fill amount (e.g. one installment) */
    defaultAmount?: number;
    /** Shown under title (e.g. remaining balance) */
    amountHint?: string;
    /** When set, sends `member_breakdown` for group loan attribution */
    memberBreakdownName?: string;
    onSuccess?: () => void | Promise<void>;
};

export function RecordPaymentDialog({
    open,
    onOpenChange,
    loanApplicationId,
    borrowerLabel,
    defaultAmount,
    amountHint,
    memberBreakdownName,
    onSuccess,
}: RecordPaymentDialogProps) {
    const { toast } = useToast();
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !loanApplicationId) return;
        if (defaultAmount != null && defaultAmount > 0) {
            setAmount(String(Math.round(defaultAmount)));
        } else {
            setAmount("");
        }
        setNotes("");
        setDate(new Date().toISOString().split("T")[0]);
        setPaymentMethod("cash");
    }, [open, loanApplicationId, defaultAmount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loanApplicationId) return;
        const raw = amount.replace(/,/g, "").trim();
        const amt = parseFloat(raw);
        if (!Number.isFinite(amt) || amt <= 0) {
            toast({
                title: "Invalid amount",
                description: "Enter an amount greater than 0.",
                variant: "destructive",
            });
            return;
        }
        setLoading(true);
        try {
            await api.repayments.create({
                loan_application_id: loanApplicationId,
                amount: amt,
                payment_date: date,
                payment_method: paymentMethod,
                member_breakdown: memberBreakdownName
                    ? [{ name: memberBreakdownName, amount: amt }]
                    : undefined,
                notes:
                    notes.trim() ||
                    (memberBreakdownName ? `Member payment: ${memberBreakdownName}` : undefined),
            });
            toast({ title: "Payment recorded", description: `UGX ${amt.toLocaleString()} saved.` });
            onOpenChange(false);
            await onSuccess?.();
        } catch (err: unknown) {
            toast({
                title: "Could not record payment",
                description: err instanceof Error ? err.message : "Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Record payment</DialogTitle>
                    <DialogDescription>
                        <span className="font-medium text-foreground">{borrowerLabel}</span>
                        {amountHint ? <span className="block mt-1 text-xs">{amountHint}</span> : null}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="pay-amount">Amount (UGX)</Label>
                        <Input
                            id="pay-amount"
                            type="number"
                            min={1}
                            step={1000}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            placeholder="e.g. 50000"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="pay-date">Payment date</Label>
                        <Input
                            id="pay-date"
                            type="date"
                            max={new Date().toISOString().slice(0, 10)}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                                <SelectItem value="mobile_money">Mobile money</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="pay-notes">Notes (optional)</Label>
                        <Textarea
                            id="pay-notes"
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Reference, receipt #, etc."
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                "Save payment"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/** Typical weekly installment for group loans, monthly for individual — matches repayments route logic. */
export function suggestInstallmentAmount(loan: {
    total_amount?: number;
    loan_amount?: number;
    loan_duration_months?: number;
    group_id?: string | null;
}): number {
    const total =
        typeof loan.total_amount === "number" && loan.total_amount > 0
            ? loan.total_amount
            : (parseFloat(String(loan.loan_amount || 0)) || 0) * 1.3;
    const months = parseInt(String(loan.loan_duration_months || 4), 10) || 4;
    const isGroup = !!loan.group_id;
    const numInst = isGroup ? Math.ceil(months * 4.33) : months;
    return Math.max(1000, Math.ceil(total / Math.max(1, numInst)));
}
