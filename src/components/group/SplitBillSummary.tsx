
interface SplitBillSummaryProps {
    totalAmount: number;
    splitType: "equal" | "exact";
    selectedCount: number;
    exactTotal: number;
    exactRemaining: number;
}

export function SplitBillSummary({
    totalAmount,
    splitType,
    selectedCount,
    exactTotal,
    exactRemaining,
}: SplitBillSummaryProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value);
    };

    const equalShare = selectedCount > 0 ? totalAmount / selectedCount : 0;

    return (
        <>
            {/* Exact Amount Summary */}
            {splitType === "exact" && (
                <div
                    className={`p-3 rounded-lg ${exactRemaining === 0 ? "bg-success/10" : "bg-warning/10"
                        }`}
                >
                    <div className="flex justify-between text-sm">
                        <span>Assigned:</span>
                        <span className="font-medium">{formatCurrency(exactTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Remaining:</span>
                        <span
                            className={`font-medium ${exactRemaining !== 0 ? "text-warning" : "text-success"
                                }`}
                        >
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
                        <span className="text-xl font-bold">
                            {formatCurrency(totalAmount)}
                        </span>
                    </div>
                    {splitType === "equal" && selectedCount > 0 && (
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">
                                Per person ({selectedCount} people)
                            </span>
                            <span className="text-sm font-medium">
                                {formatCurrency(equalShare)}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
