
interface TransactionSummaryProps {
    amount: number;
}

export function TransactionSummary({ amount }: TransactionSummaryProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (amount <= 0) {
        return null;
    }

    return (
        <div className="p-5 rounded-xl bg-linear-to-r from-primary/10 to-purple-500/10 border border-primary/20">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                    Total Amount
                </span>
                <span className="text-2xl font-bold text-destructive stat-number">
                    -{formatCurrency(amount)}
                </span>
            </div>
        </div>
    );
}
