import * as React from "react";
import { Calendar, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { NlpHighlightInput } from "./NlpHighlightInput";
import { CategorySelector } from "./CategorySelector";
import { WalletSelector } from "./WalletSelector";
import { SplitBillSection } from "./SplitBillSection";
import { TransactionSummary } from "./TransactionSummary";
import { quickAddFormSchema, type QuickAddFormValues } from "../../lib/validationSchemas";
import { useExpenseStore } from "../../stores/expenseStore";
import transactionService from "../../services/transactionService";
import type { NlpParseResult, CreateTransactionDto, Group, TransactionSplit, Category, Wallet } from "../../types";
import groupService from "../../services/groupService";
import { useAuthStore } from "../../stores/authStore";

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function QuickAddModal({ open, onOpenChange, onSuccess }: QuickAddModalProps) {
  const { categories, wallets, fetchCategories, fetchWallets, addCategory, addWallet, triggerRefresh } = useExpenseStore();
  const { user } = useAuthStore();

  // React Hook Form
  const form = useForm<QuickAddFormValues>({
    resolver: zodResolver(quickAddFormSchema),
    defaultValues: {
      inputText: "",
      amount: null,
      date: new Date(),
      categoryId: "",
      walletId: "",
      isSplitBill: false,
      groupId: "",
      splitType: "equal",
      selectedMemberIds: [],
      exactAmounts: {},
    },
  });

  const { watch, setValue, handleSubmit: hookFormSubmit, reset, formState: { isSubmitting } } = form;

  // Watch form values
  const inputText = watch("inputText");
  const amount = watch("amount");
  const date = watch("date");
  const categoryId = watch("categoryId");
  const walletId = watch("walletId");
  const isSplitBill = watch("isSplitBill");
  const groupId = watch("groupId");
  const splitType = watch("splitType");
  const selectedMemberIds = watch("selectedMemberIds");
  const exactAmounts = watch("exactAmounts");

  // Additional state for NLP and groups
  const [parseResult, setParseResult] = React.useState<NlpParseResult | null>(null);
  const [groups, setGroups] = React.useState<Group[]>([]);

  // Load categories, wallets, and groups on mount
  React.useEffect(() => {
    if (open) {
      fetchCategories();
      fetchWallets();
      fetchGroups();
    }
  }, [open, fetchCategories, fetchWallets]);

  const fetchGroups = async () => {
    try {
      const data = await groupService.getAll();
      setGroups(data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

  // Derived values from NLP or overrides
  const finalAmount = amount ?? parseResult?.amount ?? 0;
  const finalDate = date ?? (parseResult?.entities.find(e => e.type === "date")?.parsedValue as Date) ?? new Date();
  const finalNote = parseResult?.description || inputText;

  const handleClearDate = () => {
    setValue("date", new Date()); // Reset to today
  };

  const handleClearAmount = () => {
    setValue("amount", null);
  };

  // Handle group selection
  const handleGroupSelect = (groupId: string) => {
    setValue("groupId", groupId);
    const group = groups.find(g => g.id === groupId);
    if (group) {
      // Auto-select all members
      const memberIds = group.members.map(m => m.userId || m.user?.id || "");
      setValue("selectedMemberIds", memberIds);
      setValue("exactAmounts", {});
    }
  };

  const toggleMember = (userId: string) => {
    const currentMembers = selectedMemberIds;
    const newMembers = currentMembers.includes(userId)
      ? currentMembers.filter(id => id !== userId)
      : [...currentMembers, userId];
    setValue("selectedMemberIds", newMembers);
  };

  const handleExactAmountChange = (userId: string, amount: string) => {
    setValue("exactAmounts", { ...exactAmounts, [userId]: amount });
  };

  const handleCategoryCreated = (category: Category) => {
    addCategory(category);
  };

  const handleWalletCreated = (wallet: Wallet) => {
    addWallet(wallet);
  };

  const exactTotal = Object.values(exactAmounts).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );
  const exactRemaining = finalAmount - exactTotal;

  const getIsDisabled = () => {
    // Category and Wallet are required
    if (isSubmitting || finalAmount <= 0) return true;
    if (!categoryId || !walletId) return true;
    if (isSplitBill && groupId) {
      if (splitType === "equal" && selectedMemberIds.length === 0) return true;
      if (splitType === "exact" && Math.abs(exactRemaining) > 0.99) return true;
    }
    return false;
  };

  const handleSubmit = hookFormSubmit(async (data) => {
    if (!finalAmount || finalAmount <= 0) return;

    // Validation: category and wallet are required
    if (!data.categoryId || !data.walletId) {
      alert("Vui lòng chọn danh mục và ví");
      return;
    }

    try {
      const dto: CreateTransactionDto = {
        amount: Math.abs(finalAmount),
        date: finalDate.toISOString(),
        note: finalNote,
        categoryId: data.categoryId,
        walletId: data.walletId,
      };

      if (data.isSplitBill && data.groupId) {
        const group = groups.find((g) => g.id === data.groupId);
        if (group) {
          let splits: TransactionSplit[] = [];

          if (data.splitType === "equal") {
            const selectedMembers = data.selectedMemberIds.filter((id: string) => id);
            if (selectedMembers.length > 0) {
              const totalAmountNum = Math.abs(finalAmount);
              const share = Math.floor(
                totalAmountNum / selectedMembers.length
              );
              const remainder = totalAmountNum % selectedMembers.length;

              splits = selectedMembers.map((userId: string, index: number) => ({
                userId,
                amount: index === 0 ? share + remainder : share,
              }));
            }
          } else {
            // Exact split
            splits = Object.entries(data.exactAmounts)
              .filter(([_, amount]) => Number(amount) > 0)
              .map(([userId, amount]) => ({
                userId,
                amount: Number(amount),
              }));
          }

          if (splits.length > 0) {
            dto.groupId = data.groupId;
            dto.splits = splits;
          }
        }
      }

      await transactionService.create(dto);

      // Trigger refresh for Transactions page
      triggerRefresh();
      
      // Reset form
      reset();
      setParseResult(null);

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create transaction:", error);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-130 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-white text-lg font-bold">+</span>
            </div>
            <span className="text-xl">Quick Add Expense</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            Type naturally like "Coffee 50k today" and we'll parse it for you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2 flex-1 overflow-y-auto">
          {/* Smart Input */}
          <NlpHighlightInput
            value={inputText}
            onChange={(value) => setValue("inputText", value)}
            parseResult={parseResult}
            onParseResultChange={setParseResult}
            onClearDate={handleClearDate}
            onClearAmount={handleClearAmount}
            placeholder='e.g., "Dinner 500k yesterday with friends"'
          />

          {/* Manual Controls */}
          <div className="grid grid-cols-2 gap-4">
            <CategorySelector
              categories={categories}
              selectedCategoryId={categoryId || ""}
              onCategorySelect={(id) => setValue("categoryId", id)}
              onCategoryCreated={handleCategoryCreated}
            />
            <WalletSelector
              wallets={wallets}
              selectedWalletId={walletId || ""}
              onWalletSelect={(id) => setValue("walletId", id)}
              onWalletCreated={handleWalletCreated}
            />
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
              onChange={e => setValue("date", new Date(e.target.value))}
              className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>

          {/* Split Bill Section */}
          <SplitBillSection
            enabled={isSplitBill}
            onToggle={(enabled) => setValue("isSplitBill", enabled)}
            groups={groups}
            selectedGroupId={groupId || ""}
            onGroupSelect={handleGroupSelect}
            splitType={splitType}
            onSplitTypeChange={(type) => setValue("splitType", type)}
            selectedMemberIds={selectedMemberIds}
            onMemberToggle={toggleMember}
            exactAmounts={exactAmounts}
            onExactAmountChange={handleExactAmountChange}
            totalAmount={finalAmount}
            currentUserId={user?.id}
          />

          {/* Summary */}
          <TransactionSummary amount={finalAmount} />
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={getIsDisabled()}
            className="px-6 bg-linear-to-r from-primary to-purple-500 shadow-lg shadow-primary/25"
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
