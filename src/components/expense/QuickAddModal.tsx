import * as React from "react";
import { Calendar, Tag, Wallet, Users, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { NlpHighlightInput } from "./NlpHighlightInput";
import { useExpenseStore } from "../../stores/expenseStore";
import transactionService from "../../services/transactionService";
import categoryService from "../../services/categoryService";
import walletService from "../../services/walletService";
import type { NlpParseResult, CreateTransactionDto } from "../../types";

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function QuickAddModal({ open, onOpenChange, onSuccess }: QuickAddModalProps) {
  const { categories, wallets, fetchCategories, fetchWallets, addCategory, addWallet } = useExpenseStore();

  // Form state
  const [inputText, setInputText] = React.useState("");
  const [parseResult, setParseResult] = React.useState<NlpParseResult | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("");
  const [selectedWalletId, setSelectedWalletId] = React.useState<string>("");
  const [customDate, setCustomDate] = React.useState<Date | null>(null);
  const [customAmount, setCustomAmount] = React.useState<number | null>(null);
  const [isSplitBill, setIsSplitBill] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // New category/wallet creation
  const [showNewCategory, setShowNewCategory] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [showNewWallet, setShowNewWallet] = React.useState(false);
  const [newWalletName, setNewWalletName] = React.useState("");

  // Load categories and wallets on mount
  React.useEffect(() => {
    if (open) {
      fetchCategories();
      fetchWallets();
    }
  }, [open, fetchCategories, fetchWallets]);

  // Derived values from NLP or overrides
  const finalAmount = customAmount ?? parseResult?.amount ?? 0;
  const finalDate = customDate ?? (parseResult?.entities.find(e => e.type === "date")?.parsedValue as Date) ?? new Date();
  const finalNote = parseResult?.description || inputText;

  const handleClearDate = () => {
    setCustomDate(new Date()); // Reset to today
  };

  const handleClearAmount = () => {
    setCustomAmount(null);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsSubmitting(true);
    try {
      const category = await categoryService.create({ name: newCategoryName.trim(), type: "expense" });
      addCategory(category);
      setSelectedCategoryId(category.id);
      setShowNewCategory(false);
      setNewCategoryName("");
    }
    catch (error) {
      console.error("Failed to create category:", error);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateWallet = async () => {
    if (!newWalletName.trim()) return;
    setIsSubmitting(true);
    try {
      const wallet = await walletService.create({ name: newWalletName.trim(), type: "cash", balance: 0, currency: "VND" });
      addWallet(wallet);
      setSelectedWalletId(wallet.id);
      setShowNewWallet(false);
      setNewWalletName("");
    }
    catch (error) {
      console.error("Failed to create wallet:", error);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!finalAmount || finalAmount <= 0) return;
    if (!selectedCategoryId || !selectedWalletId) return;

    setIsSubmitting(true);
    try {
      const dto: CreateTransactionDto = {
        amount: Math.abs(finalAmount),
        date: finalDate.toISOString(),
        note: finalNote,
        categoryId: selectedCategoryId,
        walletId: selectedWalletId,
      };

      await transactionService.create(dto);

      // Reset form
      setInputText("");
      setParseResult(null);
      setSelectedCategoryId("");
      setSelectedWalletId("");
      setCustomDate(null);
      setCustomAmount(null);
      setIsSplitBill(false);

      onOpenChange(false);
      onSuccess?.();
    }
    catch (error) {
      console.error("Failed to create transaction:", error);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-white text-lg font-bold">+</span>
            </div>
            <span className="text-xl">Quick Add Expense</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            Type naturally like "Coffee 50k today" and we'll parse it for you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Smart Input */}
          <NlpHighlightInput
            value={inputText}
            onChange={setInputText}
            parseResult={parseResult}
            onParseResultChange={setParseResult}
            onClearDate={handleClearDate}
            onClearAmount={handleClearAmount}
            placeholder='e.g., "Dinner 500k yesterday with friends"'
          />

          {/* Manual Controls */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                Category
              </label>
              {showNewCategory
                ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCreateCategory();
                          }
                        }}
                        placeholder="Category name"
                        className="flex-1 h-11 px-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleCreateCategory}>Add</Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowNewCategory(false)}>×</Button>
                    </div>
                  )
                : (
                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon}
                            {" "}
                            {cat.name}
                          </SelectItem>
                        ))}
                        <button
                          onClick={() => setShowNewCategory(true)}
                          className="w-full px-2 py-1.5 text-sm text-left text-primary hover:bg-accent cursor-pointer"
                        >
                          + Create new category
                        </button>
                      </SelectContent>
                    </Select>
                  )}
            </div>

            {/* Wallet Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                Wallet
              </label>
              {showNewWallet
                ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newWalletName}
                        onChange={e => setNewWalletName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCreateWallet();
                          }
                        }}
                        placeholder="Wallet name"
                        className="flex-1 h-11 px-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleCreateWallet}>Add</Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowNewWallet(false)}>×</Button>
                    </div>
                  )
                : (
                    <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select wallet" />
                      </SelectTrigger>
                      <SelectContent>
                        {wallets.map(wallet => (
                          <SelectItem key={wallet.id} value={wallet.id}>
                            {wallet.icon || "💳"}
                            {" "}
                            {wallet.name}
                          </SelectItem>
                        ))}
                        <button
                          onClick={() => setShowNewWallet(true)}
                          className="w-full px-2 py-1.5 text-sm text-left text-primary hover:bg-accent cursor-pointer"
                        >
                          + Create new wallet
                        </button>
                      </SelectContent>
                    </Select>
                  )}
            </div>
          </div>

          {/* Date Override */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Date
            </label>
            <input
              type="date"
              value={finalDate.toISOString().split("T")[0]}
              onChange={e => setCustomDate(new Date(e.target.value))}
              className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>

          {/* Split Bill Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Split with group?</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSplitBill(!isSplitBill)}
              aria-label="Toggle split bill"
              title="Toggle split bill"
              className={`w-12 h-7 rounded-full transition-all duration-200 cursor-pointer ${isSplitBill ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${isSplitBill ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {isSplitBill && (
            <div className="p-4 rounded-xl border border-border bg-muted/20">
              <p className="text-sm text-muted-foreground">
                Go to Groups → Select a group → Add group expense for split bill functionality
              </p>
            </div>
          )}

          {/* Summary */}
          {finalAmount > 0 && (
            <div className="p-5 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                <span className="text-2xl font-bold text-destructive stat-number">
                  -
                  {formatCurrency(finalAmount)}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || finalAmount <= 0 || !selectedCategoryId || !selectedWalletId}
            className="px-6 bg-gradient-to-r from-primary to-purple-500 shadow-lg shadow-primary/25"
          >
            {isSubmitting
              ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                )
              : (
                  "Add Expense"
                )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default QuickAddModal;
