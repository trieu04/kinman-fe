import * as React from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useExpenseStore } from "../stores/expenseStore";
import reportService from "../services/reportService";
import transactionService from "../services/transactionService";
import type { MonthlyTrend, Transaction } from "../types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format } from "date-fns";

export function Dashboard() {
  const { wallets, fetchWallets } = useExpenseStore();
  const [monthlyTrend, setMonthlyTrend] = React.useState<MonthlyTrend[]>([]);
  const [recentTransactions, setRecentTransactions] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetchWallets();
        const [trend, transactions] = await Promise.all([
          reportService.getMonthlyTrend(),
          transactionService.getAll(),
        ]);
        setMonthlyTrend(trend);
        setRecentTransactions(transactions.slice(0, 5));
      }
      catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
      finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [fetchWallets]);

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const currentMonth = new Date().getMonth() + 1;
  const monthlySpending = monthlyTrend.find(t => t.month === currentMonth)?.total || 0;

  const chartData = monthlyTrend.map(item => ({
    name: item.year && item.month ? format(new Date(item.year, item.month - 1), "MMM") : "",
    amount: item.total,
  }));

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
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-base">Overview of your finances</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="group cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold stat-number">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across
              {" "}
              {wallets.length}
              {" "}
              wallets
            </p>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer hover:border-destructive/50 hover:shadow-lg hover:shadow-destructive/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Spending</CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold stat-number text-destructive">
              {formatCurrency(Math.abs(monthlySpending))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer hover:border-success/50 hover:shadow-lg hover:shadow-success/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold stat-number">{recentTransactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Recent entries
            </p>
          </CardContent>
        </Card>

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
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
            <CardDescription>Your spending over the past months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              {chartData.length > 0
                ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
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
                    </ResponsiveContainer>
                  )
                : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No data available. Add some transactions to see your spending trend.
                    </div>
                  )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0
                ? (
                    recentTransactions.map(tx => (
                      <div
                        key={tx.id}
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
      </div>
    </div>
  );
}

export default Dashboard;
