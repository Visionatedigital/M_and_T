import {
  LayoutDashboard,
  FileText,
  Users,
  Eye,
  DollarSign,
  BarChart3,
  Settings,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
  FileSpreadsheet,
  UserPlus,
  Wallet,
  Sparkles,
  Shield,
  Building2,
  Package,
  BookOpen,
  TrendingUp,
  Scale,
  Smartphone
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/staff-dashboard",
  },

  {
    title: "Loans",
    icon: Wallet,
    items: [
      { title: "View Applications", url: "/staff-dashboard/applications", icon: FileText },
      { title: "View All Loans", url: "/staff-dashboard/loans", icon: Wallet },
      { title: "Add Loans", url: "/staff-dashboard/loans/add", icon: UserPlus },
      { title: "Approve Loans", url: "/staff-dashboard/loans/approve", icon: CheckCircle },
      { title: "Due Loans", url: "/staff-dashboard/loans/due", icon: Clock },
      { title: "Missed Repayments", url: "/staff-dashboard/loans/missed", icon: XCircle },
      { title: "Loans in Arrears", url: "/staff-dashboard/loans/arrears", icon: Clock },
      { title: "No Repayments", url: "/staff-dashboard/loans/no-repayments", icon: Clock },
      { title: "Past Maturity Date", url: "/staff-dashboard/loans/past-maturity", icon: Clock },
      { title: "Loan Calculator", url: "/staff-dashboard/loans/calculator", icon: BarChart3 },
    ],
  },
  {
    title: "Borrowers",
    icon: Users,
    items: [
      { title: "View Borrower", url: "/staff-dashboard/borrowers", icon: Eye },
      { title: "Add Borrower", url: "/staff-dashboard/borrowers/add", icon: UserPlus },
    ],
  },
  {
    title: "Guarantors",
    icon: Shield,
    url: "/staff-dashboard/guarantors",
  },
  {
    title: "Repayments",
    icon: DollarSign,
    items: [
      { title: "View Repayments", url: "/staff-dashboard/repayments", icon: Receipt },
      { title: "Mobile Money", url: "/staff-dashboard/repayments/mobile-money", icon: Smartphone },
      { title: "Add Repayment", url: "/staff-dashboard/repayments/add", icon: DollarSign },
      { title: "Repayment Schedule", url: "/staff-dashboard/repayments/schedule", icon: FileSpreadsheet },
    ],
  },
  {
    title: "Accounting & Reports",
    icon: BookOpen,
    items: [
      { title: "Financial Overview", url: "/staff-dashboard/accounting?tab=pl", icon: LayoutDashboard },
      { title: "Aging Report", url: "/staff-dashboard/accounting?tab=aging_report", icon: Clock },
      { title: "Cash Books", url: "/staff-dashboard/accounting?tab=cashbook", icon: BookOpen },
      { title: "Income Statement", url: "/staff-dashboard/accounting?tab=income", icon: FileText },
      { title: "Comprehensive Income", url: "/staff-dashboard/accounting?tab=comprehensive_income", icon: TrendingUp },
      { title: "Trial Balance", url: "/staff-dashboard/accounting?tab=trial", icon: Scale },
    ],
  },
  {
    title: "Creditors",
    icon: DollarSign,
    items: [
      { title: "View Creditors", url: "/staff-dashboard/creditors", icon: Eye },
      { title: "Add Creditor", url: "/staff-dashboard/creditors/add", icon: UserPlus },
    ],
  },
  {
    title: "Collateral Register",
    icon: Shield,
    url: "/staff-dashboard/collateral",
  },
  {
    title: "Asset Management",
    icon: Package,
    url: "/staff-dashboard/assets",
  },
  {
    title: "Branch Management",
    icon: Building2,
    items: [
      { title: "Branch Performance", url: "/staff-dashboard/branches/performance", icon: BarChart3 },
      { title: "Territory Management", url: "/staff-dashboard/branches/territories", icon: Building2 },
      { title: "Branch Transfers", url: "/staff-dashboard/branches/transfers", icon: FileText },
    ],
  },
  {
    title: "Product Management",
    icon: Package,
    items: [
      { title: "Loan Products", url: "/staff-dashboard/products", icon: Package },
      { title: "Interest Rate Settings", url: "/staff-dashboard/products/rates", icon: DollarSign },
      { title: "Product Performance", url: "/staff-dashboard/products/performance", icon: BarChart3 },
    ],
  },
  {
    title: "Staff Management",
    icon: Users,
    items: [
      { title: "Staff Directory", url: "/staff-dashboard/staff", icon: Users },
      { title: "Officer Portfolios", url: "/staff-dashboard/staff/portfolios", icon: Wallet },
      { title: "Payroll", url: "/staff-dashboard/staff/payroll", icon: Receipt },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/staff-dashboard/settings",
  },
];

