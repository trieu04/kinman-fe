import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { groupService } from "../services/group.service";
import type { GroupMember } from "../types";

interface AddGroupExpenseFormProps {
  groupId: string;
  members: GroupMember[];
  onSuccess: () => void;
}

export function AddGroupExpenseForm({
  groupId,
  members,
  onSuccess,
}: AddGroupExpenseFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerId || !amount || !description) return;

    setIsLoading(true);
    try {
      // Simple equal split logic
      const amountNum = Number(amount);
      // Round to 2 decimal places to avoid floating point issues
      const splitAmount = Math.round((amountNum / members.length) * 100) / 100;

      // Adjust the last person's split to ensure total matches exactly
      const totalSplit = splitAmount * members.length;
      const remainder = Math.round((amountNum - totalSplit) * 100) / 100;

      const splits = members.map((member, index) => ({
        userId: member.user.id,
        amount: index === members.length - 1 ? splitAmount + remainder : splitAmount,
      }));

      await groupService.addExpense(groupId, {
        description,
        amount: amountNum,
        payerId,
        splitType: "EXACT",
        splits,
      });
      onSuccess();
      setDescription("");
      setAmount("");
      setPayerId("");
    } catch (error) {
      console.error("Failed to add expense", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Dinner, Taxi, etc."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="payer">Paid By</Label>
        <Select value={payerId} onValueChange={setPayerId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select Payer" />
          </SelectTrigger>
          <SelectContent>
            {members.map((member) => (
              <SelectItem key={member.user.id} value={member.user.id}>
                {member.user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Expense"}
      </Button>
    </form>
  );
}
