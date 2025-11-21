import { useEffect, useState } from "react";
import type { Transaction } from "../types";
import { transactionService } from "../services/transaction.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "" });

  const fetchTransactions = async () => {
    try {
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await transactionService.delete(id);
        setTransactions(transactions.filter((t) => t.id !== id));
      } catch (error) {
        console.error("Failed to delete transaction", error);
      }
    }
  };

  if (isLoading) return <div>Loading transactions...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search..."
          value={filters.search || ""}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="max-w-sm"
        />
        {/* Add more filters here (Select for Category/Wallet) */}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Wallet</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.note}</TableCell> {/* Assuming 'note' is used for description */}
                <TableCell>{transaction.category.name}</TableCell>
                <TableCell>{transaction.wallet.name}</TableCell> {/* Assuming 'wallet.name' exists */}
                <TableCell className={`text - right font - medium ${transaction.category.type === 'expense' ? 'text-red-500' : 'text-green-500'} `}>
                  {transaction.category.type === 'expense' ? '-' : '+'}{Number(transaction.amount).toFixed(2)} {transaction.wallet.currency}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(transaction.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
