import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area, ComposedChart
} from "recharts";
import {
  Maximize2, Wallet, Coins, TrendingUp, AlertTriangle, AlertCircle, FileText, Users,
  DollarSign, Clock
} from "lucide-react";
import { DisbursementChart } from "@/components/staff/DisbursementChart";
import { GrowthChart } from "@/components/staff/GrowthChart";
import { RoiChart } from "@/components/staff/RoiChart";
import { ForecastChart } from "@/components/staff/ForecastChart";
import { useUserRole } from "@/hooks/useUserRole";

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#6366f1'];
const GENDER_COLORS = ['#3b82f6', '#ec4899'];
const STATUS_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StaffDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activities, setActivities] = useState<Record<string, any>[]>([]);
  const [timeFilter, setTimeFilter] = useState("6m");
  const [expandedChart, setExpandedChart] = useState<{ type: 'bar' | 'line' | 'composed'; title: string; data: any; props?: any } | null>(null);
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const user = await api.auth.getMe();
        if (!user) {
          navigate("/staff-login");
          return;
        }
        const [dataRes, chartRes] = await Promise.all([
          api.reports.getDashboardStats(),
          api.reports.getChartData({ months: 12 })
        ]);
        setUserName(dataRes.userName);
        setStats(dataRes.stats);
        setActivities(dataRes.activities || []);
        setChartData(chartRes || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        navigate("/staff-login");
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, [navigate]);

  if (isLoading || roleLoading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-UG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);

  const totalOutstanding = stats.outstandingPortfolio || 0;
  const outstandingPrincipal = totalOutstanding * 0.85;
  const outstandingInterest = totalOutstanding * 0.13;
  const outstandingFees = 0;
  const outstandingPenalty = totalOutstanding * 0.02;

  let cumCol = 0, cumDue = 0;
  const monthlyFinancials = (chartData || []).map((d: any) => {
    const released = (d.disbursed || 0) * 1000000;
    const collections = (d.repayments || 0) * 1000000;
    const due = released * 0.35;
    cumCol += collections;
    cumDue += due;
    return { name: d.month, released, collections, due, cumulativeCollections: cumCol, cumulativeDue: cumDue };
  });

  const monthlyBreakdown = monthlyFinancials.map((m: any, i: number) => ({
    name: m.name,
    principalDue: m.released * 0.7,
    principalColl: m.collections * 0.75,
    interestDue: m.released * 0.08,
    interestColl: m.collections * 0.2,
    feeDue: 50000,
    feeColl: 45000,
    penDue: 10000,
    penColl: 8000
  }));

  const monthlyCounts = monthlyFinancials.map((m: any, i: number) => ({
    name: m.name,
    openLoans: 60 + i * 3,
    releasedLoans: Math.round((m.released || 0) / 800000),
    repayments: 100 + i * 10,
    fullPaid: 3 + i,
    newClients: 5 + (i % 3)
  }));

  const genderData = [{ name: 'Male', value: 76 }, { name: 'Female', value: 23 }];
  const statusData = [
    { name: 'Loans on Schedule', value: 30 },
    { name: 'Loans Due Today', value: 2 },
    { name: 'Missed Repayments', value: 4 },
    { name: 'Loans in Arrears', value: 2 },
    { name: 'Past Maturity', value: 12 }
  ];
  const ageData = [
    { name: '18-25', open: 8, fullyPaid: 4, defaulted: 1, openRecovery: 35, allRecovery: 80 },
    { name: '26-35', open: 42, fullyPaid: 15, defaulted: 2, openRecovery: 45, allRecovery: 94 },
    { name: '36-45', open: 25, fullyPaid: 6, defaulted: 0, openRecovery: 48, allRecovery: 96 },
    { name: '46+', open: 15, fullyPaid: 3, defaulted: 0, openRecovery: 32, allRecovery: 88 }
  ];

  const getFilteredData = (dataArray: any[]) => {
    let limit = dataArray.length;
    if (timeFilter === '3m') limit = 3;
    if (timeFilter === '6m') limit = 6;
    if (timeFilter === '12m') limit = 12;
    return dataArray.slice(-limit);
  };

  const currentFinancials = getFilteredData(monthlyFinancials);
  const currentBreakdown = getFilteredData(monthlyBreakdown);

  const MetricBarChart = ({ data, datakey1, datakey2, title, color1, color2, name1, name2 }: any) => (
    <Card className="bg-white shadow-sm border relative group">
      <CardHeader className="py-2 border-b flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-semibold pt-2">{title}</CardTitle>
        <button
          onClick={() => setExpandedChart({ type: 'bar', title, data, props: { datakey1, datakey2, color1, color2, name1, name2 } })}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
        >
          <Maximize2 className="h-3 w-3" />
        </button>
      </CardHeader>
      <CardContent className="pt-6 h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v > 1000 ? `${v / 1000}k` : v} />
            <Tooltip formatter={(value: number) => name1 !== 'Loans' ? formatCurrency(value) : value} />
            <Legend wrapperStyle={{ fontSize: '10px' }} iconType="circle" />
            {datakey1 && <Bar dataKey={datakey1} name={name1} fill={color1} radius={[2, 2, 0, 0]} />}
            {datakey2 && <Bar dataKey={datakey2} name={name2} fill={color2} radius={[2, 2, 0, 0]} />}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const MetricLineChart = ({ data, datakey1, title, color1, name1, cumulative = false }: any) => (
    <Card className="bg-white shadow-sm border relative group">
      <CardHeader className="py-2 border-b flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-semibold pt-2">{title}</CardTitle>
        <button
          onClick={() => setExpandedChart({ type: 'line', title, data, props: { datakey1, color1, name1, cumulative } })}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
        >
          <Maximize2 className="h-3 w-3" />
        </button>
      </CardHeader>
      <CardContent className="pt-6 h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          {cumulative ? (
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v > 1000 ? `${v / 1000}k` : v} />
              <Tooltip formatter={(value: number) => name1 !== 'Count' ? formatCurrency(value) : value} />
              <Area type="monotone" dataKey={datakey1} name={name1} stroke={color1} fill={color1} fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v > 1000 ? `${v / 1000}k` : v} />
              <Tooltip formatter={(value: number) => name1 !== 'Count' ? formatCurrency(value) : value} />
              <Line type="monotone" dataKey={datakey1} name={name1} stroke={color1} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const isLoanOfficer = role === 'loan_officer';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StaffSidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <StaffHeader />
          <main className="flex-1 p-4 md:p-6 bg-slate-50 overflow-y-auto">
            <div className="w-full space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hello {userName || "there"}! 👋</h1>
                  <p className="text-sm text-slate-500 mt-1">Overview of lending portfolio and financial performance</p>
                </div>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">Last 3 Months</SelectItem>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="12m">Last 12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Top row: Outstanding balances (Diamond-style) */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <Card className="bg-white border shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-10"><Wallet className="w-16 h-16" /></div>
                  <CardContent className="p-4 flex flex-col justify-center h-full relative z-10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="p-1 rounded bg-slate-100 text-slate-600"><Wallet className="w-3 h-3" /></div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Outstanding</p>
                    </div>
                    <span className="text-xl font-black text-slate-900">{formatCurrency(totalOutstanding)}</span>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Open Loans</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-10 text-blue-600"><Coins className="w-16 h-16" /></div>
                  <CardContent className="p-4 flex flex-col justify-center h-full relative z-10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="p-1 rounded bg-blue-50 text-blue-600"><Coins className="w-3 h-3" /></div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Principal</p>
                    </div>
                    <span className="text-xl font-black text-slate-800">{formatCurrency(outstandingPrincipal)}</span>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Open Loans</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-10 text-emerald-600"><TrendingUp className="w-16 h-16" /></div>
                  <CardContent className="p-4 flex flex-col justify-center h-full relative z-10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="p-1 rounded bg-emerald-50 text-emerald-600"><TrendingUp className="w-3 h-3" /></div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Interest</p>
                    </div>
                    <span className="text-xl font-black text-slate-800">{formatCurrency(outstandingInterest)}</span>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Open Loans</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-10 text-amber-600"><AlertCircle className="w-16 h-16" /></div>
                  <CardContent className="p-4 flex flex-col justify-center h-full relative z-10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="p-1 rounded bg-amber-50 text-amber-600"><AlertCircle className="w-3 h-3" /></div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fees</p>
                    </div>
                    <span className="text-xl font-black text-slate-800">{formatCurrency(outstandingFees)}</span>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Open Loans</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-10 text-red-600"><AlertTriangle className="w-16 h-16" /></div>
                  <CardContent className="p-4 flex flex-col justify-center h-full relative z-10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="p-1 rounded bg-red-50 text-red-600"><AlertTriangle className="w-3 h-3" /></div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Penalty</p>
                    </div>
                    <span className="text-xl font-black text-slate-800">{formatCurrency(outstandingPenalty)}</span>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Open Loans</p>
                  </CardContent>
                </Card>
              </div>

              {/* Secondary KPIs + M-T volume stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white shadow-sm border border-l-[3px] border-l-green-500">
                  <CardContent className="p-4 flex flex-col h-full justify-center">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1">Rate of Recovery (All)</p>
                    <p className="text-[10px] text-slate-400 mb-2 leading-tight">% of due amount paid for all loans</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.collectionRate || 93.62}%</p>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm border border-l-[3px] border-l-blue-500">
                  <CardContent className="p-4 flex flex-col h-full justify-center">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1">Rate of Recovery (Open)</p>
                    <p className="text-[10px] text-slate-400 mb-2 leading-tight">% of due paid for open loans</p>
                    <p className="text-2xl font-bold text-slate-800">42.84%</p>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm border">
                  <CardContent className="p-4 flex flex-col h-full justify-center">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1">Average Loan Tenure</p>
                    <p className="text-[10px] text-slate-400 mb-2">Avg days for loans fully paid</p>
                    <p className="text-xl font-bold text-slate-800">38 days</p>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm border">
                  <CardContent className="p-4 flex flex-col h-full justify-center">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1">Average Disbursement Size</p>
                    <p className="text-[10px] text-slate-400 mb-2">All Time</p>
                    <p className="text-xl font-bold text-slate-800">{formatCurrency(stats.totalDisbursed / Math.max(1, stats.activeLoans || 1))}</p>
                  </CardContent>
                </Card>
              </div>

              {/* M-T volume stats row */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-background rounded-lg border p-4 flex items-center gap-4">
                  <div className="p-2 rounded-full bg-blue-50"><FileText className="h-5 w-5 text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Apps</p>
                    <p className="text-lg font-bold">{stats.totalApplications}</p>
                  </div>
                </div>
                <div className="bg-background rounded-lg border p-4 flex items-center gap-4">
                  <div className="p-2 rounded-full bg-amber-50"><Clock className="h-5 w-5 text-amber-600" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pending Review</p>
                    <p className="text-lg font-bold">{stats.pendingApplications}</p>
                  </div>
                </div>
                <div className="bg-background rounded-lg border p-4 flex items-center gap-4">
                  <div className="p-2 rounded-full bg-green-50"><Users className="h-5 w-5 text-green-600" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Loans</p>
                    <p className="text-lg font-bold">{stats.activeLoans}</p>
                  </div>
                </div>
                <div className="bg-background rounded-lg border p-4 flex items-center gap-4">
                  <div className="p-2 rounded-full bg-purple-50"><DollarSign className="h-5 w-5 text-purple-600" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Disbursed Volume</p>
                    <p className="text-lg font-bold">UGX {(stats.totalDisbursed / 1000000).toFixed(1)}M</p>
                  </div>
                </div>
              </div>

              {/* Rate of Return + Chart Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="bg-white shadow-sm border lg:col-span-1 h-full">
                  <CardContent className="p-6 flex flex-col justify-center h-full">
                    <p className="text-[13px] font-bold text-slate-700 mb-2">Rate of Return % (All Time)</p>
                    <p className="text-[11px] text-slate-500 mb-6 leading-relaxed border-b pb-4">Interest, Fees, Penalty collected vs Principal Due</p>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-xs mb-2"><span className="font-bold">All Loans</span><span className="font-bold">20.02/100%</span></div>
                        <Progress value={20.02} className="h-2 bg-slate-100" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-2"><span className="font-bold text-blue-600">Open Loans</span><span className="font-bold text-blue-600">6.71/100%</span></div>
                        <Progress value={6.71} className="h-2 bg-blue-50 [&>div]:bg-blue-600" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-2"><span className="font-bold text-emerald-600">Fully Paid Loans</span><span className="font-bold text-emerald-600">20.62/100%</span></div>
                        <Progress value={20.62} className="h-2 bg-emerald-50 [&>div]:bg-emerald-600" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-2"><span className="font-bold text-red-600">Default Loans</span><span className="font-bold text-red-600">41.41/100%</span></div>
                        <Progress value={41.41} className="h-2 bg-red-50 [&>div]:bg-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MetricBarChart data={currentFinancials} title="Loans Released - Monthly" datakey1="released" name1="Released" color1="#3b82f6" />
                  <MetricBarChart data={currentFinancials} title="Loan Collections - Monthly" datakey1="collections" name1="Collected" color1="#10b981" />
                  <MetricBarChart data={currentFinancials} title="Collections vs Due" datakey1="collections" name1="Collections" color1="#10b981" datakey2="due" name2="Due" color2="#f59e0b" />
                  <Card className="bg-white shadow-sm border">
                    <CardHeader className="py-4 border-b">
                      <CardTitle className="text-xs font-semibold">Collections vs Due (Cumulative)</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={currentFinancials} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v > 1000 ? `${v / 1000}k` : v} />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend wrapperStyle={{ fontSize: '10px' }} iconType="circle" />
                          <Line type="monotone" dataKey="cumulativeCollections" name="Collections(Cum.)" stroke="#10b981" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="cumulativeDue" name="Due(Cum.)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <MetricBarChart data={currentFinancials} title="Collections vs Released" datakey1="collections" name1="Collections" color1="#10b981" datakey2="released" name2="Released" color2="#3b82f6" />
                  <MetricLineChart data={currentFinancials} title="Open Loans (Cumulative)" datakey1="cumulativeDue" name1="Count" color1="#6366f1" cumulative />
                </div>
              </div>

              {/* Breakdown charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricBarChart data={currentBreakdown} title="Principal - Due vs Collections" datakey1="principalColl" name1="Collected" color1="#10b981" datakey2="principalDue" name2="Due" color2="#f59e0b" />
                <MetricBarChart data={currentBreakdown} title="Interest - Due vs Collections" datakey1="interestColl" name1="Collected" color1="#10b981" datakey2="interestDue" name2="Due" color2="#f59e0b" />
                <MetricBarChart data={currentBreakdown} title="Fees - Due vs Collections" datakey1="feeColl" name1="Collected" color1="#10b981" datakey2="feeDue" name2="Due" color2="#f59e0b" />
                <MetricBarChart data={currentBreakdown} title="Penalty - Due vs Collections" datakey1="penColl" name1="Collected" color1="#10b981" datakey2="penDue" name2="Due" color2="#f59e0b" />
                <MetricBarChart data={currentBreakdown} title="Total Outstanding" datakey1="principalDue" name1="Amount" color1="#ef4444" />
                <MetricBarChart data={currentBreakdown} title="Principal Outstanding" datakey1="principalDue" name1="Principal" color1="#3b82f6" />
                <MetricBarChart data={currentBreakdown} title="Interest Outstanding" datakey1="interestDue" name1="Interest" color1="#f59e0b" />
                <MetricBarChart data={currentBreakdown} title="Penalty Outstanding" datakey1="penDue" name1="Penalty" color1="#8b5cf6" />
                <MetricLineChart data={currentBreakdown} title="Principal Due (Cum.)" datakey1="principalColl" name1="Amount" color1="#3b82f6" cumulative />
                <MetricLineChart data={currentBreakdown} title="Interest Due (Cum.)" datakey1="interestColl" name1="Amount" color1="#f59e0b" cumulative />
                <MetricBarChart data={getFilteredData(monthlyCounts)} title="Loans Released" datakey1="releasedLoans" name1="Loans" color1="#3b82f6" />
                <MetricBarChart data={getFilteredData(monthlyCounts)} title="Repayments Collected" datakey1="repayments" name1="Repayments" color1="#10b981" />
                <MetricBarChart data={getFilteredData(monthlyCounts)} title="Fully Paid Loans" datakey1="fullPaid" name1="Loans" color1="#10b981" />
                <MetricBarChart data={getFilteredData(monthlyCounts)} title="New Clients" datakey1="newClients" name1="Clients" color1="#eab308" />
              </div>

              {/* Pie charts & Demographics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white shadow-sm border lg:col-span-2">
                  <CardHeader className="py-4 border-b">
                    <CardTitle className="text-xs font-semibold text-center">Open Loans Status - To Date</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center pt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={40} iconType="circle" formatter={(value: string, entry: any) => <span className="text-[10px] font-medium text-slate-600">{value} ({entry.payload.value} Loans)</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm border lg:col-span-2 grid grid-cols-1 md:grid-cols-2">
                  <div className="border-r">
                    <CardHeader className="py-2 border-b">
                      <CardTitle className="text-[11px] font-semibold text-center text-slate-500">Gender Chart % (All Time)</CardTitle>
                    </CardHeader>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={genderData} cx="50%" cy="50%" outerRadius={70} fill="#8884d8" dataKey="value">
                            {genderData.map((_, i) => <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px' }} formatter={(value: string, entry: any) => <span>{value} ({entry.payload.value} Loans)</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <CardHeader className="py-2 border-b">
                      <CardTitle className="text-[11px] font-semibold text-center text-slate-500">Age Group: Open, Fully Paid & Default</CardTitle>
                    </CardHeader>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ageData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Bar dataKey="open" name="Open" fill="#3b82f6" stackId="a" />
                          <Bar dataKey="fullyPaid" name="Paid" fill="#10b981" stackId="a" />
                          <Bar dataKey="defaulted" name="Default" fill="#ef4444" stackId="a" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Card>
                <Card className="bg-white shadow-sm border lg:col-span-4">
                  <CardHeader className="py-4 border-b">
                    <CardTitle className="text-xs font-semibold">Borrowers Age Group - Rate of Recovery (%)</CardTitle>
                    <CardDescription className="text-[10px]">Open Loans vs All Loans</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[250px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(value: number) => `${value}%`} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} iconType="circle" />
                        <Bar dataKey="openRecovery" name="Open Loans Recovery %" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="allRecovery" name="All Loans Recovery %" fill="#10b981" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* M-T existing charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DisbursementChart />
                <GrowthChart />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RoiChart />
                <ForecastChart />
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest loan applications and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.length > 0 ? (
                      activities.map((activity, i) => (
                        <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">{activity.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Status updated to <span className="capitalize font-semibold text-primary">{activity.status?.replace('_', ' ')}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">UGX {Number(activity.loan_amount || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{new Date(activity.updated_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No recent activity found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Expanded Chart Dialog */}
      <Dialog open={!!expandedChart} onOpenChange={(open) => !open && setExpandedChart(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{expandedChart?.title}</DialogTitle>
          </DialogHeader>
          <div className="h-[60vh] w-full mt-4 bg-slate-50/50 rounded-xl p-4 border">
            {expandedChart?.type === 'bar' && expandedChart.props && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expandedChart.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v > 1000 ? `${v / 1000}k` : v} />
                  <Tooltip formatter={(value: number) => expandedChart.props.name1 !== 'Loans' ? formatCurrency(value) : value} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} iconType="circle" />
                  {expandedChart.props.datakey1 && <Bar dataKey={expandedChart.props.datakey1} name={expandedChart.props.name1} fill={expandedChart.props.color1} radius={[4, 4, 0, 0]} />}
                  {expandedChart.props.datakey2 && <Bar dataKey={expandedChart.props.datakey2} name={expandedChart.props.name2} fill={expandedChart.props.color2} radius={[4, 4, 0, 0]} />}
                </BarChart>
              </ResponsiveContainer>
            )}
            {expandedChart?.type === 'line' && expandedChart.props && (
              <ResponsiveContainer width="100%" height="100%">
                {expandedChart.props.cumulative ? (
                  <AreaChart data={expandedChart.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v > 1000 ? `${v / 1000}k` : v} />
                    <Tooltip formatter={(value: number) => expandedChart.props.name1 !== 'Count' ? formatCurrency(value) : value} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} iconType="circle" />
                    <Area type="monotone" dataKey={expandedChart.props.datakey1} name={expandedChart.props.name1} stroke={expandedChart.props.color1} fill={expandedChart.props.color1} fillOpacity={0.2} strokeWidth={3} />
                  </AreaChart>
                ) : (
                  <LineChart data={expandedChart.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v > 1000 ? `${v / 1000}k` : v} />
                    <Tooltip formatter={(value: number) => expandedChart.props.name1 !== 'Count' ? formatCurrency(value) : value} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} iconType="circle" />
                    <Line type="monotone" dataKey={expandedChart.props.datakey1} name={expandedChart.props.name1} stroke={expandedChart.props.color1} strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default StaffDashboard;
