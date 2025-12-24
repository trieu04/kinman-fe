import * as React from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useExpenseStore } from "../stores/expenseStore";
import reportService from "../services/reportService";
import transactionService from "../services/transactionService";
import type { DailyTrend, MonthlyTrend, Transaction } from "../types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { endOfMonth, format, startOfMonth } from "date-fns";

export function Dashboard() {
  const { wallets, fetchWallets } = useExpenseStore();
  const [monthlyTrend, setMonthlyTrend] = React.useState<MonthlyTrend[]>([]);
  const [dailyTrend, setDailyTrend] = React.useState<DailyTrend[]>([]);
  const [recentTransactions, setRecentTransactions] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isChartLoading, setIsChartLoading] = React.useState(true);

  const [transactionCount, setTransactionCount] = React.useState(0);

  const [chartMode, setChartMode] = React.useState<"monthly" | "daily">("monthly");
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = React.useState<number | "all">("all");
  const [dailyRange, setDailyRange] = React.useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  const [hoverLabel, setHoverLabel] = React.useState<string>("");
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  React.useEffect(() => {
    const fetchBase = async () => {
      setIsLoading(true);
      try {
        await fetchWallets();
        const transactions = await transactionService.getAll();
        setRecentTransactions(transactions.slice(0, 5));
      }
      catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
      finally {
        setIsLoading(false);
      }
    };
    fetchBase();
  }, [fetchWallets]);

  React.useEffect(() => {
    const fetchMonthly = async () => {
      setIsChartLoading(true);
      try {
        const trend = await reportService.getMonthlyTrend(selectedYear);
        setMonthlyTrend(trend);
      }
      catch (error) {
        console.error("Failed to fetch monthly trend:", error);
      }
      finally {
        setIsChartLoading(false);
      }
    };
    fetchMonthly();
  }, [selectedYear]);

  React.useEffect(() => {
    if (chartMode !== "monthly")
      return;

    const computeMonthlyCounts = async () => {
      setIsChartLoading(true);
      try {
        let start = `${selectedYear}-01-01`;
        let end = `${selectedYear}-12-31`;

        if (selectedMonth !== "all") {
          const d = new Date(selectedYear, selectedMonth - 1, 1);
          start = format(startOfMonth(d), "yyyy-MM-dd");
          end = format(endOfMonth(d), "yyyy-MM-dd");
        }

        const tx = await transactionService.getAll({ startDate: start, endDate: end });
        setTransactionCount(tx.length);
      }
      catch (error) {
        console.error("Failed to count monthly transactions:", error);
      }
      finally {
        setIsChartLoading(false);
      }
    };

    computeMonthlyCounts();
  }, [chartMode, selectedYear, selectedMonth]);

  React.useEffect(() => {
    if (chartMode !== "daily")
      return;

    const fetchDaily = async () => {
      setIsChartLoading(true);
      try {
        const trend = await reportService.getDailyTrend(dailyRange.start, dailyRange.end);
        setDailyTrend(trend);

        const totalCount = trend.reduce((sum, item) => sum + item.count, 0);
        setTransactionCount(totalCount);
      }
      catch (error) {
        console.error("Failed to fetch daily trend:", error);
      }
      finally {
        setIsChartLoading(false);
      }
    };
    fetchDaily();
  }, [chartMode, dailyRange]);

  React.useEffect(() => {
    setHoverLabel("");
    setHoverValue(null);
  }, [chartMode, selectedYear, selectedMonth, dailyRange]);

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  const monthlyChartData = React.useMemo(() => {
    // Ensure 12 months are always present for the selected year
    const base = Array.from({ length: 12 }, (_, idx) => ({
      month: idx + 1,
      name: format(new Date(selectedYear, idx), "MMM"),
      amount: 0,
    }));

    monthlyTrend.forEach(item => {
      const m = item.month;
      if (m >= 1 && m <= 12) {
        base[m - 1].amount = item.total;
      }
    });

    return base;
  }, [monthlyTrend, selectedYear]);

  const dailyChartData = dailyTrend.map(item => ({
    name: format(new Date(item.date), "MMM d"),
    amount: item.total,
  }));

  const chartData = chartMode === "monthly"
    ? (selectedMonth === "all"
        ? monthlyChartData
        : monthlyChartData.filter(item => item.month === selectedMonth))
    : dailyChartData;

  const monthlyChartTotal = monthlyChartData.reduce((sum, item) => sum + item.amount, 0);
  const dailyChartTotal = dailyChartData.reduce((sum, item) => sum + item.amount, 0);
  const dailyChartCount = dailyTrend.reduce((sum, item) => sum + item.count, 0);
  const monthSelectedTotal = selectedMonth === "all"
    ? monthlyChartTotal
    : (monthlyTrend.find(m => m.month === selectedMonth)?.total || 0);

  const chartTotal = chartMode === "monthly" ? monthSelectedTotal : dailyChartTotal;

  const rangeLabel = chartMode === "monthly"
    ? (selectedMonth === "all"
      ? `Year ${selectedYear}`
      : `${format(new Date(selectedYear, Number(selectedMonth) - 1), "MMM yyyy")}`)
    : `${format(new Date(dailyRange.start), "MMM d")} - ${format(new Date(dailyRange.end), "MMM d")}`;

  const displayValue = hoverValue !== null ? hoverValue : chartTotal;
  const displayLabel = hoverLabel || rangeLabel;

  const getPointValue = (payload: any) => {
    const raw = payload?.payload?.amount ?? payload?.value ?? 0;
    const num = Number(raw);
    return Number.isFinite(num) ? num : 0;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        className="space-y-1"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-base">Overview of your finances</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
        >
        <Card className="group cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold stat-number">{formatCurrency(displayValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {chartMode === "monthly" ? displayLabel : `Range · ${displayLabel}`}
            </p>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
        >
        <Card className="group cursor-pointer hover:border-destructive/50 hover:shadow-lg hover:shadow-destructive/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Spending</CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold stat-number text-destructive">
              {formatCurrency(Math.abs(chartTotal))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {chartMode === "monthly" ? displayLabel : `Range · ${displayLabel}`}
            </p>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
        >
        <Card className="group cursor-pointer hover:border-success/50 hover:shadow-lg hover:shadow-success/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold stat-number">{transactionCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {chartMode === "monthly" ? displayLabel : `Range · ${displayLabel}`}
            </p>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
        >
        <Card className="group cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Savings Goal</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10">
              <PiggyBank className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold stat-number">0%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Set a goal to track
            </p>
          </CardContent>
        </Card>
        </motion.div>
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Chart */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: "easeOut" }}
        >
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Spending Trend</CardTitle>
                <CardDescription>
                  {hoverLabel ? `${hoverLabel}` : chartMode === "monthly" ? "Spending by month" : "Spending by day"}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex rounded-lg border bg-muted/40 p-0.5">
                  {["monthly", "daily"].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setChartMode(mode as "monthly" | "daily")}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${chartMode === mode ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"}`}
                    >
                      {mode === "monthly" ? "Monthly" : "Daily"}
                    </button>
                  ))}
                </div>

                {chartMode === "monthly" && (
                  <div className="flex gap-2 flex-wrap">
                    <div className="relative">
                      <select
                        className="h-10 rounded-md border bg-background px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 max-h-48 overflow-y-auto"
                        value={selectedYear}
                        onChange={e => setSelectedYear(Number(e.target.value))}
                      >
                        {[0, 1, 2, 3, 4].map(offset => {
                          const year = currentYear - offset;
                          return <option key={year} value={year}>{year}</option>;
                        })}
                      </select>
                    </div>

                    <div className="relative">
                      <select
                        className="h-10 rounded-md border bg-background px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 max-h-52 overflow-y-auto"
                        value={selectedMonth === "all" ? "all" : selectedMonth}
                        onChange={e => {
                          const val = e.target.value;
                          setSelectedMonth(val === "all" ? "all" : Number(val));
                        }}
                      >
                        <option value="all">All months</option>
                        {Array.from({ length: 12 }, (_, idx) => idx + 1).map(m => (
                          <option key={m} value={m}>{format(new Date(0, m - 1), "MMM")}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {chartMode === "daily" && (
                  <div className="flex items-center gap-3 text-sm bg-muted/60 border rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">From</span>
                      <input
                        type="date"
                        className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        value={dailyRange.start}
                        max={dailyRange.end}
                        onChange={e => setDailyRange(range => ({ ...range, start: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">To</span>
                      <input
                        type="date"
                        className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        value={dailyRange.end}
                        min={dailyRange.start}
                        max={format(new Date(), "yyyy-MM-dd")}
                        onChange={e => setDailyRange(range => ({ ...range, end: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[340px] w-full">
              {isChartLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Loading chart...
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartMode === "monthly" ? (
                    <AreaChart
                      data={chartData}
                      onMouseMove={(state: any) => {
                        const payload = state?.activePayload?.[0];
                        if (payload) {
                          const value = getPointValue(payload);
                          const label = (payload.payload as any)?.name ?? "";
                          setHoverLabel(`${label} · ${rangeLabel}`);
                          setHoverValue(value);
                        }
                      }}
                      onMouseLeave={() => {
                        setHoverLabel("");
                        setHoverValue(null);
                      }}
                    >
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis
                        dataKey="name"
                        className="text-xs fill-muted-foreground"
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                        interval={0}
                      />
                      <YAxis
                        className="text-xs fill-muted-foreground"
                        tickFormatter={value => `${(value / 1000000).toFixed(0)}M`}
                        axisLine={false}
                        tickLine={false}
                        dx={-10}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "12px",
                          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
                        }}
                        formatter={(value: number | string | undefined) => [formatCurrency(Number(value || 0)), "Amount"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#6366F1"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorAmount)"
                      />
                    </AreaChart>
                  ) : (
                    <BarChart
                      data={chartData}
                      onMouseMove={(state: any) => {
                        const payload = state?.activePayload?.[0];
                        if (payload) {
                          const value = getPointValue(payload);
                          const label = (payload.payload as any)?.name ?? "";
                          setHoverLabel(`${label} · ${rangeLabel}`);
                          setHoverValue(value);
                        }
                      }}
                      onMouseLeave={() => {
                        setHoverLabel("");
                        setHoverValue(null);
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis
                        dataKey="name"
                        className="text-xs fill-muted-foreground"
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                        interval={chartData.length > 14 ? 2 : 0}
                      />
                      <YAxis
                        className="text-xs fill-muted-foreground"
                        tickFormatter={value => `${(value / 1000000).toFixed(0)}M`}
                        axisLine={false}
                        tickLine={false}
                        dx={-10}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "12px",
                          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
                        }}
                        formatter={(value: number | string | undefined) => [formatCurrency(Number(value || 0)), "Amount"]}
                      />
                      <Bar dataKey="amount" fill="#6366F1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available. Adjust your filters or add transactions to see your spending trend.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.65, ease: "easeOut" }}
        >
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0
                ? (
                    recentTransactions.map((tx, idx) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                      >
                      <div
                        className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 cursor-pointer transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-base group-hover:scale-105 transition-transform duration-200">
                            {tx.category?.icon || "💰"}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {tx.note || tx.category?.name || "Uncategorized"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(tx.date), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <span className={`font-semibold stat-number ${tx.amount < 0 ? "text-destructive" : "text-success"}`}>
                          {tx.amount < 0 ? "-" : "+"}
                          {formatCurrency(Math.abs(tx.amount))}
                        </span>
                      </div>
                      </motion.div>
                    ))
                  )
                : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No transactions yet</p>
                      <p className="text-sm">Click "Quick Add" to add your first expense</p>
                    </div>
                  )}
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
