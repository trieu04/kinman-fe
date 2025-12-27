
interface SplitMethodSelectorProps {
    value: "equal" | "exact";
    onChange: (value: "equal" | "exact") => void;
}

export function SplitMethodSelector({ value, onChange }: SplitMethodSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Split Method</label>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => onChange("equal")}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer ${value === "equal"
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        }`}
                >
                    Equal Split
                </button>
                <button
                    type="button"
                    onClick={() => onChange("exact")}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer ${value === "exact"
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        }`}
                >
                    Exact Amount
                </button>
            </div>
        </div>
    );
}
