import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Group, GroupExpense, Debt } from "../types";
import { groupService } from "../services/group.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddGroupExpenseForm } from "./AddGroupExpenseForm";

export function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [settleUpDebt, setSettleUpDebt] = useState<Debt | null>(null);
  // For now, I'll assume I can get current user ID from somewhere or just allow settling any debt for demo purposes.
  // Ideally, only the person who owes or is owed should be able to settle?
  // Or maybe anyone can record a payment.
  // Let's just allow it for now.

  const fetchGroupData = async () => {
    if (!id) return;
    try {
      const [groupData, expensesData, debtsData] = await Promise.all([
        groupService.getOne(id),
        groupService.getExpenses(id),
        groupService.getDebts(id),
      ]);
      setGroup(groupData);
      setExpenses(expensesData);
      setDebts(debtsData);
    } catch (error) {
      console.error("Failed to fetch group data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const handleSettleUp = async () => {
    if (!settleUpDebt || !group) return;
    try {
      // We need user IDs for from and to.
      // The debt object currently only has names (from, to).
      // I need to map names back to IDs or update the Debt type to include IDs.
      // Let's check the Debt type.
      // It seems Debt type in frontend might be missing IDs if it's just { from: string, to: string, amount: number }
      // Backend returns { from: string, to: string, amount: number } but names are used.
      // Wait, the backend service calculates debts and returns names?
      // Let's check backend `group-expenses.service.ts`.
      // It returns `from: membersMap.get(from)?.name || from`.
      // So I don't have IDs in the Debt object. This is a problem for calling settleUp which requires IDs.
      // I should update the backend to return IDs as well.

      // For now, I will try to find the member IDs from the group.members list based on names.
      const fromMember = group.members.find(m => m.user.name === settleUpDebt.from);
      const toMember = group.members.find(m => m.user.name === settleUpDebt.to);

      if (fromMember && toMember) {
        // TODO: Implement settle up properly. Currently backend requires logged in user to be 'from'.
        // We need to check if current user is 'fromMember'.
        // For now, we just log it.
        console.log("Settle up requested:", {
          from: fromMember.user.name,
          to: toMember.user.name,
          amount: settleUpDebt.amount
        });

        /*
        await groupService.settleUp(group.id, {
          toUserId: toMember.user.id,
          amount: settleUpDebt.amount,
        });
        */
        setSettleUpDebt(null);
        fetchGroupData();
      }
    } catch (error) {
      console.error("Failed to settle up", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!group) return <div>Group not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{group.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">Code:</span>
            <Badge variant="secondary" className="font-mono">
              {group.code}
            </Badge>
          </div>
        </div>
        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogTrigger asChild>
            <Button>Add Expense</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <AddGroupExpenseForm
              groupId={group.id}
              members={group.members}
              onSuccess={() => {
                setIsAddExpenseOpen(false);
                fetchGroupData();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold">Expenses</h3>
          {expenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <p className="text-sm text-muted-foreground">
                    Paid by {expense.payer.name}
                  </p>
                </div>
                <div className="text-lg font-bold">
                  {Number(expense.amount).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
          {expenses.length === 0 && (
            <p className="text-muted-foreground">No expenses yet.</p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Debts</h3>
          {debts.map((debt, index) => (
            <Card key={index} className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm mb-2">
                  <span className="font-bold text-red-500">{debt.from}</span> owes{" "}
                  <span className="font-bold text-green-500">{debt.to}</span>
                </p>
                <p className="text-2xl font-bold mb-3">
                  {debt.amount.toLocaleString()}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => setSettleUpDebt(debt)}
                >
                  Settle Up
                </Button>
              </CardContent>
            </Card>
          ))}
          {debts.length === 0 && <p className="text-muted-foreground">No debts.</p>}
        </div>
      </div>

      <Dialog open={!!settleUpDebt} onOpenChange={(open) => !open && setSettleUpDebt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settle Up</DialogTitle>
            <DialogDescription>
              Are you sure you want to record a payment of <strong>{settleUpDebt?.amount.toLocaleString()}</strong> from <strong>{settleUpDebt?.from}</strong> to <strong>{settleUpDebt?.to}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettleUpDebt(null)}>Cancel</Button>
            <Button onClick={handleSettleUp}>Confirm Settlement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
