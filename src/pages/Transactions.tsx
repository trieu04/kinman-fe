import * as React from "react";
import { Trash2, Edit, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { EditTransactionModal } from "../components/expense/EditTransactionModal";
import transactionService from "../services/transactionService";
import { useExpenseStore } from "../stores/expenseStore";
import type { Transaction, TransactionFilter } from "../types";
import { format } from "date-fns";

export function Transactions() {
  const { categories, wallets, fetchCategories, fetchWallets, refreshTrigger, triggerRefresh } = useExpenseStore();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<TransactionFilter>({});
  const [searchText, setSearchText] = React.useState("");
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await transactionService.getAll(filter);
      setTransactions(data);
    }
    catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
    finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCategories();
    fetchWallets();
  }, [fetchCategories, fetchWallets]);

  React.useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?"))
      return;
    try {
      await transactionService.delete(id);
      setTransactions(transactions.filter(t => t.id !== id));
      triggerRefresh();
      await fetchWallets();
    }
    catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const handleEditClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchTransactions();
    triggerRefresh();
    fetchWallets();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const filteredTransactions = transactions.filter(tx =>
    searchText
      ? tx.note?.toLowerCase().includes(searchText.toLowerCase())
      || tx.category?.name?.toLowerCase().includes(searchText.toLowerCase())
      : true,
  );

  const totalExpense = filteredTransactions
    .filter(t => Number(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

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
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground text-base">View and manage your expenses</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
        >
        <Card className="bg-gradient-to-br from-card to-muted/30">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground font-medium">Total Transactions</p>
            <p className="text-3xl font-bold mt-2 stat-number">{filteredTransactions.length}</p>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
        >
        <Card className="bg-gradient-to-br from-card to-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground font-medium">Total Expenses</p>
            <p className="text-3xl font-bold text-destructive mt-2 stat-number">
              -
              {formatCurrency(totalExpense)}
            </p>
          </CardContent>
        </Card>
        </motion.div>
        {/* Total Income card removed */}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
      >
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="Search transactions..."
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={filter.categoryId || "all"}
              onValueChange={value => setFilter({ ...filter, categoryId: value === "all" ? undefined : value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon}
                    {" "}
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Wallet Filter */}
            <Select
              value={filter.walletId || "all"}
              onValueChange={value => setFilter({ ...filter, walletId: value === "all" ? undefined : value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Wallets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wallets</SelectItem>
                {wallets.map(wallet => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.icon || "💳"}
                    {" "}
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range */}
            <input
              type="date"
              value={filter.startDate?.split("T")[0] || ""}
              onChange={e => setFilter({ ...filter, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              className="h-10 px-3 rounded-md border border-border bg-card text-sm"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={filter.endDate?.split("T")[0] || ""}
              onChange={e => setFilter({ ...filter, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              className="h-10 px-3 rounded-md border border-border bg-card text-sm"
              placeholder="End Date"
            />
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
      >
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            {filteredTransactions.length}
            {" "}
            transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredTransactions.length > 0
              ? (
                  filteredTransactions.map((tx, idx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
                      whileHover={{ x: idx % 2 === 0 ? 4 : -4, transition: { duration: 0.2 } }}
                      className="rounded-lg"
                    >
                    <div
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-lg">
                            {tx.category?.icon || "💰"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{tx.note || tx.category?.name || "Uncategorized"}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{format(new Date(tx.date), "MMM d, yyyy")}</span>
                            {tx.wallet && (
                              <>
                                <span>•</span>
                                <span>{tx.wallet.name}</span>
                              </>
                            )}
                            {tx.category && (
                              <>
                                <span>•</span>
                                <Badge variant="secondary" className="text-xs">
                                  {tx.category.name}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`text-lg font-semibold ${tx.amount < 0 ? "text-destructive" : "text-success"}`}>
                          {tx.amount < 0 ? "-" : "+"}
                          {formatCurrency(Math.abs(tx.amount))}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditClick(tx)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(tx.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    </motion.div>
                  ))
                )
              : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <p>No transactions found</p>
                    <p className="text-sm">Try adjusting your filters or add a new transaction</p>
                  </motion.div>
                )}
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Edit Modal */}
      {editingTransaction && (
        <EditTransactionModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          transaction={editingTransaction}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

export default Transactions;
