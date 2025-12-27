import type { GroupExpense } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface ExpensesListProps {
  expenses: GroupExpense[];
}

export function ExpensesList({ expenses }: ExpensesListProps) {
  return (
    <div className="md:col-span-2 space-y-4">
      <h3 className="text-xl font-semibold">Chi tiêu</h3>
      {expenses.map((expense) => (
        <Card key={expense.id}>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{expense.description}</p>
              <p className="text-sm text-muted-foreground">
                Người trả: {expense.payer.name}
              </p>
            </div>
            <div className="text-lg font-bold">
              {Number(expense.amount).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
      {expenses.length === 0 && (
        <p className="text-muted-foreground">Chưa có chi tiêu nào.</p>
      )}
    </div>
  );
}
