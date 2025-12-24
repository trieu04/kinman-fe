// React import not required due to modern JSX transform
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { editTransactionSchema, type EditTransactionFormData } from "../../lib/validationSchemas";

interface EditTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction;
  onSuccess: () => void;
}

export function EditTransactionModal({ open, onOpenChange, transaction, onSuccess }: EditTransactionModalProps) {
  const { categories, wallets, fetchWallets } = useExpenseStore();

  const defaultValues: EditTransactionFormData = {
    amount: Math.abs(transaction.amount),
    categoryId: transaction.category?.id || "",
    walletId: transaction.wallet?.id || "",
    note: transaction.note || "",
    date: transaction.date?.split("T")[0] || "",
  };

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditTransactionFormData>({
    resolver: zodResolver(editTransactionSchema),
    defaultValues,
    mode: "onChange",
  });

  // formatCurrency not needed in the new form-based UI

  const onSubmit: SubmitHandler<EditTransactionFormData> = async (data) => {
    try {
      await transactionService.update(transaction.id, {
        amount: Math.abs(data.amount),
        categoryId: data.categoryId,
        walletId: data.walletId,
        note: data.note,
        date: data.date ? new Date(data.date).toISOString() : transaction.date,
      });
      onOpenChange(false);
      await fetchWallets();
      onSuccess();
      reset(defaultValues);
    } catch (err) {
      console.error("Failed to update transaction:", err);
      alert("Failed to update transaction");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>Update amount, category, wallet, date, and note.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount */}
          <Card className="border-0 bg-muted/30">
            <CardContent className="pt-6">
              <label className="text-xs font-medium text-muted-foreground">Amount</label>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-semibold">₫</span>
                <input
                  type="number"
                  placeholder="0"
                  step="0.01"
                  min="0"
                  className="flex-1 bg-transparent text-2xl font-bold outline-none focus:ring-0"
                  {...register("amount", { valueAsNumber: true })}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-destructive mt-2">{errors.amount.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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
              )}
            />
            {errors.categoryId && (
              <p className="text-xs text-destructive mt-2">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Wallet */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Wallet</label>
            <Controller
              control={control}
              name="walletId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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
              )}
            />
            {errors.walletId && (
              <p className="text-xs text-destructive mt-2">{errors.walletId.message}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Date</label>
            <input
              type="date"
              className="w-full mt-2 h-10 px-3 rounded-md border border-border bg-card text-sm"
              {...register("date")}
            />
            {errors.date && (
              <p className="text-xs text-destructive mt-2">{errors.date.message}</p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Note</label>
            <input
              type="text"
              placeholder="Add a note..."
              className="w-full mt-2 h-10 px-3 rounded-md border border-border bg-card text-sm"
              {...register("note")}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Updating..." : "Update Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
