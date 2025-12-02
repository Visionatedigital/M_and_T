import { 
  LayoutDashboard, 
  FileText, 
  Users, 
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
  Package
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
    title: "Ask AI",
    icon: Sparkles,
    url: "/staff-dashboard/ask-ai",
  },
  {
    title: "Loan Applications",
    icon: FileText,
    items: [
      { title: "View Applications", url: "/staff-dashboard/applications", icon: FileText },
      { title: "Pending Review", url: "/staff-dashboard/applications/pending", icon: Clock },
      { title: "Approved Loans", url: "/staff-dashboard/applications/approved", icon: CheckCircle },
      { title: "Rejected Applications", url: "/staff-dashboard/applications/rejected", icon: XCircle },
    ],
  },
  {
    title: "Active Loans",
    icon: Wallet,
    items: [
      { title: "View All Loans", url: "/staff-dashboard/loans", icon: Wallet },
      { title: "Loan Details", url: "/staff-dashboard/loans/details", icon: FileSpreadsheet },
      { title: "Loan Schedule", url: "/staff-dashboard/loans/schedule", icon: Receipt },
    ],
  },
  {
    title: "Clients",
    icon: Users,
    items: [
      { title: "View Clients", url: "/staff-dashboard/clients", icon: Users },
      { title: "Add Client", url: "/staff-dashboard/clients/add", icon: UserPlus },
      { title: "Client History", url: "/staff-dashboard/clients/history", icon: FileText },
    ],
  },
  {
    title: "Repayments",
    icon: DollarSign,
    items: [
      { title: "View Repayments", url: "/staff-dashboard/repayments", icon: Receipt },
      { title: "Add Repayment", url: "/staff-dashboard/repayments/add", icon: DollarSign },
      { title: "Repayment Schedule", url: "/staff-dashboard/repayments/schedule", icon: FileSpreadsheet },
    ],
  },
  {
    title: "Reports",
    icon: BarChart3,
    items: [
      { title: "Loan Reports", url: "/staff-dashboard/reports/loans", icon: BarChart3 },
      { title: "Financial Reports", url: "/staff-dashboard/reports/financial", icon: DollarSign },
      { title: "Client Reports", url: "/staff-dashboard/reports/clients", icon: Users },
    ],
  },
  {
    title: "Collateral & Assets",
    icon: Shield,
    items: [
      { title: "Collateral Register", url: "/staff-dashboard/collateral", icon: Shield },
      { title: "Asset Valuations", url: "/staff-dashboard/collateral/valuations", icon: FileSpreadsheet },
      { title: "Insurance Tracking", url: "/staff-dashboard/collateral/insurance", icon: Shield },
    ],
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
    title: "Settings",
    icon: Settings,
    url: "/staff-dashboard/settings",
  },
];

export function StaffSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const isActive = (url: string) => location.pathname === url;
  const isGroupActive = (items?: { url: string }[]) => 
    items?.some(item => location.pathname === item.url);

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-[hsl(220,26%,14%)]">
        <div className="px-4 py-6">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-white">Staff Portal</h2>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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
                                <SidebarMenuSubButton asChild>
                                  <NavLink
                                    to={subItem.url}
                                    className="text-gray-400 hover:text-white hover:bg-[hsl(220,26%,18%)]"
                                    activeClassName="bg-[hsl(220,26%,20%)] text-white font-medium"
                                  >
                                    <subItem.icon className="h-3 w-3 text-white" />
                                    <span>{subItem.title}</span>
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
      </SidebarContent>
    </Sidebar>
  );
}
