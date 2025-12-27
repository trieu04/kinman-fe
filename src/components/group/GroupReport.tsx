import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Calendar, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { getGroupSummary, exportGroupReport, type GroupReportSummary } from '@/services/reportService';

export function GroupReport() {
    const { groupId } = useParams<{ groupId: string }>();
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [summary, setSummary] = useState<GroupReportSummary | null>(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        if (groupId) {
            handleGenerateReport();
        }
    }, [groupId]);

    const handleGenerateReport = async () => {
        if (!groupId) return;

        setLoading(true);
        try {
            const data = await getGroupSummary(groupId, {
                from: fromDate || undefined,
                to: toDate || undefined,
            });
            console.log('Group report data:', data);
            setSummary(data);
        } catch (error: any) {
            console.error('Failed to generate group report:', error);
            const message = error?.response?.data?.message || error?.message || 'Failed to generate group report. Please try again.';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!groupId) return;

        setExporting(true);
        try {
            await exportGroupReport(groupId, {
                from: fromDate || undefined,
                to: toDate || undefined,
            });
        } catch (error: any) {
            console.error('Failed to export group report:', error);
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

    const getBalanceColor = (balance: number) => {
        if (balance > 0) return 'text-green-600 dark:text-green-400';
        if (balance < 0) return 'text-red-600 dark:text-red-400';
        return 'text-gray-600 dark:text-neutral-300';
    };

    if (!groupId) {
        return (
            <div className="container mx-auto p-6 max-w-7xl">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-yellow-800">Missing Group Information</h3>
                        <p className="text-yellow-700">Please select a group to view the report.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <h1 className="text-3xl font-bold mb-2 text-foreground">Group Report</h1>
                <p className="text-muted-foreground">View group expenses and debts</p>
            </motion.div>

            {/* Filter Section */}
            <motion.div
                className="bg-card border border-border rounded-lg shadow-lg shadow-primary/5 p-6 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
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

            {/* Summary Section */}
            {summary && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                            className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg shadow-lg shadow-blue-500/20 p-6 text-white"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium opacity-90">Tên nhóm</h3>
                                <Users className="h-5 w-5" />
                            </div>
                            <p className="text-2xl font-bold">{summary.groupName}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                            className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg shadow-lg shadow-purple-500/20 p-6 text-white"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium opacity-90">Total Expense</h3>
                                <DollarSign className="h-5 w-5" />
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(summary.totalExpense)}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
                            className="bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-lg shadow-lg shadow-emerald-500/20 p-6 text-white"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium opacity-90">Members</h3>
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <p className="text-2xl font-bold">{summary.memberExpenses.length}</p>
                        </motion.div>
                    </div>

                    {/* Member Expenses */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
                        className="bg-card border border-border rounded-lg shadow-lg shadow-primary/5 p-6 mb-6"
                    >
                        <h2 className="text-xl font-semibold mb-4 text-foreground">Member Expenses</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-foreground/70">Member</th>
                                        <th className="text-right py-3 px-4 text-foreground/70">Paid</th>
                                        <th className="text-right py-3 px-4 text-foreground/70">Owed</th>
                                        <th className="text-right py-3 px-4 text-foreground/70">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.memberExpenses.map((member: GroupReportSummary['memberExpenses'][0]) => (
                                        <tr key={member.userId} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-foreground">{member.userName}</td>
                                            <td className="text-right py-3 px-4 text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(member.totalPaid)}
                                            </td>
                                            <td className="text-right py-3 px-4 text-rose-600 dark:text-rose-400">
                                                {formatCurrency(member.totalOwed)}
                                            </td>
                                            <td className={`text-right py-3 px-4 font-bold ${getBalanceColor(member.balance)}`}>
                                                {formatCurrency(member.balance)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Pending Debts */}
                    {summary.debts.pending.length > 0 && (
                        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-neutral-800">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                                Pending Debts
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-neutral-800">
                                            <th className="text-left py-3 px-4 text-neutral-700 dark:text-neutral-300">Debtor</th>
                                            <th className="text-left py-3 px-4 text-neutral-700 dark:text-neutral-300">Creditor</th>
                                            <th className="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.debts.pending.map((debt: GroupReportSummary['debts']['pending'][0]) => (
                                            <tr key={debt.id} className="border-b border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800">
                                                <td className="py-3 px-4 text-neutral-900 dark:text-neutral-100">{debt.fromUserName}</td>
                                                <td className="py-3 px-4 text-neutral-900 dark:text-neutral-100">{debt.toUserName}</td>
                                                <td className="text-right py-3 px-4 font-semibold text-red-600 dark:text-red-400">
                                                    {formatCurrency(debt.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Settled Debts */}
                    {summary.debts.settled.length > 0 && (
                        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-neutral-800">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                Settled Debts
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-neutral-800">
                                            <th className="text-left py-3 px-4 text-neutral-700 dark:text-neutral-300">Debtor</th>
                                            <th className="text-left py-3 px-4 text-neutral-700 dark:text-neutral-300">Creditor</th>
                                            <th className="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300">Amount</th>
                                            <th className="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300">Settled Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.debts.settled.map((debt: GroupReportSummary['debts']['settled'][0]) => (
                                            <tr key={debt.id} className="border-b border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800">
                                                <td className="py-3 px-4 text-neutral-900 dark:text-neutral-100">{debt.fromUserName}</td>
                                                <td className="py-3 px-4 text-neutral-900 dark:text-neutral-100">{debt.toUserName}</td>
                                                <td className="text-right py-3 px-4 font-semibold text-green-600 dark:text-green-400">
                                                    {formatCurrency(debt.amount)}
                                                </td>
                                                <td className="text-right py-3 px-4 text-gray-700 dark:text-neutral-300">
                                                    {debt.settledAt ? new Date(debt.settledAt).toLocaleDateString('vi-VN') : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!summary && !loading && (
                <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-neutral-800">
                    <Users className="h-16 w-16 text-gray-400 dark:text-neutral-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No Report Yet</h3>
                    <p className="text-gray-600 dark:text-neutral-300">Click "Generate Report" to view group data</p>
                </div>
            )}
        </div>
    );
}

export default GroupReport;
