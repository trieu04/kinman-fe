import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Copy, Check, Users, Receipt, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { SplitBillForm } from "../components/group/SplitBillForm";
import groupService from "../services/groupService";
import type { Group, GroupExpense, Debt } from "../types";

export function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = React.useState<Group | null>(null);
  const [expenses, setExpenses] = React.useState<GroupExpense[]>([]);
  const [debts, setDebts] = React.useState<Debt[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showAddExpense, setShowAddExpense] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const fetchGroupData = async () => {
    if (!id)
      return;
    setIsLoading(true);
    try {
      const [groupData, expensesData, debtsData] = await Promise.all([
        groupService.getById(id),
        groupService.getExpenses(id),
        groupService.getDebts(id),
      ]);
      setGroup(groupData);
      setExpenses(expensesData);
      setDebts(debtsData);
    }
    catch (error) {
      console.error("Failed to fetch group data:", error);
    }
    finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchGroupData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCopyCode = async () => {
    if (group?.code) {
      await navigator.clipboard.writeText(group.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSettleUp = async (debt: Debt) => {
    if (!id)
      return;
    try {
      await groupService.settleUp(id, { toUserId: debt.to.id, amount: debt.amount });
      await fetchGroupData(); // Refresh debts
    }
    catch (error) {
      console.error("Failed to settle up:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Group not found</p>
        <Button className="mt-4" onClick={() => navigate("/groups")}>
          Back to Groups
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Button variant="ghost" size="icon" onClick={() => navigate("/groups")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {group.members?.length || 0}
              {" "}
              members
            </span>
            <span>•</span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors"
            >
              Code:
              {" "}
              <span className="font-mono">{group.code}</span>
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
        <Button onClick={() => setShowAddExpense(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
        >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {group.members?.map(member => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                  {member.user?.name?.charAt(0)?.toUpperCase() || member.user?.username?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-medium">{member.user?.name || member.user?.username}</p>
                  <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        </motion.div>

        {/* Debts */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
        >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Balances
            </CardTitle>
            <CardDescription>Who owes whom</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {debts.length > 0
              ? (
                  debts.map((debt, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{debt.from.name || debt.from.username}</span>
                          <span className="text-muted-foreground"> owes </span>
                          <span className="font-medium">{debt.to.name || debt.to.username}</span>
                        </p>
                        <p className="text-lg font-bold text-destructive">
                          {formatCurrency(debt.amount)}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleSettleUp(debt)}>
                        Settle
                      </Button>
                    </div>
                  ))
                )
              : (
                  <p className="text-center py-4 text-muted-foreground">
                    All settled up! 🎉
                  </p>
                )}
          </CardContent>
        </Card>
        </motion.div>

        {/* Expenses */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
        >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Expenses
            </CardTitle>
            <CardDescription>
              {expenses.length}
              {" "}
              total expenses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
            {expenses.length > 0
              ? (
                  expenses.map((expense, idx) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: idx % 2 === 0 ? -15 : 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                    >
                    <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{expense.description}</p>
                        <Badge variant={expense.splitType === "equal" ? "secondary" : "outline"}>
                          {expense.splitType}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          Paid by
                          {" "}
                          {expense.paidBy?.name || expense.paidBy?.username}
                        </p>
                        <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                      </div>
                    </div>
                    </motion.div>
                  ))
                )
              : (
                  <p className="text-center py-4 text-muted-foreground">
                    No expenses yet
                  </p>
                )}
          </CardContent>
        </Card>
        </motion.div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && group && (
        <SplitBillForm
          open={showAddExpense}
          onOpenChange={setShowAddExpense}
          groupId={group.id}
          members={group.members || []}
          onSuccess={fetchGroupData}
        />
      )}
    </div>
  );
}

export default GroupDetail;
