import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ActiveLoans from "./pages/staff/ActiveLoans";
import LoanDetails from "./pages/staff/LoanDetails";
import Clients from "./pages/staff/Clients";
import Repayments from "./pages/staff/Repayments";
import Reports from "./pages/staff/Reports";
import CollateralAssets from "./pages/staff/CollateralAssets";
import BranchManagement from "./pages/staff/BranchManagement";
import ProductManagement from "./pages/staff/ProductManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
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
          <Route path="/staff-dashboard/loans" element={<ActiveLoans />} />
          <Route path="/staff-dashboard/loans/schedule" element={<ActiveLoans />} />
          <Route path="/staff-dashboard/loans/details/:id" element={<LoanDetails />} />
          <Route path="/staff-dashboard/loans/details" element={<LoanDetails />} />
          <Route path="/staff-dashboard/clients" element={<Clients />} />
          <Route path="/staff-dashboard/clients/add" element={<Clients />} />
          <Route path="/staff-dashboard/clients/history" element={<Clients />} />
          <Route path="/staff-dashboard/repayments" element={<Repayments />} />
          <Route path="/staff-dashboard/repayments/add" element={<Repayments />} />
          <Route path="/staff-dashboard/repayments/schedule" element={<Repayments />} />
          <Route path="/staff-dashboard/reports/loans" element={<Reports />} />
          <Route path="/staff-dashboard/reports/financial" element={<Reports />} />
          <Route path="/staff-dashboard/reports/clients" element={<Reports />} />
          <Route path="/staff-dashboard/collateral" element={<CollateralAssets />} />
          <Route path="/staff-dashboard/collateral/valuations" element={<CollateralAssets />} />
          <Route path="/staff-dashboard/collateral/insurance" element={<CollateralAssets />} />
          <Route path="/staff-dashboard/branches/performance" element={<BranchManagement />} />
          <Route path="/staff-dashboard/branches/territories" element={<BranchManagement />} />
          <Route path="/staff-dashboard/branches/transfers" element={<BranchManagement />} />
          <Route path="/staff-dashboard/products" element={<ProductManagement />} />
          <Route path="/staff-dashboard/products/rates" element={<ProductManagement />} />
          <Route path="/staff-dashboard/products/performance" element={<ProductManagement />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
