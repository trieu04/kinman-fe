import * as React from "react";
import { Calculator } from "lucide-react";
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
import { SplitMethodSelector } from "./SplitMethodSelector";
import { MemberSplitList } from "./MemberSplitList";
import { SplitBillSummary } from "./SplitBillSummary";
import { splitBillFormSchema, type SplitBillFormValues } from "../../lib/validationSchemas";
import groupService from "../../services/groupService";
import type { GroupMember, ExpenseSplit } from "../../types";

interface SplitBillFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  members: GroupMember[];
  onSuccess?: () => void;
}

export function SplitBillForm({ open, onOpenChange, groupId, members, onSuccess }: SplitBillFormProps) {
  // React Hook Form
  const form = useForm<SplitBillFormValues>({
    resolver: zodResolver(splitBillFormSchema),
    defaultValues: {
      description: "",
      amount: 0,
      splitType: "equal",
      selectedMemberIds: [],
      exactAmounts: {},
      paidBy: "",
    },
  });

  const { watch, setValue, handleSubmit: hookFormSubmit, reset, formState: { isSubmitting } } = form;

  // Watch form values
  const description = watch("description");
  const amount = watch("amount");
  const splitType = watch("splitType");
  const selectedMemberIds = watch("selectedMemberIds");
  const exactAmounts = watch("exactAmounts");
  const paidBy = watch("paidBy");

  // Auto-select all members
  React.useEffect(() => {
    if (members.length > 0) {
      const memberIds = members
        .filter((m) => m.userId || m.user?.id)
        .map((m) => m.userId || m.user?.id || "");
      setValue("selectedMemberIds", memberIds);

      // Set first member as default payer if not already set
      if (!paidBy && memberIds.length > 0) {
        setValue("paidBy", memberIds[0]);
      }
    }
  }, [members, paidBy, setValue]);

  const totalAmount = amount || 0;
  const selectedCount = selectedMemberIds.length;

  const exactTotal = Object.values(exactAmounts).reduce(
    (sum, val) => sum + (Number.parseFloat(val) || 0),
    0
  );
  const exactRemaining = totalAmount - exactTotal;

  const toggleMember = (userId: string) => {
    const currentMembers = selectedMemberIds;
    const newMembers = currentMembers.includes(userId)
      ? currentMembers.filter((id) => id !== userId)
      : [...currentMembers, userId];
    setValue("selectedMemberIds", newMembers);
  };

  const handleExactAmountChange = (userId: string, value: string) => {
    setValue("exactAmounts", { ...exactAmounts, [userId]: value });
  };

  const handleSubmit = hookFormSubmit(async (data) => {
    if (!data.description.trim() || data.amount <= 0 || data.selectedMemberIds.length === 0) {
      return;
    }

    try {
      // Ensure payer is always included in splits for equal split
      let membersToSplit = data.selectedMemberIds.filter(
        (id) => id && id.trim() !== ""
      );
      if (data.splitType === "equal" && data.paidBy && !membersToSplit.includes(data.paidBy)) {
        membersToSplit = [...membersToSplit, data.paidBy];
      }

      const splits: ExpenseSplit[] = membersToSplit.map((userId) => ({
        userId,
        amount:
          data.splitType === "equal"
            ? data.amount / membersToSplit.length
            : Number.parseFloat(data.exactAmounts[userId]) || 0,
      }));

      await groupService.addExpense(groupId, {
        amount: data.amount,
        description: data.description.trim(),
        splitType: data.splitType,
        splits,
        paidBy: data.paidBy || undefined,
      });

      // Reset form
      reset();

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to add expense:", error);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Split Bill
          </DialogTitle>
          <DialogDescription>
            Add a shared expense and split it among members
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          {/* Paid By */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Paid By</label>
            <select
              value={paidBy}
              onChange={(e) => setValue("paidBy", e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-border bg-card text-sm"
            >
              <option value="">Select who paid...</option>
              {members.map((member) => {
                const memberId = member.userId || member.user?.id || "";
                return (
                  <option key={member.id} value={memberId}>
                    {member.user?.name || member.user?.username || "Unknown"}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setValue("description", e.target.value)}
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
              value={amount || ""}
              onChange={(e) =>
                setValue("amount", Number.parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              className="w-full h-10 px-3 rounded-md border border-border bg-card text-sm"
            />
          </div>

          {/* Split Type Toggle */}
          <SplitMethodSelector
            value={splitType}
            onChange={(type) => setValue("splitType", type)}
          />

          {/* Member Selection / Split Input */}
          <MemberSplitList
            members={members}
            splitType={splitType}
            selectedMemberIds={selectedMemberIds}
            exactAmounts={exactAmounts}
            totalAmount={totalAmount}
            onMemberToggle={toggleMember}
            onExactAmountChange={handleExactAmountChange}
          />

          {/* Summary */}
          <SplitBillSummary
            totalAmount={totalAmount}
            splitType={splitType}
            selectedCount={selectedCount}
            exactTotal={exactTotal}
            exactRemaining={exactRemaining}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !description.trim() ||
              !paidBy ||
              totalAmount <= 0 ||
              selectedMemberIds.length === 0 ||
              (splitType === "exact" && Math.abs(exactRemaining) > 0.01)
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
