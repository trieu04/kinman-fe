import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Copy, Check, Users, Receipt, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SplitBillForm } from "./SplitBillForm";
import groupService from "@/services/groupService";
import { realtimeService } from "@/services/realtimeService";
import { useRealtimeEvent } from "@/hooks/useRealtime";
import type { Group, GroupExpense, Debt } from "@/types";

export function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = React.useState<Group | null>(null);
  const [expenses, setExpenses] = React.useState<GroupExpense[]>([]);
  const [debts, setDebts] = React.useState<Debt[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showAddExpense, setShowAddExpense] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const fetchGroupData = React.useCallback(async (options?: { silent?: boolean }) => {
    if (!id) return;
    const silent = options?.silent;
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const [groupData, expensesData, debtsData] = await Promise.all([
        groupService.getById(id),
        groupService.getExpenses(id),
        groupService.getDebts(id),
      ]);
      setGroup(groupData);
      setExpenses(expensesData);
      setDebts(debtsData);
    } catch (error) {
      console.error("Failed to fetch group data:", error);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [id]);

  React.useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  React.useEffect(() => {
    if (!id) return;
    realtimeService.subscribeToGroup(id);
    return () => realtimeService.unsubscribeFromGroup(id);
  }, [id]);

  const isSameGroup = (payload: any) => {
    const groupIdFromPayload = payload?.groupId ?? payload?.data?.groupId ?? payload?.id ?? payload?.data?.id;
    return groupIdFromPayload === id;
  };

  useRealtimeEvent("realtime:expense-added", (data) => {
    if (isSameGroup(data)) fetchGroupData({ silent: true });
  });

  useRealtimeEvent("realtime:expense-updated", (data) => {
    if (isSameGroup(data)) fetchGroupData({ silent: true });
  });

  useRealtimeEvent("realtime:expense-deleted", (data) => {
    if (isSameGroup(data)) fetchGroupData({ silent: true });
  });

  useRealtimeEvent("realtime:debt-settled", (data) => {
    if (isSameGroup(data)) fetchGroupData({ silent: true });
  });

  useRealtimeEvent("realtime:group-updated", (data) => {
    if (isSameGroup(data)) fetchGroupData({ silent: true });
  });

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
    
    const fromName = typeof debt.from === 'string' ? debt.from : (debt.from?.name || debt.from?.email || '?');
    const toName = typeof debt.to === 'string' ? debt.to : (debt.to?.name || debt.to?.email || '?');
    const fromId = typeof debt.from === 'string' ? debt.from : debt.from?.id;
    const toId = typeof debt.to === 'string' ? debt.to : debt.to?.id;
    
    const confirmed = window.confirm(
      `Confirm that ${fromName} has paid ${formatCurrency(debt.amount)} to ${toName}?`
    );
    
    if (!confirmed) return;
    
    try {
      await groupService.settleUp(id, { fromUserId: fromId, toUserId: toId, amount: debt.amount });
      await fetchGroupData(); // Refresh debts
    }
    catch (error) {
      console.error("Failed to settle up:", error);
      alert("Failed to record settlement. Please try again.");
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
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-y-auto flex-1 max-h-[500px]">
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
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Balances
            </CardTitle>
            <CardDescription>Who owes whom</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 overflow-y-auto flex-1 max-h-[500px]">
            {debts.length > 0
              ? (
                  debts.map((debt, i) => {
                    const fromName = typeof debt.from === 'string' ? debt.from : (debt.from?.name || debt.from?.email || '?');
                    const toName = typeof debt.to === 'string' ? debt.to : (debt.to?.name || debt.to?.email || '?');
                    return (
                    <div key={i} className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm font-medium">
                              {fromName.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <span className="text-sm text-muted-foreground">→</span>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-medium">
                              {toName.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed">
                            <span className="font-semibold text-foreground">{fromName}</span>
                            <span className="text-muted-foreground"> owes </span>
                            <span className="font-semibold text-foreground">{toName}</span>
                          </p>
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                            {formatCurrency(debt.amount)}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          className="shrink-0 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleSettleUp(debt)}
                        >
                          Settle
                        </Button>
                      </div>
                    </div>
                    );
                  })
                )
              : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <span className="text-3xl">🎉</span>
                    </div>
                    <p className="font-medium text-foreground">All settled up!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      No outstanding debts
                    </p>
                  </div>
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
        <Card className="h-full flex flex-col">
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
          <CardContent className="space-y-3 overflow-y-auto flex-1 max-h-[500px]">
            {expenses.length > 0
              ? (
                  expenses.map((expense, idx) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: idx % 2 === 0 ? -15 : 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                    >
                    <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">{expense.description}</p>
                        <p className="font-bold text-lg">{formatCurrency(expense.amount)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={expense.splitType === "equal" ? "default" : "secondary"} className="text-xs">
                            {expense.splitType === "equal" ? "Equal Split" : "Exact Amount"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs text-muted-foreground">
                            Paid by {expense.payer?.name || expense.payer?.username}
                          </p>
                        </div>
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
