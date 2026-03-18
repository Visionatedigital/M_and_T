import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Products from "./pages/Products";
import Branches from "./pages/Branches";
import Contact from "./pages/Contact";
import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";
import AskAI from "./pages/AskAI";
import NotFound from "./pages/NotFound";
import LoanApplications from "./pages/staff/LoanApplications";
import LoanApplicationDetails from "./pages/staff/LoanApplicationDetails";
import ActiveLoans from "./pages/staff/ActiveLoans";
import LoanDetails from "./pages/staff/LoanDetails";
import Borrowers from "./pages/staff/Borrowers";
import Repayments from "./pages/staff/Repayments";
import Reports from "./pages/staff/Reports";
import Accounting from "./pages/staff/Accounting";
import AgingReport from "./pages/staff/AgingReport";
import CashBooks from "./pages/staff/CashBooks";
import AddLoan from "./pages/staff/AddLoan";
import {
  DueLoans,
  MissedRepayments,
  ArrearsLoans,
  NoRepaymentsLoans,
  PastMaturityLoans,
  ApproveLoans
} from "./pages/staff/LoansList";
import LoanCalculator from "./pages/staff/LoanCalculator";
import Creditors from "./pages/staff/Creditors";
import AddCreditor from "./pages/staff/AddCreditor";
import AssetManagement from "./pages/staff/AssetManagement";
import CollateralRegister from "./pages/staff/CollateralRegister";
import ComprehensiveIncome from "./pages/staff/ComprehensiveIncome";
import AddCollateral from "./pages/staff/AddCollateral";
import Settings from "./pages/staff/Settings";
import { Guarantors } from "./pages/staff/Guarantors";
import BranchManagement from "./pages/staff/BranchManagement";
import ProductManagement from "./pages/staff/ProductManagement";
import { StaffManagement } from "./pages/staff/StaffManagement";
import Payroll from "./pages/staff/Payroll";
import BorrowerDetails from "./pages/staff/BorrowerDetails";
import AddBorrower from "./pages/staff/AddBorrower";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          {/* Desktop app: go straight to staff login */}
          <Route path="/" element={<Navigate to="/staff-login" replace />} />
          <Route path="/home" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
          <Route path="/staff-dashboard/ask-ai" element={<AskAI />} />
          <Route path="/staff-dashboard/applications" element={<LoanApplications />} />
          <Route path="/staff-dashboard/applications/pending" element={<LoanApplications />} />
          <Route path="/staff-dashboard/applications/approved" element={<LoanApplications />} />
          <Route path="/staff-dashboard/applications/rejected" element={<LoanApplications />} />
          <Route path="/staff-dashboard/applications/:id" element={<LoanApplicationDetails />} />
          <Route path="/staff-dashboard/staff" element={<StaffManagement />} />
          <Route path="/staff-dashboard/staff/payroll" element={<Payroll />} />
          <Route path="/staff-dashboard/loans" element={<ActiveLoans />} />
          <Route path="/staff-dashboard/loans/add" element={<AddLoan />} />
          <Route path="/staff-dashboard/loans/approve" element={<ApproveLoans />} />
          <Route path="/staff-dashboard/loans/due" element={<DueLoans />} />
          <Route path="/staff-dashboard/loans/missed" element={<MissedRepayments />} />
          <Route path="/staff-dashboard/loans/arrears" element={<ArrearsLoans />} />
          <Route path="/staff-dashboard/loans/no-repayments" element={<NoRepaymentsLoans />} />
          <Route path="/staff-dashboard/loans/past-maturity" element={<PastMaturityLoans />} />
          <Route path="/staff-dashboard/loans/calculator" element={<LoanCalculator />} />
          <Route path="/staff-dashboard/loans/schedule" element={<ActiveLoans />} />
          <Route path="/staff-dashboard/loans/details/:id" element={<LoanDetails />} />
          <Route path="/staff-dashboard/loans/details" element={<LoanDetails />} />
          <Route path="/staff-dashboard/borrowers" element={<Borrowers />} />
          <Route path="/staff-dashboard/borrowers/add" element={<AddBorrower />} />
          <Route path="/staff-dashboard/borrowers/history" element={<BorrowerDetails />} />
          <Route path="/staff-dashboard/repayments" element={<Repayments />} />
          <Route path="/staff-dashboard/repayments/add" element={<Repayments />} />
          <Route path="/staff-dashboard/repayments/schedule" element={<Repayments />} />
          <Route path="/staff-dashboard/reports/loans" element={<Reports />} />
          <Route path="/staff-dashboard/reports/financial" element={<Reports />} />
          <Route path="/staff-dashboard/reports/borrowers" element={<Reports />} />
          <Route path="/staff-dashboard/reports/aging" element={<AgingReport />} />
          <Route path="/staff-dashboard/reports/cash-books" element={<CashBooks />} />
          <Route path="/staff-dashboard/reports/comprehensive-income" element={<ComprehensiveIncome />} />
          <Route path="/staff-dashboard/collateral" element={<CollateralRegister />} />
          <Route path="/staff-dashboard/collateral/add" element={<AddCollateral />} />
          <Route path="/staff-dashboard/collateral/valuations" element={<CollateralRegister />} />
          <Route path="/staff-dashboard/collateral/insurance" element={<CollateralRegister />} />
          <Route path="/staff-dashboard/branches/performance" element={<BranchManagement />} />
          <Route path="/staff-dashboard/branches/territories" element={<BranchManagement />} />
          <Route path="/staff-dashboard/branches/transfers" element={<BranchManagement />} />
          <Route path="/staff-dashboard/products" element={<ProductManagement />} />
          <Route path="/staff-dashboard/products/rates" element={<ProductManagement />} />
          <Route path="/staff-dashboard/products/performance" element={<ProductManagement />} />
          <Route path="/staff-dashboard/creditors" element={<Creditors />} />
          <Route path="/staff-dashboard/creditors/add" element={<AddCreditor />} />
          <Route path="/staff-dashboard/assets" element={<AssetManagement />} />
          <Route path="/staff-dashboard/accounting" element={<Accounting />} />
          <Route path="/staff-dashboard/guarantors" element={<Guarantors />} />
          <Route path="/staff-dashboard/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
