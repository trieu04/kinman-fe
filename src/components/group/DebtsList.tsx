import type { Debt } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DebtsListProps {
  debts: Debt[];
  onSettleUp: (debt: Debt) => void;
}

export function DebtsList({ debts, onSettleUp }: DebtsListProps) {
  const getName = (user: string | any) => {
    if (typeof user === 'string') return user;
    return user?.name || user?.email || '?';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Công nợ</h3>
      {debts.map((debt, index) => (
        <Card key={index} className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm mb-2">
              <span className="font-bold text-red-500">{getName(debt.from)}</span> nợ {" "}
              <span className="font-bold text-green-500">{getName(debt.to)}</span>
            </p>
            <p className="text-2xl font-bold mb-3">
              {debt.amount.toLocaleString()}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => onSettleUp(debt)}
            >
              Ghi nhận thanh toán
            </Button>
          </CardContent>
        </Card>
      ))}
      {debts.length === 0 && (
        <p className="text-muted-foreground">Không có công nợ.</p>
      )}
    </div>
  );
}
