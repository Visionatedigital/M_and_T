// Accounting & reports — uses Card/Table only (no Alert UI component)
import React, { useEffect, useState, useCallback, Fragment, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart,
} from "recharts";
import {
  TrendingUp, TrendingDown, Plus, Pencil, Trash2, RefreshCw, ArrowUpRight, ArrowDownRight,
  BookOpen, ChevronLeft, ChevronRight, FileText, Wallet, Receipt, AlertTriangle,
  PiggyBank, Scale, Download, Smartphone, Landmark, MoveRight, MoveLeft,
  BarChart3, Users, FileSpreadsheet, Loader2, Calendar as CalendarIcon, Search, Filter, Sparkles
} from "lucide-react";

interface LoanStats {
  totalApplications: number;
  approvedLoans: number;
  rejectedLoans: number;
  pendingLoans: number;
  totalDisbursed: number;
  totalInterest: number;
  rejectionRate: number;
  approvalRate: number;
}

interface ProductStats {
  product: string;
  applications: number;
  approved: number;
  rejected: number;
  totalAmount: number;
}

// ─────────────────── Constants ─────────────────────────────
const EXPENSE_CATEGORIES = [
  "Loan Disbursement",
  "Salary & Wages", "Office Rent", "Utilities", "Internet & Communications",
  "Transport", "Stationery & Supplies", "Marketing", "Repairs & Maintenance",
  "Legal & Professional Fees", "Bad Debt Write-Off", "Bank Charges", "Direct Fee Costs", "Other Expenses",
];
const REVENUE_CATEGORIES = [
  "Interest Income", "Principal Recovery", "Processing Fees", "Late Payment Penalties", "Commission Income",
  "Fee Income (Valuation/Tracking)", "Other Income",
];
const PAYMENT_METHODS = ["cash", "mobile_money", "bank_transfer"];
const PIE_COLORS = ["#1e3a5f", "#2563eb", "#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd", "#c7843a", "#d97706", "#f59e0b", "#fbbf24", "#fcd34d", "#fef08a"];