import { useUserRole } from "@/hooks/useUserRole";

export function StaffSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { role, loading } = useUserRole();
  const isCollapsed = state === "collapsed";

  const normalizedRole = (role || "").toString().toLowerCase().trim().replace(/[\s-]+/g, "_");

  /** Admins-only: Ask AI assistant (after Dashboard). */
  const menuWithAskAI =
    normalizedRole === "admin"
      ? [
          menuItems[0],
          {
            title: "Ask AI",
            icon: Sparkles,
            url: "/staff-dashboard/ask-ai",
          },
          ...menuItems.slice(1),
        ]
      : menuItems;

  // Filter menu items based on role
  const filteredMenuItems = menuWithAskAI.map(item => {
    // If it's a loan officer, we might need to filter internal items
    if (normalizedRole === 'loan_officer') {
      const restrictedTitles = ['Branch Management', 'Product Management', 'Settings', 'Reports', 'Staff Management', 'Accounting & Reports', 'Creditors', 'Asset Management'];
      if (restrictedTitles.includes(item.title)) return null;

      // Filter sub-items
      if (item.items) {
        const filteredSubItems = item.items.filter(subItem => {
          if (subItem.url === '/staff-dashboard/loans/approve') return false;
          // Hide sensitive reports
          if (item.title === 'Reports' && subItem.title === 'Financial Reports') return false;
          // Hide advanced client analytics if needed
          if (item.title === 'Clients' && subItem.title === 'Client History') return false;
          return true;
        });
        return { ...item, items: filteredSubItems };
      }
    }
    return item;
  }).filter(item => item !== null);

  const isActive = (url: string) => location.pathname === url;
  const isGroupActive = (items?: { url: string }[]) =>
    items?.some((item) => {
      const base = item.url.split("?")[0];
      if (base.includes("/applications")) {
        return location.pathname.startsWith("/staff-dashboard/applications");
      }
      return location.pathname === base || location.pathname.startsWith(`${base}/`);
    }) ?? false;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-[hsl(220,26%,14%)]">
        <div className="px-4 py-6">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-white">Staff Portal</h2>
          )}
        </div>

        {loading ? (
          <div className="px-4 space-y-3 pb-6" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 rounded-md bg-white/10 animate-pulse" />
            ))}
          </div>
        ) : (
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible
                      defaultOpen={isGroupActive(item.items)}
                      className="group/collapsible"
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="text-gray-300 hover:bg-[hsl(220,26%,18%)] hover:text-white">
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && (
                            <>
                              <span>{item.title}</span>
                              <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {!isCollapsed && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  className="!h-auto min-h-11 gap-2 py-2.5 sm:min-h-8 sm:py-1.5 [&>span:last-child]:line-clamp-2 [&>span:last-child]:whitespace-normal [&>span:last-child]:text-left"
                                >
                                  <NavLink
                                    to={subItem.url}
                                    className="text-gray-400 hover:text-white hover:bg-[hsl(220,26%,18%)]"
                                    activeClassName="bg-[hsl(220,26%,20%)] text-white font-medium"
                                  >
                                    <subItem.icon className="h-3.5 w-3.5 shrink-0 text-white sm:h-3 sm:w-3" />
                                    <span className="break-words">{subItem.title}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url!}
                        className="text-gray-300 hover:bg-[hsl(220,26%,18%)] hover:text-white"
                        activeClassName="bg-[hsl(220,26%,20%)] text-white font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
