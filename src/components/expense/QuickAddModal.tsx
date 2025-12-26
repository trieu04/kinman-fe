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
import type { NlpParseResult, CreateTransactionDto, Group, TransactionSplit, SplitType } from "../../types";
import groupService from "../../services/groupService";
import { useAuthStore } from "../../stores/authStore";

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
  const { user } = useAuthStore();

  // Split Bill state
  const [isSplitBill, setIsSplitBill] = React.useState(false);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = React.useState<string>("");
  const [splitType, setSplitType] = React.useState<SplitType>("equal" as SplitType);
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([]);
  const [exactAmounts, setExactAmounts] = React.useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // New category/wallet creation
  const [showNewCategory, setShowNewCategory] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [showNewWallet, setShowNewWallet] = React.useState(false);
  const [newWalletName, setNewWalletName] = React.useState("");

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
  const finalAmount = customAmount ?? parseResult?.amount ?? 0;
  const finalDate = customDate ?? (parseResult?.entities.find(e => e.type === "date")?.parsedValue as Date) ?? new Date();
  const finalNote = parseResult?.description || inputText;

  const handleClearDate = () => {
    setCustomDate(new Date()); // Reset to today
  };

  const handleClearAmount = () => {
    setCustomAmount(null);
  };

  // Handle group selection
  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    const group = groups.find(g => g.id === groupId);
    if (group) {
      // Auto-select all members
      const memberIds = group.members.map(m => m.userId || m.user?.id || "");
      setSelectedMemberIds(memberIds);
      setExactAmounts({});
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Default categories
  const DEFAULT_CATEGORIES = [
    { name: "Food & Dining", icon: "🍔" },
    { name: "Transportation", icon: "🚗" },
    { name: "Shopping", icon: "🛍️" },
    { name: "Entertainment", icon: "🎬" },
    { name: "Bills & Utilities", icon: "💡" },
  ];

  const handleCreateDefaultCategory = async (name: string) => {
    setIsSubmitting(true);
    try {
      const category = await categoryService.create({ name });
      addCategory(category);
      setSelectedCategoryId(category.id);
    } catch (error) {
      console.error("Failed to create default category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async (e?: React.FormEvent) => {
    e?.preventDefault(); // Prevent bubbling
    if (!newCategoryName.trim()) return;
    setIsSubmitting(true);
    try {
      const category = await categoryService.create({ name: newCategoryName.trim() });
      addCategory(category);
      setSelectedCategoryId(category.id);
      setShowNewCategory(false);
      setNewCategoryName("");
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateWallet = async (e?: React.FormEvent) => {
    e?.preventDefault(); // Prevent bubbling
    if (!newWalletName.trim()) return;
    setIsSubmitting(true);
    try {
      const wallet = await walletService.create({
        name: newWalletName.trim(),
        balance: 0,
        currency: "VND",
      });
      addWallet(wallet);
      setSelectedWalletId(wallet.id);
      setShowNewWallet(false);
      setNewWalletName("");
    } catch (error) {
      console.error("Failed to create wallet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const exactTotal = Object.values(exactAmounts).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );
  const exactRemaining = finalAmount - exactTotal;

  const getIsDisabled = () => {
    // Category and Wallet are now optional
    if (isSubmitting || finalAmount <= 0) return true;
    if (isSplitBill && selectedGroupId) {
      if (splitType === "equal" && selectedMemberIds.length === 0) return true;
      if (splitType === "exact" && Math.abs(exactRemaining) > 0.99) return true;
    }
    return false;
  };

  const handleSubmit = async () => {
    if (!finalAmount || finalAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const dto: CreateTransactionDto = {
        amount: Math.abs(finalAmount),
        date: finalDate.toISOString(),
        note: finalNote,
        // Pass undefined if empty string to match optionality
        categoryId: selectedCategoryId || undefined,
        walletId: selectedWalletId || undefined,
      };

      if (isSplitBill && selectedGroupId) {
        const group = groups.find((g) => g.id === selectedGroupId);
        if (group) {
          let splits: TransactionSplit[] = [];

          if (splitType === "equal") {
            const selectedMembers = selectedMemberIds.filter((id) => id);
            if (selectedMembers.length > 0) {
              const totalAmountNum = Math.abs(finalAmount);
              const share = Math.floor(
                totalAmountNum / selectedMembers.length
              );
              const remainder = totalAmountNum % selectedMembers.length;

              splits = selectedMembers.map((userId, index) => ({
                userId,
                amount: index === 0 ? share + remainder : share,
              }));
            }
          } else {
            // Exact split
            splits = Object.entries(exactAmounts)
              .filter(([_, amount]) => Number(amount) > 0)
              .map(([userId, amount]) => ({
                userId,
                amount: Number(amount),
              }));
          }

          if (splits.length > 0) {
            dto.groupId = selectedGroupId;
            dto.splits = splits;
          }
        }
      }

      await transactionService.create(dto);

      // Reset form
      setInputText("");
      setParseResult(null);
      setSelectedCategoryId("");
      setSelectedWalletId("");
      setCustomDate(null);
      setCustomAmount(null);
      setIsSplitBill(false);
      setSelectedGroupId("");
      setSelectedMemberIds([]);
      setExactAmounts({});
      setSplitType("equal" as SplitType);

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create transaction:", error);
    } finally {
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
                <span className="text-xs text-muted-foreground font-normal">
                  (Optional)
                </span>
              </label>
              <div className="h-10"> {/* Fixed height container to prevent layout shift */}
                {showNewCategory ? (
                  <div className="flex gap-2 h-full">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCreateCategory(e);
                        }
                      }}
                      placeholder="Category name"
                      className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleCreateCategory} className="h-10 px-3">
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowNewCategory(false)}
                      className="h-10 w-10 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={selectedCategoryId}
                    onValueChange={setSelectedCategoryId}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length === 0 && (
                        <div className="p-2">
                          <p className="text-xs text-muted-foreground mb-2 px-2">Suggestions:</p>
                          {DEFAULT_CATEGORIES.map((defCat) => (
                            <button
                              key={defCat.name}
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer text-left"
                              onClick={() => handleCreateDefaultCategory(defCat.name)}
                            >
                              <span>{defCat.icon}</span>
                              <span>{defCat.name}</span>
                            </button>
                          ))}
                          <div className="h-px bg-border my-2" />
                        </div>
                      )}
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowNewCategory(true);
                        }}
                        className="w-full px-2 py-1.5 text-sm text-left text-primary hover:bg-accent cursor-pointer flex items-center gap-2"
                      >
                        <span className="text-lg leading-none">+</span> Create new category
                      </button>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Wallet Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                Wallet
                <span className="text-xs text-muted-foreground font-normal">
                  (Optional)
                </span>
              </label>
              <div className="h-10">
                {showNewWallet ? (
                  <div className="flex gap-2 h-full">
                    <input
                      type="text"
                      value={newWalletName}
                      onChange={(e) => setNewWalletName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCreateWallet(e);
                        }
                      }}
                      placeholder="Wallet name"
                      className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleCreateWallet} className="h-10 px-3">
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowNewWallet(false)}
                      className="h-10 w-10 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={selectedWalletId}
                    onValueChange={setSelectedWalletId}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.icon || "💳"} {wallet.name}
                        </SelectItem>
                      ))}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowNewWallet(true);
                        }}
                        className="w-full px-2 py-1.5 text-sm text-left text-primary hover:bg-accent cursor-pointer flex items-center gap-2"
                      >
                        <span className="text-lg leading-none">+</span> Create new wallet
                      </button>
                    </SelectContent>
                  </Select>
                )}
              </div>
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
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Group</label>
                <Select value={selectedGroupId} onValueChange={handleGroupSelect}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select a group to split with" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                        <span className="ml-2 text-muted-foreground text-xs">
                          ({group.members.length} members)
                        </span>
                      </SelectItem>
                    ))}
                    {groups.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No groups found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedGroupId && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Split Method</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSplitType("equal" as SplitType)}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${splitType === "equal"
                          ? "bg-primary text-white"
                          : "bg-background border border-border text-muted-foreground hover:bg-accent"
                          }`}
                      >
                        Equal Split
                      </button>
                      <button
                        type="button"
                        onClick={() => setSplitType("exact" as SplitType)}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${splitType === "exact"
                          ? "bg-primary text-white"
                          : "bg-background border border-border text-muted-foreground hover:bg-accent"
                          }`}
                      >
                        Exact Amount
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center justify-between">
                      <span>Members</span>
                      {splitType === "equal" && (
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(selectedMemberIds.length > 0 ? Math.floor(finalAmount / selectedMemberIds.length) : 0)} / person
                        </span>
                      )}
                    </label>
                    <div className="max-h-[150px] overflow-y-auto space-y-2 pr-1">
                      {groups.find(g => g.id === selectedGroupId)?.members.map(member => {
                        const memberId = member.userId || member.user?.id || "";
                        const isSelected = selectedMemberIds.includes(memberId);

                        return (
                          <div
                            key={member.id}
                            className={`flex items-center justify-between p-2 rounded-lg border text-sm transition-colors ${isSelected && splitType === "equal" ? "border-primary/50 bg-primary/5" : "border-border bg-background"
                              }`}
                            onClick={() => splitType === "equal" && toggleMember(memberId)}
                          >
                            <div className="flex items-center gap-2">
                              {splitType === "equal" && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleMember(memberId)}
                                  className="rounded border-gray-300 text-primary focus:ring-primary"
                                  onClick={e => e.stopPropagation()}
                                />
                              )}
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                {member.user?.name?.charAt(0).toUpperCase() || member.user?.username?.charAt(0).toUpperCase()}
                              </div>
                              <span className={memberId === user?.id ? "font-semibold" : ""}>
                                {member.user?.name || member.user?.username}
                                {memberId === user?.id && " (You)"}
                              </span>
                            </div>

                            {splitType === "exact" && (
                              <input
                                type="number"
                                value={exactAmounts[memberId] || ""}
                                onChange={(e) => {
                                  setExactAmounts(prev => ({ ...prev, [memberId]: e.target.value }));
                                  if (!selectedMemberIds.includes(memberId) && e.target.value) {
                                    toggleMember(memberId);
                                  }
                                }}
                                onClick={e => e.stopPropagation()}
                                placeholder="0"
                                className="w-20 h-7 px-2 text-right rounded-md border border-border bg-background text-xs"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {splitType === "exact" && (
                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-muted-foreground">Assigned: {formatCurrency(exactTotal)}</span>
                      <span className={
                        Math.abs(exactRemaining) < 1
                          ? "text-green-600 font-medium"
                          : "text-red-500 font-medium"
                      }>
                        Remaining: {formatCurrency(exactRemaining)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Summary */}
          {finalAmount > 0 && (
            <div className="p-5 rounded-xl bg-linear-to-r from-primary/10 to-purple-500/10 border border-primary/20">
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