// ─────────────────── Helpers ────────────────────────────────
const fmt = (n: number) =>
  n >= 1_000_000 ? `UGX ${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `UGX ${(n / 1_000).toFixed(0)}K`
      : `UGX ${n.toLocaleString()}`;

const formatDate = (d: string) => new Date(d).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" });

/** Strip legacy import prefix from Details (old rows stored as "Cashbook Import | YYYY | …"). */
function cashBookLineDetails(description: string | null | undefined) {
  const s = String(description ?? "");
  const m = s.match(/^cashbook\s+import\s*\|\s*\d{4}\s*\|\s*(.+)$/i);
  if (m) return m[1].trim();
  return s;
}

/** Last column: user narration, or year · category for sheet imports, or defaults for loan lines. */
function cashBookLineNarration(t: { narration?: string | null; description?: string | null; category?: string | null; source?: string }) {
  const raw = t.narration != null ? String(t.narration).trim() : "";
  if (raw && !raw.startsWith("Sheet ")) return raw;

  const yearFromTag = raw.startsWith("Sheet ") ? raw.slice(6).trim() : null;
  const legacyYear = String(t.description ?? "").match(/^cashbook\s+import\s*\|\s*(\d{4})\s*\|/i);
  const year = yearFromTag || (legacyYear ? legacyYear[1] : null);

  if (t.source === "manual" && t.category) {
    if (year) return `${year} · ${t.category}`;
    return t.category;
  }
  if (t.source === "disbursement") return "Loan issue";
  if (t.source === "repayment") return "Loan repayment";
  return "—";
}

// ─────────────────── Component ──────────────────────────────
const Accounting = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Data State
  const [plSummary, setPlSummary] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter State
  const [filterType, setFilterType] = useState("all");
  const [filterFrom, setFilterFrom] = useState("2025-01-01");
  const [filterTo, setFilterTo] = useState("2025-12-31");
  const [filterCategory, setFilterCategory] = useState("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 15;
  const [entrySearch, setEntrySearch] = useState("");

  // Report tabs state
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "pl");
  const [reportFrom, setReportFrom] = useState(() => "2025-01-01");
  const [reportTo, setReportTo] = useState(() => "2025-12-31");
  const [incomeStmt, setIncomeStmt] = useState<any>(null);
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [cashFlow, setCashFlow] = useState<any>(null);
  const [loanPortfolio, setLoanPortfolio] = useState<any>(null);
  const [trialBalance, setTrialBalance] = useState<any>(null);
  const [cashBookData, setCashBookData] = useState<any>(null);
  const [filterAccount, setFilterAccount] = useState("all");
  const [reportLoading, setReportLoading] = useState<string | null>(null);
  const [agingData, setAgingData] = useState<any[]>([]);
  const [comprehensiveIncomeData, setComprehensiveIncomeData] = useState<any>(null);
  const [financialPositionData, setFinancialPositionData] = useState<any>(null);
  const [equityStatementData, setEquityStatementData] = useState<any>(null);
  const [cashflowStmtData, setCashflowStmtData] = useState<any>(null);
  const [financialAnalysisData, setFinancialAnalysisData] = useState<any>(null);
  const [financialAiOpen, setFinancialAiOpen] = useState(false);
  const [financialAiLoading, setFinancialAiLoading] = useState(false);
  const [financialAiNarrative, setFinancialAiNarrative] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("2025-01");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSearchParams({ tab: val });
  };

  // Consolidated Reports State
  const [loanStats, setLoanStats] = useState<LoanStats>({
    totalApplications: 0,
    approvedLoans: 0,
    rejectedLoans: 0,
    pendingLoans: 0,
    totalDisbursed: 0,
    totalInterest: 0,
    rejectionRate: 0,
    approvalRate: 0,
  });
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [clientStats, setClientStats] = useState({
    totalClients: 0,
    activeClients: 0,
    newClientsThisMonth: 0,
  });
  const [isExportingAI, setIsExportingAI] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingZScore, setIsExportingZScore] = useState(false);

  // Add Entry Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    entry_type: "expense",
    category: "",
    description: "",
    narration: "",
    amount: "",
    entry_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
    fee_type: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    entry_type: "expense" as "expense" | "revenue",
    category: "",
    description: "",
    narration: "",
    amount: "",
    entry_date: "",
    payment_method: "cash",
  });

  const filteredEntries = useMemo(() => {
    const q = entrySearch.toLowerCase().trim();
    if (!q) return entries;
    return entries.filter(
      (e: any) =>
        (e.category || "").toLowerCase().includes(q) ||
        (e.description || "").toLowerCase().includes(q) ||
        (e.narration || "").toLowerCase().includes(q) ||
        (e.entry_type || "").toLowerCase().includes(q) ||
        (e.payment_method || "").toLowerCase().includes(q) ||
        String(e.amount ?? "").includes(q),
    );
  }, [entries, entrySearch]);

  // ─── Load P&L Summary ──────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const user = await api.auth.getMe();
      if (!user) { navigate("/staff-login"); return; }

      const [summary, entriesData] = await Promise.all([
        api.accounting.getPlSummary(),
        api.accounting.getEntries({
          type: filterType !== "all" ? filterType : undefined,
          from: filterFrom || undefined,
          to: filterTo || undefined,
          category: filterCategory !== "all" ? filterCategory : undefined,
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
        }),
      ]);

      setPlSummary(summary);
      setEntries(entriesData.entries || []);
      setTotalEntries(entriesData.total || 0);
    } catch (e) {
      console.error(e);
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, filterType, filterFrom, filterTo, filterCategory, page, refreshKey]);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Form Submit ───────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.entry_type === "fee_split") {
      if (!form.fee_type || !form.entry_date) {
        toast({ title: "Please select a fee type and date", variant: "destructive" }); return;
      }
      setSubmitting(true);
      try {
        // M-T Growth Gateway: Customize fee amounts as needed for your products
        const feeSpecs = {
          "Car Valuation": { charge: 150000, cost: 130000 },
          "Caveat & Registration": { charge: 150000, cost: 82000 },
          "Tracking Fees": { charge: 70000, cost: 65000 }
        };
        const spec = feeSpecs[form.fee_type as keyof typeof feeSpecs];

        // 1. Revenue
        await api.accounting.createEntry({
          entry_type: 'revenue',
          category: 'Fee Income (Valuation/Tracking)',
          description: `${form.fee_type} (Gross Charge)${form.description ? ' - ' + form.description : ''}`,
          amount: spec.charge,
          entry_date: form.entry_date,
          payment_method: form.payment_method
        });

        // 2. Expense
        await api.accounting.createEntry({
          entry_type: 'expense',
          category: 'Direct Fee Costs',
          description: `${form.fee_type} (Vendor Cost)${form.description ? ' - ' + form.description : ''}`,
          amount: spec.cost,
          entry_date: form.entry_date,
          payment_method: form.payment_method
        });

        toast({ title: "Client fee split entries recorded successfully ✓" });
        setDialogOpen(false);
        setForm({ entry_type: "expense", category: "", description: "", narration: "", amount: "", entry_date: new Date().toISOString().split("T")[0], payment_method: "cash", fee_type: "" });
        setRefreshKey(k => k + 1);
      } catch (err: any) {
        toast({ title: err.message || "Failed to save fee entries", variant: "destructive" });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!form.category || !form.amount || !form.entry_date) {
      toast({ title: "Please fill all required fields", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      await api.accounting.createEntry({ ...form, amount: parseFloat(form.amount) });
      toast({ title: "Entry recorded successfully ✓" });
      setDialogOpen(false);
      setForm({ entry_type: "expense", category: "", description: "", narration: "", amount: "", entry_date: new Date().toISOString().split("T")[0], payment_method: "cash", fee_type: "" });
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      toast({ title: err.message || "Failed to save entry", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Load Report (when tab changes) ────────────────────────
  const loadReport = useCallback(async (tab: string) => {
    if (tab === "pl") return;
    setReportLoading(tab);
    try {
      const to = reportTo || new Date().toISOString().split("T")[0];
      const from = reportFrom || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
      const month = selectedMonth;

      if (tab === "loan_analytics" || tab === "client_analytics") {
        const data = await api.reports.getStats();
        setLoanStats(data.loanStats);
        setProductStats(data.productStats);
        setClientStats(data.clientStats);
      } else if (tab === "income") {
        const d = await api.accounting.getIncomeStatement({ from, to });
        setIncomeStmt(d);
      } else if (tab === "balance") {
        const d = await api.accounting.getBalanceSheet({ to });
        setBalanceSheet(d);
      } else if (tab === "cashflow") {
        const d = await api.accounting.getCashFlow({ from, to });
        setCashFlow(d);
      } else if (tab === "portfolio") {
        const d = await api.accounting.getLoanPortfolio({ to });
        setLoanPortfolio(d);
      } else if (tab === "trial") {
        const d = await api.accounting.getTrialBalance({ to });
        setTrialBalance(d);
      } else if (tab === "cashbook") {
        const d = await api.accounting.getCashBook({ from, to, account: filterAccount !== "all" ? filterAccount : undefined });
        setCashBookData(d);
      } else if (tab === "aging_report") {
        // Use global report to/from if available, otherwise fallback to current month
        let agingTo = reportTo;
        let agingFrom = reportFrom;
        if (!agingTo) {
          const [y, m] = selectedMonth.split('-').map(Number);
          const lastDay = new Date(y, m, 0).getDate();
          agingTo = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;
          agingFrom = `${selectedMonth}-01`;
        }
        const d = await api.reports.getAgingReport({ from: agingFrom, to: agingTo });
        setAgingData(d.data || []);
      } else if (tab === "comprehensive_income") {
        const d = await api.reports.getComprehensiveIncome({ from, to });
        setComprehensiveIncomeData(d);
      } else if (tab === "financial_position") {
        const d = await api.reports.getFinancialPosition({ from, to });
        setFinancialPositionData(d);
      } else if (tab === "equity_statement") {
        const d = await api.reports.getEquityStatement({ from, to });
        setEquityStatementData(d);
      } else if (tab === "cashflow_statement") {
        const d = await api.reports.getCashflowStatement(to);
        setCashflowStmtData(d.data);
      } else if (tab === "financial_analysis") {
        const d = await api.reports.getFinancialAnalysis();
        // Standardize zScore naming
        setFinancialAnalysisData({
          ...d,
          z_score: d.zScore,
          zone: d.interpretation?.split(' ')[0]
        });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error loading report", variant: "destructive" });
    } finally {
      setReportLoading(null);
    }
  }, [reportFrom, reportTo, toast]);

  useEffect(() => {
    if (activeTab && activeTab !== "pl") loadReport(activeTab);
  }, [activeTab, loadReport]);

  // ─── Export AI/Excel from Reports ─────────────────────────
  const handleAiExport = async () => {
    setIsExportingAI(true);
    try {
      await api.reports.downloadAiSummaryDocx();
      toast({ title: "Detailed financial summary generated ✓" });
    } catch (e) {
      toast({ title: "Failed to generate AI summary", variant: "destructive" });
    } finally {
      setIsExportingAI(false);
    }
  };

  const handleZScoreExport = async () => {
    setIsExportingZScore(true);
    try {
      await api.reports.downloadFinancialAnalysisDocx();
      toast({ title: "Z-Score Analysis generated ✓" });
    } catch (e) {
      toast({ title: "Failed to generate Z-Score analysis", variant: "destructive" });
    } finally {
      setIsExportingZScore(false);
    }
  };

  const handleFinancialAiAnalysis = async () => {
    setFinancialAiNarrative(null);
    setFinancialAiOpen(true);
    setFinancialAiLoading(true);
    try {
      const r = await api.reports.getFinancialAnalysisAi();
      setFinancialAiNarrative(r.narrative || "");
    } catch (e: any) {
      toast({ title: "Could not load AI summary", description: e?.message || "Could not reach the server", variant: "destructive" });
      setFinancialAiOpen(false);
    } finally {
      setFinancialAiLoading(false);
    }
  };

  const handleFinancialPositionWordExport = async () => {
    try {
      const to = reportTo || new Date().toISOString().split("T")[0];
      const from = reportFrom || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
      await api.reports.downloadFinancialPositionDocx({ from, to });
      toast({ title: "Financial Position (Word) exported ✓" });
    } catch (e: any) {
      toast({ title: "Export failed", description: e?.message || "Could not export Word", variant: "destructive" });
    }
  };

  const handleExcelExport = async () => {
    setIsExportingExcel(true);
    try {
      await api.reports.downloadFinancialExportXlsx();
      toast({ title: "Success", description: "Financial Report downloaded successfully." });
    } catch (error: any) {
      toast({ title: "Export Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsExportingExcel(false);
    }
  };

  // ─── Export CSV Helper ────────────────────────────────────
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]).map(h => `"${h}"`).join(",");
    const rows = data.map(row =>
      Object.values(row).map(val => {
        const strVal = String(val !== null && val !== undefined ? val : '');
        return `"${strVal.replace(/"/g, '""')}"`;
      }).join(",")
    ).join("\n");

    const csvContent = headers + "\n" + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ─── Export Functions ─────────────────────────────────────
  const exportIncomeStatement = () => {
    if (!incomeStmt || !incomeStmt.sections) return;
    const rows: any[] = [];

    incomeStmt.sections.forEach((section: any) => {
      if (section.isSubtotal) {
        rows.push({ Category: section.title.toUpperCase(), Amount: section.total });
        rows.push({ Category: "", Amount: "" }); // Spacer
      } else {
        rows.push({ Category: section.title.toUpperCase(), Amount: "" });
        if (section.categories) {
          Object.entries(section.categories).forEach(([cat, val]: any) => {
            rows.push({ Category: `  ${cat}`, Amount: val });
          });
        }
        rows.push({ Category: `Total ${section.title}`, Amount: section.total });
        rows.push({ Category: "", Amount: "" }); // Spacer
      }
    });

    // Add Ratios section to CSV
    rows.push({ Category: "RATIOS (AS % OF AVG PORTFOLIO)", Amount: "" });
    rows.push({ Category: "Average Portfolio", Amount: incomeStmt.kpis?.avg_portfolio || 0 });
    rows.push({ Category: "Net Financial Income Ratio", Amount: `${incomeStmt.kpis?.net_financial_income_ratio || 0}%` });
    rows.push({ Category: "Net Operational Income Ratio", Amount: `${incomeStmt.kpis?.net_operational_income_ratio || 0}%` });
    rows.push({ Category: "Net Income Ratio", Amount: `${incomeStmt.kpis?.net_income_ratio || 0}%` });

    exportToCSV(rows, "Income_Statement");
  };

  const exportBalanceSheet = () => {
    if (!balanceSheet) return;
    const rows = [
      { Category: "ASSETS", Amount: "" },
      { Category: "Cash at Bank", Amount: balanceSheet.assets?.cash_at_bank || 0 },
      { Category: "Mobile Money Float", Amount: balanceSheet.assets?.mobile_money_float || 0 },
      { Category: "Loans Receivable", Amount: balanceSheet.assets?.loans_receivable || 0 },
      { Category: "Accrued Interest", Amount: balanceSheet.assets?.accrued_interest || 0 },
      { Category: "Fixed Assets", Amount: balanceSheet.assets?.fixed_assets || 0 },
      { Category: "Prepaid Expenses", Amount: balanceSheet.assets?.prepaid_expenses || 0 },
      { Category: "Total Assets", Amount: balanceSheet.assets?.total || 0 },
      { Category: "", Amount: "" },
      { Category: "LIABILITIES", Amount: "" },
      { Category: "Client Deposits", Amount: balanceSheet.liabilities?.client_deposits || 0 },
      { Category: "Borrowed Funds", Amount: balanceSheet.liabilities?.borrowed_funds || 0 },
      { Category: "Payables", Amount: balanceSheet.liabilities?.payables || 0 },
      { Category: "Accrued Expenses", Amount: balanceSheet.liabilities?.accrued_expenses || 0 },
      { Category: "Total Liabilities", Amount: balanceSheet.liabilities?.total || 0 },
      { Category: "", Amount: "" },
      { Category: "EQUITY", Amount: "" },
      { Category: "Share Capital", Amount: balanceSheet.equity?.share_capital || 0 },
      { Category: "Retained Earnings", Amount: balanceSheet.equity?.retained_earnings || 0 },
      { Category: "Current Year Profit", Amount: balanceSheet.equity?.current_year_profit || 0 },
      { Category: "Total Equity", Amount: balanceSheet.equity?.total || 0 },
    ];
    exportToCSV(rows, "Balance_Sheet");
  };

  const exportCashBook = () => {
    if (!cashBookData || !cashBookData.transactions) return;
    const rows = cashBookData.transactions.map((t: any) => ({
      Date: t.date,
      Description: cashBookLineDetails(t.description),
      Category: t.category,
      Narration: cashBookLineNarration(t),
      Account: t.payment_method?.replace('_', ' ').toUpperCase(),
      Type: t.entry_type === 'revenue' ? 'IN' : 'OUT',
      Amount: t.amount,
      Source: t.source
    }));
    exportToCSV(rows, "Cash_Book");
  };


  const exportCashFlow = () => {
    if (!cashFlow) return;
    const rows = [
      { Category: "OPERATING ACTIVITIES", Amount: "" },
      { Category: "Cash from Loan Repayments", Amount: cashFlow.operating?.cash_from_loan_repayments || 0 },
      { Category: "Interest Collected", Amount: cashFlow.operating?.interest_collected || 0 },
      { Category: "Other Operating Inflows", Amount: cashFlow.operating?.other_operating_inflows || 0 },
      { Category: "Operating Expenses Paid", Amount: `-${cashFlow.operating?.operating_expenses_paid || 0}` },
      { Category: "Net Operating", Amount: cashFlow.operating?.net || 0 },
      { Category: "", Amount: "" },
      { Category: "INVESTING ACTIVITIES", Amount: "" },
      { Category: "Inflows", Amount: cashFlow.investing?.inflows || 0 },
      { Category: "Outflows", Amount: `-${cashFlow.investing?.outflows || 0}` },
      { Category: "Net Investing", Amount: cashFlow.investing?.net || 0 },
      { Category: "", Amount: "" },
      { Category: "FINANCING ACTIVITIES", Amount: "" },
      { Category: "Inflows", Amount: cashFlow.financing?.inflows || 0 },
      { Category: "Outflows", Amount: `-${cashFlow.financing?.outflows || 0}` },
      { Category: "Net Financing", Amount: cashFlow.financing?.net || 0 },
      { Category: "", Amount: "" },
      { Category: "Net Cash Flow", Amount: cashFlow.net_cash_flow || 0 }
    ];
    exportToCSV(rows, "Cash_Flow");
  };

  const exportLoanPortfolio = () => {
    if (!loanPortfolio || !loanPortfolio.loans) return;

    const rows = loanPortfolio.loans.map((l: any) => ({
      Client: l.client_name,
      Product: l.loan_product,
      Principal: l.principal ?? 0,
      Interest: l.interest ?? 0,
      Outstanding: l.total_outstanding || 0,
      "Days Overdue": l.days_overdue > 0 ? l.days_overdue : 0,
      Status: l.status
    }));
    exportToCSV(rows, "Loan_Portfolio");
  };

  const exportAgingReport = () => {
    if (!agingData || agingData.length === 0) return;
    const rows = agingData.map((row: any) => ({
      "#": row.index,
      "Name": row.name,
      "Loan Issue Date": row.issue_date,
      "Rate": row.rate,
      "Loan ID": row.loan_id,
      "Days of Month": row.days_of_month,
      "Days in Period": row.days_in_period,
      "Original Loan": row.original_amount || 0,
      "Principal Outstanding": row.principal_outstanding || 0,
      "Interest for Month": row.interest_monthly || 0,
      "Interest Due": row.interest_due || 0,
      "Payments": row.payments || 0,
      "Interest Income": row.interest_income || 0,
      "Total Balance": row.total_balance || 0
    }));
    exportToCSV(rows, `Aging_Report_${selectedMonth}`);
  };

  const exportTrialBalance = () => {
    if (!trialBalance || !trialBalance.lines) return;
    const rows = trialBalance.lines.map((l: any) => ({
      Account: l.account,
      Debit: l.debit || 0,
      Credit: l.credit || 0
    }));
    rows.push({ Account: "Total", Debit: trialBalance.total_debits || 0, Credit: trialBalance.total_credits || 0 });
    exportToCSV(rows, `Trial_Balance_${reportTo || new Date().toISOString().split('T')[0]}`);
  };

  const exportFinancialPosition = () => {
    if (!financialPositionData || !financialPositionData.data) return;
    const rows: any[] = [];
    const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const year = financialPositionData.year || new Date().getFullYear();

    const addSection = (title: string, dataObj: any) => {
      rows.push({ Item: title });
      Object.entries(dataObj || {}).forEach(([cat, mData]: any) => {
        const row: any = { Item: cat };
        months.forEach(m => {
          const monthLabel = new Date(year, m, 1).toLocaleString('default', { month: 'short' });
          row[monthLabel] = mData[m + 1] || 0;
        });
        rows.push(row);
      });
      rows.push({});
    };

    addSection("ASSETS (Non-Current)", financialPositionData.data.non_current_assets);
    addSection("ASSETS (Current)", financialPositionData.data.current_assets);
    addSection("LIABILITIES & EQUITY", financialPositionData.data.current_liabilities);

    exportToCSV(rows, `Financial_Position_${year}`);
  };

  const exportComprehensiveIncome = () => {
    if (!comprehensiveIncomeData || !comprehensiveIncomeData.data) return;
    const rows: any[] = [];
    const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const year = comprehensiveIncomeData.year || new Date().getFullYear();

    (comprehensiveIncomeData.data || []).forEach((item: any) => {
      const row: any = { Category: item.category };
      months.forEach(m => {
        const monthLabel = new Date(year, m, 1).toLocaleString('default', { month: 'short' });
        row[monthLabel] = item.months[m + 1] || 0;
      });
      rows.push(row);
    });

    // Add Net Income row
    const netRow: any = { Category: "NET COMPREHENSIVE INCOME" };
    months.forEach(m => {
      let total = 0;
      comprehensiveIncomeData.data.forEach((item: any) => {
        const val = item.months[m + 1] || 0;
        if (item.type === 'revenue') total += val;
        else total -= val;
      });
      netRow[new Date(year, m, 1).toLocaleString('default', { month: 'short' })] = total;
    });
    rows.push(netRow);

    exportToCSV(rows, `Comprehensive_Income_${year}`);
  };

  const exportCashflowStatement = () => {
    if (!cashflowStmtData) return;
    const rows: any[] = [];

    rows.push({ Category: "CASH FLOW FROM OPERATING ACTIVITIES", Amount: "" });
    rows.push({ Category: "Profit before tax", Amount: cashflowStmtData.operating_activities?.profit_before_tax || 0 });
    rows.push({ Category: "Adjustment for depreciation", Amount: cashflowStmtData.operating_activities?.depreciation || 0 });
    rows.push({ Category: "Working capital changes:", Amount: "" });
    cashflowStmtData.operating_activities?.working_capital_changes?.forEach((item: any) => {
      rows.push({ Category: `  ${item.label}`, Amount: item.amount || 0 });
    });
    rows.push({});

    rows.push({ Category: "CASH FLOW FROM INVESTING ACTIVITIES", Amount: "" });
    cashflowStmtData.investing_activities?.forEach((item: any) => {
      rows.push({ Category: item.label, Amount: item.amount || 0 });
    });
    rows.push({});

    rows.push({ Category: "Opening Cash Equivalents", Amount: cashflowStmtData.cash_equivalents?.opening || 0 });
    rows.push({ Category: "Closing Cash Equivalents", Amount: cashflowStmtData.cash_equivalents?.closing || 0 });

    exportToCSV(rows, `Cashflow_Statement_${reportTo || new Date().toISOString().split('T')[0]}`);
  };

  // ─── Delete ───────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    try {
      await api.accounting.deleteEntry(id);
      toast({ title: "Entry deleted" });
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      toast({ title: err.message || "Failed to delete", variant: "destructive" });
    }
  };

  const openEditEntry = (entry: any) => {
    setEditingEntry(entry);
    const d = entry.entry_date ? String(entry.entry_date).split("T")[0] : "";
    setEditForm({
      entry_type: entry.entry_type === "revenue" ? "revenue" : "expense",
      category: entry.category || "",
      description: entry.description || "",
      narration: entry.narration || "",
      amount: String(entry.amount ?? ""),
      entry_date: d,
      payment_method: entry.payment_method || "cash",
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry?.id) return;
    if (!editForm.category?.trim() || !editForm.amount || !editForm.entry_date) {
      toast({ title: "Category, amount, and date are required", variant: "destructive" });
      return;
    }
    setEditSubmitting(true);
    try {
      await api.accounting.updateEntry(editingEntry.id, {
        entry_type: editForm.entry_type,
        category: editForm.category.trim(),
        description: editForm.description?.trim() || null,
        narration: editForm.narration?.trim() || null,
        amount: parseFloat(editForm.amount),
        entry_date: editForm.entry_date,
        payment_method: editForm.payment_method,
      });
      toast({ title: "Entry updated" });
      setEditOpen(false);
      setEditingEntry(null);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      toast({ title: err.message || "Failed to update", variant: "destructive" });
    } finally {
      setEditSubmitting(false);
    }
  };

  // ─── Derived ──────────────────────────────────────────────
  const currentMonth = plSummary?.monthly?.[plSummary.monthly.length - 1];
  const prevMonth = plSummary?.monthly?.[plSummary.monthly.length - 2];
  const ytd = plSummary?.ytd || { revenue: 0, expenses: 0, netProfit: 0 };

  const profitTrend = currentMonth && prevMonth
    ? ((currentMonth.netProfit - prevMonth.netProfit) / Math.max(Math.abs(prevMonth.netProfit), 1)) * 100
    : 0;

  const allCategories = filterType === "Revenue" ? REVENUE_CATEGORIES
    : filterType === "Expense" ? EXPENSE_CATEGORIES
      : [...REVENUE_CATEGORIES, ...EXPENSE_CATEGORIES];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StaffSidebar />
        <div className="flex-1 flex flex-col">
          <StaffHeader />
          <main className="flex-1 p-6 bg-slate-50">
            <div className="max-w-7xl mx-auto space-y-6">

              {/* ── Page Header ── */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-blue-800" />
                    Accounting
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">Financial statements, reports & journal entries</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAiExport}
                    disabled={isExportingAI}
                    className="bg-white/50 backdrop-blur-sm border-blue-200 hover:bg-blue-50 h-9"
                  >
                    {isExportingAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4 text-blue-600" />}
                    AI Summary (Word)
                  </Button>
                  <Button variant="outline" size="sm" className="h-9" onClick={() => setRefreshKey(k => k + 1)}>
                    <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                  </Button>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-blue-800 hover:bg-blue-900">
                        <Plus className="h-4 w-4 mr-1" /> Add Entry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Record Accounting Entry</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        {/* Type */}
                        <div>
                          <Label>Type *</Label>
                          <Select value={form.entry_type} onValueChange={v => setForm(f => ({ ...f, entry_type: v, category: "", fee_type: "" }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="revenue">Revenue</SelectItem>
                              <SelectItem value="expense">Expense</SelectItem>
                              <SelectItem value="fee_split">Client Fee (Auto-Split)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {form.entry_type === "fee_split" ? (
                          <div>
                            <Label>Fee Type *</Label>
                            <Select value={form.fee_type} onValueChange={v => setForm(f => ({ ...f, fee_type: v }))}>
                              <SelectTrigger><SelectValue placeholder="Select fee type" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Car Valuation">Car Valuation (150k / 130k)</SelectItem>
                                <SelectItem value="Caveat & Registration">Caveat & Registration (150k / 82k)</SelectItem>
                                <SelectItem value="Tracking Fees">Tracking Fees (70k / 65k)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <>
                            {/* Category */}
                            <div>
                              <Label>Category *</Label>
                              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                <SelectContent>
                                  {(form.entry_type === "revenue" ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Amount */}
                            <div>
                              <Label>Amount (UGX) *</Label>
                              <Input type="number" min="1" placeholder="e.g. 500000" value={form.amount}
                                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                            </div>
                          </>
                        )}
                        {/* Date */}
                        <div>
                          <Label>Date *</Label>
                          <Input type="date" value={form.entry_date}
                            onChange={e => setForm(f => ({ ...f, entry_date: e.target.value }))} />
                        </div>
                        {/* Payment Method */}
                        <div>
                          <Label>Payment Method</Label>
                          <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m.replace("_", " ")}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Description */}
                        <div>
                          <Label>Description (optional)</Label>
                          <Input placeholder="Notes about this entry" value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div>
                          <Label>Narration (optional)</Label>
                          <Input placeholder="Remarks for cash book / reports" value={form.narration}
                            onChange={e => setForm(f => ({ ...f, narration: e.target.value }))} />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
                          <Button type="submit" className="flex-1 bg-blue-800 hover:bg-blue-900" disabled={submitting}>
                            {submitting ? "Saving..." : "Save Entry"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditingEntry(null); }}>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit accounting entry</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
                        <div>
                          <Label>Type *</Label>
                          <Select
                            value={editForm.entry_type}
                            onValueChange={(v) =>
                              setEditForm((f) => ({ ...f, entry_type: v as "revenue" | "expense", category: "" }))
                            }
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="revenue">Revenue</SelectItem>
                              <SelectItem value="expense">Expense</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Category *</Label>
                          <Select value={editForm.category} onValueChange={(v) => setEditForm((f) => ({ ...f, category: v }))}>
                            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent>
                              {(editForm.entry_type === "revenue" ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Amount (UGX) *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={editForm.amount}
                            onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Date *</Label>
                          <Input
                            type="date"
                            value={editForm.entry_date}
                            onChange={(e) => setEditForm((f) => ({ ...f, entry_date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Payment method</Label>
                          <Select value={editForm.payment_method} onValueChange={(v) => setEditForm((f) => ({ ...f, payment_method: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {PAYMENT_METHODS.map((m) => (
                                <SelectItem key={m} value={m}>{m.replace("_", " ")}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Description (optional)</Label>
                          <Input
                            value={editForm.description}
                            onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Narration (optional)</Label>
                          <Input
                            placeholder="Remarks for cash book / reports"
                            value={editForm.narration}
                            onChange={(e) => setEditForm((f) => ({ ...f, narration: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button type="button" variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" className="flex-1 bg-blue-800 hover:bg-blue-900" disabled={editSubmitting}>
                            {editSubmitting ? "Saving..." : "Save changes"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* ── Report Tabs ── */}
              <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <TabsList
                    className={cn(
                      "max-w-full flex-nowrap gap-1 overflow-x-auto overflow-y-hidden bg-slate-100 p-1 [scrollbar-width:thin] touch-pan-x",
                      "h-auto min-h-11 justify-start",
                    )}
                  >
                    <TabsTrigger value="pl" className="shrink-0 text-xs">
                      Financial Overview
                    </TabsTrigger>
                    <TabsTrigger value="portfolio" className="shrink-0 text-xs">
                      Loan Portfolio
                    </TabsTrigger>
                    <TabsTrigger value="aging_report" className="shrink-0 text-xs">
                      Aging Report
                    </TabsTrigger>
                    <TabsTrigger value="comprehensive_income" className="shrink-0 text-xs">
                      Comprehensive Income
                    </TabsTrigger>
                    <TabsTrigger value="financial_position" className="shrink-0 text-xs">
                      Financial Position
                    </TabsTrigger>
                    <TabsTrigger value="cashflow_statement" className="shrink-0 text-xs">
                      Cashflow Statement
                    </TabsTrigger>
                    <TabsTrigger value="equity_statement" className="shrink-0 text-xs">
                      Equity Statement
                    </TabsTrigger>
                    <TabsTrigger value="financial_analysis" className="shrink-0 text-xs">
                      Financial Analysis
                    </TabsTrigger>
                    <TabsTrigger value="cashbook" className="shrink-0 text-xs">
                      Cash Book
                    </TabsTrigger>
                    <TabsTrigger value="trial" className="shrink-0 text-xs">
                      Trial Balance
                    </TabsTrigger>
                  </TabsList>
                  {activeTab !== "pl" && (
                    <div className="flex gap-2 items-center">
                      <Input type="date" value={reportFrom} onChange={e => setReportFrom(e.target.value)}
                        className="h-8 text-xs w-36" placeholder="From" />
                      <Input type="date" value={reportTo} onChange={e => setReportTo(e.target.value)}
                        className="h-8 text-xs w-36" placeholder="To" />
                      <Button variant="outline" size="sm" className="h-8 text-xs"
                        onClick={() => loadReport(activeTab)} disabled={!!reportLoading}>
                        <RefreshCw className={`h-3 w-3 mr-1 ${reportLoading ? "animate-spin" : ""}`} />
                        Refresh
                      </Button>
                    </div>
                  )}
                </div>

                <TabsContent value="pl" className="space-y-6 mt-4">
                  {/* ── Summary Cards ── */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* This Month Revenue */}
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                      <CardHeader className="pb-1 pt-4 px-4">
                        <CardTitle className="text-xs uppercase tracking-wider text-slate-500">Revenue (Month)</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <div className="text-xl font-bold text-slate-900">{fmt(currentMonth?.revenue || 0)}</div>
                        <div className="text-xs text-emerald-600 flex items-center gap-0.5 mt-0.5">
                          <ArrowUpRight className="h-3 w-3" /> Income this month
                        </div>
                      </CardContent>
                    </Card>

                    {/* This Month Expenses */}
                    <Card className="border-l-4 border-l-red-500 shadow-sm">
                      <CardHeader className="pb-1 pt-4 px-4">
                        <CardTitle className="text-xs uppercase tracking-wider text-slate-500">Expenses (Month)</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <div className="text-xl font-bold text-slate-900">{fmt(currentMonth?.expenses || 0)}</div>
                        <div className="text-xs text-red-600 flex items-center gap-0.5 mt-0.5">
                          <ArrowDownRight className="h-3 w-3" /> Costs this month
                        </div>
                      </CardContent>
                    </Card>

                    {/* Net Profit */}
                    <Card className={`border-l-4 ${(currentMonth?.netProfit || 0) >= 0 ? 'border-l-blue-600' : 'border-l-orange-500'} shadow-sm`}>
                      <CardHeader className="pb-1 pt-4 px-4">
                        <CardTitle className="text-xs uppercase tracking-wider text-slate-500">Net Profit (Month)</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <div className={`text-xl font-bold ${(currentMonth?.netProfit || 0) >= 0 ? 'text-blue-800' : 'text-orange-600'}`}>
                          {fmt(Math.abs(currentMonth?.netProfit || 0))}
                          <span className="text-sm font-normal ml-1">{(currentMonth?.netProfit || 0) >= 0 ? 'profit' : 'loss'}</span>
                        </div>
                        <div className={`text-xs flex items-center gap-0.5 mt-0.5 ${profitTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {profitTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(profitTrend).toFixed(1)}% vs last month
                        </div>
                      </CardContent>
                    </Card>

                    {/* YTD Net Profit */}
                    <Card className={`border-l-4 ${ytd.netProfit >= 0 ? 'border-l-amber-500' : 'border-l-orange-600'} shadow-sm`}>
                      <CardHeader className="pb-1 pt-4 px-4">
                        <CardTitle className="text-xs uppercase tracking-wider text-slate-500">YTD Net Profit</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <div className={`text-xl font-bold ${ytd.netProfit >= 0 ? 'text-amber-700' : 'text-orange-600'}`}>
                          {fmt(Math.abs(ytd.netProfit))}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {new Date().getFullYear()} year-to-date
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* ── Charts Row ── */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {/* P&L Bar Chart — takes 3/5 width */}
                    <Card className="lg:col-span-3 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">Revenue vs Expenses</CardTitle>
                        <CardDescription>Last 13 months — UGX</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={plSummary?.monthly || []} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                            barGap={2} barCategoryGap="25%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                            <YAxis tickFormatter={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : `${(v / 1_000).toFixed(0)}K`}
                              tick={{ fontSize: 10, fill: "#64748b" }} />
                            <Tooltip formatter={(v: any) => `UGX ${parseInt(v).toLocaleString()}`} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="revenue" name="Revenue" fill="#16a34a" radius={[3, 3, 0, 0]} />
                            <Bar dataKey="expenses" name="Expenses" fill="#dc2626" radius={[3, 3, 0, 0]} />
                            <Bar dataKey="netProfit" name="Net Profit" fill="#1d4ed8" radius={[3, 3, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Expense Breakdown Pie — takes 2/5 width */}
                    <Card className="lg:col-span-2 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">Expense Breakdown</CardTitle>
                        <CardDescription>Current month by category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {(plSummary?.expenseCategories || []).length > 0 ? (
                          <>
                            <ResponsiveContainer width="100%" height={180}>
                              <PieChart>
                                <Pie
                                  data={plSummary.expenseCategories}
                                  cx="50%" cy="50%"
                                  innerRadius={50} outerRadius={80}
                                  dataKey="amount"
                                  nameKey="category"
                                  paddingAngle={2}
                                >
                                  {plSummary.expenseCategories.map((_: any, i: number) => (
                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(v: any) => `UGX ${parseInt(v).toLocaleString()}`} />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1 mt-2">
                              {(plSummary.expenseCategories || []).slice(0, 5).map((c: any, i: number) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                    <span className="text-slate-600 truncate max-w-[120px]">{c.category}</span>
                                  </div>
                                  <span className="font-medium text-slate-800">{fmt(c.amount)}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="h-44 flex items-center justify-center text-slate-400 text-sm">
                            No expense data this month
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* ── Net Profit Trend ── */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Net Profit Trend</CardTitle>
                      <CardDescription>Month-over-month profitability</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={plSummary?.monthly || []} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                          <YAxis tickFormatter={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : `${(v / 1_000).toFixed(0)}K`}
                            tick={{ fontSize: 10, fill: "#64748b" }} />
                          <Tooltip formatter={(v: any) => `UGX ${parseInt(v).toLocaleString()}`} />
                          <Area type="monotone" dataKey="netProfit" name="Net Profit"
                            stroke="#1d4ed8" fill="url(#netGrad)" strokeWidth={2} dot={{ r: 3, fill: "#1d4ed8" }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* ── Entries Table ── */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <CardTitle className="text-base">Financial Overview</CardTitle>
                          <CardDescription>{totalEntries} total entries</CardDescription>
                        </div>
                        {/* Filters */}
                        <div className="flex gap-2 flex-wrap">
                          <Select value={filterType} onValueChange={v => { setFilterType(v); setPage(0); setFilterCategory("all"); }}>
                            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="revenue">Revenue</SelectItem>
                              <SelectItem value="expense">Expense</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={filterCategory} onValueChange={v => { setFilterCategory(v); setPage(0); }}>
                            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All Categories" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {(filterType === "revenue" ? REVENUE_CATEGORIES
                                : filterType === "expense" ? EXPENSE_CATEGORIES
                                  : [...REVENUE_CATEGORIES, ...EXPENSE_CATEGORIES]
                              ).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Input type="date" value={filterFrom} onChange={e => { setFilterFrom(e.target.value); setPage(0); }}
                            className="h-8 text-xs w-36" placeholder="From" />
                          <Input type="date" value={filterTo} onChange={e => { setFilterTo(e.target.value); setPage(0); }}
                            className="h-8 text-xs w-36" placeholder="To" />
                          <Button variant="ghost" size="sm" className="h-8 text-xs"
                            onClick={() => { setFilterType("all"); setFilterCategory("all"); setFilterFrom(""); setFilterTo(""); setPage(0); }}>
                            Clear
                          </Button>
                          <div className="relative w-full sm:w-48">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input
                              placeholder="Search this page..."
                              className="h-8 text-xs pl-7"
                              value={entrySearch}
                              onChange={(e) => setEntrySearch(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-slate-50">
                              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Narration</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[88px]">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {entries.length === 0 ? (
                              <tr><td colSpan={9} className="text-center py-10 text-slate-400">No entries found</td></tr>
                            ) : filteredEntries.length === 0 ? (
                              <tr><td colSpan={9} className="text-center py-10 text-slate-400">No entries match your search on this page.</td></tr>
                            ) : filteredEntries.map((entry) => (
                              <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(entry.entry_date)}</td>
                                <td className="px-4 py-3">
                                  <Badge variant={entry.entry_type === "revenue" ? "default" : "secondary"}
                                    className={entry.entry_type === "revenue"
                                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                                      : "bg-red-100 text-red-800 hover:bg-red-100"}>
                                    {entry.entry_type}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-slate-700">{entry.category}</td>
                                <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{entry.description || "—"}</td>
                                <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{entry.narration || "—"}</td>
                                <td className="px-4 py-3 text-slate-500 capitalize">{(entry.payment_method || "").replace("_", " ")}</td>
                                <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${entry.entry_type === "revenue" ? "text-emerald-700" : "text-red-700"}`}>
                                  {entry.entry_type === "revenue" ? "+" : "−"} UGX {parseInt(entry.amount).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-slate-400 hover:text-blue-700"
                                      onClick={() => openEditEntry(entry)}
                                      title="Edit entry"
                                      type="button"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                                      onClick={() => handleDelete(entry.id)}
                                      title="Delete entry"
                                      type="button"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="text-xs text-slate-500">
                          Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalEntries)} of {totalEntries}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" disabled={(page + 1) * PAGE_SIZE >= totalEntries} onClick={() => setPage(p => p + 1)}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ── Loan Portfolio ── */}
                <TabsContent value="portfolio" className="mt-4 space-y-4">
                  <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-2">
                    <div className="flex items-center gap-6">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <Wallet className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900">Loan Portfolio</h2>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">Active loans and outstanding balances</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => loadReport("portfolio")} className="h-9 text-xs gap-1 border-slate-200">
                        <RefreshCw className={`h-3 w-3 ${reportLoading === "portfolio" ? "animate-spin" : ""}`} /> Refresh
                      </Button>
                      <Button variant="outline" size="sm" onClick={exportLoanPortfolio} className="h-9 text-xs gap-1 border-slate-200 hover:bg-slate-50 shadow-sm">
                        <Download className="h-3 w-3" /> Export Excel
                      </Button>
                    </div>
                  </div>

                  {reportLoading === "portfolio" ? (
                    <div className="flex items-center justify-center py-16"><RefreshCw className="h-8 w-8 text-primary animate-spin" /></div>
                  ) : loanPortfolio?.loans ? (
                    <Card className="shadow-xl border-none overflow-hidden rounded-2xl text-xs">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-slate-50">
                            <TableRow>
                              <TableHead className="font-bold text-[10px] uppercase">Client</TableHead>
                              <TableHead className="font-bold text-[10px] uppercase">Loan Product</TableHead>
                              <TableHead className="text-right font-bold text-[10px] uppercase">Principal</TableHead>
                              <TableHead className="text-right font-bold text-[10px] uppercase">Interest</TableHead>
                              <TableHead className="text-right font-bold text-[10px] uppercase">Outstanding</TableHead>
                              <TableHead className="text-right font-bold text-[10px] uppercase">Days Overdue</TableHead>
                              <TableHead className="font-bold text-[10px] uppercase">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loanPortfolio.loans.map((l: any, i: number) => (
                              <TableRow key={i} className="hover:bg-slate-50">
                                <TableCell className="font-medium p-3">{l.client_name}</TableCell>
                                <TableCell className="p-3">{l.loan_product}</TableCell>
                                <TableCell className="text-right tabular-nums p-3">{fmt(l.principal || 0)}</TableCell>
                                <TableCell className="text-right tabular-nums p-3">{fmt(l.interest || 0)}</TableCell>
                                <TableCell className="text-right font-bold tabular-nums text-blue-700 p-3">{fmt(l.total_outstanding || 0)}</TableCell>
                                <TableCell className="text-right tabular-nums p-3">
                                  <Badge variant={l.days_overdue > 0 ? "destructive" : "outline"} className="h-5 px-2 text-[10px]">
                                    {l.days_overdue > 0 ? `${l.days_overdue} days` : "Current"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="p-3">
                                  <Badge variant="secondary" className="h-5 px-2 text-[10px] capitalize">
                                    {l.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </Card>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                      <RefreshCw className="h-8 w-8 text-slate-300 mb-4 cursor-pointer hover:text-primary transition-colors" onClick={() => loadReport("portfolio")} />
                      <p className="text-slate-400 font-bold italic">Click the refresh icon above to load portfolio data.</p>
                    </div>
                  )}
                </TabsContent>

                {/* ── Income Statement ── */}
                <TabsContent value="income" className="mt-4">
                  {reportLoading === "income" ? (
                    <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" /></div>
                  ) : incomeStmt ? (
                    <Card className="shadow-sm border-slate-200">
                      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-xl">
                            <FileText className="h-5 w-5 text-blue-800" />
                            Profit & Loss Statement
                          </CardTitle>
                          <CardDescription className="text-slate-500">
                            Reporting Period: <span className="font-medium text-slate-700">{formatDate(incomeStmt.period?.start)}</span> to <span className="font-medium text-slate-700">{formatDate(incomeStmt.period?.end)}</span>
                          </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={exportIncomeStatement} className="hover:bg-slate-50">
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-8">
                          {/* Financial Sections */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                              <thead>
                                <tr className="border-b text-slate-400 font-medium">
                                  <th className="text-left py-2 px-4">Particulars</th>
                                  <th className="text-right py-2 px-4">Amount (UGX)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {incomeStmt.sections?.map((section: any, idx: number) => (
                                  section.isSubtotal ? (
                                    <tr key={idx} className="bg-slate-50/50">
                                      <td className="py-3 px-4 font-bold text-slate-900 border-t-2 border-slate-200 uppercase tracking-tight">
                                        {section.title}
                                      </td>
                                      <td className={`py-3 px-4 text-right font-bold border-t-2 border-slate-200 ${section.total >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                        {section.total.toLocaleString()}
                                      </td>
                                    </tr>
                                  ) : (
                                    <Fragment key={idx}>
                                      <tr className="bg-blue-50/30">
                                        <td className="py-2 px-4 font-semibold text-blue-900 uppercase text-xs tracking-wider" colSpan={2}>
                                          {section.title}
                                        </td>
                                      </tr>
                                      {section.categories && Object.entries(section.categories).map(([cat, val]: any) => (
                                        <tr key={cat} className="hover:bg-slate-50">
                                          <td className="py-1.5 px-8 text-slate-600">{cat}</td>
                                          <td className="text-right px-4 text-slate-700">{val.toLocaleString()}</td>
                                        </tr>
                                      ))}
                                      <tr className="border-t border-slate-100 font-medium bg-slate-50/30">
                                        <td className="py-2 px-6 italic text-slate-700">Total {section.title}</td>
                                        <td className="text-right px-4 font-semibold text-slate-900">{section.total.toLocaleString()}</td>
                                      </tr>
                                    </Fragment>
                                  )
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Ratios Section */}
                          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-700" />
                              Financial Ratios (as % of Avg Portfolio)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                              <div className="space-y-1">
                                <p className="text-xs text-slate-500 font-medium">Average Portfolio</p>
                                <p className="text-lg font-bold text-slate-900">UGX {incomeStmt.kpis?.avg_portfolio?.toLocaleString()}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-500 font-medium">Net Financial Income / Avg Portfolio</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-lg font-bold text-emerald-700">{incomeStmt.kpis?.net_financial_income_ratio}%</p>
                                  <Badge className="bg-emerald-100 text-emerald-800 border-none text-[10px]">KPI</Badge>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-500 font-medium">Net Operational Income / Avg Portfolio</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-lg font-bold text-blue-700">{incomeStmt.kpis?.net_operational_income_ratio}%</p>
                                  <Badge className="bg-blue-100 text-blue-800 border-none text-[10px]">OSS</Badge>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-500 font-medium">Net Income / Avg Portfolio</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-lg font-bold text-amber-700">{incomeStmt.kpis?.net_income_ratio}%</p>
                                  <Badge className="bg-amber-100 text-amber-800 border-none text-[10px]">ROA</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </TabsContent>

                {/* ── Balance Sheet ── */}
                <TabsContent value="balance" className="mt-4">
                  {reportLoading === "balance" ? (
                    <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" /></div>
                  ) : balanceSheet ? (
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5" /> Balance Sheet</CardTitle>
                          <CardDescription>As of {balanceSheet.as_of}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={exportBalanceSheet}>
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <h3 className="font-semibold text-slate-700 mb-2">Assets</h3>
                            <table className="w-full text-sm">
                              <tbody>
                                <tr><td className="py-1 pl-2">Cash at Bank</td><td className="text-right">{balanceSheet.assets?.cash_at_bank?.toLocaleString() ?? 0}</td></tr>
                                <tr><td className="py-1 pl-2">Mobile Money Float</td><td className="text-right">{balanceSheet.assets?.mobile_money_float?.toLocaleString() ?? 0}</td></tr>
                                <tr><td className="py-1 pl-2">Loans Receivable</td><td className="text-right">{balanceSheet.assets?.loans_receivable?.toLocaleString() ?? 0}</td></tr>
                                <tr><td className="py-1 pl-2">Accrued Interest</td><td className="text-right">{balanceSheet.assets?.accrued_interest?.toLocaleString() ?? 0}</td></tr>
                                <tr><td className="py-1 pl-2">Fixed Assets</td><td className="text-right">{balanceSheet.assets?.fixed_assets?.toLocaleString() ?? 0}</td></tr>
                                <tr><td className="py-1 pl-2">Prepaid Expenses</td><td className="text-right">{balanceSheet.assets?.prepaid_expenses?.toLocaleString() ?? 0}</td></tr>
                                <tr className="border-t font-semibold"><td className="py-2">Total Assets</td><td className="text-right">{balanceSheet.assets?.total?.toLocaleString() ?? 0}</td></tr>
                              </tbody>
                            </table>
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-700 mb-2">Liabilities</h3>
                            <table className="w-full text-sm">
                              <tbody>
                                <tr><td className="py-1 pl-2">Client Deposits</td><td className="text-right">{balanceSheet.liabilities?.client_deposits?.toLocaleString() ?? 0}</td></tr>
                                <tr><td className="py-1 pl-2">Borrowed Funds</td><td className="text-right">{balanceSheet.liabilities?.borrowed_funds?.toLocaleString() ?? 0}</td></tr>
                                <tr><td className="py-1 pl-2">Payables</td><td className="text-right">{balanceSheet.liabilities?.payables?.toLocaleString() ?? 0}</td></tr>
                                <tr><td className="py-1 pl-2">Accrued Expenses</td><td className="text-right">{balanceSheet.liabilities?.accrued_expenses?.toLocaleString() ?? 0}</td></tr>
                                <tr className="border-t font-semibold"><td className="py-2">Total Liabilities</td><td className="text-right">{balanceSheet.liabilities?.total?.toLocaleString() ?? 0}</td></tr>
                              </tbody>
                            </table>
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-700 mb-2">Equity</h3>
                            <table className="w-full text-sm">
                              <tbody>
                                <tr><td className="py-1 pl-2">Share Capital</td><td className="text-right">{balanceSheet.equity?.share_capital?.toLocaleString() ?? 0}</td></tr>
                                <tr><td className="py-1 pl-2">Retained Earnings</td><td className="text-right">{balanceSheet.equity?.retained_earnings?.toLocaleString() ?? 0}</td></tr>
                                <tr><td className="py-1 pl-2">Current Year Profit</td><td className="text-right">{balanceSheet.equity?.current_year_profit?.toLocaleString() ?? 0}</td></tr>
                                <tr className="border-t font-semibold"><td className="py-2">Total Equity</td><td className="text-right">{balanceSheet.equity?.total?.toLocaleString() ?? 0}</td></tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </TabsContent>

                {/* ── Cash Flow ── */}
                <TabsContent value="cashflow" className="mt-4">
                  {reportLoading === "cashflow" ? (
                    <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" /></div>
                  ) : cashFlow ? (
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5" /> Cash Flow Statement</CardTitle>
                          <CardDescription>{cashFlow.period?.start} to {cashFlow.period?.end}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={exportCashFlow}>
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-blue-700 mb-2">Operating Activities</h3>
                            <table className="w-full text-sm">
                              <tbody>
                                <tr><td className="py-1 pl-4">Cash from loan repayments</td><td className="text-right text-emerald-600">{(cashFlow.operating?.cash_from_loan_repayments ?? 0).toLocaleString()}</td></tr>
                                <tr><td className="py-1 pl-4">Interest collected</td><td className="text-right text-emerald-600">{(cashFlow.operating?.interest_collected ?? 0).toLocaleString()}</td></tr>
                                <tr><td className="py-1 pl-4">Other operating inflows</td><td className="text-right text-emerald-600">{(cashFlow.operating?.other_operating_inflows ?? 0).toLocaleString()}</td></tr>
                                <tr><td className="py-1 pl-4">Operating expenses paid</td><td className="text-right text-red-600">({(cashFlow.operating?.operating_expenses_paid ?? 0).toLocaleString()})</td></tr>
                                <tr className="border-t font-semibold"><td className="py-2">Net Operating</td><td className="text-right">{cashFlow.operating?.net?.toLocaleString() ?? 0}</td></tr>
                              </tbody>
                            </table>
                          </div>
                          <div>
                            <h3 className="font-semibold text-amber-700 mb-2">Investing Activities</h3>
                            <table className="w-full text-sm">
                              <tbody>
                                <tr><td className="py-1 pl-4">Inflows</td><td className="text-right">{(cashFlow.investing?.inflows ?? 0).toLocaleString()}</td></tr>
                                <tr><td className="py-1 pl-4">Outflows (asset purchases)</td><td className="text-right">({(cashFlow.investing?.outflows ?? 0).toLocaleString()})</td></tr>
                                <tr className="border-t font-semibold"><td className="py-2">Net Investing</td><td className="text-right">{cashFlow.investing?.net?.toLocaleString() ?? 0}</td></tr>
                              </tbody>
                            </table>
                          </div>
                          <div>
                            <h3 className="font-semibold text-orange-700 mb-2">Financing Activities</h3>
                            <table className="w-full text-sm">
                              <tbody>
                                <tr><td className="py-1 pl-4">Inflows (capital, loans)</td><td className="text-right">{(cashFlow.financing?.inflows ?? 0).toLocaleString()}</td></tr>
                                <tr><td className="py-1 pl-4">Outflows</td><td className="text-right">({(cashFlow.financing?.outflows ?? 0).toLocaleString()})</td></tr>
                                <tr className="border-t font-semibold"><td className="py-2">Net Financing</td><td className="text-right">{cashFlow.financing?.net?.toLocaleString() ?? 0}</td></tr>
                              </tbody>
                            </table>
                          </div>
                          <div className={`p-3 rounded-lg font-bold ${(cashFlow.net_cash_flow ?? 0) >= 0 ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                            Net Cash Flow: UGX {(cashFlow.net_cash_flow ?? 0).toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </TabsContent>




                {/* ── Cash Book ── */}
                <TabsContent value="cashbook" className="mt-4 space-y-4">
                  <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-2">
                    <div className="flex items-center gap-6">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <Landmark className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900">Cashbook</h2>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">Daily transaction log and running balance</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <Select value={filterAccount} onValueChange={v => { setFilterAccount(v); loadReport("cashbook"); }}>
                        <SelectTrigger className="w-[180px] h-9 text-xs bg-white border-slate-200"><SelectValue placeholder="All Accounts" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Accounts</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={exportCashBook} className="h-9 text-xs gap-1 border-slate-200 hover:bg-slate-50 shadow-sm">
                        <Download className="h-3 w-3" /> Export Excel
                      </Button>
                    </div>
                  </div>

                  {reportLoading === "cashbook" ? (
                    <div className="flex items-center justify-center py-16"><RefreshCw className="h-8 w-8 text-primary animate-spin" /></div>
                  ) : cashBookData?.transactions ? (
                    <Card className="shadow-xl border-none overflow-hidden rounded-2xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="border-none">
                              <th className="text-left py-4 px-6 text-slate-500 font-black text-[10px] uppercase tracking-widest">Date</th>
                              <th className="text-left py-4 px-6 text-slate-500 font-black text-[10px] uppercase tracking-widest">Details</th>
                              <th className="text-right py-4 px-6 text-slate-500 font-black text-[10px] uppercase tracking-widest">Debit (+)</th>
                              <th className="text-right py-4 px-6 text-slate-500 font-black text-[10px] uppercase tracking-widest">Credit (-)</th>
                              <th className="text-right py-4 px-6 text-slate-500 font-black text-[10px] uppercase tracking-widest">Balance</th>
                              <th className="text-left py-4 px-6 text-slate-500 font-black text-[10px] uppercase tracking-widest">Narration</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Opening Balance Row */}
                            <tr className="bg-slate-50/80 font-bold border-b border-slate-100">
                              <td className="py-4 px-6 text-[11px] text-slate-400 font-mono italic">{new Date(reportFrom || cashBookData.period.start).toLocaleDateString('en-GB')}</td>
                              <td className="py-4 px-6 font-black text-slate-900 uppercase text-xs">OPENING BALANCE B/F</td>
                              <td colSpan={2} className="py-4 px-6"></td>
                              <td className="py-4 px-6 text-right font-black text-slate-900 tabular-nums">{fmt(cashBookData.summaries?.[filterAccount === 'all' ? 'cash' : filterAccount]?.opening || 0)}</td>
                              <td className="py-4 px-6 text-[10px] text-slate-400 italic">Balance brought forward</td>
                            </tr>
                            {(() => {
                              let runningBalance = cashBookData.summaries?.[filterAccount === 'all' ? 'cash' : filterAccount]?.opening || 0;
                              const sorted = [...(cashBookData.transactions || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                              return sorted.map((t: any) => {
                                const isDebit = t.entry_type === 'revenue' || t.entry_type === 'asset' || t.source === 'repayment';
                                const amount = parseFloat(t.amount);
                                runningBalance += isDebit ? amount : -amount;
                                return (
                                  <tr key={t.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 group">
                                    <td className="py-5 px-6 text-[11px] font-bold text-slate-500 font-mono">{new Date(t.date).toLocaleDateString('en-GB')}</td>
                                    <td className="py-5 px-6">
                                      <div className="font-bold text-slate-800 uppercase text-[11px] tracking-tight">{cashBookLineDetails(t.description)}</div>
                                      <div className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1 font-bold">
                                        <Badge variant="outline" className="h-4 py-0 text-[8px] border-slate-200">ID: {t.id.slice(0, 8)}</Badge>
                                      </div>
                                    </td>
                                    <td className="py-5 px-6 text-right">{isDebit ? <span className="font-black text-emerald-600 tabular-nums">{fmt(amount)}</span> : "—"}</td>
                                    <td className="py-5 px-6 text-right">{!isDebit ? <span className="font-black text-red-500 tabular-nums">({fmt(amount)})</span> : "—"}</td>
                                    <td className="py-5 px-6 text-right font-black text-slate-900 bg-slate-50/50 tabular-nums">{fmt(runningBalance)}</td>
                                    <td className="py-5 px-6">
                                      <div className="text-[10px] text-slate-500 italic">{cashBookLineNarration(t)}</div>
                                    </td>
                                  </tr>
                                );
                              }).reverse();
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-inner">
                      <BookOpen className="h-12 w-12 text-slate-200 mb-3" />
                      <p className="text-slate-400 font-bold italic">No transactions found for this period.</p>
                    </div>
                  )}
                </TabsContent>

                {/* ── Financial Analysis (Z-Score) ── */}
                <TabsContent value="financial_analysis" className="mt-4">
                  {reportLoading === "financial_analysis" ? (
                    <div className="flex items-center justify-center py-16"><RefreshCw className="h-8 w-8 text-primary animate-spin" /></div>
                  ) : financialAnalysisData ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="min-w-0">
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Financial Risk Assessment</h2>
                          <p className="text-slate-500 text-sm font-medium tracking-tight">Altman Z-Score Model for Private Firms</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <Button
                            className="h-10 px-4 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                            onClick={() => void handleFinancialAiAnalysis()}
                            disabled={financialAiLoading}
                          >
                            {financialAiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                            AI summary
                          </Button>
                          <Button variant="outline" className="h-10 px-4 font-semibold border-slate-200 hover:bg-slate-50" onClick={handleZScoreExport} disabled={isExportingZScore}>
                            {isExportingZScore ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                            Export Word
                          </Button>
                        </div>
                      </div>

                      <Dialog open={financialAiOpen} onOpenChange={setFinancialAiOpen}>
                        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
                          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-slate-50/80">
                            <DialogTitle className="flex items-center gap-2 text-lg">
                              <Sparkles className="h-5 w-5 text-indigo-600" />
                              AI summary
                            </DialogTitle>
                          </DialogHeader>
                          <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0 text-sm text-slate-700 leading-relaxed space-y-3">
                            {financialAiLoading ? (
                              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
                                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                                <span className="font-medium">Writing a short summary…</span>
                              </div>
                            ) : financialAiNarrative ? (
                              financialAiNarrative.split(/\r?\n/).filter((line) => line.trim()).map((line, i) => {
                                const t = line.trim();
                                const bullet = /^[•\-]\s/.test(t) || t.startsWith("•");
                                return (
                                  <p
                                    key={i}
                                    className={bullet ? "pl-4 border-l-2 border-indigo-200 text-slate-800" : ""}
                                  >
                                    {bullet ? t.replace(/^[•\-]\s*/, "• ") : t}
                                  </p>
                                );
                              })
                            ) : (
                              <p className="text-slate-500">No content.</p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Gauge + components: single row on xl — 3-col grid fits 5 cards in 2 rows without tall scroll */}
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 xl:gap-4 xl:items-start">
                        <Card className="xl:col-span-4 overflow-hidden border border-slate-100 shadow-md bg-white rounded-2xl">
                          <CardHeader className="bg-slate-50/50 border-b py-2 px-4">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Business Health Index</CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col items-center py-5 px-3 relative">
                            <div className="relative w-[13rem] sm:w-56 max-w-full h-[6.5rem] sm:h-28 overflow-hidden">
                              <svg viewBox="0 0 100 50" className="w-full h-full">
                                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
                                <path
                                  d="M 10 50 A 40 40 0 0 1 90 50"
                                  fill="none"
                                  stroke={financialAnalysisData.z_score > 2.9 ? "#10b981" : financialAnalysisData.z_score > 1.23 ? "#f59e0b" : "#ef4444"}
                                  strokeWidth="10"
                                  strokeLinecap="round"
                                  strokeDasharray={`${Math.min(125.6, Math.max(0, (financialAnalysisData.z_score / 4) * 125.6))}, 125.6`}
                                  className="transition-all duration-1000 ease-out"
                                />
                              </svg>
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center w-full">
                                <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                                  {financialAnalysisData.z_score?.toFixed(2)}
                                </div>
                                <div
                                  className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md ${
                                    financialAnalysisData.z_score > 2.9
                                      ? "bg-emerald-500 text-white"
                                      : financialAnalysisData.z_score > 1.23
                                        ? "bg-amber-500 text-white"
                                        : "bg-red-500 text-white"
                                  }`}
                                >
                                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                  {financialAnalysisData.zone} Zone
                                </div>
                              </div>
                            </div>

                            <div className="mt-5 grid grid-cols-3 w-full gap-3 text-center px-2">
                              <div className="space-y-1">
                                <div className="text-[8px] font-black text-slate-400 tracking-widest uppercase">Distress</div>
                                <div className="h-1 w-full bg-red-100 rounded-full" />
                              </div>
                              <div className="space-y-1">
                                <div className="text-[8px] font-black text-slate-400 tracking-widest uppercase">Grey</div>
                                <div className="h-1 w-full bg-amber-100 rounded-full" />
                              </div>
                              <div className="space-y-1">
                                <div className="text-[8px] font-black text-slate-400 tracking-widest uppercase">Safe</div>
                                <div className="h-1 w-full bg-emerald-100 rounded-full" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="xl:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 content-start">
                          {(financialAnalysisData.components || []).map((c: any) => {
                            const pts = (c.ratio ?? 0) * (c.standard ?? 0);
                            const ptsStr = (pts >= 0 ? "+" : "") + pts.toFixed(3);
                            return (
                              <Card key={c.id} className="border border-slate-100 shadow-sm bg-white hover:bg-indigo-50/20 transition-all rounded-xl">
                                <CardHeader className="pb-0 pt-3 px-3 space-y-0">
                                  <CardTitle className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.id} Component</CardTitle>
                                </CardHeader>
                                <CardContent className="px-3 pb-3 pt-1">
                                  <div className="text-lg sm:text-xl font-black text-slate-900 tabular-nums leading-tight">{c.ratio?.toFixed(3)}</div>
                                  <p className="text-[9px] text-slate-500 font-bold leading-snug min-h-[2.25rem] uppercase opacity-70 tracking-tight line-clamp-2">
                                    {c.method}
                                  </p>
                                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                                    <div className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full shrink-0">W: {c.standard}</div>
                                    <div className="text-[10px] font-black text-slate-900 tabular-nums truncate" title={ptsStr}>
                                      {ptsStr}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>

                      <Card className="bg-white border border-slate-200 shadow-md overflow-hidden rounded-2xl">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3 px-4">
                          <CardTitle className="text-slate-900 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <div className="h-4 w-4 rounded bg-indigo-600 flex items-center justify-center shrink-0">
                              <Scale className="h-2.5 w-2.5 text-white" />
                            </div>
                            Strategic Risk Interpretation
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-0 text-slate-900">
                          <div className={`p-4 md:p-5 transition-all ${financialAnalysisData.z_score > 2.9 ? "bg-emerald-50/50" : "opacity-40"}`}>
                            <div className="flex items-center gap-2 text-emerald-600 font-black mb-2 text-xs tracking-widest uppercase">
                              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] shrink-0" />
                              Secure (Z {'>'} 2.9)
                            </div>
                            <p className="text-[10px] text-slate-600 leading-snug font-semibold">
                              The organization demonstrates optimal liquidity and profitability. Risk of failure within 2 years is statistically negligible. Strategic leverage and expansion are recommended.
                            </p>
                          </div>
                          <div
                            className={`p-4 md:p-5 transition-all ${
                              financialAnalysisData.z_score > 1.23 && financialAnalysisData.z_score <= 2.9 ? "bg-amber-50/50" : "opacity-40"
                            }`}
                          >
                            <div className="flex items-center gap-2 text-amber-600 font-black mb-2 text-xs tracking-widest uppercase">
                              <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)] shrink-0" />
                              Marginal (1.2 - 2.9)
                            </div>
                            <p className="text-[10px] text-slate-600 leading-snug font-semibold">
                              Performance indicators are mixed. The entity resides in the &apos;Grey Zone&apos;. Management should focus on improving turnover ratios and reducing reliance on short-term liabilities.
                            </p>
                          </div>
                          <div className={`p-4 md:p-5 transition-all ${financialAnalysisData.z_score <= 1.23 ? "bg-red-50/50" : "opacity-40"}`}>
                            <div className="flex items-center gap-2 text-red-600 font-black mb-2 text-xs tracking-widest uppercase">
                              <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] shrink-0" />
                              Critical (Z {'<'} 1.2)
                            </div>
                            <p className="text-[10px] text-slate-600 leading-snug font-semibold">
                              Statistical indicators suggest high correlation with historical bankruptcy cases. Critical re-evaluation of current debt structure and immediate capital injection is likely required.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : null}
                </TabsContent>



                {/* ── Trial Balance ── */}
                <TabsContent value="trial" className="mt-4">
                  {reportLoading === "trial" ? (
                    <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" /></div>
                  ) : trialBalance ? (
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2"><PiggyBank className="h-5 w-5" /> Trial Balance</CardTitle>
                          <CardDescription>As of {trialBalance.as_of}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={exportTrialBalance}>
                          <Download className="h-4 w-4 mr-2" /> Export CSV
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <table className="w-full text-sm">
                          <thead><tr className="border-b"><th className="text-left py-2">Account</th><th className="text-right py-2">Debit</th><th className="text-right py-2">Credit</th></tr></thead>
                          <tbody>
                            {(trialBalance.lines ?? []).map((l: any, i: number) => (
                              <tr key={i} className="border-b"><td>{l.account}</td><td className="text-right">{l.debit ? l.debit.toLocaleString() : "—"}</td><td className="text-right">{l.credit ? l.credit.toLocaleString() : "—"}</td></tr>
                            ))}
                          </tbody>
                          <tfoot><tr className="font-semibold border-t-2"><td className="py-2">Total</td><td className="text-right">{(trialBalance.total_debits ?? 0).toLocaleString()}</td><td className="text-right">{(trialBalance.total_credits ?? 0).toLocaleString()}</td></tr></tfoot>
                        </table>
                      </CardContent>
                    </Card>
                  ) : null}
                </TabsContent>

                {/* ── Aging Report ── */}
                <TabsContent value="aging_report" className="mt-4">
                  {reportLoading === "aging_report" ? (
                    <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" /></div>
                  ) : (
                    <Card className="shadow-sm overflow-hidden">
                      <CardHeader className="bg-slate-50 border-b pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-green-700" />
                            Portfolio Aging Report ({reportFrom && reportTo ? `${formatDate(reportFrom)} - ${formatDate(reportTo)}` : selectedMonth})
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                              onClick={exportAgingReport}>
                              <Download className="h-3.5 w-3.5 mr-1" /> Export Excel
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-[10px] border-collapse">
                            <thead>
                              <tr className="bg-slate-100 border-b text-slate-600 font-bold uppercase tracking-tighter">
                                <th className="p-1 border text-left">#</th>
                                <th className="p-1 border text-left">Name</th>
                                <th className="p-1 border text-left">Loan Issue Date</th>
                                <th className="p-1 border text-center">Rate</th>
                                <th className="p-1 border text-left">Loan ID</th>
                                <th className="p-1 border text-center">Days of Month</th>
                                <th className="p-1 border text-center">Days in Period</th>
                                <th className="p-1 border text-right">Original Loan</th>
                                <th className="p-1 border text-right">Principal Outstanding</th>
                                <th className="p-1 border text-right">Interest for Month</th>
                                <th className="p-1 border text-right">Interest Due</th>
                                <th className="p-1 border text-right">Payments</th>
                                <th className="p-1 border text-right">Interest Income</th>
                                <th className="p-1 border text-right">Total Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {agingData.length === 0 ? (
                                <tr><td colSpan={14} className="p-4 text-center text-slate-400">No data available</td></tr>
                              ) : agingData.map((row) => (
                                <tr key={row.index} className="hover:bg-slate-50 border-b">
                                  <td className="p-1 border text-slate-500">{row.index}</td>
                                  <td className="p-1 border font-medium text-slate-900">{row.name}</td>
                                  <td className="p-1 border">{row.issue_date}</td>
                                  <td className="p-1 border text-center">{row.rate}</td>
                                  <td className="p-1 border font-mono">{row.loan_id}</td>
                                  <td className="p-1 border text-center">{row.days_of_month}</td>
                                  <td className="p-1 border text-center">{row.days_in_period}</td>
                                  <td className="p-1 border text-right">{(row.original_amount || 0).toLocaleString()}</td>
                                  <td className="p-1 border text-right font-medium">{(row.principal_outstanding || 0).toLocaleString()}</td>
                                  <td className="p-1 border text-right">{(row.interest_monthly || 0).toLocaleString()}</td>
                                  <td className="p-1 border text-right text-blue-700">{(row.interest_due || 0).toLocaleString()}</td>
                                  <td className="p-1 border text-right text-emerald-600">{(row.payments || 0).toLocaleString()}</td>
                                  <td className="p-1 border text-right font-semibold">{(row.interest_income || 0).toLocaleString()}</td>
                                  <td className="p-1 border text-right font-bold text-slate-900">{(row.total_balance || 0).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-slate-100 font-bold">
                              <tr>
                                <td colSpan={7} className="p-1 border text-right uppercase">Totals</td>
                                <td className="p-1 border text-right">{(agingData || []).reduce((s, r) => s + (r.original_amount || 0), 0).toLocaleString()}</td>
                                <td className="p-1 border text-right">{(agingData || []).reduce((s, r) => s + (r.principal_outstanding || 0), 0).toLocaleString()}</td>
                                <td className="p-1 border text-right">{(agingData || []).reduce((s, r) => s + (r.interest_monthly || 0), 0).toLocaleString()}</td>
                                <td className="p-1 border text-right">{(agingData || []).reduce((s, r) => s + (r.interest_due || 0), 0).toLocaleString()}</td>
                                <td className="p-1 border text-right">{(agingData || []).reduce((s, r) => s + (r.payments || 0), 0).toLocaleString()}</td>
                                <td className="p-1 border text-right">{(agingData || []).reduce((s, r) => s + (r.interest_income || 0), 0).toLocaleString()}</td>
                                <td className="p-1 border text-right">{(agingData || []).reduce((s, r) => s + (r.total_balance || 0), 0).toLocaleString()}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* ── Comprehensive Income (Monthly Matrix) ── */}
                <TabsContent value="comprehensive_income" className="mt-4">
                  {reportLoading === "comprehensive_income" ? (
                    <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" /></div>
                  ) : comprehensiveIncomeData ? (
                    <Card className="shadow-sm overflow-hidden">
                      <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between pb-4">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-700" />
                            Statement of Comprehensive Income ({comprehensiveIncomeData.year})
                          </CardTitle>
                          <CardDescription>Monthly Matrix (Values in UGX)</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="bg-emerald-50 text-emerald-700 border-emerald-200" onClick={exportComprehensiveIncome}>
                            <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
                          </Button>
                          <Button variant="outline" size="sm" className="bg-indigo-50 text-indigo-700 border-indigo-200" onClick={() => {
                            const to = reportTo || new Date().toISOString().split("T")[0];
                            const from = reportFrom || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
                            void api.reports.downloadComprehensiveIncomeDocx({ from, to });
                          }}>
                            <Download className="h-3.5 w-3.5 mr-1" /> Export Word
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-[10px] border-collapse min-w-[1000px]">
                          <thead>
                            <tr className="bg-slate-100 border-b text-slate-600 font-bold uppercase">
                              <th className="p-2 border text-left min-w-[200px]">Category</th>
                              {(comprehensiveIncomeData.columns || []).map((col: any) => (
                                <th key={col.key} className="p-2 border text-right">
                                  {col.label} {comprehensiveIncomeData.columns.length > 12 ? `'${String(col.year).slice(2)}` : ''}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(comprehensiveIncomeData.data || []).map((item: any) => {
                              const isRevenue = item.type === 'revenue' || item.category.includes("Income") || item.category.includes("Revenue");
                              return (
                                <tr key={item.category} className="hover:bg-slate-50 border-b">
                                  <td className={`p-2 border font-medium ${isRevenue ? 'text-emerald-800' : 'text-slate-700'}`}>{item.category}</td>
                                  {(comprehensiveIncomeData.columns || []).map((col: any) => (
                                    <td key={col.key} className="p-2 border text-right">
                                      {item.months[col.key]?.toLocaleString() || "—"}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-slate-100 font-bold">
                            <tr className="border-t-2">
                              <td className="p-2 border uppercase">Net Comprehensive Income</td>
                              {(comprehensiveIncomeData.columns || []).map((col: any) => {
                                let total = 0;
                                (comprehensiveIncomeData.data || []).forEach((item: any) => {
                                  const val = item.months[col.key] || 0;
                                  if (item.type === 'revenue') total += val;
                                  else total -= val;
                                });
                                return (
                                  <td key={col.key} className="p-2 border text-right text-indigo-800">
                                    {total.toLocaleString()}
                                  </td>
                                );
                              })}
                            </tr>
                          </tfoot>
                        </table>
                      </CardContent>
                    </Card>
                  ) : null}
                </TabsContent>

                {/* ── Financial Position (Monthly Matrix) ── */}
                <TabsContent value="financial_position" className="mt-4">
                  {reportLoading === "financial_position" ? (
                    <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" /></div>
                  ) : financialPositionData ? (
                    <Card className="shadow-sm overflow-hidden">
                      <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between pb-4">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Scale className="h-5 w-5 text-blue-800" />
                            Statement of Financial Position ({financialPositionData.year})
                          </CardTitle>
                          <CardDescription>Monthly Data (Values in UGX)</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-200" onClick={exportFinancialPosition}>
                            <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
                          </Button>
                          <Button variant="outline" size="sm" className="bg-indigo-50 text-indigo-700 border-indigo-200" onClick={() => void handleFinancialPositionWordExport()}>
                            <Download className="h-3.5 w-3.5 mr-1" /> Export Word
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-[10px] border-collapse min-w-[1000px]">
                          <thead>
                            <tr className="bg-slate-100 border-b text-slate-600 font-bold uppercase">
                              <th className="p-2 border text-left min-w-[200px]">Item</th>
                              {(financialPositionData.columns || []).map((col: any) => (
                                <th key={col.key} className="p-2 border text-right">
                                  {col.label} {financialPositionData.columns.length > 12 ? `'${String(col.year).slice(2)}` : ''}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {/* Section Heading: Current Assets */}
                            <tr className="bg-slate-50/50">
                              <td colSpan={(financialPositionData.columns?.length || 0) + 1} className="p-2 border font-bold text-slate-800 bg-slate-100 italic">Current Assets</td>
                            </tr>
                            {Object.keys(financialPositionData.data.current_assets).map(cat => (
                              <tr key={cat} className="hover:bg-slate-50">
                                <td className="p-2 border pl-4 font-medium text-slate-700">{cat}</td>
                                {(financialPositionData.columns || []).map((col: any) => (
                                  <td key={col.key} className="p-2 border text-right">
                                    {financialPositionData.data.current_assets[cat][col.key]?.toLocaleString() || "0"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                            <tr className="bg-slate-100 font-bold">
                              <td className="p-2 border">TOTAL CURRENT ASSETS</td>
                              {(financialPositionData.columns || []).map((col: any) => {
                                let total = 0;
                                Object.values(financialPositionData.data.current_assets).forEach((months: any) => {
                                  total += months[col.key] || 0;
                                });
                                return <td key={col.key} className="p-2 border text-right">{total.toLocaleString()}</td>;
                              })}
                            </tr>

                            {/* Non-Current Assets */}
                            <tr className="bg-slate-50/50">
                              <td colSpan={(financialPositionData.columns?.length || 0) + 1} className="p-2 border font-bold text-slate-800 bg-slate-100 italic">Non-Current Assets</td>
                            </tr>
                            {Object.keys(financialPositionData.data.non_current_assets).map(cat => (
                              <tr key={cat} className="hover:bg-slate-50">
                                <td className="p-2 border pl-4 font-medium text-slate-700">{cat}</td>
                                {(financialPositionData.columns || []).map((col: any) => (
                                  <td key={col.key} className="p-2 border text-right">
                                    {financialPositionData.data.non_current_assets[cat][col.key]?.toLocaleString() || "0"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                            <tr className="bg-slate-200 font-extrabold text-blue-900 border-t-2">
                              <td className="p-2 border">TOTAL ASSETS</td>
                              {(financialPositionData.columns || []).map((col: any) => {
                                let curr = 0;
                                let nonCurr = 0;
                                Object.values(financialPositionData.data.current_assets).forEach((months: any) => curr += months[col.key] || 0);
                                Object.values(financialPositionData.data.non_current_assets).forEach((months: any) => nonCurr += months[col.key] || 0);
                                return <td key={col.key} className="p-2 border text-right">{(curr + nonCurr).toLocaleString()}</td>;
                              })}
                            </tr>

                            {/* Liabilities & Equity */}
                            <tr className="bg-slate-100">
                              <td colSpan={(financialPositionData.columns?.length || 0) + 1} className="p-2 border font-bold text-slate-800 italic uppercase">Equities & Liabilities</td>
                            </tr>
                            {Object.keys(financialPositionData.data.current_liabilities).map(cat => (
                              <tr key={cat} className="hover:bg-slate-50">
                                <td className="p-2 border pl-4 font-medium text-slate-700">{cat}</td>
                                {(financialPositionData.columns || []).map((col: any) => (
                                  <td key={col.key} className="p-2 border text-right font-medium">
                                    {financialPositionData.data.current_liabilities[cat][col.key]?.toLocaleString() || "0"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                            <tr className="bg-slate-200 font-extrabold text-indigo-900 border-t-2 border-slate-400">
                              <td className="p-2 border">TOTAL EQUITIES & LIABILITIES</td>
                              {(financialPositionData.columns || []).map((col: any) => {
                                let total = 0;
                                Object.values(financialPositionData.data.current_liabilities).forEach((months: any) => {
                                  total += months[col.key] || 0;
                                });
                                return <td key={col.key} className="p-2 border text-right">{total.toLocaleString()}</td>;
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  ) : null}
                </TabsContent>
                {/* ── Cashflow Statement ── */}
                <TabsContent value="cashflow_statement" className="mt-4">
                  {reportLoading === "cashflow_statement" ? (
                    <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" /></div>
                  ) : cashflowStmtData ? (
                    <Card className="shadow-sm">
                      <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2"><Wallet className="h-5 w-5 text-emerald-700" /> Cashflow Statement</CardTitle>
                          <CardDescription>Indirect Method</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="bg-emerald-50 text-emerald-700 border-emerald-200" onClick={exportCashflowStatement}>
                          <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-6">
                          <section>
                            <h3 className="font-bold text-slate-900 border-b pb-1 mb-2">CASH FLOW FROM OPERATING ACTIVITIES</h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between"><span>Profit before tax</span><span className="font-semibold">{cashflowStmtData.operating_activities?.profit_before_tax?.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>Adjustment for depreciation</span><span className="font-semibold">{cashflowStmtData.operating_activities?.depreciation?.toLocaleString()}</span></div>
                              <div className="pl-4 pt-2 font-medium text-slate-500">Working capital changes:</div>
                              {cashflowStmtData.operating_activities?.working_capital_changes?.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between pl-6"><span>{item.label}</span><span>{item.amount?.toLocaleString()}</span></div>
                              ))}
                            </div>
                          </section>
                          <section>
                            <h3 className="font-bold text-slate-900 border-b pb-1 mb-2">CASH FLOW FROM INVESTING ACTIVITIES</h3>
                            {cashflowStmtData.investing_activities?.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between text-sm"><span>{item.label}</span><span>{item.amount?.toLocaleString()}</span></div>
                            ))}
                          </section>
                          <section className="bg-slate-50 p-4 rounded-lg">
                            <div className="flex justify-between font-bold"><span>Opening Cash Equivalents</span><span>{cashflowStmtData.cash_equivalents?.opening?.toLocaleString()}</span></div>
                            <div className="flex justify-between font-bold text-blue-800 mt-2 pt-2 border-t"><span>Closing Cash Equivalents</span><span>{cashflowStmtData.cash_equivalents?.closing?.toLocaleString()}</span></div>
                          </section>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </TabsContent>

                {/* ── Equity Statement ── */}
                <TabsContent value="equity_statement" className="mt-4">
                  {reportLoading === "equity_statement" ? (
                    <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" /></div>
                  ) : equityStatementData ? (
                    <Card className="shadow-sm max-w-4xl mx-auto border border-slate-200 overflow-hidden">
                      <CardHeader className="bg-slate-50 border-b flex flex-row items-start justify-between gap-4 py-4 px-4 sm:px-6">
                        <div className="text-center w-full min-w-0">
                          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#1F4E79]">M-T Growth Gateway</h2>
                          <h3 className="text-base font-semibold text-slate-800 mt-1">Statement of Changes in Equity</h3>
                          <p className="text-sm font-medium text-slate-600 mt-2">
                            <span className="underline decoration-double underline-offset-2">{equityStatementData.periodLabel || "Report period"}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1 normal-case">Figures from accounting entries (revenue − expense for accumulated profits; categories containing &quot;share capital&quot;).</p>
                        </div>
                        <Button variant="outline" size="sm" className="shrink-0 print:hidden" onClick={() => window.print()}>
                          <Download className="h-4 w-4 mr-1" /> Print
                        </Button>
                      </CardHeader>
                      <CardContent className="p-0 bg-white">
                        <div className="max-h-[min(72vh,720px)] overflow-y-auto overflow-x-auto">
                          <table className="w-full min-w-[520px] text-sm">
                            <thead className="sticky top-0 z-10 bg-white shadow-sm border-b-2 border-slate-200">
                              <tr className="text-[11px] sm:text-xs uppercase tracking-wide text-slate-700">
                                <th className="text-left py-3 pl-4 pr-2 font-bold">Description</th>
                                <th className="text-right py-3 px-3 font-bold whitespace-nowrap">Share capital<br /><span className="font-normal text-slate-500 normal-case">UGX</span></th>
                                <th className="text-right py-3 pr-4 pl-3 font-bold whitespace-nowrap">Accumulated profits<br /><span className="font-normal text-slate-500 normal-case">UGX</span></th>
                              </tr>
                            </thead>
                            <tbody className="text-slate-900">
                              {(equityStatementData.data || []).map((m: any, idx: number) => (
                                <Fragment key={`${m.month}-${idx}`}>
                                  <tr className="bg-slate-100/90">
                                    <td colSpan={3} className="py-2 pl-4 pr-4 font-bold text-[#1F4E79] text-xs uppercase tracking-wider border-t border-slate-200">
                                      {m.month}
                                    </td>
                                  </tr>
                                  <tr className="border-b border-slate-100 hover:bg-slate-50/80">
                                    <td className="py-2.5 pl-4 pr-2 text-xs sm:text-sm">
                                      Opening balance <span className="text-slate-500 font-normal">(as at {m.openingLabel || "—"})</span>
                                    </td>
                                    <td className="text-right py-2.5 px-3 tabular-nums font-medium">{(m.opening?.shareCap ?? 0).toLocaleString()}</td>
                                    <td className="text-right py-2.5 pr-4 pl-3 tabular-nums font-medium">{(m.opening?.profit ?? 0).toLocaleString()}</td>
                                  </tr>
                                  {(m.movements?.capitalInjected ?? 0) !== 0 && (
                                    <tr className="border-b border-slate-100 hover:bg-slate-50/80">
                                      <td className="py-2.5 pl-6 pr-2 text-xs sm:text-sm italic text-slate-700">Share capital movements</td>
                                      <td className="text-right py-2.5 px-3 tabular-nums border-b border-slate-300">{(m.movements?.capitalInjected ?? 0).toLocaleString()}</td>
                                      <td className="text-right py-2.5 pr-4 pl-3 tabular-nums text-slate-400">—</td>
                                    </tr>
                                  )}
                                  <tr className="border-b border-slate-100 hover:bg-slate-50/80">
                                    <td className="py-2.5 pl-6 pr-2 text-xs sm:text-sm italic text-slate-700">Net profit before tax ({m.dateLabel || m.month})</td>
                                    <td className="text-right py-2.5 px-3 tabular-nums text-slate-400">—</td>
                                    <td className="text-right py-2.5 pr-4 pl-3 tabular-nums border-b border-slate-300">{(m.movements?.periodProfit ?? 0).toLocaleString()}</td>
                                  </tr>
                                  <tr className="bg-slate-50 font-semibold border-b-2 border-slate-300">
                                    <td className="py-3 pl-4 pr-2 text-xs sm:text-sm">
                                      Closing balance <span className="text-slate-500 font-normal">(as at {m.closingLabel || "—"})</span>
                                    </td>
                                    <td className="text-right py-3 px-3 tabular-nums text-[#1F4E79]">{(m.closing?.shareCap ?? 0).toLocaleString()}</td>
                                    <td className="text-right py-3 pr-4 pl-3 tabular-nums text-[#1F4E79]">{(m.closing?.profit ?? 0).toLocaleString()}</td>
                                  </tr>
                                </Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-center py-12 text-slate-500 italic">No equity data found for this period</div>
                  )}
                </TabsContent>
              </Tabs>

            </div>
          </main>
        </div >
      </div >
    </SidebarProvider >
  );
};

export default Accounting;
