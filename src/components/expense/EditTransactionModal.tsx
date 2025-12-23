import * as React from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import transactionService from "../../services/transactionService";
import { useExpenseStore } from "../../stores/expenseStore";
import type { Transaction } from "../../types";

interface EditTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction;
  onSuccess: () => void;
}

export function EditTransactionModal({ open, onOpenChange, transaction, onSuccess }: EditTransactionModalProps) {
  const { categories, wallets, fetchWallets } = useExpenseStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = React.useState(transaction.category?.id || "");
  const [selectedWalletId, setSelectedWalletId] = React.useState(transaction.wallet?.id || "");
  const [amount, setAmount] = React.useState(Math.abs(transaction.amount));
  const [note, setNote] = React.useState(transaction.note || "");
  const [date, setDate] = React.useState(transaction.date?.split("T")[0] || "");

  const formatCurrency = (value: number) => new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId || !selectedWalletId || amount <= 0) return;
    setIsSubmitting(true);
    try {
      await transactionService.update(transaction.id, {
        amount: Math.abs(amount),
        categoryId: selectedCategoryId,
        walletId: selectedWalletId,
        note,
        date: date ? new Date(date).toISOString() : transaction.date,
      });
      onOpenChange(false);
      await fetchWallets();
      onSuccess();
    } catch (err) {
      console.error("Failed to update transaction:", err);
      alert("Failed to update transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>Update amount, category, wallet, date, and note.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <Card className="border-0 bg-muted/30">
            <CardContent className="pt-6">
              <label className="text-xs font-medium text-muted-foreground">Amount</label>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-semibold">₫</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  className="flex-1 bg-transparent text-2xl font-bold outline-none focus:ring-0"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{formatCurrency(amount || 0)}</p>
            </CardContent>
          </Card>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wallet */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Wallet</label>
            <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.icon || "💳"} {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-2 h-10 px-3 rounded-md border border-border bg-card text-sm"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full mt-2 h-10 px-3 rounded-md border border-border bg-card text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || amount <= 0 || !selectedCategoryId || !selectedWalletId}
            className="w-full"
          >
            {isSubmitting ? "Updating..." : "Update Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
