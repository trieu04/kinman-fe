import { useState } from 'react';
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-neutral-900 dark:text-neutral-100">Personal Report</h1>
                <p className="text-gray-700 dark:text-neutral-300">View your income, expenses and spending analysis</p>
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
            </div>            {/* Summary Cards */}
            {summary && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-6 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium opacity-90">Total Spent</h3>
                                <TrendingDown className="h-5 w-5" />
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(summary.totalSpent)}</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium opacity-90">Transactions</h3>
                                <FileText className="h-5 w-5" />
                            </div>
                            <p className="text-2xl font-bold">{summary.transactionCount}</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium opacity-90">Period</h3>
                                <Calendar className="h-5 w-5" />
                            </div>
                            <p className="text-sm">
                                {summary.period.from && summary.period.to
                                    ? `${new Date(summary.period.from).toLocaleDateString()} - ${new Date(summary.period.to).toLocaleDateString()}`
                                    : 'All time'}
                            </p>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-neutral-800">
                        <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">Category Breakdown</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-neutral-800">
                                        <th className="text-left py-3 px-4 text-neutral-700 dark:text-neutral-300">Category</th>
                                        <th className="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300">Transactions</th>
                                        <th className="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.byCategory.map((category: UserReportSummary['byCategory'][0]) => (
                                        <tr key={category.categoryId} className="border-b border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800">
                                            <td className="py-3 px-4 text-neutral-900 dark:text-neutral-100">{category.categoryName}</td>
                                            <td className="text-right py-3 px-4 text-neutral-900 dark:text-neutral-100">{category.count}</td>
                                            <td className="text-right py-3 px-4 font-semibold text-red-600 dark:text-red-400">
                                                {formatCurrency(category.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Group Breakdown */}
                    {summary.byGroup.length > 0 && (
                        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-neutral-800">
                            <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">Group Breakdown</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-neutral-800">
                                            <th className="text-left py-3 px-4 text-neutral-700 dark:text-neutral-300">Group</th>
                                            <th className="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300">Transactions</th>
                                            <th className="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300">Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.byGroup.map((group: UserReportSummary['byGroup'][0]) => (
                                            <tr key={group.groupId} className="border-b border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800">
                                                <td className="py-3 px-4 text-neutral-900 dark:text-neutral-100">{group.groupName}</td>
                                                <td className="text-right py-3 px-4 text-neutral-900 dark:text-neutral-100">{group.count}</td>
                                                <td className="text-right py-3 px-4 font-semibold text-red-600 dark:text-red-400">
                                                    {formatCurrency(group.amount)}
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
                    <FileText className="h-16 w-16 text-gray-400 dark:text-neutral-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No Report Yet</h3>
                    <p className="text-gray-600 dark:text-neutral-300">Select a time range and click \"Generate Report\" to view data</p>
                </div>
            )}
        </div>
    );
}
