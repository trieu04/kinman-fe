import * as React from "react";
import { Calculator, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import groupService from "../../services/groupService";
import type { GroupMember, SplitType, ExpenseSplit } from "../../types";

interface SplitBillFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  members: GroupMember[];
  onSuccess?: () => void;
}

export function SplitBillForm({ open, onOpenChange, groupId, members, onSuccess }: SplitBillFormProps) {
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [splitType, setSplitType] = React.useState<SplitType>("EQUAL" as SplitType);
  const [selectedMembers, setSelectedMembers] = React.useState<string[]>([]);
  const [exactAmounts, setExactAmounts] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Auto-select all members
  React.useEffect(() => {
    if (members.length > 0) {
      setSelectedMembers(members.map(m => m.userId));
    }
  }, [members]);

  const totalAmount = Number.parseFloat(amount) || 0;
  const selectedCount = selectedMembers.length;
  const equalShare = selectedCount > 0 ? totalAmount / selectedCount : 0;

  const exactTotal = Object.values(exactAmounts).reduce((sum, val) => sum + (Number.parseFloat(val) || 0), 0);
  const exactRemaining = totalAmount - exactTotal;

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSubmit = async () => {
    if (!description.trim() || totalAmount <= 0 || selectedMembers.length === 0)
      return;

    setIsSubmitting(true);
    try {
      const splits: ExpenseSplit[] = selectedMembers.map(userId => ({
        userId,
        amount: splitType === "EQUAL"
          ? equalShare
          : Number.parseFloat(exactAmounts[userId]) || 0,
      }));

      await groupService.addExpense(groupId, {
        amount: totalAmount,
        description: description.trim(),
        splitType,
        splits,
      });

      // Reset form
      setDescription("");
      setAmount("");
      setSplitType("EQUAL" as SplitType);
      setExactAmounts({});

      onOpenChange(false);
      onSuccess?.();
    }
    catch (error) {
      console.error("Failed to add expense:", error);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Split Bill
          </DialogTitle>
          <DialogDescription>
            Add a shared expense and split it among members
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., Dinner at restaurant"
              className="w-full h-10 px-3 rounded-md border border-border bg-card text-sm"
              autoFocus
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Total Amount</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="w-full h-10 px-3 rounded-md border border-border bg-card text-sm"
            />
          </div>

          {/* Split Type Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Split Method</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSplitType("EQUAL" as SplitType)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer ${splitType === "EQUAL"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                Equal Split
              </button>
              <button
                type="button"
                onClick={() => setSplitType("EXACT" as SplitType)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer ${splitType === "EXACT"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                Exact Amount
              </button>
            </div>
          </div>

          {/* Member Selection / Split Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Users className="w-4 h-4" />
              Split Among (
              {selectedMembers.length}
              {" "}
              selected)
            </label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {members.map((member) => {
                const isSelected = selectedMembers.includes(member.userId);
                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                    }`}
                    onClick={() => splitType === "EQUAL" && toggleMember(member.userId)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMember(member.userId)}
                        className="w-4 h-4 cursor-pointer"
                        onClick={e => e.stopPropagation()}
                      />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                        {member.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span className="font-medium">{member.user?.name || member.user?.username}</span>
                    </div>

                    {splitType === "EQUAL"
                      ? (
                          <span className={`font-semibold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                            {isSelected && totalAmount > 0 ? formatCurrency(equalShare) : "-"}
                          </span>
                        )
                      : (
                          <input
                            type="number"
                            value={exactAmounts[member.userId] || ""}
                            onChange={(e) => {
                              setExactAmounts(prev => ({ ...prev, [member.userId]: e.target.value }));
                              if (!selectedMembers.includes(member.userId) && e.target.value) {
                                setSelectedMembers(prev => [...prev, member.userId]);
                              }
                            }}
                            onClick={e => e.stopPropagation()}
                            placeholder="0"
                            className="w-24 h-8 px-2 text-right rounded-md border border-border bg-card text-sm"
                          />
                        )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exact Amount Summary */}
          {splitType === "EXACT" && (
            <div className={`p-3 rounded-lg ${exactRemaining === 0 ? "bg-success/10" : "bg-warning/10"}`}>
              <div className="flex justify-between text-sm">
                <span>Assigned:</span>
                <span className="font-medium">{formatCurrency(exactTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Remaining:</span>
                <span className={`font-medium ${exactRemaining !== 0 ? "text-warning" : "text-success"}`}>
                  {formatCurrency(exactRemaining)}
                </span>
              </div>
            </div>
          )}

          {/* Total Summary */}
          {totalAmount > 0 && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
              </div>
              {splitType === "EQUAL" && selectedCount > 0 && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    Per person (
                    {selectedCount}
                    {" "}
                    people)
                  </span>
                  <span className="text-sm font-medium">{formatCurrency(equalShare)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting
              || !description.trim()
              || totalAmount <= 0
              || selectedMembers.length === 0
              || (splitType === "EXACT" && Math.abs(exactRemaining) > 0.01)
            }
          >
            {isSubmitting ? "Adding..." : "Add Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SplitBillForm;
