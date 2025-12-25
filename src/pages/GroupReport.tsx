import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Calendar, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { getGroupSummary, exportGroupReport, type GroupReportSummary } from '@/services/reports';

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
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-neutral-900 dark:text-neutral-100">Group Report</h1>
                <p className="text-gray-700 dark:text-neutral-300">View group expenses and debts</p>
            </div>

            {/* Filter Section */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Select Time Range</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-800 dark:text-neutral-200">From Date</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:text-neutral-100"
                            style={{ colorScheme: 'auto' }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-800 dark:text-neutral-200">To Date</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:text-neutral-100"
                            style={{ colorScheme: 'auto' }}
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Loading...' : 'Generate Report'}
                        </button>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleExport}
                            disabled={exporting || !summary}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            {exporting ? 'Exporting...' : 'Export CSV'}
                        </button>
                    </div>
                </div>
            </div>            {/* Summary Section */}
            {summary && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium opacity-90">Tên nhóm</h3>
                                <Users className="h-5 w-5" />
                            </div>
                            <p className="text-2xl font-bold">{summary.groupName}</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium opacity-90">Total Expense</h3>
                                <DollarSign className="h-5 w-5" />
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(summary.totalExpense)}</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium opacity-90">Members</h3>
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <p className="text-2xl font-bold">{summary.memberExpenses.length}</p>
                        </div>
                    </div>

                    {/* Member Expenses */}
                    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-neutral-800">
                        <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">Member Expenses</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-neutral-800">
                                        <th className="text-left py-3 px-4 text-neutral-700 dark:text-neutral-300">Member</th>
                                        <th className="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300">Paid</th>
                                        <th className="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300">Owed</th>
                                        <th className="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.memberExpenses.map((member: GroupReportSummary['memberExpenses'][0]) => (
                                        <tr key={member.userId} className="border-b border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800">
                                            <td className="py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">{member.userName}</td>
                                            <td className="text-right py-3 px-4 text-green-600 dark:text-green-400">
                                                {formatCurrency(member.totalPaid)}
                                            </td>
                                            <td className="text-right py-3 px-4 text-red-600 dark:text-red-400">
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
                    </div>

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
