import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, TrendingDown, FileText } from 'lucide-react';
import { getUserSummary, exportUserReport, type UserReportSummary } from '@/services/reports';

export function UserReport() {
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [summary, setSummary] = useState<UserReportSummary | null>(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const handleGenerateReport = async () => {
        setLoading(true);
        try {
            const data = await getUserSummary({
                from: fromDate || undefined,
                to: toDate || undefined,
            });
            console.log('Report data:', data);
            setSummary(data);
        } catch (error: any) {
            console.error('Failed to generate report:', error);
            const message = error?.response?.data?.message || error?.message || 'Failed to generate report. Please try again.';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await exportUserReport({
                from: fromDate || undefined,
                to: toDate || undefined,
            });
        } catch (error: any) {
            console.error('Failed to export report:', error);
            const message = error?.response?.data?.message || error?.message || 'Failed to export report. Please try again.';
            alert(message);
        } finally {
            setExporting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <h1 className="text-3xl font-bold mb-2 text-foreground">Personal Report</h1>
                <p className="text-muted-foreground">View your income, expenses and spending analysis</p>
            </motion.div>

            {/* Filter Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
                className="bg-card border border-border rounded-lg shadow-lg shadow-primary/5 p-6 mb-6"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Select Time Range</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-foreground/80">From Date</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/50 bg-card text-foreground transition"
                            style={{ colorScheme: 'auto' }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-foreground/80">To Date</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/50 bg-card text-foreground transition"
                            style={{ colorScheme: 'auto' }}
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            {loading ? 'Loading...' : 'Generate Report'}
                        </button>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleExport}
                            disabled={exporting || !summary}
                            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Download className="h-4 w-4" />
                            {exporting ? 'Exporting...' : 'Export CSV'}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Summary Cards */}
            {summary && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                            className="bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700 rounded-lg shadow-lg shadow-rose-500/20 p-6 text-white"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium opacity-90">Total Spent</h3>
                                <TrendingDown className="h-5 w-5" />
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(summary.totalSpent)}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                            className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-lg shadow-lg shadow-indigo-500/20 p-6 text-white"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium opacity-90">Transactions</h3>
                                <FileText className="h-5 w-5" />
                            </div>
                            <p className="text-2xl font-bold">{summary.transactionCount}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
                            className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg shadow-lg shadow-blue-500/20 p-6 text-white"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium opacity-90">Period</h3>
                                <Calendar className="h-5 w-5" />
                            </div>
                            <p className="text-sm">
                                {summary.period.from && summary.period.to
                                    ? `${new Date(summary.period.from).toLocaleDateString()} - ${new Date(summary.period.to).toLocaleDateString()}`
                                    : 'All time'}
                            </p>
                        </motion.div>
                    </div>

                    {/* Category Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
                        className="bg-card border border-border rounded-lg shadow-lg shadow-primary/5 p-6 mb-6"
                    >
                        <h2 className="text-xl font-semibold mb-4 text-foreground">Category Breakdown</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-foreground/70">Category</th>
                                        <th className="text-right py-3 px-4 text-foreground/70">Transactions</th>
                                        <th className="text-right py-3 px-4 text-foreground/70">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.byCategory.map((category: UserReportSummary['byCategory'][0]) => (
                                        <tr key={category.categoryId} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4 text-foreground">{category.categoryName}</td>
                                            <td className="text-right py-3 px-4 text-foreground">{category.count}</td>
                                            <td className="text-right py-3 px-4 font-semibold text-rose-600 dark:text-rose-400">
                                                {formatCurrency(category.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Group Breakdown */}
                    {summary.byGroup.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
                            className="bg-card border border-border rounded-lg shadow-lg shadow-primary/5 p-6"
                        >
                            <h2 className="text-xl font-semibold mb-4 text-foreground">Group Breakdown</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 text-foreground/70">Group</th>
                                            <th className="text-right py-3 px-4 text-foreground/70">Transactions</th>
                                            <th className="text-right py-3 px-4 text-foreground/70">Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.byGroup.map((group: UserReportSummary['byGroup'][0]) => (
                                            <tr key={group.groupId} className="border-b border-border hover:bg-muted/50 transition-colors">
                                                <td className="py-3 px-4 text-foreground">{group.groupName}</td>
                                                <td className="text-right py-3 px-4 text-foreground">{group.count}</td>
                                                <td className="text-right py-3 px-4 font-semibold text-rose-600 dark:text-rose-400">
                                                    {formatCurrency(group.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!summary && !loading && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-card border border-border rounded-lg shadow-lg p-12 text-center"
                >
                    <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No Report Yet</h3>
                    <p className="text-muted-foreground">Select a time range and click "Generate Report" to view data</p>
                </motion.div>
            )}
        </div>
    );
}
